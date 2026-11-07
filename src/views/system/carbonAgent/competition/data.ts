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
  | 'checkin';

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

export type SubmissionItemStatus = 'SUBMITTED' | 'PENDING' | 'UNREGISTERED';

export type TeamMemberRecord = {
  id: string;
  isLeader?: boolean;
  name: string;
  phone: string;
  registeredInAgent: boolean;
  cProdStatus: SubmissionItemStatus;
  cCorpStatus: SubmissionItemStatus;
  cProdScore?: number;
  cCorpScore?: number;
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
    cProdScore: 43.0,
    cCorpScore: 42.5,
  },
  {
    id: 'm-3',
    name: '周晓雯',
    phone: '13928374651',
    registeredInAgent: true,
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
    cProdStatus: 'SUBMITTED',
    cCorpStatus: 'PENDING',
    cProdScore: 42.0,
    cCorpScore: 41.5,
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
