import { Drawer, DrawerProps } from 'antd';
import classNames from 'classnames';
import { CSSProperties, FC, PropsWithChildren, ReactNode } from 'react';

import styles from './index.module.less';

type CustomDrawerProps = PropsWithChildren<
  DrawerProps & {
    headerExtra?: ReactNode;
    headerClassName?: string;
    titleClassName?: string;
    headerRightClassName?: string;
    closeButtonClassName?: string;
    closeButtonStyle?: CSSProperties;
  }
>;

export const CustomDrawer: FC<CustomDrawerProps> = ({
  children,
  headerExtra,
  headerClassName,
  titleClassName,
  headerRightClassName,
  closeButtonClassName,
  closeButtonStyle,
  title,
  onClose,
  closeIcon,
  ...drawerProps
}) => (
  <Drawer {...drawerProps} title={undefined} closeIcon={null} onClose={onClose}>
    <div className={classNames(styles.drawerHeader, headerClassName)}>
      <div className={classNames(styles.drawerTitle, titleClassName)}>
        {title}
      </div>
      <div
        className={classNames(styles.drawerHeaderRight, headerRightClassName)}
      >
        {headerExtra}
        <button
          type='button'
          onClick={onClose}
          aria-label='Close'
          style={{
            position: 'relative',
            left: '12px',
            ...closeButtonStyle,
          }}
          className={classNames('ant-drawer-close', closeButtonClassName)}
        >
          {closeIcon || (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='16'
              height='16'
              viewBox='0 0 16 16'
              fill='none'
            >
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M14.5741 0.251933L8 6.82605L1.42588 0.251933C1.25196 0.0954068 1.05631 0.0171432 0.838908 0.0171432C0.62151 0.0171432 0.4302 0.0997546 0.264977 0.264977C0.0997546 0.4302 0.0171432 0.62151 0.0171432 0.838908C0.0171432 1.05631 0.0954068 1.25196 0.251933 1.42588L6.82605 8L0.251933 14.5741C0.0258394 14.8002 -0.048076 15.0698 0.0301873 15.3828C0.108451 15.6959 0.299761 15.8916 0.604118 15.9698C0.908475 16.0481 1.1824 15.9742 1.42588 15.7481L8 9.17395L14.5741 15.7481C14.748 15.9046 14.9437 15.9829 15.1611 15.9829C15.3785 15.9829 15.5698 15.9002 15.735 15.735C15.9002 15.5698 15.9829 15.3785 15.9829 15.1611C15.9829 14.9437 15.9046 14.748 15.7481 14.5741L9.17395 8L15.7481 1.42588C15.9742 1.19979 16.0481 0.930215 15.9698 0.617162C15.8916 0.304109 15.6959 0.108451 15.3828 0.0301873C15.0698 -0.048076 14.8002 0.0258394 14.5741 0.251933Z'
                fill='#6C757D'
              />
            </svg>
          )}
        </button>
      </div>
    </div>
    {children}
  </Drawer>
);
