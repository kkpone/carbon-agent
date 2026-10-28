/* eslint-disable no-empty */
/*
 * @@description: 快速核算 - 核算管理
 */
import { PlusOutlined } from '@ant-design/icons';
import { listALLByDictTypeBatch } from '@src/api/api';
import { checkPermissions } from '@src/components/Permission/utils';
import { TableActions } from '@src/components/Table/components/TableActions';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import IconFont, { IconAlibaba } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { virtualLinkTransform } from '@src/router/route-paths';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { PageInfoType } from '@src/router/type';
import { setUrlSearchParams } from '@src/utils';
import { Toast } from '@src/utils/Toast';
import { Dicts } from '@src/views/emission/Show/type';
import { Button, Modal, Spin, Tooltip, Steps, Select } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { AxiosResponse } from 'axios';
import saveAs from 'file-saver';
import { throttle } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import '../../ProcessBusinessAccounting/index.less';
import styles from './index.module.less';
import { carbonFootprintQuickBusinessAccountingManagementTableCol } from './model';
import {
  MODEL_EMISSION_MATCH_WAY,
  MODEL_EMISSION_REQUEST_STATE,
  URL_QUICK_MODEL_KEY,
} from '../../BusinessAccountingModel/constant';
import {
  BusinessAccountingModelEmissionData,
  QuickModelMenusList,
} from '../../BusinessAccountingModel/type';
import businessAccount from '../../businessAccount.module.less';
import EmissionSourceDrawer, {
  EmissionSourceDrawerProps,
} from '../../component/EmissionSourceDrawer';
import TextWidthOverflow from '../../component/TextOverflowTable/byWidth';
import styleCarbonFootprint3 from '../../index.module.less';
import { BackTableData, QuickAccountLifeCycleStage } from '../../type';
import AccountGraph from '../AccountGraph';
import { getAccountView } from '../AccountGraph/service';
import { EmissionSource } from '../AccountGraph/type';
import CarbonFootprintResult from '../CarbonFootprintResult';
import QuickBusinessAccountingBasic from '../addBasic';
import { ACCOUNT_DISPLAY_TYPE, STEP_OPTION, URL_PARAMS_KEY } from '../constant';
import {
  geQuickBusinessAccountingMenus,
  getQuickBusinessAccountingEmissionData,
  getQuickBusinessAccountingInfo,
  postQuickBusinessAccountingEmissionDelete,
  postQuickBusinessAccountingEmissionExportExcel,
  postQuickBusinessAccountingEmissionInStore,
  postQuickBusinessAccountingEmissionUpdate,
  postQuickBusinessAccountingResult,
  postQuickBusinessAccountingScopeUpdate,
  postQuickBusinessAccountingToModel,
} from '../service';
import {
  AccountDisplayType,
  QuickBusinessAccountingEmissionParams,
  QuickBusinessAccountingInfo,
  QuickBusinessAccountingSourceUpdate,
} from '../type';
import { checkEmissionAccessPermissions } from '../utils';
import { ShareModelSubmitButton } from '../../component/ShareModelSubmitButton';

import classNames from 'classnames';

const { confirm } = Modal;

