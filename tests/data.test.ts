import { describe, expect, it } from 'vitest';
import { discoverTracks, formatDate, formatTime, getTrack } from '../src/data';
import type { Hass, RegistryEntity } from '../src/types';

const arrival = { entity: 'sensor.inbound_status' };
const departure = { entity: 'sensor.outbound_status' };
const authority = 'realtime_trains';
const serviceIdentity = '2026-11-20:A12345';

function state(entity_id: string, value: string, attributes: Record<string, unknown> = {}) {
  return { entity_id, state: value, attributes };
}

function homeAssistant(...entities: ReturnType<typeof state>[]): Hass {
  return {
    states: Object.fromEntries(entities.map((entity) => [entity.entity_id, entity])),
    locale: { language: 'en-GB', time_format: '24' },
    config: { time_zone: 'Europe/London' },
  };
}

function registryEntity(
  entity_id: string,
  device_id: string,
  identifiers: Pick<RegistryEntity, 'translation_key' | 'unique_id'>,
): RegistryEntity {
  return { entity_id, platform: authority, device_id, ...identifiers };
}

const callRegistry = [
  registryEntity(arrival.entity, 'arrival', { translation_key: 'status', unique_id: 'entry_track_status' }),
  registryEntity('sensor.custom_inbound_platform', 'arrival', { translation_key: 'platform' }),
  registryEntity('sensor.custom_inbound_schedule', 'arrival', { unique_id: 'entry_track_scheduled' }),
  registryEntity('sensor.custom_inbound_expected', 'arrival', { translation_key: 'expected' }),
  registryEntity('sensor.custom_inbound_actual', 'arrival', { translation_key: 'actual' }),
  registryEntity(departure.entity, 'departure', { unique_id: 'entry_othertrack_status' }),
  registryEntity('sensor.custom_outbound_platform', 'departure', { translation_key: 'platform' }),
];

describe('entity relationships', () => {
  it('pairs renamed siblings by registry identity and keeps two calls for the same train distinct', () => {
    const hass = homeAssistant(
      state(arrival.entity, 'arrived', { station: 'Waterloo', direction: 'arrival', service_identity: serviceIdentity, terminal: true }),
      state(departure.entity, 'scheduled', { station: 'Waterloo', direction: 'departure', service_identity: serviceIdentity, terminal: false }),
      state('sensor.custom_inbound_platform', '5', { platform_source: 'actual' }),
      state('sensor.custom_inbound_schedule', '2026-11-20T23:59:00+00:00'),
      state('sensor.custom_outbound_platform', '7', { platform_source: 'planned' }),
      state('sensor.lookalike_platform', '99', { platform_source: 'actual' }),
      state('sensor.other_status', 'on_time'),
    );
    hass.entities = Object.fromEntries([
      registryEntity(arrival.entity, 'arrival', { translation_key: 'status' }),
      registryEntity('sensor.custom_inbound_platform', 'arrival', { translation_key: 'platform' }),
      registryEntity('sensor.custom_inbound_schedule', 'arrival', { translation_key: 'scheduled' }),
      registryEntity(departure.entity, 'departure', { translation_key: 'status' }),
      registryEntity('sensor.custom_outbound_platform', 'departure', { translation_key: 'platform' }),
      { entity_id: 'sensor.lookalike_platform', device_id: 'arrival', platform: 'template', translation_key: 'platform' },
      { entity_id: 'sensor.other_status', device_id: 'other', platform: 'template', translation_key: 'status' },
    ].map((entry) => [entry.entity_id, entry]));
    hass.devices = { arrival: { id: 'arrival', name: 'Integration name', name_by_user: 'Evening arrival' } };

    expect(discoverTracks(hass)).toHaveLength(2);
    expect(discoverTracks(hass).map(({ entity }) => entity)).toEqual(expect.arrayContaining([arrival.entity, departure.entity]));
    expect(getTrack(hass, arrival)).toMatchObject({
      title: 'Evening arrival', status: 'arrived', terminal: true, platform: '5', platformSource: 'actual',
      scheduled: '2026-11-20T23:59:00+00:00', station: 'Waterloo', direction: 'arrival',
    });
    expect(getTrack(hass, departure)).toMatchObject({
      status: 'scheduled', terminal: false, platform: '7', platformSource: 'planned', direction: 'departure',
    });
  });

  it('gives configured overrides precedence and still resolves the other fields from the registry', () => {
    const hass = homeAssistant(
      state(arrival.entity, 'on_time'),
      state('sensor.custom_inbound_platform', '5', { platform_source: 'actual' }),
      state('sensor.handpicked_platform', '8', { platform_source: 'planned' }),
      state('sensor.custom_inbound_schedule', '2026-11-20T23:59:00+00:00'),
    );

    expect(getTrack(hass, {
      ...arrival, name: 'User label', sensors: { platform: 'sensor.handpicked_platform' },
    }, callRegistry)).toMatchObject({
      title: 'User label', platform: '8', platformSource: 'planned', scheduled: '2026-11-20T23:59:00+00:00',
    });
  });

  it('uses an explicitly configured sibling without registry access', () => {
    const hass = homeAssistant(
      state(arrival.entity, 'on_time', { platform_source: 'planned' }),
      state('sensor.handpicked_platform', 'P2'),
    );

    expect(getTrack(hass, { ...arrival, sensors: { platform: 'sensor.handpicked_platform' } })).toMatchObject({
      platform: 'P2', platformSource: 'planned',
    });
  });

  it('leaves an ambiguous registry role unresolved', () => {
    const duplicatePlatform = registryEntity('sensor.other_inbound_platform', 'arrival', { translation_key: 'platform' });
    const hass = homeAssistant(
      state(arrival.entity, 'on_time'),
      state('sensor.custom_inbound_platform', '5', { platform_source: 'actual' }),
      state(duplicatePlatform.entity_id, '9', { platform_source: 'actual' }),
    );

    expect(getTrack(hass, arrival, [...callRegistry, duplicatePlatform])).toMatchObject({ platform: null, platformSource: null });
  });
});

