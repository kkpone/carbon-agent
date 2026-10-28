import classNames from 'classnames';
import { FC } from 'react';

import style from './index.module.less';

export enum TAGSSTATUS {
  FILLING = 'fillingStatus',
  COMPLETE = 'completeStatus',
  BE_SUBMITTED = 'beSubmittedStatus',
  NOT_START = 'notStartStatus',
}

interface TagsProps {
  status?: TAGSSTATUS;
  text: string;
  styleCss?: React.CSSProperties;
}

const Tags: FC<TagsProps> = ({
  status = 'notStartStatus',
  text,
  styleCss = {},
}) => (
  <div className={classNames(style.status, style[status])} style={styleCss}>
    {text}
  </div>
);

export default Tags;
