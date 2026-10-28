import { useEffect, useMemo, useRef, useState } from 'react';

import { loadProductCarbonCertificateApplications } from './data';
import type { ProductCarbonCertificateApplication } from './types';

type AccountApplicationState = {
  error?: unknown;
  rows: ProductCarbonCertificateApplication[];
  status: 'loading' | 'loaded' | 'error';
};

export function useProductCarbonCertificateApplications({
  accountIdsKey,
  enabled,
  open,
  sessionKey,
}: {
  accountIdsKey: string;
  enabled: boolean;
  open: boolean;
  sessionKey: string;
}) {
  const cacheRef = useRef(new Map<string, AccountApplicationState>());
  const cacheSessionRef = useRef(sessionKey);
  const generationRef = useRef(0);
  const pendingRef = useRef(
    new Map<string, Promise<ProductCarbonCertificateApplication[]>>(),
  );
  const mountedRef = useRef(true);
  const [revision, setRevision] = useState(0);

  const resetSessionCache = () => {
    if (cacheSessionRef.current === sessionKey) {
      return;
    }

    cacheSessionRef.current = sessionKey;
    cacheRef.current.clear();
    pendingRef.current.clear();
    generationRef.current += 1;
  };

  resetSessionCache();

  const loadAccount = (
    accountId: string,
    options: { refresh?: boolean } = {},
  ): Promise<ProductCarbonCertificateApplication[]> => {
    resetSessionCache();
    const cached = cacheRef.current.get(accountId);

    if (cached?.status === 'loaded' && !options.refresh) {
      return Promise.resolve(cached.rows);
    }

    const pending = pendingRef.current.get(accountId);

    if (pending) {
      return pending;
    }

    if (cached?.status === 'error' && !options.refresh) {
      return Promise.reject(cached.error);
    }

    const generation = generationRef.current;
    cacheRef.current.set(accountId, {
      rows: cached?.rows || [],
      status: 'loading',
    });
    setRevision(value => value + 1);

    const request = loadProductCarbonCertificateApplications(accountId)
      .then(rows => {
        if (
          generation === generationRef.current &&
          cacheSessionRef.current === sessionKey
        ) {
          cacheRef.current.set(accountId, { rows, status: 'loaded' });
          if (mountedRef.current) {
            setRevision(value => value + 1);
          }
        }

        return rows;
      })
      .catch(error => {
        if (
          generation === generationRef.current &&
          cacheSessionRef.current === sessionKey
        ) {
          cacheRef.current.set(accountId, {
            error,
            rows: cached?.rows || [],
            status: 'error',
          });
          if (mountedRef.current) {
            setRevision(value => value + 1);
          }
        }

        throw error;
      })
      .finally(() => {
        if (pendingRef.current.get(accountId) === request) {
          pendingRef.current.delete(accountId);
        }
      });

    pendingRef.current.set(accountId, request);
    return request;
  };
  const loadAccountRef = useRef(loadAccount);
  loadAccountRef.current = loadAccount;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      generationRef.current += 1;
    };
  }, []);

  useEffect(() => {
    if (!enabled || !open || !accountIdsKey) {
      return;
    }

    accountIdsKey.split('|').forEach(accountId => {
      loadAccountRef
        .current(accountId, { refresh: true })
        .catch(() => undefined);
    });
  }, [accountIdsKey, enabled, open, sessionKey]);

  const cacheSnapshot = useMemo(
    () => ({
      accounts: new Map(cacheRef.current),
      revision,
      sessionKey,
    }),
    [revision, sessionKey],
  );

  const applications = useMemo(() => {
    if (!enabled || cacheSessionRef.current !== sessionKey) {
      return [];
    }

    return accountIdsKey
      .split('|')
      .filter(Boolean)
      .flatMap(accountId => cacheSnapshot.accounts.get(accountId)?.rows || []);
  }, [accountIdsKey, cacheSnapshot, enabled, sessionKey]);

  return {
    applications,
    updateApplication: (application: ProductCarbonCertificateApplication) => {
      const accountId = String(application.accountId);
      const cached = cacheRef.current.get(accountId);

      if (!cached) {
        return;
      }

      let updated = false;
      const rows = cached.rows.map(row => {
        if (String(row.id) !== String(application.id)) {
          return row;
        }

        updated = true;
        return application;
      });

      if (updated) {
        cacheRef.current.set(accountId, { ...cached, rows });
        setRevision(value => value + 1);
      }
    },
  };
}
