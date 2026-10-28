import { SearchOutlined } from '@ant-design/icons';
import { createI18nLabelMap } from '@src/lang/createI18nLabelMap';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  Progress,
  Select,
  Segmented,
  Space,
  Table,
  message,
} from 'antd';
import moment from 'moment';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { PointPurchase } from './Purchase';
import { teamApi } from './api';
import arrowLeft from './assets/arrow-left.svg';
import companyOverview from './assets/company-overview.svg';
import companyProfile from './assets/company-profile.svg';
import { errorText } from './errors';
import { collectExecutions } from './exportExecutions';
import {
  dateText,
  dateTimeText,
  downloadCsv,
  TEAM_PATH,
  today,
  recentDays,
  auditActionText,
} from './helpers';
import { teamText } from './i18n';
import style from './team.module.less';
import type { Audit, DateFilter, Execution } from './types';
import {
  DateFilterInput,
  Metrics,
  PageTitle,
  QueryState,
  Status,
  Trend,
  labels,
} from './ui';
import { useWorkspace } from './workspace';

export const Overview = () => {
  const { key, personal, switchSpace } = useWorkspace();
  const [buyPointsOpen, setBuyPointsOpen] = useState(false);
  const history = useHistory();
  const summary = useQuery([...key, 'summary'], teamApi.summary);
  const profile = useQuery([...key, 'profile'], teamApi.profile, {
    enabled: !personal,
  });
  const points = useQuery([...key, 'points'], teamApi.points, {
    enabled: !personal,
  });
  const [overviewDays, setOverviewDays] = useState(7);
  const { start, end } = recentDays(overviewDays);
  const executions = useQuery(
    [...key, 'overview-executions', start, end],
    () => teamApi.executions({ start, end, pageSize: 5, pageNum: 1 }),
    { enabled: !personal },
  );
  const buy = (action: string) =>
    history.push(`${TEAM_PATH}/purchase?action=${action}`);
  const { data } = summary;
  const remainingDays = data?.validToExclusive
    ? Math.max(
        0,
        moment(dateText(data.validToExclusive, true)).diff(
          moment(today()),
          'days',
        ) + 1,
      )
    : undefined;
  const subscriptionAction =
    personal && data?.boundTeamCompanyId ? (
      <Button
        type='link'
        onClick={() =>
          switchSpace(String(data.boundTeamCompanyId), `${TEAM_PATH}/overview`)
        }
      >
        {teamText('enterLinkedTeam')}
      </Button>
    ) : (
      <Button
        type='link'
        onClick={() =>
          buy(data?.subscriptionStatus === 'NOT_ENABLED' ? 'OPEN' : 'RENEW')
        }
      >
        {data?.subscriptionStatus === 'NOT_ENABLED'
          ? teamText('setUpATeam')
          : teamText('renewSubscription')}
        <img className={style.forwardIcon} src={arrowLeft} alt='' />
      </Button>
    );
  return (
    <>
      <PageTitle
        title={teamText('overview')}
        description={`${today()} · ${
          data?.companyName || teamText('adminConsole')
        }`}
      />
      <QueryState query={summary}>
        <section className={style.overviewSubscription}>
          <div className={style.companyIdentity}>
            <img src={companyOverview} alt='' />
            <div>
              <div className={style.companyName}>
                <strong>{data?.companyName}</strong>
                <Status value={data?.subscriptionStatus} />
              </div>
              {!personal && (
                <QueryState query={profile}>
                  <div className={style.companyMeta}>
                    <span>
                      {teamText('organizationId')}
                      {profile.data?.companyId || '—'}
                    </span>
                    <span>
                      {teamText('owner2')}
                      {profile.data?.principalName || '—'}
                    </span>
                    <span>
                      {teamText('createdAt')}
                      {dateText(profile.data?.createTime)}
                    </span>
                  </div>
                </QueryState>
              )}
            </div>
          </div>
          <div className={style.resourceGrid}>
            <section>
              <div className={style.resourceHeading}>
                <span>{teamText('daysRemaining')}</span>
                {subscriptionAction}
              </div>
              <div className={style.resourceValue}>
                <strong>{remainingDays ?? '—'}</strong>
                <span>{teamText('days')}</span>
              </div>
              <small>
                {teamText('validUntil')}
                {dateText(data?.validToExclusive, true)}
              </small>
            </section>
            <section>
              <div className={style.resourceHeading}>
                <span>{teamText('seatsRemaining')}</span>
                {data?.subscriptionStatus === 'ACTIVE' && (
                  <Button type='link' onClick={() => buy('EXPAND')}>
                    {teamText('addSeats')}
                    <img className={style.forwardIcon} src={arrowLeft} alt='' />
                  </Button>
                )}
              </div>
              <div className={style.resourceValue}>
                <strong>{data?.availableSeats ?? '—'}</strong>
                <span>
                  / {data?.totalSeats ?? '—'} {teamText('seats3')}
                </span>
              </div>
              <Progress
                percent={
                  data?.totalSeats
                    ? (data.availableSeats / data.totalSeats) * 100
                    : 0
                }
                showInfo={false}
                strokeColor={{ from: '#57d9b8', to: '#0cbf9f' }}
                size='small'
              />
            </section>
            <section>
              <div className={style.resourceHeading}>
                <span>{teamText('companyPointsAvailable')}</span>
                {/* {!personal && (
                  <Button type='link' onClick={() => setBuyPointsOpen(true)}>
                    {teamText('buyPoints')}
                  </Button>
                )} */}
              </div>
              {!personal ? (
                <QueryState query={points}>
                  <div className={style.resourceValue}>
                    <strong>
                      {points.data?.availablePoints?.toLocaleString() ?? '—'}
                    </strong>
                  </div>
                  <small>{teamText('excludesFutureSubscriptionGrants')}</small>
                </QueryState>
              ) : (
                <div className={style.resourceValue}>
                  <strong>—</strong>
                </div>
              )}
            </section>
          </div>
        </section>
        {data?.subscriptionStatus !== 'NOT_ENABLED' && !data?.businessReady && (
          <Alert
            type='info'
            message={teamText(
              'teamEntitlementsAreInitializingAdministrationRemainsAvailable',
            )}
          />
        )}
      </QueryState>
      {!personal && (
        <QueryState query={executions}>
          <section className={style.card}>
            <div className={style.sectionHeading}>
              <div>
                <h3>{teamText('executionOverview')}</h3>
                <p>
                  {start} {teamText('to3')}
                  {end}
                </p>
              </div>
              <Segmented
                aria-label={teamText('statisticsPeriod')}
                value={overviewDays}
                onChange={value => setOverviewDays(Number(value))}
                options={[
                  { label: teamText('today'), value: 1 },
                  { label: teamText('last3Days'), value: 3 },
                  { label: teamText('last7Days'), value: 7 },
                  { label: teamText('last30Days'), value: 30 },
                ]}
              />
            </div>
            <Metrics
              variant='inline'
              items={[
                {
                  title: teamText('totalTasks'),
                  value: executions.data?.summary.total,
                },
                {
                  title: teamText('running'),
                  value: executions.data?.summary.running,
                  hint: teamText('waitingForInputValue', {
                    value0: executions.data?.summary.waiting ?? '—',
                  }),
                },
                {
                  title: teamText('taskSuccessRate'),
                  value: executions.data?.summary.successRate,
                  suffix: '%',
                },
                {
                  title: teamText('actualPointsConsumed'),
                  value: executions.data?.summary.actualPoints,
                },
              ]}
            />
          </section>
          <Trend
            title={teamText('taskTrend')}
            description={teamText('tasksFromValueToValue', {
              value0: start,
              value1: end,
            })}
            actions={
              <Button
                type='link'
                onClick={() => history.push(`${TEAM_PATH}/executions`)}
              >
                {teamText('viewExecutions')}
                <img className={style.forwardIcon} src={arrowLeft} alt='' />
              </Button>
            }
            rows={(executions.data?.daily || []).map(row => ({
              day: row.day,
              value: row.count,
            }))}
          />
        </QueryState>
      )}
      {!personal && (
        <PointPurchase
          open={buyPointsOpen}
          onClose={() => setBuyPointsOpen(false)}
        />
      )}
    </>
  );
};

