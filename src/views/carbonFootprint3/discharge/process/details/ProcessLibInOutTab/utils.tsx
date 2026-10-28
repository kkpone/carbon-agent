/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-01-16 14:23:17
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-29 18:51:14
 */

import I18N from '@src/lang/I18N';
import {
  MODEL_EMISSION_MATCH_WAY,
  MODEL_EMISSION_REQUEST_STATE,
} from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import TextOverflowTable from '@src/views/carbonFootprint3/component/TextOverflowTable';
import TextWidthOverflow from '@src/views/carbonFootprint3/component/TextOverflowTable/byWidth';
import { ALL_EMISSION_LABEL } from '@src/views/carbonFootprint3/constant';
import { Table, TableColumnsType } from 'antd';

import {
  PROCESS_PRODUCT_TYPE_LABEL,
  MAX_ELLIPSIS_LENGTH,
  MATCH_WAY,
} from '../../constant';
import { ProcessLibProduct, ProcessLibIn } from '../../type';
import styles from '../index.module.less';

/**
 * @description: 根节点功能单位的col
 */
export const genProductRootTableColumns =
  (): TableColumnsType<ProcessLibProduct> => [
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
      title: I18N.carbonFootprint.emissionKg,
      dataIndex: 'emissionTotal',
      width: 250,
      render: text => <TextWidthOverflow width={220} value={text} />,
    },
    {
      title: I18N.carbonFootprint3.transportationEmissionsK,
      dataIndex: 'transTotal',
      width: 250,
      render: text => {
        if (text === '0') {
          return '-';
        }
        return <TextWidthOverflow width={200} value={text} />;
      },
    },
  ];

/**
 * @description: 根节点“非功能单位”的col
 */
export const genProductTableColumns = (
  isBaseRootTreeNode?: boolean,
): TableColumnsType<ProcessLibProduct> => {
  const data: TableColumnsType<ProcessLibProduct> = [
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
      title: I18N.carbonFootprint.emissionKg,
      dataIndex: 'emissionTotal',
      width: 190,
      render: text => <TextWidthOverflow width={170} value={text} />,
    },
  ];
  // 过程库 - 产出物的根节点 - 没有上级使用数量
  if (isBaseRootTreeNode) {
    data.splice(3, 1);
  }

  return data;
};

/** 输入 */
export const genInTableColumns = (
  isRoot: boolean,
  editProcessInClick: (item: ProcessLibIn) => void,
  copyProcessInClick: (item: ProcessLibIn) => void,
  deleteProcessInClick: (item: ProcessLibIn) => void,
  isOnlyDetail?: boolean,
  isHaveSetDetil?: boolean,
  saveEmissionSourceInStore?: (accountId: number) => void,
  isProcess?: boolean,
): TableColumnsType<ProcessLibIn> => {
  // const kilometer = I18N.carbonFootprint3.kilometre;
  const data: TableColumnsType<ProcessLibIn> = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: '__index__',
      width: 70,
      className: styles.tableHeader,
      render: (text, processLibIn, index) => index + 1,
    },
    Table.EXPAND_COLUMN,
    {
      title: I18N.carbonFootprint3.enterName,
      dataIndex: 'name',
      width: 150,
      className: styles.tableHeader,
      render: text => (
        <TextOverflowTable
          maxWidth={150}
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
          ? ALL_EMISSION_LABEL()[processLibIn.type] || '-'
          : I18N.carbonFootprint3.unitProcess,
    },
    {
      title: I18N.carbonFootprint3.consumptionQuantity,
      dataIndex: 'unitStr',
      width: 100,
      className: styles.tableHeader,
      render: text => <TextWidthOverflow width={100} value={text} />,
    },
    {
      title: I18N.carbonFootprint.emissionKg,
      dataIndex: 'emissionTotal',
      width: 150,
      render: (text, record) => {
        if (
          record.matchWay === MATCH_WAY.SUPPLIER &&
          (record as unknown as { requestState: number }).requestState ===
            MODEL_EMISSION_REQUEST_STATE.WAITING
        ) {
          return I18N.carbonFootprint3.waitingForSuppliers;
        }
        return <TextWidthOverflow width={130} value={text} />;
      },
    },
    {
      title: I18N.carbonFootprint3.transportationEmissionsK,
      dataIndex: 'transTotal',
      width: 250,
      render: text => {
        if (text === '0') {
          return '-';
        }
        return <TextWidthOverflow width={200} value={text} />;
      },
    },
    {
      title: I18N.carbonFootprint.operation,
      width: 240,
      fixed: 'right',
      className: styles.tableHeader,
      dataIndex: '__operate__',
      render: (_, record) => (
        <div className={styles.inputTableCeil}>
          <div
            className={styles.operateBtn}
            onClick={() => {
              editProcessInClick(record);
            }}
          >
            {I18N.carbonFootprint3.details}
          </div>
          {!isRoot && !isHaveSetDetil && (
            <div
              className={styles.operateBtn}
              onClick={() => {
                copyProcessInClick(record);
              }}
            >
              {I18N.carbonFootprint.copy}
            </div>
          )}
          {!isRoot &&
            !isHaveSetDetil &&
            record.libState === 0 &&
            !isProcess &&
            record.matchWay !== MODEL_EMISSION_MATCH_WAY.SUPPLIER &&
            record.emissionTotal !== null && (
              <div className={styles.operateBtn}>
                <span
                  onClick={() => {
                    if (saveEmissionSourceInStore) {
                      saveEmissionSourceInStore(Number(record.id));
                    }
                  }}
                >
                  {I18N.carbonFootprint3.saveToLibrary}
                </span>
              </div>
            )}
          {!isRoot && !isHaveSetDetil && (
            <div
              className={styles.operateBtn}
              onClick={() => {
                deleteProcessInClick(record);
              }}
            >
              {I18N.carbonFootprint.delete}
            </div>
          )}
        </div>
      ),
    },
  ];

  // 详情页面不展示操作
  if (isOnlyDetail && !isHaveSetDetil) {
    data.splice(6, 1);
  }

  return data;
};
