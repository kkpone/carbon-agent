import { ValueOf } from 'type-fest';

import { INVITE_SUPPLIER_STATUS } from '../../constant';

export type SearchParams = {
  pageNum: number;
  pageSize: number;
  companyName?: string;
  contacts?: string;
  status?: string;
};

export type InviteSupplier = {
  supplierMiddleId: number;
  operateKey: string;
  companyName: string;
  companyNameErrorMsg: string | null;
  companyNumber: string;
  companyNumberErrorMsg: string | null;
  companyNum: string;
  companyNumErrorMsg: string | null;
  contacts: string;
  contactsErrorMsg: string | null;
  phone: string;
  phoneErrorMsg: string | null;
  email: string;
  emailErrorMsg: string | null;
  remark: string;
  status: ValueOf<typeof INVITE_SUPPLIER_STATUS>;
  statusDesc: string;
  area?: string;
};

export type InviteSupplierFilterOptions = {
  supplierMiddleId: number;
  companyName: string;
  contacts: string;
  status: ValueOf<typeof INVITE_SUPPLIER_STATUS>;
}[];
