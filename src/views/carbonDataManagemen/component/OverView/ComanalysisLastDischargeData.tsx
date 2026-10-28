/** **
 * @file 上月排放强度数据看板
 * @author ljh
 */
import I18N from '@src/lang/I18N';
import { useEffect, useState } from 'react';
import { Divider } from 'antd';
import IconFont from '@src/components/iconfont';
import { ApianalysisLastDischarge } from '../../service';

export default function ComanalysisLastDischargeData() {
  /**
   * 上月碳排放数据
   */
  const [analysisLastDischargeData, getanalysisLastDischargeData] = useState<{
    value: number;
    percent: number | null;
  }>({ value: 0, percent: null });
  /**
   *  上月碳排放 环比 接口
   */
  const ApianalysisLastDischargeFn = async () => {
    await ApianalysisLastDischarge().then(({ data }) => {
      getanalysisLastDischargeData({
        value: data.data.value,
        percent: data.data.percent,
      });
    });
  };
  useEffect(() => {
    ApianalysisLastDischargeFn();
  }, []);
  return (
    <>
      <p className='title'>
        {I18N.carbonDataManagemen.lastMonthsCarbonEmissions}<span>（tCO₂e）</span>
      </p>
      <p className='number'>{analysisLastDischargeData.value || '-'}</p>
      <Divider className='divider' />
      <p className='carbonDatatext'>
        {I18N.carbonDataManagemen.monthOnMonthChange}{Number(analysisLastDischargeData.percent) !== 0 ? (
          <>
            <IconFont
              type={
                Number(analysisLastDischargeData.percent) > 0
                  ? 'icon-icon-xiajiang-3'
                  : 'icon-icon-shangsheng-3'
              }
            />{' '}
            <span>
              {Number.isNaN(analysisLastDischargeData?.percent as number)
                ? '-'
                : `${Math.abs(Number(analysisLastDischargeData.percent))}%`}
            </span>
          </>
        ) : (
          '-'
        )}
      </p>
    </>
  );
}
