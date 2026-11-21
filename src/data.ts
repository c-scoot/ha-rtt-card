import {
  sensorRoles,
  type Hass,
  type RegistryEntity,
  type SensorRole,
  type TrackView,
  type TrainConfig,
} from "./types";

const integration = "realtime_trains";
type RegistryIndex = {
  byId: Map<string, RegistryEntity>;
  byDevice: Map<string, RegistryEntity[]>;
};

// HA replaces its registry object on updates. Reuse the index across rows
// and unrelated state changes, including dashboards with many entities.
let cachedIndex: {
  display: Hass["entities"];
  full: readonly RegistryEntity[] | undefined;
  index: RegistryIndex;
} | undefined;

function registryIndex(hass: Hass, full?: readonly RegistryEntity[]): RegistryIndex {
  if (cachedIndex && cachedIndex.display === hass.entities && cachedIndex.full === full) {
    return cachedIndex.index;
  }
  const byId = new Map<string, RegistryEntity>();
  for (const entry of full ?? []) byId.set(entry.entity_id, entry);
  for (const entry of Object.values(hass.entities ?? {})) {
    byId.set(entry.entity_id, { ...byId.get(entry.entity_id), ...entry });
  }
  const byDevice = new Map<string, RegistryEntity[]>();
  for (const entry of byId.values()) {
    if (entry.platform !== integration || !entry.device_id || entry.disabled_by) continue;
    const group = byDevice.get(entry.device_id);
    if (group) group.push(entry);
    else byDevice.set(entry.device_id, [entry]);
  }
  const index = { byId, byDevice };
  cachedIndex = { display: hass.entities, full, index };
  return index;
}

function isStatus(entry: RegistryEntity): boolean {
  if (entry.platform !== integration || !entry.entity_id.startsWith("sensor.")) return false;
  if (entry.translation_key) return entry.translation_key === "status";
  return entry.unique_id?.endsWith("_status") === true;
}

export function discoverTracks(hass: Hass, registry?: readonly RegistryEntity[]): TrainConfig[] {
  const tracks: TrainConfig[] = [];
  for (const entry of registryIndex(hass, registry).byId.values()) {
    if (!entry.disabled_by && isStatus(entry) && hass.states[entry.entity_id]) {
      tracks.push({ entity: entry.entity_id });
    }
  }
  return tracks.sort((a, b) => a.entity.localeCompare(b.entity));
}

function siblingRole(entry: RegistryEntity, prefix: string | undefined): SensorRole | undefined {
  if (!entry.entity_id.startsWith("sensor.")) return undefined;
  if (entry.translation_key) return sensorRoles.find((key) => key === entry.translation_key);
  if (prefix) return sensorRoles.find((key) => entry.unique_id === prefix + key);
  return undefined;
}

function resolveSensors(train: TrainConfig, index: RegistryIndex): Partial<Record<SensorRole, string>> {
  const anchor = index.byId.get(train.entity);
  const selected: Partial<Record<SensorRole, string>> = {};
  if (anchor?.device_id && anchor.platform === integration) {
    const prefix = anchor.unique_id?.endsWith("_status") ? anchor.unique_id.slice(0, -6) : undefined;
    const seen = new Set<SensorRole>();
    for (const sibling of index.byDevice.get(anchor.device_id) ?? []) {
      const role = siblingRole(sibling, prefix);
      if (!role) continue;
      // Leave an ambiguous role unbound. An explicit mapping can resolve it.
      if (seen.has(role)) delete selected[role];
      else selected[role] = sibling.entity_id;
      seen.add(role);
    }
  }
  for (const role of sensorRoles) {
    const mapped = train.sensors?.[role];
    if (!mapped) continue;
    const other = index.byId.get(mapped);
    if (anchor?.device_id && other?.device_id && anchor.device_id !== other.device_id) {
      delete selected[role];
    } else {
      selected[role] = mapped;
    }
  }
  return selected;
}

