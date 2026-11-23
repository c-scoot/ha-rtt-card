import { sensorRoles, type RttCardConfig, type SensorRole, type TrainConfig } from "./types";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sensorId(value: unknown, field: string): string {
  if (typeof value !== "string" || !/^sensor\.[a-z0-9_]+$/.test(value)) {
    throw new Error(`${field} must be a sensor entity ID.`);
  }
  return value;
}

function optionalText(value: unknown, field: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw new Error(`${field} must be text.`);
  return value.trim() || undefined;
}

function parseTrain(value: unknown, index: number): TrainConfig {
  const field = `Train ${index + 1}`;
  if (!isObject(value)) throw new Error(`${field} must specify a status entity.`);
  const entity = sensorId(value.entity, `${field} entity`);
  const name = optionalText(value.name, `${field} name`);
  const train: TrainConfig = { entity };
  if (name) train.name = name;
  if (value.sensors === undefined) return train;
  if (!isObject(value.sensors)) throw new Error(`${field} sensors must be a mapping.`);

  const sensors: TrainConfig["sensors"] = {};
  const used = new Set([entity]);
  for (const [key, id] of Object.entries(value.sensors)) {
    if (!sensorRoles.some((role) => role === key)) {
      throw new Error(`${field} has an unknown sensor role "${key}".`);
    }
    const mapped = sensorId(id, `${field} ${key}`);
    if (used.has(mapped)) throw new Error(`${field} repeats sensor ${mapped}.`);
    used.add(mapped);
    sensors[key as SensorRole] = mapped;
  }
  train.sensors = sensors;
  return train;
}

export function parseConfig(input: unknown): RttCardConfig {
  if (!isObject(input)) {
    throw new Error("Set trains to a list of tracked status entities.");
  }
  if (typeof input.type !== "string" || !input.type.trim()) {
    throw new Error("The card type is required.");
  }
  const mode = input.mode === undefined ? "selected" : input.mode;
  if (mode !== "all" && mode !== "selected") {
    throw new Error('Mode must be "all" or "selected".');
  }
  const rawTrains = input.trains === undefined && mode === "all" ? [] : input.trains;
  if (!Array.isArray(rawTrains)) {
    throw new Error("Set trains to a list of tracked status entities.");
  }
  const title = optionalText(input.title, "Card title");
  const trains = rawTrains.map(parseTrain);
  if (new Set(trains.map((train) => train.entity)).size !== trains.length) {
    throw new Error("Each tracked status entity can appear only once.");
  }
  const config: RttCardConfig = { ...input, type: input.type, mode, trains };
  if (title) config.title = title;
  else delete config.title;
  return config;
}
