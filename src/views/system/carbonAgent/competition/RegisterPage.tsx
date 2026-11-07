import {
  CopyOutlined,
  DeleteOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { copyToClipboard } from '@src/utils/clipboard';
import { Button, Input, Modal, Tag, Tooltip, message } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';

import style from './competition.module.less';
import type {
  CompetitionStagePhase,
  ParticipantRoleView,
  TeamMemberRecord,
} from './data';
import { EXISTING_REGISTERED_ENTERPRISES, compText } from './data';

type RegisterPageProps = {
  stagePhase: CompetitionStagePhase;
  roleView: ParticipantRoleView;
  companyName: string;
  taxNo: string;
  licenseUploaded: string;
  logoUploaded: string;
  teamMembers: TeamMemberRecord[];
  teamLocked: boolean;
  individualName: string;
  individualPhone: string;
  inviteSuccessCount: number;
  shareInviteUrl: string;
  onChangeRoleView: (next: ParticipantRoleView) => void;
  onUpdateEnterpriseInfo: (fields: {
    companyName?: string;
    taxNo?: string;
    licenseUploaded?: string;
    logoUploaded?: string;
  }) => void;
  onUpdateTeamMembers: (nextMembers: TeamMemberRecord[]) => void;
  onLockTeam: () => void;
  onUpdateIndividual: (fields: { name?: string; phone?: string }) => void;

  onOpenFullMechanism: () => void;
};

export const RegisterPage = ({
  stagePhase,
  roleView,
  companyName,
  taxNo,
  licenseUploaded,
  logoUploaded,
  teamMembers,
  teamLocked,
  individualName,
  individualPhone,
  inviteSuccessCount,
  shareInviteUrl,
  onChangeRoleView,
  onUpdateEnterpriseInfo,
  onUpdateTeamMembers,
  onLockTeam,
  onUpdateIndividual,

  onOpenFullMechanism,
}: RegisterPageProps) => {
  const [selectedUnregTrack, setSelectedUnregTrack] = useState<
    'NONE' | 'ENTERPRISE' | 'INDIVIDUAL'
  >('NONE');
  const [enterpriseSubTab, setEnterpriseSubTab] = useState<'BASIC' | 'TEAM'>(
    'TEAM',
  );

  const isRegistrationClosed =
    stagePhase === 'REG_CLOSED' ||
    stagePhase === 'CORP_CARBON' ||
    stagePhase === 'PRELIM_DONE' ||
    stagePhase === 'FINAL_DONE';

  // 计算影响力加成系数：企业组可按第6-10人（每多1人+2%）或邀请累加，个人组按邀请人数（每1人+2%），封顶10%
  const extraTeamMemberBonus = Math.max(0, teamMembers.length - 5) * 2;
  const inviteBonus = inviteSuccessCount * 2;
  const totalBonusPercent = Math.min(10, extraTeamMemberBonus + inviteBonus);

  const handleCopyInviteLink = () => {
    copyToClipboard(shareInviteUrl)
      .then(() => {
        message.success(compText('inviteCopySuccess'));
      })
      .catch(() => {
        message.info(shareInviteUrl);
      });
  };

  const handleEnterpriseAuditSubmit = () => {
    const trimmedName = companyName.trim();
    if (
      EXISTING_REGISTERED_ENTERPRISES.some(
        existing =>
          existing === trimmedName || trimmedName.includes(existing),
      )
    ) {
      Modal.warning({
        title: compText('regCompanyNameLabel'),
        content: compText('regDuplicateCompanyError'),
      });
      return;
    }

    Modal.info({
      title: compText('regAuditModalTitle'),
      content: compText('regAuditModalDesc'),
      onOk: () => {
        onChangeRoleView('ENT_AUDITING');
      },
    });
  };

  const handleAddMemberRow = () => {
    if (teamMembers.length >= 10 || isRegistrationClosed) {
      return;
    }
    const nextIdx = teamMembers.length + 1;
    onUpdateTeamMembers([
      ...teamMembers,
      {
        id: `m-${  String(Date.now())}`,
        name: `新组员${  String(nextIdx)}`,
        phone: `1360000100${  String(nextIdx)}`,
        registeredInAgent: true,
        cProdStatus: 'PENDING',
        cCorpStatus: 'PENDING',
      },
    ]);
  };

  const handleRemoveMemberRow = (id: string) => {
    if (teamMembers.length <= 3 || isRegistrationClosed) {
      return;
    }
    onUpdateTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  const handleMemberFieldChange = (
    id: string,
    field: 'name' | 'phone',
    value: string,
  ) => {
    onUpdateTeamMembers(
      teamMembers.map(item =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleConfirmTeamSubmit = () => {
    const allValid =
      teamMembers.length >= 3 &&
      teamMembers.every(m => m.name.trim() && m.phone.trim());
    if (!allValid) {
      message.warning(compText('regTeamCompanyRuleTip'));
      return;
    }

    Modal.confirm({
      title: compText('regTeamConfirmModalTitle'),
      content: compText('regTeamConfirmModalDesc'),
      onOk: () => {
        onLockTeam();
        onChangeRoleView('ENT_LEADER');
        message.success(compText('regTeamLockedBtn'));
      },
    });
  };

  const handleConfirmIndividualSubmit = () => {
    if (!individualName.trim() || !individualPhone.trim()) {
      message.warning(compText('regPhonePlaceholder'));
      return;
    }
    Modal.confirm({
      title: compText('regIndividualConfirmTitle'),
      content: compText('regIndividualConfirmDesc'),
      onOk: () => {
        onChangeRoleView('INDIVIDUAL');
        message.success(compText('regTeamLockedBtn'));
      },
    });
  };

  // 1. 未报名状态：选择企业组或个人组
  if (roleView === 'UNREGISTERED' && selectedUnregTrack === 'NONE') {
    return (
      <div className={style.mainContainer}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#04252b' }}>
            {compText('regSelectTrackTitle')}
          </h2>
          <p style={{ color: '#6c757d', fontSize: 14 }}>
            {compText('regSelectTrackSub')}
          </p>
        </div>

        <div className={style.grid2}>
          <div className={style.trackCard}>
            <TeamOutlined
              style={{ fontSize: 36, color: '#026961', marginBottom: 14 }}
            />
            <h3 className={style.cardTitle} style={{ fontSize: 22 }}>
              {compText('introTrackEntTitle')}
            </h3>
            <p className={style.trackLine}>
              {compText('introTrackEntTarget')}
            </p>
            <p className={style.trackLine}>{compText('introTrackEntFit')}</p>
            <p className={style.trackLine}>
              {compText('introTrackEntDeliver')}
            </p>
            <Button
              type='primary'
              size='large'
              disabled={isRegistrationClosed}
              style={{
                marginTop: 18,
                background: '#026961',
                borderColor: '#026961',
                borderRadius: 999,
              }}
              onClick={() => setSelectedUnregTrack('ENTERPRISE')}
            >
              {isRegistrationClosed
                ? compText('heroRegClosedCta')
                : compText('regEnterEnterpriseBtn')}
            </Button>
          </div>

          <div className={style.trackCard}>
            <UserOutlined
              style={{ fontSize: 36, color: '#09c199', marginBottom: 14 }}
            />
            <h3 className={style.cardTitle} style={{ fontSize: 22 }}>
              {compText('introTrackIndTitle')}
            </h3>
            <p className={style.trackLine}>
              {compText('introTrackIndTarget')}
            </p>
            <p className={style.trackLine}>{compText('introTrackIndFit')}</p>
            <p className={style.trackLine}>
              {compText('introTrackIndDeliver')}
            </p>
            <Button
              type='primary'
              size='large'
              disabled={isRegistrationClosed}
              style={{
                marginTop: 18,
                background: '#026961',
                borderColor: '#026961',
                borderRadius: 999,
              }}
              onClick={() => setSelectedUnregTrack('INDIVIDUAL')}
            >
              {isRegistrationClosed
                ? compText('heroRegClosedCta')
                : compText('regEnterIndividualBtn')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 2. 个人组填报与已报名视图
  if (
    roleView === 'INDIVIDUAL' ||
    (roleView === 'UNREGISTERED' && selectedUnregTrack === 'INDIVIDUAL')
  ) {
    const isLockedIndividual = roleView === 'INDIVIDUAL';
    return (
      <div className={style.mainContainer}>
        <div className={style.cardBox}>
          {isLockedIndividual ? (
            <div className={style.bonusAlertBanner} style={{ marginBottom: 18 }}>
              <span>{compText('regIndividualBenefitBanner')}</span>
            </div>
          ) : null}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <div>
              <h2 className={style.sectionTitle}>
                {compText('regIndividualTitle')}
              </h2>
              <p className={style.sectionSubtitle}>
                {compText('regIndividualSub')}
              </p>
            </div>
            {!isLockedIndividual ? (
              <Button onClick={() => setSelectedUnregTrack('NONE')}>
                {compText('inviteModalThinkAgain')}
              </Button>
            ) : null}
          </div>

          <div className={style.grid2} style={{ marginTop: 20 }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                {compText('checkinColPersonName')}
              </div>
              <Input
                size='large'
                disabled={isLockedIndividual || isRegistrationClosed}
                value={individualName}
                placeholder={compText('regNamePlaceholder')}
                onChange={e => onUpdateIndividual({ name: e.target.value })}
              />
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                {compText('checkinColPhone')}
              </div>
              <Input
                size='large'
                disabled={isLockedIndividual || isRegistrationClosed}
                value={individualPhone}
                placeholder={compText('regPhonePlaceholder')}
                onChange={e => onUpdateIndividual({ phone: e.target.value })}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <Button
              type='primary'
              size='large'
              disabled={isLockedIndividual || isRegistrationClosed}
              style={{
                background: '#026961',
                borderColor: '#026961',
                borderRadius: 999,
                paddingInline: 36,
              }}
              onClick={handleConfirmIndividualSubmit}
            >
              {(() => {
                if (isLockedIndividual) return compText('regIndividualLockedBtn');
                if (isRegistrationClosed) return compText('heroRegClosedCta');
                return compText('regSubmitIndividualBtn');
              })()}
            </Button>
            {isLockedIndividual ? (
              <>
                <Button
                  icon={<CopyOutlined />}
                  disabled={isRegistrationClosed}
                  style={{
                    borderColor: '#026961',
                    color: '#026961',
                    borderRadius: 999,
                    fontWeight: 600,
                  }}
                  onClick={handleCopyInviteLink}
                >
                  {compText('inviteCopyBtn')}
                </Button>
                <Tag color='green' style={{ fontSize: 13, padding: '4px 12px' }}>
                  {compText('inviteCurrentBonus', { bonus: totalBonusPercent })}
                </Tag>
              </>
            ) : null}
          </div>
        </div>

        
      </div>
    );
  }

  // 3. 企业组视图（未报名填基础信息 / 审核中只读 / 组长可看基础信息+组员 / 组员仅可看参赛组员）
  const isAuditing = roleView === 'ENT_AUDITING';
  const isMemberOnly = roleView === 'ENT_MEMBER';
  const isBasicFormStage =
    (roleView === 'UNREGISTERED' && selectedUnregTrack === 'ENTERPRISE') ||
    isAuditing ||
    (roleView === 'ENT_LEADER' && enterpriseSubTab === 'BASIC');

  const canSubmitBasicForm =
    Boolean(companyName.trim()) &&
    Boolean(taxNo.trim()) &&
    Boolean(licenseUploaded) &&
    Boolean(logoUploaded) &&
    !isAuditing &&
    !isRegistrationClosed;

  return (
    <div className={style.mainContainer}>
      {!isAuditing && !isMemberOnly ? (
        <div className={style.stepBar}>
          <button
            type='button'
            className={classNames(style.stepPill, {
              [style.stepPillActive]: isBasicFormStage,
            })}
            onClick={() => {
              if (roleView === 'ENT_LEADER') {
                setEnterpriseSubTab('BASIC');
              }
            }}
          >
            <span>{compText('regStep1Label')}</span>
          </button>
          <div className={style.stepConnector} />
          <button
            type='button'
            className={classNames(style.stepPill, {
              [style.stepPillActive]: !isBasicFormStage,
            })}
            disabled={
              roleView === 'UNREGISTERED' &&
              selectedUnregTrack === 'ENTERPRISE'
            }
            onClick={() => {
              if (roleView === 'ENT_LEADER') {
                setEnterpriseSubTab('TEAM');
              }
            }}
          >
            <span>{compText('regStep2Label')}</span>
          </button>
        </div>
      ) : null}

      {isBasicFormStage ? (
        <div className={style.cardBox}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 className={style.sectionTitle}>
                {compText('regBasicInfoTitle')}
              </h2>
              <Tooltip title={compText('regBasicInfoTooltip')}>
                <QuestionCircleOutlined
                  style={{ fontSize: 18, color: '#026961', cursor: 'pointer' }}
                />
              </Tooltip>
              <span style={{ fontSize: 12, color: '#6c757d' }}>
                （{compText('regBasicInfoTooltip')}）
              </span>
            </div>

            {roleView === 'UNREGISTERED' ? (
              <Button onClick={() => setSelectedUnregTrack('NONE')}>
                {compText('inviteModalThinkAgain')}
              </Button>
            ) : null}
          </div>

          <div className={style.grid2}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                * {compText('regCompanyNameLabel')}
              </div>
              <Input
                size='large'
                disabled={isAuditing || roleView === 'ENT_LEADER'}
                value={companyName}
                placeholder={compText('regCompanyNamePlaceholder')}
                onChange={e =>
                  onUpdateEnterpriseInfo({ companyName: e.target.value })
                }
              />
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                * {compText('regTaxNoLabel')}
              </div>
              <Input
                size='large'
                disabled={isAuditing || roleView === 'ENT_LEADER'}
                value={taxNo}
                placeholder={compText('regTaxNoPlaceholder')}
                onChange={e =>
                  onUpdateEnterpriseInfo({ taxNo: e.target.value })
                }
              />
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                * {compText('regLicenseLabel')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Button
                  icon={<UploadOutlined />}
                  disabled={isAuditing || roleView === 'ENT_LEADER'}
                  onClick={() =>
                    onUpdateEnterpriseInfo({
                      licenseUploaded: 'business_license_verified.pdf',
                    })
                  }
                >
                  {compText('regUploadBtn')}
                </Button>
                {licenseUploaded ? (
                  <Tag color='green'>
                    {compText('regUploadedTag')}
                    {licenseUploaded}
                  </Tag>
                ) : (
                  <span style={{ fontSize: 12, color: '#6c757d' }}>
                    {compText('regLicenseHint')}
                  </span>
                )}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                * {compText('regLogoLabel')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Button
                  icon={<UploadOutlined />}
                  disabled={isAuditing || roleView === 'ENT_LEADER'}
                  onClick={() =>
                    onUpdateEnterpriseInfo({
                      logoUploaded: 'enterprise_logo_hd.png',
                    })
                  }
                >
                  {compText('regUploadBtn')}
                </Button>
                {logoUploaded ? (
                  <Tag color='green'>
                    {compText('regUploadedTag')}
                    {logoUploaded}
                  </Tag>
                ) : (
                  <span style={{ fontSize: 12, color: '#6c757d' }}>
                    {compText('regLogoHint')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
            {roleView === 'ENT_LEADER' ? (
              <Button
                type='primary'
                size='large'
                style={{
                  background: '#026961',
                  borderColor: '#026961',
                  borderRadius: 999,
                }}
                onClick={() => setEnterpriseSubTab('TEAM')}
              >
                {compText('regStep2Label')}
              </Button>
            ) : null}
            {roleView !== 'ENT_LEADER' && isAuditing ? (
              <button
                type='button'
                disabled
                style={{
                  background: '#fff8e6',
                  border: '1px solid #faad14',
                  color: '#ad6800',
                  fontWeight: 700,
                  fontSize: 15,
                  borderRadius: 999,
                  padding: '9px 32px',
                  cursor: 'not-allowed',
                }}
              >
                {compText('regAuditingBtn')}
              </button>
            ) : null}
            {roleView !== 'ENT_LEADER' && !isAuditing ? (
              <Button
                type='primary'
                size='large'
                disabled={!canSubmitBasicForm}
                style={{
                  background: '#026961',
                  borderColor: '#026961',
                  borderRadius: 999,
                  paddingInline: 32,
                }}
                onClick={handleEnterpriseAuditSubmit}
              >
                {compText('regSubmitAuditBtn')}
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className={style.cardBox}>
          <div className={style.bonusAlertBanner} style={{ marginBottom: 16 }}>
            <span>{compText('regAuditApprovedBanner')}</span>
          </div>

          <div className={style.sectionHeader}>
            <div>
              <h2 className={style.sectionTitle}>
                {compText('regTeamSectionTitle')}
              </h2>
              <p className={style.sectionSubtitle}>
                {compText('regTeamCompanyRuleTip')}
              </p>
            </div>
            {!isMemberOnly ? (
              <Button
                icon={<PlusOutlined />}
                disabled={
                  teamMembers.length >= 10 ||
                  teamLocked ||
                  isRegistrationClosed
                }
                onClick={handleAddMemberRow}
              >
                {compText('regAddMemberBtn')} ({teamMembers.length}/10)
              </Button>
            ) : null}
          </div>

          <div className={style.teamBonusTrackWrap}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <strong style={{ color: '#004541', fontSize: 13 }}>
                {compText('regTeamProgressTitle', {
                  count: teamMembers.length,
                  bonus: extraTeamMemberBonus,
                })}
              </strong>
              <Button
                type='link'
                style={{ color: '#026961', fontWeight: 700, padding: 0 }}
                onClick={onOpenFullMechanism}
              >
                {compText('regTeamViewRuleLink')}
              </Button>
            </div>
            <div className={style.teamBonusSteps}>
              {[
                { min: 3, label: compText('regTeamProgressStep3') },
                { min: 5, label: compText('regTeamProgressStep5') },
                { min: 6, label: compText('regTeamProgressStep6') },
                { min: 7, label: compText('regTeamProgressStep7') },
                { min: 8, label: compText('regTeamProgressStep8') },
                { min: 9, label: compText('regTeamProgressStep9') },
                { min: 10, label: compText('regTeamProgressStep10') },
              ].map(node => (
                <div
                  key={node.min}
                  className={classNames(style.teamBonusStepItem, {
                    [style.teamBonusStepReached]:
                      teamMembers.length >= node.min,
                  })}
                >
                  {node.label}
                </div>
              ))}
            </div>
          </div>

          {teamMembers.length >= 5 ? (
            <div className={style.bonusAlertBanner}>
              <span>{compText('regTeamFiveMemberBonusBanner')}</span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexShrink: 0,
                }}
              >
                <Button
                  type='primary'
                  size='small'
                  icon={<CopyOutlined />}
                  disabled={isRegistrationClosed}
                  style={{
                    background: '#026961',
                    borderColor: '#026961',
                    borderRadius: 999,
                    fontWeight: 600,
                  }}
                  onClick={handleCopyInviteLink}
                >
                  {compText('inviteCopyBtn')}
                </Button>
                <Button
                  type='link'
                  style={{ color: '#026961', fontWeight: 700, padding: 0 }}
                  onClick={onOpenFullMechanism}
                >
                  {compText('regTeamViewRuleLink')}
                </Button>
              </div>
            </div>
          ) : null}

          <div>
            {teamMembers.map((member, index) => {
              const isLeaderRow = Boolean(member.isLeader || index === 0);
              const readonlyRow =
                isMemberOnly || teamLocked || isRegistrationClosed;

              return (
                <div key={member.id} className={style.memberRow}>
                  <div>
                    <Tag color={isLeaderRow ? 'geekblue' : 'cyan'}>
                      {isLeaderRow
                        ? compText('regRoleLeader')
                        : `${compText('regRoleMember')  } ${  String(index)}`}
                    </Tag>
                  </div>

                  <Input
                    disabled={readonlyRow}
                    value={member.name}
                    placeholder={compText('regNamePlaceholder')}
                    onChange={e =>
                      handleMemberFieldChange(
                        member.id,
                        'name',
                        e.target.value,
                      )
                    }
                  />

                  <Tooltip
                    title={
                      isLeaderRow ? compText('regLeaderPhoneFixedTip') : ''
                    }
                  >
                    <Input
                      disabled={isLeaderRow || readonlyRow}
                      value={member.phone}
                      placeholder={compText('regPhonePlaceholder')}
                      onChange={e =>
                        handleMemberFieldChange(
                          member.id,
                          'phone',
                          e.target.value,
                        )
                      }
                    />
                  </Tooltip>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Tag
                      color={member.registeredInAgent ? 'success' : 'warning'}
                    >
                      {(() => {
                        if (!member.registeredInAgent) {
                          return compText('regMemberStatusUnreg');
                        }
                        if (isLeaderRow) {
                          return compText('regMemberStatusPoints');
                        }
                        return compText('regMemberStatusVip');
                      })()}
                    </Tag>
                    {!member.registeredInAgent ? (
                      <Button
                        size='small'
                        type='link'
                        style={{ padding: 0, color: '#026961', fontWeight: 600 }}
                        onClick={() => {
                          const urgeText = compText('regUrgeCopyTemplate', {
                            name: member.name,
                            phone: member.phone,
                          });
                          copyToClipboard(urgeText)
                            .then(() => {
                              message.success(compText('regUrgeCopySuccess'));
                            })
                            .catch(() => {
                              message.info(urgeText);
                            });
                        }}
                      >
                        {compText('regCopyUrgeBtn')}
                      </Button>
                    ) : null}
                    {!isLeaderRow && !readonlyRow && teamMembers.length > 3 ? (
                      <Button
                        danger
                        size='small'
                        type='text'
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveMemberRow(member.id)}
                      >
                        {compText('regRemoveMemberBtn')}
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {!isMemberOnly ? (
            <div style={{ marginTop: 22 }}>
              <Button
                type='primary'
                size='large'
                disabled={
                  teamMembers.length < 3 || teamLocked || isRegistrationClosed
                }
                style={{
                  background: '#026961',
                  borderColor: '#026961',
                  borderRadius: 999,
                  paddingInline: 36,
                }}
                onClick={handleConfirmTeamSubmit}
              >
                {(() => {
                  if (teamLocked) return compText('regTeamLockedBtn');
                  if (isRegistrationClosed) return compText('heroRegClosedCta');
                  return compText('regSubmitTeamBtn');
                })()}
              </Button>
            </div>
          ) : null}
        </div>
      )}

      
    </div>
  );
};
