import IconFont from '@src/components/iconfont';
import { Tooltip } from 'antd';

type CommonTooltipProps = {
  title: string;
  tooltip: string;
};

export default ({ title, tooltip }: CommonTooltipProps) => (
  <span>
    {title}
    <Tooltip overlay={tooltip}>
      <IconFont
        style={{ cursor: 'pointer' }}
        className='m-l-10'
        type='icon-icon-bangchuzhongxin'
        aria-label='bangchuzhongxin'
      />
    </Tooltip>
  </span>
);
