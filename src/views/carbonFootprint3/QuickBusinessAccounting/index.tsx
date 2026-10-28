/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-20 10:33:46
 * @Date: 2022-12-23 15:45:59
 * @@description: 快速核算列表
 */

import { PlusOutlined } from '@ant-design/icons';
import { FormGrid, FormItem, FormLayout, Radio } from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { formPropsInit } from '@src/components/FormUtil/util';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import { checkPermissions } from '@src/components/Permission/utils';
import SearchFormUtil from '@src/components/SearchForm';
import { TableActions } from '@src/components/Table/components/TableActions';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import I18N from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { Toast } from '@src/utils/Toast';
import { Button, Form, FormProps, Input, Modal, Select, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { AxiosResponse } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import QuickBusinessAccountingSelectModel from './addBasic/selectModel';
import './index.less';
import {
  ACCOUNT_DISPLAY_TYPE,
  ACCOUNT_STATUS,
  URL_PARAMS_KEY,
} from './constant';
import {
  BusinessAccountinInModelRadioSchema,
  BusinessAccountinInModelSchema,
  carbonFootprintQuickBusinessAccountingSearchForm,
  carbonFootprintQuickBusinessAccountingTableCol,
} from './model';
import {
  getQuickBusinessAccountingTableData,
  postQuickBusinessAccountingDeleteBasic,
  postQuickBusinessAccountingEmissionInModel,
} from './service';
import {
  QuickBusinessAccountingTableData,
  QuickBusinessAccountingTableParams,
} from './type';
import { BusinessAccountingModelAdd } from '../BusinessAccountingModel/type';
import ModelShareModal from '../FootprintAccount/component/ModelShareModal';
import ModelShareRecordModal from '../FootprintAccount/component/ModelShareRecordModal';
import { ProductAccountingList } from '../FootprintAccount/component/ProductSelectAccount/type';
import styleCarbonFootprint3 from '../index.module.less';
import {
  canShowModelShareAction,
  canShowShareRecordAction,
  isCollectingSharedAccount,
} from '../share';
import { BackTableData } from '../type';
import { getHasModelNum } from './CarbonFootprintResult/service';

const { confirm } = Modal;

const CarbonFootprint3QuickBusinessAccounting = () => {
  const history = useHistory();
  const childRef = useRef<TableRef>();
  const [searchForm] = Form.useForm();

  /** 查询的条件 */
  const [searchParamsData, setSearchParamsData] =
    useState<QuickBusinessAccountingTableParams>();

  /** 新增核算 - 选择模型 */
  const [visibleSelectModel, setVisibleSelectModel] = useState(false);

  /** 基本详情的弹框 */
  const [showInModelModal, setShowInModelModal] = useState<boolean>(false);

  /** 核算状态当前选中的值 */
  const [selectStatusNum, setSelectStatusNum] = useState<number[]>([]);
  const [showSelectPropver, setShowSelectPropver] = useState(false);

  /** 当前操作的哪项表格数据 */
  const [tableListInfo] = useState<QuickBusinessAccountingTableData>();

  /** 模型共享弹窗 */
  const [modelShareAccount, setModelShareAccount] =
    useState<QuickBusinessAccountingTableData | null>(null);

  /** 共享记录弹窗 */
  const [modelShareRecordAccount, setModelShareRecordAccount] =
    useState<QuickBusinessAccountingTableData | null>(null);

  /** 搜索的form */
  const searchFormProps: FormProps = {
    ...formPropsInit(),
    layout: 'inline',
    form: searchForm,
  };

  // 用来创建表单核心领域模型，它是作为MVVM设计模式的标准 ViewModel
  const form = createForm();
  // 创建一个 SchemaField 组件用于解析JSON-Schema动态渲染表单的组件
  const SchemaField = createSchemaField({
    // 组件列表
    components: {
      FormLayout,
      FormGrid,
      FormItem,
      Input,
      Select,
      Radio,
    },
  });

  /**
   * @description: 新增核算
   */
  const goAdd = async () => {
    const { data } = await getHasModelNum({ type: 0 });
    if (data.data.hasModel === 1) {
      setVisibleSelectModel(true);
    } else {
      history.push(
        RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingAddBasic,
      );
    }
  };

  /**
   * @description: 删除列表数据
   * @param {ProductLibraryTableData} deleteItem 被删除的行数据信息
   */
  const deleteTable = async (deleteItem: QuickBusinessAccountingTableData) => {
    confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.template(I18N.carbonFootprint3.confirmDeletionOfThis10, {
        val1: deleteItem.accountName,
      }),

      okButtonProps: {
        danger: true,
      },
      icon: null,
      onOk: async () => {
        try {
          const back = await postQuickBusinessAccountingDeleteBasic({
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
   * @description: 核算状态筛选
   * @param {number} selectNum 当前选中的状态
   */
  const onConfirmClick = (selectNum: number[]) => {
    setSelectStatusNum(selectNum);
    setShowSelectPropver(false);
  };

  /** 表头 */
  const columns: ColumnsType<QuickBusinessAccountingTableData> = [
    ...carbonFootprintQuickBusinessAccountingTableCol(
      onConfirmClick,
      showSelectPropver,
      setShowSelectPropver,
    ),
    {
      title: I18N.carbonFootprint.operation,
      width: 200,
      fixed: 'right',
      dataIndex: 'set',
      render: (val, item: QuickBusinessAccountingTableData) => {
        const menus = [
          checkPermissions(
            {
              key: '1',
              label: I18N.carbonFootprint3.details,
              onClick: async () => {
                const urlParams = `?${URL_PARAMS_KEY.STEP}=${
                  item.accountStatus
                }${
                  item.accountStatus === ACCOUNT_STATUS.MODELING
                    ? `&${URL_PARAMS_KEY.DISPLAY}=${ACCOUNT_DISPLAY_TYPE.VISUALIZATION}`
                    : ''
                }`;
                history.push(
                  `${RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingManagement}/${item.id}${urlParams}`,
                );
              },
            },
            'footprint3:account:info:fast',
          ),
          checkPermissions(
            {
              key: '2',
              label: I18N.carbonFootprint3.modelShare,
              onClick: async () => {
                setModelShareAccount(item);
              },
            },
            canShowModelShareAction({
              accountStatus: item.accountStatus,
              finishStatus: ACCOUNT_STATUS.FINISHED,
              shareFlag: item.shareFlag,
            })
              ? 'footprint3:share:add'
              : '',
          ),
          checkPermissions(
            {
              key: 'shareRecord',
              label: I18N.carbonFootprint3.sharedRecord,
              onClick: async () => {
                setModelShareRecordAccount(item);
              },
            },
            canShowShareRecordAction(item.shareFlag)
              ? 'footprint3:account:info:fast'
              : '',
          ),
          checkPermissions(
            {
              key: '3',
              label: I18N.carbonFootprint.copy,
              onClick: async () => {
                history.push(
                  `${RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingCopyBasic}/${item.id}`,
                );
              },
            },
            'footprint3:account:copy:fast',
          ),
          checkPermissions(
            {
              key: '4',
              label: isCollectingSharedAccount(item.shareFlag) ? (
                <Tooltip
                  title={I18N.carbonFootprint3.sharedAccountDeleteDisabledTip}
                >
                  <span style={{ display: 'inline-block' }}>
                    {I18N.carbonFootprint.delete}
                  </span>
                </Tooltip>
              ) : (
                I18N.carbonFootprint.delete
              ),
              disabled: isCollectingSharedAccount(item.shareFlag),
              onClick: async () => {
                if (isCollectingSharedAccount(item.shareFlag)) return;
                await deleteTable(item);
              },
            },
            'footprint3:account:delete:fast',
          ),
        ].filter(menuItem => menuItem !== null) as {
          key: string;
          label: string;
          onClick: () => Promise<void>;
        }[];
        return <TableActions menus={menus} />;
      },
    },
  ];
  /**  表格数据格式  */
  const returnFetchApi = (
    back: AxiosResponse<
      AxiosResponse<BackTableData<QuickBusinessAccountingTableData>>
    >,
  ) => ({
    data: back.data.data.rows,
    count: back.data.data.total,
  });
  /** 搜索提交 */
  const searchSub = () => {
    const val: QuickBusinessAccountingTableParams = searchForm.getFieldsValue();
    setSearchParamsData({
      ...searchParamsData,
      ...val,
    });
  };

  /** 搜索重置 */
  const resetBack = () => {
    setSearchParamsData(undefined);
  };

  /**
   * @description: 保存到模型
   */
  const subInModelForm = async () => {
    if (tableListInfo) {
      const formValue = await form.submit<
        Omit<BusinessAccountingModelAdd, 'type'>
      >();
      try {
        const back = await postQuickBusinessAccountingEmissionInModel({
          ...formValue,
          id: tableListInfo.id,
        });

        if (back.data.code === 200) {
          childRef.current?.reset();
          Toast('success', I18N.carbonFootprint3.savedAsATemplate);
          setShowInModelModal(false);
        }
      } catch {
        /* empty */
      }
    }
  };

  useEffect(() => {
    setSearchParamsData({
      ...searchParamsData,
      accountStatusList:
        selectStatusNum && selectStatusNum.length > 0
          ? selectStatusNum.join(',')
          : '',
    });
  }, [selectStatusNum]);

  return (
    <div className={styleCarbonFootprint3.carbonFootprint3}>
      <div className={styleCarbonFootprint3.main}>
        <div className={styleCarbonFootprint3.mainHeader}>
          <div className={styleCarbonFootprint3.productTitle}>
            {I18N.carbonFootprint3.quickAccounting}
          </div>
          <div className={styleCarbonFootprint3.setBtn}>
            <Button
              icon={<PlusOutlined />}
              style={{ width: 100 }}
              onClick={goAdd}
              className={`${styleCarbonFootprint3.btn}`}
              type='primary'
            >
              {I18N.carbonFootprint3.addAccounting}
            </Button>
          </div>
        </div>
        <div className='m-t-16'>
          <SearchFormUtil
            antdFormProps={searchFormProps}
            searchSub={searchSub}
            resetBack={resetBack}
            formItems={carbonFootprintQuickBusinessAccountingSearchForm()}
          />
        </div>
        <Modal
          className='quickBusinessAccountingListModal'
          open={visibleSelectModel}
          width={1000}
          title={undefined}
          onCancel={() => setVisibleSelectModel(false)}
          destroyOnClose
          footer={null}
        >
          <QuickBusinessAccountingSelectModel />
        </Modal>
        <Modal
          width={800}
          title={I18N.carbonFootprint3.saveAsAccounting}
          maskClosable={false}
          getContainer={false}
          open={showInModelModal}
          onOk={subInModelForm}
          okButtonProps={{
            style: {
              color: '#fff',
              background: '#0CBF9F',
              borderColor: '#0CBF9F',
            },
          }}
          cancelText={I18N.carbonFootprint.cancel}
          onCancel={() => setShowInModelModal(false)}
        >
          <FormilyCommon form={form}>
            <>
              <SchemaField schema={BusinessAccountinInModelSchema()} />
              <SchemaField schema={BusinessAccountinInModelRadioSchema()} />
            </>
          </FormilyCommon>
        </Modal>
        <ModelShareModal
          open={!!modelShareAccount}
          account={modelShareAccount as unknown as ProductAccountingList}
          onClose={() => setModelShareAccount(null)}
          onSuccess={() => childRef.current?.reset()}
          onOpenLinkShare={() => {
            Toast('info', I18N.carbonFootprint3.modelSharePendingTip);
          }}
        />
        <ModelShareRecordModal
          open={!!modelShareRecordAccount}
          account={modelShareRecordAccount as unknown as ProductAccountingList}
          onClose={() => setModelShareRecordAccount(null)}
        />
        <div className='m-t-16'>
          <CommonTable<
            QuickBusinessAccountingTableData,
            any,
            QuickBusinessAccountingTableParams
          >
            bordered={false}
            searchParams={searchParamsData}
            cRef={childRef}
            pageSize={10}
            scroll={{ x: 1200 }}
            fetchApi={params =>
              getQuickBusinessAccountingTableData({
                ...params,
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
    </div>
  );
};

export default CarbonFootprint3QuickBusinessAccounting;
