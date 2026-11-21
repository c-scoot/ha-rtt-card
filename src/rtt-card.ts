import { LitElement, css, html, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { parseConfig } from './config';
import { discoverTracks, formatDate, formatTime, getTrack } from './data';
import './editor';
import type { Hass, RttCardConfig, TrackView } from './types';

const CARD_NAME = 'Realtime Trains';
const STATUS_TONES = new Map([
  ['on_time', 'success'], ['early', 'success'],
  ['arrived', 'success'], ['departed', 'success'],
  ['scheduled', 'info'],
  ['delayed', 'warning'], ['unconfirmed', 'warning'], ['diverted', 'warning'], ['no_report', 'warning'],
  ['cancelled', 'error'],
]);

function timeDetail(label: string, iso: string | null, hass: Hass, referenceDate: string) {
  const time = formatTime(iso, hass);
  if (!iso || !time) return nothing;
  const date = formatDate(iso, hass);
  return html`<span>${label} <time datetime=${iso}>${date !== referenceDate ? `${date} ` : ''}${time}</time></span>`;
}

export class RttCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    config: { state: true },
  };

  declare hass?: Hass;
  private declare config?: RttCardConfig;

  static getConfigElement() {
    return document.createElement('rtt-card-editor');
  }

  static getStubConfig(hass?: Hass, entities: string[] = [], entitiesFallback: string[] = []) {
    const tracks = hass ? discoverTracks(hass) : [];
    const preferred = [...entities, ...entitiesFallback]
      .map((entity) => tracks.find((train) => train.entity === entity))
      .find((train) => train !== undefined);
    return { trains: preferred ? [preferred] : tracks.slice(0, 1) };
  }

  setConfig(config: unknown) {
    this.config = parseConfig(config);
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: 'auto' } as const;
  }

  getCardSize() {
    const rowCount = Math.max(this.config?.trains.length ?? 0, 1);
    return Math.ceil((56 + rowCount * 72) / 50);
  }

  protected render() {
    const { config, hass } = this;
    if (!config) return nothing;

    return html`
      <ha-card>
        <h2>${config.title ?? CARD_NAME}</h2>
        ${config.trains.length && hass
          ? html`<ul role="list">
              ${repeat(config.trains, (train) => train.entity, (train) => this.renderTrack(getTrack(hass, train), hass))}
            </ul>`
          : html`<p class="empty">${config.trains.length
              ? 'Waiting for Home Assistant…'
              : 'Add a train status sensor in the card editor.'}</p>`}
      </ha-card>
    `;
  }

  private renderTrack(track: TrackView, hass: Hass) {
    const date = formatDate(track.scheduled ?? track.actual ?? track.expected, hass);
    const lastUpdated = track.stale && track.lastSuccess
      ? [formatDate(track.lastSuccess, hass), formatTime(track.lastSuccess, hass)].filter(Boolean).join(' ')
      : '';
    const statusKey = track.status?.toLowerCase().replaceAll(' ', '_');
    const status = track.status
      ? track.status.replaceAll('_', ' ').replace(/^\p{Ll}/u, (letter) => letter.toUpperCase())
      : {
          missing: 'Status sensor missing',
          unavailable: 'Status unavailable',
          unknown: 'Status unknown',
          available: 'Status unknown',
        }[track.availability];
    const tone = statusKey ? STATUS_TONES.get(statusKey) ?? 'neutral' : 'neutral';
    const certainty = track.platformSource === 'actual'
      ? 'Confirmed'
      : track.platformSource === 'planned' ? 'Planned' : 'Unverified';
    const platform = track.platform ? `Platform ${track.platform} · ${certainty}` : 'Platform unavailable';
    const stationCode = track.station?.replace(/^GB-NR:(?=[A-Z0-9]+$)/i, '');
    const station = stationCode && !track.title.toLowerCase().includes(stationCode.toLowerCase())
      ? stationCode : null;
    const delay = !statusKey || statusKey === 'no_report' || statusKey === 'cancelled' ? null : track.delayMinutes;

    return html`
      <li>
        <button type="button" class="journey" @click=${() => this.openMoreInfo(track.entity)}
          ?disabled=${track.availability === 'missing'}>
          <span class="summary">
            <span class="name">${track.title}</span>
            <span class="status-group">
              <span class="status" data-tone=${tone}>${status}</span>
              ${track.stale ? html`<span class="stale">Update stale</span>` : nothing}
            </span>
          </span>
          <span class="details">
            ${track.direction ? html`<span>${track.direction === 'arrival' ? 'Arrival' : 'Departure'}</span>` : nothing}
            ${station ? html`<span>${station}</span>` : nothing}
            ${timeDetail('Scheduled', track.scheduled, hass, date)}
            ${track.expected !== track.scheduled ? timeDetail('Expected', track.expected, hass, date) : nothing}
            ${timeDetail('Actual', track.actual, hass, date)}
            ${delay ? html`<span>${Math.abs(delay)} min ${delay > 0 ? 'late' : 'early'}</span>` : nothing}
            <span>${platform}</span>
            ${date ? html`<span>${date}</span>` : nothing}
            ${lastUpdated ? html`<span>Last updated <time datetime=${track.lastSuccess!}>${lastUpdated}</time></span>` : nothing}
          </span>
        </button>
      </li>
    `;
  }

  private openMoreInfo(entityId: string) {
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      bubbles: true,
      composed: true,
      detail: { entityId },
    }));
  }

  static styles = css`
    :host {
      display: block;
      min-width: 0;
    }

    h2 {
      margin: 0;
      padding: 16px 16px 12px;
      font-size: var(--ha-font-size-l, 18px);
      font-weight: var(--ha-font-weight-semibold, 600);
      line-height: 1.35;
      overflow-wrap: anywhere;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    li {
      border-block-start: 1px solid var(--divider-color, #dadce0);
    }

    .journey {
      display: grid;
      gap: 5px;
      box-sizing: border-box;
      width: 100%;
      min-width: 0;
      min-height: 48px;
      padding: 11px 16px;
      border: 0;
      background: transparent;
      color: var(--primary-text-color, inherit);
      text-align: start;
      font: inherit;
      cursor: pointer;
    }

    li:last-child .journey {
      border-end-start-radius: var(--ha-card-border-radius, 12px);
      border-end-end-radius: var(--ha-card-border-radius, 12px);
    }

    @media (hover: hover) {
      .journey:not(:disabled):hover {
        background: var(--secondary-background-color, #8881);
      }
    }

    .journey:focus-visible {
      outline: 2px solid var(--primary-color, #0084bc);
      outline-offset: -2px;
    }

    .journey:disabled {
      cursor: default;
      opacity: 1;
    }

    .summary,
    .status-group,
    .details {
      display: flex;
      flex-wrap: wrap;
      min-width: 0;
      overflow-wrap: anywhere;
      align-items: baseline;
      line-height: 1.4;
    }

    .summary {
      justify-content: space-between;
      gap: 3px 12px;
      font-size: var(--ha-font-size-m, 14px);
      font-weight: var(--ha-font-weight-semibold, 600);
    }

    .status {
      --status-accent: var(--divider-color, #dadce0);
      padding: 1px 7px;
      border-inline-start: 3px solid var(--status-accent);
      border-radius: 5px;
      background: var(--secondary-background-color, #8881);
      background: color-mix(in srgb, var(--status-accent) 14%, transparent);
    }

    .status[data-tone='success'] { --status-accent: var(--success-color, #288651); }
    .status[data-tone='info'] { --status-accent: var(--info-color, #287aa6); }
    .status[data-tone='warning'] { --status-accent: var(--warning-color, #d88c17); }
    .status[data-tone='error'] { --status-accent: var(--error-color, #c94440); }

    .status-group {
      gap: 3px 7px;
    }

    .details {
      gap: 3px 12px;
      color: var(--secondary-text-color, inherit);
      font-size: var(--ha-font-size-s, 12px);
    }

    time {
      color: var(--primary-text-color, inherit);
      font-variant-numeric: tabular-nums;
    }

    .stale {
      color: var(--secondary-text-color, inherit);
      font-size: var(--ha-font-size-s, 12px);
    }

    .empty {
      margin: 0;
      padding: 0 16px 16px;
      color: var(--secondary-text-color, inherit);
    }
  `;
}

if (!customElements.get('rtt-card')) customElements.define('rtt-card', RttCard);

type CardPickerWindow = Window & {
  customCards?: Array<{ type: string; name: string; description: string; preview: boolean }>;
};
const cards = ((window as CardPickerWindow).customCards ??= []);
if (!cards.some(({ type }) => type === 'rtt-card')) {
  cards.push({
    type: 'rtt-card',
    name: CARD_NAME,
    description: 'Show the status, times, and platforms of tracked train journeys.',
    preview: true,
  });
}
