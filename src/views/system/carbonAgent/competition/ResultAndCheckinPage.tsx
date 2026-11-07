import {
  FireFilled,
  SearchOutlined,
  ShareAltOutlined,
  TrophyFilled,
} from '@ant-design/icons';
import { Button, Input, Segmented, Table, Tag } from 'antd';
import { useState } from 'react';

import style from './competition.module.less';
import type {
  AwardWinnerRow,
  CompetitionStagePhase,
  EnterpriseCheckinRow,
  IndividualCheckinRow,
  ParticipantRoleView,
} from './data';
import {
  ENTERPRISE_AWARD_WINNERS,
  ENTERPRISE_CHECKIN_PUBLIC_LIST,
  INDIVIDUAL_AWARD_WINNERS,
  INDIVIDUAL_CHECKIN_PUBLIC_LIST,
  SPECIAL_AWARD_WINNERS,
  compText,
} from './data';

type ResultAndCheckinPageProps = {
  subView: 'AWARDS' | 'CHECKIN';
  stagePhase: CompetitionStagePhase;
  roleView: ParticipantRoleView;
  onSwitchSubView: (view: 'AWARDS' | 'CHECKIN') => void;
  onOpenPoster: (type: 'ENTERPRISE' | 'INDIVIDUAL') => void;
};

