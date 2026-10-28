/**
 * @file tabs 卡片式标签 基础状态
 */
import { TabPaneProps, Tabs as AntTabs, TabsProps } from 'antd';
import { FC } from 'react';
import classNames from 'classnames';
import styles from './index.module.less';

export type CardTabsBaseProps = {
  tabPane: (TabPaneProps & { key: string })[];
} & TabsProps;

export const CardTabsBase: FC<CardTabsBaseProps> = ({
  tabPane,
  children,
  ...props
}) => (
  <AntTabs
    type='card'
    className={classNames(styles.tabs, props.className)}
    {...props}
  >
    {tabPane.map(t => (
      <AntTabs.TabPane {...t} />
    ))}
  </AntTabs>
);
