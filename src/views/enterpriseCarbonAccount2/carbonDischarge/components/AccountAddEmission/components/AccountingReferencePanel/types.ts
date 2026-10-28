export type AccountingReferenceValue = {
  accountId?: string | number;
  supplyAccountId?: string | number;
  factorName?: string | null;
  productName?: string;
  factorValue?: string | number | null;
  factorUnit?: string | null;
  factorUnitM?: string | null;
  activityData?: string | number | null;
  referWay?: string | number;
};

export type AccountingReferencePanelProps = {
  value?: AccountingReferenceValue;
  readPretty?: boolean;
  unitConver?: string | number | null;
  unitConverError?: string;
  activityUnitName?: string;
  factorUnitName?: string;
  functionalUnitName?: string;
  onUnitConverChange?: (value: string | number | null) => void;
  onSelect: () => void;
  onViewDetail?: () => void;
};
