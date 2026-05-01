export interface SoloRecordingSummary {
  durationSeconds: number;
  noteCount: number;
  mostUsedNote: string | null;
}

export interface RecordedNote {
  note: string;
  timestampMs: number;
}
