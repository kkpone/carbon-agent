import I18N from '@src/lang/I18N';
import type messages from '@src/lang/zh-CN/carbonCompetition';

export const compText = (
  key: keyof typeof messages,
  values?: Record<string, number | string>,
): string => {
  const raw = I18N.carbonCompetition[key];
  if (!values) {
    return raw;
  }
  return Object.entries(values).reduce(
    (acc, [k, v]) => acc.split(`{${k}}`).join(String(v)),
    raw,
  );
};

export type CompetitionTabKey =
  | 'intro'
  | 'register'
  | 'submit'
  | 'result'
  | 'checkin'
  | 'admin';

export type CompetitionStagePhase =
  | 'PROD_CARBON'
  | 'CORP_CARBON'
  | 'PRELIM_DONE'
  | 'FINAL_DONE'
  | 'REG_CLOSED';

export type ParticipantRoleView =
  | 'UNREGISTERED'
  | 'ENT_AUDITING'
  | 'ENT_LEADER'
  | 'ENT_MEMBER'
  | 'INDIVIDUAL';

export const maskPhoneNumber = (phone: string): string => {
  const trimmed = phone.trim();
  if (trimmed.length === 11) {
    return `${trimmed.slice(0, 3)}****${trimmed.slice(7)}`;
  }
  return trimmed;
};

export type SubmissionItemStatus = 'SUBMITTED' | 'PENDING' | 'UNREGISTERED';

export type TeamMemberRecord = {
  id: string;
  isLeader?: boolean;
  name: string;
  phone: string;
  registeredInAgent: boolean;
  inviterName?: string;
  cProdStatus: SubmissionItemStatus;
  cCorpStatus: SubmissionItemStatus;
  cProdUrl?: string;
  cCorpUrl?: string;
  cProdScore?: number;
  cCorpScore?: number;
};

export type InvitedPersonRecord = {
  id: string;
  name: string;
  maskedPhone: string;
  trackLabel: string;
  statusLabel: string;
  bonusText: string;
};

export type EnterpriseCheckinRow = {
  key: string;
  rank: number;
  enterpriseName: string;
  logoText: string;
  activeUsers: number;
  checkinTimes: number;
  totalPoints: number;
  eStageScore: number;
};

export type IndividualCheckinRow = {
  key: string;
  rank: number;
  personName: string;
  maskedPhone: string;
  trackTeamLabel: string;
  trackType: 'ENTERPRISE' | 'INDIVIDUAL';
  checkinDays: number;
  checkinTimes: number;
  totalPoints: number;
  eStageScore: number;
};

export type AwardWinnerRow = {
  key: string;
  awardLevel: string;
  badgeColor: 'gold' | 'silver' | 'bronze' | 'finalist' | 'special';
  name: string;
  trackOrCompany: string;
  cAvgOrScore: string;
  ePointsAndScore: string;
  bonusRateText: string;
  finalScoreText: string;
};

export const EXISTING_REGISTERED_ENTERPRISES = [
  '安踏体育用品集团有限公司',
  '安踏',
  '小鹏汽车',
  '比亚迪股份有限公司',
];

