import type { TrainingRecord } from "../types/records";

export function getTrainingStats(records: readonly TrainingRecord[]) {
  const totalSessions = records.length;
  const totalPracticeTimeSec = records.reduce(
    (total, record) => total + record.durationSec,
    0,
  );
  const averageAccuracy =
    totalSessions > 0
      ? Math.round(
          records.reduce((total, record) => total + record.accuracy, 0) /
            totalSessions,
        )
      : 0;
  const bestStreak = records.reduce(
    (currentBest, record) => Math.max(currentBest, record.maxStreak),
    0,
  );
  const completedProblems = records.reduce(
    (total, record) => total + record.completedProblems,
    0,
  );

  return {
    averageAccuracy,
    bestStreak,
    completedProblems,
    totalPracticeTimeSec,
    totalSessions,
  };
}
