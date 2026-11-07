import {
  CheckCircleFilled,
  CopyOutlined,
  FireFilled,
  QrcodeOutlined,
  TeamOutlined,
  TrophyFilled,
  UserAddOutlined,
} from '@ant-design/icons';
import { copyToClipboard } from '@src/utils/clipboard';
import { Button, Modal, Tag, message } from 'antd';
import { useState } from 'react';

import style from './competition.module.less';
import { compText } from './data';

type WelcomePromoModalProps = {
  open: boolean;
  onClose: () => void;
  onJoinCompetition: () => void;
};

export const CompetitionWelcomePromoModal = ({
  open,
  onClose,
  onJoinCompetition,
}: WelcomePromoModalProps) => (
  <Modal
    open={open}
    centered
    width={540}
    footer={null}
    onCancel={onClose}
    destroyOnClose
  >
    <div className={style.posterCard} style={{ margin: '-20px -24px' }}>
      <div className={style.heroKicker}>
        <FireFilled />
        <span>{compText('welcomePopupBadge')}</span>
      </div>
      <h2
        style={{
          color: '#fff',
          fontSize: 26,
          fontWeight: 800,
          margin: '4px 0 12px',
        }}
      >
        {compText('welcomePopupTitle')}
      </h2>
      <p
        style={{
          color: 'rgba(255,255,255,0.86)',
          fontSize: 14,
          lineHeight: 1.75,
          marginBottom: 24,
        }}
      >
        {compText('welcomePopupDesc')}
      </p>
      <div className={style.heroCtaRow}>
        <button
          type='button'
          className={style.heroPrimaryBtn}
          onClick={onJoinCompetition}
        >
          {compText('welcomePopupJoinBtn')}
        </button>
        <button
          type='button'
          className={style.heroSecondaryBtn}
          onClick={onClose}
        >
          {compText('welcomePopupLaterBtn')}
        </button>
      </div>
    </div>
  </Modal>
);

type InviteLandingModalProps = {
  open: boolean;
  inviterName: string;
  inviterCompany: string;
  authenticated: boolean;
  onCloseToIntro: () => void;
  onRequireLogin: () => void;
  onJoinExistingTeam: () => void;
  onStartOwnEntry: () => void;
};

