import I18N from '@src/lang/I18N';
import {
  buildLocaleSwitchPath,
  type LocaleRouteCode,
} from '@src/router/localePath';
import { RouteMaps } from '@src/router/route-paths';
import { SET_COMPANY_USER_INFO } from '@src/store/actionTypes';
import type { CompanyUserInfoAction } from '@src/store/module/user';
import { Button, Result, Spin } from 'antd';
import { useEffect, useState } from 'react';

import { switchoverCompany } from '@/api/api';
import { COMPANY_ID } from '@/utils/consts';
import { getLoginStorage } from '@/utils/feishuSession';

import style from './index.module.less';
import { exchangeAgentSsoTicket } from './service';
import store from '../../../store';

type CallbackStatus = 'exchanging' | 'failed';

let activeExchange:
  | {
      promise: ReturnType<typeof exchangeAgentSsoTicket>;
      ticket: string;
    }
  | undefined;

const exchangeOnce = (ticket: string) => {
  if (!activeExchange || activeExchange.ticket !== ticket) {
    activeExchange = {
      promise: exchangeAgentSsoTicket(ticket),
      ticket,
    };
  }

  return activeExchange.promise;
};

const takeTicketFromHash = () => {
  const ticket = new URLSearchParams(window.location.hash.slice(1)).get(
    'ticket',
  );

  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${window.location.search}`,
  );

  return ticket?.trim() || '';
};

const getSsoLocaleRouteCode = (lang?: string): LocaleRouteCode => {
  const normalizedLang = lang?.toLowerCase();

  if (normalizedLang === 'en') {
    return 'en';
  }
  if (normalizedLang === 'zt') {
    return 'zt';
  }
  return 'zh';
};

const AgentSsoCallback = () => {
  const [status, setStatus] = useState<CallbackStatus>('exchanging');

  useEffect(() => {
    let cancelled = false;
    const ticket = takeTicketFromHash();

    if (!ticket) {
      setStatus('failed');
      return () => {
        cancelled = true;
      };
    }

    exchangeOnce(ticket)
      .then(async response => {
        const result = response.data;

        if (result.code !== 200 || !result.data?.access_token) {
          throw new Error('AGENT_SSO_EXCHANGE_FAILED');
        }

        if (cancelled) {
          return;
        }

        const teamManagement = result.data.destination === 'TEAM_MANAGEMENT';
        const targetCompanyId = String(
          result.data.targetCompanyId ?? '',
        ).trim();
        if (teamManagement && !targetCompanyId) {
          throw new Error('AGENT_SSO_TARGET_REQUIRED');
        }

        store.dispatch<CompanyUserInfoAction>({
          payload: result.data,
          type: teamManagement
            ? 'agent/replaceWorkspaceLogin'
            : SET_COMPANY_USER_INFO,
        });
        if (teamManagement) {
          const switched = await switchoverCompany({
            companyId: targetCompanyId,
            userId: result.data.userInfo.userId,
            purpose: 'TEAM_MANAGEMENT',
          });
          if (switched.data.code !== 200 || !switched.data.data?.access_token) {
            throw new Error('AGENT_SSO_SWITCH_FAILED');
          }
          if (cancelled) return;
          const login = switched.data.data;
          if (
            String(login.userInfo?.companyId ?? login.companyId ?? '') !==
            targetCompanyId
          ) {
            throw new Error('AGENT_SSO_TARGET_MISMATCH');
          }
          getLoginStorage().setItem(COMPANY_ID, targetCompanyId);
          store.dispatch<CompanyUserInfoAction>({
            type: 'agent/replaceWorkspaceLogin',
            payload: login,
          });
        }
        window.location.replace(
          buildLocaleSwitchPath(getSsoLocaleRouteCode(result.data.lang), {
            hash: '',
            pathname: teamManagement
              ? RouteMaps.carbonAgentTeam
              : RouteMaps.carbonAgent,
            search: '',
          }),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('failed');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const returnToCarbonCloud = () => {
    const carbonCloudUrl = process.env.REACT_APP_SAAS_URL?.trim().replace(
      /\/+$/,
      '',
    );

    if (carbonCloudUrl) {
      window.location.replace(`${carbonCloudUrl}/work/index`);
      return;
    }

    window.history.back();
  };

  return (
    <main className={style.page}>
      <section className={style.panel} aria-live='polite'>
        {status === 'exchanging' ? (
          <div className={style.loading}>
            <Spin size='large' />
            <div>
              <h1>{I18N.carbonAgent.ssoSigningIn}</h1>
              <p>{I18N.carbonAgent.ssoSigningInHint}</p>
            </div>
          </div>
        ) : (
          <Result
            status='warning'
            title={I18N.carbonAgent.ssoFailedTitle}
            subTitle={I18N.carbonAgent.ssoFailedHint}
            extra={
              <Button type='primary' onClick={returnToCarbonCloud}>
                {I18N.carbonAgent.returnToCarbonCloud}
              </Button>
            }
          />
        )}
      </section>
    </main>
  );
};

export default AgentSsoCallback;