export const INITIAL_TEAM_MEMBERS: TeamMemberRecord[] = [
  {
    id: 'm-1',
    isLeader: true,
    name: '林立（组长）',
    phone: '18602353734',
    registeredInAgent: true,
    cProdStatus: 'SUBMITTED',
    cCorpStatus: 'PENDING',
    cProdUrl: 'https://agent.carbonstop.com/share/agent/pcf-model-2026-m1',
    cProdScore: 44.5,
    cCorpScore: 43.0,
  },
  {
    id: 'm-2',
    name: '陈思远',
    phone: '13810293847',
    registeredInAgent: true,
    cProdStatus: 'SUBMITTED',
    cCorpStatus: 'SUBMITTED',
    cProdUrl: 'https://agent.carbonstop.com/share/agent/pcf-model-2026-m2',
    cCorpUrl: 'https://agent.carbonstop.com/share/agent/eca-model-2026-m2',
    cProdScore: 43.0,
    cCorpScore: 42.5,
  },
  {
    id: 'm-3',
    name: '周晓雯',
    phone: '13928374651',
    registeredInAgent: true,
    inviterName: '林立',
    cProdStatus: 'PENDING',
    cCorpStatus: 'PENDING',
    cProdScore: 41.5,
    cCorpScore: 41.0,
  },
  {
    id: 'm-4',
    name: '王海涛',
    phone: '13765432198',
    registeredInAgent: false,
    cProdStatus: 'UNREGISTERED',
    cCorpStatus: 'UNREGISTERED',
  },
  {
    id: 'm-5',
    name: '赵敏',
    phone: '13598761234',
    registeredInAgent: true,
    inviterName: '陈思远',
    cProdStatus: 'SUBMITTED',
    cCorpStatus: 'PENDING',
    cProdUrl: 'https://agent.carbonstop.com/share/agent/pcf-model-2026-m5',
    cProdScore: 42.0,
    cCorpScore: 41.5,
  },
  {
    id: 'm-6',
    name: '孙明哲',
    phone: '13681920345',
    registeredInAgent: true,
    inviterName: '林立',
    cProdStatus: 'SUBMITTED',
    cCorpStatus: 'PENDING',
    cProdUrl: 'https://agent.carbonstop.com/share/agent/pcf-model-2026-m6',
    cProdScore: 43.5,
    cCorpScore: 42.0,
  },
];

export const INDIVIDUAL_INVITED_RECORDS: InvitedPersonRecord[] = [
  {
    id: 'inv-1',
    name: '张宇轩',
    maskedPhone: '138****5678',
    trackLabel: '个人组',
    statusLabel: '已注册并完成报名',
    bonusText: '+2%',
  },
  {
    id: 'inv-2',
    name: '李沐阳',
    maskedPhone: '139****2048',
    trackLabel: '个人组',
    statusLabel: '已注册并完成报名',
    bonusText: '+2%',
  },
  {
    id: 'inv-3',
    name: '陈佳怡',
    maskedPhone: '137****8821',
    trackLabel: '企业组（绿源智造）',
    statusLabel: '已注册并完成报名',
    bonusText: '+2%',
  },
];

export const ENTERPRISE_CHECKIN_PUBLIC_LIST: EnterpriseCheckinRow[] = [
  {
    key: 'ent-1',
    rank: 1,
    enterpriseName: '国轩高科股份有限公司',
    logoText: '国轩',
    activeUsers: 186,
    checkinTimes: 2420,
    totalPoints: 24200,
    eStageScore: 20.0,
  },
  {
    key: 'ent-2',
    rank: 2,
    enterpriseName: '绿源智造新能源科技有限公司（本企业）',
    logoText: '绿源',
    activeUsers: 142,
    checkinTimes: 1890,
    totalPoints: 18900,
    eStageScore: 19.2,
  },
  {
    key: 'ent-3',
    rank: 3,
    enterpriseName: '安踏体育用品集团有限公司',
    logoText: '安踏',
    activeUsers: 128,
    checkinTimes: 1650,
    totalPoints: 16500,
    eStageScore: 18.6,
  },
  {
    key: 'ent-4',
    rank: 4,
    enterpriseName: '小鹏汽车科技有限公司',
    logoText: '小鹏',
    activeUsers: 104,
    checkinTimes: 1320,
    totalPoints: 13200,
    eStageScore: 17.8,
  },
  {
    key: 'ent-5',
    rank: 5,
    enterpriseName: '得力集团有限公司',
    logoText: '得力',
    activeUsers: 92,
    checkinTimes: 1140,
    totalPoints: 11400,
    eStageScore: 17.0,
  },
  {
    key: 'ent-6',
    rank: 6,
    enterpriseName: '内蒙古蒙牛乳业（集团）股份有限公司',
    logoText: '蒙牛',
    activeUsers: 85,
    checkinTimes: 980,
    totalPoints: 9800,
    eStageScore: 16.5,
  },
  {
    key: 'ent-7',
    rank: 7,
    enterpriseName: '蜜雪冰城股份有限公司',
    logoText: '蜜雪',
    activeUsers: 76,
    checkinTimes: 860,
    totalPoints: 8600,
    eStageScore: 15.8,
  },
  {
    key: 'ent-8',
    rank: 8,
    enterpriseName: '达能（中国）食品饮料有限公司',
    logoText: '达能',
    activeUsers: 64,
    checkinTimes: 720,
    totalPoints: 7200,
    eStageScore: 15.0,
  },
];

