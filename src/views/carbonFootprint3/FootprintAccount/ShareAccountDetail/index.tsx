/**
 * 碳足迹核算 - 分享业务页面
 * @returns
 */
import { API_EXTRA_PARAMS_SNAPFLAG } from '@src/components/CarbonFootprintAccount/BuildModelMainData/constant';
import { ShareBuildModelMainData } from '@src/components/CarbonFootprintAccount/ShareBuildModelMainData';

const { SHARE } = API_EXTRA_PARAMS_SNAPFLAG;

const ShareAccountDetail = () => (
  <div>
    <ShareBuildModelMainData apiExtraParams={{ snapFlag: SHARE }} />
  </div>
);

export default ShareAccountDetail;
