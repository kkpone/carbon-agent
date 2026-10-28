import { useParams } from 'react-router-dom';

import IndicatorDetails from '../components/IndicatorDetails';

const IndicatorInfo = () => {
  const { frameId, indicatorId } = useParams<{
    frameId: string;
    indicatorId: string;
  }>();

  return (
    <IndicatorDetails
      frameId={Number(frameId)}
      indicatorId={indicatorId}
      isFill={false}
    />
  );
};

export default IndicatorInfo;
