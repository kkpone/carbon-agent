import { SearchOutlined } from '@ant-design/icons';
import imgIcon from '@assets/svg/img_icon.svg';
import I18N from '@src/lang/I18N';
import { useMount } from 'ahooks';
import { Button, Input, Menu, Select, Spin } from 'antd';
import classNames from 'classnames';
import { debounce, isNil } from 'lodash-es';
import { FC, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { IconFont } from '@/components/LcaIconFont';
import { RouteMaps } from '@/router/route-paths';
import { Toast } from '@/utils';

import NestedTable from './NestedTable';
import styles from './index.module.less';
import {
  getIndicatorFillDetails,
  getIndicatorDetails,
  getIndicatorMenu,
  getIndicatorFillMenu,
  submitIndicator,
} from './service';
import { getOrgTaskFillProgress } from '../../OrgTaskList/service';
import {
  ESG_TASK_STATUS,
  ESG_TASK_STATUS_LABEL,
  INDICATOR_FILL_STATUS,
  INDICATOR_FILL_STATUS_LABEL,
  TOPIC_COLOR_MAP,
} from '../../constant';
import { ESGTask, Indicator } from '../../type';

const IndicatorDetails: FC<{
  frameId: number;
  indicatorId: string;
  isFill: boolean;
  orgId?: number;
}> = ({ frameId, indicatorId: indicatorIdFromProps, isFill, orgId }) => {
  const [indicatorList, setIndicatorList] = useState<Indicator[]>([]);

  const [orgESGTask, setOrgESGTask] = useState<ESGTask>();

  const [indicatorId, setIndicatorId] = useState(indicatorIdFromProps);

  const [searchParams, setSearchParams] = useState<{
    name?: string;
    status?: number;
  }>({});

  const [loading, setLoading] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);

  const [openKeys, setOpenKeys] = useState<string[]>();

  const history = useHistory();

  const [indicatorDetails, setIndicatorDetails] = useState<{
    baseInfo: Indicator;
    rightTree: Indicator[];
  }>();

  const getOrgESGTask = async (params: {
    frameId: string | number;
    orgId?: string | number;
  }) => {
    if (!isNil(params.orgId)) {
      const { data } = await getOrgTaskFillProgress({
        orgId: params.orgId,
        frameId: params.frameId,
      });
      setOrgESGTask(data.data);
    }
  };

  const getDetails = async (params: {
    isFill: boolean;
    indicatorId: string;
    showLoading?: boolean;
  }) => {
    try {
      const { showLoading = true } = params;

      setLoading(showLoading);

      const reqApi = params.isFill
        ? getIndicatorFillDetails
        : getIndicatorDetails;

      const { data } = await reqApi({ id: params.indicatorId });
      setIndicatorDetails(data.data);
    } finally {
      setLoading(false);
    }
  };

  const backToList = () => {
    if (isFill) {
      history.push({
        pathname: RouteMaps.ESGOrgTaskList,
        search: `?frameId=${frameId}&orgId=${orgId}`,
      });
    } else {
      history.push({
        pathname: RouteMaps.ESGManagement,
        search: `?frameId=${frameId}`,
      });
    }
  };

  const onIndicatorSubmit = async () => {
    if (indicatorDetails) {
      try {
        setSubmitLoading(true);
        await submitIndicator({
          id: indicatorDetails.rightTree[0].id,
        });
        Toast('success', I18N.carbonFootprint.submittedSuccessfully);
        getOrgESGTask({ frameId, orgId });
      } finally {
        setSubmitLoading(false);
      }
    }
  };

  const onNameSearch = useMemo(
    () =>
      debounce((name: string) => {
        setSearchParams({
          ...searchParams,
          name,
        });
      }, 300),
    [searchParams],
  );

  useMount(() => getOrgESGTask({ frameId, orgId }));

  useEffect(() => {
    (async () => {
      let indicators: Indicator[] = [];
      if (isFill) {
        const { data } = await getIndicatorFillMenu({
          id: indicatorIdFromProps,
          ...searchParams,
        });
        indicators = data.data;
      } else {
        const { data } = await getIndicatorMenu({ frameId, ...searchParams });
        indicators = data.data;
      }

      setIndicatorList(indicators);
      setOpenKeys(
        indicators.reduce(
          (prev: string[], group) => [
            ...prev,
            `${group.id}`,
            ...group.children.map(topic => `${topic.id}`),
          ],
          [],
        ),
      );
    })();
  }, [isFill, indicatorIdFromProps, frameId, searchParams]);

  useEffect(() => {
    getDetails({ isFill, indicatorId });
  }, [isFill, indicatorId]);

  return (
    <div className={styles.indicatorDetails}>
      <div className={styles.header}>
        <div className={styles.nav}>
          <IconFont
            className={styles.backIcon}
            icon='icon-icon_arrow_rioght'
            // @ts-ignore
            onClick={backToList}
          />
          <span className={styles.backNavText} onClick={backToList}>
            {isFill ? I18N.esg.fillInTheIndicators : I18N.esg.indicatorSystem}
          </span>
          <span className={styles.orgNavText}>/</span>
          <span className={styles.orgNavText}>
            {isFill ? (
              <>
                {orgESGTask?.orgName}
                {I18N.DomesticVersion.dataReporting}
              </>
            ) : (
              I18N.esg.indicatorDetails
            )}
          </span>
        </div>
        <div className={styles.intro}>
          {orgESGTask && (
            <div className={styles.introLeft}>
              <div className={styles.orgName}>
                {orgESGTask?.orgName}
                {I18N.DomesticVersion.dataReporting}
              </div>
              <div className={styles.period}>{orgESGTask.period}</div>
              <div
                className={classNames(styles.status, {
                  [styles.completeStatus]:
                    ESG_TASK_STATUS.COMPLETED === orgESGTask.status,
                  [styles.notStartStatus]:
                    ESG_TASK_STATUS.NOT_STARTED === orgESGTask.status,
                })}
              >
                {ESG_TASK_STATUS_LABEL[orgESGTask.status]}
              </div>
              <div className={styles.progress}>
                <div>
                  <span className={styles.completeCount}>
                    {orgESGTask.finishCount}
                  </span>
                  <span className={styles.totalCount}>
                    /{orgESGTask.totalCount}
                  </span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressBarInner}
                    style={{
                      width: `${
                        (orgESGTask.finishCount / orgESGTask.totalCount) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.menuContent}>
          <div className={styles.menuSearch}>
            <Input
              className={styles.searchField}
              defaultValue={searchParams.name}
              prefix={<SearchOutlined />}
              placeholder={I18N.esg.searchIndicatorName}
              onChange={e => onNameSearch(e.target.value)}
            />
            {isFill && (
              <Select
                className={styles.searchField}
                value={searchParams.status}
                placeholder={I18N.cbam.fillInStatus}
                allowClear
                options={Object.values(INDICATOR_FILL_STATUS).map(status => ({
                  value: status,
                  label: INDICATOR_FILL_STATUS_LABEL[status],
                }))}
                onChange={status =>
                  setSearchParams({ ...searchParams, status })
                }
              />
            )}
          </div>
          <Menu
            className={styles.menu}
            mode='inline'
            selectedKeys={[]}
            openKeys={openKeys}
            items={indicatorList.map(group => ({
              key: group.id,
              label: (
                <div className={styles.subjectGroup}>
                  <div
                    className={styles.subjectGroupIcon}
                    style={{
                      borderColor: TOPIC_COLOR_MAP[`${group.id}`],
                    }}
                  />
                  <div className={styles.subjectGroupName} title={group.name}>
                    {group.name}
                  </div>
                </div>
              ),
              children: group.children?.map(topic => ({
                key: topic.id,
                label: (
                  <div className={styles.menuSubjectName} title={topic.name}>
                    {topic.name}
                  </div>
                ),
                children: topic.children?.map(indicator => ({
                  key: indicator.id,
                  label: (
                    <div
                      className={classNames(styles.menuIndicatorName, {
                        [styles.currMenuIndicatorName]:
                          indicator.id === indicatorId,
                      })}
                      title={indicator.name}
                      onClick={() => setIndicatorId(indicator.id)}
                    >
                      {indicator.name}
                    </div>
                  ),
                })),
              })),
            }))}
            onOpenChange={setOpenKeys}
          />
        </div>
        <div className={styles.indicatorContent}>
          <Spin wrapperClassName={styles.spinning} spinning={loading}>
            {indicatorDetails && (
              <div className={styles.detailsContainer}>
                <div className={styles.indicatorName}>
                  {indicatorDetails.baseInfo.name}
                </div>
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
                <NestedTable
                  isFill={isFill}
                  indicatorId={indicatorId}
                  dataSource={indicatorDetails.rightTree}
                  updateTask={() => getOrgESGTask({ frameId, orgId })}
                  updateDetails={() =>
                    getDetails({ isFill, indicatorId, showLoading: false })
                  }
                />
                <div className={styles.indicatorFooter}>
                  <Button onClick={backToList}>
                    {I18N.carbonFootprint.return}
                  </Button>
                  {isFill && (
                    <Button
                      type='primary'
                      loading={submitLoading}
                      onClick={onIndicatorSubmit}
                    >
                      {I18N.components.submit}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default IndicatorDetails;
