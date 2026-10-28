/**
 * 搭建模型 - 列表模式组件
 */
import { CustomFactorReuseContext } from '@src/components/FormilyUtil/FormilyFactor/context';
import { FootprintAccountStatusType } from '@src/views/carbonFootprint3/FootprintAccount/constant';
import { FC } from 'react';

import { ProcessBuildList } from './Process';
import { QuickBuildList } from './Quick';
import { BuildModelListProps } from './type';

const { QUICK, PROCESS } = FootprintAccountStatusType;

export const BuildModelList: FC<BuildModelListProps> = ({
  isDetail,
  apiExtraParams,
  accountInfo,
  updateAccountInfo,
  quickDrawerMatchWayBtns,
  quickDrawerMatchWayBtnValue,
  noSelectEmissionBtn,
  noSaveStoreBtn,
  cRef,
  listRef,
  isInSupplyChain,
  onlyCreateFactor = false,
  changeEmission,
  editAccount,
  reportSnapCode,
  authType,
  enableFactorSourceRange,
}) => {
  const { type } = accountInfo;

  return (
    <>
      {type === QUICK && (
        <QuickBuildList
          authType={authType}
          quickDrawerMatchWayBtns={quickDrawerMatchWayBtns}
          quickDrawerMatchWayBtnValue={quickDrawerMatchWayBtnValue}
          apiExtraParams={apiExtraParams}
          isDetail={isDetail}
          onlyCreateFactor={onlyCreateFactor}
          accountInfo={accountInfo}
          noSaveStoreBtn={noSaveStoreBtn}
          cRef={cRef}
          listRef={listRef}
          isInSupplyChain={isInSupplyChain}
          noSelectEmissionBtn={noSelectEmissionBtn}
          updateAccountInfo={updateAccountInfo}
          changeEmission={changeEmission}
          editAccount={editAccount}
          reportSnapCode={reportSnapCode}
          enableFactorSourceRange={enableFactorSourceRange}
        />
      )}
      {type === PROCESS && (
        <CustomFactorReuseContext.Provider value={false}>
          <ProcessBuildList
            accountInfo={accountInfo}
            apiExtraParams={apiExtraParams}
            isDetail={isDetail}
            updateAccountInfo={updateAccountInfo}
            editAccount={editAccount}
            enableFactorSourceRange={enableFactorSourceRange}
          />
        </CustomFactorReuseContext.Provider>
      )}
    </>
  );
};
