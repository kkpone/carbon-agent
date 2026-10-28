/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-29 19:15:28
 * @Date: 2023-02-27 19:32:14
 * @@description: 弹框选择过程库
 */

import I18N from '@src/lang/I18N';
import {
  formPropsInit,
  formItemInitInput,
} from '@src/components/FormUtil/util';
import SearchFormUtil from '@src/components/SearchForm';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import styleCarbonFootprint3 from '@src/views/carbonFootprint3/index.module.less';
import { Form, TableColumnsType, Button } from 'antd';
import classNames from 'classnames';
import { throttle } from 'lodash-es';
import { VFC, useRef, useState, useEffect } from 'react';

import styles from './index.module.less';
import { getProcessProductList } from './service';
import {
  ProcessProductParams,
  ProcessProduct,
  ProcessLibSelectModalProps,
} from './type';
import { MAX_ELLIPSIS_LENGTH } from '../../discharge/process/constant';
import EmissionSourceModal from '../../discharge/process/details/EmissionSourceModal';
import TextOverflowTable from '../TextOverflowTable';

const commonFormItemProps = {
  style: { width: 240 },
};

const ModalProcessLib: VFC<ProcessLibSelectModalProps> = ({
  processLibId,
  processProductParams,
  onConfirm,
  onCancel,
  isProcess,
}) => {
  // 弹框标题的高度
  const TitleHeight = 55;
  // 搜索栏 + 边距
  const SearchHeight = 60;
  // 弹框距离上下方距离 各50
  const ModalTopBottom = 50 + 50;
  // 表头高度
  const TableColumnsHeight = 50 + 16;
  // 底部分页的高度
  const PaginationHeight = 60;

  // 表格内部超出滚动的滚动条
  const TableScrollY =
    window.innerHeight -
    TitleHeight -
    TableColumnsHeight -
    SearchHeight -
    ModalTopBottom -
    PaginationHeight;

  const [searchForm] = Form.useForm<ProcessProductParams>();

  const [searchParams, setSearchParams] =
    useState<ProcessProductParams>(processProductParams);

  const [selectedProduct, setSelectedProduct] = useState<ProcessProduct[]>([]);

  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  const [viewedProduct, setViewedProduct] = useState<ProcessProduct | null>(
    null,
  );

  const tableRef = useRef<TableRef<ProcessProduct>>();

  const searchFormProps = {
    ...formPropsInit(),
    layout: 'inline' as const,
    form: searchForm,
    initialValues: searchParams,
  };

  const tableColumns: TableColumnsType<ProcessProduct> = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: '__index__',
      width: 70,
      render: (_, processLibProduct, index) => index + 1,
    },
    {
      title: I18N.carbonFootprint3.processName,
      width: 200,
      dataIndex: 'name',
      render: text => (
        <TextOverflowTable
          value={text || '-'}
          maxWidth={200}
          maxLength={MAX_ELLIPSIS_LENGTH}
        />
      ),
    },
    {
      title: I18N.carbonFootprint3.accountingYear,
      width: 150,
      dataIndex: 'accountYear',
    },
    {
      title: I18N.carbonFootprint3.boundaryDescription,
      width: 300,
      dataIndex: 'boundary',
      render: text => (
        <TextOverflowTable
          value={text || '-'}
          maxWidth={300}
          maxLength={MAX_ELLIPSIS_LENGTH}
        />
      ),
    },
    {
      title: I18N.carbonFootprint.operation,
      width: 70,
      dataIndex: '__operate__',
      fixed: 'right',
      render: (_, product) => (
        <Button
          className={styles.operateBtn}
          type='link'
          onClick={() => setViewedProduct(product)}
        >
          {I18N.carbonFootprint.check}
        </Button>
      ),
    },
  ];

  /**
   * @description: 节流点击事件
   */
  const throttleConfirmFunc = throttle(
    async () => onConfirm(selectedProduct[0]),
    1000,
    {
      leading: true,
      trailing: false,
    },
  );

  useEffect(() => {
    if (selectedProduct.length > 0) {
      const ids = selectedProduct.map(pr => pr.id);
      setSelectedRowKeys(ids);
    } else {
      setSelectedRowKeys([]);
    }
  }, [selectedProduct]);

  return (
    <div
      className={classNames(
        styleCarbonFootprint3.carbonFootprint3,
        styles.modalProcessLibDiv,
      )}
    >
      <SearchFormUtil
        useSearch={false}
        antdFormProps={searchFormProps}
        searchSub={() => {
          setSearchParams(searchForm.getFieldsValue());
        }}
        resetBack={() => setSearchParams({})}
        formItems={[
          {
            ...formItemInitInput('', 'name', false),
            props: {
              ...commonFormItemProps,
              placeholder: I18N.carbonFootprint3.pleaseEnterTheProcess,
            },
          },
        ]}
      />
      <CommonTable<
        ProcessProduct,
        { data: { total: number; rows: ProcessProduct[] } }
      >
        columns={tableColumns}
        rowSelection={{
          type: 'radio',
          selectedRowKeys,
          onChange: (_, selectedRows) => setSelectedProduct(selectedRows),
        }}
        searchParams={searchParams}
        bordered={false}
        cRef={tableRef}
        pageSize={10}
        scroll={{ y: TableScrollY }}
        rowKey='id'
        fetchApi={params =>
          getProcessProductList({
            ...params,
            pageSize: params.size,
            pageNum: params.page,
            selfId: processLibId,
          })
        }
        returnFetchApi={back => {
          if (back?.data?.data?.rows.length > 0) {
            setSelectedProduct([back?.data?.data?.rows[0]]);
          } else {
            setSelectedProduct([]);
          }

          return {
            data: back?.data?.data?.rows || [],
            count: back?.data?.data?.total || 0,
          };
        }}
        pagination={{ position: ['bottomLeft'] }}
      />
      {selectedProduct.length > 0 && (
        <div className={styles.modalProcessFooter}>
          <Button onClick={async () => onCancel()}>
            {I18N.carbonFootprint.cancel}
          </Button>
          <Button
            className='m-l-10'
            type='primary'
            onClick={throttleConfirmFunc}
          >
            {I18N.carbonFootprint3.confirmSelection}
          </Button>
        </div>
      )}
      {viewedProduct && (
        <EmissionSourceModal
          isProcess={isProcess}
          visible={viewedProduct !== null}
          viewedProduct={viewedProduct}
          onCancel={() => setViewedProduct(null)}
        />
      )}
    </div>
  );
};

export default ModalProcessLib;
