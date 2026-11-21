export const sensorRoles = [
  "scheduled",
  "expected",
  "actual",
  "delay_minutes",
  "platform",
  "last_success",
] as const;

export type SensorRole = (typeof sensorRoles)[number];

export interface TrainConfig {
  entity: string;
  name?: string;
  sensors?: Partial<Record<SensorRole, string>>;
}

export interface RttCardConfig {
  type: string;
  title?: string;
  trains: TrainConfig[];
  [key: string]: unknown;
}

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed?: string;
  last_updated?: string;
}

export interface RegistryEntity {
  entity_id: string;
  device_id?: string | null;
  platform?: string | null;
  translation_key?: string | null;
  unique_id?: string | null;
  hidden?: boolean;
  hidden_by?: string | null;
  disabled_by?: string | null;
}

export interface RegistryDevice {
  id: string;
  name?: string | null;
  name_by_user?: string | null;
}

export interface Hass {
  states: Record<string, HassEntity>;
  entities?: Record<string, RegistryEntity>;
  devices?: Record<string, RegistryDevice>;
  locale?: { language?: string; time_format?: string };
  language?: string;
  config?: { time_zone?: string };
  callWS?<T>(message: { type: string; [key: string]: unknown }): Promise<T>;
}

export interface TrackView {
  entity: string;
  title: string;
  direction: "arrival" | "departure" | null;
  station: string | null;
  status: string | null;
  availability: "available" | "unavailable" | "missing" | "unknown";
  terminal: boolean;
  stale: boolean | null;
  scheduled: string | null;
  expected: string | null;
  actual: string | null;
  delayMinutes: number | null;
  platform: string | null;
  platformSource: "actual" | "planned" | null;
  lastSuccess: string | null;
  nextPoll: string | null;
  reason: string | null;
  lastError: string | null;
}
