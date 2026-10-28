/* eslint-disable no-nested-ternary */
import { SearchOutlined, UndoOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { useMount } from 'ahooks';
import {
  Button,
  Input,
  Popconfirm,
  Select,
  Table,
  Tooltip,
  InputNumber,
} from 'antd';
import { isNil } from 'lodash-es';
import { FC, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { FullscreenModal } from '@/components/FullscreenModal';
import { IconAlibabaNew } from '@/components/iconfont';
import { RouteMaps } from '@/router/route-paths';
import { downloadFileFromBlob, Toast } from '@/utils';

import styles from './index.module.less';
import {
  deleteResult,
  editEmployeeCount,
  exportResult,
  getQuestionnaireResultList,
} from './service';
import { getQuestionnaire } from '../components/QuestionnaireDetails/service';
import {
  QUESTIONNAIRE_CATEGORY_LABEL,
  TIME_TYPE,
  WORKDAY_TYPE,
} from '../constant';
import { Questionnaire } from '../type';

const renderDetailList = (
  items: Array<{ key: string; label: string; value: string | number }>,
) => (
  <ul className={styles.detailList}>
    {items.map(item => (
      <li
        className={styles.emissionDetails}
        key={item.key}
        title={`${item.label}${item.value}`}
      >
        <span>{item.label}</span>
        <span className={styles.emissionValue}>{item.value}</span>
      </li>
    ))}
  </ul>
);

const QuestionnaireResult: FC = () => {
  const { id } = useParams<{ id: string }>();

  const [edit, setEdit] = useState(false);

  const employeeCountRef = useRef<number>();

  const [questionnaire, setQuestionnaire] = useState<Questionnaire>();

  const [searchParams, setSearchParams] = useState<{
    pageNum: number;
    pageSize: number;
    search?: string;
    entryTimeType?: number;
    sortKey?: string;
    sortOrderBy?: 'descend' | 'ascend' | null;
  }>({ pageNum: 1, pageSize: 10 });

  const [resultList, setResultList] = useState<Record<string, any>[]>([]);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);

  const [exportLoading, setExportLoading] = useState(false);

  const history = useHistory();

  const back = () => history.push(RouteMaps.questionnaireList);

  const queryList = async (params: typeof searchParams) => {
    try {
      setLoading(true);
      setSearchParams(params);

      const { data } = await getQuestionnaireResultList({
        ...params,
        questionId: id,
        sortOrderBy:
          params.sortOrderBy === 'ascend'
            ? 'asc'
            : params.sortOrderBy === 'descend'
            ? 'desc'
            : undefined,
      });

      setResultList(data.data.rows);
      setTotal(data.data.total);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      throw e;
    }
  };

  const getQuestionnaireInfo = async (params: { id: string }) => {
    const { data } = await getQuestionnaire(params);
    setQuestionnaire(data.data);
  };

  const onResultDelete = async data => {
    await deleteResult(data);
    Toast('success', I18N.carbonFootprint.operationSuccessful);
    queryList(searchParams);
    getQuestionnaireInfo({ id });
  };

  const onResultListExport = async () => {
    try {
      setExportLoading(true);
      const response = await exportResult({ questionId: id });
      downloadFileFromBlob(response);
    } finally {
      setExportLoading(false);
    }
  };

  const editCount = () => {
    setTimeout(async () => {
      if (questionnaire) {
        await editEmployeeCount({
          id,
          employeeCount: employeeCountRef.current,
        });
        Toast('success', I18N.carbonFootprint.operationSuccessful);
        await getQuestionnaireInfo({ id });
        setEdit(false);
      }
    });
  };

  const sortProps = (columnKey: string) => ({
    sorter: true,
    showSorterTooltip: false,
    sortOrder:
      searchParams.sortKey === columnKey ? searchParams.sortOrderBy : undefined,
  });

  useMount(() => {
    getQuestionnaireInfo({ id });
    queryList(searchParams);
  });

  useEffect(() => {
    employeeCountRef.current = questionnaire?.employeeCount;
  }, [questionnaire]);

  return (
    <FullscreenModal>
      <div className={styles.result}>
        <div className={styles.header}>
          <div className={styles.nav}>
            <div className={styles.prevNav} onClick={back}>
              <IconAlibabaNew
                className={styles.prevIcon}
                type='icon-icon-fanhui2'
              />
              <div className={styles.navText}>
                {I18N.questionnaire.questionnaireService}
              </div>
            </div>
            <div className={styles.navText}>/</div>
            <div className={styles.currNavText}>
              {I18N.supplyChainCarbonManagement.questionnaireDetails}
            </div>
          </div>
          {questionnaire && (
            <div className={styles.title}>
              {questionnaire.name}
              <div className={styles.questionnaireTag}>
                {QUESTIONNAIRE_CATEGORY_LABEL()[questionnaire.type]}
              </div>
            </div>
          )}
        </div>
        <div className={styles.content}>
          <div className={styles.infoContent}>
            <div className={styles.info}>
              <div>
                <span className={styles.infoName}>
                  {I18N.questionnaire.totalEmissionsOfTheEnterprise}
                </span>
                <span className={styles.infoUnit}>
                  （tCO₂e）
                  <Tooltip
                    title={
                      <>
                        <div>
                          {I18N.questionnaire.usingStatisticalInference}
                        </div>
                        <div>{I18N.questionnaire.calculateEachResponse}</div>
                        <div>{I18N.questionnaire.averageCommutingSchedule}</div>
                      </>
                    }
                  >
                    <IconAlibabaNew
                      className={styles.infoIcon}
                      type='icon-icon-tishi'
                    />
                  </Tooltip>
                </span>
              </div>
              <div className={styles.infoValue}>
                {questionnaire?.emissionTotal ?? '-'}
              </div>
            </div>
            <div className={styles.info}>
              <div>
                <span className={styles.infoName}>
                  {I18N.questionnaire.employees}
                </span>
                <span className={styles.infoUnit}>
                  {I18N.questionnaire.people}
                  <IconAlibabaNew
                    className={styles.infoIcon}
                    type='icon-icon-bianjiyinzi'
                    onClick={() => setEdit(!edit)}
                  />
                </span>
              </div>
              <div className={styles.infoValue}>
                {!edit ? (
                  questionnaire?.employeeCount ?? '-'
                ) : (
                  <InputNumber
                    className={styles.employeeCountInput}
                    defaultValue={employeeCountRef.current}
                    min={0}
                    controls={false}
                    precision={0}
                    onChange={val => {
                      if (!isNil(val)) {
                        employeeCountRef.current = val;
                      }
                    }}
                    onBlur={editCount}
                  />
                )}
              </div>
            </div>
            <div className={styles.info}>
              <div>
                <span className={styles.infoName}>
                  {I18N.questionnaire.yearOfQuestionnaireCollection}
                </span>
                <span className={styles.infoUnit}>（tCO₂e）</span>
              </div>
              <div className={styles.infoValue}>
                {questionnaire?.submitEmission ?? '-'}
              </div>
            </div>
            <div className={styles.info}>
              <div>
                <span className={styles.infoName}>
                  {I18N.questionnaire.questionnaireCollectionVolume}
                </span>
                <span className={styles.infoUnit}>
                  {I18N.carbonDataManagemen.share}
                </span>
              </div>
              <div className={styles.infoValue}>
                {questionnaire?.submitCount ?? '-'}
              </div>
            </div>
          </div>
          <div className={styles.secondaryTitle}>{I18N.esg.dataList}</div>
          <div className={styles.searchContent}>
            <div className={styles.searchContentLeft}>
              <Input
                placeholder={I18N.questionnaire.nameMobileNumber2}
                value={searchParams.search}
                onChange={e =>
                  setSearchParams({ ...searchParams, search: e.target.value })
                }
              />
              <Select
                placeholder={I18N.questionnaire.entryTime}
                value={searchParams.entryTimeType}
                options={[
                  {
                    value: TIME_TYPE.PREV,
                    label: I18N.template(I18N.questionnaire.quest3, {
                      val1: questionnaire?.year,
                    }),
                  },
                  {
                    value: TIME_TYPE.DURING,
                    label: I18N.template(I18N.questionnaire.quest2, {
                      val1: questionnaire?.year,
                    }),
                  },
                  {
                    value: TIME_TYPE.AFTER,
                    label: I18N.template(I18N.questionnaire.quest, {
                      val1: questionnaire?.year,
                    }),
                  },
                ]}
                allowClear
                onChange={entryTimeType =>
                  setSearchParams({ ...searchParams, entryTimeType })
                }
              />
              <Button
                type='primary'
                icon={<SearchOutlined />}
                onClick={() => queryList({ ...searchParams, pageNum: 1 })}
              >
                {I18N.carbonNeutral.query}
              </Button>
              <Button
                icon={<UndoOutlined />}
                onClick={() =>
                  queryList({ pageNum: 1, pageSize: searchParams.pageSize })
                }
              >
                {I18N.carbonFootprint3.reset}
              </Button>
            </div>
            <Button
              type='primary'
              icon={<IconAlibabaNew type='icon-icon-daochu' />}
              loading={exportLoading}
              onClick={() => onResultListExport()}
            >
              {I18N.enterpriseCarbonAccount2.dataExport}
            </Button>
          </div>
          <Table
            rowKey='id'
            loading={loading}
            dataSource={resultList}
            scroll={{ x: 1550 }}
            columns={[
              {
                title: I18N.carbonFootprint.number,
                dataIndex: 'allIndex',
                width: 64,
                fixed: 'left',
              },
              {
                title: I18N.questionnaire.nameMobileNumber,
                dataIndex: 'name',
                width: 204,
                ellipsis: true,
                fixed: 'left',
                render: (_, record) => (
                  <>
                    <div>{record.employeeName}</div>
                    {record.phoneNum && (
                      <div>
                        <IconAlibabaNew
                          className={styles.employeeInfoIcon}
                          type='icon-icon-shoujihao'
                        />
                        {`(${record.areaCode}) ${record.phoneNum}`}
                      </div>
                    )}
                    {record.email && (
                      <div>
                        <IconAlibabaNew
                          className={styles.employeeInfoIcon}
                          type='icon-icon-youxiang'
                        />
                        {record.email}
                      </div>
                    )}
                  </>
                ),
              },
              {
                title: I18N.questionnaire.departmentId,
                dataIndex: 'department',
                width: 154,
                fixed: 'left',
                render: (_, record) =>
                  record.department || record.employeeCode ? (
                    <>
                      <div>{record.department}</div>
                      <div>{record.employeeCode}</div>
                    </>
                  ) : (
                    '-'
                  ),
              },
              {
                title: I18N.questionnaire.entryTime,
                dataIndex: 'entryTimeTypeName',
                width: 116,
              },
              {
                title: I18N.questionnaire.serviceDate,
                dataIndex: 'entryTime',
                ...sortProps('entryTime'),
                width: 116,
                render: txt => txt || '-',
              },
              {
                title:
                  questionnaire?.workdayType === WORKDAY_TYPE.YEARLY
                    ? I18N.questionnaire.annualWorkingDays
                    : I18N.questionnaire.commutingDaysPerWeek,
                dataIndex: 'weekdayCount',
                width: 124,
                render: (_, record) =>
                  questionnaire?.workdayType === WORKDAY_TYPE.YEARLY
                    ? record.workdayTotal || '-'
                    : record.weekdayCount || '-',
              },
              {
                title: I18N.questionnaire.commutingDistanceK,
                dataIndex: 'distance',
                width: 168,
                ...sortProps('distance'),
                render: (_, record) => {
                  const distanceList = Array.isArray(record.distanceList)
                    ? record.distanceList
                        .map((item, index) => ({
                          key: String(item?.id ?? item?.key ?? index),
                          value:
                            typeof item === 'object' && item !== null
                              ? item.distance ?? item.value
                              : item,
                        }))
                        .filter(item => item.value)
                    : [];

                  const distances =
                    distanceList.length > 0
                      ? distanceList
                      : [
                          {
                            key: 'distance',
                            value: record.distance,
                          },
                          {
                            key: 'distance2',
                            value: record.distance2,
                          },
                        ].filter(item => item.value);

                  return distances.length > 0
                    ? renderDetailList(
                        distances as Array<{
                          key: string;
                          label: string;
                          value: string | number;
                        }>,
                      )
                    : '-';
                },
              },
              {
                title: I18N.questionnaire.collectAnnualTotalRanking,
                dataIndex: 'emissionTotal',
                width: 226,
                ...sortProps('emissionTotal'),
                render: text =>
                  text ? (
                    <div className={styles.emissionValue}>{text}</div>
                  ) : (
                    '-'
                  ),
              },
              {
                title: I18N.questionnaire.annualCommutingMode,
                dataIndex: 'transDistance',
                width: 228,
                ellipsis: true,
                render: (_, record) => {
                  const transList = record.transList as Record<string, any>[];
                  return transList.length > 0
                    ? renderDetailList(
                        transList.map(trans => ({
                          key: String(
                            trans.id ??
                              `${trans.transTypeName}-${trans.distance}`,
                          ),
                          label: trans.transTypeName,
                          value: trans.distance,
                        })),
                      )
                    : '-';
                },
              },
              {
                title: I18N.questionnaire.variousCommutingModes,
                dataIndex: 'transEmission',
                width: 268,
                ellipsis: true,
                render: (_, record) => {
                  const transList = record.transList as Record<string, any>[];
                  return transList.length > 0
                    ? transList.map(trans => {
                        const { transTypeName, emission } = trans;
                        return (
                          <div
                            className={styles.emissionDetails}
                            key={transTypeName}
                            title={transTypeName + emission}
                          >
                            <span>{transTypeName}</span>
                            <span className={styles.emissionValue}>
                              {emission}
                            </span>
                          </div>
                        );
                      })
                    : '-';
                },
              },
              {
                title: I18N.carbonFootprint3.submissionTime,
                dataIndex: 'createTime',
                width: 186,
                ellipsis: true,
                ...sortProps('createTime'),
                render: text =>
                  text ? <div className={styles.timeValue}>{text}</div> : '-',
              },
              {
                title: I18N.questionnaire.responseTime,
                dataIndex: 'useTime',
                width: 128,
                ...sortProps('useTime'),
                render: text =>
                  text ? <div className={styles.timeValue}>{text}</div> : '-',
              },
              {
                title: I18N.carbonFootprint.operation,
                dataIndex: '__operate__',
                width: 68,
                fixed: 'right',
                render: (_, record) => (
                  <Popconfirm
                    title={I18N.base.confirm}
                    description={
                      I18N.enterpriseCarbonAccount2.doYouWantToDeleteIt2
                    }
                    onConfirm={async () => onResultDelete({ id: record.id })}
                  >
                    <Button className={styles.delBtn} type='link'>
                      {I18N.carbonFootprint.delete}
                    </Button>
                  </Popconfirm>
                ),
              },
            ]}
            pagination={{
              total,
              current: searchParams.pageNum,
              pageSize: searchParams.pageSize,
            }}
            onChange={(pager, filters, sorter, { action }) => {
              if (action === 'paginate') {
                queryList({
                  ...searchParams,
                  pageNum: pager.current || 1,
                  pageSize: pager.pageSize || 10,
                });
              }

              if (action === 'sort' && !(sorter instanceof Array)) {
                queryList({
                  ...searchParams,
                  pageNum: 1,
                  sortKey: sorter.field as string,
                  sortOrderBy: sorter.order,
                });
              }
            }}
          />
        </div>
        <div className={styles.footer}>
          <Button onClick={back}>{I18N.carbonFootprint.return}</Button>
        </div>
      </div>
    </FullscreenModal>
  );
};

export default QuestionnaireResult;
