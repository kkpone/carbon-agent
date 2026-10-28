/** 搭建模型列表模式 - 快速核算表格 */
import { PlusOutlined } from '@ant-design/icons';
import { TableActions } from '@src/components/Table/components/TableActions';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import {
  MODEL_EMISSION_MATCH_WAY,
  MODEL_EMISSION_REQUEST_STATE,
} from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import EmissionSourceDrawer, {
  EmissionSourceDrawerProps,
} from '@src/views/carbonFootprint3/component/EmissionSourceDrawer';
import {
  haveAccountAiPermissions,
  haveAccountEditPermissions,
} from '@src/views/carbonFootprint3/permissions';
import { isBuySupplier } from '@src/views/carbonFootprint3/service';
import { BackTableData } from '@src/views/carbonFootprint3/type';
import { useMount } from 'ahooks';
import { Button, Modal } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { AxiosResponse } from 'axios';
import { has } from 'lodash-es';
import {
  FC,
  memo,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { useGlobalLoginModal } from '@/components/GlobalLoginModal';
import { getToken } from '@/utils/cookie';
import { useAccountIdBindWithUpgrade } from '@/utils/useAccountIdBindWithUpgrade';
import { CompanyType } from '@/views/system/login/component/Login';

import { QuickBusinessAccountTableCol } from './Columns';
import style from './index.module.less';
import {
  getAccountingEmissionData,
  postAiQuickAccountEmissionDelete,
  postQuickAccounEmissionInStore,
  postQuickAccountEmissionBatchDelete,
  postQuickAccountEmissionDelete,
} from './service';
import {
  BuildModelListQuickTableProps,
  QuickAccounEmissionParams,
  QuickAccountModelEmissionData,
} from './type';
import EmissionDetailSheetDrawerDefault from '../../../BuildModelVisual/Quick/components/EmissionDetailSheetDrawer';
import { API_EXTRA_PARAMS_SNAPFLAG } from '../../../constant';

const { SHARE, SAASSHARE, ACCOUNT_SHARE_EDIT } = API_EXTRA_PARAMS_SNAPFLAG;
const { confirm } = Modal;

type EmissionSourceDrawerPropsPick =
  | 'visible'
  | 'emissionSourceId'
  | 'readPretty'
  | 'emissionAiFlag';

export const BuildModelListQuickTable: FC<BuildModelListQuickTableProps> = memo(
  ({
    accountInfo,
    apiExtraParams,
    menuInfo,
    isDetail,
    cRef,
    quickDrawerMatchWayBtns,
    quickDrawerMatchWayBtnValue,
    noSelectEmissionBtn,
    noSaveStoreBtn,
    emissonCallBack,
    isInSupplyChain,
    onlyCreateFactor = false,
    changeEmission,
    enableFactorSourceRange,
  }) => {
    const handleAccountIdBindWithUpgrade = useAccountIdBindWithUpgrade();
    const isShareLinkEditable =
      Number(apiExtraParams?.snapFlag) === ACCOUNT_SHARE_EDIT &&
      !!apiExtraParams?.shareAuth;
    const isShare =
      [SAASSHARE, SHARE].includes(apiExtraParams?.snapFlag) ||
      isShareLinkEditable;
    const canEditEmission =
      (!isDetail && haveAccountEditPermissions()) || isShareLinkEditable;
    const childRef = useRef<TableRef>();
    const tableTotalRef = useRef(0);
    const tableWrapperRef = useRef<HTMLDivElement>(null);
    const [tableScrollY, setTableScrollY] = useState<number>();
    const [selectedEmissions, setSelectedEmissions] = useState<
      QuickAccountModelEmissionData[]
    >([]);

    useLayoutEffect(() => {
      const tableWrapper = tableWrapperRef.current;
      if (!tableWrapper) return undefined;

      const updateTableScrollY = () => {
        const tableHeader =
          tableWrapper.querySelector<HTMLElement>('.ant-table-thead');
        const pagination =
          tableWrapper.querySelector<HTMLElement>('.ant-pagination');
        if (!tableHeader || !pagination) return;

        const paginationStyle = window.getComputedStyle(pagination);
        const paginationHeight =
          pagination.offsetHeight +
          Number.parseFloat(paginationStyle.marginTop) +
          Number.parseFloat(paginationStyle.marginBottom);
        const availableHeight =
          tableWrapper.clientHeight -
          tableHeader.offsetHeight -
          paginationHeight -
          26;

        setTableScrollY(Math.max(availableHeight, 120));
      };

      const frameId = window.requestAnimationFrame(updateTableScrollY);
      const resizeObserver = new ResizeObserver(updateTableScrollY);
      resizeObserver.observe(tableWrapper);
      const tableHeader =
        tableWrapper.querySelector<HTMLElement>('.ant-table-thead');
      const pagination =
        tableWrapper.querySelector<HTMLElement>('.ant-pagination');
      if (tableHeader) resizeObserver.observe(tableHeader);
      if (pagination) resizeObserver.observe(pagination);

      return () => {
        window.cancelAnimationFrame(frameId);
        resizeObserver.disconnect();
      };
    }, [canEditEmission]);

    const { id, excelUrl, accountName } = accountInfo;
    const { stage, type = undefined } = menuInfo;
    const [searchParamsData] = useState<QuickAccounEmissionParams>({
      accountId: id,
      stage,
      type,
    });

    /** 是否展示发起收数按钮 */
    const [showSupplier, setShowSupplier] = useState(false);

    const { openLoginModal } = useGlobalLoginModal();

    const [emissionSourceDrawerProps, setEmissionSourceDrawerProps] = useState<
      Pick<EmissionSourceDrawerProps, EmissionSourceDrawerPropsPick>
    >({ visible: false });

    /** 是否是复制的排放源 */
    const [emissionCopyStatus, setEmissionCopyStatus] =
      useState<boolean>(false);
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
    const [detailDrawerEmissionName, setDetailDrawerEmissionName] =
      useState<string>('');
    const [detailDrawerStageName, setDetailDrawerStageName] =
      useState<string>('');
    const [detailDrawerEmissionId, setDetailDrawerEmissionId] = useState<
      number | undefined
    >();
    const [detailDrawerWpsSheetId, setDetailDrawerWpsSheetId] = useState<
      string | number | undefined
    >();
    const [detailDrawerApiWpsSheetId, setDetailDrawerApiWpsSheetId] = useState<
      string | number | undefined
    >();
    const [detailDrawerSheetIndex, setDetailDrawerSheetIndex] = useState<
      number | undefined
    >();

    /**  表格数据格式  */
    const returnFetchApi = (
      back: AxiosResponse<
        AxiosResponse<BackTableData<QuickAccountModelEmissionData>>
      >,
    ) => {
      tableTotalRef.current = back.data.data.total;

      return {
        data: back.data.data.rows,
        count: back.data.data.total,
      };
    };

    /**
     * 关闭排放源侧滑框
     */
    const closeEmissionDrawer = () => {
      setEmissionSourceDrawerProps({ visible: false });
      setEmissionCopyStatus(false);
    };

    const openDetailSheetDrawer = (item: QuickAccountModelEmissionData) => {
      const wpsId = item.wpsSheetId ?? item.sheetId;
      const hasSheetIndex =
        item.sheetIndex !== null && item.sheetIndex !== undefined;
      if (!excelUrl || (!wpsId && !hasSheetIndex)) {
        return;
      }
      setDetailDrawerEmissionName(item.name || '');
      setDetailDrawerStageName(
        item.stageName || item.stage_name || menuInfo?.name || '',
      );
      setDetailDrawerEmissionId(item.id);
      setDetailDrawerWpsSheetId(wpsId ?? undefined);
      setDetailDrawerApiWpsSheetId(item.wpsSheetId);
      setDetailDrawerSheetIndex(item.sheetIndex);
      setDetailDrawerOpen(true);
    };

    /**
     * @description: 删除列表数据
     * @param {QuickAccountModelEmissionData} deleteItem 被删除的行数据信息
     */
    const deleteTable = async (deleteItem: QuickAccountModelEmissionData) => {
      if (deleteItem?.aiFlag === 1 && !haveAccountAiPermissions()) {
        Toast('warn', I18N.components.sorryYouDidnt);
        return;
      }
      confirm({
        title: I18N.carbonFootprint.prompt,
        content: I18N.template(I18N.components.confirmDeletionOfThis, {
          val1: deleteItem.name,
        }),
        bodyStyle: {
          padding: '20px 24px',
        },
        okButtonProps: {
          danger: true,
        },
        icon: null,
        onOk: async () => {
          try {
            const back =
              deleteItem?.aiFlag === 1
                ? await postAiQuickAccountEmissionDelete({
                    ...apiExtraParams,
                    id: deleteItem.id,
                  })
                : await postQuickAccountEmissionDelete({
                    ...apiExtraParams,
                    id: deleteItem.id,
                  });
            if (back.data.code === 200) {
              const resetMenu = childRef.current?.getTableData()?.length === 1;
              setSelectedEmissions(currentSelected =>
                currentSelected.filter(item => item.id !== deleteItem.id),
              );
              emissonCallBack({
                resetMenu,
              });
              if (!resetMenu) {
                childRef.current?.reset();
              }
              Toast('success', I18N.carbonFootprint.deleteSuccessful);
            }
          } catch {
            /* empty */
          }
        },
      });
    };

    const batchDeleteTable = () => {
      if (!selectedEmissions.length) {
        return;
      }

      confirm({
        title: I18N.components.batchDeletion,
        content: I18N.eca.confirmDeletion,
        bodyStyle: {
          padding: '20px 24px',
        },
        okButtonProps: {
          danger: true,
        },
        icon: null,
        onOk: async () => {
          const emissionIds: number[] = [];
          const tmpEmissionIds: number[] = [];

          selectedEmissions.forEach(item => {
            if (item.aiFlag === 1) {
              tmpEmissionIds.push(item.id);
            } else {
              emissionIds.push(item.id);
            }
          });

          const back = await postQuickAccountEmissionBatchDelete({
            emissionIds,
            tmpEmissionIds,
            snapFlag: Number(apiExtraParams?.snapFlag ?? 0),
          });

          if (back.data.code === 200) {
            const resetMenu =
              tableTotalRef.current > 0 &&
              selectedEmissions.length >= tableTotalRef.current;

            setSelectedEmissions([]);
            emissonCallBack({ resetMenu });
            if (!resetMenu) {
              childRef.current?.reset();
            }
            Toast('success', I18N.carbonFootprint.deleteSuccessful);
          }
        },
      });
    };

    /**
     * @description: 编辑
     * @param  itemInfo 被编辑数据的信息
     */
    const goEdit = async (itemInfo: QuickAccountModelEmissionData) => {
      const isSupplierMatchWay =
        Number(itemInfo.matchWay) === MODEL_EMISSION_MATCH_WAY.SUPPLIER;
      const isSelectedData =
        itemInfo.matchObject?.id !== null &&
        itemInfo.matchObject?.id !== undefined;
      setEmissionSourceDrawerProps({
        visible: true,
        emissionAiFlag: itemInfo?.aiFlag,
        emissionSourceId: itemInfo.id,
        readPretty: emissionCopyStatus
          ? false
          : isDetail ||
            (isSupplierMatchWay &&
              !isSelectedData &&
              MODEL_EMISSION_REQUEST_STATE.NOT_SUBMIT !==
                itemInfo.requestState),
      });
    };

    /**
     * @description: 详情
     * @param  itemInfo 数据的信息
     */
    const goDetail = async (itemInfo: QuickAccountModelEmissionData) => {
      setEmissionSourceDrawerProps({
        visible: true,
        emissionAiFlag: itemInfo?.aiFlag,
        emissionSourceId: itemInfo.id,
        readPretty: true,
      });
    };

    /**
     * 是否显示保存到库按钮
     */
    const isShowSaveStoreBtn = (item: QuickAccountModelEmissionData) => {
      if (noSaveStoreBtn) return false;
      return (
        item.libState === 0 &&
        canEditEmission &&
        item.emissionTotal !== null &&
        Number(item.matchWay) !== MODEL_EMISSION_MATCH_WAY.SUPPLIER &&
        haveAccountEditPermissions()
      );
    };

    /** 表头 */
    const columns: ColumnsType<QuickAccountModelEmissionData> = [
      ...QuickBusinessAccountTableCol(
        id,
        !!isDetail,
        () => {
          changeEmission?.();
          emissonCallBack();
          childRef.current?.reset();
        },
        isInSupplyChain,
        excelUrl ? openDetailSheetDrawer : undefined,
      ),
      {
        title: I18N.carbonFootprint.operation,
        width: isDetail ? 100 : 260,
        fixed: 'right',
        dataIndex: 'set',
        render: (val, item) => {
          const menus = [
            {
              key: '1',
              label: I18N.carbonFootprint3.details,
              onClick: async () => {
                setEmissionCopyStatus(false);

                if (!getToken() && !isShare) {
                  openLoginModal({
                    companyType: CompanyType.company,
                    showWechatLogin: true,
                    onSuccess: async () => {
                      await handleAccountIdBindWithUpgrade();
                    },
                  });
                  return;
                }

                // 如果是ai临时排放源并且没有ai权限，点开只能只读
                if (item.aiFlag && !haveAccountAiPermissions()) {
                  await goDetail(item);
                  return;
                }

                if (canEditEmission) {
                  await goEdit(item);
                } else {
                  await goDetail(item);
                }
              },
            },
          ];
          if (canEditEmission && !isShareLinkEditable) {
            menus.push({
              key: '4',
              label: I18N.carbonFootprint.copy,
              onClick: async () => {
                if (item?.aiFlag === 1) {
                  Toast(
                    'warn',
                    I18N.components.pleaseConfirmTheEstablishmentFirst2,
                  );
                  return;
                }
                setEmissionCopyStatus(true);
                const itemInfo = item;
                setEmissionSourceDrawerProps({
                  visible: true,
                  emissionAiFlag: itemInfo?.aiFlag,
                  emissionSourceId: itemInfo.id,
                  readPretty: false,
                });
              },
            });
          }

          // 是否已经保存到库 - 0未保存 1 已保存
          // 只有非临时排放源可以保存到库
          if (isShowSaveStoreBtn(item)) {
            menus.push({
              key: '2',
              label: I18N.carbonFootprint3.saveToLibrary,
              onClick: async () => {
                if (item?.aiFlag === 1) {
                  Toast(
                    'warn',
                    I18N.components.pleaseConfirmTheEstablishmentFirst,
                  );
                  return;
                }

                try {
                  const back = await postQuickAccounEmissionInStore({
                    ...apiExtraParams,
                    id: item.id,
                  });
                  if (back.data.code === 200) {
                    childRef.current?.reset();
                    Toast('success', I18N.carbonFootprint3.successfullySavedTo);
                  }
                } catch {
                  /* empty */
                }
              },
            });
          }

          if (canEditEmission) {
            menus.push({
              key: '3',
              label: I18N.carbonFootprint.delete,
              onClick: async () => {
                await deleteTable(item);
              },
            });
          }

          return <TableActions menus={menus} />;
        },
      },
    ];

    /**
     * 是否有购买供应链产品
     */
    const isShowSupplier = async () => {
      if (
        [SAASSHARE, SHARE].includes(apiExtraParams?.snapFlag) ||
        has(apiExtraParams, 'snapFlag')
      ) {
        setShowSupplier(true);
        return;
      }
      if (!getToken() && !isShare) {
        return;
      }
      const supplierBtn = await isBuySupplier();
      setShowSupplier(supplierBtn.data.data || false);
    };

    /**
     * 主动触发子组件表格更新
     */
    useImperativeHandle(cRef, () => ({
      /** 重新加载数据 */
      reset: async () => {
        childRef.current?.reset();
      },
    }));

    useMount(isShowSupplier);

    return (
      <div className={style.tableMain}>
        {canEditEmission ? (
          <div className={style.tableActions}>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              style={{
                width: '120px',
              }}
              onClick={() => {
                setEmissionSourceDrawerProps({
                  visible: true,
                });
              }}
            >
              {I18N.carbonFootprint.newEmissionSourcesAdded}
            </Button>
            <Button
              danger
              disabled={!selectedEmissions.length}
              onClick={batchDeleteTable}
            >
              {I18N.components.batchDeletion}
            </Button>
          </div>
        ) : null}

        <div ref={tableWrapperRef} className={style.tableWrapper}>
          <CommonTable<
            QuickAccountModelEmissionData,
            any,
            QuickAccounEmissionParams
          >
            bordered={false}
            pagePosition={false}
            searchParams={searchParamsData}
            cRef={childRef}
            pageSize={10}
            fetchApi={params =>
              getAccountingEmissionData({
                ...apiExtraParams,
                ...searchParamsData,
                pageNum: params.page,
                pageSize: params.size,
              })
            }
            scroll={{ x: 1200, y: tableScrollY }}
            returnFetchApi={returnFetchApi}
            columns={columns}
            rowKey='id'
            rowSelection={
              canEditEmission
                ? {
                    columnWidth: 48,
                    preserveSelectedRowKeys: true,
                    selectedRowKeys: selectedEmissions.map(item => item.id),
                    getCheckboxProps: item => ({
                      disabled:
                        item.aiFlag === 1 && !haveAccountAiPermissions(),
                    }),
                    onChange: (selectedRowKeys, selectedRows) => {
                      setSelectedEmissions(currentSelected => {
                        const selectedById = new Map(
                          [...currentSelected, ...selectedRows].map(item => [
                            String(item.id),
                            item,
                          ]),
                        );

                        return selectedRowKeys.flatMap(key => {
                          const selectedItem = selectedById.get(String(key));

                          return selectedItem ? [selectedItem] : [];
                        });
                      });
                    },
                  }
                : undefined
            }
          />
        </div>
        {menuInfo && (
          <EmissionSourceDrawer
            copyStatus={emissionCopyStatus}
            noSelectEmissionBtn={noSelectEmissionBtn}
            quickDrawerMatchWayBtnValue={quickDrawerMatchWayBtnValue}
            quickDrawerMatchWayBtns={quickDrawerMatchWayBtns}
            readPretty={isDetail}
            onlyCreateFactor={onlyCreateFactor}
            apiExtraParams={apiExtraParams}
            initValues={{
              type: menuInfo.type,
            }}
            stage={stage}
            {...emissionSourceDrawerProps}
            showSupplier={showSupplier}
            accountId={Number(id)}
            enableFactorSourceRange={
              enableFactorSourceRange &&
              !isDetail &&
              !emissionSourceDrawerProps.readPretty
            }
            factorPrefId={accountInfo.factorPrefId}
            onTransportReuseSuccess={() => {
              emissonCallBack();
              childRef.current?.reset();
            }}
            onSuccess={() => {
              closeEmissionDrawer();
              emissonCallBack();
              childRef.current?.reset();
            }}
            onClose={closeEmissionDrawer}
          />
        )}
        <EmissionDetailSheetDrawerDefault
          open={detailDrawerOpen}
          onClose={() => setDetailDrawerOpen(false)}
          isShare={
            [SAASSHARE, SHARE].includes(apiExtraParams?.snapFlag) ||
            has(apiExtraParams, 'snapFlag')
          }
          excelUrl={excelUrl}
          accountName={accountName}
          emissionName={detailDrawerEmissionName}
          stageName={detailDrawerStageName}
          emissionId={detailDrawerEmissionId}
          wpsSheetId={detailDrawerWpsSheetId}
          apiWpsSheetId={detailDrawerApiWpsSheetId}
          activeSheetIndex={detailDrawerSheetIndex}
          accountId={id}
        />
      </div>
    );
  },
);