export const Profile = () => {
  const { key, refresh } = useWorkspace();
  const query = useQuery([...key, 'profile'], teamApi.profile);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form] = Form.useForm<{ companyName: string; contactEmail: string }>();
  const save = async () => {
    if (busy) return;
    let values: { companyName: string; contactEmail: string };
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setBusy(true);
    try {
      await teamApi.saveProfile({
        companyName: values.companyName.trim(),
        contactEmail: values.contactEmail?.trim() || '',
      });
      setEditing(false);
      refresh();
      message.success(teamText('companyInformationUpdated'));
    } catch (failure) {
      message.error(errorText(failure));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={style.profilePage}>
      <PageTitle title={teamText('companyInformation')} />
      <QueryState query={query}>
        <div className={style.profileBrand}>
          <img src={companyProfile} alt='' />
          <div>
            <strong>{query.data?.companyName}</strong>
            <p>CARBON AGENT · ENTERPRISE</p>
          </div>
        </div>
        <div className={style.sectionHeading}>
          <h3 className={style.sectionTitle}>{teamText('basicInformation')}</h3>
          {editing ? (
            <Space>
              <Button onClick={() => setEditing(false)}>
                {teamText('cancel')}
              </Button>
              <Button type='primary' loading={busy} onClick={save}>
                {teamText('save')}
              </Button>
            </Space>
          ) : (
            <Button
              onClick={() => {
                form.setFieldsValue({
                  companyName: query.data!.companyName,
                  contactEmail: query.data?.contactEmail || '',
                });
                setEditing(true);
              }}
            >
              {teamText('editInformation')}
            </Button>
          )}
        </div>
        <section className={style.profileDetails}>
          {editing ? (
            <Form layout='vertical' form={form} className={style.profileForm}>
              <Form.Item
                name='companyName'
                label={teamText('companyName')}
                rules={[{ required: true, whitespace: true, max: 100 }]}
              >
                <Input maxLength={100} />
              </Form.Item>
              <Form.Item
                name='contactEmail'
                label={teamText('contactEmail')}
                rules={[{ type: 'email' }]}
              >
                <Input />
              </Form.Item>
            </Form>
          ) : (
            <Descriptions
              layout='vertical'
              column={2}
              colon={false}
              items={[
                {
                  key: 'name',
                  label: teamText('companyName'),
                  children: query.data?.companyName,
                },
                {
                  key: 'email',
                  label: teamText('contactEmail'),
                  children: query.data?.contactEmail || '—',
                },
              ]}
            />
          )}
          <Descriptions
            layout='vertical'
            column={2}
            colon={false}
            items={[
              {
                key: 'id',
                label: teamText('organizationId2'),
                children: query.data?.companyId,
              },
              {
                key: 'principal',
                label: teamText('owner'),
                children: query.data?.principalName || '—',
              },
              {
                key: 'created',
                label: teamText('createdAt2'),
                children: dateText(query.data?.createTime),
              },
            ]}
          />
        </section>
      </QueryState>
    </div>
  );
};

