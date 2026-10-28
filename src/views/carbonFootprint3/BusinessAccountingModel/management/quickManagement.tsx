/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-02-09 11:02:30
 * @Date: 2023-01-09 15:19:51
 * @@description: 核算模型 - 快速核算
 */
import { PlusOutlined } from '@ant-design/icons';
import { listALLByDictTypeBatch } from '@src/api/api';
import { FormActions } from '@src/components/FormActions';
import { TableActions } from '@src/components/Table/components/TableActions';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import I18N from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { Toast } from '@src/utils/Toast';
import { Dicts } from '@src/views/emission/Show/type';
import { Button, Modal, Spin } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { AxiosResponse } from 'axios';
import { throttle } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { carbonFootprintModelEmissionTableCol } from './model';
import businessAccount from '../../businessAccount.module.less';
import styleCarbonFootprint3 from '../../index.module.less';
import { BackTableData } from '../../type';
import BusinessAccountingModelBasic from '../addBasic';
import { URL_QUICK_MODEL_KEY } from '../constant';
import {
  getBusinessAccountingModelEmissionInfo,
  getQuickModelEmissionData,
  getQuickModelInfo,
  getQuickModelMenus,
  postBusinessAccountingModelEmissionDelete,
  postBusinessAccountingModelEmissionSave,
} from '../service';
import {
  BusinessAccountingModelEmissionData,
  BusinessAccountingModelEmissionParams,
  BusinessAccountingModelInfo,
  QuickModelMenusList,
} from '../type';

const { confirm } = Modal;

