import I18N from '@src/lang/I18N';
import { Button, Table, TableColumnsType } from 'antd';

import styles from './index.module.less';
import TextOverflowTable from '../TextOverflowTable';
import {
  PROCESS_PRODUCT_TYPE_LABEL,
  MAX_ELLIPSIS_LENGTH,
  PROCESS_IN_TYPE_LABEL,
  MATCH_WAY,
  EMISSION_REQUEST_STATE,
  EMISSION_TYPE_LABEL,
} from '../constant';
import { ProcessIn, ProcessOut, ProcessProduct } from '../type';

export const genProductRootTableColumns =
  (): TableColumnsType<ProcessProduct> => [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: '__index__',
      width: 56,
      fixed: 'left',
      className: styles.tableHeader,
      render: (text, product, index) => index + 1,
    },
    {
      title: I18N.carbonFootprint.productName,
      dataIndex: 'name',
      width: 200,
      fixed: 'left',
      className: styles.tableHeader,
      render: text => (
        <TextOverflowTable
          value={text || '-'}
          maxLength={MAX_ELLIPSIS_LENGTH}
          maxWidth={200}
        />
      ),
    },
    {
      title: I18N.carbonFootprint.quantity,
      dataIndex: 'amount',
      width: 100,
      render: (text, record) => `${text}${record.unitName}`,
    },
    {
      title: I18N.carbonFootprint3.productType,
      dataIndex: 'type',
      width: 144,
      className: styles.tableHeader,
      render: (_, product) => PROCESS_PRODUCT_TYPE_LABEL[product.type] || '-',
    },
    {
      title: I18N.carbonFootprint3.partitionCoefficient3,
      dataIndex: 'shareRate',
      width: 150,
      render: text => text || '-',
    },
    {
      title: I18N.carbonFootprint.emissions,
      dataIndex: 'emissionTotal',
      width: 250,
      render: text => (text ? `${text}kgCO₂e` : '-'),
    },
  ];

export const genProductTableColumns = (): TableColumnsType<ProcessProduct> => [
  {
    title: I18N.carbonFootprint.number,
    dataIndex: '__index__',
    width: 70,
    fixed: 'left',
    className: styles.tableHeader,
    render: (text, product, index) => index + 1,
  },
  {
    title: I18N.carbonFootprint3.nameOfOutput,
    dataIndex: 'name',
    width: 200,
    fixed: 'left',
    className: styles.tableHeader,
    render: text => (
      <TextOverflowTable
        value={text || '-'}
        maxLength={MAX_ELLIPSIS_LENGTH}
        maxWidth={200}
      />
    ),
  },
  {
    title: I18N.carbonFootprint3.outputQuantity,
    dataIndex: 'amount',
    width: 120,
    render: (text, record) => `${text}${record.unitName}`,
  },
  {
    title: I18N.carbonFootprint3.actualUsage,
    dataIndex: 'useAmount',
    width: 150,
    render: (text, record) => (text ? `${text}${record.unitName}` : '-'),
  },
  {
    title: I18N.carbonFootprint3.outputType,
    dataIndex: 'type',
    width: 144,
    className: styles.tableHeader,
    render: (_, product) => PROCESS_PRODUCT_TYPE_LABEL[product.type] || '-',
  },
  {
    title: I18N.carbonFootprint3.partitionCoefficient3,
    dataIndex: 'shareRate',
    width: 140,
    render: text => text || '-',
  },
  {
    title: I18N.carbonFootprint.emissions,
    dataIndex: 'emissionTotal',
    width: 190,
    render: text => (text ? `${text}kgCO₂e` : '-'),
  },
];

export const genInTableColumns = (options: {
  onView: (processIn: ProcessIn) => void;
}): TableColumnsType<ProcessIn> => [
  {
    title: I18N.carbonFootprint.number,
    dataIndex: '__index__',
    width: 70,
    className: styles.tableHeader,
    fixed: 'left',
    render: (text, processLibIn, index) => index + 1,
  },
  Table.EXPAND_COLUMN,
  {
    title: I18N.carbonFootprint3.enterName,
    dataIndex: 'name',
    width: 200,
    fixed: 'left',
    className: styles.tableHeader,
    render: text => (
      <TextOverflowTable
        maxWidth={200}
        value={text || ''}
        maxLength={MAX_ELLIPSIS_LENGTH}
      />
    ),
  },
  {
    title: I18N.carbonFootprint3.inputType,
    dataIndex: 'type',
    width: 100,
    className: styles.tableHeader,
    render: (_, processLibIn) =>
      processLibIn.type !== 0
        ? PROCESS_IN_TYPE_LABEL[processLibIn.type] || '-'
        : I18N.carbonFootprint3.unitProcess,
  },
  {
    title: I18N.carbonFootprint.emissions,
    dataIndex: 'emissionTotal',
    width: 150,
    render: (text, record) => {
      if (
        record.matchWay === MATCH_WAY.SUPPLIER &&
        record.requestState === EMISSION_REQUEST_STATE.WAITING
      ) {
        return I18N.carbonFootprint3.waitingForSuppliers;
      }
      return text ? `${text}kgCO₂e` : '-';
    },
  },
  {
    title: I18N.carbonFootprint.operation,
    width: 100,
    className: styles.tableHeader,
    dataIndex: '__operate__',
    render: (_, record) => (
      <Button
        className={styles.viewBtn}
        type='link'
        onClick={() => options.onView(record)}
      >
        {I18N.carbonFootprint.check}</Button>
    ),
  },
];

export const genOutTableColumns = (): TableColumnsType<ProcessOut> => [
  {
    title: I18N.carbonFootprint.number,
    dataIndex: '__index__',
    fixed: 'left',
    width: 56,
    className: styles.tableHeader,
    render: (text, processLibOut, index) => index + 1,
  },
  {
    title: I18N.carbonFootprint3.outputName,
    dataIndex: 'name',
    fixed: 'left',
    width: 208,
    className: styles.tableHeader,
    render: text => (
      <TextOverflowTable
        maxWidth={200}
        value={text || '-'}
        maxLength={MAX_ELLIPSIS_LENGTH}
      />
    ),
  },
  {
    title: I18N.carbonFootprint.quantity,
    dataIndex: 'amount',
    width: 200,
    className: styles.tableHeader,
    render: (text, record) => (text ? `${text}${record.unitName}` : '-'),
  },
  {
    title: I18N.carbonFootprint3.typeOfOutput,
    dataIndex: 'type',
    width: 160,
    render: (val: number) => EMISSION_TYPE_LABEL[val] || '-',
  },
  {
    title: I18N.carbonFootprint.emissions,
    dataIndex: 'emissionTotal',
    width: 250,
    render: text => (text ? `${text}kgCO₂e` : '-'),
  },
];
