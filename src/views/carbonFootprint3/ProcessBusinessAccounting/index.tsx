/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-20 11:12:59
 * @Date: 2023-02-21 10:50:24
 * @@description: 过程核算列表也
 */

import { PlusOutlined } from '@ant-design/icons';
import { formPropsInit } from '@src/components/FormUtil/util';
import { checkPermissions } from '@src/components/Permission/utils';
import SearchFormUtil from '@src/components/SearchForm';
import { TableActions } from '@src/components/Table/components/TableActions';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import I18N from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { Toast } from '@src/utils/Toast';
import { Button, Form, FormProps, Modal } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { AxiosResponse } from 'axios';
import { compact } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { carbonFootprintProcessBusinessAccountingTableCol } from './Columns';
import { carbonFootprintProcessBusinessAccountingSearchForm } from './FormItem';
import { getProcessBusinessAccountingTableData } from './service';
import {
  ProcessBusinessAccountingEmissionParams,
  ProcessBusinessAccountingTableData,
} from './type';
import { postQuickBusinessAccountingDeleteBasic } from '../QuickBusinessAccounting/service';
import styleCarbonFootprint3 from '../index.module.less';
import './index.less';
import { BackTableData } from '../type';
import { LIST_OR_GRAPH_VAL, PROCESS_URL_PARAMS_KEY } from '../util/constant';
import { getHasModelNum } from '../QuickBusinessAccounting/CarbonFootprintResult/service';

const { INFO_ID, INFO_IS_EDIT, SCOPE_VALUE, LIST_OR_GRAPH } =
  PROCESS_URL_PARAMS_KEY;
const { GRAPH } = LIST_OR_GRAPH_VAL;

const { confirm } = Modal;

const ProcessBusinessAccounting = () => {
  const history = useHistory();
  const childRef = useRef<TableRef>();

  const [searchForm] = Form.useForm();

  /** 新增核算 - 选择模型 */
  const [visibleSelectModel, setVisibleSelectModel] = useState(false);

  /** 核算状态当前选中的值 */
  const [selectStatusNum, setSelectStatusNum] = useState<number[]>([]);
  const [showSelectPropver, setShowSelectPropver] = useState(false);

  /** 搜索的form */
  const searchFormProps: FormProps = {
    ...formPropsInit(),
    layout: 'inline',
    form: searchForm,
  };

  /** 查询的条件 */
  const [searchParamsData, setSearchParamsData] =
    useState<ProcessBusinessAccountingEmissionParams>();

  /** 搜索提交 */
  const searchSub = () => {
    const val: ProcessBusinessAccountingEmissionParams =
      searchForm.getFieldsValue();
    setSearchParamsData({
      ...searchParamsData,
      ...val,
    });
  };

  /** 搜索重置 */
  const resetBack = () => {
    setSearchParamsData(undefined);
  };

  /**  表格数据格式  */
  const returnFetchApi = (
    back: AxiosResponse<
      AxiosResponse<BackTableData<ProcessBusinessAccountingTableData>>
    >,
  ) => ({
    data: back.data.data.rows,
    count: back.data.data.total,
  });

  /**
   * @description: 删除列表数据
   * @param {ProductLibraryTableData} deleteItem 被删除的行数据信息
   */
  const deleteTable = async (
    deleteItem: ProcessBusinessAccountingTableData,
  ) => {
    confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.template(I18N.carbonFootprint3.confirmDeletionOfThis7, {
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
  const columns: ColumnsType<ProcessBusinessAccountingTableData> = [
    ...carbonFootprintProcessBusinessAccountingTableCol(
      onConfirmClick,
      showSelectPropver,
      setShowSelectPropver,
    ),
    {
      title: I18N.carbonFootprint.operation,
      width: 170,
      fixed: 'right',
      dataIndex: 'set',
      render: (val, item) => {
        const menus = compact([
          checkPermissions(
            {
              key: '5',
              label: I18N.carbonFootprint3.details,
              onClick: async () => {
                history.push(
                  `${RouteMapsCorbonFootprint3.carbonFootprint3ProcessBusinessAccountingManagement}?${LIST_OR_GRAPH}=${GRAPH}&${SCOPE_VALUE}=${item.accountStatus}&${INFO_ID}=${item.id}&${INFO_IS_EDIT}=true`,
                );
              },
            },
            'footprint3:account:info:process',
          ),
          checkPermissions(
            {
              key: '3',
              label: I18N.carbonFootprint.copy,
              onClick: async () => {
                history.push(
                  `${RouteMapsCorbonFootprint3.carbonFootprint3ProcessBusinessAccountingCopyBasic}/${item.id}`,
                );
              },
            },
            'footprint3:account:copy:process',
          ),
          checkPermissions(
            {
              key: '4',
              label: I18N.carbonFootprint.delete,
              onClick: async () => {
                await deleteTable(item);
              },
            },
            'footprint3:account:delete:process',
          ),
        ]);
        return <TableActions menus={menus} />;
      },
    },
  ];

  /**
   * @description: 新增过程核算
   */
  const goAdd = async () => {
    const { data } = await getHasModelNum({ type: 1 });
    if (data.data.hasModel === 1) {
      setVisibleSelectModel(true);
    } else {
      history.push(
        RouteMapsCorbonFootprint3.carbonFootprint3ProcessBusinessAccountingAddOrBasicDetail,
      );
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
            {I18N.carbonFootprint3.processAccounting}
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
            formItems={carbonFootprintProcessBusinessAccountingSearchForm()}
          />
        </div>
        <div className='m-t-16'>
          <CommonTable<
            ProcessBusinessAccountingTableData,
            any,
            ProcessBusinessAccountingEmissionParams
          >
            bordered={false}
            searchParams={searchParamsData}
            cRef={childRef}
            pageSize={10}
            scroll={{ x: 1200 }}
            fetchApi={params =>
              getProcessBusinessAccountingTableData({
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
        <Modal
          className='processBusinessAccountingListModal'
          open={visibleSelectModel}
          width={1000}
          title={undefined}
          onCancel={() => setVisibleSelectModel(false)}
          destroyOnClose
          footer={null}
        >
          1
        </Modal>
      </div>
    </div>
  );
};

export default ProcessBusinessAccounting;
