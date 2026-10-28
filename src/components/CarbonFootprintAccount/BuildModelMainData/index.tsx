/**
 * 搭建模型页面的主要内容 - 可视化内容和列表模式美容
 */
import { BuildModelDescribeSet } from '@src/views/carbonFootprint3/FootprintAccount/component/AccountInfoBuildModel/constant';
import { FC, memo } from 'react';

import { BuildModelList } from './BuildModelList';
import { BuildModelVisual } from './BuildModelVisual';
import style from './index.module.less';
import { TransportReuseEnabledContext } from './transportReuseContext';
import { BuildModelMainDataProps } from './type';

const { LIST, VISUAL } = BuildModelDescribeSet;
const BuildModelMainDataContent: FC<BuildModelMainDataProps> = memo(
  ({
    agentPreviewLayout,
    accountInfo,
    aiAnimationStatus,
    switchMain,
    updateAccountInfo,
    quickDrawerMatchWayBtns,
    quickDrawerMatchWayBtnValue,
    noSelectEmissionBtn,
    noSaveStoreBtn,
    isDetail,
    cRef,
    cRefVisual,
    listRef,
    apiExtraParams,
    changeEmission,
    editAccount,
    reportSnapCode,
    authType,
    enableFactorSourceRange,
    onEmissionTaskCreate,
  }) => (
    <div className={style.buildModelMainData}>
      {switchMain === LIST && (
        <BuildModelList
          apiExtraParams={apiExtraParams || {}}
          isDetail={isDetail}
          accountInfo={accountInfo}
          noSelectEmissionBtn={noSelectEmissionBtn}
          noSaveStoreBtn={noSaveStoreBtn}
          quickDrawerMatchWayBtns={quickDrawerMatchWayBtns}
          cRef={cRef}
          listRef={listRef}
          reportSnapCode={reportSnapCode}
          authType={authType}
          updateAccountInfo={updateAccountInfo}
          changeEmission={changeEmission}
          editAccount={editAccount}
          enableFactorSourceRange={enableFactorSourceRange}
        />
      )}
      {switchMain === VISUAL && (
        <BuildModelVisual
          agentPreviewLayout={agentPreviewLayout}
          accountInfo={accountInfo}
          aiAnimationStatus={aiAnimationStatus}
          apiExtraParams={apiExtraParams || {}}
          cRef={cRefVisual}
          isDetail={isDetail}
          noSaveStoreBtn={noSaveStoreBtn}
          onEmissionTaskCreate={onEmissionTaskCreate}
          noSelectEmissionBtn={noSelectEmissionBtn}
          quickDrawerMatchWayBtnValue={quickDrawerMatchWayBtnValue}
          quickDrawerMatchWayBtns={quickDrawerMatchWayBtns}
          changeEmission={changeEmission}
          editAccount={editAccount}
          updateAccountInfo={updateAccountInfo}
          enableFactorSourceRange={enableFactorSourceRange}
        />
      )}
    </div>
  ),
);

export const BuildModelMainData: FC<BuildModelMainDataProps> = memo(props => (
  <TransportReuseEnabledContext.Provider value={!!props.enableTransportReuse}>
    <BuildModelMainDataContent {...props} />
  </TransportReuseEnabledContext.Provider>
));
