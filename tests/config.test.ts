import { describe, expect, it } from 'vitest';
import { parseConfig } from '../src/config';

const type = 'custom:rtt-card';

describe('card configuration', () => {
  it('keeps the configured order and accepts an explicit role override', () => {
    const config = {
      type,
      title: 'Morning trains',
      trains: [
        { entity: 'sensor.inbound_status', name: 'London arrival', sensors: { platform: 'sensor.arrivals_platform' } },
        { entity: 'sensor.outbound_status', name: 'London departure' },
      ],
    };

    expect(parseConfig(config)).toEqual(config);
  });

  it('accepts an empty train list for an unconfigured card', () => {
    expect(parseConfig({ type, trains: [] }).trains).toEqual([]);
  });

  it.each([
    ['a missing config', undefined],
    ['a train mapping in place of a list', { type, trains: { entity: 'sensor.inbound_status' } }],
    ['a non-mapping train', { type, trains: ['sensor.inbound_status'] }],
    ['a missing anchor', { type, trains: [{ name: 'Inbound' }] }],
    ['an anchor outside the sensor domain', { type, trains: [{ entity: 'binary_sensor.inbound' }] }],
    ['an invalid title', { type, title: 7, trains: [] }],
    ['an invalid train name', { type, trains: [{ entity: 'sensor.inbound_status', name: 7 }] }],
    ['an invalid sensor mapping', { type, trains: [{ entity: 'sensor.inbound_status', sensors: ['sensor.platform'] }] }],
    ['an invalid role override', { type, trains: [{ entity: 'sensor.inbound_status', sensors: { platform: 'input_text.platform' } }] }],
    ['an unknown role', { type, trains: [{ entity: 'sensor.inbound_status', sensors: { platfrom: 'sensor.platform' } }] }],
    ['a role pointing to the status anchor', { type, trains: [{ entity: 'sensor.inbound_status', sensors: { platform: 'sensor.inbound_status' } }] }],
    ['duplicate anchors', { type, trains: [{ entity: 'sensor.inbound_status' }, { entity: 'sensor.inbound_status' }] }],
  ])('rejects %s', (_description, input) => {
    expect(() => parseConfig(input)).toThrow();
  });
});
