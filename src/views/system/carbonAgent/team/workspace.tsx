import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Result, Select, Space, Spin, message } from 'antd';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import type { SwitchoverCompanyData } from '@/api/types';
import { withCurrentLocalePrefix } from '@/router/localePath';
import store, { RootState } from '@/store';
import { SET_COMPANY_USER_INFO } from '@/store/actionTypes';
import { COMPANY_ID } from '@/utils/consts';
import { getLoginStorage, isFeishuSession } from '@/utils/feishuSession';

import { teamApi, teamRequest, subscribeTeamManagementDenied } from './api';
import { errorCode, errorText, reasonText } from './errors';
import { AGENT_PATH, TEAM_PATH } from './helpers';
import { teamText } from './i18n';
import type { Workspace } from './types';

const WorkspaceContext = createContext<{
  access?: Workspace;
  personal: boolean;
  key: string[];
  switchSpace: (id: string, destination?: string) => Promise<void>;
  refresh: () => void;
}>({
  personal: true,
  key: ['agent-team', 'anonymous'],
  switchSpace: async () => {},
  refresh: () => {},
});
export const useWorkspace = () => useContext(WorkspaceContext);

const WorkspaceSession = ({
  children,
  management = false,
}: {
  children: ReactNode;
  management?: boolean;
}) => {
  const login = useSelector((state: RootState) => state.companyUserInfo);
  const client = useQueryClient();
  const history = useHistory();
  const [switching, setSwitching] = useState(false);
  const [managementDenied, setManagementDenied] = useState(false);
  useEffect(() => {
    if (!management) return undefined;
    return subscribeTeamManagementDenied(() => setManagementDenied(true));
  }, [management]);
  const switchLock = useRef(false);
  const companyId = String(login.userInfo?.companyId || login.companyId || '');
  const userId = String(login.userInfo?.userId || '');
  const key = useMemo(
    () => ['agent-team', userId, companyId],
    [userId, companyId],
  );
  const access = useQuery(
    [...key, 'access'],
    ({ signal }) => teamApi.access(signal),
    { enabled: !!login.access_token, retry: false, staleTime: 15000 },
  );
  const refresh = useCallback(() => {
    client.invalidateQueries({ queryKey: key });
  }, [client, key]);
  const switchSpace = useCallback(
    async (id: string, destination = AGENT_PATH) => {
      if (switchLock.current) return;
      switchLock.current = true;
      setSwitching(true);
      try {
        await client.cancelQueries();
        const next = await teamRequest<SwitchoverCompanyData>(
          '/auth/token/switchoverCompany',
          {
            method: 'POST',
            data: {
              companyId: id,
              userId: String(login.userInfo?.userId || ''),
              ...(destination === TEAM_PATH ||
              destination.startsWith(`${TEAM_PATH}/`)
                ? { purpose: 'TEAM_MANAGEMENT' }
                : {}),
            },
          },
        );
        if (!next.access_token) throw new Error('AGENT_LOGIN_REQUIRED');
        // 一次替换整份组织登录结果，不能合并旧权限或截取 token。
        getLoginStorage().setItem(
          COMPANY_ID,
          String(next.userInfo?.companyId || next.companyId || id),
        );
        client.clear();
        history.replace(destination);
        store.dispatch({ type: 'agent/replaceWorkspaceLogin', payload: next });
        switchLock.current = false;
        setSwitching(false);
      } catch (error) {
        message.error(errorText(error));
        switchLock.current = false;
        setSwitching(false);
      }
    },
    [client, login.userInfo?.userId, history],
  );
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (isFeishuSession() || event.key !== SET_COMPANY_USER_INFO) return;
      // 另一个标签页切换后立即卸载当前业务，重新读取持久化登录态。
      if (event.newValue !== JSON.stringify(login)) {
        setSwitching(true);
        window.location.replace(withCurrentLocalePrefix(AGENT_PATH));
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [login]);
  // Context identity changes only with the current session and access query.
  const context = useMemo(
    () => ({
      access: access.data,
      personal: !access.data || access.data.workspaceType === 'PERSONAL',
      key,
      switchSpace,
      refresh,
    }),
    [access.data, key, switchSpace, refresh],
  );
  if (switching || (login.access_token && access.isLoading))
    return (
      <div style={{ padding: 80, textAlign: 'center' }}>
        <Spin />
        <p>
          {switching
            ? teamText('switchingWorkspaces')
            : teamText('loadingWorkspace')}
        </p>
      </div>
    );
  const forbidden =
    management &&
    (managementDenied ||
      errorCode(access.error) === 'AGENT_TEAM_MANAGEMENT_FORBIDDEN' ||
      (!!access.data && !access.data.canManage));
  if (login.access_token && access.isError && !forbidden)
    return (
      <Result
        status='warning'
        title={teamText('unableToCheckWorkspaceAccess')}
        subTitle={errorText(access.error)}
        extra={
          <Button onClick={() => access.refetch()}>{teamText('retry')}</Button>
        }
      />
    );
  return (
    <WorkspaceContext.Provider value={context}>
      {forbidden ? (
        <TeamManagementDenied />
      ) : !management && access.data && !access.data.canEnter ? (
        <Result
          status='403'
          title={reasonText(access.data.reasonCode)}
          extra={<WorkspaceSwitcher />}
        />
      ) : (
        children
      )}
    </WorkspaceContext.Provider>
  );
};
export const TeamManagementDenied = () => {
  const history = useHistory();
  return (
    <Result
      status='403'
      title={teamText('youDoNotHavePermissionToManage')}
      extra={
        <Space wrap>
          <Button onClick={() => history.replace(AGENT_PATH)}>
            {teamText('backToAgent')}
          </Button>
          <WorkspaceSwitcher management />
        </Space>
      }
    />
  );
};
export const WorkspaceProvider = ({
  children,
  management = false,
}: {
  children: ReactNode;
  management?: boolean;
}) => {
  const token = useSelector(
    (state: RootState) => state.companyUserInfo.access_token,
  );
  return (
    <WorkspaceSession key={token || 'anonymous'} management={management}>
      {children}
    </WorkspaceSession>
  );
};
export const WorkspaceSwitcher = ({
  compact = false,
  management = false,
}: {
  compact?: boolean;
  management?: boolean;
}) => {
  const { access, key, switchSpace } = useWorkspace();
  const spaces = useQuery(
    [...key, 'workspaces'],
    ({ signal }) => teamApi.workspaces(signal),
    { enabled: !!key[1] && key[1] !== 'anonymous', retry: false },
  );
  if (spaces.isError)
    return (
      <Button size='small' onClick={() => spaces.refetch()}>
        {teamText('retryWorkspaceList')}
      </Button>
    );
  return (
    <Select
      aria-label={teamText('switchPersonalOrTeamWorkspace')}
      placeholder={teamText('switchPersonalOrTeamWorkspace')}
      style={
        compact
          ? { width: 'auto', maxWidth: '100%' }
          : { width: '100%', minWidth: 130, maxWidth: 260 }
      }
      value={access ? String(access.companyId) : undefined}
      loading={spaces.isLoading}
      onChange={id => {
        const space = spaces.data?.find(item => String(item.companyId) === id);
        switchSpace(
          id,
          management && space?.canManage ? TEAM_PATH : AGENT_PATH,
        );
      }}
      options={(spaces.data || []).map(space => ({
        value: String(space.companyId),
        disabled: !(space.canEnter || (management && space.canManage)),
        label: `${space.companyName} · ${
          space.workspaceType === 'PERSONAL'
            ? teamText('personal')
            : teamText('team')
        }${
          space.canEnter || (management && space.canManage)
            ? ''
            : `（${reasonText(space.reasonCode)}）`
        }`,
      }))}
    />
  );
};
export const WorkspaceNotice = () => {
  const { access, refresh } = useWorkspace();
  if (!access || access.canUseAi) return null;
  const reason = access.aiReasonCode || access.reasonCode;
  const expired = reason === 'AGENT_TEAM_EXPIRED';
  return (
    <Alert
      style={{ margin: '8px 16px' }}
      type='warning'
      showIcon
      message={reasonText(reason)}
      action={
        <Space>
          <Button size='small' onClick={refresh}>
            {teamText('refreshAccess')}
          </Button>
          {access.canManage && (
            <Button
              size='small'
              onClick={() =>
                window.open(
                  withCurrentLocalePrefix(
                    `${TEAM_PATH}/${
                      expired ? 'purchase?action=RENEW' : 'overview'
                    }`,
                  ),
                  '_blank',
                  'noopener,noreferrer',
                )
              }
            >
              {expired
                ? teamText('renewSubscription')
                : teamText('teamManagement')}
            </Button>
          )}
        </Space>
      }
    />
  );
};
