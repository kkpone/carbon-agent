import { request } from '@/api/request';

import {
  AssociateProductFootprintSourcesRequest,
  AssociateProductFootprintSourcesResponse,
  CreateProductFootprintSnapshotRequest,
  CreateProductFootprintSnapshotResponse,
} from './types';

const PRODUCT_FOOTPRINT_ASSOCIATION_API =
  '/enterprise/source/account/refer/save';
const PRODUCT_FOOTPRINT_SNAPSHOT_API =
  '/enterprise/source/account/refer/snapshot';

export function associateProductFootprintSources(
  data: AssociateProductFootprintSourcesRequest,
) {
  return request<AssociateProductFootprintSourcesResponse>({
    method: 'post',
    url: PRODUCT_FOOTPRINT_ASSOCIATION_API,
    data,
  });
}

export function createProductFootprintSnapshot(
  accountId: CreateProductFootprintSnapshotRequest['accountId'],
) {
  return request<CreateProductFootprintSnapshotResponse>({
    method: 'post',
    url: PRODUCT_FOOTPRINT_SNAPSHOT_API,
    data: { accountId },
  });
}
