/*
 * @@description:表单的操作 menu
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-09-29 11:15:11
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-02-15 10:03:17
 */

import { Button, Dropdown, DropdownProps, Menu } from 'antd';
import { ButtonProps } from 'antd/es/button';
import classNames from 'classnames';
import { Fragment, memo, ReactNode, useMemo } from 'react';

import { IconFont } from '@/components/LcaIconFont';

import style from './index.module.less';
import I18N from '../../../lang/I18N';

export type MenuType = {
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
};

export const TableActions = memo(
  ({
    buttonName,
    buttonProps,
    menus,
    dropDownKey = 'more',
    ...props
  }: TableActionsProps) => {
    const showActionNum = 4;
    const menu = useMemo(
      () => (
        <Menu
          // @ts-ignore  这里类型比较复杂，目前只需要 MenuItemProps
          items={menus
            ?.slice(showActionNum - 1)
            ?.map(m => ({ ...m, 'aria-label': m.key }))}
        />
      ),
      [menus],
    );

    const renderButton = (menuList: MenuType[]) => (
      <>
        {menuList.map((m, index) => (
          // @ts-ignore  fix aria-label 属性不支持
          <Fragment key={m?.key}>
            {index > 0 && <span className={style.divider} />}
            <Button
              onClick={ev => m?.onClick?.(ev as unknown as MouseEvent)}
              type='link'
              disabled={m?.disabled}
              {...(buttonProps?.[index] || {})}
              aria-label={m?.key}
            >
              {m?.label}
            </Button>
          </Fragment>
        ))}
      </>
    );

    if (menus.length <= showActionNum) {
      return <div className={style.actionsWrapper}>{renderButton(menus)}</div>;
    }

    return (
      <div className={style.actionsWrapper}>
        {renderButton(menus.slice(0, showActionNum - 1))}
        <span className={style.divider} />
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
            {buttonName || I18N.utils.more}
            <IconFont icon='icon-icon-zhankai' />
          </Button>
        </Dropdown>
      </div>
    );
  },
);
