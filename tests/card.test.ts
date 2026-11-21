// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RttCardEditor } from '../src/editor';
import { RttCard } from '../src/rtt-card';
import type { Hass, RttCardConfig } from '../src/types';

const entity = 'sensor.inbound_status';
const platform = 'sensor.custom_inbound_platform';

function snapshot(status: string, source: 'actual' | 'planned'): Hass {
  return {
    states: {
      [entity]: { entity_id: entity, state: status, attributes: { direction: 'arrival' } },
      [platform]: { entity_id: platform, state: '2', attributes: { platform_source: source } },
    },
    entities: {
      [entity]: { entity_id: entity, platform: 'realtime_trains', device_id: 'train', translation_key: 'status' },
      [platform]: { entity_id: platform, platform: 'realtime_trains', device_id: 'train', translation_key: 'platform' },
    },
  };
}

function createCard(name = 'Evening train'): RttCard {
  const card = new RttCard();
  card.setConfig({ type: 'custom:rtt-card', trains: [{ entity, name }] });
  document.body.append(card);
  return card;
}

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('Realtime Trains card', () => {
  it('updates a train status and confirms the same platform from an HA state update', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch');
    const card = createCard();
    card.hass = snapshot('scheduled', 'planned');
    await card.updateComplete;

    expect(card.shadowRoot?.textContent).toMatch(/Scheduled/);
    expect(card.shadowRoot?.textContent).toMatch(/Platform 2\s*[·\-]?\s*Planned/i);

    card.hass = snapshot('arrived', 'actual');
    await card.updateComplete;

    expect(card.shadowRoot?.textContent).toMatch(/Arrived/);
    expect(card.shadowRoot?.textContent).toMatch(/Platform 2\s*[·\-]?\s*Confirmed/i);
    expect(card.shadowRoot?.textContent).not.toMatch(/Platform 2\s*[·\-]?\s*Planned/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('displays a configured name as text and opens the configured HA entity from the row', async () => {
    const name = '<em>Evening train</em>';
    const card = createCard(name);
    card.hass = snapshot('on_time', 'planned');
    await card.updateComplete;

    expect(card.shadowRoot?.textContent).toContain(name);
    expect(card.shadowRoot?.querySelector('em')).toBeNull();

    const open = vi.fn();
    card.addEventListener('hass-more-info', open);
    const button = card.shadowRoot?.querySelector('button');
    expect(button).toBeInstanceOf(HTMLButtonElement);
    button?.click();

    expect(open).toHaveBeenCalledOnce();
    expect(open.mock.calls[0][0].detail).toEqual({ entityId: entity });
  });
});

describe('Realtime Trains card editor', () => {
  it('adds, reorders, and removes trains while retaining the existing YAML settings', async () => {
    const outbound = 'sensor.outbound_status';
    const editor = RttCard.getConfigElement() as RttCardEditor;
    const originalTrain = { entity, sensors: { platform } };
    const gridOptions = { columns: 6 };
    editor.setConfig({ type: 'custom:rtt-card', trains: [originalTrain], grid_options: gridOptions });
    const hass = snapshot('scheduled', 'planned');
    editor.hass = {
      ...hass,
      states: {
        ...hass.states,
        [outbound]: { entity_id: outbound, state: 'scheduled', attributes: { direction: 'departure' } },
      },
      entities: {
        ...hass.entities,
        [outbound]: { entity_id: outbound, device_id: 'outbound', platform: 'realtime_trains', translation_key: 'status' },
      },
    };
    document.body.append(editor);
    const configs: RttCardConfig[] = [];
    editor.addEventListener('config-changed', (event) => {
      configs.push((event as CustomEvent<{ config: RttCardConfig }>).detail.config);
    });
    await editor.updateComplete;

    const select = editor.shadowRoot?.querySelector('select');
    if (!select) throw new Error('The editor did not offer a train selector.');
    select.value = outbound;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await editor.updateComplete;

    async function clickButton(label: string, index = 0) {
      const buttons = Array.from(editor.shadowRoot?.querySelectorAll('button') ?? []);
      const button = buttons.filter((element) => element.textContent?.trim() === label)[index];
      expect(button?.disabled).toBe(false);
      button?.click();
      await editor.updateComplete;
    }

    await clickButton('Add train');
    expect(configs.at(-1)?.trains).toEqual([originalTrain, { entity: outbound }]);

    await clickButton('Move up', 1);
    expect(configs.at(-1)?.trains).toEqual([{ entity: outbound }, originalTrain]);

    await clickButton('Remove');
    expect(configs.at(-1)).toMatchObject({ trains: [originalTrain], grid_options: gridOptions });
  });
});
