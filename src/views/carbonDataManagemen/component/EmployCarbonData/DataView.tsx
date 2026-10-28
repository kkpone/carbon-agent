/** **
 * @file 碳账户相关的数据看板
 * @author ljh
 */
import I18N from '@src/lang/I18N';
import { Divider } from 'antd';
import IconFont from '@src/components/iconfont';

export default function DataView({ title, value, percent }) {
  return (
    <>
      <p className='title'>{title}</p>
      <p className='number'>{value || '-'}</p>
      <Divider className='divider' />
      <p className='carbonDatatext'>
        {I18N.carbonDataManagemen.monthOnMonthChange}{Number(percent) !== 0 ? (
          <>
            <IconFont
              type={
                Number(percent) > 0
                  ? 'icon-icon-xiajiang-3'
                  : 'icon-icon-shangsheng-3'
              }
            />{' '}
            <span>
              {Number.isNaN(percent as number)
                ? '-'
                : `${(Math.abs(Number(percent)) * 100).toFixed(2)}%`}
            </span>
          </>
        ) : (
          '-'
        )}
      </p>
    </>
  );
}
