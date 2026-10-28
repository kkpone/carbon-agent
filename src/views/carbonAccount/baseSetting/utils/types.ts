export type OrganizationModal = {
  pid?: number;
  level?: number;
  id?: number;
  orderNum?: number;
};

export type Organizations = {
  id: number;
  companyId: number;
  orgName: string;
  pid: number;
  level: number;
  orderNum: number;
  userNumbers: number;
  children?: Organizations[];
};

export type ModalData = {
  title: string;
  thumbUrl: string;
  code?: string;
};
