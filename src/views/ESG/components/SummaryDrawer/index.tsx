import imgIcon from '@assets/svg/img_icon.svg';
import I18N from '@src/lang/I18N';
import { Button, Table, TableColumnsType } from 'antd';
import { isNil } from 'lodash-es';
import { cloneElement, FC, ReactElement, useEffect, useState } from 'react';

import { CustomDrawer } from '@/components/CustomDrawer';

import styles from './index.module.less';
import { getSummaryDetails } from './service';
import { BOOLEAN_OPTIONS_LABEL, INDICATOR_TYPE } from '../../constant';
import { Indicator } from '../../type';
import LastYearValueCompare from '../LastYearValueCompare';

const SummaryDrawer: FC<{ id: string; children: ReactElement }> = ({
  id,
  children,
}) => {
  const [open, setOpen] = useState(false);

  const [indicatorDetails, setIndicatorDetails] = useState<{
    baseInfo: Indicator;
    orgTasks: Record<string, any>[];
  }>();

  const [loading, setLoading] = useState(false);

  const columns: TableColumnsType<Record<string, any>> = [
    {
      title: I18N.components.organization,
      dataIndex: 'orgName',
      width: 236,
      ellipsis: true,
    },
    {
      title: I18N.esg.totalIndicatorValues,
      dataIndex: 'indicatorValue',
      width: 170,
      ellipsis: true,
      render: (_, { indicatorValue, unitName, indicatorType }) => {
        if (indicatorType === INDICATOR_TYPE.BOOLEAN) {
          return (
            <div className={styles.indicatorValue}>
              {BOOLEAN_OPTIONS_LABEL[indicatorValue as string] || '-'}
            </div>
          );
        }

        return indicatorValue ? (
          <div className={styles.indicatorValueColumn}>
            <div className={styles.indicatorValue} title={indicatorValue}>
              {indicatorValue}
            </div>
            <div className={styles.indicatorUnit}>{unitName}</div>
          </div>
        ) : (
          '-'
        );
      },
    },
    {
      title: I18N.carbonData.yoY,
      dataIndex: 'preIndicatorValue',
      width: 148,
      ellipsis: true,
      render: (_, record) => {
        if (record.indicatorType === INDICATOR_TYPE.NUMERIC) {
          return !isNil(record.preIndicatorValue) ? (
            <LastYearValueCompare
              current={record.indicatorValue}
              prev={record.preIndicatorValue}
              unitName={record.unitName}
            />
          ) : (
            '-'
          );
        }

        if (record.indicatorType === INDICATOR_TYPE.BOOLEAN) {
          return (
            BOOLEAN_OPTIONS_LABEL[record.preIndicatorValue as string] || '-'
          );
        }

        return record.preIndicatorValue || '-';
      },
    },
    {
      title: I18N.esg.fillInByTheApplicant,
      dataIndex: 'updateName',
      width: 190,
      render: (_, { updateName, updateTime }) =>
        updateName || updateTime ? (
          <>
            <div className={styles.columnInfo} title={updateName}>
              {updateName}
            </div>
            <div className={styles.columnInfo} title={updateTime}>
              {updateTime}
            </div>
          </>
        ) : (
          '-'
        ),
    },
    {
      title: I18N.esg.remarksAttachment,
      dataIndex: 'remark',
      width: 154,
      render: (_, record) => {
        const { fileList, remark } = record as Indicator;
        const files = fileList || [];
        return files.length !== 0 || remark ? (
          <>
            <div className={styles.columnInfo} title={remark}>
              {remark}
            </div>
            <div className={styles.attachmentIconContent}>
              {files.map(file => (
                <a
                  title={file.name}
                  key={file.url}
                  href={file.url}
                  target='_blank'
                  rel='noreferrer'
                >
                  <img alt='name' src={imgIcon} />
                </a>
              ))}
            </div>
          </>
        ) : (
          '-'
        );
      },
    },
  ];

  useEffect(() => {
    if (open) {
      setLoading(true);
      getSummaryDetails({ id })
        .then(({ data }) => {
          setIndicatorDetails(data.data);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, id]);
  return (
    <>
      <CustomDrawer
        title={indicatorDetails?.baseInfo?.name}
        open={open}
        width={960}
        loading={loading}
        destroyOnClose
        footer={
          <div className={styles.footer}>
            <Button onClick={() => setOpen(false)}>
              {I18N.carbonFootprint.return}
            </Button>
          </div>
        }
        onClose={() => setOpen(false)}
        afterOpenChange={opened => {
          if (!opened) {
            setIndicatorDetails(undefined);
          }
        }}
      >
        {indicatorDetails && (
          <>
            <div className={styles.indicatorInfo}>
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>
                  {I18N.esg.interpretationOfIndicators}
                </div>
                <div>
                  <div className={styles.infoValue}>
                    {indicatorDetails.baseInfo.description || '-'}
                  </div>
                  {indicatorDetails.baseInfo.example?.length > 0 && (
                    <div className={styles.attachmentIconContent}>
                      {indicatorDetails.baseInfo.example.map(attachment => (
                        <a
                          title={attachment.name}
                          key={attachment.url}
                          href={attachment.url}
                          target='_blank'
                          rel='noreferrer'
                        >
                          <img alt='name' src={imgIcon} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>
                  {I18N.esg.referenceStandards}
                </div>
                <div className={styles.standardContent}>
                  {indicatorDetails.baseInfo.standardStr
                    ?.split(',')
                    .map(std => (
                      <div className={styles.standardTag} key={std}>
                        {std}
                      </div>
                    )) || '-'}
                </div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>
                  {I18N.esg.fillInRequirements}
                </div>
                <div className={styles.infoValue}>
                  {indicatorDetails.baseInfo.fillRequire || '-'}
                </div>
              </div>
            </div>
            <div className={styles.splitLine} />
            <Table
              rowKey='orgId'
              columns={columns}
              dataSource={indicatorDetails.orgTasks}
              pagination={false}
            />
          </>
        )}
      </CustomDrawer>
      {cloneElement(children, { onClick: () => setOpen(!open) })}
    </>
  );
};

export default SummaryDrawer;