const executionColumns = () => [
  {
    title: teamText('startedAt'),
    dataIndex: 'startTime',
    render: dateTimeText,
  },
  {
    title: teamText('conversationId'),
    dataIndex: 'sessionId',
    render: (value?: string) => value || '—',
  },
  { title: teamText('member'), dataIndex: 'memberName' },
  { title: teamText('agent'), dataIndex: 'skill' },
  { title: teamText('conversationTopic'), dataIndex: 'sessionTitle' },
  { title: teamText('turn'), dataIndex: 'turnIndex' },
  {
    title: teamText('status'),
    dataIndex: 'status',
    render: (value: string) => <Status value={value} />,
  },
  { title: teamText('chargedPoints'), dataIndex: 'actualPoints' },
];
export const ExecutionsPage = () => {
  const { key } = useWorkspace();
  const [filter, setFilter] = useState<DateFilter>(() => recentDays(7));
  const [pageNum, setPageNum] = useState(1);
  const [runId, setRunId] = useState<string>();
  const [searchText, setSearchText] = useState('');
  const [exporting, setExporting] = useState(false);
  const query = useQuery([...key, 'executions', filter, pageNum], () =>
    teamApi.executions({ ...filter, pageNum, pageSize: 20 }),
  );
  const detail = useQuery(
    [...key, 'execution', runId],
    () => teamApi.execution(runId!),
    { enabled: !!runId },
  );
  const changeFilter = (next: DateFilter) => {
    setFilter(next);
    setPageNum(1);
  };
  const exportRows = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const snapshot = { ...filter };
      const rows = await collectExecutions(page =>
        teamApi.executions({ ...snapshot, pageNum: page, pageSize: 100 }),
      );
      downloadCsv(teamText('teamExecutions'), rows, [
        { title: teamText('executionId'), value: row => row.runId },
        { title: teamText('member'), value: row => row.memberName },
        { title: teamText('topic'), value: row => row.sessionTitle },
        {
          title: teamText('status'),
          value: row => labels[row.status] || row.status,
        },
        { title: teamText('chargedPoints'), value: row => row.actualPoints },
        { title: teamText('chargeablePoints'), value: row => row.shouldPoints },
        {
          title: teamText('startedAt'),
          value: row => dateTimeText(row.startTime),
        },
        {
          title: teamText('finishedAt'),
          value: row => dateTimeText(row.finishTime),
        },
      ]);
    } catch (failure) {
      message.error(errorText(failure));
    } finally {
      setExporting(false);
    }
  };
  return (
    <>
      <PageTitle
        title={teamText('executionOverview')}
        description={teamText('viewTasksSuccessRatesPointsConsumptionAnd')}
        actions={
          <DateFilterInput
            presetDays={[7, 30]}
            start={filter.start}
            end={filter.end}
            onChange={(start, end) => changeFilter({ ...filter, start, end })}
          />
        }
      />
      <QueryState query={query}>
        <Metrics
          variant='tinted'
          items={[
            { title: teamText('totalTasks'), value: query.data?.summary.total },
            {
              title: teamText('runningWaitingForInput'),
              value: `${query.data?.summary.running ?? 0} / ${
                query.data?.summary.waiting ?? 0
              }`,
            },
            {
              title: teamText('taskSuccessRate'),
              value: query.data?.summary.successRate,
              suffix: '%',
            },
            {
              title: teamText('actualPointsConsumed'),
              value: query.data?.summary.actualPoints,
            },
          ]}
        />
        <Trend
          title={teamText('taskThroughput')}
          description={teamText('byTaskStartDateValueToValue', {
            value0: filter.start || '—',
            value1: filter.end || '—',
          })}
          rows={(query.data?.daily || []).map(row => ({
            day: row.day,
            value: row.count,
          }))}
        />
      </QueryState>
      <h3>{teamText('recentExecutions')}</h3>
      <div className={style.toolbar}>
        <Input
          className={style.executionSearch}
          prefix={<SearchOutlined />}
          placeholder={teamText('searchMembersOrTopics')}
          aria-label={teamText('searchMembersOrTopics')}
          value={searchText}
          allowClear
          onChange={event => {
            setSearchText(event.target.value);
            if (!event.target.value) changeFilter({ ...filter, keyword: '' });
          }}
          onPressEnter={() => changeFilter({ ...filter, keyword: searchText })}
        />
        <Select
          allowClear
          placeholder={teamText('allStatuses')}
          style={{ width: 150 }}
          options={['RUNNING', 'WAITING', 'SUCCESS', 'FAILED', 'CANCELLED'].map(
            value => ({ value, label: labels[value] }),
          )}
          onChange={status => changeFilter({ ...filter, status })}
        />
        <Button
          className={style.toolbarEnd}
          loading={exporting}
          onClick={exportRows}
        >
          {teamText('exportTasks')}
        </Button>
      </div>
      <QueryState query={query}>
        <Table<Execution>
          rowKey='runId'
          scroll={{ x: 950 }}
          dataSource={query.data?.rows}
          pagination={{
            showTotal: total => teamText('valueRecords', { value0: total }),
            current: pageNum,
            pageSize: 20,
            total: query.data?.total,
            showSizeChanger: false,
            onChange: setPageNum,
          }}
          columns={[
            ...executionColumns(),
            {
              title: teamText('actions'),
              render: (_, row) => (
                <Button type='link' onClick={() => setRunId(row.runId)}>
                  {teamText('view')}
                </Button>
              ),
            },
          ]}
        />
      </QueryState>
      <Drawer
        title={teamText('executionSummary')}
        open={!!runId}
        onClose={() => setRunId(undefined)}
        width={520}
      >
        <QueryState query={detail}>
          {detail.data && (
            <>
              <Alert
                type='info'
                message={teamText('onlyExecutionSummariesAreShownHereOther')}
              />
              <Descriptions
                column={1}
                style={{ marginTop: 20 }}
                items={[
                  {
                    key: 'run',
                    label: teamText('executionId2'),
                    children: detail.data.runId,
                  },
                  {
                    key: 'member',
                    label: teamText('member'),
                    children: detail.data.memberName,
                  },
                  {
                    key: 'title',
                    label: teamText('topic'),
                    children: detail.data.sessionTitle || '—',
                  },
                  {
                    key: 'status',
                    label: teamText('status'),
                    children: <Status value={detail.data.status} />,
                  },
                  {
                    key: 'actual',
                    label: teamText('chargedPoints'),
                    children: detail.data.actualPoints,
                  },
                  {
                    key: 'should',
                    label: teamText('chargeablePoints'),
                    children: detail.data.shouldPoints,
                  },
                  {
                    key: 'settled',
                    label: teamText('settlement'),
                    children: detail.data.settled
                      ? teamText('settled')
                      : teamText('pendingSettlement'),
                  },
                  {
                    key: 'start',
                    label: teamText('startedAt'),
                    children: dateTimeText(detail.data.startTime),
                  },
                  {
                    key: 'end',
                    label: teamText('finishedAt'),
                    children: dateTimeText(detail.data.finishTime),
                  },
                ]}
              />
            </>
          )}
        </QueryState>
      </Drawer>
    </>
  );
};

