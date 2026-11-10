import { ArrowLeftOutlined, QrcodeOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { CompetitionAdminPage } from './CompetitionAdminPage';
import {
  FullMechanismModal,
  InviteLandingModal,
  SharePosterModal,
} from './CompetitionModals';
import { IntroPage } from './IntroPage';
import { RegisterPage } from './RegisterPage';
import { ResultAndCheckinPage } from './ResultAndCheckinPage';
import { SubmitPage } from './SubmitPage';
import style from './competition.module.less';
import { INITIAL_TEAM_MEMBERS, compText } from './data';
import type {
  CompetitionStagePhase,
  CompetitionTabKey,
  ParticipantRoleView,
  SubmissionItemStatus,
  TeamMemberRecord,
} from './data';

type CompetitionPageProps = {
  authenticated: boolean;
  onBackToWorkspace?: () => void;
  onRequireLogin: () => void;
};

const CompetitionPage = ({
  authenticated,
  onBackToWorkspace,
  onRequireLogin,
}: CompetitionPageProps) => {
  const history = useHistory();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTabParam = searchParams.get('compTab') as CompetitionTabKey;
  const inviterParam = searchParams.get('inviter') || '';

  const [activeTab, setActiveTab] = useState<CompetitionTabKey>(
    initialTabParam &&
      ['intro', 'register', 'submit', 'result', 'checkin', 'admin'].includes(
        initialTabParam,
      )
      ? initialTabParam
      : 'intro',
  );
  const [stagePhase, setStagePhase] =
    useState<CompetitionStagePhase>('PROD_CARBON');
  const [roleView, setRoleView] = useState<ParticipantRoleView>('ENT_LEADER');
  const [submitInitialModule, setSubmitInitialModule] = useState<
    'C' | 'R' | 'E' | 'O' | 'S'
  >('C');

  const [companyName, setCompanyName] = useState('绿源智造新能源科技有限公司');
  const [taxNo, setTaxNo] = useState('91310000MA1FL8892X');
  const [licenseUploaded, setLicenseUploaded] = useState(
    'business_license_verified.pdf',
  );
  const [logoUploaded, setLogoUploaded] = useState('enterprise_logo_hd.png');
  const [teamMembers, setTeamMembers] =
    useState<TeamMemberRecord[]>(INITIAL_TEAM_MEMBERS);
  const [teamLocked, setTeamLocked] = useState(false);

  const [individualName, setIndividualName] = useState('林立');
  const [individualPhone, setIndividualPhone] = useState('18602353734');
  const [inviteSuccessCount] = useState(1);

  const [mechanismOpen, setMechanismOpen] = useState(false);
  const [demoBarExpanded, setDemoBarExpanded] = useState(true);
  const [inviteLandingOpen, setInviteLandingOpen] = useState(
    Boolean(inviterParam),
  );
  const [posterState, setPosterState] = useState<{
    open: boolean;
    type: 'ENTERPRISE' | 'INDIVIDUAL';
  }>({
    open: false,
    type: 'ENTERPRISE',
  });

  useEffect(() => {
    if (inviterParam) {
      setInviteLandingOpen(true);
    }
  }, [inviterParam]);

  const syncTabToUrl = (nextTab: CompetitionTabKey) => {
    setActiveTab(nextTab);
    const nextSearch = new URLSearchParams(location.search);
    nextSearch.set('section', 'competition');
    nextSearch.set('compTab', nextTab);
    history.replace({
      pathname: location.pathname,
      search: `?${nextSearch.toString()}`,
    });
  };

  const handleGoRegister = () => {
    if (!authenticated) {
      onRequireLogin();
    }
    syncTabToUrl('register');
  };

  const handleUpdateEnterpriseInfo = (fields: {
    companyName?: string;
    taxNo?: string;
    licenseUploaded?: string;
    logoUploaded?: string;
  }) => {
    if (fields.companyName !== undefined) setCompanyName(fields.companyName);
    if (fields.taxNo !== undefined) setTaxNo(fields.taxNo);
    if (fields.licenseUploaded !== undefined)
      setLicenseUploaded(fields.licenseUploaded);
    if (fields.logoUploaded !== undefined) setLogoUploaded(fields.logoUploaded);
  };

  const handleUpdateMemberSubmission = (
    memberId: string,
    field: 'cProdStatus' | 'cCorpStatus',
    status: SubmissionItemStatus,
  ) => {
    setTeamMembers(prev =>
      prev.map(m => (m.id === memberId ? { ...m, [field]: status } : m)),
    );
  };

  const shareInviteUrl = `${
    window.location.origin + location.pathname
  }?section=competition&inviter=${encodeURIComponent(
    individualName || '林立',
  )}&teamId=TEAM-2026-08`;

  const extraTeamMemberBonus = Math.max(0, teamMembers.length - 5) * 2;
  const totalBonusPercent = Math.min(
    10,
    extraTeamMemberBonus + inviteSuccessCount * 2,
  );

  if (activeTab === 'admin') {
    return (
      <CompetitionAdminPage
        stagePhase={stagePhase}
        teamMembers={teamMembers}
        onStagePhaseChange={setStagePhase}
        onBackToFront={() => syncTabToUrl('intro')}
      />
    );
  }

  return (
    <div className={style.competitionShell}>
      {/* 顶部吸顶导航栏 */}
      <header className={style.stickyHeader}>
        <div className={style.headerLeft}>
          {onBackToWorkspace ? (
            <button
              type='button'
              className={style.backAgentBtn}
              title={compText('backToAgent')}
              aria-label={compText('backToAgent')}
              onClick={onBackToWorkspace}
            >
              <ArrowLeftOutlined />
            </button>
          ) : null}
          <div className={style.brandTitleWrap}>
            <span className={style.brandBadge}>Carbon Agent</span>
            <h1 className={style.brandTitle}>{compText('menuTitle')}</h1>
          </div>
        </div>

        <nav className={style.navTabs} aria-label={compText('menuTitle')}>
          {(
            [
              { key: 'intro', label: compText('navIntro') },
              { key: 'register', label: compText('navRegister') },
              { key: 'submit', label: compText('navSubmit') },
              { key: 'result', label: compText('navResult') },
            ] as Array<{ key: CompetitionTabKey; label: string }>
          ).map(tab => (
            <button
              key={tab.key}
              type='button'
              className={classNames(style.navTabBtn, {
                [style.navTabBtnActive]:
                  activeTab === tab.key ||
                  (tab.key === 'submit' && activeTab === 'checkin'),
              })}
              onClick={() => syncTabToUrl(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* 演示控制台：支持一键收起以预览 100% 纯净上线界面 */}
      {demoBarExpanded ? (
        <div className={style.demoControlBar}>
          <div className={style.demoControlGroup}>
            <span className={style.demoLabel}>{compText('demoBarLabel')}</span>
            {(
              [
                { key: 'PROD_CARBON', label: compText('demoStageOngoing') },
                { key: 'CORP_CARBON', label: compText('demoStageCorp') },
                { key: 'REG_CLOSED', label: compText('demoStageRegClosed') },
                { key: 'PRELIM_DONE', label: compText('demoStagePrelimDone') },
                { key: 'FINAL_DONE', label: compText('demoStageFinalDone') },
              ] as Array<{ key: CompetitionStagePhase; label: string }>
            ).map(item => (
              <button
                key={item.key}
                type='button'
                className={classNames(style.demoPill, {
                  [style.demoPillActive]: stagePhase === item.key,
                })}
                onClick={() => setStagePhase(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className={style.demoControlGroup}>
            {(
              [
                {
                  key: 'UNREGISTERED',
                  label: compText('demoRoleUnregistered'),
                },
                { key: 'ENT_AUDITING', label: compText('demoRoleAuditing') },
                { key: 'ENT_LEADER', label: compText('demoRoleLeader') },
                { key: 'ENT_MEMBER', label: compText('demoRoleMember') },
                { key: 'INDIVIDUAL', label: compText('demoRoleIndividual') },
              ] as Array<{ key: ParticipantRoleView; label: string }>
            ).map(role => (
              <button
                key={role.key}
                type='button'
                className={classNames(style.demoPill, {
                  [style.demoPillActive]: roleView === role.key,
                })}
                onClick={() => setRoleView(role.key)}
              >
                {role.label}
              </button>
            ))}
            <button
              type='button'
              className={style.demoPill}
              onClick={() => setInviteLandingOpen(true)}
            >
              {compText('demoOpenInvitePopup')}
            </button>
            <button
              type='button'
              className={style.demoPill}
              style={{
                background: '#04252b',
                color: '#5ce0b8',
                borderColor: '#026961',
              }}
              onClick={() => syncTabToUrl('admin')}
            >
              {compText('adminOpenEntryBtn')}
            </button>
            <button
              type='button'
              className={style.demoPill}
              onClick={() => setDemoBarExpanded(false)}
            >
              {compText('demoToggleHide')}
            </button>
          </div>
        </div>
      ) : (
        <button
          type='button'
          className={style.demoCollapsedFab}
          onClick={() => setDemoBarExpanded(true)}
        >
          {compText('demoToggleShow')}
        </button>
      )}

      {/* 主体内容区 */}
      {activeTab === 'intro' ? (
        <IntroPage
          stagePhase={stagePhase}
          onGoRegister={handleGoRegister}
          onOpenFullMechanism={() => setMechanismOpen(true)}
        />
      ) : null}

      {activeTab === 'register' ? (
        <RegisterPage
          stagePhase={stagePhase}
          roleView={roleView}
          companyName={companyName}
          taxNo={taxNo}
          licenseUploaded={licenseUploaded}
          logoUploaded={logoUploaded}
          teamMembers={teamMembers}
          teamLocked={teamLocked}
          individualName={individualName}
          individualPhone={individualPhone}
          inviteSuccessCount={inviteSuccessCount}
          shareInviteUrl={shareInviteUrl}
          onChangeRoleView={setRoleView}
          onUpdateEnterpriseInfo={handleUpdateEnterpriseInfo}
          onUpdateTeamMembers={setTeamMembers}
          onLockTeam={() => setTeamLocked(true)}
          onUpdateIndividual={fields => {
            if (fields.name !== undefined) setIndividualName(fields.name);
            if (fields.phone !== undefined) setIndividualPhone(fields.phone);
          }}
          onOpenFullMechanism={() => setMechanismOpen(true)}
        />
      ) : null}

      {activeTab === 'submit' ? (
        <SubmitPage
          stagePhase={stagePhase}
          roleView={roleView}
          teamMembers={teamMembers}
          initialModule={submitInitialModule}
          onGoRegister={() => syncTabToUrl('register')}
          onGoCheckinPublic={() => syncTabToUrl('checkin')}
          onUpdateMemberSubmission={handleUpdateMemberSubmission}
        />
      ) : null}

      {activeTab === 'result' || activeTab === 'checkin' ? (
        <ResultAndCheckinPage
          subView={activeTab === 'checkin' ? 'CHECKIN' : 'AWARDS'}
          stagePhase={stagePhase}
          roleView={roleView}
          onBackToEStage={() => {
            setSubmitInitialModule('E');
            syncTabToUrl('submit');
          }}
          onOpenPoster={type => setPosterState({ open: true, type })}
        />
      ) : null}

      {/* 所有页面通用底部：大赛交流群二维码 + 小助手二维码 */}
      <footer className={style.footerQrBar}>
        <div className={style.footerQrInner}>
          <div className={style.qrCard}>
            <div className={style.qrPlaceholder}>
              <QrcodeOutlined style={{ fontSize: 34, color: '#026961' }} />
              <span>{compText('footerQrGroupBadge')}</span>
            </div>
            <div>
              <h4 className={style.cardTitle} style={{ marginBottom: 4 }}>
                {compText('footerQrGroupTitle')}
              </h4>
              <p className={style.cardDesc}>{compText('footerQrGroupDesc')}</p>
            </div>
          </div>

          <div className={style.qrCard}>
            <div className={style.qrPlaceholder}>
              <QrcodeOutlined style={{ fontSize: 34, color: '#026961' }} />
              <span>{compText('footerQrAssistantBadge')}</span>
            </div>
            <div>
              <h4 className={style.cardTitle} style={{ marginBottom: 4 }}>
                {compText('footerQrAssistantTitle')}
              </h4>
              <p className={style.cardDesc}>
                {compText('footerQrAssistantDesc')}
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* 完整版大赛机制与免责声明弹窗 */}
      <FullMechanismModal
        open={mechanismOpen}
        onClose={() => setMechanismOpen(false)}
      />

      {/* 受邀人点开分享链接的迎宾弹窗 */}
      <InviteLandingModal
        open={inviteLandingOpen}
        inviterName={inviterParam || '林立'}
        inviterCompany={companyName}
        authenticated={authenticated}
        onCloseToIntro={() => {
          setInviteLandingOpen(false);
          syncTabToUrl('intro');
        }}
        onRequireLogin={onRequireLogin}
        onJoinExistingTeam={() => {
          setInviteLandingOpen(false);
          setRoleView('ENT_LEADER');
          syncTabToUrl('register');
        }}
        onStartOwnEntry={() => {
          setInviteLandingOpen(false);
          setRoleView('UNREGISTERED');
          syncTabToUrl('register');
        }}
      />

      {/* 企业/个人成绩与积分分享海报弹窗 */}
      <SharePosterModal
        open={posterState.open}
        posterType={posterState.type}
        subjectName={
          posterState.type === 'ENTERPRISE' ? companyName : individualName
        }
        rankText='NO.2 银奖入围'
        scoreText={posterState.type === 'ENTERPRISE' ? '94.87 分' : '102.06 分'}
        checkinPointsText={
          posterState.type === 'ENTERPRISE'
            ? '企业打卡总积分 18,900 分'
            : '个人打卡总积分 4,200 分'
        }
        bonusText={compText('inviteCurrentBonus', { bonus: totalBonusPercent })}
        shareUrl={shareInviteUrl}
        onClose={() => setPosterState(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
};

export default CompetitionPage;
