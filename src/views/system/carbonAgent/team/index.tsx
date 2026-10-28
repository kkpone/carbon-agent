import { ArrowLeftOutlined } from '@ant-design/icons';
import { createI18nLabelMap } from '@src/lang/createI18nLabelMap';
import { useQuery } from '@tanstack/react-query';
import { Button, ConfigProvider, Menu, Result } from 'antd';
import { useContext, useState } from 'react';
import {
  Link,
  Redirect,
  Route,
  Switch,
  useHistory,
  useRouteMatch,
} from 'react-router-dom';

import { LocaleContext } from '@/components/LocaleProvider';
import { useMobile } from '@/hooks/use-mobile';

import { Finance } from './Finance';
import { Members } from './Members';
import { Points } from './Points';
import { Purchase } from './Purchase';
import { AuditPage, ExecutionsPage, Overview, Profile } from './Reports';
import { teamApi } from './api';
import { errorCode } from './errors';
import logo from './assets/logo.svg';
import navaudit from './assets/nav-audit.svg';
import navCollapse from './assets/nav-collapse.svg';
import navmembers from './assets/nav-members.svg';
import navmonitor from './assets/nav-monitor.svg';
import navoverview from './assets/nav-overview.svg';
import navprofile from './assets/nav-profile.svg';
import navquota from './assets/nav-quota.svg';
import workspaceOrg from './assets/workspace-org.svg';
import { AGENT_PATH, TEAM_PATH, dateText } from './helpers';
import { teamText } from './i18n';
import style from './team.module.less';
import {
  TeamManagementDenied,
  WorkspaceProvider,
  WorkspaceSwitcher,
  useWorkspace,
} from './workspace';

const pages = createI18nLabelMap({
  overview: () => teamText('overview'),
  members: () => teamText('members'),
  seats: () => teamText('seatManagement'),
  points: () => teamText('pointsManagement'),
  finance: () => teamText('orders'),
  profile: () => teamText('companyInformation'),
  executions: () => teamText('executionOverview'),
  audit: () => teamText('auditLogs'),
  purchase: () => teamText('teamPurchase'),
});
const SeatManagement = () => <Members seats />;
const pageComponents = {
  overview: Overview,
  members: Members,
  seats: SeatManagement,
  points: Points,
  finance: Finance,
  profile: Profile,
  executions: ExecutionsPage,
  audit: AuditPage,
  purchase: Purchase,
};
type TeamPageKey = keyof typeof pages;

