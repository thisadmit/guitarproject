import { LocalTrainingStorage } from "./localTrainingStorage";
import type { TrainingStorage } from "./trainingStorage";

export const trainingStorage: TrainingStorage = new LocalTrainingStorage();
