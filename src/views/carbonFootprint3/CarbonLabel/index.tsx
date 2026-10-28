/**
 * 产品碳足迹 - 碳标签
 */
import { PlusOutlined } from '@ant-design/icons';
import { FromItemProps } from '@src/components/FormUtil/type';
import { formPropsInit } from '@src/components/FormUtil/util';
import { checkPermissions } from '@src/components/Permission/utils';
import SearchFormUtil from '@src/components/SearchForm';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import I18N from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { Toast } from '@src/utils/Toast';
import { Button, Form, FormProps, Modal } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { AxiosResponse } from 'axios';
import { FC, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { columnsCarbonLabel } from './columns';
import { CarbonLabelModal } from './component/CarbonLabelModal';
import { ApplyForAccountStatus } from './constant';
import { searchTableFormItem } from './formItems';
import styles from './index.module.less';
import {
  getCarbonLabelList,
  postCarbonLabelListCancel,
  postCarbonLabelListDelete,
} from './service';
import { CarbonLabelListData, CarbonLabelParams } from './type';
import {
  haveCarbonLabelDeletePermissions,
  haveCarbonLabelEditPermissions,
  haveCarbonLabelInfoPermissions,
} from '../permissions';
import { BackTableData } from '../type';

const { confirm } = Modal;

const { TO_BE_SUB, TO_BE_REVIEWED, PASS, NOT_PASS, REVIEWED_ERR } =
  ApplyForAccountStatus;

const CarbonLabel: FC = () => {
  const history = useHistory();
  const childRef = useRef<TableRef>();
  const [searchForm] = Form.useForm();

  /** 查询的条件 */
  const [searchParamsData, setSearchParamsData] = useState<CarbonLabelParams>({
    pageNum: 1,
    pageSize: 10,
  });

  /** 是否显示碳标签弹框 */
  const [carbonLabelModal, setCarbonLabelModal] = useState(false);

  /** 碳标签需要的数据 */
  const [carbonLabelModalInfo, setCarbonLabelModalInfo] =
    useState<CarbonLabelListData>();

  const [searchFormItem] = useState<FromItemProps<any>[]>(
    searchTableFormItem(),
  );

  /** 搜索的form */
  const searchFormProps: FormProps = {
    ...formPropsInit(),
    layout: 'inline',
    form: searchForm,
  };

  /** 搜索提交 */
  const searchSub = () => {
    const val: CarbonLabelParams = searchForm.getFieldsValue();
    setSearchParamsData({
      ...searchParamsData,
      ...val,
    });
  };
  /** 搜索重置 */
  const resetBack = () => {
    setSearchParamsData({
      ...searchParamsData,
      productName: undefined,
      status: undefined,
    });
  };

  /**
   * 点击前往详情
   * @param data
   */
  const getOrderDetails = (data: CarbonLabelListData) => {
    const { status } = data;
    const statusText =
      [TO_BE_SUB, NOT_PASS, REVIEWED_ERR].includes(status) &&
      haveCarbonLabelEditPermissions()
        ? 'edit'
        : 'detail';
    history.push(
      `${RouteMapsCorbonFootprint3.carbonFootprint3CarbonLabelDetail}?productId=${data.id}&status=${statusText}`,
    );
  };

  /**
   * 撤销审核
   * @param data 撤销的数据
   */
  const goCancel = async (data: CarbonLabelListData) => {
    await postCarbonLabelListCancel({ id: data.id });
    Toast('success', I18N.carbonFootprint3.revokeSuccessful);
    childRef.current?.reset();
  };

  /**
   * @description: 删除列表数据
   * @param {CarbonLabelListData} deleteItem 被删除的行数据信息
   */
  const deleteTable = async (deleteItem: CarbonLabelListData) => {
    confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.template(I18N.carbonFootprint3.confirmDeletionOfThis3, {
        val1: deleteItem.productName || '-',
      }),
      okButtonProps: {
        danger: true,
      },
      icon: null,
      onOk: async () => {
        try {
          const back = await postCarbonLabelListDelete({
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
   * 点击碳标签
   * @param data 碳标签数据
   */
  const carbonLabelModalClick = (data: CarbonLabelListData) => {
    setCarbonLabelModalInfo(data);
    setCarbonLabelModal(true);
  };

  /** 表头 */
  const columns: ColumnsType<CarbonLabelListData> = [
    ...columnsCarbonLabel(),
    {
      title: I18N.carbonFootprint.operation,
      width: 260,
      fixed: 'right',
      dataIndex: 'set',
      render: (val, row) => {
        // 允许删除
        const isDelete = TO_BE_REVIEWED !== row.status;
        // 显示碳标签
        const isCarbonLabel = PASS === row.status;
        return (
          <div className={styles.operateColumn}>
            {haveCarbonLabelEditPermissions() && (
              <Button
                type='link'
                disabled={!isCarbonLabel}
                onClick={() => {
                  if (isCarbonLabel) {
                    carbonLabelModalClick(row);
                  }
                }}
              >
                {I18N.carbonFootprint3.carbonLabel}
              </Button>
            )}
            {haveCarbonLabelInfoPermissions() && (
              <Button
                type='link'
                onClick={() => {
                  getOrderDetails(row);
                }}
              >
                {I18N.carbonFootprint3.details}
              </Button>
            )}

            {isDelete && haveCarbonLabelDeletePermissions() && (
              <Button
                type='link'
                onClick={() => {
                  deleteTable(row);
                }}
              >
                {I18N.carbonFootprint.delete}
              </Button>
            )}
            {!isDelete && haveCarbonLabelEditPermissions() && (
              <Button
                type='link'
                onClick={() => {
                  if (row.status === TO_BE_REVIEWED) {
                    goCancel(row);
                  }
                }}
              >
                {I18N.carbonFootprint3.withdraw}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const addCLick = () => {
    history.push(RouteMapsCorbonFootprint3.carbonFootprint3CarbonLabelAdd);
  };

  /**  表格数据格式  */
  const returnFetchApi = (
    back: AxiosResponse<AxiosResponse<BackTableData<CarbonLabelListData>>>,
  ) => ({
    data: back.data.data.rows,
    count: back.data.data.total,
  });

  return (
    <div className={styles.carbonLabel}>
      <div className={styles.header}>
        <div className={styles.title}>{I18N.carbonFootprint3.carbonLabel}</div>
      </div>
      <div className={styles.searchContent}>
        <SearchFormUtil
          antdFormProps={searchFormProps}
          searchSub={searchSub}
          resetBack={resetBack}
          formItems={searchFormItem}
        />
        {checkPermissions(
          <Button icon={<PlusOutlined />} type='primary' onClick={addCLick}>
            {I18N.carbonFootprint3.newApplication}
          </Button>,
          'footprint3:label:add',
        )}
      </div>
      <div className={styles.tableContent}>
        <CommonTable<CarbonLabelListData, any, CarbonLabelParams>
          bordered={false}
          searchParams={searchParamsData}
          cRef={childRef}
          pageSize={10}
          scroll={{ x: 1200 }}
          fetchApi={params =>
            getCarbonLabelList({
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
        title={I18N.carbonFootprint3.carbonLabel}
        width={560}
        getContainer={false}
        open={carbonLabelModal}
        onCancel={() => {
          setCarbonLabelModal(false);
        }}
        footer={false}
      >
        {carbonLabelModalInfo && (
          <CarbonLabelModal info={carbonLabelModalInfo} />
        )}
      </Modal>
    </div>
  );
};

export default CarbonLabel;
