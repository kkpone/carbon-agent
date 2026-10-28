import I18N from '@src/lang/I18N';
import { ArrayItems } from '@formily/antd-v5';
import { FC } from 'react';

interface IFormilyTableIndexProps {}

export const FormilyTableIndex: FC<IFormilyTableIndexProps> = () => {
  const index = ArrayItems.useIndex();
  return (
    <div>
      {I18N.carbonFootprint3.roadSection}
      {index + 1}
    </div>
  );
};
