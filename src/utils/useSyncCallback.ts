import { useEffect, useState, useCallback } from 'react';

const useSyncCallback = (callback: { (): Promise<void>; (): any }) => {
  const [proxyState, setProxyState] = useState({ current: false });
  const Func = useCallback(() => {
    setProxyState({ current: true });
  }, [proxyState]);
  useEffect(() => {
    if (proxyState.current === true) setProxyState({ current: false });
  }, [proxyState]);
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    proxyState.current && callback();
  });

  return Func;
};

export default useSyncCallback;
