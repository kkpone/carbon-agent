/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-07-13 18:22:26
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-04 10:50:02
 */
/**
 * @file form 底部的按钮区域
 */
import { RootState } from '@src/store';
import { combineClassName } from '@src/utils';
import { createContext, FC, ReactNode, useContext } from 'react';
import { useSelector } from 'react-redux';

import style from './index.module.less';
import { Button, ButtonProps } from '../Button';
import Permission from '../Permission';

type FormActionsProps = {
  buttons: (ButtonProps & { title: string; permission?: string })[];
  className?: string;
  place?: 'center' | 'right';
  width?: string | number;
  extra?: React.ReactNode;
};

const EmbeddedFormActionsContext = createContext(false);

export const EmbeddedFormActionsBoundary: FC<{
  children: ReactNode;
}> = ({ children }) => (
  <EmbeddedFormActionsContext.Provider value>
    {children}
  </EmbeddedFormActionsContext.Provider>
);

export const FormActions: FC<FormActionsProps> = ({
  className,
  buttons,
  place = 'right',
  width = 0,
  extra,
}) => {
  const app = useSelector<RootState, RootState['app']>(s => s.app);
  const embedded = useContext(EmbeddedFormActionsContext);

  return (
    <div
      className={combineClassName(
        style.wrapper,
        className,
        style[place],
        embedded ? style.embedded : '',
      )}
      style={{
        width:
          width ||
          (embedded
            ? '100%'
            : app.sidebar.opened
            ? 'calc(100% - 180px)'
            : 'calc(100% - 80px)'),
      }}
    >
      {extra}
      {buttons.map(({ title, className: cla, permission, ...btn }) =>
        permission ? (
          <Permission flag={permission}>
            <Button
              className={combineClassName(style.button, cla)}
              {...btn}
              key={title}
            >
              {title}
            </Button>
          </Permission>
        ) : (
          <Button
            className={combineClassName(style.button, cla)}
            {...btn}
            key={title}
          >
            {title}
          </Button>
        ),
      )}
    </div>
  );
};
