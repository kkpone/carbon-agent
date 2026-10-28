import I18N from '@src/lang/I18N';
import type { RootState } from '@src/store';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';

import { retainSelectedCompanies } from './data';
import {
  enterpriseError,
  fetchEntitlement,
  fetchFollows,
  setFollow,
} from './service';
import type { EnterpriseConfirmation, EnterpriseFollow } from './types';

type ProviderProps = {
  children: ReactNode;
  enabled: boolean;
  active: boolean;
  onConfirm: (confirmation: EnterpriseConfirmation) => Promise<void>;
  onOpen: (companyId: string) => void;
};

const useEnterpriseStore = (
  enabled: boolean,
  active: boolean,
  scope: string,
) => {
  const client = useQueryClient();
  const key = ['enterpriseData', scope];
  const follows = useQuery({
    queryKey: [...key, 'follows'],
    queryFn: ({ signal }) => fetchFollows(signal),
    enabled: enabled && active,
    retry: false,
    staleTime: 30000,
  });
  const entitlement = useQuery({
    queryKey: [...key, 'entitlement'],
    queryFn: ({ signal }) => fetchEntitlement(signal),
    enabled: enabled && active,
    retry: false,
    staleTime: 30000,
  });
  const pendingRef = useRef(new Set<string>());
  const [pending, setPending] = useState<string[]>([]);
  const [filter, setFilter] = useState('');
  const [view, setView] = useState('cards');
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  useEffect(() => {
    if (!follows.isSuccess || !entitlement.isSuccess) return;
    const records = follows.data;
    const { compareLimit } = entitlement.data;
    setSelectedCompanyIds(current =>
      retainSelectedCompanies(current, records, compareLimit),
    );
  }, [
    follows.data,
    follows.isSuccess,
    entitlement.data,
    entitlement.isSuccess,
  ]);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      client.cancelQueries({ queryKey: ['enterpriseData', scope] });
      client.removeQueries({ queryKey: ['enterpriseData', scope] });
    };
  }, [client, scope]);
  const refresh = async () => {
    const results = await Promise.all([
      follows.refetch(),
      entitlement.refetch(),
    ]);
    return results.every(result => !result.isError);
  };
  const mutateFollow = async (companyId: string, next: boolean) => {
    if (!enabled || pendingRef.current.has(companyId)) return;
    pendingRef.current.add(companyId);
    setPending([...pendingRef.current]);
    try {
      await setFollow(companyId, next);
      if (!alive.current) return;
      if (!next) {
        client.setQueryData<EnterpriseFollow[]>([...key, 'follows'], current =>
          current?.filter(item => item.enterpriseId !== companyId),
        );
      }
      if (!(await refresh()))
        message.warning(I18N.enterpriseData.refreshFailed);
    } catch (error) {
      if (!alive.current) return;
      message.error(enterpriseError(error));
      await refresh();
    } finally {
      pendingRef.current.delete(companyId);
      if (alive.current) setPending([...pendingRef.current]);
    }
  };
  return {
    scope,
    enabled,
    follows,
    entitlement,
    pending,
    refresh,
    mutateFollow,
    filter,
    setFilter,
    view,
    setView,
    selectedCompanyIds,
    setSelectedCompanyIds,
  };
};

type EnterpriseContextValue = ReturnType<typeof useEnterpriseStore> &
  Pick<ProviderProps, 'onConfirm' | 'onOpen'>;
const EnterpriseContext = createContext<EnterpriseContextValue | null>(null);

const ScopedProvider = ({
  children,
  enabled,
  active,
  scope,
  onConfirm,
  onOpen,
}: ProviderProps & { scope: string }) => {
  const state = useEnterpriseStore(enabled, active, scope);
  const value = useMemo(
    () => ({ ...state, onConfirm, onOpen }),
    [state, onConfirm, onOpen],
  );
  return (
    <EnterpriseContext.Provider value={value}>
      {children}
    </EnterpriseContext.Provider>
  );
};

export const EnterpriseDataProvider = (props: ProviderProps) => {
  const identity = useSelector<RootState, RootState['companyUserInfo']>(
    state => state.companyUserInfo,
  );
  const scope = `${props.enabled ? 'active' : 'readonly'}:${
    identity.userInfo?.userId ?? ''
  }:${identity.userInfo?.companyId ?? ''}`;
  return <ScopedProvider {...props} key={scope} scope={scope} />;
};

export const useEnterpriseData = () => {
  const value = useContext(EnterpriseContext);
  if (!value) throw new Error('EnterpriseDataProvider is required');
  return value;
};