function textValue(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text && text !== "unknown" && text !== "unavailable" ? text : null;
}

function instant(value: unknown): string | null {
  const text = textValue(value);
  if (!text || !/^\d{4}-\d\d-\d\dT\d\d:\d\d.*(?:Z|[+-]\d\d:\d\d)$/i.test(text)) return null;
  return Number.isFinite(Date.parse(text)) ? text : null;
}

function signedMinutes(value: string | null): number | null {
  if (!value || !/^[+-]?\d+(?:\.\d+)?$/.test(value)) return null;
  const minutes = Number(value);
  return Number.isFinite(minutes) ? minutes : null;
}

export function getTrack(hass: Hass, train: TrainConfig, registry?: readonly RegistryEntity[]): TrackView {
  const index = registryIndex(hass, registry);
  const anchor = index.byId.get(train.entity);
  const device = anchor?.device_id ? hass.devices?.[anchor.device_id] : undefined;
  const entity = hass.states[train.entity];
  const attributes = entity?.attributes ?? {};
  const selected = resolveSensors(train, index);
  const read = (role: SensorRole) => {
    const id = selected[role];
    return id ? textValue(hass.states[id]?.state) : null;
  };
  const status = textValue(entity?.state);
  const direction = attributes.direction === "arrival" || attributes.direction === "departure"
    ? attributes.direction : null;
  const station = textValue(attributes.station);
  const fallbackTitle = [direction === "arrival" ? "Arrival" : direction === "departure" ? "Departure" : "", station]
    .filter(Boolean).join(" · ");
  const platform = read("platform");
  const platformAttributes = selected.platform ? hass.states[selected.platform]?.attributes : undefined;
  const source = platformAttributes && "platform_source" in platformAttributes
    ? platformAttributes.platform_source : attributes.platform_source;
  // Newer integration versions expose certainty explicitly. An explicit
  // unconfirmed/not_available value must not revive an older source reading.
  const certainty = platformAttributes && "platform_status" in platformAttributes
    ? platformAttributes.platform_status : attributes.platform_status;
  const platformSource = certainty !== undefined && certainty !== null
    ? certainty === "confirmed" ? "actual" : certainty === "planned" ? "planned" : null
    : source === "actual" || source === "planned" ? source : null;
  return {
    entity: train.entity,
    title: train.name ?? textValue(device?.name_by_user) ?? textValue(device?.name) ?? (fallbackTitle || train.entity),
    direction,
    station,
    status,
    availability: !entity ? "missing" : entity.state === "unavailable" ? "unavailable" : status ? "available" : "unknown",
    terminal: attributes.terminal === true,
    stale: typeof attributes.stale === "boolean" ? attributes.stale : null,
    scheduled: instant(read("scheduled")),
    expected: instant(read("expected")),
    actual: instant(read("actual")),
    delayMinutes: signedMinutes(read("delay_minutes")),
    platform,
    platformSource: platform ? platformSource : null,
    lastSuccess: instant(read("last_success")),
    nextPoll: instant(attributes.next_poll),
    reason: textValue(attributes.reason),
    lastError: textValue(attributes.last_error),
  };
}

function formatInstant(iso: string | null, hass: Hass, options: Intl.DateTimeFormatOptions): string {
  if (!instant(iso) || !iso) return "";
  const locale = hass.locale?.language || hass.language || "en-GB";
  const timeZone = hass.config?.time_zone || "Europe/London";
  try {
    return new Intl.DateTimeFormat(locale, { ...options, timeZone }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function formatTime(iso: string | null, hass: Hass): string {
  const options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
  if (hass.locale?.time_format === "24") options.hourCycle = "h23";
  if (hass.locale?.time_format === "12") options.hourCycle = "h12";
  return formatInstant(iso, hass, options);
}

export function formatDate(iso: string | null, hass: Hass): string {
  return formatInstant(iso, hass, { day: "numeric", month: "short", year: "numeric" });
}
