/** 接口原始字段；id 仅用于复用库详情和删除。 */
export type SavedCustomFactor = {
  id: string;
  name: string;
  factor: string;
  unit: string;
  institution: string;
  year?: string | null;
};

export type SavedFactorFilters = {
  name?: string;
  factor?: string;
  institution?: string;
  year?: string;
};

export type SavedFactorQuery = SavedFactorFilters & {
  pageNum: number;
  pageSize: number;
};

export type SavedFactorPage = {
  rows: SavedCustomFactor[];
  total: number;
};

/** 后端接口适配边界；不提供前端保存、收集或去重操作。 */
export type SavedFactorService = {
  query: (params: SavedFactorQuery) => Promise<SavedFactorPage>;
  detail: (id: string) => Promise<SavedCustomFactor>;
  remove: (id: string) => Promise<void>;
};