describe('running status and data quality', () => {
  it.each([
    ['scheduled', false], ['on_time', false], ['early', false], ['delayed', false],
    ['arrived', true], ['departed', true], ['cancelled', true], ['diverted', true],
    ['no_report', false], ['unconfirmed', true], ['future_status', false],
  ])('retains the authoritative %s state even with a past schedule', (status, terminal) => {
    const expected = '2000-12-31T23:58:00+00:00';
    const scheduled = '2000-12-31T23:59:00+00:00';
    const actual = status === 'arrived' || status === 'departed' ? '2001-01-01T00:01:00+00:00' : null;
    const hass = homeAssistant(
      state(arrival.entity, status, { terminal }),
      state('sensor.custom_inbound_schedule', scheduled),
      state('sensor.custom_inbound_expected', expected),
      state('sensor.custom_inbound_actual', actual ?? 'unknown'),
    );

    expect(getTrack(hass, arrival, callRegistry)).toMatchObject({
      status, terminal, availability: 'available', expected, scheduled, actual,
    });
  });

  it('keeps a reported result visible while surfacing a subsequent poll failure', () => {
    const actual = '2026-11-21T00:01:00+00:00';
    const hass = homeAssistant(
      state(arrival.entity, 'arrived', { terminal: true, stale: true, last_error: 'Request timed out', next_poll: null }),
      state('sensor.custom_inbound_actual', actual),
    );

    expect(getTrack(hass, arrival, callRegistry)).toMatchObject({
      status: 'arrived', terminal: true, stale: true, actual, lastError: 'Request timed out', nextPoll: null,
    });
  });

  it('exposes the integration poll time for an active call without suggesting a report arrived', () => {
    const nextPoll = '2026-11-21T00:05:00+00:00';
    const hass = homeAssistant(state(arrival.entity, 'no_report', { terminal: false, stale: true, next_poll: nextPoll }));

    expect(getTrack(hass, arrival, callRegistry)).toMatchObject({
      status: 'no_report', terminal: false, stale: true, actual: null, nextPoll,
    });
  });

  it.each(['unavailable', 'unknown'] as const)('does not present %s as a service status', (availability) => {
    const hass = homeAssistant(state(arrival.entity, availability));

    expect(getTrack(hass, arrival, callRegistry)).toMatchObject({ status: null, availability });
  });

  it('keeps a missing anchor distinct from an unavailable one', () => {
    expect(getTrack(homeAssistant(), arrival, callRegistry)).toMatchObject({ status: null, availability: 'missing' });
  });

  it('changes platform provenance on confirmation even if the value is unchanged', () => {
    const hass = homeAssistant(
      state(arrival.entity, 'on_time', { platform_source: 'planned' }),
      state('sensor.custom_inbound_platform', '4', { platform_source: 'planned' }),
    );
    const updated = homeAssistant(
      state(arrival.entity, 'on_time', { platform_source: 'planned' }),
      state('sensor.custom_inbound_platform', '4', { platform_source: 'actual' }),
    );

    expect(getTrack(hass, arrival, callRegistry)).toMatchObject({ platform: '4', platformSource: 'planned' });
    expect(getTrack(updated, arrival, callRegistry)).toMatchObject({ platform: '4', platformSource: 'actual' });
  });

  it('reads the current platform and its certainty from a current integration snapshot', () => {
    const hass = homeAssistant(
      state(arrival.entity, 'on_time', { platform_status: 'planned', platform_source: 'planned', planned_platform: '3' }),
      state('sensor.custom_inbound_platform', '4', {
        platform_status: 'confirmed', platform_source: 'actual', planned_platform: '3', confirmed_platform: '4',
      }),
    );

    expect(getTrack(hass, arrival, callRegistry)).toMatchObject({ platform: '4', platformSource: 'actual' });
  });

  it.each([
    ['confirmed', '4', '4', 'actual'],
    ['planned', '4', '4', 'planned'],
    ['unconfirmed', '4', '4', null],
    ['not_available', 'unknown', null, null],
  ])('reads %s as platform certainty without a legacy source', (platformStatus, value, platform, platformSource) => {
    const hass = homeAssistant(
      state(arrival.entity, 'on_time', { platform_status: platformStatus }),
      state('sensor.custom_inbound_platform', value),
    );

    expect(getTrack(hass, arrival, callRegistry)).toMatchObject({ platform, platformSource });
  });

  it('lets an explicitly unconfirmed platform suppress a conflicting confirmed source', () => {
    const hass = homeAssistant(
      state(arrival.entity, 'on_time', { platform_status: 'confirmed', platform_source: 'actual' }),
      state('sensor.custom_inbound_platform', '4', {
        platform_status: 'unconfirmed', platform_source: 'actual', planned_platform: '4', confirmed_platform: '4',
      }),
    );

    expect(getTrack(hass, arrival, callRegistry)).toMatchObject({ platform: '4', platformSource: null });
  });

  it('does not attach confirmation to an unavailable platform', () => {
    const hass = homeAssistant(
      state(arrival.entity, 'on_time', { platform_source: 'actual' }),
      state('sensor.custom_inbound_platform', 'unavailable'),
    );

    expect(getTrack(hass, arrival, callRegistry)).toMatchObject({ platform: null, platformSource: null });
  });
});

