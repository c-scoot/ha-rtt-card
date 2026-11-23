import { LitElement, css, html, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { parseConfig } from './config';
import { discoverTracks, getTrack, resolveTrains } from './data';
import type { Hass, RttCardConfig, TrainConfig } from './types';

export class RttCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    config: { state: true },
    selectedEntity: { state: true },
  };

  declare hass?: Hass;
  private declare config?: RttCardConfig;
  private declare selectedEntity: string;

  constructor() {
    super();
    this.selectedEntity = '';
  }

  setConfig(config: unknown) {
    this.config = parseConfig(config);
  }

  protected render() {
    const { config } = this;
    if (!config) return nothing;

    return html`
      <label>
        Card title
        <input type="text" placeholder="Realtime Trains" .value=${config.title ?? ''} @change=${this.changeTitle}>
      </label>
      <label>
        Trains to show
        <select name="mode" .value=${config.mode ?? 'selected'} @change=${this.changeMode}>
          <option value="all">All monitored trains</option>
          <option value="selected">Selected trains</option>
        </select>
      </label>
      ${config.mode === 'all' ? html`<p>${this.allTrainsSummary(config)}</p>` : this.renderSelectedTrains(config)}
    `;
  }

  private allTrainsSummary(config: RttCardConfig) {
    const { hass } = this;
    if (!hass) return 'Waiting for Home Assistant…';
    if (!hass.entities) return 'Train discovery is unavailable. Choose Selected trains and enter status entity IDs in YAML.';
    const count = resolveTrains(hass, config).length;
    if (!count) return 'No monitored trains found. Add a tracked train in the Realtime Trains integration.';
    return `${count} monitored ${count === 1 ? 'train' : 'trains'}. Sorted by scheduled time. The card updates as you add or remove tracked trains.${config.trains.length ? ' Switch back to Selected trains to edit your saved list and names.' : ''}`;
  }

  private renderSelectedTrains(config: RttCardConfig) {
    const { hass } = this;
    const selected = new Set(config.trains.map((train) => train.entity));
    const options = hass
      ? discoverTracks(hass)
          .filter((train) => !selected.has(train.entity))
          .map((train) => ({ entity: train.entity, title: getTrack(hass, train).title }))
          .sort((first, second) => first.title.localeCompare(second.title) || first.entity.localeCompare(second.entity))
      : [];

    return html`
      <fieldset>
        <legend>Tracked trains</legend>
        ${config.trains.length ? html`
          <ol>
            ${repeat(config.trains, (train) => train.entity, (train, index) => this.renderTrain(train, index, config.trains.length))}
          </ol>
        ` : nothing}
        ${options.length ? html`
          <div class="add-train">
            <label>
              Train status sensor
              <select name="train" .value=${this.selectedEntity} @change=${this.selectEntity}>
                <option value="">Select a train</option>
                ${options.map(({ entity, title }) => html`<option value=${entity}>${title} (${entity})</option>`)}
              </select>
            </label>
            <button type="button" class="add-button" @click=${this.addTrain}
              ?disabled=${!options.some(({ entity }) => entity === this.selectedEntity)}>Add train</button>
          </div>
        ` : html`
          <p>${config.trains.length ? 'No other train status sensors found.' : 'No Realtime Trains status sensors found. Add a tracked train in the integration or enter its entity ID in YAML.'}</p>
        `}
      </fieldset>
    `;
  }

  private renderTrain(train: TrainConfig, index: number, count: number) {
    const title = this.hass ? getTrack(this.hass, train).title : train.name ?? train.entity;
    return html`
      <li>
        <div class="train-title">${title}</div>
        <div class="entity-id">${train.entity}</div>
        <label>
          Display name
          <input type="text" placeholder="Optional" .value=${train.name ?? ''}
            @change=${(event: Event) => this.changeName(train.entity, event)}>
        </label>
        <div class="actions">
          <button type="button" aria-label=${`Move ${title} up`} ?disabled=${index === 0}
            @click=${() => this.moveTrain(index, -1)}>Move up</button>
          <button type="button" aria-label=${`Move ${title} down`} ?disabled=${index === count - 1}
            @click=${() => this.moveTrain(index, 1)}>Move down</button>
          <button type="button" aria-label=${`Remove ${title}`}
            @click=${() => this.removeTrain(train.entity)}>Remove</button>
        </div>
      </li>
    `;
  }

  private changeTitle(event: Event) {
    if (!this.config) return;
    const title = (event.currentTarget as HTMLInputElement).value.trim();
    this.publish({ ...this.config, title: title || undefined });
  }

  private changeMode(event: Event) {
    if (!this.config) return;
    const mode = (event.currentTarget as HTMLSelectElement).value;
    if (mode !== 'all' && mode !== 'selected') return;
    this.selectedEntity = '';
    this.publish({ ...this.config, mode });
  }

  private changeName(entity: string, event: Event) {
    if (!this.config) return;
    const name = (event.currentTarget as HTMLInputElement).value.trim();
    const trains = this.config.trains.map((train) => (
      train.entity === entity ? { ...train, name: name || undefined } : train
    ));
    this.publish({ ...this.config, trains });
  }

  private selectEntity(event: Event) {
    this.selectedEntity = (event.currentTarget as HTMLSelectElement).value;
  }

  private addTrain() {
    if (!this.config || !this.selectedEntity || !this.hass) return;
    if (this.config.trains.some((train) => train.entity === this.selectedEntity)) return;
    const train = discoverTracks(this.hass).find(({ entity }) => entity === this.selectedEntity);
    if (!train) return;
    this.selectedEntity = '';
    this.publish({ ...this.config, trains: [...this.config.trains, train] });
  }

  private moveTrain(index: number, offset: number) {
    if (!this.config) return;
    const trains = [...this.config.trains];
    const target = index + offset;
    if (target < 0 || target >= trains.length) return;
    const [train] = trains.splice(index, 1);
    if (!train) return;
    trains.splice(target, 0, train);
    this.publish({ ...this.config, trains });
  }

  private removeTrain(entity: string) {
    if (!this.config) return;
    this.publish({ ...this.config, trains: this.config.trains.filter((train) => train.entity !== entity) });
  }

  private publish(config: RttCardConfig) {
    this.config = parseConfig(config);
    this.dispatchEvent(new CustomEvent('config-changed', {
      bubbles: true,
      composed: true,
      detail: { config: this.config },
    }));
  }

  static styles = css`
    :host {
      display: grid;
      gap: 16px;
      min-width: 0;
      color: var(--primary-text-color, inherit);
    }

    label {
      display: grid;
      gap: 5px;
      min-width: 0;
    }

    fieldset {
      display: grid;
      min-width: 0;
      margin: 0;
      padding: 10px;
      border: 1px solid var(--divider-color, #dadce0);
      border-radius: 8px;
    }

    legend {
      padding-inline: 5px;
      font-weight: 600;
    }

    ol {
      display: grid;
      gap: 10px;
      margin: 0 0 10px;
      padding: 0 0 0 22px;
    }

    li {
      min-width: 0;
      padding: 10px;
      border: 1px solid var(--divider-color, #dadce0);
      border-radius: 6px;
    }

    .train-title {
      font-weight: 600;
      overflow-wrap: anywhere;
    }

    .entity-id {
      margin: 2px 0 8px;
      color: var(--secondary-text-color, inherit);
      font-size: 0.875rem;
      overflow-wrap: anywhere;
    }

    .actions,
    .add-train {
      display: flex;
      flex-wrap: wrap;
      align-items: end;
      gap: 6px;
    }

    .actions {
      margin-block-start: 7px;
    }

    .add-train label {
      flex: 1 1 220px;
    }

    input,
    select,
    button {
      box-sizing: border-box;
      min-height: 36px;
      padding: 5px 8px;
      border: 1px solid var(--divider-color, #dadce0);
      border-radius: 5px;
      background: var(--secondary-background-color, Canvas);
      color: var(--primary-text-color, CanvasText);
      font: inherit;
    }

    input,
    select {
      width: 100%;
    }

    button:not(:disabled) {
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.5;
    }

    .add-button {
      border-color: var(--primary-color, #006a9b);
      background: var(--primary-color, #006a9b);
      color: var(--text-primary-color, white);
    }

    :focus-visible {
      outline: 2px solid var(--primary-color, #0084bc);
      outline-offset: 1px;
    }

    p {
      margin: 4px 0;
      color: var(--secondary-text-color, inherit);
    }
  `;
}

if (!customElements.get('rtt-card-editor')) {
  customElements.define('rtt-card-editor', RttCardEditor);
}
