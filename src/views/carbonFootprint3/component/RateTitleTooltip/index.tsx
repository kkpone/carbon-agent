/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-03-20 11:19:39
 * @Date: 2023-03-20 11:11:26
 * @@description: 单位换算比例在小屏幕下的展示
 */
import I18N from '@src/lang/I18N';
import IconFont from '@src/components/iconfont';
import { Tooltip } from 'antd';

export default () => (
  <span>
    {I18N.carbonFootprint.unitConversionRatio4}
    <Tooltip overlay={I18N.carbonFootprint3.consumptionQuantityArrangement}>
      <IconFont
        style={{ cursor: 'pointer' }}
        className='m-l-10'
        type='icon-icon-bangchuzhongxin'
        aria-label='bangchuzhongxin'
      />
    </Tooltip>
  </span>
);
