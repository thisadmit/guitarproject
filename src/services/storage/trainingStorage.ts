import type { TrainingRecord } from "../../types/records";

export interface TrainingStorage {
  getRecords(): Promise<TrainingRecord[]>;
  saveRecord(record: TrainingRecord): Promise<void>;
  clearRecords(): Promise<void>;
}
