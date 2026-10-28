/*
 * @@description: 统一的列表页头部样式
 */
import { Space } from 'antd';
import { ButtonType } from 'antd/es/button';
import classNames from 'classnames';
import { FC, ReactNode } from 'react';

import style from './index.module.less';
import { Button, ButtonProps } from '../Form/Button';

type DefaultButtonType = ButtonType | undefined;

type ActionButton = {
  button: ReactNode;
  click?: (ev: React.MouseEvent<HTMLElement>) => Promise<void> | void;
  /** 是否自定义按钮颜色 */
  buttonType?: DefaultButtonType;
};

type PageProps = {
  title: ReactNode;
  actionBtnChild?: ReactNode;
  actionBtnChildArr?: ActionButton[];
  wrapperClass?: string;
  children?: ReactNode;
  /** 右侧自定义渲染区 */
  rightRender?: ReactNode;
  onBtnClick?: ButtonProps['onClick'];
};
export const Page: FC<PageProps> = ({
  title,
  wrapperClass,
  actionBtnChild,
  rightRender,
  onBtnClick,
  children,
  actionBtnChildArr,
}) => {
  // 辅助函数用于确定按钮类型
  const determineButtonType = (
    buttonType: ButtonType | undefined,
    index: number,
  ): ButtonType => {
    if (buttonType) {
      return buttonType;
    }
    return index > 0 ? 'default' : 'primary';
  };
  return (
    <div className={classNames(style.wrapper, wrapperClass)}>
      <header>
        <h3 className={style.title}>{title}</h3>
        <Space>
          {actionBtnChildArr
            ? actionBtnChildArr.map((item, index) => {
                const buttonType = determineButtonType(item.buttonType, index);
                return (
                  <Button
                    onClick={async ev => {
                      await item?.click?.(ev);
                    }}
                    type={buttonType}
                  >
                    {item.button}
                  </Button>
                );
              })
            : actionBtnChild && (
                <Button onClick={onBtnClick || (async () => {})} type='primary'>
                  {actionBtnChild}
                </Button>
              )}
        </Space>
        {/* fixme 没有做测试 */}
        {rightRender}
      </header>
      {children}
    </div>
  );
};
