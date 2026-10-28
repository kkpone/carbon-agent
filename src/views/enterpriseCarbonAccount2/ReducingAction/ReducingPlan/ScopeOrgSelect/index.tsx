import I18N from '@src/lang/I18N';
import { Cascader } from 'antd';

import styles from './index.module.less';
import { ReducingPlan } from '../type';

type ScopeOrgSelectProps<
  T extends { scopeValues?: string[][]; orgValues?: string[][] },
> = {
  reducingPlan: ReducingPlan;
  value: T;
  onChange: (val: T) => void;
};

const ScopeOrgSelect = <
  T extends { scopeValues?: string[][]; orgValues?: string[][] },
>({
  reducingPlan,
  value,
  onChange,
}: ScopeOrgSelectProps<T>) => (
  <div>
    {Object.prototype.hasOwnProperty.call(value, 'scopeValues') && (
      <Cascader
        className={styles.scopeCascader}
        value={value.scopeValues}
        placeholder={I18N.enterpriseCarbonAccount2.scopeOfInvolvement}
        multiple
        maxTagCount='responsive'
        options={reducingPlan.ghgCategoryList}
        fieldNames={{ label: 'name', children: 'classifyList' }}
        onChange={val => {
          onChange({
            ...value,
            scopeValues: val,
          });
        }}
      />
    )}
    {Object.prototype.hasOwnProperty.call(value, 'orgValues') && (
      <Cascader
        className={styles.orgCascader}
        value={value.orgValues}
        placeholder={I18N.enterpriseCarbonAccount2.organizationalScope}
        multiple
        maxTagCount='responsive'
        options={reducingPlan.orgList}
        fieldNames={{ value: 'id', label: 'name' }}
        onChange={val => {
          onChange({
            ...value,
            orgValues: val,
          });
        }}
      />
    )}
  </div>
);

export default ScopeOrgSelect;
