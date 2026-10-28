import { useContext, useEffect, useState } from 'react';
import { LocaleType } from '@src/lang/I18N';

import { LocaleContext } from '@/components/LocaleProvider';

import { fetchPopularFactors, fetchRecentFactors } from './service';
import type {
  FactorLibraryItem,
  FactorLibraryRecordsPage,
  FactorLibraryTab,
} from './types';

interface ListState {
  tab: FactorLibraryTab;
  pageNum: number;
  popular: FactorLibraryItem[];
  recent?: FactorLibraryRecordsPage;
  loading: boolean;
  failed: boolean;
}

export default function useFactorLibraryList(
  tab: FactorLibraryTab,
  pageNum: number,
) {
  const { locale } = useContext(LocaleContext);
  const language = locale === LocaleType.enUS ? 'en' : 'zh';
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<ListState>({
    tab,
    pageNum,
    popular: [],
    loading: true,
    failed: false,
  });

  useEffect(() => {
    const controller = new AbortController();
    const next: ListState = {
      tab,
      pageNum,
      popular: [],
      loading: true,
      failed: false,
    };
    setState(next);
    const load = async () => {
      try {
        if (tab === 'popular') {
          const popular = await fetchPopularFactors(
            language,
            controller.signal,
          );
          if (!controller.signal.aborted)
            setState({ ...next, popular, loading: false });
        } else {
          const recent = await fetchRecentFactors(pageNum, controller.signal);
          if (!controller.signal.aborted)
            setState({ ...next, recent, loading: false });
        }
      } catch {
        if (!controller.signal.aborted)
          setState({ ...next, loading: false, failed: true });
      }
    };
    load();
    return () => controller.abort();
  }, [tab, pageNum, language, retryKey]);

  const current = state.tab === tab && state.pageNum === pageNum;
  return {
    popular: current ? state.popular : [],
    recent: current ? state.recent : undefined,
    loading: !current || state.loading,
    failed: current && state.failed,
    refresh: () => setRetryKey(key => key + 1),
  };
}
