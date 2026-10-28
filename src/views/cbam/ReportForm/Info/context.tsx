import { createContext, ReactNode, useContext, useMemo } from 'react';

import { usePageInfo } from '@/hooks';

type CbamReportPreviewContextValue = {
  embedded: boolean;
  onBack?: () => void;
  reportId?: number | string;
};

const CbamReportPreviewContext = createContext<CbamReportPreviewContextValue>({
  embedded: false,
});

export const CbamReportPreviewProvider = ({
  children,
  onBack,
  reportId,
}: {
  children: ReactNode;
  onBack?: () => void;
  reportId: number | string;
}) => {
  const value = useMemo(
    () => ({ embedded: true, onBack, reportId }),
    [onBack, reportId],
  );

  return (
    <CbamReportPreviewContext.Provider value={value}>
      {children}
    </CbamReportPreviewContext.Provider>
  );
};

export const useCbamReportPreviewContext = () =>
  useContext(CbamReportPreviewContext);

export const useCbamPageInfo = () => {
  const pageInfo = usePageInfo();
  const { reportId } = useCbamReportPreviewContext();

  return reportId === undefined
    ? pageInfo
    : {
        ...pageInfo,
        id: Number(reportId),
        isAdd: false,
        isDetail: false,
        isEdit: true,
      };
};
