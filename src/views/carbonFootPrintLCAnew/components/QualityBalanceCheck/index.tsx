/**
 * @description: 质量平衡检查
 */
import I18N from '@src/lang/I18N';
import { Descriptions } from 'antd';

import style from './index.module.less';

interface QualityBalanceCheckProps {
  processDescDataSource?: {
    inputTotal?: number;
    outputTotal?: number;
    deviation?: string;
  };
}
export function QualityBalanceCheck({
  processDescDataSource,
}: QualityBalanceCheckProps) {
  const { inputTotal, outputTotal, deviation } = processDescDataSource || {};

  return (
    <div className={style.qualityBalanceCheckWrapper}>
      <div className={style.headerWrapper}>
        {I18N.carbonFootPrintLCA.qualityBalanceInspection}
      </div>
      <Descriptions
        bordered
        column={1}
        labelStyle={{
          width: '30%',
        }}
      >
        <Descriptions.Item label={I18N.carbonFootPrintLCA.enterTotalWeight}>
          {inputTotal ?? '-'}
        </Descriptions.Item>
        <Descriptions.Item label={I18N.carbonFootPrintLCA.outputTotalWeight}>
          {outputTotal ?? '-'}
        </Descriptions.Item>
        <Descriptions.Item label={I18N.carbonFootPrintLCA.checkResultInput}>
          {deviation ?? '-'}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
}
