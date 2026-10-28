import { useLocation } from 'react-router-dom';

export const useReportId = () => {
  const location = useLocation<{ reportId: string }>();

  const searchParams = new URLSearchParams(location.search);

  const reportId = Number(searchParams.get('reportId') || 0);

  return [reportId];
};
