import { ContributionAnalysisNode } from '@/views/carbonFootPrintLCAnew/CarbonFootprintModel/type';

export interface AssessmentTargetOption {
  label?: string;
  value?: string;
  unit?: string;
}

export interface ContributionAnalysisProp {
  processName: string;
  [key: string]: string | number | ContributionAnalysisNode;
}
