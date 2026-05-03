import type { TrainingRecord } from "../../types/records";
import type { TrainingStorage } from "./trainingStorage";

const TRAINING_RECORDS_KEY = "solo-guitar-training-records";
const MAX_RECORDS = 100;

export class LocalTrainingStorage implements TrainingStorage {
  async getRecords(): Promise<TrainingRecord[]> {
    return readRecords();
  }

  async saveRecord(record: TrainingRecord): Promise<void> {
    const nextRecords = [record, ...readRecords()]
      .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
      .slice(0, MAX_RECORDS);

    window.localStorage.setItem(TRAINING_RECORDS_KEY, JSON.stringify(nextRecords));
  }

  async clearRecords(): Promise<void> {
    window.localStorage.removeItem(TRAINING_RECORDS_KEY);
  }
}

function readRecords(): TrainingRecord[] {
  try {
    const rawRecords = window.localStorage.getItem(TRAINING_RECORDS_KEY);
    if (!rawRecords) {
      return [];
    }

    const parsedRecords = JSON.parse(rawRecords);
    if (!Array.isArray(parsedRecords)) {
      return [];
    }

    return parsedRecords
      .filter(isTrainingRecord)
      .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  } catch {
    return [];
  }
}

function isTrainingRecord(value: unknown): value is TrainingRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<TrainingRecord>;
  return (
    typeof record.id === "string" &&
    typeof record.mode === "string" &&
    typeof record.trainingType === "string" &&
    typeof record.durationSec === "number" &&
    typeof record.attempts === "number" &&
    typeof record.correctCount === "number" &&
    typeof record.accuracy === "number" &&
    typeof record.maxStreak === "number" &&
    typeof record.completedProblems === "number" &&
    typeof record.createdAt === "string"
  );
}
