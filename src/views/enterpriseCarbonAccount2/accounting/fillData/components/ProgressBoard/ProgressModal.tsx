import I18N from '@src/lang/I18N';
import { Button, Modal, Table, TableColumnsType } from 'antd';
import { cloneElement, FC, useEffect, useState } from 'react';
import styles from './progress.module.less';
import { DownloadOutlined } from '@ant-design/icons';
import { exportTaskList, getTaskList } from './service';
import { downloadFileFromBlob } from '@/utils';

type ProgressModalProps = {
  type: 0 | 1;
  computationId: string;
  computationPeriod?: string;
  children: React.ReactElement;
};

const ProgressModal: FC<ProgressModalProps> = ({
  type,
  children,
  computationId,
  computationPeriod,
}) => {
  const [open, setOpen] = useState(false);

  const [dataSource, setDataSource] = useState<Record<string, any>[]>([]);

  const [loading, setLoading] = useState(false);

  const [exportLoading, setExportLoading] = useState(false);

  const columns: TableColumnsType<Record<string, any>> =
    type === 0
      ? [
          {
            title: I18N.carbonFootprint3.emissionSourceName,
            dataIndex: 'name',
            ellipsis: true,
          },
          {
            title: I18N.components.emissionFacilityActivity,
            dataIndex: 'facility',
            ellipsis: true,
          },
          {
            title: I18N.enterpriseCarbonAccount2.reportedBy,
            dataIndex: 'appointName',
            ellipsis: true,
          },
        ]
      : [
          {
            title: I18N.carbonFootprint3.emissionSourceName,
            dataIndex: 'name',
            ellipsis: true,
          },
          {
            title: I18N.components.emissionFacilityActivity,
            dataIndex: 'facility',
            ellipsis: true,
          },
          {
            title: I18N.enterpriseCarbonAccount2.approver,
            dataIndex: 'appointName',
            ellipsis: true,
          },
          {
            title: I18N.enterpriseCarbonAccount2.responsibleApprovalNode,
            dataIndex: 'nodeName',
            ellipsis: true,
          },
        ];

  useEffect(() => {
    if (open) {
      setLoading(true);
      getTaskList({
        computationId,
        computationPeriod,
        type,
      })
        .then(({ data }) => {
          setDataSource(data.data);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, type, computationId, computationPeriod]);
  return (
    <>
      <Modal
        title={
          <div className={styles.titleContent}>
            <div className={styles.titleText}>
              {type === 0
                ? I18N.enterpriseCarbonAccount2.fillingDetails
                : I18N.eca.reviewDetails}
            </div>
            <Button
              icon={<DownloadOutlined />}
              loading={exportLoading}
              className={styles.downloadButton}
              onClick={async () => {
                setExportLoading(true);
                const response = await exportTaskList({
                  computationId,
                  computationPeriod,
                  type,
                });
                downloadFileFromBlob(response);
                setExportLoading(false);
              }}
            />
          </div>
        }
        open={open}
        width={664}
        footer={
          <div className={styles.footer}>
            <span>{I18N.workbench.common}</span>
            <span className={styles.countText}>{dataSource.length}</span>
            <span>{I18N.enterpriseCarbonAccount2.record}</span>
          </div>
        }
        onCancel={() => setOpen(false)}
        afterClose={() => {
          setDataSource([]);
          setExportLoading(false);
          setLoading(false);
        }}
      >
        <Table
          rowKey='id'
          dataSource={dataSource}
          columns={columns}
          loading={loading}
          pagination={false}
          scroll={{
            y: 400,
          }}
        />
      </Modal>
      {cloneElement(children, { onClick: () => setOpen(true) })}
    </>
  );
};

export default ProgressModal;
