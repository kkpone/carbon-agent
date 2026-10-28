import defaultImg from '@src/assets/svg/accountProductImg.svg';
import { MenuList } from '@src/components/MenuList';
import { MenuData } from '@src/components/MenuList/type';
import { useRequest, useUnmount } from 'ahooks';
import {
  FC,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { getAiProcessStatus } from '@/views/carbonFootprint3/FootprintAccount/component/AccountInfoBuildModel/BuildModelDescribe/service';
import { AiProcessStatus } from '@/views/carbonFootprint3/FootprintAccount/component/AccountInfoBuildModel/constant';

import { BuildModelListQuickTable } from './QuickTable';
import { QuickBuildModelListProps } from './type';
import { getAccountMenu } from '../../service';
import style from '../index.module.less';

export const QuickBuildList: FC<QuickBuildModelListProps> = memo(
  ({
    accountInfo,
    cRef,
    listRef,
    updateAccountInfo,
    isDetail,
    apiExtraParams,
    quickDrawerMatchWayBtns,
    quickDrawerMatchWayBtnValue,
    noSelectEmissionBtn,
    noSaveStoreBtn,
    isInSupplyChain,
    onlyCreateFactor = false,
    changeEmission,
    editAccount,
    reportSnapCode,
    authType,
    enableFactorSourceRange,
  }) => {
    const { id, productPic } = accountInfo;

    const AIProcessTimerRef = useRef<NodeJS.Timeout>();

    /** 菜单信息 */
    const [menuInfo, setMenuInfo] = useState<MenuData>();
    /**
     * 核算菜单列表
     */
    const getAccountLis = async () => {
      const { data } = await getAccountMenu({
        ...apiExtraParams,
        id,
      });
      if (!menuInfo) {
        setMenuInfo(data.data[0]);
      }
      return data.data;
    };
    const {
      data,
      loading: treeLoading,
      refresh,
      mutate,
    } = useRequest(getAccountLis, {
      refreshDeps: [],
    });

    /**
     * 菜单选中回调
     * @param menuData 选中的菜单
     */
    const onSelectMenu = (menuData?: MenuData) => {
      if (menuData) {
        setMenuInfo(menuData);
      }
    };

    /**
     * 更新菜单列表
     */
    const menuRest = (opt?: { resetMenu?: boolean }) => {
      /** 找到最外层菜单节点 */
      const findParentMenu = data?.find(
        menuEveryData =>
          menuEveryData.stage === menuInfo?.stage && !menuEveryData.type,
      );
      if (findParentMenu) {
        if (opt?.resetMenu) {
          setMenuInfo(findParentMenu);
        }
        refresh();
      }
      updateAccountInfo();
    };

    useEffect(() => {
      refresh();
    }, [accountInfo]);

    useImperativeHandle(
      listRef,
      () => ({
        updateByAIProcess: () => {
          const loopAIProcessStatus = async () => {
            clearTimeout(AIProcessTimerRef.current);
            const resp = await getAiProcessStatus({ accountId: id });
            if (resp.data.data !== AiProcessStatus.PENDING) {
              const menuResp = await getAccountMenu({
                ...apiExtraParams,
                id,
              });
              mutate(menuResp.data.data);
              setMenuInfo(undefined);
              Promise.resolve().then(() => {
                setMenuInfo({ ...menuResp.data.data[0] });
              });
            } else {
              AIProcessTimerRef.current = setTimeout(loopAIProcessStatus, 1000);
            }
          };

          loopAIProcessStatus();
        },
        /**
         * 核算详情左侧 AI 对话更新建模（aiModelUpdate）完成后调用：
         * 不等 aiProcess 状态，直接拉菜单并让表格重新请求排放列表。
         */
        refreshMenuAndEmissionTableAfterAiUpdate: async () => {
          clearTimeout(AIProcessTimerRef.current);
          const menuResp = await getAccountMenu({
            ...apiExtraParams,
            id,
          });
          const menus = menuResp.data.data;
          mutate(menus);
          const first = menus?.[0];
          setMenuInfo(first ? { ...first } : undefined);
          await Promise.resolve();
          setTimeout(() => {
            cRef?.current?.reset?.();
          }, 0);
        },
      }),
      [apiExtraParams, cRef, id, mutate],
    );

    useUnmount(() => {
      clearInterval(AIProcessTimerRef.current);
    });

    return (
      <div className={style.buildModelList}>
        <div className={style.main}>
          <div className={style.mainMenu}>
            {data && (
              <MenuList
                menuValue={menuInfo ? [menuInfo.id] : []}
                productInfo={{
                  productPic: productPic || defaultImg,
                  accountName: accountInfo.accountName,
                  emission:
                    accountInfo?.aiStatus === 1
                      ? accountInfo?.emissionTotalTmp ||
                        accountInfo.emissionTotal
                      : accountInfo.emissionTotal,
                }}
                accountInfo={accountInfo}
                treeMenus={data}
                treeLoading={treeLoading}
                reportSnapCode={reportSnapCode}
                authType={authType}
                onSelectMenu={onSelectMenu}
                editAccount={editAccount}
              />
            )}
          </div>
          <div className={style.mainTable}>
            {menuInfo && (
              <BuildModelListQuickTable
                key={menuInfo.id}
                isInSupplyChain={isInSupplyChain}
                onlyCreateFactor={onlyCreateFactor}
                noSaveStoreBtn={noSaveStoreBtn}
                noSelectEmissionBtn={noSelectEmissionBtn}
                quickDrawerMatchWayBtnValue={quickDrawerMatchWayBtnValue}
                quickDrawerMatchWayBtns={quickDrawerMatchWayBtns}
                apiExtraParams={apiExtraParams}
                isDetail={isDetail}
                cRef={cRef}
                accountInfo={accountInfo}
                menuInfo={menuInfo}
                emissonCallBack={menuRest}
                changeEmission={changeEmission}
                enableFactorSourceRange={enableFactorSourceRange}
              />
            )}
          </div>
        </div>
      </div>
    );
  },
);
