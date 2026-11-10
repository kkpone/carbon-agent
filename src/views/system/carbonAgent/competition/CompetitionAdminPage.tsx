import {
  ApartmentOutlined,
  ArrowLeftOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  CloudSyncOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileDoneOutlined,
  FileSearchOutlined,
  GiftOutlined,
  PlusOutlined,
  SendOutlined,
  TrophyOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Input,
  InputNumber,
  Modal,
  Radio,
  Segmented,
  Select,
  Table,
  Tag,
  message,
} from 'antd';
import classNames from 'classnames';
import { useMemo, useState } from 'react';

import style from './competition.module.less';
import type {
  AdminEnterpriseAuditItem,
  AdminQuestionPairItem,
  AdminRosFinalReviewItem,
  CompetitionStagePhase,
  TeamMemberRecord,
} from './data';
import {
  ADMIN_AUDIT_INITIAL_LIST,
  ADMIN_QUESTION_PAIR_LIST,
  ADMIN_ROS_FINAL_REVIEW_LIST,
  CORP_CARBON_MODEL_OPTIONS_DESC,
  ENTERPRISE_AWARD_WINNERS,
  ENTERPRISE_CHECKIN_PUBLIC_LIST,
  INDIVIDUAL_AWARD_WINNERS,
  INDIVIDUAL_CHECKIN_PUBLIC_LIST,
  INDIVIDUAL_INVITED_RECORDS,
  PROD_CARBON_MODEL_OPTIONS_DESC,
  compText,
} from './data';

type AdminMenuKey =
  | 'AUDIT'
  | 'TEAMS'
  | 'QUESTIONS'
  | 'REVIEW'
  | 'CHECKIN'
  | 'PUBLISH';

type CompetitionAdminPageProps = {
  stagePhase: CompetitionStagePhase;
  teamMembers: TeamMemberRecord[];
  onStagePhaseChange: (phase: CompetitionStagePhase) => void;
  onBackToFront: () => void;
};

