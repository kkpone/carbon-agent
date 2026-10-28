export type AssociateProductFootprintSourceItem = {
  id?: number;
  accountName?: string;
  productName?: string;
  unitCode?: string;
  factor?: string;
  activityData: string | number | null;
};

export type AssociateProductFootprintSourcesRequest = {
  computationId: string | number;
  computationPeriod?: string;
  ghgCategory: string;
  ghgClassify: string;
  list: AssociateProductFootprintSourceItem[];
};

export type AssociateProductFootprintSourcesResponse = Record<string, unknown>;

export type CreateProductFootprintSnapshotRequest = {
  accountId: string | number;
};

export type CreateProductFootprintSnapshotResponse = {
  code?: number;
  data?: number;
  msg?: string;
  [property: string]: unknown;
};
