import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  message,
} from 'antd';
import { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { MemberImport } from './MemberImport';
import { teamApi } from './api';
import buttonAdd from './assets/button-add.svg';
import buttonExport from './assets/button-export.svg';
import { errorText } from './errors';
import { dateText, downloadCsv, requestKey, TEAM_PATH } from './helpers';
import { teamText } from './i18n';
import style from './team.module.less';
import type {
  MemberCreate,
  MemberEdit,
  MemberFilter,
  MemberRow,
} from './types';
import { Metrics, PageTitle, QueryState, Status } from './ui';
import { useWorkspace } from './workspace';

export const Members = ({ seats = false }: { seats?: boolean }) => {
  const { key, refresh } = useWorkspace();
  const history = useHistory();
  const [filter, setFilter] = useState<MemberFilter>({});
  const [pageNum, setPageNum] = useState(1);
  const [selected, setSelected] = useState<MemberRow[]>([]);
  const [editing, setEditing] = useState<MemberRow | 'new'>();
  const [operation, setOperation] = useState<
    'ENABLE' | 'DISABLE' | 'REMOVE' | 'TRANSFER' | 'ASSIGN'
  >();
  const [confirmed, setConfirmed] = useState(false);
  const [orgId, setOrgId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [tab, setTab] = useState('members');
  const [form] = Form.useForm<MemberCreate & MemberEdit>();
  const assignRequests = useRef(new Map<string, string>());
  const lock = useRef(false);
  const members = useQuery([...key, 'members', filter, pageNum], () =>
    teamApi.members({ ...filter, pageNum, pageSize: 20 }),
  );
  const options = useQuery([...key, 'member-options'], teamApi.options);
  const summary = useQuery([...key, 'summary'], teamApi.summary, {
    enabled: seats,
  });
  const seatHistory = useQuery(
    [...key, 'seat-history', filter.keyword, pageNum],
    () =>
      teamApi.seatHistory({ keyword: filter.keyword, pageNum, pageSize: 20 }),
    { enabled: seats && tab === 'history' },
  );
  const setFilters = (next: MemberFilter) => {
    setFilter(next);
    setPageNum(1);
    setSelected([]);
  };
  const startEdit = (row: MemberRow | 'new') => {
    setEditing(row);
    setConfirmed(false);
    setError('');
    form.resetFields();
    if (row !== 'new')
      form.setFieldsValue({
        name: row.member.employName,
        username: row.member.username,
        email: row.member.employEmail || '',
        phone: row.member.employPhone || '',
        orgId: row.member.departments?.[0]?.id,
        roleIds: row.member.roles?.map(role => role.id),
        memberStatus: row.member.memberStatus,
      });
  };
  const save = async () => {
    if (lock.current || !editing || (editing !== 'new' && !confirmed)) return;
    let values: MemberCreate & MemberEdit;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    if (
      editing === 'new' &&
      ![values.email, values.phone].some(value => value?.trim())
    ) {
      setError(teamText('enterAtLeastOneEmailAddressPhone'));
      return;
    }
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      if (editing === 'new')
        await teamApi.createMember({
          name: values.name.trim(),
          email: values.email?.trim(),
          phone: values.phone?.trim(),
          orgId: values.orgId,
          roleId: values.roleId,
        });
      else
        await teamApi.editMember({
          membershipId: editing.member.membershipId,
          email: values.email?.trim() || '',
          phone: values.phone?.trim() || '',
          orgId: values.orgId,
          roleIds: values.roleIds,
          memberStatus: values.memberStatus,
          confirmed: true,
        });
      setEditing(undefined);
      refresh();
      setSelected([]);
      message.success(teamText('memberSaved'));
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const execute = async () => {
    if (lock.current || !operation || !confirmed || !selected.length) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const ids = selected.map(row => row.member.membershipId);
      if (operation === 'TRANSFER') {
        if (!orgId) return;
        await teamApi.transfer(ids, orgId);
      } else if (operation === 'ASSIGN') {
        const failed: MemberRow[] = [];
        const results: string[] = [];
        // 服务端为单成员幂等接口，逐项显示结果，不宣称整批原子成功。
        // 单成员接口按顺序执行，保留逐项结果及幂等键。
        // eslint-disable-next-line no-restricted-syntax
        for (const row of selected) {
          const id = row.member.membershipId;
          if (!assignRequests.current.has(id))
            assignRequests.current.set(id, requestKey());
          try {
            // eslint-disable-next-line no-await-in-loop
            await teamApi.assign(id, assignRequests.current.get(id)!);
            results.push(
              teamText('valueSucceeded', { value0: row.member.employName }),
            );
            assignRequests.current.delete(id);
          } catch (failure) {
            failed.push(row);
            results.push(`${row.member.employName}：${errorText(failure)}`);
          }
        }
        refresh();
        setSelected(failed);
        setConfirmed(false);
        if (failed.length) {
          setError(results.join('；'));
          return;
        }
      } else await teamApi.memberState(ids, operation);
      refresh();
      setSelected([]);
      setOperation(undefined);
      message.success(teamText('operationCompleted'));
    } catch (failure) {
      setError(errorText(failure));
      refresh();
      setConfirmed(false);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const openOperation = (action: typeof operation, rows = selected) => {
    setSelected(rows);
    setOperation(action);
    setConfirmed(false);
    setOrgId(undefined);
    setError('');
  };
  const exportMembers = async () => {
    try {
      const rows = await teamApi.exportMembers(filter);
      downloadCsv(teamText('teamMembers'), rows, [
        { title: teamText('memberId'), value: row => row.member.membershipId },
        { title: teamText('name'), value: row => row.member.employName },
        { title: teamText('email'), value: row => row.member.employEmail },
        {
          title: teamText('phoneNumber'),
          value: row => row.member.employPhone,
        },
        { title: teamText('username'), value: row => row.member.username },
        {
          title: teamText('department'),
          value: row =>
            row.member.departments?.map(item => item.name).join('、'),
        },
        {
          title: teamText('role'),
          value: row => row.member.roles?.map(item => item.name).join('、'),
        },
        {
          title: teamText('seats'),
          value: row =>
            row.assignment ? teamText('assigned') : teamText('unassigned'),
        },
      ]);
    } catch (failure) {
      message.error(errorText(failure));
    }
  };
  const exportHistory = async () => {
    try {
      const rows = await teamApi.seatHistoryExport(filter.keyword);
      downloadCsv(teamText('seatHistory'), rows, [
        { title: teamText('member'), value: row => row.memberName },
        { title: teamText('seatId'), value: row => row.seatId },
        { title: teamText('assignedAt'), value: row => row.validFrom },
        {
          title: teamText('validUntil2'),
          value: row => dateText(row.validToExclusive, true),
        },
        { title: teamText('reclaimedAt'), value: row => row.endedAt },
        { title: teamText('reclaimReason'), value: row => row.endReason },
        { title: teamText('operator'), value: row => row.assignedByName },
      ]);
    } catch (failure) {
      message.error(errorText(failure));
    }
  };
  return (
    <>
      <PageTitle
        title={seats ? teamText('seatManagement') : teamText('members')}
        description={
          seats
            ? teamText('eachMemberCanOccupyOneSeatSeats')
            : teamText('manageMembersOfTheCurrentOrganizationUsing')
        }
        actions={
          <Space>
            <Button
              icon={<img src={buttonExport} alt='' />}
              onClick={tab === 'history' ? exportHistory : exportMembers}
            >
              {teamText('exportDetails')}
            </Button>
            {seats ? (
              <Button
                type='primary'
                icon={<img src={buttonAdd} alt='' />}
                onClick={() =>
                  history.push(`${TEAM_PATH}/purchase?action=EXPAND`)
                }
              >
                {teamText('addSeats')}
              </Button>
            ) : (
              <>
                {/* <Button onClick={() => setImportOpen(true)}>
                  {teamText('importCsv')}
                </Button> */}
                <Button type='primary' onClick={() => startEdit('new')}>
                  {teamText('addMember')}
                </Button>
              </>
            )}
          </Space>
        }
      />
      {seats && (
        <QueryState query={summary}>
          <div className={style.banner}>
            <span className={style.bannerBadge}>{teamText('enterprise')}</span>
            <span>Carbon Agent Enterprise</span>
            <span>
              {teamText('currentSubscriptionValidUntil')}
              {dateText(summary.data?.validToExclusive, true)}
            </span>
            <Status value={summary.data?.subscriptionStatus} />
          </div>
          <Metrics
            items={[
              {
                title: teamText('purchasedSeats'),
                value: summary.data?.purchasedSeats,
                hint: teamText('totalSeatsInTheCurrentSubscription'),
              },
              {
                title: teamText('occupiedSeats'),
                value: summary.data?.assignedSeats,
                percent: summary.data?.totalSeats
                  ? (summary.data.assignedSeats / summary.data.totalSeats) * 100
                  : 0,
              },
              {
                title: teamText('availableSeats'),
                value: summary.data?.availableSeats,
                percent: summary.data?.totalSeats
                  ? (summary.data.availableSeats / summary.data.totalSeats) *
                    100
                  : 0,
              },
              {
                title: teamText('seatUtilization'),
                value: summary.data?.totalSeats
                  ? (
                      (summary.data.assignedSeats / summary.data.totalSeats) *
                      100
                    ).toFixed(1)
                  : 0,
                suffix: '%',
                percent: summary.data?.totalSeats
                  ? (summary.data.assignedSeats / summary.data.totalSeats) * 100
                  : 0,
              },
            ]}
          />
        </QueryState>
      )}
      {seats && (
        <Tabs
          activeKey={tab}
          onChange={value => {
            setTab(value);
            setPageNum(1);
            setSelected([]);
          }}
          items={[
            { key: 'members', label: teamText('memberSeats') },
            { key: 'history', label: teamText('assignmentAndReclaimHistory') },
          ]}
        />
      )}
      <div className={style.toolbar}>
        <Input.Search
          allowClear
          placeholder={teamText('searchMemberNameOrAccount')}
          onSearch={keyword => setFilters({ ...filter, keyword })}
        />
        {tab === 'members' && (
          <>
            <Select
              allowClear
              placeholder={teamText('departmentIncludingSubdepartments')}
              style={{ width: 170 }}
              value={filter.orgId}
              loading={options.isLoading}
              options={options.data?.departments.map(item => ({
                value: item.id,
                label: item.name,
              }))}
              onChange={value => setFilters({ ...filter, orgId: value })}
            />
            <Select
              allowClear
              placeholder={teamText('memberStatus')}
              style={{ width: 130 }}
              options={[
                { value: 'ACTIVE', label: teamText('enable') },
                { value: 'PENDING', label: teamText('pendingActivation') },
                { value: 'DISABLED', label: teamText('disable') },
              ]}
              onChange={value => setFilters({ ...filter, memberState: value })}
            />
            <Select
              allowClear
              placeholder={teamText('seatStatus')}
              style={{ width: 130 }}
              options={[
                { value: 'ASSIGNED', label: teamText('assigned') },
                { value: 'UNASSIGNED', label: teamText('unassigned') },
              ]}
              onChange={value => setFilters({ ...filter, seatState: value })}
            />
          </>
        )}
        {tab === 'members' && (
          <div className={style.toolbarEnd}>
            <span>
              {teamText('selected')}
              {selected.length} {teamText('members2')}
            </span>
            {seats ? (
              <Button
                disabled={
                  !selected.length ||
                  selected.some(
                    row =>
                      !!row.assignment ||
                      row.member.memberStatus !== 0 ||
                      row.member.userStatus === 1,
                  )
                }
                onClick={() => openOperation('ASSIGN')}
              >
                {teamText('assignSeats')}
              </Button>
            ) : (
              <>
                <Button
                  disabled={!selected.length}
                  onClick={() => openOperation('TRANSFER')}
                >
                  {teamText('moveDepartment')}
                </Button>
                <Button
                  disabled={!selected.length}
                  onClick={() => openOperation('ENABLE')}
                >
                  {teamText('enable')}
                </Button>
                <Button
                  disabled={
                    !selected.length ||
                    selected.some(row => row.member.principal)
                  }
                  onClick={() => openOperation('DISABLE')}
                >
                  {teamText('disable')}
                </Button>
                <Button
                  danger
                  disabled={
                    !selected.length ||
                    selected.some(row => row.member.principal)
                  }
                  onClick={() => openOperation('REMOVE')}
                >
                  {teamText('remove')}
                </Button>
              </>
            )}
          </div>
        )}
      </div>
      {options.isError && (
        <Alert
          type='warning'
          message={teamText('failedToLoadDepartmentsAndRoles')}
          action={
            <Button onClick={() => options.refetch()}>
              {teamText('retry')}
            </Button>
          }
        />
      )}
      {tab === 'members' ? (
        <QueryState query={members}>
          <Table<MemberRow>
            rowKey={row => row.member.membershipId}
            dataSource={members.data?.rows}
            loading={members.isFetching}
            scroll={{ x: 1280 }}
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
            pagination={{
              showTotal: total => teamText('valueRecords', { value0: total }),
              current: pageNum,
              pageSize: 20,
              total: members.data?.total,
              showSizeChanger: false,
              onChange: setPageNum,
            }}
            columns={[
              {
                title: teamText('member'),
                width: 150,
                ellipsis: true,
                render: (_, row) => (
                  <>
                    {row.member.employName}
                    {row.member.principal && <Tag>{teamText('owner')}</Tag>}
                  </>
                ),
              },
              {
                title: teamText('account'),
                width: 150,
                ellipsis: true,
                render: (_, row) => row.member.username,
              },
              {
                title: teamText('department'),
                width: 170,
                ellipsis: true,
                render: (_, row) =>
                  row.member.departments?.map(item => item.name).join('、') ||
                  '—',
              },
              {
                title: teamText('role'),
                width: 180,
                ellipsis: true,
                render: (_, row) =>
                  row.member.roles?.map(item => item.name).join('、') || '—',
              },
              {
                title: teamText('memberStatus'),
                width: 110,
                ellipsis: true,
                render: (_, row) =>
                  row.member.memberStatus === 1
                    ? teamText('disable')
                    : row.member.userStatus === 2
                    ? teamText('pendingActivation')
                    : row.member.userStatus === 1
                    ? teamText('accountDisabled')
                    : teamText('enable'),
              },
              {
                title: teamText('seatStatus'),
                width: 110,
                ellipsis: true,
                render: (_, row) => (
                  <Tag color={row.assignment ? 'cyan' : 'default'}>
                    {row.assignment
                      ? teamText('assigned')
                      : teamText('unassigned')}
                  </Tag>
                ),
              },
              {
                title: teamText('lastLogin'),
                width: 140,
                ellipsis: true,
                render: (_, row) => dateText(row.member.lastLoginTime),
              },
              {
                title: teamText('actions'),
                fixed: 'right',
                width: 90,
                ellipsis: true,
                render: (_, row) =>
                  seats ? (
                    <Button
                      type='link'
                      disabled={
                        !!row.assignment ||
                        row.member.memberStatus !== 0 ||
                        row.member.userStatus === 1
                      }
                      onClick={() => openOperation('ASSIGN', [row])}
                    >
                      {teamText('assign')}
                    </Button>
                  ) : (
                    <Button type='link' onClick={() => startEdit(row)}>
                      {teamText('edit')}
                    </Button>
                  ),
              },
            ]}
          />
        </QueryState>
      ) : (
        <QueryState query={seatHistory}>
          <Table
            rowKey='id'
            dataSource={seatHistory.data?.rows}
            pagination={{
              showTotal: total => teamText('valueRecords', { value0: total }),
              current: pageNum,
              pageSize: 20,
              total: seatHistory.data?.total,
              showSizeChanger: false,
              onChange: setPageNum,
            }}
            columns={[
              { title: teamText('member'), dataIndex: 'memberName' },
              { title: teamText('seats'), dataIndex: 'seatId' },
              {
                title: teamText('assignedAt'),
                dataIndex: 'validFrom',
                render: value => dateText(value),
              },
              {
                title: teamText('validUntil2'),
                dataIndex: 'validToExclusive',
                render: value => dateText(value, true),
              },
              {
                title: teamText('reclaimedAt'),
                dataIndex: 'endedAt',
                render: value => dateText(value),
              },
              { title: teamText('reclaimReason'), dataIndex: 'endReason' },
              { title: teamText('assignedBy'), dataIndex: 'assignedByName' },
            ]}
          />
        </QueryState>
      )}
      <Modal
        centered
        className={style.teamModal}
        title={
          editing === 'new' ? teamText('addMember') : teamText('editMember')
        }
        open={!!editing}
        onCancel={() => setEditing(undefined)}
        onOk={save}
        confirmLoading={busy}
        okButtonProps={{ disabled: editing !== 'new' && !confirmed }}
        destroyOnClose
      >
        {error && <Alert message={error} type='warning' />}
        <Form form={form} layout='vertical' preserve={false}>
          <Form.Item
            name='name'
            label={teamText('name')}
            rules={[{ required: true, whitespace: true, max: 100 }]}
          >
            <Input disabled={editing !== 'new'} />
          </Form.Item>
          {editing !== 'new' && (
            <Form.Item
              name='username'
              label={teamText('loginUsername')}
              rules={[
                {
                  pattern: /^[A-Za-z][A-Za-z0-9_.-]{2,63}$/,
                  message: teamText('startWithALetterUse364'),
                },
              ]}
            >
              <Input disabled />
            </Form.Item>
          )}
          <Form.Item
            name='email'
            label={teamText('workEmail')}
            rules={[{ type: 'email' }, { max: 100 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name='phone'
            label={teamText('workPhone')}
            rules={[
              {
                pattern: /^1[3-9]\d{9}$/,
                message: teamText('enterAn11DigitChinesePhoneNumber'),
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name='orgId'
            label={teamText('department')}
            rules={[{ required: true }]}
          >
            <Select
              options={options.data?.departments.map(item => ({
                value: item.id,
                label: item.name,
              }))}
            />
          </Form.Item>
          <Form.Item
            name={editing === 'new' ? 'roleId' : 'roleIds'}
            label={teamText('role')}
            rules={[{ required: true }]}
          >
            <Select
              mode={editing === 'new' ? undefined : 'multiple'}
              options={options.data?.roles.map(item => ({
                value: item.id,
                label: item.name,
              }))}
            />
          </Form.Item>
          {editing !== 'new' && (
            <Form.Item name='memberStatus' label={teamText('memberStatus')}>
              <Select
                disabled={!!editing?.member.principal}
                options={[
                  { value: 0, label: teamText('enable') },
                  { value: 1, label: teamText('disable') },
                ]}
              />
            </Form.Item>
          )}
        </Form>
        {editing !== 'new' && (
          <Checkbox
            checked={confirmed}
            onChange={event => setConfirmed(event.target.checked)}
          >
            {teamText('confirmTheImpactDepartmentOrRoleChanges')}
          </Checkbox>
        )}
      </Modal>
      <Modal
        centered
        className={style.teamModal}
        title={
          {
            ENABLE: teamText('enableMembers'),
            DISABLE: teamText('disableMembers'),
            REMOVE: teamText('removeMembers'),
            TRANSFER: teamText('moveDepartment'),
            ASSIGN: teamText('assignSeats'),
          }[operation || 'ENABLE']
        }
        open={!!operation}
        confirmLoading={busy}
        onCancel={() => setOperation(undefined)}
        onOk={execute}
        okButtonProps={{
          disabled: !confirmed || (operation === 'TRANSFER' && !orgId),
        }}
      >
        <p>
          {teamText('thisActionAffects')}
          {selected.length} {teamText('members3')}
        </p>
        {error && <Alert message={error} type='warning' />}
        {operation === 'TRANSFER' && (
          <Select
            style={{ width: '100%', marginBottom: 16 }}
            value={orgId}
            onChange={setOrgId}
            options={options.data?.departments.map(item => ({
              value: item.id,
              label: item.name,
            }))}
            placeholder={teamText('targetDepartment')}
          />
        )}
        <Checkbox
          checked={confirmed}
          onChange={event => setConfirmed(event.target.checked)}
        >
          {operation === 'ASSIGN'
            ? teamText('iConfirmAssigningSeatsIndividuallyValidityIs')
            : teamText('iUnderstandDisablingOrRemovingMembersReclaims')}
        </Checkbox>
      </Modal>
      <MemberImport open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
};