describe('service timestamps', () => {
  it('formats the time and date on the Home Assistant side of midnight', () => {
    const hass = homeAssistant();
    const beforeMidnight = '2026-07-20T22:59:00Z';
    const afterMidnight = '2026-07-20T23:01:00Z';

    expect(formatTime(beforeMidnight, hass)).toBe('23:59');
    expect(formatTime(afterMidnight, hass)).toBe('00:01');
    expect(formatDate(beforeMidnight, hass)).toMatch(/\b20\b/);
    expect(formatDate(afterMidnight, hass)).toMatch(/\b21\b/);
  });

  it('uses the timezone transition to skip the missing spring hour', () => {
    const hass = homeAssistant();

    expect(formatTime('2026-03-29T00:59:00Z', hass)).toBe('00:59');
    expect(formatTime('2026-03-29T01:01:00Z', hass)).toBe('02:01');
  });

  it('keeps both offset-aware timestamps during the repeated autumn hour', () => {
    const scheduled = '2026-10-25T01:30:00+01:00';
    const actual = '2026-10-25T01:30:00+00:00';
    const hass = homeAssistant(
      state(arrival.entity, 'arrived'),
      state('sensor.custom_inbound_schedule', scheduled),
      state('sensor.custom_inbound_actual', actual),
    );

    expect(getTrack(hass, arrival, callRegistry)).toMatchObject({ scheduled, actual });
    expect(Date.parse(actual) - Date.parse(scheduled)).toBe(3_600_000);
    expect(formatTime(scheduled, hass)).toBe('01:30');
    expect(formatTime(actual, hass)).toBe('01:30');
  });
});
