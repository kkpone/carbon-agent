import I18N from '@src/lang/I18N';
import type { GetProp, TablePaginationConfig, TableProps } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import { round } from 'lodash-es';

import { apiAddClew } from '@/views/system/login/service';

import { CollectCopy } from './CollectCopy';
import { Feedback } from './Feedback';
import styles from './index.module.less';
import { Row } from '../service';

type ColumnsType<T> = TableProps<T>['columns'];

interface DataType extends Row {
  id: string;
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult<any>['field'];
  sortOrder?: SorterResult<any>['order'];
  filters?: Parameters<GetProp<TableProps, 'onChange'>>[1];
}

const SubmitInfo = async (FormInfo: any) => {
  await apiAddClew({
    ...FormInfo,
    phonenumber: (FormInfo.phonenumber as any).phone_number,
    sourceType: 'ccdb_getValue',
  });
};

export const getColumns: (
  showDetail: (value: DataType) => void,
  refresh?: () => void,
  tableParams?: TableParams,
  productPermissions?: boolean,
) => ColumnsType<DataType> = (
  showDetail,
  refresh,
  tableParams,
  productPermissions,
) => {
  const publish = productPermissions
    ? [
        {
          title: I18N.ccdb.publishingInstitutionOr,
          dataIndex: 'institution',
          width: '20%',
          render: text => text || '-',
        },
      ]
    : [];
  return [
    {
      title: I18N.carbonFootprint.factorName,
      dataIndex: 'name',
      width: '20%',
      render: (item, record) => (
        <div className={styles.all}>
          <div className={styles.nameWrapper}>
            <span className={styles.name} onClick={() => showDetail(record)}>
              {item}
            </span>
            <div className={styles.collectAndCopy}>
              <CollectCopy
                key={`${record.id}${record.isCollectFactor}`}
                {...record}
                refresh={refresh}
              />
            </div>
          </div>
          <div className={styles.specification}>{record.specification}</div>
        </div>
      ),
    },
    ...publish,
    {
      title: I18N.components.applicableScenarios,
      dataIndex: 'description',
      width: '30%',
      render: text => (
        <div className={styles.description} title={text}>
          {text || '-'}
        </div>
      ),
    },
    {
      title: I18N.carbonFootprint.factorValue,
      dataIndex: 'cValue',
      sorter: true,
      sortOrder:
        tableParams?.sortField === 'cValue' ? tableParams?.sortOrder : null,
      width: '16%',
      render: (item, record) => (
        <div
          className={styles.cValueWrapper}
          onClick={() => showDetail(record)}
        >
          {record.productPermissions === '0' && (
            <>
              {record.isEncryption === '0' && (
                <div className={styles.cValue}>{round(item, 6)}</div>
              )}
              {record.isEncryption !== '0' && (
                <Feedback
                  title={I18N.carbonFootprint.welcomeToCooperate}
                  type='mark'
                  des={I18N.ccdb.leaveYourLetterBehind}
                  onSubmit={SubmitInfo}
                >
                  <span className={styles.encryptionTip}>
                    {I18N.ccdb.encryptDataPoints}
                  </span>
                </Feedback>
              )}
            </>
          )}
          {record.productPermissions === '1' && (
            <div className={styles.cValue}>{round(item, 6)}</div>
          )}
          <div className={styles.unit}>{record.unit}</div>
        </div>
      ),
    },
    {
      title: I18N.carbonFootprint.yearOfPublication,
      dataIndex: 'year',
      sortOrder:
        tableParams?.sortField === 'year' ? tableParams?.sortOrder : null,
      sorter: true,
      width: '10%',
    },
  ];
};
