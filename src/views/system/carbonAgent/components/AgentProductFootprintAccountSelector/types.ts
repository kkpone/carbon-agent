export type AgentProductFootprintAccountId = string | number;

export type AgentProductFootprintAccountRow = {
  accountName?: string | null;
  factor?: string | number | null;
  factorUnit?: string | null;
  id: AgentProductFootprintAccountId;
  productCode?: string | null;
  productName?: string | null;
  unitName?: string | null;
};

export type AgentProductFootprintAccountSelection =
  AgentProductFootprintAccountRow;

export type AgentProductFootprintAccountPageParams = {
  keyword: string;
  pageNum: number;
  pageSize: number;
};

export type AgentProductFootprintAccountPageResponse = {
  code: number;
  data?: {
    rows?: AgentProductFootprintAccountRow[];
    total?: number;
  };
  lang?: string | null;
  msg: string;
};

export type AgentProductFootprintAccountSelectorProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: (
    selectedRow: AgentProductFootprintAccountSelection,
  ) => void | Promise<void>;
};
