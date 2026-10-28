/** **
 * @file 上月排放强度数据看板
 * @author ljh
 */
import I18N from '@src/lang/I18N';
import { useEffect, useState } from 'react';
import { Divider } from 'antd';
import IconFont from '@src/components/iconfont';
import { ApianalysisLastStrength } from '../../service';

export default function ComanalysisLastStrengthData() {
  /**
   * 排放强度
   */
  const [analysisLastStrengthData, getanalysisLastStrengthData] = useState<{
    value: number;
    percent: number | null;
  }>({ value: 0, percent: null });
  /**
   *上月强度  环比 接口
   *
   */
  const ApianalysisLastStrengthFn = async () => {
    await ApianalysisLastStrength().then(({ data }) => {
      getanalysisLastStrengthData({
        value: data.data.value,
        percent: data.data.percent,
      });
    });
  };
  useEffect(() => {
    ApianalysisLastStrengthFn();
  }, []);
  return (
    <>
      <p className='title'>
        {I18N.carbonDataManagemen.lastMonthsCarbonEmissions2}<span>{I18N.carbonDataManagemen.tcOe10000}</span>
      </p>
      <p className='number'>{analysisLastStrengthData.value || '-'}</p>
      <Divider className='divider' />
      <p className='carbonDatatext'>
        {I18N.carbonDataManagemen.monthOnMonthChange}{Number(analysisLastStrengthData.percent) !== 0 ? (
          <>
            <IconFont
              type={
                Number(analysisLastStrengthData.percent) > 0
                  ? 'icon-icon-xiajiang-3 '
                  : 'icon-icon-shangsheng-3'
              }
            />
            <span>
              {Number.isNaN(analysisLastStrengthData?.percent as number)
                ? '-'
                : `${Math.abs(Number(analysisLastStrengthData.percent))}%`}
            </span>
          </>
        ) : (
          '-'
        )}
      </p>
    </>
  );
}