export const InviteLandingModal = ({
  open,
  inviterName,
  inviterCompany,
  authenticated,
  onCloseToIntro,
  onRequireLogin,
  onJoinExistingTeam,
  onStartOwnEntry,
}: InviteLandingModalProps) => {
  const [step, setStep] = useState<'WELCOME' | 'CHOOSE_MODE' | 'CONFIRM_TEAM'>(
    'WELCOME',
  );

  const handleClose = () => {
    setStep('WELCOME');
    onCloseToIntro();
  };

  const handleJoinClick = () => {
    if (!authenticated) {
      onRequireLogin();
    }
    setStep('CHOOSE_MODE');
  };

  return (
    <Modal
      open={open}
      centered
      width={560}
      footer={null}
      onCancel={handleClose}
      destroyOnClose
    >
      {step === 'WELCOME' ? (
        <div style={{ padding: '8px 4px', textAlign: 'center' }}>
          <Tag color='green' style={{ marginBottom: 12 }}>
            {compText('heroBadge')}
          </Tag>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: '#04252b' }}>
            {compText('inviteModalTitle', { inviter: inviterName })}
          </h3>
          <p
            style={{
              color: '#53565a',
              fontSize: 14,
              lineHeight: 1.7,
              margin: '12px 0 24px',
            }}
          >
            {compText('inviteModalDesc')}
          </p>
          <div className={style.heroCtaRow}>
            <Button
              type='primary'
              size='large'
              style={{
                background: '#026961',
                borderColor: '#026961',
                borderRadius: 999,
                paddingInline: 32,
              }}
              onClick={handleJoinClick}
            >
              {compText('inviteModalJoinNow')}
            </Button>
            <Button
              size='large'
              style={{ borderRadius: 999, paddingInline: 28 }}
              onClick={handleClose}
            >
              {compText('inviteModalThinkAgain')}
            </Button>
          </div>
        </div>
      ) : null}

      {step === 'CHOOSE_MODE' ? (
        <div style={{ padding: '8px 4px' }}>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#04252b',
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            {compText('inviteJoinModeTitle')}
          </h3>
          <div className={style.grid2}>
            <div
              className={style.trackCard}
              style={{ cursor: 'pointer', padding: 20 }}
              onClick={() => setStep('CONFIRM_TEAM')}
            >
              <TeamOutlined
                style={{ fontSize: 28, color: '#026961', marginBottom: 10 }}
              />
              <h4 className={style.cardTitle}>
                {compText('inviteJoinExistingTeam')}
              </h4>
              <p className={style.cardDesc}>
                {compText('inviteJoinExistingTeamDesc')}
              </p>
            </div>
            <div
              className={style.trackCard}
              style={{ cursor: 'pointer', padding: 20 }}
              onClick={() => {
                setStep('WELCOME');
                onStartOwnEntry();
              }}
            >
              <UserAddOutlined
                style={{ fontSize: 28, color: '#09c199', marginBottom: 10 }}
              />
              <h4 className={style.cardTitle}>{compText('inviteStartNew')}</h4>
              <p className={style.cardDesc}>{compText('inviteStartNewDesc')}</p>
            </div>
          </div>
        </div>
      ) : null}

      {step === 'CONFIRM_TEAM' ? (
        <div style={{ padding: '12px 8px', textAlign: 'center' }}>
          <CheckCircleFilled
            style={{ fontSize: 40, color: '#09c199', marginBottom: 12 }}
          />
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#04252b' }}>
            {compText('inviteEmployeeWarning', { company: inviterCompany })}
          </h3>
          <p style={{ color: '#6c757d', fontSize: 13, margin: '10px 0 24px' }}>
            {compText('regTeamCompanyRuleTip')}
          </p>
          <div className={style.heroCtaRow}>
            <Button
              type='primary'
              size='large'
              style={{
                background: '#026961',
                borderColor: '#026961',
                borderRadius: 999,
                paddingInline: 32,
              }}
              onClick={() => {
                setStep('WELCOME');
                onJoinExistingTeam();
              }}
            >
              {compText('inviteConfirmJoinTeam')}
            </Button>
            <Button
              size='large'
              style={{ borderRadius: 999 }}
              onClick={() => setStep('CHOOSE_MODE')}
            >
              {compText('inviteModalThinkAgain')}
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

type FullMechanismModalProps = {
  open: boolean;
  onClose: () => void;
};

export const FullMechanismModal = ({
  open,
  onClose,
}: FullMechanismModalProps) => (
  <Modal
    title={compText('fullRuleModalTitle')}
    open={open}
    width={760}
    onCancel={onClose}
    footer={[
      <Button
        key='ok'
        type='primary'
        style={{ background: '#026961', borderColor: '#026961' }}
        onClick={onClose}
      >
        {compText('inviteConfirmJoinTeam')}
      </Button>,
    ]}
  >
    <div style={{ maxHeight: '62vh', overflowY: 'auto', paddingRight: 8 }}>
      {[
        {
          title: compText('fullRuleSec1Title'),
          body: compText('fullRuleSec1Body'),
        },
        {
          title: compText('fullRuleSec2Title'),
          body: compText('fullRuleSec2Body'),
        },
        {
          title: compText('fullRuleSec3Title'),
          body: compText('fullRuleSec3Body'),
        },
        {
          title: compText('fullRuleSec4Title'),
          body: compText('fullRuleSec4Body'),
        },
        {
          title: compText('fullRuleSec5Title'),
          body: compText('fullRuleSec5Body'),
        },
      ].map(sec => (
        <div key={sec.title} style={{ marginBottom: 18 }}>
          <h4
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#004541',
              marginBottom: 6,
            }}
          >
            {sec.title}
          </h4>
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.75,
              color: '#343a40',
              margin: 0,
            }}
          >
            {sec.body}
          </p>
        </div>
      ))}
    </div>
  </Modal>
);

