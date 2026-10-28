import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import I18N, { LocaleType } from '@src/lang/I18N';
import { Button, Input, Select, Table, TableColumnsType, App } from 'antd';
import { debounce } from 'lodash-es';
import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { LocaleContext } from '@/components/LocaleProvider';
import { checkPermissions } from '@/components/Permission/utils';
import { RouteMaps } from '@/router/route-paths';
import { getYear, Toast } from '@/utils';

import AddAnalysisModal from './AddAnalysisModal';
import AnalysisStatusTag from './AnalysisStatusTag';
import LinkModal from './LinkModal';
import {
  IMPORTANCE_ANALYSIS_STATUS,
  IMPORTANCE_ANALYSIS_STATUS_LABEL,
} from './constant';
import styles from './index.module.less';
import {
  getImportanceAnalysisList,
  publishImportanceAnalysis,
} from './service';

const ImportanceAnalysis: FC = () => {
  const { modal } = App.useApp();
  const [loading, setLoading] = useState(false);

  const [searchParams, setSearchParams] = useState<{
    pageNum: number;
    pageSize: number;
    name?: string;
    status?: number;
    year?: number;
  }>({ pageNum: 1, pageSize: 10 });

  const [tableData, setTableData] = useState<Record<string, any>[]>([]);

  const [total, setTotal] = useState(0);

  const [addModalOpen, setAddModalOpen] = useState(false);

  const [linkModalProps, setLinkModalProps] = useState<{
    open: boolean;
    id?: number;
  }>({
    open: false,
  });

  const { locale } = useContext(LocaleContext);

  const isZh = locale === LocaleType.zhCN;

  const history = useHistory();

  const getTableData = async params => {
    try {
      setLoading(true);
      const { data } = await getImportanceAnalysisList(params);
      setTableData(data.rows);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  const onNameInputChange = useMemo(
    () =>
      debounce((name: string) => {
        setSearchParams({ ...searchParams, name, pageNum: 1 });
      }, 300),
    [searchParams],
  );

  const onPublish = async id => {
    modal.confirm({
      icon: null,
      title: I18N.esg.confirmTheReleaseOfThis,
      content: I18N.esg.modifyAfterPublishing,
      onOk: async () => {
        await publishImportanceAnalysis(id);
        Toast('success', I18N.cbam.publishedSuccessfully);
        setSearchParams({ ...searchParams });
      },
    });
  };

  const editPermission = !!checkPermissions(true, 'esg:survey:edit');
  const addPermission = !!checkPermissions(true, 'esg:survey:add');

  const columns: TableColumnsType<Record<string, any>> = [
    {
      dataIndex: 'name',
      title: I18N.esg.analysisName,
      width: 360,
      ellipsis: true,
      fixed: 'left',
      render: (_, record) => record[isZh ? 'name' : 'nameEn'] || '-',
    },
    {
      dataIndex: 'year',
      title: I18N.questionnaire.collectYear,
      width: 160,
      ellipsis: true,
    },
    {
      dataIndex: 'status',
      title: I18N.carbonFootprint.state,
      width: 160,
      ellipsis: true,
      render: (status: number) => <AnalysisStatusTag status={status} />,
    },
    {
      dataIndex: 'submitCount',
      title: I18N.questionnaire.questionnaireCollectionVolume,
      width: 160,
    },
    {
      dataIndex: '__operator__',
      title: I18N.carbonFootprint.operation,
      width: 260,
      fixed: 'right',
      render: (_, record) => {
        const { status, id } = record;
        return (
          <div className={styles.operateColumn}>
            {[
              IMPORTANCE_ANALYSIS_STATUS.PUBLISHED,
              IMPORTANCE_ANALYSIS_STATUS.CLOSED,
            ].includes(status) && (
              <Button
                type='link'
                onClick={() =>
                  history.push(
                    RouteMaps.ESGImportanceAnalysisResult.replace(
                      ':id',
                      `${id}`,
                    ),
                  )
                }
              >
                {I18N.carbonFootprint3.details}
              </Button>
            )}

            {status === IMPORTANCE_ANALYSIS_STATUS.UN_PUBLISHED &&
              editPermission && (
                <Button type='link' onClick={() => onPublish(id)}>
                  {I18N.cbam.release}
                </Button>
              )}
            {[
              IMPORTANCE_ANALYSIS_STATUS.UN_PUBLISHED,
              IMPORTANCE_ANALYSIS_STATUS.PUBLISHED,
            ].includes(status) &&
              editPermission && (
                <Button
                  type='link'
                  onClick={() => {
                    if (status === IMPORTANCE_ANALYSIS_STATUS.UN_PUBLISHED) {
                      history.push(
                        `${RouteMaps.ESGImportanceAnalysisInfo.replace(
                          ':id',
                          '',
                        )}${id}`,
                      );
                      return;
                    }
                    modal.confirm({
                      icon: null,
                      title: I18N.esg.confirmToModifyThis,
                      content: I18N.esg.pleaseMakeModifications,
                      onOk: () => {
                        history.push(
                          `${RouteMaps.ESGImportanceAnalysisInfo.replace(
                            ':id',
                            '',
                          )}${id}`,
                        );
                      },
                    });
                  }}
                >
                  {I18N.esg.modifyQuestionnaire}
                </Button>
              )}

            {status === IMPORTANCE_ANALYSIS_STATUS.PUBLISHED && (
              <Button
                type='link'
                onClick={() => setLinkModalProps({ open: true, id })}
              >
                {I18N.questionnaire.questionnaireLink}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    getTableData(searchParams);
  }, [searchParams]);

  return (
    <div className={styles.importanceAnalysis}>
      <AddAnalysisModal
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
      />
      <LinkModal
        open={linkModalProps.open}
        id={linkModalProps.id}
        onCancel={() => setLinkModalProps({ open: false })}
      />
      <div className={styles.title}>{I18N.esg.importantIssues}</div>
      <div className={styles.searchContent}>
        <div className={styles.searchContentLeft}>
          <Input
            className={styles.searchInput}
            suffix={<SearchOutlined className={styles.searchIcon} />}
            placeholder={I18N.esg.analysisName}
            onChange={e => onNameInputChange(e.target.value)}
          />
          <Select
            className={styles.searchSelect}
            placeholder={I18N.carbonFootprint.year}
            allowClear
            options={getYear().map(year => ({
              value: year,
              label: year.toString(),
            }))}
            onChange={year =>
              setSearchParams({ ...searchParams, year, pageNum: 1 })
            }
          />
          <Select
            className={styles.searchSelect}
            placeholder={I18N.carbonFootprint.state}
            allowClear
            options={Object.values(IMPORTANCE_ANALYSIS_STATUS)
              .filter(
                status =>
                  status !== IMPORTANCE_ANALYSIS_STATUS.PUBLISHED_OR_CLOSED,
              )
              .map(status => ({
                value: status,
                label: IMPORTANCE_ANALYSIS_STATUS_LABEL[status],
              }))}
            onChange={status =>
              setSearchParams({ ...searchParams, status, pageNum: 1 })
            }
          />
        </div>
        {addPermission && (
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={() => setAddModalOpen(true)}
          >
            {I18N.esg.newAnalysis}
          </Button>
        )}
      </div>
      <Table
        rowKey='id'
        loading={loading}
        columns={columns}
        dataSource={tableData}
        scroll={{ x: 1200 }}
        pagination={{
          current: searchParams.pageNum,
          pageSize: searchParams.pageSize,
          total,
          onChange: (page, pageSize) => {
            setSearchParams({ ...searchParams, pageNum: page, pageSize });
          },
        }}
      />
    </div>
  );
};

export default ImportanceAnalysis;
