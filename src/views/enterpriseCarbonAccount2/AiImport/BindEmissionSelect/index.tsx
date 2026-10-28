import I18N from '@src/lang/I18N';
import { Select } from 'antd';
import { isNil } from 'lodash-es';
import { FC } from 'react';

import { IconAlibabaNew } from '@/components/iconfont';

import styles from './index.module.less';
import { ComputationSource } from '../AnalyzeResultModal/type';

export const BindEmission = ({
  source,
  inline,
}: {
  source: ComputationSource;
  inline?: boolean;
}) => (
  <div
    className={styles.bindEmissionContent}
    style={{ display: inline ? 'inline-flex' : 'flex' }}
  >
    <div className={styles.bindEmissionName} title={source.name}>
      {source.name}
    </div>
    <div className={styles.bindEmissionFacility} title={source.facility}>
      {source.facility}
    </div>
    <div className={styles.bindEmissionUnit} title={source.activityUnitDesc}>
      {I18N.components.unit}
      {source.activityUnitDesc}
    </div>
  </div>
);

const BindEmissionSelect: FC<{
  sourceList?: ComputationSource[];
  value?: number;
  allowClear?: boolean;
  onChange?: (value: number, source: ComputationSource) => void;
}> = props => {
  const { value, allowClear = true, sourceList, onChange } = props;
  return (
    <div className={styles.bindEmissionContent}>
      {isNil(value) ? (
        <div className={styles.newTag}>New</div>
      ) : (
        <IconAlibabaNew className={styles.bindIcon} type='icon-guanlian' />
      )}
      <Select
        style={{ width: 'calc(100% - 32px)' }}
        value={value}
        placeholder={I18N.carbonFootprint.pleaseSelect}
        allowClear={allowClear}
        showSearch
        optionFilterProp='name'
        options={(sourceList || []).map(source => ({
          ...source,
          value: source.id,
          label: <BindEmission source={source} />,
        }))}
        popupMatchSelectWidth={false}
        onChange={(val, opt) => {
          onChange?.(val, opt as ComputationSource);
        }}
      />
    </div>
  );
};

export default BindEmissionSelect;