type SharePosterModalProps = {
  open: boolean;
  posterType: 'ENTERPRISE' | 'INDIVIDUAL';
  subjectName: string;
  rankText: string;
  scoreText: string;
  checkinPointsText: string;
  bonusText: string;
  shareUrl: string;
  onClose: () => void;
};

export const SharePosterModal = ({
  open,
  posterType,
  subjectName,
  rankText,
  scoreText,
  checkinPointsText,
  bonusText,
  shareUrl,
  onClose,
}: SharePosterModalProps) => {
  const handleCopyShareLink = () => {
    copyToClipboard(shareUrl)
      .then(() => {
        message.success(compText('inviteCopySuccess'));
      })
      .catch(() => {
        message.error(shareUrl);
      });
  };

  return (
    <Modal
      title={compText('posterModalTitle')}
      open={open}
      centered
      width={480}
      footer={null}
      onCancel={onClose}
    >
      <div className={style.posterCard}>
        <div className={style.heroKicker}>
          <TrophyFilled />
          <span>
            {posterType === 'ENTERPRISE'
              ? compText('resEnterpriseGroup')
              : compText('resIndividualGroup')}
          </span>
        </div>
        <h3
          style={{
            color: '#fff',
            fontSize: 22,
            fontWeight: 800,
            margin: '4px 0 6px',
          }}
        >
          {compText('heroTitle')}
        </h3>
        <p style={{ color: '#86efb5', fontSize: 13, marginBottom: 18 }}>
          {compText('heroBadge')}
        </p>

        <div
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(134,239,181,0.35)',
            borderRadius: 14,
            padding: '18px 16px',
            marginBottom: 18,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
            {subjectName}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#86efb5',
              margin: '8px 0',
            }}
          >
            {rankText} · {scoreText}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.88)' }}>
            {checkinPointsText} | {bonusText}
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            color: '#04252b',
            borderRadius: 12,
            padding: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            textAlign: 'left',
          }}
        >
          <div className={style.qrPlaceholder}>
            <QrcodeOutlined style={{ fontSize: 34, color: '#026961' }} />
            <span>Carbon Agent</span>
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.6, color: '#343a40' }}>
            <strong>{compText('heroTitle')}</strong>
            <div>{compText('posterScanTip')}</div>
          </div>
        </div>

        <Button
          icon={<CopyOutlined />}
          size='large'
          style={{
            marginTop: 18,
            width: '100%',
            borderRadius: 999,
            fontWeight: 700,
            background: '#86efb5',
            borderColor: '#86efb5',
            color: '#04252b',
          }}
          onClick={handleCopyShareLink}
        >
          {compText('posterCopyShareLinkBtn')}
        </Button>
      </div>
    </Modal>
  );
};

type CheckinCoreRuleModalProps = {
  open: boolean;
  onClose: () => void;
};

export const CheckinCoreRuleModal = ({
  open,
  onClose,
}: CheckinCoreRuleModalProps) => (
  <Modal
    title={compText('checkinRuleModalTitle')}
    open={open}
    width={640}
    onCancel={onClose}
    footer={[
      <Button
        key='ok'
        type='primary'
        style={{ background: '#026961', borderColor: '#026961' }}
        onClick={onClose}
      >
        {compText('inviteConfirmJoinTeam')}
      </Button>,
    ]}
  >
    <div style={{ padding: '4px 0' }}>
      {[
        {
          title: compText('checkinRuleSec1Title'),
          body: compText('checkinRuleSec1Body'),
        },
        {
          title: compText('checkinRuleSec2Title'),
          body: compText('checkinRuleSec2Body'),
        },
        {
          title: compText('checkinRuleSec3Title'),
          body: compText('checkinRuleSec3Body'),
        },
      ].map(sec => (
        <div key={sec.title} style={{ marginBottom: 16 }}>
          <h4
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#004541',
              marginBottom: 6,
            }}
          >
            {sec.title}
          </h4>
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.75,
              color: '#343a40',
              margin: 0,
            }}
          >
            {sec.body}
          </p>
        </div>
      ))}
    </div>
  </Modal>
);