export const CompetitionAdminPage = ({
  stagePhase,
  teamMembers,
  onStagePhaseChange,
  onBackToFront,
}: CompetitionAdminPageProps) => {
  const [activeMenu, setActiveMenu] = useState<AdminMenuKey>('AUDIT');

  // 1. 企业资质审核状态
  const [auditList, setAuditList] = useState<AdminEnterpriseAuditItem[]>(
    ADMIN_AUDIT_INITIAL_LIST,
  );
  const [auditSearch, setAuditSearch] = useState('');
  const [auditStatusFilter, setAuditStatusFilter] = useState<string>('ALL');
  const [previewAuditItem, setPreviewAuditItem] =
    useState<AdminEnterpriseAuditItem | null>(null);
  const [rejectTarget, setRejectTarget] =
    useState<AdminEnterpriseAuditItem | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');

  // 2. 参赛组队与权益管理状态
  const [teamsTab, setTeamsTab] = useState<'ENTERPRISE' | 'INDIVIDUAL'>(
    'ENTERPRISE',
  );
  const [benefitGrantedMap, setBenefitGrantedMap] = useState<
    Record<string, boolean>
  >({});

  // 3. 考题题库与配对管理状态
  const [questionPairs, setQuestionPairs] = useState<AdminQuestionPairItem[]>(
    ADMIN_QUESTION_PAIR_LIST,
  );
  const [createPairOpen, setCreatePairOpen] = useState(false);
  const [newPairIndustry, setNewPairIndustry] = useState('');
  const [newPairProdTitle, setNewPairProdTitle] = useState('');
  const [newPairCorpTitle, setNewPairCorpTitle] = useState('');

  // 4. CREOS 材料评审与打分状态
  const [reviewSubTab, setReviewSubTab] = useState<'PRELIM_C' | 'FINAL_ROS'>(
    'PRELIM_C',
  );
  const [memberScores, setMemberScores] = useState<
    Record<string, { prod: number; corp: number }>
  >(() => {
    const init: Record<string, { prod: number; corp: number }> = {};
    teamMembers.forEach(m => {
      init[m.id] = {
        prod: m.cProdScore ?? 43.0,
        corp: m.cCorpScore ?? 42.0,
      };
    });
    return init;
  });
  const [scoringMember, setScoringMember] = useState<TeamMemberRecord | null>(
    null,
  );
  const [rosReviewList, setRosReviewList] = useState<AdminRosFinalReviewItem[]>(
    ADMIN_ROS_FINAL_REVIEW_LIST,
  );

  // 5. 碳账户打卡积分同步状态
  const [checkinSubTab, setCheckinSubTab] = useState<
    'ENTERPRISE' | 'INDIVIDUAL'
  >('ENTERPRISE');
  const [lastSyncTime, setLastSyncTime] = useState('2026-11-28 18:00:00');

  const pendingAuditCount = useMemo(
    () => auditList.filter(item => item.status === 'PENDING').length,
    [auditList],
  );

  const filteredAuditList = useMemo(
    () =>
      auditList.filter(item => {
        if (auditStatusFilter !== 'ALL' && item.status !== auditStatusFilter) {
          return false;
        }
        if (!auditSearch.trim()) {
          return true;
        }
        const q = auditSearch.trim().toLowerCase();
        return (
          item.enterpriseName.toLowerCase().includes(q) ||
          item.creditCode.toLowerCase().includes(q) ||
          item.leaderPhone.includes(q) ||
          item.leaderName.toLowerCase().includes(q)
        );
      }),
    [auditList, auditSearch, auditStatusFilter],
  );

  const teamAvgCScore = useMemo(() => {
    const validMembers = teamMembers.filter(m => m.registeredInAgent);
    if (validMembers.length === 0) return '0.0';
    const sum = validMembers.reduce((acc, m) => {
      const sc = memberScores[m.id] || { prod: 42.5, corp: 42.0 };
      return acc + sc.prod + sc.corp;
    }, 0);
    return (sum / validMembers.length).toFixed(2);
  }, [teamMembers, memberScores]);

  const handleApproveEnterprise = (row: AdminEnterpriseAuditItem) => {
    Modal.confirm({
      title: compText('adminApproveConfirmTitle'),
      content: compText('adminApproveConfirmDesc'),
      onOk: () => {
        setAuditList(prev =>
          prev.map(item =>
            item.id === row.id ? { ...item, status: 'APPROVED' } : item,
          ),
        );
        message.success(compText('adminApproveSuccessMsg'));
      },
    });
  };

  const handleConfirmRejectEnterprise = () => {
    if (!rejectTarget) return;
    setAuditList(prev =>
      prev.map(item =>
        item.id === rejectTarget.id
          ? {
              ...item,
              status: 'REJECTED',
              rejectReason:
                rejectReasonInput.trim() || compText('adminFilterRejected'),
            }
          : item,
      ),
    );
    setRejectTarget(null);
    setRejectReasonInput('');
    message.warning(compText('adminRejectSuccessMsg'));
  };

  const handleCreateQuestionPair = () => {
    if (!newPairIndustry.trim() || !newPairProdTitle.trim()) {
      message.warning(compText('adminCreatePairModalTitle'));
      return;
    }
    const nextIdx = questionPairs.length + 1;
    const newItem: AdminQuestionPairItem = {
      id: `qp-${Date.now()}`,
      pairCode: `PAIR-2026-0${nextIdx}`,
      industry: newPairIndustry.trim(),
      prodQuestionTitle: newPairProdTitle.trim(),
      prodFileName: `PCF_Pair0${nextIdx}_Pkg.zip`,
      prodOpenTime: '2026-11-20 16:00',
      corpQuestionTitle: newPairCorpTitle.trim() || newPairProdTitle.trim(),
      corpFileName: `ECA_Pair0${nextIdx}_Pkg.zip`,
      corpOpenTime: '2026-11-30 00:00',
      assignedCount: 0,
      statusText: compText('adminFilterApproved'),
    };
    setQuestionPairs(prev => [newItem, ...prev]);
    setCreatePairOpen(false);
    setNewPairIndustry('');
    setNewPairProdTitle('');
    setNewPairCorpTitle('');
    message.success(compText('adminCreatePairSuccess'));
  };

  const menuItems: Array<{
    key: AdminMenuKey;
    label: string;
    icon: JSX.Element;
    badge?: number;
  }> = [
    {
      key: 'AUDIT',
      label: compText('adminMenuAudit'),
      icon: <AuditOutlined />,
      badge: pendingAuditCount,
    },
    {
      key: 'TEAMS',
      label: compText('adminMenuTeams'),
      icon: <ApartmentOutlined />,
    },
    {
      key: 'QUESTIONS',
      label: compText('adminMenuQuestions'),
      icon: <FileSearchOutlined />,
    },
    {
      key: 'REVIEW',
      label: compText('adminMenuReview'),
      icon: <FileDoneOutlined />,
    },
    {
      key: 'CHECKIN',
      label: compText('adminMenuCheckin'),
      icon: <CloudSyncOutlined />,
    },
    {
      key: 'PUBLISH',
      label: compText('adminMenuPublish'),
      icon: <TrophyOutlined />,
    },
  ];

  return (
    <div className={style.adminShell}>
      {/* 顶部通栏 */}
      <header className={style.adminTopBar}>
        <div className={style.adminBrandLeft}>
          <span className={style.adminBrandBadge}>
            {compText('adminPortalBadge')}
          </span>
          <span className={style.adminBrandTitle}>
            {compText('adminPortalTitle')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            style={{
              borderRadius: 999,
              borderColor: 'rgba(255,255,255,0.28)',
              background: 'rgba(255,255,255,0.08)',
              color: '#ffffff',
            }}
            onClick={onBackToFront}
          >
            {compText('adminBackToFrontBtn')}
          </Button>
        </div>
      </header>

      <div className={style.adminBody}>
        {/* 左侧运营导航 */}
        <aside className={style.adminSider}>
          {menuItems.map(item => (
            <button
              key={item.key}
              type='button'
              className={classNames(style.adminMenuBtn, {
                [style.adminMenuBtnActive]: activeMenu === item.key,
              })}
              onClick={() => setActiveMenu(item.key)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {item.icon}
                <span>{item.label}</span>
              </span>
              {item.badge ? (
                <Tag
                  color='error'
                  style={{ margin: 0, borderRadius: 999, paddingInline: 7 }}
                >
                  {item.badge}
                </Tag>
              ) : null}
            </button>
          ))}
        </aside>

        {/* 右侧主内容区 */}
        <main className={style.adminMain}>
          {/* 顶部核心运营指标概览 */}
          <div className={style.adminStatGrid}>
            <div className={style.adminStatCard}>
              <div className={style.adminStatLabel}>
                {compText('adminStatTotalEnt')}
              </div>
              <div className={style.adminStatValue}>48</div>
              <div className={style.adminStatSub}>+12 (24h)</div>
            </div>
            <div className={style.adminStatCard}>
              <div className={style.adminStatLabel}>
                {compText('adminStatPendingAudit')}
              </div>
              <div
                className={style.adminStatValue}
                style={{ color: pendingAuditCount > 0 ? '#d46b08' : '#026961' }}
              >
                {pendingAuditCount}
              </div>
              <div className={style.adminStatSub}>SLA &lt; 24h</div>
            </div>
            <div className={style.adminStatCard}>
              <div className={style.adminStatLabel}>
                {compText('adminStatTotalPlayers')}
              </div>
              <div className={style.adminStatValue}>612</div>
              <div className={style.adminStatSub}>340 + 272</div>
            </div>
            <div className={style.adminStatCard}>
              <div className={style.adminStatLabel}>
                {compText('adminStatVipGranted')}
              </div>
              <div className={style.adminStatValue}>589</div>
              <div className={style.adminStatSub}>96.2%</div>
            </div>
          </div>

          {/* 1. 企业资质审核 */}
          {activeMenu === 'AUDIT' ? (
            <div className={style.cardBox}>
              <div
                className={style.bonusAlertBanner}
                style={{ marginBottom: 16 }}
              >
                <span>{compText('adminAuditBanner')}</span>
              </div>
              <div className={style.adminToolbar}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Input.Search
                    allowClear
                    style={{ width: 340 }}
                    placeholder={compText('adminSearchCompanyPlaceholder')}
                    value={auditSearch}
                    onChange={e => setAuditSearch(e.target.value)}
                  />
                  <Segmented
                    value={auditStatusFilter}
                    options={[
                      { label: compText('adminFilterAll'), value: 'ALL' },
                      {
                        label: compText('adminFilterPending'),
                        value: 'PENDING',
                      },
                      {
                        label: compText('adminFilterApproved'),
                        value: 'APPROVED',
                      },
                      {
                        label: compText('adminFilterRejected'),
                        value: 'REJECTED',
                      },
                    ]}
                    onChange={val => setAuditStatusFilter(String(val))}
                  />
                </div>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() =>
                    message.success(compText('adminMsgExportSuccess'))
                  }
                >
                  {compText('adminBtnExportRoster')}
                </Button>
              </div>

              <Table
                rowKey='id'
                pagination={false}
                dataSource={filteredAuditList}
                columns={[
                  {
                    title: compText('adminColApplyTime'),
                    dataIndex: 'applyTime',
                    key: 'applyTime',
                    width: 150,
                  },
                  {
                    title: compText('regEntNameLabel'),
                    dataIndex: 'enterpriseName',
                    key: 'enterpriseName',
                    render: (val: string) => (
                      <span style={{ fontWeight: 700, color: '#04252b' }}>
                        {val}
                      </span>
                    ),
                  },
                  {
                    title: compText('adminColCreditCode'),
                    dataIndex: 'creditCode',
                    key: 'creditCode',
                    width: 190,
                  },
                  {
                    title: compText('adminColLeaderInfo'),
                    key: 'leader',
                    width: 170,
                    render: (_: unknown, row: AdminEnterpriseAuditItem) => (
                      <div>
                        <div style={{ fontWeight: 600 }}>{row.leaderName}</div>
                        <div style={{ fontSize: 12, color: '#5c6b73' }}>
                          {row.leaderPhone}
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: compText('adminColLicenseLogo'),
                    key: 'files',
                    width: 130,
                    render: (_: unknown, row: AdminEnterpriseAuditItem) => (
                      <Button
                        type='link'
                        size='small'
                        icon={<EyeOutlined />}
                        style={{ padding: 0, color: '#026961' }}
                        onClick={() => setPreviewAuditItem(row)}
                      >
                        {compText('adminBtnViewMaterial')}
                      </Button>
                    ),
                  },
                  {
                    title: compText('adminColAuditStatus'),
                    dataIndex: 'status',
                    key: 'status',
                    width: 120,
                    render: (status: AdminEnterpriseAuditItem['status']) => {
                      if (status === 'APPROVED') {
                        return (
                          <Tag color='success'>
                            {compText('adminFilterApproved')}
                          </Tag>
                        );
                      }
                      if (status === 'REJECTED') {
                        return (
                          <Tag color='error'>
                            {compText('adminFilterRejected')}
                          </Tag>
                        );
                      }
                      return (
                        <Tag color='warning'>
                          {compText('adminFilterPending')}
                        </Tag>
                      );
                    },
                  },
                  {
                    title: compText('adminColAction'),
                    key: 'action',
                    width: 180,
                    render: (_: unknown, row: AdminEnterpriseAuditItem) =>
                      row.status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button
                            type='primary'
                            size='small'
                            style={{
                              background: '#026961',
                              borderColor: '#026961',
                            }}
                            onClick={() => handleApproveEnterprise(row)}
                          >
                            {compText('adminBtnApprove')}
                          </Button>
                          <Button
                            danger
                            size='small'
                            onClick={() => {
                              setRejectTarget(row);
                              setRejectReasonInput('');
                            }}
                          >
                            {compText('adminBtnReject')}
                          </Button>
                        </div>
                      ) : (
                        <span style={{ color: '#8c9aa4' }}>-</span>
                      ),
                  },
                ]}
              />
            </div>
          ) : null}

          {/* 2. 参赛组队与权益管理 */}
          {activeMenu === 'TEAMS' ? (
            <div className={style.cardBox}>
              <div
                className={style.bonusAlertBanner}
                style={{ marginBottom: 16 }}
              >
                <span>{compText('adminTeamsBanner')}</span>
              </div>
              <div className={style.adminToolbar}>
                <Segmented
                  size='large'
                  value={teamsTab}
                  options={[
                    {
                      label: compText('adminTabEnterpriseTeams'),
                      value: 'ENTERPRISE',
                    },
                    {
                      label: compText('adminTabIndividualPlayers'),
                      value: 'INDIVIDUAL',
                    },
                  ]}
                  onChange={val =>
                    setTeamsTab(val as 'ENTERPRISE' | 'INDIVIDUAL')
                  }
                />
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button
                    type='primary'
                    icon={<GiftOutlined />}
                    style={{ background: '#026961', borderColor: '#026961' }}
                    onClick={() => {
                      const nextMap: Record<string, boolean> = {};
                      teamMembers.forEach(m => {
                        nextMap[m.id] = true;
                      });
                      setBenefitGrantedMap(nextMap);
                      message.success(compText('adminApproveSuccessMsg'));
                    }}
                  >
                    {compText('adminBtnBatchGrantBenefit')}
                  </Button>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() =>
                      message.success(compText('adminMsgExportSuccess'))
                    }
                  >
                    {compText('adminBtnExportRoster')}
                  </Button>
                </div>
              </div>

              {teamsTab === 'ENTERPRISE' ? (
                <Table
                  rowKey='id'
                  pagination={false}
                  dataSource={teamMembers}
                  columns={[
                    {
                      title: compText('regEntNameLabel'),
                      key: 'ent',
                      render: () => '绿源智造新能源科技有限公司',
                    },
                    {
                      title: compText('adminColTrackType'),
                      key: 'role',
                      width: 100,
                      render: (_: unknown, row: TeamMemberRecord) => (
                        <Tag color={row.isLeader ? 'green' : 'default'}>
                          {row.isLeader
                            ? compText('regMemberLeaderTag')
                            : compText('regMemberNormalTag')}
                        </Tag>
                      ),
                    },
                    {
                      title: compText('checkinColPersonName'),
                      dataIndex: 'name',
                      key: 'name',
                    },
                    {
                      title: compText('checkinColPhone'),
                      dataIndex: 'phone',
                      key: 'phone',
                    },
                    {
                      title: compText('adminColInviter'),
                      dataIndex: 'inviterName',
                      key: 'inviterName',
                      render: (val?: string) => val || '-',
                    },
                    {
                      title: compText('adminColRegStatus'),
                      dataIndex: 'registeredInAgent',
                      key: 'registeredInAgent',
                      render: (reg: boolean) =>
                        reg ? (
                          <Tag color='success'>
                            {compText('regMemberRegisteredTag')}
                          </Tag>
                        ) : (
                          <Tag color='warning'>
                            {compText('regMemberUnregisteredTag')}
                          </Tag>
                        ),
                    },
                    {
                      title: compText('adminColBenefitStatus'),
                      key: 'benefit',
                      render: (_: unknown, row: TeamMemberRecord) => {
                        const granted =
                          row.registeredInAgent || benefitGrantedMap[row.id];
                        if (!granted) {
                          return (
                            <Tag color='default'>
                              {compText('adminBenefitPendingReg')}
                            </Tag>
                          );
                        }
                        return row.isLeader ? (
                          <Tag color='cyan'>
                            {compText('adminBenefitGrantedPoints')}
                          </Tag>
                        ) : (
                          <Tag color='success'>
                            {compText('adminBenefitGrantedVip')}
                          </Tag>
                        );
                      },
                    },
                    {
                      title: compText('adminColAction'),
                      key: 'action',
                      width: 120,
                      render: (_: unknown, row: TeamMemberRecord) => (
                        <Button
                          type='link'
                          size='small'
                          style={{ padding: 0, color: '#026961' }}
                          onClick={() => {
                            setBenefitGrantedMap(prev => ({
                              ...prev,
                              [row.id]: true,
                            }));
                            message.success(compText('adminApproveSuccessMsg'));
                          }}
                        >
                          {compText('adminBtnRegrantBenefit')}
                        </Button>
                      ),
                    },
                  ]}
                />
              ) : (
                <Table
                  rowKey='id'
                  pagination={false}
                  dataSource={INDIVIDUAL_INVITED_RECORDS}
                  columns={[
                    {
                      title: compText('checkinColPersonName'),
                      dataIndex: 'name',
                      key: 'name',
                    },
                    {
                      title: compText('checkinColPhone'),
                      dataIndex: 'maskedPhone',
                      key: 'maskedPhone',
                    },
                    {
                      title: compText('adminColTrackType'),
                      dataIndex: 'trackLabel',
                      key: 'trackLabel',
                    },
                    {
                      title: compText('adminColInvitedCount'),
                      dataIndex: 'bonusText',
                      key: 'bonusText',
                      render: (val: string) => <Tag color='green'>{val}</Tag>,
                    },
                    {
                      title: compText('adminColBenefitStatus'),
                      key: 'benefit',
                      render: () => (
                        <Tag color='success'>
                          {compText('adminBenefitGrantedVip')}
                        </Tag>
                      ),
                    },
                  ]}
                />
              )}
            </div>
          ) : null}

          {/* 3. 考题题库与配对管理 */}
          {activeMenu === 'QUESTIONS' ? (
            <div className={style.cardBox}>
              <div
                className={style.bonusAlertBanner}
                style={{ marginBottom: 16 }}
              >
                <span>{compText('adminQuestionPairRuleBanner')}</span>
              </div>
              <div className={style.adminToolbar}>
                <h3 className={style.cardTitle} style={{ margin: 0 }}>
                  {compText('adminMenuQuestions')}
                </h3>
                <Button
                  type='primary'
                  icon={<PlusOutlined />}
                  style={{ background: '#026961', borderColor: '#026961' }}
                  onClick={() => setCreatePairOpen(true)}
                >
                  {compText('adminBtnCreateQuestionPair')}
                </Button>
              </div>
              <Table
                rowKey='id'
                pagination={false}
                dataSource={questionPairs}
                columns={[
                  {
                    title: compText('adminColPairCode'),
                    dataIndex: 'pairCode',
                    key: 'pairCode',
                    width: 140,
                    render: (val: string) => (
                      <Tag color='geekblue' style={{ fontWeight: 700 }}>
                        {val}
                      </Tag>
                    ),
                  },
                  {
                    title: compText('adminColIndustry'),
                    dataIndex: 'industry',
                    key: 'industry',
                    width: 180,
                  },
                  {
                    title: compText('adminColProdQuestionPkg'),
                    key: 'prod',
                    render: (_: unknown, row: AdminQuestionPairItem) => (
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {row.prodQuestionTitle}
                        </div>
                        <div style={{ fontSize: 12, color: '#026961' }}>
                          {row.prodFileName} · {row.prodOpenTime}
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: compText('adminColCorpQuestionPkg'),
                    key: 'corp',
                    render: (_: unknown, row: AdminQuestionPairItem) => (
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {row.corpQuestionTitle}
                        </div>
                        <div style={{ fontSize: 12, color: '#026961' }}>
                          {row.corpFileName} · {row.corpOpenTime}
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: compText('adminColDownloadCount'),
                    dataIndex: 'assignedCount',
                    key: 'assignedCount',
                    width: 130,
                  },
                  {
                    title: compText('adminColOpenStatus'),
                    dataIndex: 'statusText',
                    key: 'statusText',
                    width: 120,
                    render: (val: string) => <Tag color='success'>{val}</Tag>,
                  },
                ]}
              />
            </div>
          ) : null}

          {/* 4. CREOS 材料评审与打分 */}
          {activeMenu === 'REVIEW' ? (
            <div className={style.cardBox}>
              <div
                className={style.bonusAlertBanner}
                style={{ marginBottom: 16 }}
              >
                <span>{compText('adminReviewBanner')}</span>
              </div>
              <div className={style.adminToolbar}>
                <Segmented
                  size='large'
                  value={reviewSubTab}
                  options={[
                    {
                      label: compText('adminReviewTabPrelimC'),
                      value: 'PRELIM_C',
                    },
                    {
                      label: compText('adminReviewTabFinalRos'),
                      value: 'FINAL_ROS',
                    },
                  ]}
                  onChange={val =>
                    setReviewSubTab(val as 'PRELIM_C' | 'FINAL_ROS')
                  }
                />
                {reviewSubTab === 'PRELIM_C' ? (
                  <Tag
                    color='green'
                    style={{
                      fontSize: 14,
                      padding: '6px 14px',
                      borderRadius: 999,
                      fontWeight: 700,
                    }}
                  >
                    {compText('adminColTeamAvgCScore')}：{teamAvgCScore} / 90
                  </Tag>
                ) : null}
              </div>

              {reviewSubTab === 'PRELIM_C' ? (
                <Table
                  rowKey='id'
                  pagination={false}
                  dataSource={teamMembers}
                  columns={[
                    {
                      title: compText('checkinColPersonName'),
                      dataIndex: 'name',
                      key: 'name',
                    },
                    {
                      title: compText('adminColDataSource'),
                      key: 'source',
                      width: 140,
                      render: () => (
                        <Tag color='cyan'>
                          {compText('subDataSourceOfficial')}
                        </Tag>
                      ),
                    },
                    {
                      title: compText('adminColProdModelScore'),
                      key: 'prodScore',
                      render: (_: unknown, row: TeamMemberRecord) => {
                        const sc = memberScores[row.id]?.prod ?? 43.0;
                        return (
                          <div>
                            <div style={{ fontSize: 12, color: '#026961' }}>
                              {PROD_CARBON_MODEL_OPTIONS_DESC[0].label}
                            </div>
                            <div style={{ fontWeight: 700, marginTop: 4 }}>
                              {row.registeredInAgent ? `${sc} / 45` : '-'}
                            </div>
                          </div>
                        );
                      },
                    },
                    {
                      title: compText('adminColCorpModelScore'),
                      key: 'corpScore',
                      render: (_: unknown, row: TeamMemberRecord) => {
                        const sc = memberScores[row.id]?.corp ?? 42.0;
                        return (
                          <div>
                            <div style={{ fontSize: 12, color: '#026961' }}>
                              {CORP_CARBON_MODEL_OPTIONS_DESC[0].label}
                            </div>
                            <div style={{ fontWeight: 700, marginTop: 4 }}>
                              {row.registeredInAgent ? `${sc} / 45` : '-'}
                            </div>
                          </div>
                        );
                      },
                    },
                    {
                      title: compText('adminColTeamAvgCScore'),
                      key: 'totalC',
                      width: 140,
                      render: (_: unknown, row: TeamMemberRecord) => {
                        if (!row.registeredInAgent) return '-';
                        const sc = memberScores[row.id] || {
                          prod: 43.0,
                          corp: 42.0,
                        };
                        return (
                          <span style={{ fontWeight: 800, color: '#026961' }}>
                            {(sc.prod + sc.corp).toFixed(1)}
                          </span>
                        );
                      },
                    },
                    {
                      title: compText('adminColAction'),
                      key: 'action',
                      width: 120,
                      render: (_: unknown, row: TeamMemberRecord) =>
                        row.registeredInAgent ? (
                          <Button
                            type='primary'
                            size='small'
                            style={{
                              background: '#026961',
                              borderColor: '#026961',
                            }}
                            onClick={() => setScoringMember(row)}
                          >
                            {compText('adminBtnScoreModel')}
                          </Button>
                        ) : (
                          '-'
                        ),
                    },
                  ]}
                />
              ) : (
                <Table
                  rowKey='id'
                  pagination={false}
                  dataSource={rosReviewList}
                  columns={[
                    {
                      title: compText('regEntNameLabel'),
                      dataIndex: 'enterpriseName',
                      key: 'enterpriseName',
                      render: (val: string) => (
                        <span style={{ fontWeight: 700 }}>{val}</span>
                      ),
                    },
                    {
                      title: compText('adminColRosFiles'),
                      key: 'files',
                      render: (_: unknown, row: AdminRosFinalReviewItem) => (
                        <div style={{ fontSize: 12, lineHeight: 1.8 }}>
                          <div>R: {row.rDocName}</div>
                          <div>O: {row.oDocName}</div>
                          <div>S: {row.sDocName}</div>
                        </div>
                      ),
                    },
                    {
                      title: compText('adminColRosScore'),
                      key: 'rosScore',
                      width: 180,
                      render: (_: unknown, row: AdminRosFinalReviewItem) => (
                        <div>
                          R:{row.rScore} / O:{row.oScore} / S:{row.sScore}
                        </div>
                      ),
                    },
                    {
                      title: compText('adminColDefenseScore'),
                      dataIndex: 'defenseScore',
                      key: 'defenseScore',
                      width: 130,
                      render: (val: number, row: AdminRosFinalReviewItem) => (
                        <InputNumber
                          min={0}
                          max={30}
                          step={0.5}
                          value={val}
                          onChange={nextVal => {
                            const num = Number(nextVal ?? 0);
                            setRosReviewList(prev =>
                              prev.map(item =>
                                item.id === row.id
                                  ? { ...item, defenseScore: num }
                                  : item,
                              ),
                            );
                          }}
                        />
                      ),
                    },
                    {
                      title: compText('adminColFinalTotalScore'),
                      key: 'finalTotal',
                      width: 170,
                      render: (_: unknown, row: AdminRosFinalReviewItem) => {
                        const raw =
                          row.rScore +
                          row.oScore +
                          row.sScore +
                          row.defenseScore;
                        const withBonus = raw * (1 + row.bonusRate / 100);
                        return (
                          <span style={{ fontWeight: 800, color: '#026961' }}>
                            {withBonus.toFixed(2)} (+{row.bonusRate}%)
                          </span>
                        );
                      },
                    },
                  ]}
                />
              )}
            </div>
          ) : null}

          {/* 5. 碳账户打卡积分同步 */}
          {activeMenu === 'CHECKIN' ? (
            <div className={style.cardBox}>
              <div
                className={style.bonusAlertBanner}
                style={{ marginBottom: 16 }}
              >
                <span>
                  {compText('adminCheckinSyncBanner')}（{lastSyncTime}）
                </span>
              </div>
              <div className={style.adminToolbar}>
                <Segmented
                  size='large'
                  value={checkinSubTab}
                  options={[
                    {
                      label: compText('checkinTabEnterprise'),
                      value: 'ENTERPRISE',
                    },
                    {
                      label: compText('checkinTabIndividual'),
                      value: 'INDIVIDUAL',
                    },
                  ]}
                  onChange={val =>
                    setCheckinSubTab(val as 'ENTERPRISE' | 'INDIVIDUAL')
                  }
                />
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Button
                    type='primary'
                    icon={<CloudSyncOutlined />}
                    style={{ background: '#026961', borderColor: '#026961' }}
                    onClick={() => {
                      setLastSyncTime('2026-11-28 19:30:00');
                      message.success(compText('adminMsgSyncedSuccess'));
                    }}
                  >
                    {compText('adminBtnSyncMiniProgram')}
                  </Button>
                  <Button
                    icon={<UploadOutlined />}
                    onClick={() =>
                      message.success(compText('adminMsgSyncedSuccess'))
                    }
                  >
                    {compText('adminBtnImportCheckinExcel')}
                  </Button>
                  <Button
                    onClick={() =>
                      message.success(compText('adminMsgSyncedSuccess'))
                    }
                  >
                    {compText('adminBtnRecalcEScore')}
                  </Button>
                </div>
              </div>

              {checkinSubTab === 'ENTERPRISE' ? (
                <Table
                  rowKey='key'
                  pagination={false}
                  dataSource={ENTERPRISE_CHECKIN_PUBLIC_LIST}
                  columns={[
                    {
                      title: compText('checkinColRank'),
                      dataIndex: 'rank',
                      key: 'rank',
                      width: 80,
                    },
                    {
                      title: compText('checkinColEnterprise'),
                      dataIndex: 'enterpriseName',
                      key: 'enterpriseName',
                    },
                    {
                      title: compText('checkinColActiveUsers'),
                      dataIndex: 'activeUsers',
                      key: 'activeUsers',
                    },
                    {
                      title: compText('checkinColCheckinTimes'),
                      dataIndex: 'checkinTimes',
                      key: 'checkinTimes',
                    },
                    {
                      title: compText('checkinColTotalPoints'),
                      dataIndex: 'totalPoints',
                      key: 'totalPoints',
                    },
                    {
                      title: compText('checkinColEScore'),
                      dataIndex: 'eStageScore',
                      key: 'eStageScore',
                      render: (val: number) => (
                        <Tag color='green' style={{ fontWeight: 700 }}>
                          {val.toFixed(1)}
                        </Tag>
                      ),
                    },
                  ]}
                />
              ) : (
                <Table
                  rowKey='key'
                  pagination={false}
                  dataSource={INDIVIDUAL_CHECKIN_PUBLIC_LIST}
                  columns={[
                    {
                      title: compText('checkinColRank'),
                      dataIndex: 'rank',
                      key: 'rank',
                      width: 80,
                    },
                    {
                      title: compText('checkinColPersonName'),
                      dataIndex: 'personName',
                      key: 'personName',
                    },
                    {
                      title: compText('checkinColPhone'),
                      dataIndex: 'maskedPhone',
                      key: 'maskedPhone',
                    },
                    {
                      title: compText('checkinColTrackTeam'),
                      dataIndex: 'trackTeamLabel',
                      key: 'trackTeamLabel',
                    },
                    {
                      title: compText('checkinColPersonPoints'),
                      dataIndex: 'totalPoints',
                      key: 'totalPoints',
                    },
                    {
                      title: compText('checkinColEScore'),
                      dataIndex: 'eStageScore',
                      key: 'eStageScore',
                      render: (val: number) => (
                        <Tag color='green' style={{ fontWeight: 700 }}>
                          {val.toFixed(1)}
                        </Tag>
                      ),
                    },
                  ]}
                />
              )}
            </div>
          ) : null}

          {/* 6. 赛果公示与奖项发布 */}
          {activeMenu === 'PUBLISH' ? (
            <div className={style.cardBox}>
              <div
                className={style.bonusAlertBanner}
                style={{ marginBottom: 16 }}
              >
                <span>{compText('adminPublishBanner')}</span>
              </div>
              <div
                style={{
                  padding: 18,
                  background: '#f7f8f9',
                  borderRadius: 12,
                  marginBottom: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 14,
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, marginRight: 12 }}>
                    {compText('adminPublishStageLabel')}
                  </span>
                  <Radio.Group
                    value={stagePhase}
                    onChange={e => {
                      onStagePhaseChange(e.target.value);
                      message.success(compText('adminMsgStageSwitched'));
                    }}
                  >
                    <Radio.Button value='PROD_CARBON'>
                      {compText('demoStageProdCarbon')}
                    </Radio.Button>
                    <Radio.Button value='CORP_CARBON'>
                      {compText('demoStageCorpCarbon')}
                    </Radio.Button>
                    <Radio.Button value='PRELIM_DONE'>
                      {compText('demoStagePrelimDone')}
                    </Radio.Button>
                    <Radio.Button value='FINAL_DONE'>
                      {compText('demoStageFinalDone')}
                    </Radio.Button>
                  </Radio.Group>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button
                    icon={<SendOutlined />}
                    onClick={() => {
                      onStagePhaseChange('PRELIM_DONE');
                      message.success(compText('adminMsgStageSwitched'));
                    }}
                  >
                    {compText('adminBtnPublishPrelim')}
                  </Button>
                  <Button
                    type='primary'
                    icon={<CheckCircleOutlined />}
                    style={{ background: '#026961', borderColor: '#026961' }}
                    onClick={() => {
                      onStagePhaseChange('FINAL_DONE');
                      message.success(compText('adminMsgStageSwitched'));
                    }}
                  >
                    {compText('adminBtnPublishFinal')}
                  </Button>
                </div>
              </div>

              <h3 className={style.cardTitle}>
                {compText('resultAwardGroupEnt')} &{' '}
                {compText('resultAwardGroupInd')}
              </h3>
              <Table
                rowKey='key'
                pagination={false}
                dataSource={[
                  ...ENTERPRISE_AWARD_WINNERS,
                  ...INDIVIDUAL_AWARD_WINNERS,
                ]}
                columns={[
                  {
                    title: compText('resultColAward'),
                    dataIndex: 'awardLevel',
                    key: 'awardLevel',
                    width: 140,
                    render: (val: string) => (
                      <Tag color='gold' style={{ fontWeight: 700 }}>
                        {val}
                      </Tag>
                    ),
                  },
                  {
                    title: compText('resultColWinnerName'),
                    dataIndex: 'name',
                    key: 'name',
                    render: (val: string) => (
                      <span style={{ fontWeight: 700 }}>{val}</span>
                    ),
                  },
                  {
                    title: compText('resultColCScore'),
                    dataIndex: 'cAvgOrScore',
                    key: 'cAvgOrScore',
                  },
                  {
                    title: compText('resultColEScore'),
                    dataIndex: 'ePointsAndScore',
                    key: 'ePointsAndScore',
                  },
                  {
                    title: compText('resultColFinalTotal'),
                    dataIndex: 'finalScoreText',
                    key: 'finalScoreText',
                    render: (val: string) => (
                      <span style={{ fontWeight: 800, color: '#026961' }}>
                        {val}
                      </span>
                    ),
                  },
                ]}
              />
            </div>
          ) : null}
        </main>
      </div>

      {/* 证照预览弹窗 */}
      <Modal
        open={Boolean(previewAuditItem)}
        title={compText('adminPreviewModalTitle')}
        footer={null}
        onCancel={() => setPreviewAuditItem(null)}
      >
        {previewAuditItem ? (
          <div style={{ lineHeight: 2 }}>
            <div>
              <strong>{compText('regEntNameLabel')}：</strong>
              {previewAuditItem.enterpriseName}
            </div>
            <div>
              <strong>{compText('adminColCreditCode')}：</strong>
              {previewAuditItem.creditCode}
            </div>
            <div>
              <strong>{compText('adminLabelLicenseFile')}</strong>
              <Tag color='cyan'>{previewAuditItem.licenseFileName}</Tag>
            </div>
            <div>
              <strong>{compText('adminLabelLogoFile')}</strong>
              <Tag color='green'>{previewAuditItem.logoFileName}</Tag>
            </div>
            {previewAuditItem.rejectReason ? (
              <div style={{ color: '#cf1322' }}>
                <strong>{compText('adminLabelRejectReason')}</strong>
                {previewAuditItem.rejectReason}
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>

      {/* 驳回原因弹窗 */}
      <Modal
        open={Boolean(rejectTarget)}
        title={compText('adminRejectModalTitle')}
        onCancel={() => setRejectTarget(null)}
        onOk={handleConfirmRejectEnterprise}
      >
        <Input.TextArea
          rows={4}
          value={rejectReasonInput}
          placeholder={compText('adminRejectReasonPlaceholder')}
          onChange={e => setRejectReasonInput(e.target.value)}
        />
      </Modal>

      {/* 新增1对1配对考题弹窗 */}
      <Modal
        open={createPairOpen}
        title={compText('adminCreatePairModalTitle')}
        onCancel={() => setCreatePairOpen(false)}
        onOk={handleCreateQuestionPair}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input
            placeholder={compText('adminColIndustry')}
            value={newPairIndustry}
            onChange={e => setNewPairIndustry(e.target.value)}
          />
          <Input
            placeholder={compText('adminColProdQuestionPkg')}
            value={newPairProdTitle}
            onChange={e => setNewPairProdTitle(e.target.value)}
          />
          <Input
            placeholder={compText('adminColCorpQuestionPkg')}
            value={newPairCorpTitle}
            onChange={e => setNewPairCorpTitle(e.target.value)}
          />
        </div>
      </Modal>

      {/* C阶段模型评分弹窗 */}
      <Modal
        open={Boolean(scoringMember)}
        title={compText('adminScoreModalTitle')}
        onCancel={() => setScoringMember(null)}
        onOk={() => {
          setScoringMember(null);
          message.success(compText('adminBtnSaveScore'));
        }}
      >
        {scoringMember ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <strong>{compText('checkinColPersonName')}：</strong>
              {scoringMember.name}
            </div>
            <div>
              <div style={{ marginBottom: 6 }}>
                {compText('subCProdTitle')} (0 ~ 45)：
              </div>
              <Select
                style={{ width: '100%', marginBottom: 8 }}
                value={PROD_CARBON_MODEL_OPTIONS_DESC[0].value}
                options={PROD_CARBON_MODEL_OPTIONS_DESC}
                disabled
              />
              <InputNumber
                min={0}
                max={45}
                step={0.5}
                style={{ width: '100%' }}
                value={memberScores[scoringMember.id]?.prod ?? 43.0}
                onChange={val => {
                  const num = Number(val ?? 0);
                  setMemberScores(prev => ({
                    ...prev,
                    [scoringMember.id]: {
                      prod: num,
                      corp: prev[scoringMember.id]?.corp ?? 42.0,
                    },
                  }));
                }}
              />
            </div>
            <div>
              <div style={{ marginBottom: 6 }}>
                {compText('subCCorpTitle')} (0 ~ 45)：
              </div>
              <Select
                style={{ width: '100%', marginBottom: 8 }}
                value={CORP_CARBON_MODEL_OPTIONS_DESC[0].value}
                options={CORP_CARBON_MODEL_OPTIONS_DESC}
                disabled
              />
              <InputNumber
                min={0}
                max={45}
                step={0.5}
                style={{ width: '100%' }}
                value={memberScores[scoringMember.id]?.corp ?? 42.0}
                onChange={val => {
                  const num = Number(val ?? 0);
                  setMemberScores(prev => ({
                    ...prev,
                    [scoringMember.id]: {
                      prod: prev[scoringMember.id]?.prod ?? 43.0,
                      corp: num,
                    },
                  }));
                }}
              />
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
