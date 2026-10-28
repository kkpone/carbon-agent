/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  SUPPLY_LOGIN_IDENTIFIER,
  SUPPLY_REGISTER_MOBILE_IDENTIFIER,
  SUPPLY_TO_TASK,
} from '@src/config';
import { RouteMaps } from '@src/router/route-paths';
import { useLayoutEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { acceptInvitation } from './service';

export default () => {
  const history = useHistory();

  useLayoutEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    const supplyTicket = searchParams.get(SUPPLY_LOGIN_IDENTIFIER);

    const mobile = searchParams.get(SUPPLY_REGISTER_MOBILE_IDENTIFIER);

    const toTask = searchParams.get(SUPPLY_TO_TASK);

    history.push({
      pathname: RouteMaps.login,
      search: `${SUPPLY_LOGIN_IDENTIFIER}=${supplyTicket}&${SUPPLY_REGISTER_MOBILE_IDENTIFIER}=${
        mobile ?? ''
      }&${SUPPLY_TO_TASK}=${toTask ?? ''}`,
    });
    // if (supplyTicket) {
    //   acceptInvitation({ supplyTicket })
    //     .then(() => {
    //       history.push({
    //         pathname: RouteMaps.login,
    //         search: `${SUPPLY_LOGIN_IDENTIFIER}=${supplyTicket}&${SUPPLY_REGISTER_MOBILE_IDENTIFIER}=${
    //           mobile ?? ''
    //         }&${SUPPLY_TO_TASK}=${toTask ?? ''}`,
    //       });
    //     })
    //     .catch(err => {
    //       history.push(RouteMaps.login);
    //       throw err;
    //     });
    // } else {
    //   history.push(RouteMaps.login);
    // }
  }, [history]);

  return null;
};
