import I18N from '@src/lang/I18N';
import { Select, Switch, Table, TableColumnsType } from 'antd';
import { FC, useContext, useEffect, useState } from 'react';

import { LocaleContext } from '@/components/LocaleProvider';
// import { IconAlibabaNew } from '@/components/iconfont';
import { LocaleType } from '@/lang/I18N';

import styles from './index.module.less';
import { getSummaryTableData, toggleStatus } from './service';
import {
  IMPORTANCE_COLOR,
  IMPORTANCE_LABEL,
} from '../../ImportanceAnalysisInfo/constant';

const SummaryTable: FC<{
  id: string;
  analysisInfo: Record<string, any>;
  editPermission: boolean;
  updateImportanceAnalysis: () => Promise<void>;
}> = ({ id, analysisInfo, editPermission, updateImportanceAnalysis }) => {
  const [tableData, setTableData] = useState<Record<string, any>[]>([]);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);

  const { locale } = useContext(LocaleContext);

  const isZh = locale === LocaleType.zhCN;

  const [searchParams, setSearchParams] = useState<{
    pageNum: number;
    pageSize: number;
    status?: number;
    roleId?: number;
    orderField?: string;
    orderBy?: 'asc' | 'desc';
  }>({ pageNum: 1, pageSize: 10 });

  const getSortOrder = (columnKey: string) => {
    if (columnKey !== searchParams.orderField) {
      return undefined;
    }

    return searchParams.orderBy === 'asc' ? 'ascend' : 'descend';
  };

  const columns: TableColumnsType<Record<string, any>> = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: '__No__',
      width: 68,
      fixed: 'left',
      render: (_, __, index) =>
        (searchParams.pageNum - 1) * searchParams.pageSize + index + 1,
    },
    {
      title: I18N.carbonAccount.userId,
      dataIndex: 'userId',
      width: 120,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: I18N.dashborad.role,
      dataIndex: 'roleId',
      width: 120,
      fixed: 'left',
      sorter: true,
      sortOrder: getSortOrder('roleId'),
      ellipsis: true,
      render: (_, record) => record.role || '-',
    },
    {
      title: I18N.carbonFootprint3.submissionTime,
      dataIndex: 'updateTime',
      width: 180,
      sorter: true,
      sortOrder: getSortOrder('updateTime'),
      ellipsis: true,
    },
    {
      title: I18N.esg.totalTimeTaken,
      dataIndex: 'useTime',
      width: 120,
      sorter: true,
      sortOrder: getSortOrder('useTime'),
      ellipsis: true,
    },
    ...(analysisInfo.topics || [])
      .reduce(
        (prev, curr) => [
          ...prev,
          ...(curr.topicList || [])
            .filter(topic => !!topic.related)
            .map(topic => ({
              ...topic,
              title: isZh
                ? `${curr.moduleName}: ${topic.name}`
                : `${curr.moduleNameEn}: ${topic.nameEn}`,
            })),
        ],
        [],
      )
      .map(topic => ({
        title: topic.title,
        dataIndex: `topic-${topic.topicId}`,
        ellipsis: true,
        children: [
          {
            title: I18N.esg.importanceOfTheCompany,
            dataIndex: 'companyResult',
            width: isZh ? 144 : 240,
            ellipsis: true,
            render: (_, record) => {
              const { topics } = record;
              const currTopic = topics?.find(t => t.topicId === topic.topicId);
              if (!currTopic) return '-';

              const { companyResult } = currTopic;
              const { textColor, borderColor } =
                IMPORTANCE_COLOR[companyResult];

              return (
                <div className={styles.scoreContent}>
                  <div>{IMPORTANCE_LABEL(companyResult)}</div>
                  <div
                    className={styles.score}
                    style={{ color: textColor, borderColor }}
                  >
                    {companyResult >= 0 ? companyResult : '-'}
                  </div>
                </div>
              );
            },
          },
          {
            title: I18N.esg.stakeholder,
            dataIndex: 'selfResult',
            width: isZh ? 176 : 240,
            ellipsis: true,
            render: (_, record) => {
              const { topics } = record;
              const currTopic = topics?.find(t => t.topicId === topic.topicId);
              if (!currTopic) return '-';

              const { selfResult } = currTopic;
              const { textColor, borderColor } = IMPORTANCE_COLOR[selfResult];

              return (
                <div className={styles.scoreContent}>
                  <div>{IMPORTANCE_LABEL(selfResult)}</div>
                  <div
                    className={styles.score}
                    style={{ color: textColor, borderColor }}
                  >
                    {selfResult >= 0 ? selfResult : '-'}
                  </div>
                </div>
              );
            },
          },
        ],
      })),
    ...(analysisInfo.questions || []).map(quest => ({
      title: isZh ? quest.question : quest.questionEn,
      dataIndex: `question-${quest.id}`,
      width: 134,
      ellipsis: true,
      render: (_, record) => {
        const { questions } = record;
        const currQuestion = questions?.find(q => q.id === quest.id);

        if (!currQuestion) return '-';

        const { answer } = currQuestion;
        return answer || '-';
      },
    })),
    {
      title: I18N.esg.dataStatus,
      dataIndex: 'status',
      width: 96,
      fixed: 'right',
      render: (_, record) => (
        <Switch
          checked={!!record.status}
          size='small'
          disabled={!editPermission}
          onChange={async () => {
            try {
              setLoading(true);
              await toggleStatus(record.id);
              setSearchParams({ ...searchParams });
              updateImportanceAnalysis();
            } catch {
              setLoading(false);
            }
          }}
        />
      ),
    },
  ];

  useEffect(() => {
    setLoading(true);
    getSummaryTableData({ surveyId: id, ...searchParams })
      .then(({ data }) => {
        setTableData(data.rows);
        setTotal(data.total);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, searchParams]);

  return (
    <div className={styles.summaryTable}>
      <div className={styles.title}>
        {I18N.esg.questionnaireCollectionSituation}
      </div>
      <div className={styles.searchRow}>
        <div className={styles.searchRowLeft}>
          <Select
            className={styles.searchSelect}
            placeholder={I18N.dashborad.role}
            allowClear
            options={analysisInfo.roles?.map(role => ({
              value: role.id,
              label: role[isZh ? 'role' : 'roleEn'],
            }))}
            onChange={roleId =>
              setSearchParams({ ...searchParams, pageNum: 1, roleId })
            }
          />
          <Select
            className={styles.searchSelect}
            placeholder={I18N.carbonFootprint.state}
            allowClear
            options={[
              { value: 1, label: I18N.carbonAccount.open2 },
              { value: 0, label: I18N.carbonFootprint3.close },
            ]}
            onChange={status =>
              setSearchParams({ ...searchParams, pageNum: 1, status })
            }
          />
        </div>
        {/* <Button icon={<IconAlibabaNew type='icon-icon-daochu' />}>
          数据导出
        </Button> */}
      </div>
      <Table
        rowKey='id'
        columns={columns}
        dataSource={tableData}
        loading={loading}
        scroll={{ x: 1200, y: 376 }}
        pagination={{
          total,
          pageSize: searchParams.pageSize,
          current: searchParams.pageNum,
          onChange: (page, pageSize) => {
            setSearchParams({ ...searchParams, pageNum: page, pageSize });
          },
        }}
        onChange={(pagination, filters, sorter, { action }) => {
          if (action === 'sort') {
            const { field, order } = sorter as {
              field: string;
              order?: 'ascend' | 'descend';
            };

            setSearchParams({
              ...searchParams,
              pageNum: 1,
              orderField: field as string,
              orderBy:
                order === 'ascend'
                  ? 'asc'
                  : order === 'descend'
                  ? 'desc'
                  : undefined,
            });
          }
        }}
      />
    </div>
  );
};

export default SummaryTable;
