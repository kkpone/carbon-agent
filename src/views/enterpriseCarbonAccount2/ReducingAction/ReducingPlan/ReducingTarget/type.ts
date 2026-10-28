export type TargetStage = {
  stageId: number;
  targetYear: string;
  targetStage: number;
  percentage: Record<string, any>;
};

type TargetStageEmission = {
  name: string;
  value: string;
  emissionRatio: string;
  emissionAvg: string;
  classify: TargetStageEmission[];
};
export type TargetStageItem = {
  id: number;
  targetYear: string;
  targetStage: number;
  emissionDetail: TargetStageEmission[];
};
