/**
 * 碳足迹核算 - 分享业务页面 - boss组织模型 snapFlag 为空
 */
import { ShareBuildModelMainData } from '@src/components/CarbonFootprintAccount/ShareBuildModelMainData';

const ShareAccountDetailBossModel = () => (
  <div>
    <ShareBuildModelMainData apiExtraParams={{ snapFlag: '' }} />
  </div>
);

export default ShareAccountDetailBossModel;
