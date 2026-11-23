// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RttCardEditor } from '../src/editor';
import { RttCard } from '../src/rtt-card';
import type { Hass, RttCardConfig } from '../src/types';

const entity = 'sensor.inbound_status';
const platform = 'sensor.custom_inbound_platform';
const outbound = 'sensor.outbound_status';

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

function withOutbound(hass: Hass): Hass {
  return {
    ...hass,
    states: {
      ...hass.states,
      [outbound]: { entity_id: outbound, state: 'scheduled', attributes: { direction: 'departure', station: 'Waterloo' } },
    },
    entities: {
      ...hass.entities,
      [outbound]: { entity_id: outbound, device_id: 'outbound', platform: 'realtime_trains', translation_key: 'status' },
    },
  };
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

  it('discovers newly monitored trains and removes deleted ones on live state updates', async () => {
    const card = new RttCard();
    card.setConfig({ type: 'custom:rtt-card', mode: 'all' });
    card.hass = snapshot('on_time', 'planned');
    document.body.append(card);
    await card.updateComplete;
    expect(card.shadowRoot?.querySelectorAll('li')).toHaveLength(1);

    const both = withOutbound(snapshot('on_time', 'planned'));
    card.hass = both;
    await card.updateComplete;
    expect(card.shadowRoot?.querySelectorAll('li')).toHaveLength(2);
    expect(card.shadowRoot?.textContent).toContain('Waterloo');

    // State can be removed before the corresponding registry update arrives.
    card.hass = { ...both, states: { [outbound]: both.states[outbound] } };
    await card.updateComplete;
    expect(card.shadowRoot?.querySelectorAll('li')).toHaveLength(1);
    expect(card.shadowRoot?.textContent).toContain('Waterloo');
    expect(card.shadowRoot?.textContent).not.toContain('On time');
  });

  it('starts new cards in automatic mode and explains a loaded empty registry', async () => {
    const hass: Hass = { states: {}, entities: {} };
    const stub = RttCard.getStubConfig();
    expect(stub).toMatchObject({ mode: 'all', trains: [] });

    const card = new RttCard();
    card.setConfig({ type: 'custom:rtt-card', ...stub });
    card.hass = hass;
    document.body.append(card);
    await card.updateComplete;

    expect(card.shadowRoot?.querySelectorAll('li')).toHaveLength(0);
    expect(card.shadowRoot?.textContent).toContain('No monitored trains found');
  });

  it('keeps a weekly tracker in the same row when its dated service rolls over', async () => {
    const completed = '2026-11-20T18:00:00Z';
    const upcoming = '2026-11-27T18:00:00Z';
    const scheduled = 'sensor.weekly_train_schedule';
    const card = new RttCard();
    card.setConfig({ type: 'custom:rtt-card', mode: 'all' });
    const hass = snapshot('arrived', 'actual');
    const status = hass.states[entity];
    const registry = {
      ...hass.entities,
      [scheduled]: { entity_id: scheduled, device_id: 'train', platform: 'realtime_trains', translation_key: 'scheduled' },
    };
    card.hass = {
      ...hass,
      entities: registry,
      states: {
        ...hass.states,
        [entity]: { ...status, attributes: {
          ...status.attributes, terminal: true, repeat_weekly: true, weekly_state: 'waiting',
          weekly_next_scheduled: upcoming, service_identity: '2026-11-20:A12345',
        } },
        [scheduled]: { entity_id: scheduled, state: completed, attributes: {} },
      },
    };
    document.body.append(card);
    await card.updateComplete;
    const row = card.shadowRoot?.querySelector('li');
    expect(row?.textContent).toContain('Arrived');
    expect(row?.textContent).toContain('Next weekly target');
    expect(Array.from(row?.querySelectorAll('time') ?? [], (time) => time.dateTime)).toEqual([completed, upcoming]);

    card.hass = {
      ...hass,
      entities: registry,
      states: {
        ...snapshot('scheduled', 'planned').states,
        [entity]: { ...status, state: 'scheduled', attributes: {
          ...status.attributes, terminal: false, repeat_weekly: true, weekly_state: 'tracking',
          service_identity: '2026-11-27:A41234',
        } },
        [scheduled]: { entity_id: scheduled, state: upcoming, attributes: {} },
      },
    };
    await card.updateComplete;

    expect(card.shadowRoot?.querySelectorAll('li')).toHaveLength(1);
    expect(card.shadowRoot?.querySelector('li')).toBe(row);
    expect(row?.textContent).toContain('Scheduled');
    expect(row?.textContent).not.toContain('Next weekly target');
    expect(Array.from(row?.querySelectorAll('time') ?? [], (time) => time.dateTime)).toEqual([upcoming]);
  });
});

describe('Realtime Trains card editor', () => {
  it('adds, reorders, and removes trains while retaining the existing YAML settings', async () => {
    const editor = RttCard.getConfigElement() as RttCardEditor;
    const originalTrain = { entity, sensors: { platform } };
    const gridOptions = { columns: 6 };
    editor.setConfig({ type: 'custom:rtt-card', trains: [originalTrain], grid_options: gridOptions });
    editor.hass = withOutbound(snapshot('scheduled', 'planned'));
    document.body.append(editor);
    const configs: RttCardConfig[] = [];
    editor.addEventListener('config-changed', (event) => {
      configs.push((event as CustomEvent<{ config: RttCardConfig }>).detail.config);
    });
    await editor.updateComplete;

    const select = editor.shadowRoot?.querySelector<HTMLSelectElement>('select[name="train"]');
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

  it('restores the previous selection after toggling automatic mode', async () => {
    const editor = RttCard.getConfigElement() as RttCardEditor;
    const trains = [{ entity, name: 'Saved label', sensors: { platform } }];
    editor.setConfig({ type: 'custom:rtt-card', trains });
    editor.hass = withOutbound(snapshot('scheduled', 'planned'));
    document.body.append(editor);
    const configs: RttCardConfig[] = [];
    editor.addEventListener('config-changed', (event) => {
      configs.push((event as CustomEvent<{ config: RttCardConfig }>).detail.config);
    });
    await editor.updateComplete;

    const select = editor.shadowRoot?.querySelector<HTMLSelectElement>('select[name="mode"]');
    if (!select) throw new Error('The editor did not offer a mode selector.');
    expect(select.value).toBe('selected');

    select.value = 'all';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await editor.updateComplete;
    expect(configs.at(-1)).toMatchObject({ mode: 'all', trains });

    select.value = 'selected';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await editor.updateComplete;
    expect(configs.at(-1)).toMatchObject({ mode: 'selected', trains });
    expect(editor.shadowRoot?.textContent).toContain('Saved label');
  });
});
