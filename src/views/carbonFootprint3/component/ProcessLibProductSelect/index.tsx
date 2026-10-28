/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-01-09 18:48:42
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-26 10:34:42
 */

import I18N from '@src/lang/I18N';
import { FormActions } from '@src/components/FormActions';
import {
  formPropsInit,
  formItemInitInput,
  formItemInitType,
} from '@src/components/FormUtil/util';
import SearchFormUtil from '@src/components/SearchForm';
import { utilGetUrlParams } from '@src/components/SearchForm/util';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import styleCarbonFootprint3 from '@src/views/carbonFootprint3/index.module.less';
import { classesLeiBie } from '@src/views/carbonFootprint3/util';
import { Form, TableColumnsType, Button } from 'antd';
import classNames from 'classnames';
import { VFC, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import styles from './index.module.less';
import { getProcessProductList } from './service';
import { ProcessProductParams, ProcessProduct } from './type';
import {
  URL_PARAMS_KEY,
  MAX_ELLIPSIS_LENGTH,
} from '../../discharge/process/constant';
import TextOverflowTable from '../TextOverflowTable';

const commonFormItemProps = {
  style: { width: 240 },
};

type ProcessLibSelectProps = {
  onCancel: () => void;
  onConfirm: (product: ProcessProduct) => void;
};

const ProcessLibSelect: VFC<ProcessLibSelectProps> = ({
  onConfirm,
  onCancel,
}) => {
  const location = useLocation();

  const paramsQuery = new URLSearchParams(location.search);

  const processLibId = Number(paramsQuery.get(URL_PARAMS_KEY.PROCESS_LIB_ID));

  const [searchForm] = Form.useForm<ProcessProductParams>();

  const [searchParams, setSearchParams] = useState<ProcessProductParams>(() => {
    const searchParamsString = utilGetUrlParams('search') || '{}';
    try {
      return JSON.parse(searchParamsString);
    } catch {
      return {};
    }
  });

  const [selectedProduct, setSelectedProduct] = useState<ProcessProduct[]>([]);

  const [, setViewedProduct] = useState<ProcessProduct | null>(null);

  const tableRef = useRef<TableRef<ProcessProduct>>();

  const searchFormProps = {
    ...formPropsInit(),
    layout: 'inline' as const,
    form: searchForm,
  };

  const processLibTypeList = classesLeiBie();

  const tableColumns: TableColumnsType<ProcessProduct> = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: '__index__',
      width: 70,
      render: (_, processLibProduct, index) => index + 1,
    },
    {
      title: I18N.carbonFootprint3.processName,
      width: 208,
      dataIndex: 'processName',
      render: text => (
        <TextOverflowTable
          value={text || '-'}
          maxLength={MAX_ELLIPSIS_LENGTH}
        />
      ),
    },
    {
      title: I18N.carbonFootprint3.product,
      width: 128,
      dataIndex: 'productName',
      render: text => (
        <TextOverflowTable
          value={text || '-'}
          maxLength={MAX_ELLIPSIS_LENGTH}
        />
      ),
    },
    {
      title: I18N.carbonFootprint3.category,
      width: 70,
      dataIndex: 'type',
      render: (_, product) =>
        processLibTypeList.find(({ value }) => value === product.type)?.label ||
        '-',
    },
    {
      title: I18N.carbonFootprint3.accountingYear,
      width: 70,
      dataIndex: 'accountYear',
    },
    {
      title: I18N.carbonFootprint3.boundaryDescription,
      width: 208,
      dataIndex: 'boundary',
      render: text => (
        <TextOverflowTable
          value={text || '-'}
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

  return (
    <div
      className={classNames(styleCarbonFootprint3.carbonFootprint3, 'm-b-60')}
    >
      <SearchFormUtil
        antdFormProps={searchFormProps}
        searchSub={() => {
          setSearchParams(searchForm.getFieldsValue());
        }}
        resetBack={() => setSearchParams({})}
        formItems={[
          {
            ...formItemInitInput('', 'processName', false),
            props: {
              ...commonFormItemProps,
              placeholder: I18N.carbonFootprint3.pleaseEnterTheProcess,
            },
          },
          {
            ...formItemInitInput('', 'productName', false),
            props: {
              ...commonFormItemProps,
              placeholder: I18N.carbonFootprint3.pleaseEnterTheProduct3,
            },
          },
          {
            ...formItemInitType('select', '', 'type', false),
            props: {
              ...commonFormItemProps,
              placeholder: I18N.carbonFootprint3.pleaseSelectACategory,
              options: processLibTypeList,
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
          selectedRowKeys: selectedProduct.map(product => product.id),
          onChange: (_, selectedRows) => setSelectedProduct(selectedRows),
        }}
        searchParams={searchParams}
        bordered={false}
        cRef={tableRef}
        pageSize={10}
        scroll={{ x: 1200 }}
        rowKey='id'
        fetchApi={params => {
          setSelectedProduct([]);
          return getProcessProductList({
            ...params,
            pageSize: params.size,
            pageNum: params.page,
            processId: processLibId,
          });
        }}
        returnFetchApi={back => ({
          data: back?.data?.data?.rows || [],
          count: back?.data?.data?.total || 0,
        })}
      />
      <FormActions
        place='center'
        buttons={[
          {
            type: 'primary',
            title: I18N.carbonFootprint.confirm2,
            onClick: async () => onConfirm(selectedProduct[0]),
          },
          {
            title: I18N.carbonFootprint.return,
            onClick: async () => onCancel(),
          },
        ]}
      />
    </div>
  );
};

export default ProcessLibSelect;
