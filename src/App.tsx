import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Spin } from 'antd';
import moment from 'moment';
import { Suspense, useEffect } from 'react';
import type { ReactElement, ReactNode } from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Switch,
  Route,
  withRouter,
} from 'react-router-dom';
import type { RouteComponentProps } from 'react-router-dom';

import style from './app.module.less';
import { AICarbonFloatingProvider } from './components/AICarbonFloating/AICarbonContext';
import ConditionalAICarbonFloating from './components/AICarbonFloating/ConditionalAICarbonFloating';
import { GlobalLoginModalProvider } from './components/GlobalLoginModal';
import { TrialUpgradeModalProvider } from './components/TrialUpgradeModal';
import { getLocaleRouterBasename } from './router/localePath';
import { RouteMaps } from './router/route-paths';
import { RouteMapsCorbonFootprint3 } from './router/route-paths/corbonFootprint3';
import { layoutRouteList, useGetStatisticInfo } from './router/utils';
import { SET_COMPANY_USER_INFO } from './store/actionTypes';
import { getStatisticsRequest } from './utils/statistics';
import { isFeishuSession } from './utils/feishuSession';

/**
 * 项目中 moment 使用太多了。一时半会迁移不了，所以使用了 @ant-design/moment-webpack-plugin
 * 但是 ant-design-pro 中引用 dayjs 做了一个 dayjs.extend() 的操作， moment.extend() 是不存在的,所以这里做了一个空函数，以免报错。迁移到 dayjs 后可以删除
 */
(moment as any).extend = function () {};
(moment as any).isDayjs = function () {
  return false;
};

const queryClient = new QueryClient();
const AGENT_HOSTS = [
  'agenttest.carbonstop.com',
  'agent.carbonstop.com',
  'agent-pre.carbonstop.com',
  'kkpone.github.io',
];
const AGENT_SHARE_ALLOWED_HOSTS = [
  'agenttest.carbonstop.com',
  'agent.carbonstop.com',
  'agent-pre.carbonstop.com',
  'kkpone.github.io',
];
const AGENT_SHARE_ALLOWED_PATHS: string[] = [
  RouteMaps.carbonAgentOAuthAuthorize,
  RouteMaps.carbonAgentDeviceAuthorize,
  RouteMaps.carbonAgentSsoCallback,
  RouteMaps.carbonAgentFeishuSimulator,
  RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountShareLogin,
  RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountShare,
  RouteMaps.enterpriseCarbonAccountingcarbonDischargeShare,
  RouteMaps.enterpriseCarbonAccountingAccountingShare,
  '/agreement',
];
const AGENT_SHARE_ALLOWED_PATH_PREFIXES = ['/share/agent/', '/factors/'];
const AGENT_PROJECT_INVITE_PATH_PREFIX =
  RouteMaps.carbonAgentProjectInvite.replace(':inviteCode', '');

const getStoredAccessToken = (storageValue: string | null) => {
  if (!storageValue) {
    return '';
  }

  try {
    const parsed = JSON.parse(storageValue) as unknown;

    if (
      parsed &&
      typeof parsed === 'object' &&
      'access_token' in parsed &&
      typeof parsed.access_token === 'string'
    ) {
      return parsed.access_token;
    }
  } catch {
    // Ignore incomplete storage writes and wait for the next event.
  }

  return '';
};

function isAllowedAgentPath(pathname: string) {
  if (
    pathname === RouteMaps.carbonAgent ||
    pathname === '/system/carbonAgent/team' ||
    pathname.startsWith('/system/carbonAgent/team/')
  ) {
    return true;
  }

  return (
    AGENT_SHARE_ALLOWED_HOSTS.includes(window.location.hostname) &&
    (AGENT_SHARE_ALLOWED_PATHS.includes(pathname) ||
      pathname.startsWith(AGENT_PROJECT_INVITE_PATH_PREFIX) ||
      AGENT_SHARE_ALLOWED_PATH_PREFIXES.some(pathPrefix =>
        pathname.startsWith(pathPrefix),
      ))
  );
}

const AgentTestDomainGuard = withRouter(
  ({
    children,
    location,
  }: RouteComponentProps & {
    children: ReactNode;
  }) => {
    const pathname = location.pathname.replace(/\/$/, '') || '/';

    if (
      AGENT_HOSTS.includes(window.location.hostname) &&
      !isAllowedAgentPath(pathname)
    ) {
      return (
        <Redirect
          to={{
            pathname: RouteMaps.carbonAgent,
            search: location.search,
          }}
        />
      );
    }

    return children as ReactElement;
  },
);

/** 记录统计数据 */
const CatchRouterChange = withRouter(() => {
  const [statisticValue, location] = useGetStatisticInfo();
  useEffect(() => {
    const request = getStatisticsRequest();

    request({ data: statisticValue });
  }, [location]);
  return null;
});

function App() {
  const routerBasename = getLocaleRouterBasename();

  useEffect(() => {
    const syncLoginAcrossTabs = (event: StorageEvent) => {
      if (isFeishuSession()) return;
      if (
        event.key === SET_COMPANY_USER_INFO &&
        getStoredAccessToken(event.oldValue) !==
          getStoredAccessToken(event.newValue)
      ) {
        window.location.reload();
      }
    };

    window.addEventListener('storage', syncLoginAcrossTabs);
    return () => window.removeEventListener('storage', syncLoginAcrossTabs);
  }, []);

  return (
    <Suspense
      fallback={
        <div className={style.center}>
          <Spin delay={200} size='large' />
        </div>
      }
    >
      {/* <AntdApp> */}
      <QueryClientProvider client={queryClient}>
        <GlobalLoginModalProvider>
          <TrialUpgradeModalProvider>
            <AICarbonFloatingProvider>
              <Router basename={routerBasename}>
                <AgentTestDomainGuard>
                  <Switch>
                    {layoutRouteList.map(route => (
                      <Route
                        key={route.path}
                        path={route.path}
                        // 显式布局路由允许子路径，其余路由沿用原有匹配规则。
                        exact={route.exact ?? route.path !== '/'}
                        component={route.component}
                      />
                    ))}
                  </Switch>
                  <CatchRouterChange />
                  <ConditionalAICarbonFloating />
                </AgentTestDomainGuard>
              </Router>
            </AICarbonFloatingProvider>
          </TrialUpgradeModalProvider>
        </GlobalLoginModalProvider>
      </QueryClientProvider>
      {/* </AntdApp> */}
    </Suspense>
  );
}

export default App;
