import {
  CheckCircleFilled,
  CopyOutlined,
  DownloadOutlined,
  FireFilled,
  LockOutlined,
  QrcodeOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { copyToClipboard } from '@src/utils/clipboard';
import { Button, Input, Modal, Radio, Segmented, Table, Tag, message } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';

import { CheckinCoreRuleModal } from './CompetitionModals';
import style from './competition.module.less';
import type {
  CompetitionStagePhase,
  ParticipantRoleView,
  SubmissionItemStatus,
  TeamMemberRecord,
} from './data';
import {
  ENTERPRISE_CHECKIN_PUBLIC_LIST,
  INDIVIDUAL_CHECKIN_PUBLIC_LIST,
  compText,
  maskPhoneNumber,
} from './data';

type CreosModuleKey = 'C' | 'R' | 'E' | 'O' | 'S';

type SubmitPageProps = {
  stagePhase: CompetitionStagePhase;
  roleView: ParticipantRoleView;
  teamMembers: TeamMemberRecord[];
  carbonAccountSecret: string;
  onGoRegister: () => void;
  onGoCheckinPublic: () => void;
  onUpdateMemberSubmission: (
    memberId: string,
    field: 'cProdStatus' | 'cCorpStatus',
    status: SubmissionItemStatus,
  ) => void;
};

export const SubmitPage = ({
  stagePhase,
  roleView,
  teamMembers,
  carbonAccountSecret,
  onGoRegister,
  onGoCheckinPublic,
  onUpdateMemberSubmission,
}: SubmitPageProps) => {
  const [activeModule, setActiveModule] = useState<CreosModuleKey>('C');
  const [ePreviewTab, setEPreviewTab] = useState<'ENTERPRISE' | 'INDIVIDUAL'>(
    roleView === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'ENTERPRISE',
  );
  const [checkinRuleOpen, setCheckinRuleOpen] = useState(false);

  const [cProdDraft, setCProdDraft] = useState(
    'https://agent.carbonstop.com/share/agent/pcf-model-2026-pair08',
  );
  const [cCorpDraft, setCCorpDraft] = useState(
    'https://agent.carbonstop.com/share/agent/eca-model-2026-pair08',
  );
  const [cProdSourceType, setCProdSourceType] = useState<'OFFICIAL' | 'SELF'>('OFFICIAL');
  const [cCorpSourceType, setCCorpSourceType] = useState<'OFFICIAL' | 'SELF'>('OFFICIAL');
  const [cProdConfirmed, setCProdConfirmed] = useState(false);
  const [cCorpConfirmed, setCCorpConfirmed] = useState(false);

  const [rosStatus, setRosStatus] = useState<
    Record<'R' | 'O' | 'S', SubmissionItemStatus>
  >({
    R: 'PENDING',
    O: 'PENDING',
    S: 'PENDING',
  });
  const [rosNotes, setRosNotes] = useState<Record<'R' | 'O' | 'S', string>>({
    R: '',
    O: '',
    S: '',
  });
  const [rosFiles, setRosFiles] = useState<Record<'R' | 'O' | 'S', string>>({
    R: '',
    O: '',
    S: '',
  });

  if (roleView === 'UNREGISTERED' || roleView === 'ENT_AUDITING') {
    return (
      <div className={style.mainContainer}>
        <div
          className={style.cardBox}
          style={{ textAlign: 'center', padding: '56px 24px' }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#04252b' }}>
            {compText('subUnregisteredText')}
          </h2>
          <Button
            type='primary'
            size='large'
            style={{
              marginTop: 20,
              background: '#026961',
              borderColor: '#026961',
              borderRadius: 999,
              paddingInline: 36,
            }}
            onClick={onGoRegister}
          >
            {compText('subGoRegisterBtn')}
          </Button>
        </div>
      </div>
    );
  }

  const isPrelimPhase =
    stagePhase === 'PROD_CARBON' ||
    stagePhase === 'CORP_CARBON' ||
    stagePhase === 'REG_CLOSED';
  const isRosPhase = stagePhase === 'PRELIM_DONE';
  const isAllDeadlinePassed = stagePhase === 'FINAL_DONE';

  const isIndividual = roleView === 'INDIVIDUAL';
  const isLeader = roleView === 'ENT_LEADER';

  const renderStatusTag = (status: SubmissionItemStatus) => {
    if (status === 'SUBMITTED') {
      return <Tag color='success'>{compText('subStatusSubmitted')}</Tag>;
    }
    if (status === 'UNREGISTERED') {
      return <Tag color='error'>{compText('subStatusUnregistered')}</Tag>;
    }
    return <Tag color='warning'>{compText('subStatusPending')}</Tag>;
  };

  const creosColumns: Array<{
    key: CreosModuleKey;
    title: string;
    desc: string;
    ongoing: boolean;
    disabledForTrack: boolean;
    statusNode: JSX.Element;
  }> = [
    {
      key: 'C',
      title: compText('creosCTitle'),
      desc: compText('creosCDesc'),
      ongoing: isPrelimPhase,
      disabledForTrack: false,
      statusNode: renderStatusTag(cProdConfirmed ? 'SUBMITTED' : 'PENDING'),
    },
    {
      key: 'R',
      title: compText('creosRTitle'),
      desc: compText('creosRDesc'),
      ongoing: isRosPhase && !isIndividual,
      disabledForTrack: isIndividual,
      statusNode: isIndividual ? (
        <Tag icon={<LockOutlined />}>
          {compText('subCardLockedIndividual')}
        </Tag>
      ) : (
        renderStatusTag(rosStatus.R)
      ),
    },
    {
      key: 'E',
      title: compText('creosETitle'),
      desc: compText('creosEDesc'),
      ongoing: isPrelimPhase,
      disabledForTrack: false,
      statusNode: <Tag color='cyan'>{compText('subStageOngoingTag')}</Tag>,
    },
    {
      key: 'O',
      title: compText('creosOTitle'),
      desc: compText('creosODesc'),
      ongoing: isRosPhase && !isIndividual,
      disabledForTrack: isIndividual,
      statusNode: isIndividual ? (
        <Tag icon={<LockOutlined />}>
          {compText('subCardLockedIndividual')}
        </Tag>
      ) : (
        renderStatusTag(rosStatus.O)
      ),
    },
    {
      key: 'S',
      title: compText('creosSTitle'),
      desc: compText('creosSDesc'),
      ongoing: isRosPhase && !isIndividual,
      disabledForTrack: isIndividual,
      statusNode: isIndividual ? (
        <Tag icon={<LockOutlined />}>
          {compText('subCardLockedIndividual')}
        </Tag>
      ) : (
        renderStatusTag(rosStatus.S)
      ),
    },
  ];

  const handleCopySecret = () => {
    copyToClipboard(carbonAccountSecret)
      .then(() => {
        message.success(carbonAccountSecret);
      })
      .catch(() => {
        message.info(carbonAccountSecret);
      });
  };

  const handleConfirmCSubmit = (target: 'PROD' | 'CORP') => {
    Modal.confirm({
      title: compText('subConfirmSubmitBtn'),
      content: compText('subPasteGuideText'),
      onOk: () => {
        if (target === 'PROD') {
          setCProdConfirmed(true);
          onUpdateMemberSubmission('m-1', 'cProdStatus', 'SUBMITTED');
        } else {
          setCCorpConfirmed(true);
          onUpdateMemberSubmission('m-1', 'cCorpStatus', 'SUBMITTED');
        }
        message.success(compText('subStatusSubmitted'));
      },
    });
  };

  const handleConfirmRosSubmit = (mod: 'R' | 'O' | 'S') => {
    Modal.confirm({
      title: compText('subConfirmSubmitBtn'),
      content: compText('subROSTimeHint'),
      onOk: () => {
        setRosStatus(prev => ({ ...prev, [mod]: 'SUBMITTED' }));
        message.success(compText('subStatusSubmitted'));
      },
    });
  };

  return (
    <div className={style.mainContainer}>
      <div className={style.bonusAlertBanner} style={{ marginBottom: 18 }}>
        <span>{compText('subDeadlineReadonlyBanner')}</span>
        <Tag color='geekblue'>{compText('subQuestionPairTag')}</Tag>
      </div>

      {/* 顶部 CREOS 五模块切换看板 */}
      <div className={style.creosBoardGrid}>
        {creosColumns.map(col => {
          const isSelected = activeModule === col.key;
          return (
            <div
              key={col.key}
              className={classNames(style.creosColCard, {
                [style.creosColCardActive]: isSelected,
                [style.creosColCardDisabled]: col.disabledForTrack,
              })}
              onClick={() => setActiveModule(col.key)}
            >
              <div>
                <div className={style.creosColHeader}>
                  <span className={style.creosLetter}>{col.key}</span>
                  {col.ongoing ? (
                    <span className={style.ongoingPulseTag}>
                      <FireFilled />
                      {compText('subStageOngoingTag')}
                    </span>
                  ) : null}
                </div>
                <h3 className={style.cardTitle} style={{ fontSize: 15 }}>
                  {col.title}
                </h3>
                <p
                  className={style.cardDesc}
                  style={{ fontSize: 12, marginBottom: 12 }}
                >
                  {col.desc}
                </p>
              </div>
              <div>
                {col.statusNode}
                {isSelected ? (
                  <div className={style.creosActiveArrow}>
                    <span>当前查看模块</span>
                    <span>▼</span>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* 模块 1：C 量化碳排放 */}
      {activeModule === 'C' ? (
        <div>
          {!isIndividual ? (
            <div className={style.cardBox} style={{ marginBottom: 20 }}>
              <h3 className={style.cardTitle}>
                {compText('subCAllMembersTitle')}
              </h3>
              <Table
                size='small'
                pagination={false}
                rowKey='id'
                dataSource={teamMembers}
                columns={[
                  {
                    title: compText('checkinColPersonName'),
                    dataIndex: 'name',
                    key: 'name',
                  },
                  {
                    title: compText('checkinColPhone'),
                    dataIndex: 'phone',
                    key: 'phone',
                    render: (val: string) => maskPhoneNumber(val),
                  },
                  {
                    title: compText('subCProdTitle'),
                    dataIndex: 'cProdStatus',
                    key: 'cProdStatus',
                    render: (
                      val: SubmissionItemStatus,
                      row: TeamMemberRecord,
                    ) => (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          flexWrap: 'wrap',
                        }}
                      >
                        {renderStatusTag(val)}
                        {val === 'SUBMITTED' ? (
                          <Button
                            type='link'
                            size='small'
                            style={{
                              padding: 0,
                              color: '#026961',
                              fontWeight: 600,
                            }}
                            onClick={() => {
                              const url =
                                row.cProdUrl ||
                                'https://agent.carbonstop.com/share/agent/pcf-model-2026-pair08';
                              Modal.info({
                                title: compText('subViewProdLinkBtn'),
                                content: url,
                              });
                            }}
                          >
                            {compText('subViewProdLinkBtn')}
                          </Button>
                        ) : null}
                      </div>
                    ),
                  },
                  {
                    title: compText('subCCorpTitle'),
                    dataIndex: 'cCorpStatus',
                    key: 'cCorpStatus',
                    render: (
                      val: SubmissionItemStatus,
                      row: TeamMemberRecord,
                    ) => (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          flexWrap: 'wrap',
                        }}
                      >
                        {renderStatusTag(val)}
                        {val === 'SUBMITTED' ? (
                          <Button
                            type='link'
                            size='small'
                            style={{
                              padding: 0,
                              color: '#026961',
                              fontWeight: 600,
                            }}
                            onClick={() => {
                              const url =
                                row.cCorpUrl ||
                                'https://agent.carbonstop.com/share/agent/eca-model-2026-pair08';
                              Modal.info({
                                title: compText('subViewCorpLinkBtn'),
                                content: url,
                              });
                            }}
                          >
                            {compText('subViewCorpLinkBtn')}
                          </Button>
                        ) : null}
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          ) : null}

          <div className={style.grid2}>
            <div className={style.cardBox}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <div>
                  <h3 className={style.cardTitle}>
                    {compText('subCProdTitle')}
                  </h3>
                  <div style={{ fontSize: 12, color: '#026961' }}>
                    {compText('subCProdTime')}
                  </div>
                </div>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() =>
                    message.success(
                      `${compText('subDownloadQuestionBtn') 
                        }: PCF_Question_Pair08.zip`,
                    )
                  }
                >
                  {compText('subDownloadQuestionBtn')}
                </Button>
              </div>
              <p style={{ fontSize: 12, color: '#6c757d', marginBottom: 10 }}>
                {compText('subCProdTrackNote')}
              </p>
              <div
                style={{
                  marginBottom: 12,
                  padding: '8px 12px',
                  background: '#f7f8f9',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  * {compText('subDataSourceLabel')}
                </span>
                <Radio.Group
                  disabled={
                    isIndividual ||
                    cProdConfirmed ||
                    stagePhase === 'CORP_CARBON' ||
                    stagePhase === 'PRELIM_DONE' ||
                    isAllDeadlinePassed
                  }
                  value={isIndividual ? 'OFFICIAL' : cProdSourceType}
                  onChange={e => setCProdSourceType(e.target.value)}
                >
                  <Radio value='OFFICIAL'>
                    {compText('subDataSourceOfficial')}
                  </Radio>
                  <Radio value='SELF'>{compText('subDataSourceSelf')}</Radio>
                </Radio.Group>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                {compText('subPasteGuideText')}
              </div>
              <Input.TextArea
                rows={4}
                disabled={
                  cProdConfirmed ||
                  stagePhase === 'CORP_CARBON' ||
                  stagePhase === 'PRELIM_DONE' ||
                  isAllDeadlinePassed
                }
                value={cProdDraft}
                placeholder={compText('subPastePlaceholder')}
                onChange={e => setCProdDraft(e.target.value)}
              />
              <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                <Button
                  disabled={
                    cProdConfirmed ||
                    stagePhase === 'CORP_CARBON' ||
                    stagePhase === 'PRELIM_DONE' ||
                    isAllDeadlinePassed
                  }
                  onClick={() => message.success(compText('subSaveDraftBtn'))}
                >
                  {compText('subSaveDraftBtn')}
                </Button>
                <Button
                  type='primary'
                  disabled={
                    cProdConfirmed ||
                    stagePhase === 'CORP_CARBON' ||
                    stagePhase === 'PRELIM_DONE' ||
                    isAllDeadlinePassed
                  }
                  style={{ background: '#026961', borderColor: '#026961' }}
                  onClick={() => handleConfirmCSubmit('PROD')}
                >
                  {cProdConfirmed
                    ? compText('subLockedBtn')
                    : compText('subConfirmSubmitBtn')}
                </Button>
              </div>
            </div>

            <div className={style.cardBox}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <div>
                  <h3 className={style.cardTitle}>
                    {compText('subCCorpTitle')}
                  </h3>
                  <div style={{ fontSize: 12, color: '#026961' }}>
                    {compText('subCCorpTime')}
                  </div>
                </div>
                <Button
                  icon={<DownloadOutlined />}
                  disabled={stagePhase === 'PROD_CARBON'}
                  onClick={() =>
                    message.success(
                      `${compText('subDownloadQuestionBtn') 
                        }: ECA_Question_Pair08.zip`,
                    )
                  }
                >
                  {compText('subDownloadQuestionBtn')}
                </Button>
              </div>
              <p style={{ fontSize: 12, color: '#6c757d', marginBottom: 10 }}>
                {compText('subQuestionPairTag')}
              </p>
              <div
                style={{
                  marginBottom: 12,
                  padding: '8px 12px',
                  background: '#f7f8f9',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  * {compText('subDataSourceLabel')}
                </span>
                <Radio.Group
                  disabled={
                    isIndividual ||
                    cCorpConfirmed ||
                    stagePhase === 'PROD_CARBON' ||
                    stagePhase === 'PRELIM_DONE' ||
                    isAllDeadlinePassed
                  }
                  value={isIndividual ? 'OFFICIAL' : cCorpSourceType}
                  onChange={e => setCCorpSourceType(e.target.value)}
                >
                  <Radio value='OFFICIAL'>
                    {compText('subDataSourceOfficial')}
                  </Radio>
                  <Radio value='SELF'>{compText('subDataSourceSelf')}</Radio>
                </Radio.Group>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                {compText('subPasteGuideText')}
              </div>
              <Input.TextArea
                rows={4}
                disabled={
                  cCorpConfirmed ||
                  stagePhase === 'PROD_CARBON' ||
                  stagePhase === 'PRELIM_DONE' ||
                  isAllDeadlinePassed
                }
                value={cCorpDraft}
                placeholder={compText('subPastePlaceholder')}
                onChange={e => setCCorpDraft(e.target.value)}
              />
              <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                <Button
                  disabled={
                    cCorpConfirmed ||
                    stagePhase === 'PROD_CARBON' ||
                    stagePhase === 'PRELIM_DONE' ||
                    isAllDeadlinePassed
                  }
                  onClick={() => message.success(compText('subSaveDraftBtn'))}
                >
                  {compText('subSaveDraftBtn')}
                </Button>
                <Button
                  type='primary'
                  disabled={
                    cCorpConfirmed ||
                    stagePhase === 'PROD_CARBON' ||
                    stagePhase === 'PRELIM_DONE' ||
                    isAllDeadlinePassed
                  }
                  style={{ background: '#026961', borderColor: '#026961' }}
                  onClick={() => handleConfirmCSubmit('CORP')}
                >
                  {cCorpConfirmed
                    ? compText('subLockedBtn')
                    : compText('subConfirmSubmitBtn')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* 模块 3：E 价值链带动 */}
      {activeModule === 'E' ? (
        <div className={style.grid2}>
          <div className={style.cardBox}>
            <h3 className={style.cardTitle}>{compText('subECheckinTitle')}</h3>
            {!isIndividual ? (
              <div
                className={style.bonusAlertBanner}
                style={{ marginTop: 12, marginBottom: 16 }}
              >
                <div>
                  <div style={{ fontSize: 12 }}>
                    {compText('subESecretLabel')}
                  </div>
                  <strong style={{ fontSize: 18, letterSpacing: 1 }}>
                    {carbonAccountSecret}
                  </strong>
                </div>
                <Button
                  size='small'
                  icon={<CopyOutlined />}
                  onClick={handleCopySecret}
                >
                  {compText('subECopySecretBtn')}
                </Button>
              </div>
            ) : null}

            <div
              style={{
                display: 'flex',
                gap: 18,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <div className={style.qrPlaceholder}>
                <QrcodeOutlined style={{ fontSize: 36, color: '#026961' }} />
                <span>{compText('subEQrTitle')}</span>
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.8, color: '#343a40' }}>
                <div>{compText('subEStep1')}</div>
                <div>{compText('subEStep2')}</div>
                <div>{compText('subEStep3')}</div>
              </div>
            </div>

            <Button
              type='link'
              style={{ color: '#026961', fontWeight: 700, padding: 0 }}
              onClick={() => setCheckinRuleOpen(true)}
            >
              {compText('subERuleBtn')} &gt;
            </Button>
          </div>

          <div className={style.cardBox}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 12,
              }}
            >
              <h3
                className={style.cardTitle}
                style={{ margin: 0, whiteSpace: 'nowrap' }}
              >
                {compText('subELeaderboardPreviewTitle')}
              </h3>
              <Segmented
                size='small'
                value={ePreviewTab}
                options={[
                  {
                    label: compText('subELeaderboardSwitchEnt'),
                    value: 'ENTERPRISE',
                  },
                  {
                    label: compText('subELeaderboardSwitchInd'),
                    value: 'INDIVIDUAL',
                  },
                ]}
                onChange={val =>
                  setEPreviewTab(val as 'ENTERPRISE' | 'INDIVIDUAL')
                }
              />
            </div>

            <Table
              size='small'
              pagination={false}
              rowKey='key'
              dataSource={
                ePreviewTab === 'INDIVIDUAL'
                  ? INDIVIDUAL_CHECKIN_PUBLIC_LIST.slice(0, 5)
                  : ENTERPRISE_CHECKIN_PUBLIC_LIST.slice(0, 5)
              }
              columns={
                ePreviewTab === 'INDIVIDUAL'
                  ? [
                      {
                        title: compText('checkinColRank'),
                        dataIndex: 'rank',
                        key: 'rank',
                        render: (val: number) => `NO.${  String(val)}`,
                      },
                      {
                        title: compText('checkinColPersonName'),
                        dataIndex: 'personName',
                        key: 'personName',
                      },
                      {
                        title: compText('checkinColTotalPoints'),
                        dataIndex: 'totalPoints',
                        key: 'totalPoints',
                        render: (val: number) => `${val.toLocaleString()  } 分`,
                      },
                    ]
                  : [
                      {
                        title: compText('checkinColRank'),
                        dataIndex: 'rank',
                        key: 'rank',
                        render: (val: number) => `NO.${  String(val)}`,
                      },
                      {
                        title: compText('checkinColEnterprise'),
                        dataIndex: 'enterpriseName',
                        key: 'enterpriseName',
                      },
                      {
                        title: compText('checkinColTotalPoints'),
                        dataIndex: 'totalPoints',
                        key: 'totalPoints',
                        render: (val: number) => `${val.toLocaleString()  } 分`,
                      },
                    ]
              }
            />

            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <Button
                type='link'
                style={{ color: '#026961', fontWeight: 700, padding: 0 }}
                onClick={onGoCheckinPublic}
              >
                {compText('subEViewFullPublicBtn')}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* 模块 2/4/5：R / O / S */}
      {activeModule === 'R' || activeModule === 'O' || activeModule === 'S' ? (
        <div className={style.cardBox}>
          {isIndividual ? (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              <LockOutlined
                style={{ fontSize: 32, color: '#999ea4', marginBottom: 10 }}
              />
              <h3 style={{ fontSize: 18, color: '#6c757d', margin: 0 }}>
                {compText('subEnterpriseOnlyTip')}
              </h3>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 14,
                }}
              >
                <div>
                  <h3 className={style.cardTitle}>
                    {compText('subROSTitlePrefix')}
                    {(() => {
                      if (activeModule === 'R') return compText('creosRTitle');
                      if (activeModule === 'O') return compText('creosOTitle');
                      return compText('creosSTitle');
                    })()}
                  </h3>
                  <div style={{ fontSize: 12, color: '#026961' }}>
                    {compText('subROSTimeHint')}
                  </div>
                </div>
                {renderStatusTag(rosStatus[activeModule])}
              </div>

              {!isLeader ? (
                <div
                  className={style.bonusAlertBanner}
                  style={{ marginBottom: 14 }}
                >
                  <span>{compText('subLeaderOnlyTip')}</span>
                </div>
              ) : null}

              <Input.TextArea
                rows={4}
                disabled={
                  !isLeader ||
                  rosStatus[activeModule] === 'SUBMITTED' ||
                  isAllDeadlinePassed
                }
                value={rosNotes[activeModule]}
                placeholder={compText('subROSContentPlaceholder')}
                onChange={e =>
                  setRosNotes(prev => ({
                    ...prev,
                    [activeModule]: e.target.value,
                  }))
                }
              />

              <div
                style={{
                  marginTop: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  icon={<UploadOutlined />}
                  disabled={
                    !isLeader ||
                    rosStatus[activeModule] === 'SUBMITTED' ||
                    isAllDeadlinePassed
                  }
                  onClick={() =>
                    setRosFiles(prev => ({
                      ...prev,
                      [activeModule]:
                        `${activeModule  }_Enterprise_Proposal_2026.pdf`,
                    }))
                  }
                >
                  {compText('subROSUploadBtn')}
                </Button>
                {rosFiles[activeModule] ? (
                  <Tag icon={<CheckCircleFilled />} color='success'>
                    {rosFiles[activeModule]}
                  </Tag>
                ) : null}
              </div>

              {isLeader ? (
                <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
                  <Button
                    disabled={
                      rosStatus[activeModule] === 'SUBMITTED' ||
                      isAllDeadlinePassed
                    }
                    onClick={() => message.success(compText('subSaveDraftBtn'))}
                  >
                    {compText('subSaveDraftBtn')}
                  </Button>
                  <Button
                    type='primary'
                    disabled={
                      rosStatus[activeModule] === 'SUBMITTED' ||
                      isAllDeadlinePassed
                    }
                    style={{ background: '#026961', borderColor: '#026961' }}
                    onClick={() => handleConfirmRosSubmit(activeModule)}
                  >
                    {rosStatus[activeModule] === 'SUBMITTED'
                      ? compText('subLockedBtn')
                      : compText('subConfirmSubmitBtn')}
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      <CheckinCoreRuleModal
        open={checkinRuleOpen}
        onClose={() => setCheckinRuleOpen(false)}
      />
    </div>
  );
};