export const INDIVIDUAL_CHECKIN_PUBLIC_LIST: IndividualCheckinRow[] = [
  {
    key: 'ind-1',
    rank: 1,
    personName: '张宇轩',
    maskedPhone: '138****5678',
    trackTeamLabel: '个人组 · 清华大学环境学院',
    trackType: 'INDIVIDUAL',
    checkinDays: 15,
    checkinTimes: 45,
    totalPoints: 4500,
    eStageScore: 20.0,
  },
  {
    key: 'ind-2',
    rank: 2,
    personName: '林立（我）',
    maskedPhone: '186****3734',
    trackTeamLabel: '企业组 · 绿源智造新能源科技',
    trackType: 'ENTERPRISE',
    checkinDays: 14,
    checkinTimes: 42,
    totalPoints: 4200,
    eStageScore: 19.5,
  },
  {
    key: 'ind-3',
    rank: 3,
    personName: '李沐阳',
    maskedPhone: '139****2048',
    trackTeamLabel: '个人组 · 独立碳管理咨询师',
    trackType: 'INDIVIDUAL',
    checkinDays: 14,
    checkinTimes: 40,
    totalPoints: 4000,
    eStageScore: 19.0,
  },
  {
    key: 'ind-4',
    rank: 4,
    personName: '陈思远',
    maskedPhone: '138****3847',
    trackTeamLabel: '企业组 · 绿源智造新能源科技',
    trackType: 'ENTERPRISE',
    checkinDays: 13,
    checkinTimes: 38,
    totalPoints: 3800,
    eStageScore: 18.6,
  },
  {
    key: 'ind-5',
    rank: 5,
    personName: '王语桐',
    maskedPhone: '137****9102',
    trackTeamLabel: '个人组 · 复旦大学可持续发展研究中心',
    trackType: 'INDIVIDUAL',
    checkinDays: 13,
    checkinTimes: 36,
    totalPoints: 3600,
    eStageScore: 18.2,
  },
  {
    key: 'ind-6',
    rank: 6,
    personName: '宋佳琪',
    maskedPhone: '135****4419',
    trackTeamLabel: '企业组 · 国轩高科股份有限公司',
    trackType: 'ENTERPRISE',
    checkinDays: 12,
    checkinTimes: 34,
    totalPoints: 3400,
    eStageScore: 17.8,
  },
  {
    key: 'ind-7',
    rank: 7,
    personName: '何俊杰',
    maskedPhone: '150****7781',
    trackTeamLabel: '个人组 · 绿色供应链研究员',
    trackType: 'INDIVIDUAL',
    checkinDays: 12,
    checkinTimes: 31,
    totalPoints: 3100,
    eStageScore: 17.2,
  },
];

