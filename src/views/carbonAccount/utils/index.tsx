import I18N from '@src/lang/I18N';
import { pageUsingGET1DefaultApi } from '@src/sdks/java/carbonAccount';
import { useEffect, useMemo, useState } from 'react';
import { Organizations } from '../baseSetting/utils/types';

/** 获取组织列表 */
export const useOrganizations = () => {
  const [organizations, setOrganizations] = useState<Organizations[]>([]);
  useEffect(() => {
    pageUsingGET1DefaultApi().then(res => {
      const list = res.data.data as Organizations[];

      setOrganizations(list);
    });
  }, []);
  return organizations;
};

/** 获取平级组织 */
export const useFlattedOrganizations = (organizations: Organizations[]) => {
  const flatFn = (list: Organizations[], values: Organizations[]) => {
    let v = [...values];
    list.forEach(org => {
      v = v.concat([org]);
      if (org.children) v = flatFn(org.children, v);
    });

    return v;
  };
  return useMemo(() => flatFn(organizations, []), [organizations]);
};

/** 将组织父级改为不可选 */
export const changeOrganizationsTree = (organizations: Organizations[]) => {
  const newOrgs = organizations;
  const changeFn = (orgs: Organizations[]) =>
    orgs.map(org => ({
      ...org,
      disabled: !!org.children?.length,
      children: org.children && changeFn(org.children),
    }));
  return changeFn(newOrgs);
};

export const formNumberCheck = async ({
  labelName,
  validatorVal,
  maxValue,
}: {
  labelName: string;
  validatorVal?: string;
  maxValue?: number;
}) => {
  const max = (maxValue ?? 9999999) + 1;
  const rel = /(^[1-9]\d*$)/;
  if (!validatorVal) {
    return Promise.reject(new Error(I18N.template(I18N.carbonAccount.label2, { val1: labelName })));
  }
  if (validatorVal && !rel.test(validatorVal)) {
    return Promise.reject(new Error(I18N.carbonAccount.pleaseEnterAPositiveNumber));
  }
  if (validatorVal && Number(validatorVal) < 0) {
    return Promise.reject(new Error(I18N.template(I18N.carbonAccount.label, { val1: labelName })));
  }
  if (validatorVal && Number(validatorVal) >= max) {
    return Promise.reject(new Error(I18N.carbonAccount.exceedingInputRange));
  }
  return Promise.resolve();
};
