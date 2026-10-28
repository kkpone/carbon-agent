import { API_EXTRA_PARAMS_SNAPFLAG } from '@src/components/CarbonFootprintAccount/BuildModelMainData/constant';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';

const getSaasOrigin = () => {
  const configuredOrigin = process.env.REACT_APP_SAAS_URL?.trim();

  return configuredOrigin?.replace(/\/+$/, '');
};

export const openProductFootprintSnapshotDetail = (
  accountId: string | number,
) => {
  const saasOrigin = getSaasOrigin();
  if (!saasOrigin) return;

  const searchParams = new URLSearchParams({
    accountId: String(accountId),
    listOrGraph: '0',
    snapFlag: String(API_EXTRA_PARAMS_SNAPFLAG.SHARE),
    status: '1',
    stepValue: '1',
  });
  const target = new URL(
    RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountShare,
    saasOrigin,
  );
  target.search = searchParams.toString();

  window.open(target.toString(), '_blank', 'noopener,noreferrer');
};