export const ENTERPRISE_AWARD_WINNERS: AwardWinnerRow[] = [
  {
    key: 'ea-1',
    awardLevel: '金奖 (1名)',
    badgeColor: 'gold',
    name: '国轩高科股份有限公司',
    trackOrCompany: '企业赛 · 10人满编战队',
    cAvgOrScore: 'C均分 76.5 / 决赛评委分 91.0',
    ePointsAndScore: '企业积分 24,200 (E项 20.0分)',
    bonusRateText: '+10% (10人满额加成)',
    finalScoreText: '100.10 分',
  },
  {
    key: 'ea-2',
    awardLevel: '银奖 (2名)',
    badgeColor: 'silver',
    name: '绿源智造新能源科技有限公司',
    trackOrCompany: '企业赛 · 8人战队',
    cAvgOrScore: 'C均分 75.2 / 决赛评委分 89.5',
    ePointsAndScore: '企业积分 18,900 (E项 19.2分)',
    bonusRateText: '+6% (第6~8人加成)',
    finalScoreText: '94.87 分',
  },
  {
    key: 'ea-3',
    awardLevel: '银奖 (2名)',
    badgeColor: 'silver',
    name: '安踏体育用品集团有限公司',
    trackOrCompany: '企业赛 · 7人战队',
    cAvgOrScore: 'C均分 74.8 / 决赛评委分 88.0',
    ePointsAndScore: '企业积分 16,500 (E项 18.6分)',
    bonusRateText: '+4% (第6~7人加成)',
    finalScoreText: '91.52 分',
  },
  {
    key: 'ea-4',
    awardLevel: '铜奖 (3名)',
    badgeColor: 'bronze',
    name: '小鹏汽车科技有限公司',
    trackOrCompany: '企业赛 · 6人战队',
    cAvgOrScore: 'C均分 73.5 / 决赛评委分 86.5',
    ePointsAndScore: '企业积分 13,200 (E项 17.8分)',
    bonusRateText: '+2% (第6人加成)',
    finalScoreText: '88.23 分',
  },
  {
    key: 'ea-5',
    awardLevel: '铜奖 (3名)',
    badgeColor: 'bronze',
    name: '得力集团有限公司',
    trackOrCompany: '企业赛 · 5人战队',
    cAvgOrScore: 'C均分 72.9 / 决赛评委分 86.0',
    ePointsAndScore: '企业积分 11,400 (E项 17.0分)',
    bonusRateText: '+0%',
    finalScoreText: '86.00 分',
  },
  {
    key: 'ea-6',
    awardLevel: '铜奖 (3名)',
    badgeColor: 'bronze',
    name: '内蒙古蒙牛乳业（集团）股份有限公司',
    trackOrCompany: '企业赛 · 5人战队',
    cAvgOrScore: 'C均分 72.0 / 决赛评委分 85.2',
    ePointsAndScore: '企业积分 9,800 (E项 16.5分)',
    bonusRateText: '+0%',
    finalScoreText: '85.20 分',
  },
];

export const INDIVIDUAL_AWARD_WINNERS: AwardWinnerRow[] = [
  {
    key: 'ia-1',
    awardLevel: '金奖 (1名)',
    badgeColor: 'gold',
    name: '张宇轩 (138****5678)',
    trackOrCompany: '个人赛 · 高校与科研组',
    cAvgOrScore: 'C阶段总分 77.5',
    ePointsAndScore: '个人积分 4,500 (E项 20.0分)',
    bonusRateText: '+10% (成功邀5人参赛)',
    finalScoreText: '107.25 分',
  },
  {
    key: 'ia-2',
    awardLevel: '银奖 (2名)',
    badgeColor: 'silver',
    name: '李沐阳 (139****2048)',
    trackOrCompany: '个人赛 · 碳咨询从业者',
    cAvgOrScore: 'C阶段总分 75.5',
    ePointsAndScore: '个人积分 4,000 (E项 19.0分)',
    bonusRateText: '+8% (成功邀4人参赛)',
    finalScoreText: '102.06 分',
  },
  {
    key: 'ia-3',
    awardLevel: '银奖 (2名)',
    badgeColor: 'silver',
    name: '王语桐 (137****9102)',
    trackOrCompany: '个人赛 · 高校与科研组',
    cAvgOrScore: 'C阶段总分 74.0',
    ePointsAndScore: '个人积分 3,600 (E项 18.2分)',
    bonusRateText: '+6% (成功邀3人参赛)',
    finalScoreText: '97.73 分',
  },
  {
    key: 'ia-4',
    awardLevel: '铜奖 (3名)',
    badgeColor: 'bronze',
    name: '何俊杰 (150****7781)',
    trackOrCompany: '个人赛 · 社会个人选手',
    cAvgOrScore: 'C阶段总分 72.5',
    ePointsAndScore: '个人积分 3,100 (E项 17.2分)',
    bonusRateText: '+4% (成功邀2人参赛)',
    finalScoreText: '93.29 分',
  },
  {
    key: 'ia-5',
    awardLevel: '铜奖 (3名)',
    badgeColor: 'bronze',
    name: '刘思琪 (185****6610)',
    trackOrCompany: '个人赛 · 碳咨询从业者',
    cAvgOrScore: 'C阶段总分 71.8',
    ePointsAndScore: '个人积分 2,950 (E项 16.8分)',
    bonusRateText: '+2% (成功邀1人参赛)',
    finalScoreText: '90.37 分',
  },
  {
    key: 'ia-6',
    awardLevel: '铜奖 (3名)',
    badgeColor: 'bronze',
    name: '赵子豪 (158****3309)',
    trackOrCompany: '个人赛 · 高校与科研组',
    cAvgOrScore: 'C阶段总分 71.0',
    ePointsAndScore: '个人积分 2,800 (E项 16.5分)',
    bonusRateText: '+0%',
    finalScoreText: '87.50 分',
  },
];

