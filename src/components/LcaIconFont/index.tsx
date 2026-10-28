import { createFromIconfontCN } from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

import { IconFount } from './iconfont';

const MyIcon = createFromIconfontCN({
  scriptUrl: IconFount as unknown as string, // 在 iconfont.cn 上生成
});

export const IconFont = ({
  icon,
  ...props
}: { icon: string } & Partial<CustomIconComponentProps>) => (
  <MyIcon type={icon} {...props} />
);
