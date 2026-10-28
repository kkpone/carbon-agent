/*
 * @@description:表单的操作 menu
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-09-29 11:15:11
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-08 16:55:33
 */

import I18N from '@src/lang/I18N';
import IconFont from '@src/components/iconfont';
import { Button, Dropdown, DropdownProps, Menu } from 'antd';
import { ButtonProps } from 'antd/es/button';
import classNames from 'classnames';
import { memo, ReactNode, useMemo } from 'react';

import style from './index.module.less';

type MenuType = {
  key: string;
  label: ReactNode;
  disabled?: boolean;
  onClick?: (ev: MouseEvent) => any;
};

type TableActionsProps = Omit<DropdownProps, 'overlay'> & {
  /** 默认为 「更多」 */
  buttonName?: ReactNode;
  menus: MenuType[];
  buttonProps?: ButtonProps[];
  /** 当前dropdown 的key E2E 测试需要 */
  dropDownKey?: string | number;
  showActionNum?: number;
};

export const TableActions = memo(
  ({
    buttonName,
    buttonProps,
    menus,
    dropDownKey = 'more',
    showActionNum = 3,
    ...props
  }: TableActionsProps) => {
    const menu = useMemo(
      () => (
        // @ts-ignore  这里类型比较复杂，目前只需要 MenuItemProps
        <Menu items={menus?.slice(showActionNum - 1)} />
      ),
      [menus],
    );

    const renderButton = (menuList: MenuType[]) => (
      <>
        {menuList.map((m, index) => (
          // @ts-ignore  fix aria-label 属性不支持
          <Button
            key={m?.key}
            onClick={ev => m?.onClick?.(ev as unknown as MouseEvent)}
            type='link'
            {...(buttonProps?.[index] || {})}
            aria-label={m?.label}
          >
            {m?.label}
          </Button>
        ))}
      </>
    );

    if (menus.length <= showActionNum) {
      return <div className={style.actionsWrapper}>{renderButton(menus)}</div>;
    }

    return (
      <div className={style.actionsWrapper}>
        {renderButton(menus.slice(0, showActionNum - 1))}
        <Dropdown
          placement='bottomRight'
          {...props}
          overlayClassName={classNames(
            style.tableDropdownWrapper,
            props?.overlayClassName,
            `table-dropdown-overlay-${dropDownKey}`,
          )}
          overlay={menu}
        >
          <Button type='link' aria-label={`table-actions-${dropDownKey}`}>
            {buttonName || I18N.Certification.more}
            <IconFont type='icon-icon-zhankai' />
          </Button>
        </Dropdown>
      </div>
    );
  },
);
