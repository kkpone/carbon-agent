import type { CcdbFactorDetail } from '../../ccdbFactor';

export type FactorLibraryTab = 'popular' | 'recent';
export type FactorLibraryItem = Pick<
  CcdbFactorDetail,
  | 'factorId'
  | 'name'
  | 'cValue'
  | 'unit'
  | 'institution'
  | 'year'
  | 'countries'
  | 'factorPattern'
  | 'factorVersion'
>;

export interface FactorLibraryRecord {
  id: string;
  factorId: string;
  factorVersion?: string | null;
  actionType: string;
  entrySource: string;
  occurredAt: string;
  factorSnapshotJson: string;
  sessionId?: string | null;
  sourceShareId?: string | null;
}

export interface FactorLibraryRecordsPage {
  list: FactorLibraryRecord[];
  total: number;
  pageNum: number;
  pageSize: number;
  pages: number;
}
