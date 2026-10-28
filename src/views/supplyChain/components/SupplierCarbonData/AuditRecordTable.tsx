import CommonTable from '@src/components/TableUtil/page/CommonTable';
import I18N from '@src/lang/I18N';
import { ColumnsType } from 'antd/es/table';
import classNames from 'classnames';
import { FC, useState } from 'react';

import styles from './index.module.less';
import { getAuditRecordList } from './service';
import { AuditRecord } from './type';
import { CARBON_DATA_STATUS } from '../../constant';

type AuditRecordTableProps = { id: number };

const AuditRecordTable: FC<AuditRecordTableProps> = ({ id }) => {
  const [pager, setPager] = useState({ pageNum: 1, pageSize: 10 });

  const { pageNum, pageSize } = pager;

  const columns: ColumnsType<AuditRecord> = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: '__No__',
      width: 114,
      ellipsis: true,
      fixed: 'left',
      render: (_, record, index) => pageSize * (pageNum - 1) + index + 1,
    },
    {
      title: I18N.carbonFootprint.state,
      dataIndex: 'result',
      ellipsis: true,
      render: (_, { result, resultDesc }) => (
        <div
          className={classNames(styles.statusTag, {
            [styles.approvedStatusTag]: result === CARBON_DATA_STATUS.APPROVED,
            [styles.disApprovedStatusTag]:
              result === CARBON_DATA_STATUS.DISAPPROVED,
          })}
        >
          {resultDesc}
        </div>
      ),
    },
    {
      title: I18N.carbonFootprint3.reviewer,
      dataIndex: 'createBy',
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.reviewTime,
      dataIndex: 'createTime',
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.reviewRemarks,
      dataIndex: 'content',
      ellipsis: true,
    },
  ];

  return (
    <CommonTable
      columns={columns}
      searchParams={pager}
      fetchApi={() => getAuditRecordList({ ...pager, id })}
      returnFetchApi={resp => ({
        data: resp.data.rows,
        count: resp.data.total,
      })}
      onChange={pagination => {
        setPager({
          pageNum: pagination.current ?? 1,
          pageSize: pagination.pageSize ?? 10,
        });
      }}
    />
  );
};

export default AuditRecordTable;