export const ResultAndCheckinPage = ({
  subView,
  stagePhase,
  roleView,
  onSwitchSubView,
  onOpenPoster,
}: ResultAndCheckinPageProps) => {
  const [checkinBoardType, setCheckinBoardType] = useState<
    'ENTERPRISE' | 'INDIVIDUAL'
  >('ENTERPRISE');
  const [searchKeyword, setSearchKeyword] = useState('');

  const isPrelimPublished =
    stagePhase === 'PRELIM_DONE' || stagePhase === 'FINAL_DONE';
  const isFinalPublished = stagePhase === 'FINAL_DONE';

  const filteredEnterpriseCheckin = ENTERPRISE_CHECKIN_PUBLIC_LIST.filter(
    row =>
      !searchKeyword.trim() ||
      row.enterpriseName.toLowerCase().includes(searchKeyword.toLowerCase()),
  );

  const filteredIndividualCheckin = INDIVIDUAL_CHECKIN_PUBLIC_LIST.filter(
    row =>
      !searchKeyword.trim() ||
      row.personName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      row.maskedPhone.includes(searchKeyword.trim()) ||
      row.trackTeamLabel.toLowerCase().includes(searchKeyword.toLowerCase()),
  );

  const buildAwardColumns = (
    groupType: 'ENTERPRISE' | 'INDIVIDUAL' | 'SPECIAL',
  ) => [
    {
      title: compText('checkinColRank'),
      dataIndex: 'awardLevel',
      key: 'awardLevel',
      render: (val: string, row: AwardWinnerRow) => {
        const colorMap: Record<AwardWinnerRow['badgeColor'], string> = {
          gold: 'gold',
          silver: 'cyan',
          bronze: 'green',
          finalist: 'geekblue',
          special: 'purple',
        };
        return <Tag color={colorMap[row.badgeColor]}>{val}</Tag>;
      },
    },
    {
      title: (() => {
        if (groupType === 'INDIVIDUAL') return compText('resColPersonWinner');
        if (groupType === 'SPECIAL') return compText('resColSpecialSubject');
        return compText('checkinColEnterprise');
      })(),
      dataIndex: 'name',
      key: 'name',
      render: (val: string) => <strong>{val}</strong>,
    },
    {
      title:
        groupType === 'SPECIAL'
          ? compText('resColSpecialReason')
          : compText('checkinColTrackTeam'),
      dataIndex: 'trackOrCompany',
      key: 'trackOrCompany',
    },
    ...(groupType === 'SPECIAL'
      ? []
      : [
          {
            title: 'C阶段核算得分',
            dataIndex: 'cAvgOrScore',
            key: 'cAvgOrScore',
          },
        ]),
    {
      title: 'E阶段打卡积分与得分',
      dataIndex: 'ePointsAndScore',
      key: 'ePointsAndScore',
    },
    {
      title: '邀请/人数加成 (+2%~10%)',
      dataIndex: 'bonusRateText',
      key: 'bonusRateText',
      render: (val: string) => <Tag color='green'>{val}</Tag>,
    },
    {
      title: '综合成绩 / 荣誉',
      dataIndex: 'finalScoreText',
      key: 'finalScoreText',
      render: (val: string) => (
        <strong style={{ color: '#026961', fontSize: 15 }}>{val}</strong>
      ),
    },
  ];

  return (
    <div className={style.mainContainer}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        <Segmented
          size='large'
          value={subView}
          options={[
            { label: compText('resTabAwards'), value: 'AWARDS' },
            { label: compText('resTabCheckin'), value: 'CHECKIN' },
          ]}
          onChange={val => onSwitchSubView(val as 'AWARDS' | 'CHECKIN')}
        />

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {roleView === 'ENT_LEADER' ? (
            <Button
              type='primary'
              icon={<ShareAltOutlined />}
              style={{
                background: '#026961',
                borderColor: '#026961',
                borderRadius: 999,
              }}
              onClick={() => onOpenPoster('ENTERPRISE')}
            >
              {compText('resShareEnterprisePosterBtn')}
            </Button>
          ) : null}
          <Button
            icon={<ShareAltOutlined />}
            style={{
              borderColor: '#026961',
              color: '#026961',
              borderRadius: 999,
              fontWeight: 600,
            }}
            onClick={() => onOpenPoster('INDIVIDUAL')}
          >
            {compText('resShareIndividualPosterBtn')}
          </Button>
        </div>
      </div>

      {subView === 'CHECKIN' ? (
        <div>
          <div className={style.myPointsBanner}>
            <div>
              <div style={{ fontSize: 13, color: '#86efb5', fontWeight: 700 }}>
                {compText('checkinMyCardTitle')}
              </div>
              <h2
                style={{
                  color: '#fff',
                  fontSize: 22,
                  fontWeight: 800,
                  margin: '4px 0 8px',
                }}
              >
                {compText('checkinPageTitle')}
              </h2>
              <p
                style={{
                  color: 'rgba(255,255,255,0.84)',
                  fontSize: 13,
                  margin: 0,
                }}
              >
                {compText('checkinPageSub')}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                alignItems: 'flex-end',
              }}
            >
              {roleView !== 'INDIVIDUAL' ? (
                <Tag
                  color='cyan'
                  style={{ fontSize: 14, padding: '6px 14px', margin: 0 }}
                >
                  {compText('checkinMyEnterprisePoints', {
                    points: '18,900',
                    rank: 2,
                  })}
                </Tag>
              ) : null}
              <Tag
                color='green'
                style={{ fontSize: 14, padding: '6px 14px', margin: 0 }}
              >
                {compText('checkinMyPersonalPoints', {
                  points: '4,200',
                  rank: 2,
                })}
              </Tag>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              marginBottom: 20,
              flexWrap: 'wrap',
            }}
          >
            <Segmented
              size='large'
              value={checkinBoardType}
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
                setCheckinBoardType(val as 'ENTERPRISE' | 'INDIVIDUAL')
              }
            />

            <Input
              style={{ maxWidth: 340 }}
              prefix={<SearchOutlined />}
              allowClear
              value={searchKeyword}
              placeholder={compText('checkinSearchPlaceholder')}
              onChange={e => setSearchKeyword(e.target.value)}
            />
          </div>

          {checkinBoardType === 'ENTERPRISE' ? (
            <div>
              <div className={style.podiumGrid}>
                {ENTERPRISE_CHECKIN_PUBLIC_LIST.slice(0, 3).map(top => (
                  <div key={top.key} className={style.podiumCard}>
                    <div className={style.podiumRankBadge}>
                      TOP {top.rank}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>
                        {top.enterpriseName}
                      </div>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 800,
                          color: '#026961',
                          margin: '4px 0',
                        }}
                      >
                        {top.totalPoints.toLocaleString()} 分
                      </div>
                      <div style={{ fontSize: 12, color: '#6c757d' }}>
                        {compText('checkinColActiveUsers')}: {top.activeUsers}人
                        · E项 {top.eStageScore}分
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={style.cardBox}>
                <Table
                  rowKey='key'
                  pagination={false}
                  dataSource={filteredEnterpriseCheckin}
                  columns={[
                    {
                      title: compText('checkinColRank'),
                      dataIndex: 'rank',
                      key: 'rank',
                      render: (val: number) => (
                        <Tag color={val <= 3 ? 'gold' : 'default'}>
                          NO.{val}
                        </Tag>
                      ),
                    },
                    {
                      title: compText('checkinColEnterprise'),
                      dataIndex: 'enterpriseName',
                      key: 'enterpriseName',
                      render: (val: string, row: EnterpriseCheckinRow) => (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                          }}
                        >
                          <span
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: '#e9fff2',
                              color: '#026961',
                              fontWeight: 700,
                              fontSize: 12,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {row.logoText}
                          </span>
                          <strong>{val}</strong>
                        </div>
                      ),
                    },
                    {
                      title: compText('checkinColActiveUsers'),
                      dataIndex: 'activeUsers',
                      key: 'activeUsers',
                      render: (val: number) => `${String(val)  } 人`,
                    },
                    {
                      title: compText('checkinColCheckinTimes'),
                      dataIndex: 'checkinTimes',
                      key: 'checkinTimes',
                      render: (val: number) => `${val.toLocaleString()  } 次`,
                    },
                    {
                      title: compText('checkinColTotalPoints'),
                      dataIndex: 'totalPoints',
                      key: 'totalPoints',
                      render: (val: number) => (
                        <strong style={{ color: '#026961', fontSize: 15 }}>
                          {val.toLocaleString()} 分
                        </strong>
                      ),
                    },
                    {
                      title: compText('checkinColEScore'),
                      dataIndex: 'eStageScore',
                      key: 'eStageScore',
                      render: (val: number) => `${val.toFixed(1)  } 分`,
                    },
                    {
                      title: compText('checkinColStatus'),
                      key: 'status',
                      render: () => (
                        <Tag color='success'>
                          {compText('checkinVerifiedTag')}
                        </Tag>
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          ) : (
            <div>
              <div className={style.podiumGrid}>
                {INDIVIDUAL_CHECKIN_PUBLIC_LIST.slice(0, 3).map(top => (
                  <div key={top.key} className={style.podiumCard}>
                    <div className={style.podiumRankBadge}>
                      TOP {top.rank}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>
                        {top.personName} ({top.maskedPhone})
                      </div>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 800,
                          color: '#026961',
                          margin: '4px 0',
                        }}
                      >
                        {top.totalPoints.toLocaleString()} 分
                      </div>
                      <div style={{ fontSize: 12, color: '#6c757d' }}>
                        {top.trackTeamLabel}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={style.cardBox}>
                <Table
                  rowKey='key'
                  pagination={false}
                  dataSource={filteredIndividualCheckin}
                  columns={[
                    {
                      title: compText('checkinColRank'),
                      dataIndex: 'rank',
                      key: 'rank',
                      render: (val: number) => (
                        <Tag color={val <= 3 ? 'gold' : 'default'}>
                          NO.{val}
                        </Tag>
                      ),
                    },
                    {
                      title: compText('checkinColPersonName'),
                      dataIndex: 'personName',
                      key: 'personName',
                      render: (val: string) => <strong>{val}</strong>,
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
                      title: compText('checkinColDaysTimes'),
                      key: 'daysTimes',
                      render: (_: unknown, row: IndividualCheckinRow) =>
                        `${String(row.checkinDays) 
                        } 天 / ${ 
                        String(row.checkinTimes) 
                        } 次`,
                    },
                    {
                      title: compText('checkinColTotalPoints'),
                      dataIndex: 'totalPoints',
                      key: 'totalPoints',
                      render: (val: number) => (
                        <strong style={{ color: '#026961', fontSize: 15 }}>
                          {val.toLocaleString()} 分
                        </strong>
                      ),
                    },
                    {
                      title: compText('checkinColEScore'),
                      dataIndex: 'eStageScore',
                      key: 'eStageScore',
                      render: (val: number) => `${val.toFixed(1)  } 分`,
                    },
                    {
                      title: compText('checkinColStatus'),
                      key: 'status',
                      render: () => (
                        <Tag color='success'>
                          {compText('checkinVerifiedTag')}
                        </Tag>
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {!isPrelimPublished ? (
            <div
              className={style.cardBox}
              style={{ textAlign: 'center', padding: '48px 24px' }}
            >
              <FireFilled
                style={{ fontSize: 44, color: '#09c199', marginBottom: 14 }}
              />
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#04252b' }}>
                {compText('resOngoingBannerTitle')}
              </h2>
              <p style={{ color: '#6c757d', marginBottom: 24 }}>
                {compText('resOngoingBannerSub')}
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 16,
                  flexWrap: 'wrap',
                  marginBottom: 24,
                }}
              >
                <Tag color='cyan' style={{ fontSize: 14, padding: '8px 18px' }}>
                  {compText('resPrelimPublishDate')}
                </Tag>
                <Tag
                  color='green'
                  style={{ fontSize: 14, padding: '8px 18px' }}
                >
                  {compText('resFinalPublishDate')}
                </Tag>
              </div>
              <Button
                type='primary'
                size='large'
                style={{
                  background: '#026961',
                  borderColor: '#026961',
                  borderRadius: 999,
                }}
                onClick={() => onSwitchSubView('CHECKIN')}
              >
                {compText('subEViewFullPublicBtn')}
              </Button>
            </div>
          ) : null}

          {isPrelimPublished && !isFinalPublished ? (
            <div>
              <div className={style.sectionHeader}>
                <h2 className={style.sectionTitle}>
                  {compText('resPrelimSectionTitle')}
                </h2>
              </div>
              <div className={style.cardBox} style={{ marginBottom: 24 }}>
                <h3 className={style.cardTitle}>
                  {compText('resEnterpriseGroup')}
                </h3>
                <Table
                  rowKey='key'
                  pagination={false}
                  dataSource={ENTERPRISE_AWARD_WINNERS}
                  columns={buildAwardColumns('ENTERPRISE')}
                />
              </div>

              <div className={style.cardBox}>
                <h3 className={style.cardTitle}>
                  {compText('resIndividualGroup')}
                </h3>
                <Table
                  rowKey='key'
                  pagination={false}
                  dataSource={INDIVIDUAL_AWARD_WINNERS}
                  columns={buildAwardColumns('INDIVIDUAL')}
                />
              </div>
            </div>
          ) : null}

          {isFinalPublished ? (
            <div>
              <div className={style.sectionHeader}>
                <h2 className={style.sectionTitle}>
                  <TrophyFilled style={{ color: '#f59f00' }} />
                  <span>{compText('resFinalSectionTitle')}</span>
                </h2>
              </div>

              <div className={style.cardBox} style={{ marginBottom: 24 }}>
                <h3 className={style.cardTitle}>
                  {compText('resEnterpriseGroup')}
                </h3>
                <Table
                  rowKey='key'
                  pagination={false}
                  dataSource={ENTERPRISE_AWARD_WINNERS}
                  columns={buildAwardColumns('ENTERPRISE')}
                />
              </div>

              <div className={style.cardBox} style={{ marginBottom: 24 }}>
                <h3 className={style.cardTitle}>
                  {compText('resIndividualGroup')}
                </h3>
                <Table
                  rowKey='key'
                  pagination={false}
                  dataSource={INDIVIDUAL_AWARD_WINNERS}
                  columns={buildAwardColumns('INDIVIDUAL')}
                />
              </div>

              <div className={style.cardBox}>
                <h3 className={style.cardTitle}>
                  {compText('resSpecialAwardsGroup')}
                </h3>
                <Table
                  rowKey='key'
                  pagination={false}
                  dataSource={SPECIAL_AWARD_WINNERS}
                  columns={buildAwardColumns('SPECIAL')}
                />
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
