import { Descriptions, Modal } from 'antd';
import classNames from 'classnames';
import { FC, ReactNode } from 'react';

import I18N from '@/lang/I18N';

import {
  calculateDefaultEmission,
  DefaultCnSelection,
  isSameDefaultValue,
} from '../defaultValueTypes';
import style from './index.module.less';

interface PrecursorDefaultValueDetailDialogProps {
  open: boolean;
  selectedEmission?: number;
  value?: DefaultCnSelection;
  onCancel: () => void;
}

const showValue = (value?: ReactNode) => value || '-';
const DEFAULT_VALUE_UNIT = 'tCO2e/t';

const renderDefaultValueTitle = (title: ReactNode) => (
  <div>
    <div>{title}</div>
    <div className={style.defaultValueUnit}>{DEFAULT_VALUE_UNIT}</div>
  </div>
);

const PrecursorDefaultValueDetailDialog: FC<
  PrecursorDefaultValueDetailDialogProps
> = ({ open, selectedEmission, value, onCancel }) => {
  const renderYearValue = (yearValue?: string, growthRate?: string) => (
    <div
      className={classNames({
        [style.selectedYear]: isSameDefaultValue(
          calculateDefaultEmission(value?.directDefaultValue, growthRate),
          selectedEmission,
        ),
      })}
    >
      <div>{showValue(yearValue)}</div>
      <div className={style.growthRate}>
        {I18N.cbam.growthRate}: {showValue(growthRate)}
      </div>
    </div>
  );

  return (
    <Modal
      centered
      destroyOnClose
      footer={null}
      open={open}
      title={I18N.cbam.defaultValueDetails}
      width='70%'
      onCancel={onCancel}
    >
      <div className={style.detailContent}>
        <Descriptions bordered column={2} size='small'>
          <Descriptions.Item label={I18N.cbam.productCnCode}>
            {showValue(value?.defaultCode)}
          </Descriptions.Item>
          <Descriptions.Item label={I18N.cbam.description}>
            {showValue(value?.defaultName)}
          </Descriptions.Item>
          <Descriptions.Item label={I18N.cbam.countryOrRegion}>
            {showValue(value?.effectiveCountryName || value?.countryName)}
          </Descriptions.Item>
          <Descriptions.Item label={I18N.cbam.productCategory}>
            {showValue(value?.name)}
          </Descriptions.Item>
          <Descriptions.Item
            label={renderDefaultValueTitle(I18N.cbam.defaultDirectEmission)}
          >
            {showValue(value?.directDefaultValue)}
          </Descriptions.Item>
          <Descriptions.Item
            label={renderDefaultValueTitle(I18N.cbam.defaultIndirectEmission)}
          >
            {showValue(value?.indirectDefaultValue)}
          </Descriptions.Item>
          <Descriptions.Item
            label={renderDefaultValueTitle(I18N.cbam.defaultTotalEmission)}
            span={2}
          >
            {showValue(value?.totalDefaultValue)}
          </Descriptions.Item>
          <Descriptions.Item
            label={renderDefaultValueTitle(I18N.cbam.defaultValue2026)}
          >
            {renderYearValue(
              value?.defaultValue2026,
              value?.defaultValue2026GrowthRate,
            )}
          </Descriptions.Item>
          <Descriptions.Item
            label={renderDefaultValueTitle(I18N.cbam.defaultValue2027)}
          >
            {renderYearValue(
              value?.defaultValue2027,
              value?.defaultValue2027GrowthRate,
            )}
          </Descriptions.Item>
          <Descriptions.Item
            label={renderDefaultValueTitle(I18N.cbam.defaultValue2028Onwards)}
            span={2}
          >
            {renderYearValue(
              value?.defaultValue2028Onwards,
              value?.defaultValue2028OnwardsGrowthRate,
            )}
          </Descriptions.Item>
          <Descriptions.Item label={I18N.cbam.productionRoute} span={2}>
            {showValue(value?.productionRoute)}
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Modal>
  );
};

export default PrecursorDefaultValueDetailDialog;