const TeamContent = () => {
  const { locale } = useContext(LocaleContext);
  const { access, personal, key } = useWorkspace();
  const history = useHistory();
  const match = useRouteMatch<{ page: string }>({
    path: `${TEAM_PATH}/:page`,
    exact: true,
  });
  const mobile = useMobile();
  const [collapsed, setCollapsed] = useState(false);
  const summary = useQuery([...key, 'summary'], teamApi.summary, {
    enabled: !!access?.canManage,
  });
  const suffix = match?.params.page || '';
  const page = Object.prototype.hasOwnProperty.call(pages, suffix)
    ? (suffix as TeamPageKey)
    : undefined;
  const needsActivation =
    !personal &&
    access?.canManage &&
    (access.reasonCode === 'AGENT_TEAM_NOT_ENABLED' ||
      summary.data?.subscriptionStatus === 'NOT_ENABLED');
  const back = (
    <Button
      aria-label={teamText('backToAgent')}
      title={collapsed ? teamText('backToAgent') : undefined}
      icon={collapsed ? <ArrowLeftOutlined /> : undefined}
      onClick={() => history.replace(AGENT_PATH)}
    >
      {collapsed ? null : teamText('backToAgent')}
    </Button>
  );
  if (!access)
    return <Result title={teamText('signInToAgentFirst')} extra={back} />;
  if (
    !access.canManage ||
    errorCode(summary.error) === 'AGENT_TEAM_MANAGEMENT_FORBIDDEN'
  )
    return <TeamManagementDenied />;
  if (mobile)
    return (
      <Result
        title={teamText('useADesktopBrowserToPurchaseAnd')}
        subTitle={teamText('onMobileYouCanSwitchWorkspacesView')}
        extra={back}
      />
    );
  const navIcon = (src: string) => (
    <span className={style.navIcon}>
      <img src={src} alt='' />
    </span>
  );
  const item = (value: keyof typeof pages, label = pages[value]) => ({
    key: value,
    label: <Link to={`${TEAM_PATH}/${value}`}>{label}</Link>,
    ...(value === 'overview'
      ? { icon: navIcon(navoverview), className: style.overviewNavItem }
      : {}),
  });
  return (
    <div className={style.shell} lang={locale}>
      <aside className={`${style.nav} ${collapsed ? style.navCollapsed : ''}`}>
        <div className={style.navBrand}>
          {!collapsed && (
            <Link
              className={style.brandLink}
              to={AGENT_PATH}
              aria-label={teamText('backToAgent')}
              title={teamText('backToAgent')}
            >
              <img src={logo} alt='Carbon Agent' />
            </Link>
          )}
          <button
            type='button'
            aria-label={
              collapsed
                ? teamText('expandNavigation')
                : teamText('collapseNavigation')
            }
            onClick={() => setCollapsed(!collapsed)}
          >
            <img src={navCollapse} alt='' />
          </button>
        </div>
        <Menu
          mode='inline'
          inlineCollapsed={collapsed}
          inlineIndent={12}
          defaultOpenKeys={[
            'members-group',
            'quota-group',
            'profile-group',
            'monitor-group',
            'audit-group',
          ]}
          selectedKeys={page ? [page] : []}
          onClick={({ key: selected, domEvent }) => {
            // Links handle normal clicks; collapsed icons and menu keyboard
            // activation still need client-side navigation.
            if (
              !domEvent.defaultPrevented &&
              !domEvent.metaKey &&
              !domEvent.ctrlKey &&
              !domEvent.shiftKey &&
              !domEvent.altKey &&
              selected !== page
            )
              history.push(`${TEAM_PATH}/${selected}`);
          }}
          items={[
            item('overview'),
            ...(!personal
              ? [
                  {
                    key: 'members-group',
                    icon: navIcon(navmembers),
                    label: teamText('menuUsers'),
                    children: [item('members')],
                  },
                  {
                    key: 'quota-group',
                    icon: navIcon(navquota),
                    label: teamText('quotaManagement'),
                    children: [
                      item('seats', teamText('menuSeats')),
                      item('points', teamText('menuPoints')),
                      item('finance'),
                    ],
                  },
                  {
                    key: 'profile-group',
                    icon: navIcon(navprofile),
                    label: teamText('companySettings'),
                    children: [item('profile', teamText('menuCompany'))],
                  },
                  {
                    key: 'monitor-group',
                    icon: navIcon(navmonitor),
                    label: teamText('monitoring'),
                    children: [item('executions', teamText('menuExecutions'))],
                  },
                  {
                    key: 'audit-group',
                    icon: navIcon(navaudit),
                    label: teamText('logManagement'),
                    children: [item('audit')],
                  },
                ]
              : []),
          ]}
        />
      </aside>
      <div className={style.main}>
        <header className={style.topbar}>
          {collapsed && (
            <Link
              className={style.agentBackLink}
              to={AGENT_PATH}
              aria-label={teamText('backToAgent')}
              title={teamText('backToAgent')}
            >
              <ArrowLeftOutlined />
            </Link>
          )}
          <span className={style.breadcrumb}>
            {access.companyName} {teamText('adminConsole2')}{' '}
            <strong>{page ? pages[page] : teamText('pageNotFound')}</strong>
          </span>
          <span className={style.expiry}>
            {teamText('companySubscriptionValidUntil')}
            {dateText(summary.data?.validToExclusive, true)}
          </span>
          <div className={style.headerWorkspace}>
            <img src={workspaceOrg} alt='' />
            <WorkspaceSwitcher compact management />
          </div>
        </header>
        <main
          className={`${style.content} ${
            page === 'purchase' ? style.purchasePage : ''
          }`}
        >
          <Switch>
            <Redirect
              exact
              from={TEAM_PATH}
              to={
                needsActivation
                  ? `${TEAM_PATH}/purchase?action=OPEN`
                  : `${TEAM_PATH}/overview`
              }
            />
            {needsActivation && (
              <Redirect
                exact
                from={`${TEAM_PATH}/overview`}
                to={`${TEAM_PATH}/purchase?action=OPEN`}
              />
            )}
            {(Object.keys(pages) as TeamPageKey[]).map(routePage => (
              <Route
                key={routePage}
                exact
                path={`${TEAM_PATH}/${routePage}`}
                component={
                  personal && routePage !== 'purchase'
                    ? Overview
                    : pageComponents[routePage]
                }
              />
            ))}
            <Route>
              <Result
                status='404'
                title={teamText('pageNotFound')}
                extra={
                  <Link to={`${TEAM_PATH}/overview`}>
                    {teamText('backToOverview')}
                  </Link>
                }
              />
            </Route>
          </Switch>
        </main>
      </div>
    </div>
  );
};
export default function TeamPage() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#026961',
          colorText: '#04252b',
          colorTextSecondary: '#6c757d',
          colorBorder: '#d5d7da',
          borderRadius: 8,
          controlHeight: 38,
          fontSize: 14,
        },
        components: {
          Button: { primaryColor: '#fff', primaryShadow: 'none' },
          Table: {
            cellPaddingBlock: 10,
            cellPaddingInline: 20,
            headerBg: '#f7f8f9',
          },
          Menu: {
            collapsedWidth: 56,
            collapsedIconSize: 16,
            itemHeight: 36,
            itemMarginInline: 0,
            subMenuItemBg: 'transparent',
            itemSelectedBg: 'rgba(0,0,0,0.05)',
            itemSelectedColor: '#04252b',
          },
        },
      }}
    >
      <WorkspaceProvider management>
        <TeamContent />
      </WorkspaceProvider>
    </ConfigProvider>
  );
}