const QuickBusinessAccountingBasicManagement = () => {
  const { id } = useParams<{ id: string }>();

  const operatePermission = checkEmissionAccessPermissions();

  const formComponentRef = useRef<{
    isEdit: boolean;
    setIsEdit: (isEdit: boolean) => void;
    submit: () => Promise<void>;
  }>(null);

  const childRef = useRef<TableRef>();
  const history = useHistory();
  const { pathname } = history.location;
  /** 是否是查看状态 */
  const isDetail = pathname.includes('Detail');

  const paramsQuery = new URLSearchParams(location.search);

  const urlMenuActive = paramsQuery.get(URL_QUICK_MODEL_KEY.MENU_ACTIVE);

  const urlStep = paramsQuery.get(URL_PARAMS_KEY.STEP);

  const urlDisplay = paramsQuery.get(URL_PARAMS_KEY.DISPLAY);

  /** 快速核算的信息 */
  const [accountInfo, setAccountInfo] = useState<QuickBusinessAccountingInfo>();

  /** 菜单列表 */
  const [menus, setMenus] = useState<QuickModelMenusList[]>([]);

  /** 左侧菜单loading */
  const [mainLeftLoading, setMainLeftLoading] = useState<boolean>(false);

  /** 右侧菜单loading */
  const [mainRightLoading, setMminRightLoading] = useState<boolean>(false);

  /** 单位的字典值 */
  const [, setCascaderOptions] = useState<Dicts[]>([]);

  /** 基本详情的弹框 */
  const [showBasicModal, setShowBasicModal] = useState<boolean>(false);

  /** 选中的菜单数据 */
  const [menuActiveList, setMenuActiveList] = useState<
    QuickModelMenusList | undefined
  >(() => {
    if (urlMenuActive) {
      const data: QuickModelMenusList = JSON.parse(urlMenuActive);
      return data;
    }
    return undefined;
  });

  /** 查询的条件 */
  const [searchParamsData, setSearchParamsData] =
    useState<QuickBusinessAccountingEmissionParams>(() => {
      if (urlMenuActive) {
        const data: QuickModelMenusList = JSON.parse(urlMenuActive);
        return {
          accountId: id,
          stage: data.code,
        };
      }
      return {
        accountId: id,
        stage: 0,
      };
    });

  const [step, setStep] = useState(() =>
    urlStep !== null ? Number(urlStep) : STEP_OPTION[0].value,
  );

  const [displayType, setDisplayType] = useState<AccountDisplayType>(() => {
    if (
      ACCOUNT_DISPLAY_TYPE.TABLE === urlDisplay ||
      ACCOUNT_DISPLAY_TYPE.VISUALIZATION === urlDisplay
    ) {
      return urlDisplay;
    }
    return ACCOUNT_DISPLAY_TYPE.VISUALIZATION;
  });

  const [jumpToStep, setJumpToStep] = useState<number>();

  const [emissionSourceDrawerProps, setEmissionSourceDrawerProps] = useState<
    Pick<
      EmissionSourceDrawerProps,
      'visible' | 'emissionSourceId' | 'readPretty'
    >
  >({ visible: false });
  /**
   * @description: 获取模型的详情信息
   */
  const getModelInfo = async () => {
    const backInfo = await getQuickBusinessAccountingInfo({ id });
    setAccountInfo(backInfo.data.data);
    setMminRightLoading(false);
  };
  /**
   * @description: 获取菜单列表
   */
  const getMenus = async (option?: { isUpdateScope?: boolean }) => {
    setMainLeftLoading(true);
    setMminRightLoading(true);
    const backMenus = await geQuickBusinessAccountingMenus({ id });
    const { data } = backMenus.data;
    if (!urlMenuActive || option?.isUpdateScope) {
      setMenuActiveList(data[0]);
    }

    setMainLeftLoading(false);
    setMenus(data);
  };

  /**
   * @description: 被节流的函数
   */
  const throttleFunc = throttle(
    (menuInfo: QuickModelMenusList) => {
      // 替换路径上的参数
      // const urlParamsData = `?${
      //   URL_QUICK_MODEL_KEY.MENU_ACTIVE
      // }=${JSON.stringify(menuInfo)}`;
      // window.history.replaceState(null, '', urlParamsData);

      // setSearchParamsData({ ...searchParamsData, stage: menuInfo.code });
      setMenuActiveList(menuInfo);
    },
    1000,
    {
      leading: true,
      trailing: false,
    },
  );

  /**
   * @description: 点击菜单 - 采用节流方法防止频繁点击
   * @param {QuickModelMenusList} menuInfo 点击的菜单信息
   */
  const clickMenu = (menuInfo: QuickModelMenusList) => {
    throttleFunc(menuInfo);
  };

  /**
   * @description: 编辑
   * @param {BusinessAccountingModelEmissionData} itemInfo 被编辑数据的信息
   */
  const goEdit = async (itemInfo: BusinessAccountingModelEmissionData) => {
    const isSupplierMatchWay =
      Number(itemInfo.matchWay) === MODEL_EMISSION_MATCH_WAY.SUPPLIER;
    const isSelectedData =
      itemInfo.matchObject?.id !== null &&
      itemInfo.matchObject?.id !== undefined;
    setEmissionSourceDrawerProps({
      visible: true,
      emissionSourceId: itemInfo.id,
      readPretty:
        isSupplierMatchWay &&
        !isSelectedData &&
        MODEL_EMISSION_REQUEST_STATE.NOT_SUBMIT !== itemInfo.requestState,
    });
  };

  /**
   * @description: 详情
   * @param {BusinessAccountingModelEmissionData} itemInfo 数据的信息
   */
  const goDetail = async (itemInfo: BusinessAccountingModelEmissionData) => {
    setEmissionSourceDrawerProps({
      visible: true,
      emissionSourceId: itemInfo.id,
      readPretty: true,
    });
  };

  /**
   * @description: 删除列表数据
   * @param {BusinessAccountingModelEmissionData} deleteItem 被删除的行数据信息
   */
  const deleteTable = async (
    deleteItem: BusinessAccountingModelEmissionData,
  ) => {
    confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.template(I18N.carbonFootprint3.confirmDeletionOfThis11, {
        val1: deleteItem.name,
      }),

      okButtonProps: {
        danger: true,
      },
      icon: null,
      onOk: async () => {
        try {
          const back = await postQuickBusinessAccountingEmissionDelete({
            id: deleteItem.id,
          });
          if (back.data.code === 200) {
            childRef.current?.reset();
            Toast('success', I18N.carbonFootprint.deleteSuccessful);
          }
        } catch {
          /* empty */
        }
      },
    });
  };

  /**
   * @description: 更新数量
   * @param {QuickBusinessAccountingSourceUpdate} data 更新传递参数
   */
  const updateAmount = async (data: QuickBusinessAccountingSourceUpdate) => {
    const back = await postQuickBusinessAccountingEmissionUpdate(data);
    if (back.data.code === 200) {
      Toast('success', I18N.carbonFootprint3.updateSuccessful);
      childRef.current?.reset();
    }
  };

  /** 表头 */
  const columns: ColumnsType<BusinessAccountingModelEmissionData> = [
    ...carbonFootprintQuickBusinessAccountingManagementTableCol(
      updateAmount,
      isDetail,
    ),
    {
      title: I18N.carbonFootprint.operation,
      width: isDetail ? 100 : 200,
      fixed: 'right',
      dataIndex: 'set',
      render: (val, item: BusinessAccountingModelEmissionData) => {
        const menus = [
          {
            key: '1',
            label: I18N.carbonFootprint3.details,
            onClick: async () => {
              if (operatePermission) {
                await goEdit(item);
              } else {
                await goDetail(item);
              }
            },
          },
        ];

        // 是否已经保存到库 - 0未保存 1 已保存
        if (
          item.libState === 0 &&
          item.emissionTotal !== null &&
          Number(item.matchWay) !== MODEL_EMISSION_MATCH_WAY.SUPPLIER &&
          operatePermission
        ) {
          menus.push({
            key: '2',
            label: I18N.carbonFootprint3.saveToLibrary,
            onClick: async () => {
              try {
                const back = await postQuickBusinessAccountingEmissionInStore({
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

        if (operatePermission) {
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

  /**  表格数据格式  */
  const returnFetchApi = (
    back: AxiosResponse<
      AxiosResponse<BackTableData<BusinessAccountingModelEmissionData>>
    >,
  ) => ({
    data: back.data.data.rows,
    count: back.data.data.total,
  });

  /**
   * @description: 导出文件
   */
  const exportExcel = async () => {
    Toast('success', I18N.carbonFootprint.startDownloading);
    const back = await postQuickBusinessAccountingEmissionExportExcel({ id });

    if (back.data.code === 200) {
      saveAs(back.data.data);
    } else {
      Toast('error', I18N.carbonFootprint3.downloadFailed);
    }
  };

  /**
   * @description: 初始化
   */
  const init = async (option?: { isUpdateScope?: boolean }) => {
    await getMenus(option);
    await getModelInfo();
    const dic = await listALLByDictTypeBatch<{ factorUnitM: Dicts[] }>({
      dictTypes: 'factorUnitM',
    });
    setCascaderOptions(dic.data.data.factorUnitM);
  };

  const selectScope = async (scope: number) => {
    try {
      await postQuickBusinessAccountingScopeUpdate({ id, scope });
      Toast('success', I18N.carbonFootprint3.updateSuccessful);
      init({ isUpdateScope: true });
    } catch {}
  };

  const closeEmissionDrawer = () => {
    setEmissionSourceDrawerProps({ visible: false });
  };

  /**
   * @description 去建模
   */
  const modeling = async () => {
    try {
      await postQuickBusinessAccountingToModel({ id });
      await getModelInfo();
      setStep(STEP_OPTION[1].value);
      setDisplayType(ACCOUNT_DISPLAY_TYPE.VISUALIZATION);
    } catch {}
  };

  /**
   * @description 校验所有的排放源是否信息完整
   */
  const checkEmissions: () => Promise<boolean> = async () => {
    try {
      if (accountInfo?.accountStatus === STEP_OPTION[2].value) {
        return true;
      }
      const resp = await getAccountView({ id });
      const emissionList = (resp.data.data.children || []).reduce(
        (list: EmissionSource[], lifeCycle) => [
          ...list,
          ...lifeCycle.emissionList,
        ],
        [],
      );
      return emissionList
        .filter(
          emission => emission.matchWay !== MODEL_EMISSION_MATCH_WAY.SUPPLIER,
        )
        .every(emission => emission.emissionTotal !== null);
    } catch {
      return false;
    }
  };

  /**
   * @description 生成碳足迹结果
   */
  const generateResult = async () => {
    try {
      if (await checkEmissions()) {
        await postQuickBusinessAccountingResult({ id });
        await getModelInfo();
        setStep(STEP_OPTION[2].value);
        setDisplayType(ACCOUNT_DISPLAY_TYPE.VISUALIZATION);
      } else {
        Toast('warn', I18N.carbonFootprint3.pleaseIdentifyTheEmissionSource);
      }
    } catch {}
  };

  const closeWarnModal = () => {
    setJumpToStep(undefined);
  };

  /**
   * @description: 生成报告
   */
  const goAddReport = () => {
    if (accountInfo) {
      history.push(
        virtualLinkTransform(
          RouteMapsCorbonFootprint3.carbonFootprint3ProcessReportInfo,
          [':pageInfoType', ':id', ':comparisonId'],
          [PageInfoType.add, accountInfo.id, 'null'],
        ),
      );
    }
  };

  const changeStep = (toStep: number) => {
    if (step === STEP_OPTION[0].value && formComponentRef.current?.isEdit) {
      setJumpToStep(toStep);
    } else {
      setStep(toStep);
    }
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    // 替换路径上的参数
    if (menuActiveList) {
      setUrlSearchParams(
        URL_QUICK_MODEL_KEY.MENU_ACTIVE,
        JSON.stringify(menuActiveList),
      );
      setSearchParamsData({ accountId: id, stage: menuActiveList.code });
    }
  }, [menuActiveList]);

  useEffect(() => {
    setUrlSearchParams(URL_PARAMS_KEY.STEP, String(step));
  }, [step]);

  useEffect(() => {
    setUrlSearchParams(URL_PARAMS_KEY.DISPLAY, displayType);
  }, [displayType]);

  return (
    <Modal
      destroyOnClose
      open
      className='businessAccountingFillModal'
      width='100%'
      title={undefined}
      footer={null}
      closable={false}
      transitionName=''
    >
      <Modal
        open={jumpToStep !== undefined}
        title={I18N.carbonFootprint.prompt}
        bodyStyle={{
          padding: '20px 24px',
        }}
        footer={
          <div>
            <Button onClick={closeWarnModal}>
              {I18N.carbonFootprint.cancel}
            </Button>
            <Button
              onClick={() => {
                if (jumpToStep !== undefined) {
                  setStep(jumpToStep);
                  closeWarnModal();
                }
              }}
            >
              {I18N.carbonFootprint3.confirmSwitch}
            </Button>
            <Button
              type='primary'
              onClick={async () => {
                if (formComponentRef.current && jumpToStep !== undefined) {
                  try {
                    await formComponentRef.current.submit();
                    setStep(jumpToStep);
                    getModelInfo();
                  } finally {
                    closeWarnModal();
                  }
                }
              }}
            >
              {I18N.carbonFootprint3.saveAndSwitch}
            </Button>
          </div>
        }
        onCancel={closeWarnModal}
      >
        <div>{I18N.carbonFootprint3.theCurrentPageIsNotYetAvailable}</div>
      </Modal>
      <section className={styles.stepBox}>
        <div
          onClick={() => {
            // history.push(
            //   RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccounting,
            // );
            history.push(
              `${RouteMapsCorbonFootprint3.carbonFootprint3FootprintProductDetail}?productId=${accountInfo?.productId}`,
            );
          }}
          className={styles.stepBoxBack}
        >
          <IconFont
            type='icon-icon-zuojiantou'
            style={{ fontSize: 24, marginRight: 8 }}
          />
          <span>{I18N.carbonFootprint3.quickAccounting2}</span>
          <TextWidthOverflow
            width={300}
            value={`${accountInfo?.accountName || '-'}`}
          />
          <span>）</span>
        </div>
        <Steps
          className={styles.stepsClass}
          current={step}
          onChange={changeStep}
        >
          {STEP_OPTION.map(({ title, value }) => (
            <Steps.Step
              key={value}
              title={title}
              disabled={!accountInfo || value > accountInfo.accountStatus}
            />
          ))}
        </Steps>

        {step === STEP_OPTION[1].value &&
          checkPermissions(
            <div className={styles.stepBoxGoResut}>
              <Button type='primary' onClick={generateResult}>
                {I18N.carbonFootprint3.generateCarbonFootprint}
              </Button>
            </div>,
            'footprint3:account:finish:fast',
          )}

        {step === STEP_OPTION[2].value && accountInfo && (
          <ShareModelSubmitButton
            accountId={accountInfo.id}
            shareStatus={accountInfo.shareStatus}
            permissionCode='footprint3:account:finish:fast'
            wrapperClassName={styles.stepBoxGoResut}
            onSuccess={getModelInfo}
          />
        )}

        {step === STEP_OPTION[2].value &&
          checkPermissions(
            <div className={styles.stepBoxGoResut}>
              <Button type='primary' onClick={goAddReport}>
                {I18N.carbonFootprint.generateReport}
              </Button>
            </div>,
            'footprint3:account:finish:fast',
          )}
      </section>
      <div className={styles.businessAccountTingMainDiv}>
        {step === STEP_OPTION[0].value && (
          <QuickBusinessAccountingBasic
            id={id}
            isDetails
            managementFill
            ref={formComponentRef}
            onEditSuccess={async toView => {
              await getModelInfo();
              if (toView) {
                setStep(STEP_OPTION[1].value);
                setDisplayType(ACCOUNT_DISPLAY_TYPE.VISUALIZATION);
              }
            }}
            modeling={modeling}
          />
        )}
        {step === STEP_OPTION[1].value && (
          <div
            className={`${styleCarbonFootprint3.carbonFootprint3} ${businessAccount.businessAccountTingMain} m-b-60`}
          >
            {displayType === ACCOUNT_DISPLAY_TYPE.TABLE && (
              <>
                <div className={businessAccount.quickManagementDataTitle}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span
                      className={businessAccount.quickManagementDataTitleColor}
                    >
                      {I18N.carbonFootprint3.functionalUnits2}
                    </span>
                    {accountInfo?.accountName &&
                    accountInfo.accountName.length > 30 ? (
                      <Tooltip title={accountInfo?.accountName}>
                        <span
                          style={{
                            width: '300px',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            display: 'inline-block',
                            alignItems: 'center',
                          }}
                        >
                          {accountInfo?.accountName}
                        </span>
                      </Tooltip>
                    ) : (
                      <span>{accountInfo?.accountName}</span>
                    )}

                    <span
                      className={`${businessAccount.quickManagementDataTitleColor} m-l-30`}
                    >
                      {I18N.carbonFootprint.accountingCycle2}
                    </span>
                    <span>
                      {accountInfo?.startTime}
                      {I18N.carbonFootprint.to}
                      {accountInfo?.endTime}
                    </span>
                    <span className={styles.selectScopeBorder} />
                    {checkPermissions(
                      <Select
                        className={styles.quickListScope}
                        bordered={false}
                        value={accountInfo?.scope}
                        onChange={selectScope}
                        options={[
                          {
                            label: I18N.carbonFootprint3.halfLifeCycle,
                            value: 0,
                          },
                          {
                            label: I18N.carbonFootprint3.fullLifecycle,
                            value: 1,
                          },
                        ]}
                      />,
                      'footprint3:account:save:fast',
                    )}
                  </div>
                  {isDetail ? (
                    <Button
                      onClick={() => {
                        setShowBasicModal(true);
                      }}
                    >
                      {I18N.carbonFootprint3.viewDetails}
                    </Button>
                  ) : (
                    <div>
                      {operatePermission && (
                        <>
                          <span
                            onClick={() => {
                              history.push(
                                `${RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingManagementImportSource}/${id}/${searchParamsData.stage}${location.search}`,
                              );
                            }}
                            className={styles.importAndOutMain}
                          >
                            <IconAlibaba
                              type='icon-icon_daoru'
                              style={{ fontSize: 16, marginRight: 4 }}
                            />
                            {I18N.carbonFootprint.importEmissionSources}
                          </span>
                          <span className={styles.selectScopeBorder} />
                        </>
                      )}

                      <span
                        onClick={exportExcel}
                        className={classNames(
                          styles.importAndOutMain,
                          'm-l-16',
                        )}
                      >
                        <IconAlibaba
                          type='icon-icon_daochu'
                          style={{
                            fontSize: 16,
                            marginRight: 4,
                          }}
                        />
                        {I18N.carbonFootprint3.exportEmissionSources}
                      </span>
                      <span className={styles.selectScopeBorder} />
                      <span
                        className={classNames(
                          styles.importAndOutMain,
                          'm-l-16',
                        )}
                        onClick={() =>
                          setDisplayType(ACCOUNT_DISPLAY_TYPE.VISUALIZATION)
                        }
                      >
                        <IconAlibaba
                          type='icon-icon_qiehuanzhikeshihua'
                          style={{
                            fontSize: 16,
                          }}
                        />
                        <span className='m-l-6'>
                          {I18N.carbonFootprint3.switchToVisual}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
                <div className={businessAccount.businessAccountMain}>
                  <div className={businessAccount.businessAccountLeft}>
                    <Spin spinning={mainLeftLoading}>
                      <div className={businessAccount.quickManagementMenuMain}>
                        {menus.map((d, dIndex) => (
                          <div
                            key={d.code}
                            onClick={() => {
                              clickMenu(d);
                            }}
                            className={`${
                              businessAccount.quickManagementMenu
                            } ${
                              Number(menuActiveList?.code) === dIndex
                                ? businessAccount.quickManagementMenuActive
                                : ''
                            }`}
                          >
                            {d.name}
                          </div>
                        ))}
                      </div>
                    </Spin>
                  </div>
                  <div className={businessAccount.businessAccountRight}>
                    <Spin spinning={mainRightLoading}>
                      <div className={businessAccount.quickManagementDataMain}>
                        {operatePermission && (
                          <div className='m-t-16'>
                            <Button
                              type='primary'
                              icon={<PlusOutlined />}
                              onClick={() =>
                                setEmissionSourceDrawerProps({
                                  visible: true,
                                })
                              }
                            >
                              {I18N.carbonFootprint.newEmissionSourcesAdded}
                            </Button>
                          </div>
                        )}

                        <div className='m-t-16'>
                          <CommonTable<
                            BusinessAccountingModelEmissionData,
                            any,
                            QuickBusinessAccountingEmissionParams
                          >
                            bordered={false}
                            searchParams={searchParamsData}
                            cRef={childRef}
                            pageSize={10}
                            scroll={{ x: 1200 }}
                            fetchApi={params =>
                              getQuickBusinessAccountingEmissionData({
                                ...searchParamsData,
                                pageNum: params.page,
                                pageSize: params.size,
                              })
                            }
                            returnFetchApi={returnFetchApi}
                            columns={columns}
                            rowKey='id'
                            pagePosition={false}
                          />
                        </div>
                      </div>
                    </Spin>
                  </div>
                </div>
              </>
            )}
            {displayType === ACCOUNT_DISPLAY_TYPE.VISUALIZATION && (
              <AccountGraph
                id={Number(id)}
                accountInfo={accountInfo}
                toggleDisplayType={() =>
                  setDisplayType(ACCOUNT_DISPLAY_TYPE.TABLE)
                }
                onImport={() => {
                  history.push(
                    `${RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingManagementImportSource}/${id}/${searchParamsData.stage}${location.search}`,
                  );
                }}
                onSelectScopeSuccess={async () => {
                  await init({ isUpdateScope: true });
                }}
              />
            )}
            <Modal
              width={1000}
              title={I18N.carbonFootprint3.accountingDetails}
              maskClosable={false}
              getContainer={false}
              open={showBasicModal}
              okButtonProps={{
                style: {
                  display: 'none',
                },
              }}
              cancelText={I18N.carbonFootprint3.close}
              onCancel={() => setShowBasicModal(false)}
            >
              <QuickBusinessAccountingBasic id={id} modalDetail />
            </Modal>
          </div>
        )}
        {step === STEP_OPTION[2].value && (
          <div
            className={`${styleCarbonFootprint3.carbonFootprint3} ${businessAccount.businessAccountTingMain}`}
          >
            <CarbonFootprintResult
              accountId={Number(id)}
              accountInfo={accountInfo}
              getModelInfo={getModelInfo}
            />
          </div>
        )}
      </div>
      <EmissionSourceDrawer
        stage={menuActiveList?.code as QuickAccountLifeCycleStage}
        {...emissionSourceDrawerProps}
        accountId={Number(id)}
        onSuccess={() => {
          closeEmissionDrawer();
          childRef.current?.reset();
        }}
        onClose={closeEmissionDrawer}
      />
    </Modal>
  );
};

export default QuickBusinessAccountingBasicManagement;
