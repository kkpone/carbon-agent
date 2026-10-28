import I18N from '@src/lang/I18N';
import useUrlState from '@ahooksjs/use-url-state';
import { downloadFile } from '@src/components/DownLoadFile';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import commonStyles from '@src/views/supplyChain/index.module.less';
import { Button } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import classNames from 'classnames';
import {
  forwardRef,
  useImperativeHandle,
  ForwardRefRenderFunction,
  useRef,
  useState,
  useLayoutEffect,
  useMemo,
} from 'react';
import { ValueOf } from 'type-fest';

import styles from './index.module.less';
import { getImportRecordList } from './service';
import { ImportRecord } from './type';
import { IMPORT_STATUS, SUPPLY_CHAIN_IMPORT_TYPE } from '../../constant';

type ImportRecordTableProps = {
  type: ValueOf<typeof SUPPLY_CHAIN_IMPORT_TYPE>;
};

const ImportRecordTable: ForwardRefRenderFunction<
  (params?: { pageNum?: number; pageSize?: number }) => void,
  ImportRecordTableProps
> = ({ type }, ref) => {
  const tableContentRef = useRef<HTMLDivElement>(null);

  const [tableScrollHeight, setTableScrollHeight] = useState<number>();

  const [urlParams, setUrlParams] = useUrlState<{
    pageNum: number;
    pageSize: number;
    refreshFlag?: boolean;
  }>({ pageNum: 1, pageSize: 10 });

  const pageNum = Number(urlParams.pageNum);

  const pageSize = Number(urlParams.pageSize);

  const refreshFlag = `${urlParams.refreshFlag}` === 'true';

  useImperativeHandle(
    ref,
    () => params => {
      setUrlParams({ ...params, refreshFlag: !refreshFlag });
    },
    [setUrlParams, refreshFlag],
  );

  const searchParams = useMemo(
    () => ({ ...urlParams, type }),
    [urlParams, type],
  );

  const columns: ColumnsType<ImportRecord> = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: '__No__',
      width: 74,
      ellipsis: true,
      fixed: 'left',
      render: (_, record, index) => pageSize * (pageNum - 1) + index + 1,
    },
    {
      title: I18N.carbonFootprint.fileName,
      dataIndex: 'name',
      width: 204,
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: I18N.carbonFootprint.totalNumberOfEntries,
      dataIndex: 'total',
      width: 104,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint.numberOfImports,
      dataIndex: 'success',
      width: 104,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint.numberOfExceptions,
      dataIndex: 'fail',
      width: 104,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint.state,
      dataIndex: 'status',
      width: 152,
      ellipsis: true,
      render: (_, record) => (
        <div className={styles.importStatus}>
          <div
            className={classNames(styles.statusIcon, {
              [styles.successStatusIcon]:
                record.status === IMPORT_STATUS.SUCCESS,
              [styles.failStatusIcon]: record.status === IMPORT_STATUS.FAIL,
              [styles.partialSuccessStatusIcon]:
                record.status === IMPORT_STATUS.PARTIAL_SUCCESS,
            })}
          />
          {record.statusDesc}
        </div>
      ),
    },
    {
      title: I18N.carbonFootprint.operator,
      dataIndex: 'createUser',
      width: 112,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint.updateTime,
      dataIndex: 'createTime',
      width: 188,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: '__operate__',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <>
          <Button
            className={commonStyles.operateBtn}
            type='link'
            onClick={() => downloadFile(record.name, record.url)}
          >
            {I18N.supplyChain.importFile}
          </Button>
          <Button
            className={commonStyles.operateBtn}
            type='link'
            danger
            disabled={!record.failUrl}
            onClick={() => downloadFile(record.name, record.failUrl)}
          >
            {I18N.carbonFootprint.abnormalData}
          </Button>
        </>
      ),
    },
  ];

  useLayoutEffect(() => {
    if (tableContentRef.current) {
      setTableScrollHeight(tableContentRef.current.offsetHeight - 115);
    }
  }, []);

  return (
    <div className={styles.tableContent} ref={tableContentRef}>
      <CommonTable
        columns={columns}
        rowKey='id'
        pagination={{
          current: pageNum,
          pageSize,
          showTotal: total =>
            I18N.template(I18N.supplyChain.totalTota11, { val1: total }),
        }}
        searchParams={searchParams}
        scroll={{ x: 1200, y: tableScrollHeight }}
        fetchApi={() => getImportRecordList({ type, pageNum, pageSize })}
        returnFetchApi={back => ({
          data: back.data.rows,
          count: back.data.total,
        })}
        onChange={pagination => {
          setUrlParams({
            pageNum: pagination.current,
            pageSize: pagination.pageSize,
          });
        }}
      />
    </div>
  );
};

export default forwardRef(ImportRecordTable);
