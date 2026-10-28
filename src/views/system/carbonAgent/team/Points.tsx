import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Modal,
  Progress,
  Tag,
  Select,
  Table,
  Tabs,
  message,
} from 'antd';
import { useState } from 'react';

import { PointPurchase } from './Purchase';
import { teamApi } from './api';
import { errorText } from './errors';
import { dateText, dateTimeText, downloadCsv, limitPayload } from './helpers';
import { teamText } from './i18n';
import style from './team.module.less';
import type { DateFilter, MemberRow, MemberFilter } from './types';
import { DateFilterInput, Metrics, PageTitle, QueryState, Trend } from './ui';
import { useWorkspace } from './workspace';

export const Points = () => {
  const { key, refresh } = useWorkspace();
  const [tab, setTab] = useState('limits');
  const [filter, setFilter] = useState<DateFilter & MemberFilter>({});
  const [pageNum, setPageNum] = useState(1);
  const [selected, setSelected] = useState<MemberRow[]>([]);
  const [editing, setEditing] = useState<MemberRow[]>([]);
  const [mode, setMode] = useState<'UNLIMITED' | 'SPECIFIED'>('UNLIMITED');
  const [limit, setLimit] = useState<number>();
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [buyOpen, setBuyOpen] = useState(false);
  const options = useQuery([...key, 'member-options'], teamApi.options, {
    enabled: tab === 'limits',
  });
  const summary = useQuery([...key, 'points'], teamApi.points);
  const members = useQuery(
    [
      ...key,
      'member-limits',
      filter.keyword,
      filter.orgId,
      filter.memberState,
      pageNum,
    ],
    () =>
      teamApi.members({
        keyword: filter.keyword,
        orgId: filter.orgId,
        memberState: filter.memberState,
        pageNum,
        pageSize: 20,
      }),
    { enabled: tab === 'limits' },
  );
  const consumption = useQuery(
    [...key, 'consumption', filter, pageNum],
    () =>
      teamApi.consumption({
        keyword: filter.keyword,
        start: filter.start,
        end: filter.end,
        pageNum,
        pageSize: 20,
      }),
    { enabled: tab === 'consumption' },
  );
  const changeFilter = (next: DateFilter & MemberFilter) => {
    setFilter(next);
    setPageNum(1);
    setSelected([]);
  };
  const edit = (rows: MemberRow[]) => {
    setEditing(rows);
    setError('');
    setConfirmed(false);
    setMode(
      rows.length === 1 && rows[0].monthlyLimit != null
        ? 'SPECIFIED'
        : 'UNLIMITED',
    );
    setLimit(rows.length === 1 ? rows[0].monthlyLimit ?? undefined : undefined);
  };
  const save = async () => {
    if (busy || !confirmed) return;
    setBusy(true);
    setError('');
    try {
      await teamApi.limits(limitPayload(editing, mode, limit));
      setEditing([]);
      setSelected([]);
      refresh();
      message.success(teamText('memberLimitsUpdated'));
    } catch (failure) {
      setError(errorText(failure));
      setConfirmed(false);
      setSelected([]);
      await members.refetch();
      setEditing([]);
    } finally {
      setBusy(false);
    }
  };
  const exportRows = async () => {
    try {
      const rows = await teamApi.consumptionExport({
        keyword: filter.keyword,
        start: filter.start,
        end: filter.end,
      });
      downloadCsv(teamText('companyPointsConsumption'), rows, [
        { title: teamText('member'), value: row => row.memberName },
        {
          title: teamText('departmentAtTimeOfConsumption'),
          value: row => row.departmentNames,
        },
        { title: teamText('time'), value: row => dateTimeText(row.createTime) },
        { title: teamText('businessActivity'), value: row => row.bizType },
        { title: teamText('tool'), value: row => row.toolName },
        { title: teamText('chargeable'), value: row => row.shouldPoints },
        { title: teamText('charged'), value: row => row.points },
        { title: teamText('notCharged'), value: row => row.unpaidPoints },
        { title: teamText('task'), value: row => row.taskId },
      ]);
    } catch (failure) {
      message.error(errorText(failure));
    }
  };
  return (
    <>
      <PageTitle
        title={teamText('pointsManagement')}
        description={teamText('viewCompanyPointsMonthlyMemberLimitsAnd')}
        // actions={
        //   <Button type='primary' onClick={() => setBuyOpen(true)}>
        //     {teamText('buyPoints')}
        //   </Button>
        // }
      />
      <QueryState query={summary}>
        <div className={`${style.banner} ${style.pointsBanner}`}>
          <span className={style.bannerBadge}>
            {teamText('currentPointsPool')}
          </span>
          {teamText('subscriptionPeriod')}
          {dateText(summary.data?.periodStart)} {teamText('to3')}{' '}
          {dateText(summary.data?.periodEndExclusive, true)}
          <span>{teamText('memberLimitsResetOnThe1stOf')}</span>
        </div>
        <Metrics
          items={[
            {
              title: teamText('grantedThisPeriod'),
              value: summary.data?.grantedPoints,
            },
            {
              title: teamText('consumedThisPeriod'),
              value: summary.data?.consumedPoints,
            },
            {
              title: teamText('availableNow'),
              value: summary.data?.availablePoints,
              hint: teamText('excludesFutureSubscriptionGrants'),
            },
            {
              title: teamText('activeMembersThisMonth'),
              value: summary.data?.activeMembers,
              hint: teamText('valueMembersWithSeats', {
                value0: summary.data?.assignedMembers ?? '—',
              }),
            },
          ]}
        />
        <Trend
          title={teamText('pointsConsumedInTheLast7Days')}
          rows={(summary.data?.dailyUsage || []).map(row => ({
            day: row.day,
            value: row.points,
          }))}
        />
      </QueryState>
      <Tabs
        activeKey={tab}
        onChange={value => {
          setTab(value);
          setPageNum(1);
          setSelected([]);
        }}
        items={[
          { key: 'limits', label: teamText('memberLimits') },
          { key: 'consumption', label: teamText('consumptionDetails') },
        ]}
      />
      {error && (
        <Alert
          type='warning'
          message={error}
          description={teamText('theListHasBeenRefreshedSelectMembers')}
        />
      )}
      <div className={style.toolbar}>
        <Input.Search
          placeholder={teamText('searchMembers')}
          allowClear
          onSearch={keyword => changeFilter({ ...filter, keyword })}
        />
        {tab === 'consumption' ? (
          <>
            <DateFilterInput
              start={filter.start}
              end={filter.end}
              onChange={(start, end) => changeFilter({ ...filter, start, end })}
            />
            <Button onClick={exportRows}>{teamText('exportDetails')}</Button>
          </>
        ) : (
          <>
            <Select
              style={{ width: 180 }}
              allowClear
              placeholder={teamText('allDepartmentsIncludingSubdepartments')}
              value={filter.orgId}
              loading={options.isLoading}
              options={(options.data?.departments || []).map(item => ({
                value: item.id,
                label: item.name,
              }))}
              onChange={orgId => changeFilter({ ...filter, orgId })}
            />
            <Select
              style={{ width: 120 }}
              allowClear
              placeholder={teamText('memberStatus')}
              value={filter.memberState}
              options={[
                { value: 'ACTIVE', label: teamText('enabled') },
                { value: 'PENDING', label: teamText('pendingEnablement') },
                { value: 'DISABLED', label: teamText('disabled') },
              ]}
              onChange={memberState => changeFilter({ ...filter, memberState })}
            />
            <div className={style.toolbarEnd}>
              <span>
                {teamText('selected')}
                {selected.length} {teamText('members2')}
              </span>
              <Button
                disabled={!selected.length}
                onClick={() => edit(selected)}
              >
                {teamText('adjustMonthlyLimitsInBulk')}
              </Button>
            </div>
          </>
        )}
      </div>
      {tab === 'limits' ? (
        <QueryState query={members}>
          <Table<MemberRow>
            rowKey={row => row.member.membershipId}
            dataSource={members.data?.rows}
            scroll={{ x: 850 }}
            pagination={{
              showTotal: total => teamText('valueRecords', { value0: total }),
              current: pageNum,
              pageSize: 20,
              total: members.data?.total,
              onChange: setPageNum,
              showSizeChanger: false,
            }}
            rowSelection={{
              preserveSelectedRowKeys: true,
              selectedRowKeys: selected.map(row => row.member.membershipId),
              onChange: (ids, rows) => {
                const all = new Map(
                  [...selected, ...rows]
                    .filter(Boolean)
                    .map(row => [row.member.membershipId, row]),
                );
                setSelected(
                  ids.map(id => all.get(String(id))!).filter(Boolean),
                );
              },
            }}
            columns={[
              {
                title: teamText('member'),
                render: (_, row) => row.member.employName,
              },
              {
                title: teamText('department'),
                render: (_, row) =>
                  row.member.departments?.map(item => item.name).join('、') ||
                  '—',
              },
              { title: teamText('usageMonth'), dataIndex: 'usageMonth' },
              {
                title: teamText('consumedThisMonth'),
                dataIndex: 'actualChargePoints',
              },
              {
                title: teamText('monthlyLimit'),
                dataIndex: 'monthlyLimit',
                render: value =>
                  value == null ? teamText('unlimited') : value,
              },
              {
                title: teamText('usageRate'),
                render: (_, row) =>
                  row.monthlyLimit == null ? (
                    '—'
                  ) : row.monthlyLimit === 0 ? (
                    teamText('limitIs0')
                  ) : (
                    <div className={style.quotaUsage}>
                      <Progress
                        percent={
                          (row.shouldChargePoints / row.monthlyLimit) * 100
                        }
                        showInfo={false}
                        strokeColor={
                          row.shouldChargePoints / row.monthlyLimit >= 0.9
                            ? '#ff9632'
                            : '#026961'
                        }
                        size='small'
                      />
                      <span>
                        {(
                          (row.shouldChargePoints / row.monthlyLimit) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  ),
              },
              {
                title: teamText('actions'),
                render: (_, row) => (
                  <Button type='link' onClick={() => edit([row])}>
                    {teamText('adjust')}
                  </Button>
                ),
              },
            ]}
          />
        </QueryState>
      ) : (
        <QueryState query={consumption}>
          <Table
            rowKey='id'
            scroll={{ x: 900 }}
            dataSource={consumption.data?.rows}
            pagination={{
              showTotal: total => teamText('valueRecords', { value0: total }),
              current: pageNum,
              pageSize: 20,
              total: consumption.data?.total,
              onChange: setPageNum,
              showSizeChanger: false,
            }}
            columns={[
              { title: teamText('member'), dataIndex: 'memberName' },
              {
                title: teamText('departmentAtTimeOfConsumption'),
                dataIndex: 'departmentNames',
              },
              {
                title: teamText('time'),
                dataIndex: 'createTime',
                render: dateTimeText,
              },
              { title: teamText('businessActivity'), dataIndex: 'bizType' },
              { title: teamText('tool'), dataIndex: 'toolName' },
              {
                title: teamText('chargeablePoints'),
                dataIndex: 'shouldPoints',
              },
              { title: teamText('chargedPoints'), dataIndex: 'points' },
              { title: teamText('unchargedPoints'), dataIndex: 'unpaidPoints' },
            ]}
          />
        </QueryState>
      )}
      <Modal
        centered
        className={style.teamModal}
        width={560}
        title={
          editing.length > 1
            ? teamText('adjustMonthlyLimitsInBulk')
            : teamText('adjustMonthlyMemberLimits')
        }
        open={!!editing.length}
        onCancel={() => setEditing([])}
        onOk={save}
        confirmLoading={busy}
        okButtonProps={{ disabled: !confirmed }}
      >
        <Alert
          showIcon
          type='warning'
          message={teamText('ifAnyMemberSChargeableUsageThis')}
        />
        <Form layout='vertical'>
          <Form.Item label={teamText('member')}>
            <div className={style.selectedMembers}>
              {editing.map(row => (
                <Tag key={row.member.membershipId}>{row.member.employName}</Tag>
              ))}
            </div>
          </Form.Item>
          <Form.Item label={teamText('limitMode')} required>
            <Select
              value={mode}
              onChange={value => setMode(value)}
              options={[
                { value: 'UNLIMITED', label: teamText('unlimited') },
                { value: 'SPECIFIED', label: teamText('setALimit') },
              ]}
            />
          </Form.Item>
          {mode === 'SPECIFIED' && (
            <Form.Item label={teamText('monthlyLimitPerMember')} required>
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={0}
                value={limit}
                onChange={value => setLimit(value ?? undefined)}
              />
            </Form.Item>
          )}
        </Form>
        <Checkbox
          checked={confirmed}
          onChange={event => setConfirmed(event.target.checked)}
        >
          {teamText('iConfirmUpdatingTheSelectedMembersLimits')}
        </Checkbox>
      </Modal>
      <PointPurchase open={buyOpen} onClose={() => setBuyOpen(false)} />
    </>
  );
};
