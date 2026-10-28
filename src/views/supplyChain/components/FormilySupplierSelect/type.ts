export type SupplierSelectValue = {
  supplyCompanyId: number | string;
  companyName: string;
  isManualInput?: boolean;
};

export type SupplierSelectOptions = {
  supplyCompanyId: number | string;
  companyName: string;
  companyNameNumber?: string;
  companyNumber?: string;
  contacts?: string;
  phone?: string;
  email?: string;
  isManualInput?: boolean;
  areaCode?: string;
}[];
