import { EcoinventGeographyContext } from '@/components/SearchFactor/ModalFactor/ecoinventContext';
import { CustomFactorReuseContext } from '@src/components/FormilyUtil/FormilyFactor/context';
import { FootprintAccountStatusType } from '@src/views/carbonFootprint3/FootprintAccount/constant';
import classNames from 'classnames';
import { FC, memo, useEffect, useState } from 'react';

import { ProcessBuildVisual } from './Process';
import { QuickBuildVisual } from './Quick';
import style from './index.module.less';
import type { BuildModelVisualProps } from './type';

const { QUICK, PROCESS } = FootprintAccountStatusType;
export const BuildModelVisual: FC<BuildModelVisualProps> = memo(
  ({
    agentPreviewLayout,
    accountInfo,
    cRef,
    isDetail,
    apiExtraParams,
    aiAnimationStatus,
    changeEmission,
    editAccount,
    noSaveStoreBtn,
    noSelectEmissionBtn,
    quickDrawerMatchWayBtns,
    quickDrawerMatchWayBtnValue,
    updateAccountInfo,
    enableFactorSourceRange,
    onEmissionTaskCreate,
  }) => {
    const { type } = accountInfo;
    const [shouldRender, setShouldRender] = useState(true);

    const forceReload = () => {
      setShouldRender(false);
      setTimeout(() => setShouldRender(true), 16);
    };

    useEffect(() => {
      forceReload();
    }, [isDetail]);

    return (
      <EcoinventGeographyContext.Provider value={!!agentPreviewLayout}>
        <div
          className={classNames(style.visualGraphContainer, {
            [style.agentPreviewVisualGraphContainer]: agentPreviewLayout,
          })}
        >
          {type === QUICK && shouldRender && (
            <QuickBuildVisual
              agentPreviewLayout={agentPreviewLayout}
              aiAnimationStatus={aiAnimationStatus}
              apiExtraParams={apiExtraParams}
              accountInfo={accountInfo}
              cRef={cRef}
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
          {type === PROCESS && (
            <CustomFactorReuseContext.Provider value={false}>
              <ProcessBuildVisual
                apiExtraParams={apiExtraParams}
                accountInfo={accountInfo}
                isDetail={isDetail}
                onEmissionTaskCreate={onEmissionTaskCreate}
                editAccount={editAccount}
                enableFactorSourceRange={enableFactorSourceRange}
              />
            </CustomFactorReuseContext.Provider>
          )}
        </div>
      </EcoinventGeographyContext.Provider>
    );
  },
);
