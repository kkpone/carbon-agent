import { useMemo, memo } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Routes } from '../router/config';
import Auth from './Auth';
import { businessRouteList } from '../router/utils';

function renderRoute(route: Routes) {
  const { component: Component } = route;

  return (
    <Route
      key={route.path}
      exact={route.path !== '*'}
      path={route.path}
      render={props => (
        <Auth {...props} route={route}>
          {/* @ts-ignore */}
          <Component {...props} />
        </Auth>
      )}
    />
  );
}

function renderRouteList(): React.ReactNode[] {
  const result: React.ReactNode[] = [];

  businessRouteList.forEach((child: Routes) => {
    result.push(renderRoute(child));
  });

  return result;
}

const MainRoutes = () => {
  const routeList = useMemo(() => renderRouteList(), []);

  return <Switch>{routeList}</Switch>;
};

export default memo(MainRoutes);