export const SPECIAL_AWARD_WINNERS: AwardWinnerRow[] = [
  {
    key: 'sa-1',
    awardLevel: '最佳价值链带动奖',
    badgeColor: 'special',
    name: '国轩高科股份有限公司',
    trackOrCompany: '带动 186 名员工与上下游伙伴参与碳账户打卡',
    cAvgOrScore: '—',
    ePointsAndScore: '企业打卡总积分 24,200 分',
    bonusRateText: '+10%',
    finalScoreText: '单项最高荣誉',
  },
  {
    key: 'sa-2',
    awardLevel: '最佳低碳传播案例奖',
    badgeColor: 'special',
    name: '安踏体育用品集团有限公司',
    trackOrCompany: 'S阶段披露与全渠道消费者低碳传播示范案例',
    cAvgOrScore: '—',
    ePointsAndScore: '企业打卡总积分 16,500 分',
    bonusRateText: '+4%',
    finalScoreText: '单项最高荣誉',
  },
  {
    key: 'sa-3',
    awardLevel: '个人低碳打卡先锋奖',
    badgeColor: 'special',
    name: '张宇轩 (138****5678)',
    trackOrCompany: '连续 15 天满勤低碳打卡，带动 5 位好友参赛',
    cAvgOrScore: '—',
    ePointsAndScore: '个人打卡总积分 4,500 分',
    bonusRateText: '+10%',
    finalScoreText: '单项最高荣誉',
  },
];

export type AccountingModelOption = {
  value: string;
  label: string;
  createdAt: string;
};

// 按创建时间倒序排列（最新创建的核算模型在最上方）
export const PROD_CARBON_MODEL_OPTIONS_DESC: AccountingModelOption[] = [
  {
    value: 'https://agent.carbonstop.com/share/agent/pcf-model-2026-pair08-v3',
    label:
      '【最新】高能量密度锂离子动力电池包 1kWh 产品碳足迹核算模型 V3.0（2026-11-26 16:40）',
    createdAt: '2026-11-26 16:40',
  },
  {
    value: 'https://agent.carbonstop.com/share/agent/pcf-model-2026-pair08-v2',
    label:
      '高能量密度锂离子动力电池包 1kWh 产品碳足迹核算模型 V2.0（2026-11-24 11:15）',
    createdAt: '2026-11-24 11:15',
  },
  {
    value: 'https://agent.carbonstop.com/share/agent/pcf-model-2026-pair08-v1',
    label:
      '高能量密度锂离子动力电池包 1kWh 产品碳足迹核算模型 V1.0（2026-11-22 09:30）',
    createdAt: '2026-11-22 09:30',
  },
];

export const CORP_CARBON_MODEL_OPTIONS_DESC: AccountingModelOption[] = [
  {
    value: 'https://agent.carbonstop.com/share/agent/eca-model-2026-pair08-v3',
    label:
      '【最新】绿源智造 2025 年度企业温室气体盘查（范围一+二+三）核算模型 V3.0（2026-12-03 18:20）',
    createdAt: '2026-12-03 18:20',
  },
  {
    value: 'https://agent.carbonstop.com/share/agent/eca-model-2026-pair08-v2',
    label:
      '绿源智造 2025 年度企业温室气体盘查（范围一+二+三）核算模型 V2.0（2026-12-01 14:50）',
    createdAt: '2026-12-01 14:50',
  },
  {
    value: 'https://agent.carbonstop.com/share/agent/eca-model-2026-pair08-v1',
    label:
      '绿源智造 2025 年度企业温室气体盘查（范围一+二）初版核算模型 V1.0（2026-11-30 10:05）',
    createdAt: '2026-11-30 10:05',
  },
];

