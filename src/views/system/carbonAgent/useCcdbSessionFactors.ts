import { useEffect, useState } from 'react';

import {
  fetchCcdbSessionFactors,
  getCcdbErrorMessage,
  sessionFactorTarget,
  type CcdbSessionFactorRef,
} from './ccdbFactor';

interface State {
  sessionId: string;
  refs: CcdbSessionFactorRef[];
  loading: boolean;
  error: string;
}

export default function useCcdbSessionFactors(
  sessionId: string,
  refreshKey: number,
) {
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<State>({
    sessionId: '',
    refs: [],
    loading: false,
    error: '',
  });
  useEffect(() => {
    const controller = new AbortController();
    if (!sessionId) {
      setState({ sessionId: '', refs: [], loading: false, error: '' });
      return () => controller.abort();
    }
    setState({ sessionId, refs: [], loading: true, error: '' });
    fetchCcdbSessionFactors(sessionId, controller.signal)
      .then(refs => {
        // 只校验后端快照是否可读，不在加载列表时请求详情或记录浏览。
        refs.forEach(sessionFactorTarget);
        if (!controller.signal.aborted)
          setState({ sessionId, refs, loading: false, error: '' });
      })
      .catch(error => {
        if (!controller.signal.aborted)
          setState({
            sessionId,
            refs: [],
            loading: false,
            error: getCcdbErrorMessage(error),
          });
      });
    return () => controller.abort();
  }, [sessionId, refreshKey, retryKey]);
  const current = state.sessionId === sessionId;
  return {
    refs: current ? state.refs : [],
    loading: !current || state.loading,
    error: current ? state.error : '',
    retry: () => setRetryKey(key => key + 1),
  };
}
