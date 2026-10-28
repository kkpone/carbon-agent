type OrgInfo = {
  children?: OrgInfo[];
  id: number;
  orgName: string;
};

/**
 * get name by id
 */
export function getOrgNameByOrgId(
  params: OrgInfo[] = [],
  id: number = 0,
): string {
  let orgName = '';
  params.forEach(item => {
    if (item.id === id) {
      orgName = item.orgName;
    } else if (item.children) {
      const res = getOrgNameByOrgId(item.children, id);
      if (res) {
        orgName = res;
      }
    }
  });
  return orgName;
}