export type AdminEnterpriseAuditItem = {
  id: string;
  applyTime: string;
  enterpriseName: string;
  creditCode: string;
  leaderName: string;
  leaderPhone: string;
  licenseFileName: string;
  logoFileName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectReason?: string;
};

export const ADMIN_AUDIT_INITIAL_LIST: AdminEnterpriseAuditItem[] = [
  {
    id: 'aud-1',
    applyTime: '2026-11-18 14:25',
    enterpriseName: '绿源智造新能源科技有限公司',
    creditCode: '91310000MA1FL88X9B',
    leaderName: '林立',
    leaderPhone: '18602353734',
    licenseFileName: '绿源智造_营业执照副本(加盖公章).pdf',
    logoFileName: '绿源智造_品牌Logo高清版.png',
    status: 'APPROVED',
  },
  {
    id: 'aud-2',
    applyTime: '2026-11-19 09:42',
    enterpriseName: '远景动力电池系统（江苏）有限公司',
    creditCode: '91320214MA1W902K31',
    leaderName: '周远航',
    leaderPhone: '13918273645',
    licenseFileName: '远景动力_营业执照扫描件.jpg',
    logoFileName: 'EnvisionAESC_Logo.png',
    status: 'PENDING',
  },
  {
    id: 'aud-3',
    applyTime: '2026-11-19 11:10',
    enterpriseName: '正泰新能科技股份有限公司',
    creditCode: '91330481MA2JE81X76',
    leaderName: '徐文博',
    leaderPhone: '13709182736',
    licenseFileName: '正泰新能_营业执照2026.pdf',
    logoFileName: 'ASTRONERGY_Logo.png',
    status: 'PENDING',
  },
  {
    id: 'aud-4',
    applyTime: '2026-11-17 16:08',
    enterpriseName: '国轩高科股份有限公司',
    creditCode: '9134010079009821X4',
    leaderName: '宋佳琪',
    leaderPhone: '13588214419',
    licenseFileName: '国轩高科_营业执照.pdf',
    logoFileName: 'Gotion_Logo.png',
    status: 'APPROVED',
  },
  {
    id: 'aud-5',
    applyTime: '2026-11-16 10:30',
    enterpriseName: '某未盖章测试商贸有限公司',
    creditCode: '91110105MA01X9920Q',
    leaderName: '赵测试',
    leaderPhone: '15810029938',
    licenseFileName: '未清晰扫描件.jpg',
    logoFileName: 'test_logo.png',
    status: 'REJECTED',
    rejectReason:
      '上传的营业执照复印件模糊且未体现最新年检信息，请重新上传清晰原件扫描件。',
  },
];

export type AdminQuestionPairItem = {
  id: string;
  pairCode: string;
  industry: string;
  prodQuestionTitle: string;
  prodFileName: string;
  prodOpenTime: string;
  corpQuestionTitle: string;
  corpFileName: string;
  corpOpenTime: string;
  assignedCount: number;
  statusText: string;
};

