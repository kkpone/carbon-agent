import { checkPermissions } from '@src/components/Permission/utils';
import I18N from '@src/lang/I18N';
import { Button, ButtonProps } from 'antd';
import { FC, ReactNode } from 'react';

import { canShowShareModelSubmitAction } from '../../share';
import { submitSharedModel } from '../../shareSubmit';

type ShareModelSubmitButtonProps = {
  accountId: number;
  /** account/info 返回的 shareStatus，1 或 4 时展示提交 */
  shareStatus?: number | null;
  onSuccess?: () => void | Promise<void>;
  permissionCode?: string;
  /** 与步骤条操作区一致的容器 class */
  wrapperClassName?: string;
} & Pick<ButtonProps, 'type' | 'className'>;

/** 受共享方模型提交按钮：shareStatus=1 或 4 时展示 */
export const ShareModelSubmitButton: FC<ShareModelSubmitButtonProps> = ({
  accountId,
  shareStatus,
  onSuccess,
  permissionCode = 'footprint3:account:edit',
  wrapperClassName,
  type,
  className,
}) => {
  if (!canShowShareModelSubmitAction({ shareStatus })) {
    return null;
  }

  const button = checkPermissions(
    <Button
      type={type}
      className={className}
      onClick={() => submitSharedModel({ accountId, onSuccess })}
    >
      {I18N.components.submit}
    </Button>,
    permissionCode,
  );

  if (!button) {
    return null;
  }

  const content: ReactNode = wrapperClassName ? (
    <div className={wrapperClassName}>{button}</div>
  ) : (
    button
  );

  return content;
};
