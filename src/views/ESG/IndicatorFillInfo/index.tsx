import useUrlState from '@ahooksjs/use-url-state';
import { FC } from 'react';
import { useParams } from 'react-router-dom';

import IndicatorDetails from '../components/IndicatorDetails';

const IndicatorFillInfo: FC = () => {
  const { frameId, indicatorId } = useParams<{
    frameId: string;
    indicatorId: string;
  }>();

  const [{ orgId }] = useUrlState();

  return (
    <IndicatorDetails
      frameId={Number(frameId)}
      indicatorId={indicatorId}
      orgId={Number(orgId)}
      isFill
    />
  );
};

export default IndicatorFillInfo;