export const ADMIN_QUESTION_PAIR_LIST: AdminQuestionPairItem[] = [
  {
    id: 'qp-1',
    pairCode: 'PAIR-2026-01',
    industry: '新能源与动力电池制造',
    prodQuestionTitle: '高能量密度锂离子动力电池包（1kWh）产品碳足迹核算',
    prodFileName: 'PCF_Pair01_LithiumBattery.zip',
    prodOpenTime: '2026-11-20 16:00',
    corpQuestionTitle: '动力电池制造基地 2025 年度范围一+二+三温室气体盘查',
    corpFileName: 'ECA_Pair01_BatteryPlant.zip',
    corpOpenTime: '2026-11-30 00:00',
    assignedCount: 42,
    statusText: '已开放下载',
  },
  {
    id: 'qp-2',
    pairCode: 'PAIR-2026-02',
    industry: '食品饮料与乳制品加工',
    prodQuestionTitle: '有机纯牛奶（250mL利乐砖）全生命周期碳足迹核算',
    prodFileName: 'PCF_Pair02_OrganicMilk.zip',
    prodOpenTime: '2026-11-20 16:00',
    corpQuestionTitle: '大型乳品加工企业全价值链温室气体盘查与热点识别',
    corpFileName: 'ECA_Pair02_DairyCorp.zip',
    corpOpenTime: '2026-11-30 00:00',
    assignedCount: 36,
    statusText: '已开放下载',
  },
  {
    id: 'qp-3',
    pairCode: 'PAIR-2026-03',
    industry: '纺织服装与运动鞋服',
    prodQuestionTitle: '再生聚酯纤维低碳竞速跑鞋（1双）产品碳足迹核算',
    prodFileName: 'PCF_Pair03_RunningShoes.zip',
    prodOpenTime: '2026-11-20 16:00',
    corpQuestionTitle: '运动服饰品牌总部及供应链工厂年度组织碳盘查',
    corpFileName: 'ECA_Pair03_ApparelCorp.zip',
    corpOpenTime: '2026-11-30 00:00',
    assignedCount: 29,
    statusText: '已开放下载',
  },
  {
    id: 'qp-4',
    pairCode: 'PAIR-2026-04',
    industry: '新能源汽车整车与零部件',
    prodQuestionTitle: '智能纯电轿跑铝合金一体化压铸后底板产品碳足迹核算',
    prodFileName: 'PCF_Pair04_AutoCasting.zip',
    prodOpenTime: '2026-11-20 16:00',
    corpQuestionTitle: '智能电动汽车制造工厂年度温室气体盘查',
    corpFileName: 'ECA_Pair04_EVFactory.zip',
    corpOpenTime: '2026-11-30 00:00',
    assignedCount: 31,
    statusText: '已开放下载',
  },
];

export type AdminRosFinalReviewItem = {
  id: string;
  enterpriseName: string;
  leaderName: string;
  memberCount: number;
  rDocName: string;
  oDocName: string;
  sDocName: string;
  rScore: number;
  oScore: number;
  sScore: number;
  defenseScore: number;
  bonusRate: number;
};

export const ADMIN_ROS_FINAL_REVIEW_LIST: AdminRosFinalReviewItem[] = [
  {
    id: 'ros-1',
    enterpriseName: '国轩高科股份有限公司',
    leaderName: '宋佳琪',
    memberCount: 10,
    rDocName: '国轩高科_R阶段科学减排路线图与绿电替代方案.pdf',
    oDocName: '国轩高科_O阶段高质量碳信用筛选与中和路径.pdf',
    sDocName: '国轩高科_S阶段低碳产品传播与供应链赋能案例.pptx',
    rScore: 32.5,
    oScore: 18.5,
    sScore: 19.0,
    defenseScore: 21.0,
    bonusRate: 10,
  },
  {
    id: 'ros-2',
    enterpriseName: '绿源智造新能源科技有限公司',
    leaderName: '林立',
    memberCount: 6,
    rDocName: '绿源智造_R阶段极片涂布余热回收减排方案.pdf',
    oDocName: '绿源智造_O阶段VCS林业碳汇抵消配置说明.pdf',
    sDocName: '绿源智造_S阶段零碳电池护照披露实践.pptx',
    rScore: 31.8,
    oScore: 18.2,
    sScore: 18.5,
    defenseScore: 21.0,
    bonusRate: 2,
  },
  {
    id: 'ros-3',
    enterpriseName: '安踏体育用品集团有限公司',
    leaderName: '陈志强',
    memberCount: 7,
    rDocName: '安踏集团_R阶段生物基材料替代与染整节能方案.pdf',
    oDocName: '安踏集团_O阶段碳中和门店抵消方案.pdf',
    sDocName: '安踏集团_S阶段面向亿级消费者的低碳标签传播.pptx',
    rScore: 31.0,
    oScore: 18.0,
    sScore: 19.2,
    defenseScore: 19.8,
    bonusRate: 4,
  },
];
