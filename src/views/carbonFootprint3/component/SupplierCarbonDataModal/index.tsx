import I18N from '@src/lang/I18N';
import {
  formItemInitInput,
  formItemInitType,
  formPropsInit,
} from '@src/components/FormUtil/util';
import SearchFormUtil from '@src/components/SearchForm';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import { deleteUrlSearchParams, setUrlSearchParams } from '@src/utils';
import SupplierCarbonDataComp from '@src/views/supplyChain/components/SupplierCarbonData';
import { CloseOutlined } from '@ant-design/icons';
import { Modal, Form, TableColumnsType, Button, Pagination } from 'antd';
import classNames from 'classnames';
import { isNil } from 'lodash-es';
import React, { useEffect, useRef, useState } from 'react';

import styles from './index.module.less';
import { getSupplierCarbonDataList, getSupplierList } from './service';
import { Supplier, SupplierCarbonData, SupplierDataSearchParams } from './type';

const DEFAULT_PAGE_SIZE = 10;

type SupplierDataModalProps = {
  visible: boolean;
  name?: string;
  onCancel: () => void;
  onConfirm: (value: SupplierCarbonData) => void;
};

const SupplierCarbonDataModal: React.VFC<SupplierDataModalProps> = ({
  visible,
  name,
  onCancel,
  onConfirm,
}) => {
  const [supplierList, setSupplierList] = useState<Supplier[]>([]);

  const [searchParams, setSearchParams] = useState<SupplierDataSearchParams>({
    name,
  });

  const [selectedSupplierData, setSelectedSupplierData] = useState<
    SupplierCarbonData[]
  >([]);

  const [supplierCarbonDataId, setSupplierCarbonDataId] = useState<number>();

  const [tablePage, setTablePage] = useState({
    page: 1,
    size: DEFAULT_PAGE_SIZE,
    total: 0,
  });

  const [searchForm] = Form.useForm<SupplierDataSearchParams>();

  const tableRef = useRef<TableRef<SupplierCarbonData>>();

  const tableColumns: TableColumnsType<SupplierCarbonData> = [
    {
      fixed: 'left',
      title: I18N.carbonFootprint3.supplierName,
      dataIndex: 'computeCompanyName',
      width: 208,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.greenhouseGasEmissions,
      dataIndex: 'emissionDesc',
      width: 224,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.dataRequestComesFrom,
      dataIndex: 'reqDataTypeDesc',
      width: 136,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.submissionTime,
      dataIndex: 'submitTime',
      width: 192,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.reviewer,
      dataIndex: 'auditUser',
      width: 112,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.reviewTime,
      dataIndex: 'auditTime',
      width: 136,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.reviewRemarks,
      dataIndex: 'content',
      width: 136,
      ellipsis: true,
    },
    {
      fixed: 'right',
      title: I18N.carbonFootprint.operation,
      dataIndex: '__operate__',
      width: 96,
      render: (_, record) => (
        <Button
          className={styles.operateBtn}
          type='link'
          onClick={() => {
            // 供应商数据组件从url上获取id，为了兼容将该条供应商组件的id加到url上
            setUrlSearchParams('id', String(record.id));
            // 清除供应商数据组件内部记录在localStorage里的状态 fk
            localStorage.removeItem('supplierCarbonDataTab');
            localStorage.removeItem('productCarbonPrintTab');
            setSupplierCarbonDataId(record.id);
          }}
        >
          {I18N.carbonFootprint.check}
        </Button>
      ),
    },
  ];

  const closeSupplierCarbonDataInfoModal = () => {
    deleteUrlSearchParams('id');
    setSupplierCarbonDataId(undefined);
  };

  useEffect(() => {
    getSupplierList({
      status: 1,
      inviteStatus: 3,
    }).then(resp => {
      setSupplierList(resp.data.rows || []);
    });
  }, []);

  useEffect(() => {
    if (visible) {
      setSearchParams({ ...searchParams, name });
      searchForm.setFieldsValue({ name });
    } else {
      setSearchParams({});
    }
  }, [name, visible, searchForm]);

  return (
    <Modal
      className={styles.supplierDataModal}
      title={null}
      width={1200}
      open={visible}
      destroyOnClose
      footer={null}
      closable={false}
      onCancel={onCancel}
    >
      <div className={styles.supplierDataModalMain}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <div className={styles.modalTitle}>
              {I18N.carbonFootprint3.selectSupplier}
            </div>
            <CloseOutlined className={styles.closeIcon} onClick={onCancel} />
          </div>
          <SearchFormUtil
            useSearch={false}
            antdFormProps={{
              ...formPropsInit,
              layout: 'inline',
              form: searchForm,
            }}
            searchSub={() => {
              setTablePage(prev => ({ ...prev, page: 1 }));
              tableRef.current?.reset({ page: 1, size: DEFAULT_PAGE_SIZE });
              setSearchParams(searchForm.getFieldsValue());
            }}
            resetBack={() => {
              setTablePage(prev => ({ ...prev, page: 1 }));
              tableRef.current?.reset({ page: 1, size: DEFAULT_PAGE_SIZE });
              setSearchParams({});
            }}
            formItems={[
              {
                ...formItemInitInput('', 'name', false),
                props: {
                  className: styles.formItem,
                  placeholder: I18N.carbonFootprint3.purchaseProductName,
                },
              },
              {
                ...formItemInitType('select', '', 'supplierIds', true),
                props: {
                  className: classNames(styles.formItem, styles.multiSelect),
                  placeholder: I18N.carbonFootprint3.supplierName,
                  mode: 'multiple',
                  fieldNames: {
                    value: 'supplierId',
                    label: 'companyName',
                  },
                  options: supplierList,
                  optionLabelProp: 'companyName',
                  optionFilterProp: 'companyName',
                },
              },
            ]}
          />
          <CommonTable<
            SupplierCarbonData,
            { total: number; rows: SupplierCarbonData[] }
          >
            className={styles.supplierDataTable}
            columns={tableColumns}
            rowKey='id'
            searchParams={searchParams}
            bordered={false}
            cRef={tableRef}
            scroll={{ x: 1200, y: 448 }}
            pageSize={DEFAULT_PAGE_SIZE}
            rowSelection={{
              type: 'radio',
              columnWidth: 80,
              fixed: 'left',
              selectedRowKeys: selectedSupplierData.map(({ id }) => id),
              onChange: (_, selectedRows) =>
                setSelectedSupplierData(selectedRows),
            }}
            pagination={false}
            fetchApi={params =>
              getSupplierCarbonDataList({
                ...params,
                pageNum: params.page,
                pageSize: params.size,
                supplierIds: params.supplierIds
                  ? ((params.supplierIds as number[]) || []).join(',')
                  : undefined,
              })
            }
            returnFetchApi={resp => {
              if (resp?.data?.rows.length > 0) {
                setSelectedSupplierData([resp?.data?.rows[0]]);
              } else {
                setSelectedSupplierData([]);
              }
              setTablePage(prev => ({
                ...prev,
                total: resp?.data?.total || 0,
              }));
              return {
                data: resp?.data?.rows || [],
                count: resp?.data?.total || 0,
              };
            }}
          />
        </div>
        <div className={styles.supplierDataModalFooter}>
          <div className={styles.paginationInfo}>
            <span>{I18N.carbonFootprint3.totalPrefix}</span>
            <span className={styles.paginationTotal}>{tablePage.total}</span>
            <span>{I18N.carbonFootprint3.totalSuffix}</span>
            <Pagination
              size='small'
              current={tablePage.page}
              pageSize={tablePage.size}
              total={tablePage.total}
              showSizeChanger={false}
              onChange={page => {
                setTablePage(prev => ({ ...prev, page }));
                tableRef.current?.reset({ page, size: tablePage.size });
              }}
            />
          </div>
          <div className={styles.footerActions}>
            <Button className={styles.supplierDataModalBtn} onClick={onCancel}>
              {I18N.carbonFootprint.cancel}
            </Button>
            <Button
              type='primary'
              className={styles.supplierDataModalConfirmBtn}
              disabled={selectedSupplierData.length === 0}
              onClick={() => onConfirm(selectedSupplierData[0])}
            >
              {I18N.carbonFootprint3.confirmSelection}
            </Button>
          </div>
        </div>
      </div>
      <Modal
        className={styles.dataInfoModal}
        open={supplierCarbonDataId !== undefined}
        title={I18N.carbonFootprint3.supplierCarbonCount2}
        width={1200}
        destroyOnClose
        footer={
          <div className={styles.dataInfoModalFooter}>
            <Button onClick={closeSupplierCarbonDataInfoModal}>
              {I18N.carbonFootprint3.close}
            </Button>
          </div>
        }
        onCancel={closeSupplierCarbonDataInfoModal}
      >
        {!isNil(supplierCarbonDataId) && (
          <SupplierCarbonDataComp
            id={supplierCarbonDataId}
            hiddenOperateButtons
          />
        )}
      </Modal>
    </Modal>
  );
};

export default SupplierCarbonDataModal;
