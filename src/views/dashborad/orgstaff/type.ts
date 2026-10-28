export type EnterPriseStaffType = {
  userName: string | null;
  email?: string | null;
  roles_list: string[] | null;
  roles?: { roleName: string; roleId: number }[] | null;
  user_name?: string | null;
  nickName?: string | null;
  usStatus: boolean | null;
  id?: string;
  userId?: string;
  udId?: string;
  employName?: null | string | number;
  employPhone?: null | string | number;
  departmentName: null | string | number;
};

/** 员工 禁用、启用 操作类型 1 员工启用禁用 2 员工删除  */
export type UserStatusChange = {
  userId: string | number;
  useType: 1;
};
/** 员工 禁用、启用 */
export type UserDelPayload = {
  userId: string | number;
  useType: 2;
};
