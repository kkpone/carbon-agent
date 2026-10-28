/**
 * 碳标签 - 碳标签类型切换
 */
import { connect, mapProps } from '@formily/react';
import I18N from '@src/lang/I18N';

import style from './index.module.less';

// type Props = {
//   /** 0 碳足迹核算 1 主动减排 2 碳信用抵消*/
//   value: number;
//   onChange: (value: number) => void;
//   disabled?: boolean;
// };

const FormilyLabelTabs = () => (
  <div className={style.formilyLabelTabs}>
    {I18N.carbonFootprint3.carbonFootprintLabel}
  </div>
);

export default connect(
  FormilyLabelTabs,
  mapProps({ value: true, disabled: true, readPretty: true }, () => ({})),
);
