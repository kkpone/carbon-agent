import { SearchOutlined } from '@ant-design/icons';
import emptyImg from '@assets/svg/enterprise_empty.svg';
import I18N from '@src/lang/I18N';
import { Button, Input, Progress, Select, Spin } from 'antd';
import classNames from 'classnames';
import { FC, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { IconFont } from '@/components/LcaIconFont';
import { RouteMaps } from '@/router/route-paths';

import styles from './index.module.less';
import {
  getESGTaskFillProgress,
  getESGTaskList,
  getTaskPeriodList,
} from './service';
import {
  ESG_TASK_STATUS,
  ESG_TASK_STATUS_LABEL,
  TOPIC_COLOR,
} from '../constant';
import { ESGTask, IndicatorSystem } from '../type';

const FillManagement: FC = () => {
  const [taskPeriodList, setTaskPeriodList] = useState<IndicatorSystem[]>([]);

  const [taskPeriod, setTaskPeriod] = useState<IndicatorSystem>();

  const [taskList, setTaskList] = useState<ESGTask[]>([]);

  const [filterParams, setFilterParams] = useState<{
    orgName: string;
    status: number[];
  }>({ orgName: '', status: [] });

  const [progressData, setProgressData] = useState<
    { code: number; rate: string; name: string }[]
  >([
    {
      code: 0,
      rate: '',
      name: I18N.esg.overallFillingProgress,
    },
    {
      code: 1,
      rate: '',
      name: I18N.esg.environment,
    },
    {
      code: 2,
      rate: '',
      name: I18N.esg.society,
    },
    {
      code: 3,
      rate: '',
      name: I18N.esg.corporateGovernance,
    },
    {
      code: 4,
      rate: '',
      name: I18N.esg.otherIndicators,
    },
  ]);

  const [loading, setLoading] = useState(false);

  const history = useHistory();

  const taskPeriodIndex = taskPeriodList.findIndex(
    t => t.id === taskPeriod?.id,
  );

  const prevTaskPeriod = taskPeriodList[taskPeriodIndex + 1];
  const nextTaskPeriod = taskPeriodList[taskPeriodIndex - 1];

  const filteredTaskList = taskList.filter(
    task =>
      (!filterParams.orgName || task.orgName.includes(filterParams.orgName)) &&
      (filterParams.status.length === 0 ||
        filterParams.status.includes(task.status)),
  );

  useEffect(() => {
    getTaskPeriodList().then(({ data }) => {
      setTaskPeriodList(data.data);

      const urlParams = new URLSearchParams(location.search);
      const period = urlParams.get('period');
      setTaskPeriod(
        data.data.find(item => item.period === period) || data.data[0],
      );
    });
  }, []);

  useEffect(() => {
    if (taskPeriod) {
      setLoading(true);
      Promise.all([
        getESGTaskList({ frameId: taskPeriod.id }),
        getESGTaskFillProgress({ frameId: taskPeriod.id }),
      ])
        .then(
          ([{ data: ESGTaskListData }, { data: ESGTaskFillProgressData }]) => {
            setTaskList(ESGTaskListData.data);
            setProgressData(ESGTaskFillProgressData.data);
          },
        )
        .finally(() => {
          setLoading(false);
        });
    }
  }, [taskPeriod]);

  return (
    <div className={styles.fillManagement}>
      <div className={styles.header}>{I18N.esg.fillInProgressManagement}</div>
      {taskPeriod ? (
        <div className={styles.content}>
          <div className={styles.periodContent}>
            <div className={styles.periodLabel}>{I18N.esg.disclosureCycle}</div>
            <div className={styles.periodControl}>
              <div
                className={classNames(styles.prevBtn, {
                  [styles.disabledBtn]: !prevTaskPeriod,
                })}
                onClick={() => {
                  if (prevTaskPeriod) {
                    setTaskPeriod(prevTaskPeriod);
                  }
                }}
              >
                <IconFont
                  className={styles.prevIcon}
                  icon='icon-icon_arrow_rioght'
                />
              </div>
              <Select
                className={styles.periodSelector}
                value={taskPeriod?.period}
                suffixIcon={null}
                fieldNames={{ value: 'id', label: 'period' }}
                options={taskPeriodList}
                onChange={(_, selectedTaskPeriod) => {
                  setTaskPeriod(selectedTaskPeriod as IndicatorSystem);
                }}
              />
              <div
                className={classNames(styles.nextBtn, {
                  [styles.disabledBtn]: !nextTaskPeriod,
                })}
                onClick={() => {
                  if (nextTaskPeriod) {
                    setTaskPeriod(nextTaskPeriod);
                  }
                }}
              >
                <IconFont
                  className={styles.nextIcon}
                  icon='icon-icon_arrow_rioght'
                />
              </div>
            </div>
          </div>
          <Spin spinning={loading}>
            <div className={styles.progressOverview}>
              <div className={styles.title}>{I18N.esg.progressOverview}</div>
              <div className={styles.progressContent}>
                <div className={styles.allProgress}>
                  <div>
                    <div className={styles.progressLabel}>
                      <div className={styles.progressLabelText}>
                        {progressData[0]?.name}
                      </div>
                    </div>
                    <div className={styles.progressValue}>
                      {progressData[0]?.rate}
                    </div>
                  </div>
                  <Progress
                    type='circle'
                    percent={Number(
                      progressData[0].rate.replace('%', '') || '',
                    )}
                    showInfo={false}
                    strokeColor='#048677'
                    strokeWidth={12}
                    size={[150, 150]}
                  />
                </div>
                <div className={styles.progressGird}>
                  {progressData.slice(1).map(({ name, code, rate }, index) => (
                    <div className={styles.progressItem} key={code}>
                      <div>
                        <div className={styles.progressLabel}>
                          <div
                            className={styles.progressLabelIcon}
                            style={{ background: TOPIC_COLOR[index] }}
                          />
                          <div className={styles.progressLabelText}>{name}</div>
                        </div>
                        <div className={styles.progressValue}>{rate}</div>
                      </div>
                      <Progress
                        type='circle'
                        percent={Number(rate.replace('%', '') || '')}
                        showInfo={false}
                        strokeColor={TOPIC_COLOR[index]}
                        strokeWidth={10}
                        size={[80, 80]}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className={styles.title}>{I18N.esg.fillInTheList}</div>
              <div className={styles.filterContent}>
                <Input
                  className={styles.filterSelect}
                  value={filterParams.orgName}
                  placeholder={I18N.carbonData.organizationName}
                  onChange={e =>
                    setFilterParams({
                      ...filterParams,
                      orgName: e.target.value,
                    })
                  }
                  suffix={<SearchOutlined />}
                />
                <Select
                  className={styles.filterSelect}
                  value={filterParams.status}
                  placeholder={I18N.cbam.fillInStatus}
                  mode='multiple'
                  allowClear
                  options={Object.values(ESG_TASK_STATUS).map(value => ({
                    value,
                    label: ESG_TASK_STATUS_LABEL[value],
                  }))}
                  onChange={status =>
                    setFilterParams({ ...filterParams, status })
                  }
                />
              </div>
              <div className={styles.listContent}>
                {filteredTaskList.map(task => {
                  const {
                    orgId,
                    orgName,
                    period,
                    totalCount,
                    finishCount,
                    status,
                    updateName,
                    updateTime,
                  } = task;
                  return (
                    <div className={styles.listItem} key={orgId}>
                      <div className={styles.nameColumn} title={orgName}>
                        {orgName}
                      </div>
                      <div className={styles.column}>
                        <div className={styles.columnLabel}>
                          {I18N.esg.disclosureCycle}
                        </div>
                        <div>{period}</div>
                      </div>
                      <div className={styles.column}>
                        <div className={styles.columnLabel}>
                          {I18N.cbam.fillInStatus}
                        </div>
                        <div
                          className={classNames(styles.status, {
                            [styles.completeStatus]:
                              ESG_TASK_STATUS.COMPLETED === status,
                            [styles.notStartStatus]:
                              ESG_TASK_STATUS.NOT_STARTED === status,
                          })}
                        >
                          {ESG_TASK_STATUS_LABEL[status]}
                        </div>
                      </div>
                      <div className={styles.progressColumn}>
                        <div className={styles.fillCountContent}>
                          <div className={styles.columnLabel}>
                            {I18N.work.reportProgress}
                          </div>
                          <div>
                            <span className={styles.fillCount}>
                              {finishCount}
                            </span>
                            <span className={styles.totalCount}>
                              /{totalCount}
                            </span>
                          </div>
                        </div>
                        <Progress
                          percent={(finishCount / totalCount) * 100}
                          showInfo={false}
                          strokeColor='#08A28B'
                        />
                      </div>
                      <div className={styles.updateColumn}>
                        <div className={styles.columnLabel}>
                          {I18N.enterpriseCarbonAccount2.updatePerson}
                          {updateName}
                        </div>
                        <div className={styles.columnLabel}>
                          {I18N.enterpriseCarbonAccount2.updateTime}
                          {updateTime}
                        </div>
                      </div>
                      <div className={styles.operateColumn}>
                        <Button
                          type='link'
                          onClick={() =>
                            history.push({
                              pathname: RouteMaps.ESGOrgTaskList,
                              search: `?frameId=${taskPeriod.id}&orgId=${orgId}`,
                            })
                          }
                        >
                          {I18N.carbonFootprint3.details}
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {filteredTaskList.length === 0 && (
                  <div className={styles.empty}>
                    <img className={styles.emptyImg} alt='' src={emptyImg} />
                    <div className={styles.emptyText}>
                      {I18N.esg.currentlyNotFilledIn}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Spin>
        </div>
      ) : (
        <div className={styles.empty}>
          <img className={styles.emptyImg} alt='' src={emptyImg} />
          <div className={styles.emptyText}>
            {I18N.esg.currentlyNotFilledIn}
          </div>
        </div>
      )}
    </div>
  );
};

export default FillManagement;