const BusinessAccountingQuickManagement = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const { pathname } = history.location;
  /** 是否是查看状态 */
  const isDetail = pathname.includes('Detail');

  const childRef = useRef<TableRef>();

  const paramsQuery = new URLSearchParams(location.search);

  const urlMenuActive = paramsQuery.get(URL_QUICK_MODEL_KEY.MENU_ACTIVE);

  /** 左侧菜单loading */
  const [mainLeftLoading, setMainLeftLoading] = useState<boolean>(false);

  /** 右侧菜单loading */
  const [mainRightLoading, setMminRightLoading] = useState<boolean>(false);

  /** 模型的信息 */
  const [modelInfo, setModelInfo] = useState<BusinessAccountingModelInfo>();

  /** 菜单列表 */
  const [menus, setMenus] = useState<QuickModelMenusList[]>([]);

  /** 单位的字典值 */
  const [cascaderOptions, setCascaderOptions] = useState<Dicts[]>([]);

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
    useState<BusinessAccountingModelEmissionParams>(() => {
      if (urlMenuActive) {
        const data: QuickModelMenusList = JSON.parse(urlMenuActive);
        return {
          modelId: id,
          stage: data.code,
        };
      }
      return {
        modelId: id,
        stage: 0,
      };
    });

  /**
   * @description: 获取详情数据
   * @param {BusinessAccountingModelEmissionData} item 选中的数据
   */
  const getItemInfo = async (item: BusinessAccountingModelEmissionData) => {
    const back = await getBusinessAccountingModelEmissionInfo({
      id: `${item.id}`,
    });

    const { data } = back.data;
    const { factorObj, typeExtra } = data;

    // 获取数量单位的code
    const child = cascaderOptions.find(op => op.dictValue === data.unitCode);
    const parent = cascaderOptions.find(
      op => op.dictValue === child?.sourceType,
    );
    const unitData =
      parent && child ? [parent.dictValue, child.dictValue] : undefined;

    const formValues = {
      ...data,
      unitData,
      typeExtraWay: 1,
      factorObj: { ...factorObj, rate: data.rate },
      specificationWay2Numerator: '',
    };

    // 处理运输情况
    if (typeExtra) {
      // 产品重量
      if (typeExtra.way === 1) {
        formValues.specificationWay2Numerator = typeExtra.unitName;
      }

      // 载重比
      if (typeExtra.way === 2) {
        // 载重比单位信息是禁止选择的，所以不需要赋值，都是默认值
        // formValues.specificationWay3Numerator = typeExtra.unitName;
        // formValues.specificationWay3Denominator = typeExtra.distUnitName || '';
      }

      // 按能耗
      if (typeExtra.way === 3) {
        // 单位信息在外层有unitCode，所以上面的unitData 已经处理掉了,不需要单独处理了
      }

      // 同步类型
      formValues.typeExtraWay = typeExtra.way;
    }

    return formValues;
  };

  /**
   * @description: 跳转编辑页面
   * @param {BusinessAccountingModelEmissionData} item 编辑的数据
   */
  const goEdit = async (item: BusinessAccountingModelEmissionData) => {
    const formValues = await getItemInfo(item);

    // 增加编辑状态下第一次不自动调用单位换算比例开关
    localStorage.setItem('RateAutoStatus', 'false');

    history.push(
      `${
        RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingQuickManagementEditSource
      }/${id}/${searchParamsData.stage}?${
        URL_QUICK_MODEL_KEY.MENU_ACTIVE
      }=${JSON.stringify(menuActiveList)}&${URL_QUICK_MODEL_KEY.DETAIL_ID}=${
        item.id
      }&${URL_QUICK_MODEL_KEY.FORM_VALUES}=${JSON.stringify(formValues)}`,
    );
  };

  /**
   * @description: 跳转详情页面
   * @param {BusinessAccountingModelEmissionData} item 查看的数据
   */
  const goDetail = async (item: BusinessAccountingModelEmissionData) => {
    const formValues = await getItemInfo(item);

    // 增加编辑状态下第一次不自动调用单位换算比例开关
    localStorage.setItem('RateAutoStatus', 'false');

    const baseUrl = isDetail
      ? RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingQuickManagementDetailSourceDetail
      : RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingQuickManagementDetailSource;

    history.push(
      `${baseUrl}/${id}/${searchParamsData.stage}?${
        URL_QUICK_MODEL_KEY.MENU_ACTIVE
      }=${JSON.stringify(menuActiveList)}&${
        URL_QUICK_MODEL_KEY.FORM_VALUES
      }=${JSON.stringify(formValues)}`,
    );
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
      content: I18N.template(I18N.carbonFootprint3.confirmDeletionOfThis2, {
        val1: deleteItem.name,
      }),

      okButtonProps: {
        danger: true,
      },
      icon: null,
      onOk: async () => {
        try {
          const back = await postBusinessAccountingModelEmissionDelete({
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
   * @description: 保存到库
   * @param {BusinessAccountingModelEmissionData} saveItem
   */
  const saveStore = async (saveItem: BusinessAccountingModelEmissionData) => {
    const back = await postBusinessAccountingModelEmissionSave({
      id: saveItem.id,
    });
    if (back.data.code === 200) {
      Toast('success', I18N.carbonFootprint3.hasBeenSavedToTheQueue);
    }
  };

  /** 表头 */
  const columns: ColumnsType<BusinessAccountingModelEmissionData> = [
    ...carbonFootprintModelEmissionTableCol(),
    {
      title: I18N.carbonFootprint.operation,
      width: 150,
      fixed: 'right',
      dataIndex: 'set',
      render: (val, item: BusinessAccountingModelEmissionData) =>
        isDetail ? (
          <span
            style={{ color: '#0cbf9f', cursor: 'pointer' }}
            onClick={async () => {
              await goDetail(item);
            }}
          >
            {I18N.carbonFootprint.check}
          </span>
        ) : (
          <TableActions
            menus={[
              {
                key: '1',
                label: I18N.carbonFootprint.edit,
                onClick: async () => {
                  await goEdit(item);
                },
              },
              {
                key: '2',
                label: I18N.carbonFootprint.delete,
                onClick: async () => {
                  await deleteTable(item);
                },
              },
              {
                key: '3',
                label: I18N.carbonFootprint.check,
                onClick: async () => {
                  await goDetail(item);
                },
              },
              {
                key: '4',
                label: I18N.carbonFootprint3.saveToLibrary,
                onClick: async () => {
                  await saveStore(item);
                },
              },
            ]}
          />
        ),
    },
  ];

  /**
   * @description: 获取模型的详情信息
   */
  const getModelInfo = async () => {
    const backInfo = await getQuickModelInfo({ id });
    setModelInfo(backInfo.data.data);
    setMminRightLoading(false);
  };
  /**
   * @description: 获取菜单列表
   */
  const getMenus = async () => {
    setMainLeftLoading(true);
    setMminRightLoading(true);
    const backMenus = await getQuickModelMenus({ id });
    const { data } = backMenus.data;
    if (!urlMenuActive) {
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
      const urlParamsData = `?${
        URL_QUICK_MODEL_KEY.MENU_ACTIVE
      }=${JSON.stringify(menuInfo)}`;
      window.history.replaceState(null, '', urlParamsData);

      setSearchParamsData({ ...searchParamsData, stage: menuInfo.code });
      setMenuActiveList(menuInfo);
    },
    1000,
    {
      leading: true,
      trailing: false,
    },
  );
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
   * @description: 点击菜单 - 采用节流方法防止频繁点击
   * @param {QuickModelMenusList} menuInfo 点击的菜单信息
   */
  const clickMenu = (menuInfo: QuickModelMenusList) => {
    throttleFunc(menuInfo);
  };

  /**
   * @description: 初始化
   */
  const init = async () => {
    await getMenus();
    await getModelInfo();
    const dic = await listALLByDictTypeBatch<{ factorUnitM: Dicts[] }>({
      dictTypes: 'factorUnitM',
    });
    setCascaderOptions(dic.data.data.factorUnitM);
  };
  useEffect(() => {
    init();
  }, []);
  return (
    <div
      className={`${styleCarbonFootprint3.carbonFootprint3} ${businessAccount.businessAccountTingMain} m-b-60`}
    >
      <div className={businessAccount.businessAccountMain}>
        <div className={businessAccount.businessAccountLeft}>
          <Spin spinning={mainLeftLoading}>
            <div className={businessAccount.quickManagementMenuMain}>
              {menus.map((d, dIndex) => (
                <div
                  onClick={() => {
                    clickMenu(d);
                  }}
                  className={`${businessAccount.quickManagementMenu} ${
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
              <div className={businessAccount.quickManagementDataTitle}>
                <div>
                  <span>{I18N.carbonFootprint3.functionalUnits2}</span>
                  <span className='font-weight600'>
                    {modelInfo?.accountName}
                  </span>
                  <span style={{ marginLeft: 32 }}>
                    {I18N.carbonFootprint3.modelName}
                  </span>
                  <span className='font-weight600'>{modelInfo?.modelName}</span>
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
                    <Button
                      icon={<PlusOutlined />}
                      style={{ width: 90 }}
                      onClick={() => {
                        history.push(
                          `${
                            RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingQuickManagementAddSource
                          }/${id}/${searchParamsData.stage}?${
                            URL_QUICK_MODEL_KEY.MENU_ACTIVE
                          }=${JSON.stringify(menuActiveList)}`,
                        );
                      }}
                      className={`${styleCarbonFootprint3.btn}`}
                      type='primary'
                    >
                      {I18N.carbonFootprint.newAddition}
                    </Button>
                    <Button
                      onClick={() => {
                        history.push(
                          `${
                            RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingQuickManagementSelectSource
                          }/${id}/${searchParamsData.stage}?${
                            URL_QUICK_MODEL_KEY.MENU_ACTIVE
                          }=${JSON.stringify(menuActiveList)}`,
                        );
                      }}
                      className='m-l-10'
                    >
                      {I18N.carbonFootprint3.selectingEmissionSources}
                    </Button>
                    {/* <Button className='m-l-10'>导入</Button> */}
                  </div>
                )}
              </div>
              <div className='m-t-16'>
                <CommonTable<
                  BusinessAccountingModelEmissionData,
                  any,
                  BusinessAccountingModelEmissionParams
                >
                  bordered={false}
                  searchParams={searchParamsData}
                  cRef={childRef}
                  pageSize={10}
                  scroll={{ x: 1200 }}
                  fetchApi={params =>
                    getQuickModelEmissionData({
                      ...searchParamsData,
                      pageNum: params.page,
                      pageSize: params.size,
                    })
                  }
                  returnFetchApi={returnFetchApi}
                  columns={columns}
                  rowKey='id'
                  pagePosition
                />
              </div>
            </div>
          </Spin>
        </div>
      </div>
      <Modal
        width={800}
        title={I18N.carbonFootprint3.modelDetails}
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
        <BusinessAccountingModelBasic id={id} modalDetail />
      </Modal>
      <FormActions
        place='center'
        buttons={[
          {
            title: I18N.carbonFootprint.return,
            onClick: async () => {
              history.push(
                RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingModel,
              );
            },
          },
        ]}
      />
    </div>
  );
};

export default BusinessAccountingQuickManagement;
