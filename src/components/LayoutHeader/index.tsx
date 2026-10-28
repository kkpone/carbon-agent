/**
 * @file header & side menu 顶部导航
 */
import { useSelector } from 'react-redux';
import classnames from 'classnames';
import './index.less';
import { FC } from 'react';
import { RootState } from '@src/store';
import LayoutNavBar from '../LayoutNavBar';

export const LayoutHeader: FC<{
  showAvatar?: boolean;
}> = ({ showAvatar }) => {
  const selector = useSelector<RootState, RootState>(state => state);
  const { layout, theme, fixedHeader, contentWidth } = selector.settings;

  const { sidebar } = selector.app;
  const menus = selector.Nav;

  return (
    <header
      className={classnames(
        'layout__header',
        `layout__header--${layout}`,
        `layout__header--${theme}`,
        {
          'layout__header--fix': fixedHeader,
          // close 情况只有在 layout 为 side 的时候存在
          'layout__header--close': !sidebar.opened && layout === 'side',
        },
      )}
    >
      <div
        className={classnames('layout__header__inner', {
          [`layout__header__inner--${contentWidth}`]: layout === 'top',
        })}
      >
        {layout === 'top' && (
          <div className='layout__header--top-side-bar'>
            {/* <LayoutSideBar /> */}
          </div>
        )}
        {/* key 路由变化后该组件要重写渲染 */}
        <LayoutNavBar
          menu={menus}
          key={window.location.pathname}
          showAvatar={showAvatar}
        />
      </div>
    </header>
  );
};
