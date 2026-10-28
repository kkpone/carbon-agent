import { ContributionAnalysisNode } from '@/views/carbonFootPrintLCA/CarbonFootprintModel/type';

export interface AssessmentTargetOption {
  label?: string;
  value?: string;
  unit?: string;
}

export interface ContributionAnalysisProp {
  processName: string;
  [key: string]: string | number | ContributionAnalysisNode;
}