const sources: Record<string, string> = createI18nLabelMap({
  TEAM: () => teamText('teamSubscriptions'),
  TEAM_SUBSCRIPTION: () => teamText('teamSubscriptions'),
  MEMBER: () => teamText('userManagement'),
  USER: () => teamText('userManagement'),
  POINTS: () => teamText('pointsManagement'),
  SYSTEM: () => teamText('systemTasks'),
  FINANCE: () => teamText('financeManagement'),
});
const sourceLabel = (value: string) => {
  if (sources[value]) return sources[value];
  if (/\/members/.test(value)) return teamText('userManagement');
  if (/\/seats/.test(value)) return teamText('seatManagement');
  if (/\/points|\/member-limits/.test(value))
    return teamText('pointsManagement');
  if (/\/finance/.test(value)) return teamText('financeManagement');
  if (/\/profile/.test(value)) return teamText('companyInformation');
  if (/\/orders|\/quotes/.test(value)) return teamText('teamSubscriptions');
  return teamText('teamManagement');
};
const safeAuditValue = (value: unknown): string => {
  if (value == null) return '—';
  if (typeof value === 'string') {
    try {
      return safeAuditValue(JSON.parse(value));
    } catch {
      return /stack|Exception|SELECT |INSERT |password|token|secret/i.test(
        value,
      )
        ? teamText('detailsAreHiddenContactAnAdministratorWith')
        : value;
    }
  }
  return (
    JSON.stringify(
      value,
      (key, item) =>
        /token|password|secret|authorization|stack/i.test(key)
          ? undefined
          : item,
      2,
    ) || '—'
  );
};
export const AuditPage = () => {
  const { key } = useWorkspace();
  const [filter, setFilter] = useState<DateFilter>(() => recentDays(30));
  const [pageNum, setPageNum] = useState(1);
  const [detail, setDetail] = useState<Audit>();
  const query = useQuery([...key, 'audit', filter, pageNum], () =>
    teamApi.audit({ ...filter, pageNum, pageSize: 20 }),
  );
  const changeFilter = (next: DateFilter) => {
    setFilter(next);
    setPageNum(1);
  };
  const exportRows = async () => {
    try {
      const rows = await teamApi.auditExport(filter);
      downloadCsv(teamText('teamAuditLogs'), rows, [
        { title: teamText('operator'), value: row => row.actorName },
        { title: teamText('event'), value: row => auditActionText(row) },
        { title: teamText('source'), value: row => sourceLabel(row.source) },
        {
          title: teamText('result'),
          value: row => labels[row.result] || row.result,
        },
        { title: teamText('time'), value: row => dateTimeText(row.createTime) },
        { title: teamText('requestId'), value: row => row.requestId },
      ]);
    } catch (failure) {
      message.error(errorText(failure));
    }
  };
  return (
    <>
      <PageTitle
        title={teamText('auditLogs')}
        actions={<Button onClick={exportRows}>{teamText('exportLogs')}</Button>}
      />
      <div className={style.toolbar}>
        <Input.Search
          allowClear
          placeholder={teamText('searchOperatorsOrEvents')}
          onSearch={keyword => changeFilter({ ...filter, keyword })}
        />
        <DateFilterInput
          presetDays={[7, 30, 90]}
          start={filter.start}
          end={filter.end}
          onChange={(start, end) => changeFilter({ ...filter, start, end })}
        />
        <Select
          allowClear
          placeholder={teamText('allResults')}
          style={{ width: 140 }}
          options={['SUCCESS', 'FAILED', 'UNKNOWN'].map(value => ({
            value,
            label: labels[value],
          }))}
          onChange={result => changeFilter({ ...filter, result })}
        />
      </div>
      <QueryState query={query}>
        <Table<Audit>
          rowKey='id'
          dataSource={query.data?.rows}
          scroll={{ x: 850 }}
          pagination={{
            showTotal: total => teamText('valueRecords', { value0: total }),
            current: pageNum,
            pageSize: 20,
            total: query.data?.total,
            onChange: setPageNum,
            showSizeChanger: false,
          }}
          columns={[
            { title: teamText('operator'), dataIndex: 'actorName' },
            {
              title: teamText('businessEvent'),
              render: (_, row) => auditActionText(row),
            },
            {
              title: teamText('entryPoint'),
              dataIndex: 'source',
              render: sourceLabel,
            },
            {
              title: teamText('time'),
              dataIndex: 'createTime',
              render: dateTimeText,
            },
            {
              title: teamText('result'),
              dataIndex: 'result',
              render: value => <Status value={value} />,
            },
            {
              title: teamText('actions'),
              render: (_, row) => (
                <Button type='link' onClick={() => setDetail(row)}>
                  {teamText('details')}
                </Button>
              ),
            },
          ]}
        />
      </QueryState>
      <Drawer
        title={teamText('operationDetails')}
        open={!!detail}
        onClose={() => setDetail(undefined)}
        width={580}
      >
        {detail && (
          <>
            <Descriptions
              column={1}
              items={[
                {
                  key: 'actor',
                  label: teamText('operator'),
                  children: detail.actorName,
                },
                {
                  key: 'action',
                  label: teamText('event'),
                  children: auditActionText(detail),
                },
                {
                  key: 'source',
                  label: teamText('source'),
                  children: sourceLabel(detail.source),
                },
                {
                  key: 'time',
                  label: teamText('time'),
                  children: dateTimeText(detail.createTime),
                },
                {
                  key: 'description',
                  label: teamText('description'),
                  children: detail.detail?.startsWith('AGENT_')
                    ? errorText(new Error(detail.detail))
                    : safeAuditValue(detail.detail),
                },
                {
                  key: 'result',
                  label: teamText('result'),
                  children: <Status value={detail.result} />,
                },
                {
                  key: 'request',
                  label: teamText('requestId2'),
                  children: detail.requestId,
                },
              ]}
            />
            <h3>{teamText('before')}</h3>
            <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {safeAuditValue(detail.beforeValue)}
            </pre>
            <h3>{teamText('after')}</h3>
            <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {safeAuditValue(detail.afterValue)}
            </pre>
          </>
        )}
      </Drawer>
    </>
  );
};
