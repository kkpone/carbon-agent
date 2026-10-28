import useUrlState from '@ahooksjs/use-url-state';
import { RouteMaps } from '@src/router/route-paths';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import DisclosureReportDetail from '../../AccountingList/components/DisclosureReportDetail';
import { getDisclosureReportList } from '../../AccountingList/service';
import { DisclosureReportListItem } from '../../AccountingList/type';

type DisclosureReportEditQuery = {
  configOrgId?: string;
  orgId?: string;
  year?: string;
  period?: string;
};

const getInitialYear = (year?: string, period?: string) =>
  year || period || moment().format('YYYY');

const DISCLOSURE_REPORT_TAB = 'disclosureReport';

const toOptionalNumber = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const nextValue = Number(value);

  return Number.isFinite(nextValue) ? nextValue : undefined;
};

const DisclosureReportEdit = () => {
  const [searchParams] = useUrlState<DisclosureReportEditQuery>({});
  const history = useHistory();
  const selectedYear = getInitialYear(searchParams.year, searchParams.period);
  const [orgData, setOrgData] = useState<DisclosureReportListItem[]>([]);
  const [orgTreeLoading, setOrgTreeLoading] = useState(false);

  const initialOrgId = toOptionalNumber(searchParams.orgId);
  const configOrgId = searchParams.configOrgId || searchParams.orgId;

  useEffect(() => {
    if (!selectedYear || !configOrgId) {
      setOrgData([]);
      return;
    }

    let cancelled = false;

    setOrgTreeLoading(true);
    getDisclosureReportList({
      year: selectedYear,
      orgId: configOrgId,
    })
      .then(({ data }) => {
        if (!cancelled) {
          setOrgData(data.data || []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOrgData([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setOrgTreeLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [configOrgId, selectedYear]);

  const onBack = () => {
    history.push({
      pathname: RouteMaps.enterpriseCarbonAccountingcarbonDischarge,
      search: `?tab=${DISCLOSURE_REPORT_TAB}`,
    });
  };

  return (
    <DisclosureReportDetail
      mode='page'
      year={selectedYear}
      orgList={orgData}
      orgLoading={orgTreeLoading}
      initialOrgId={initialOrgId}
      currentOrgId={initialOrgId}
      onClose={onBack}
    />
  );
};

export default DisclosureReportEdit;
