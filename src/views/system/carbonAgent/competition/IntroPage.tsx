import {
  SafetyCertificateOutlined,
  ThunderboltFilled,
  TrophyOutlined,
} from '@ant-design/icons';
import { Button, Tag } from 'antd';
import classNames from 'classnames';

import style from './competition.module.less';
import type { CompetitionStagePhase } from './data';
import { compText } from './data';

type IntroPageProps = {
  stagePhase: CompetitionStagePhase;
  onGoRegister: () => void;
  onOpenFullMechanism: () => void;
};

export const IntroPage = ({
  stagePhase,
  onGoRegister,
  onOpenFullMechanism,
}: IntroPageProps) => {
  const isRegistrationClosed =
    stagePhase === 'REG_CLOSED' ||
    stagePhase === 'CORP_CARBON' ||
    stagePhase === 'PRELIM_DONE' ||
    stagePhase === 'FINAL_DONE';

  const timelineItems = [
    {
      date: compText('timelineStep1Date'),
      title: compText('timelineStep1Title'),
      desc: compText('timelineStep1Desc'),
      active: false,
    },
    {
      date: compText('timelineStep2Date'),
      title: compText('timelineStep2Title'),
      desc: compText('timelineStep2Desc'),
      active: false,
    },
    {
      date: compText('timelineStep3Date'),
      title: compText('timelineStep3Title'),
      desc: compText('timelineStep3Desc'),
      active: stagePhase === 'PROD_CARBON',
    },
    {
      date: compText('timelineStep4Date'),
      title: compText('timelineStep4Title'),
      desc: compText('timelineStep4Desc'),
      active: stagePhase === 'CORP_CARBON' || stagePhase === 'REG_CLOSED',
    },
    {
      date: compText('timelineStep5Date'),
      title: compText('timelineStep5Title'),
      desc: compText('timelineStep5Desc'),
      active: false,
    },
    {
      date: compText('timelineStep6Date'),
      title: compText('timelineStep6Title'),
      desc: compText('timelineStep6Desc'),
      active: stagePhase === 'PRELIM_DONE',
    },
    {
      date: compText('timelineStep7Date'),
      title: compText('timelineStep7Title'),
      desc: compText('timelineStep7Desc'),
      active: stagePhase === 'FINAL_DONE',
    },
  ];

  return (
    <div>
      <section className={style.heroBanner}>
        <div className={style.heroInner}>
          <div className={style.heroKicker}>
            <ThunderboltFilled />
            <span>{compText('heroBadge')}</span>
          </div>
          <h1 className={style.heroMainTitle}>{compText('heroTitle')}</h1>
          <p className={style.heroSubText}>{compText('heroSubtitle')}</p>
          <div className={style.heroCtaRow}>
            <button
              type='button'
              className={style.heroPrimaryBtn}
              disabled={isRegistrationClosed}
              onClick={onGoRegister}
            >
              {isRegistrationClosed
                ? compText('heroRegClosedCta')
                : compText('heroPrimaryCta')}
            </button>
            <button
              type='button'
              className={style.heroSecondaryBtn}
              onClick={onOpenFullMechanism}
            >
              {compText('heroSecondaryCta')}
            </button>
          </div>
        </div>
      </section>

      <nav className={style.anchorNavBar} aria-label={compText('navIntro')}>
        {[
          { id: 'comp-sec-bg', label: compText('anchorBg') },
          { id: 'comp-sec-goals', label: compText('anchorGoals') },
          { id: 'comp-sec-tracks', label: compText('anchorTracks') },
          { id: 'comp-sec-creos', label: compText('anchorMechanism') },
          { id: 'comp-sec-rewards', label: compText('anchorRewards') },
          { id: 'comp-sec-timeline', label: compText('anchorTimeline') },
          { id: 'comp-sec-org', label: compText('anchorOrganizers') },
        ].map(anchor => (
          <button
            key={anchor.id}
            type='button'
            className={style.anchorPill}
            onClick={() => {
              document
                .getElementById(anchor.id)
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            {anchor.label}
          </button>
        ))}
      </nav>

      <div className={style.mainContainer}>
        {/* 01 大赛背景 */}
        <section id='comp-sec-bg' className={style.sectionBlock}>
          <div className={style.sectionHeader}>
            <div>
              <h2 className={style.sectionTitle}>
                {compText('introBgSectionTitle')}
              </h2>
              <p className={style.sectionSubtitle}>
                {compText('introBgSectionLead')}
              </p>
            </div>
          </div>
          <div className={style.grid3}>
            <div className={style.cardBox}>
              <h3 className={style.cardTitle}>
                {compText('introBgCard1Title')}
              </h3>
              <p className={style.cardDesc}>{compText('introBgCard1Desc')}</p>
            </div>
            <div className={style.cardBox}>
              <h3 className={style.cardTitle}>
                {compText('introBgCard2Title')}
              </h3>
              <p className={style.cardDesc}>{compText('introBgCard2Desc')}</p>
            </div>
            <div className={style.cardBox}>
              <h3 className={style.cardTitle}>
                {compText('introBgCard3Title')}
              </h3>
              <p className={style.cardDesc}>{compText('introBgCard3Desc')}</p>
            </div>
          </div>
        </section>

        {/* 02 大赛目标 */}
        <section id='comp-sec-goals' className={style.sectionBlock}>
          <div className={style.sectionHeader}>
            <h2 className={style.sectionTitle}>
              {compText('introGoalsTitle')}
            </h2>
          </div>
          <div className={style.grid3}>
            {[
              {
                num: '01',
                title: compText('introGoal1Title'),
                desc: compText('introGoal1Desc'),
              },
              {
                num: '02',
                title: compText('introGoal2Title'),
                desc: compText('introGoal2Desc'),
              },
              {
                num: '03',
                title: compText('introGoal3Title'),
                desc: compText('introGoal3Desc'),
              },
              {
                num: '04',
                title: compText('introGoal4Title'),
                desc: compText('introGoal4Desc'),
              },
              {
                num: '05',
                title: compText('introGoal5Title'),
                desc: compText('introGoal5Desc'),
              },
              {
                num: '06',
                title: compText('introGoal6Title'),
                desc: compText('introGoal6Desc'),
              },
            ].map(item => (
              <div key={item.num} className={style.cardBox}>
                <Tag color='cyan' style={{ fontWeight: 700, marginBottom: 10 }}>
                  GOAL {item.num}
                </Tag>
                <h3 className={style.cardTitle}>{item.title}</h3>
                <p className={style.cardDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 03 两大赛道 */}
        <section id='comp-sec-tracks' className={style.sectionBlock}>
          <div className={style.sectionHeader}>
            <h2 className={style.sectionTitle}>
              {compText('introTracksTitle')}
            </h2>
          </div>
          <div className={style.grid2}>
            <div className={style.trackCard}>
              <span className={style.trackBadge}>
                {compText('introTrackEntBadge')}
              </span>
              <h3 className={style.cardTitle} style={{ fontSize: 22 }}>
                {compText('introTrackEntTitle')}
              </h3>
              <p className={style.trackLine}>
                {compText('introTrackEntTarget')}
              </p>
              <p className={style.trackLine}>{compText('introTrackEntFit')}</p>
              <p className={style.trackLine} style={{ fontWeight: 600 }}>
                {compText('introTrackEntDeliver')}
              </p>
              <Button
                type='primary'
                disabled={isRegistrationClosed}
                style={{
                  marginTop: 14,
                  background: '#026961',
                  borderColor: '#026961',
                  borderRadius: 999,
                }}
                onClick={onGoRegister}
              >
                {isRegistrationClosed
                  ? compText('heroRegClosedCta')
                  : compText('regEnterEnterpriseBtn')}
              </Button>
            </div>

            <div className={style.trackCard}>
              <span className={style.trackBadge}>
                {compText('introTrackIndBadge')}
              </span>
              <h3 className={style.cardTitle} style={{ fontSize: 22 }}>
                {compText('introTrackIndTitle')}
              </h3>
              <p className={style.trackLine}>
                {compText('introTrackIndTarget')}
              </p>
              <p className={style.trackLine}>{compText('introTrackIndFit')}</p>
              <p className={style.trackLine} style={{ fontWeight: 600 }}>
                {compText('introTrackIndDeliver')}
              </p>
              <Button
                type='primary'
                disabled={isRegistrationClosed}
                style={{
                  marginTop: 14,
                  background: '#026961',
                  borderColor: '#026961',
                  borderRadius: 999,
                }}
                onClick={onGoRegister}
              >
                {isRegistrationClosed
                  ? compText('heroRegClosedCta')
                  : compText('regEnterIndividualBtn')}
              </Button>
            </div>
          </div>
        </section>

        {/* 04 大赛机制 CREOS */}
        <section id='comp-sec-creos' className={style.sectionBlock}>
          <div className={style.sectionHeader}>
            <div>
              <h2 className={style.sectionTitle}>
                {compText('introMechanismTitle')}
              </h2>
              <p className={style.sectionSubtitle}>
                {compText('introMechanismSub')}
              </p>
            </div>
            <Button
              icon={<SafetyCertificateOutlined />}
              style={{
                borderColor: '#026961',
                color: '#026961',
                borderRadius: 999,
                fontWeight: 600,
              }}
              onClick={onOpenFullMechanism}
            >
              {compText('introMechanismDetailBtn')}
            </Button>
          </div>
          <div className={style.grid5}>
            {[
              {
                letter: 'C',
                title: compText('creosCTitle'),
                desc: compText('creosCDesc'),
              },
              {
                letter: 'R',
                title: compText('creosRTitle'),
                desc: compText('creosRDesc'),
              },
              {
                letter: 'E',
                title: compText('creosETitle'),
                desc: compText('creosEDesc'),
              },
              {
                letter: 'O',
                title: compText('creosOTitle'),
                desc: compText('creosODesc'),
              },
              {
                letter: 'S',
                title: compText('creosSTitle'),
                desc: compText('creosSDesc'),
              },
            ].map(item => (
              <div key={item.letter} className={style.creosStageCard}>
                <div>
                  <span className={style.creosLetter}>{item.letter}</span>
                  <h3 className={style.cardTitle} style={{ fontSize: 15 }}>
                    {item.title}
                  </h3>
                  <p className={style.cardDesc} style={{ fontSize: 13 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 05 大赛奖励与参赛收益 */}
        <section id='comp-sec-rewards' className={style.sectionBlock}>
          <div className={style.sectionHeader}>
            <h2 className={style.sectionTitle}>
              {compText('introRewardsTitle')}
            </h2>
          </div>
          <div className={style.grid3} style={{ marginBottom: 18 }}>
            <div className={style.cardBox} style={{ borderColor: '#f59f00' }}>
              <TrophyOutlined
                style={{ fontSize: 28, color: '#f59f00', marginBottom: 8 }}
              />
              <h3 className={style.cardTitle}>{compText('rewardGold')}</h3>
              <p className={style.cardDesc}>{compText('rewardGoldDesc')}</p>
            </div>
            <div className={style.cardBox} style={{ borderColor: '#09c199' }}>
              <TrophyOutlined
                style={{ fontSize: 28, color: '#09c199', marginBottom: 8 }}
              />
              <h3 className={style.cardTitle}>{compText('rewardSilver')}</h3>
              <p className={style.cardDesc}>{compText('rewardSilverDesc')}</p>
            </div>
            <div className={style.cardBox} style={{ borderColor: '#026961' }}>
              <TrophyOutlined
                style={{ fontSize: 28, color: '#026961', marginBottom: 8 }}
              />
              <h3 className={style.cardTitle}>{compText('rewardBronze')}</h3>
              <p className={style.cardDesc}>{compText('rewardBronzeDesc')}</p>
            </div>
          </div>

          <div className={style.bonusAlertBanner}>
            <div>
              <strong>{compText('rewardCertTitle')}：</strong>
              <span>{compText('rewardCertDesc')}</span>
            </div>
          </div>
        </section>

        {/* 06 大赛时间线 */}
        <section id='comp-sec-timeline' className={style.sectionBlock}>
          <div className={style.sectionHeader}>
            <h2 className={style.sectionTitle}>
              {compText('introTimelineTitle')}
            </h2>
          </div>
          <div className={style.timelineGrid}>
            {timelineItems.map(step => (
              <div
                key={step.title}
                className={classNames(style.timelineCard, {
                  [style.timelineCardActive]: step.active,
                })}
              >
                <div className={style.timelineDate}>{step.date}</div>
                <div className={style.timelineTitle}>{step.title}</div>
                <p className={style.timelineDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 07 大赛举办方 */}
        <section id='comp-sec-org' className={style.sectionBlock}>
          <div className={style.sectionHeader}>
            <h2 className={style.sectionTitle}>
              {compText('introOrganizersTitle')}
            </h2>
          </div>
          <div className={style.grid2}>
            <div className={style.cardBox}>
              <h3 className={style.cardTitle}>{compText('orgCoHost')}</h3>
              <p className={style.cardDesc}>{compText('orgCoHostList')}</p>
            </div>
            <div className={style.cardBox}>
              <h3 className={style.cardTitle}>{compText('orgReview')}</h3>
              <p className={style.cardDesc}>{compText('orgReviewList')}</p>
            </div>
            <div className={style.cardBox}>
              <h3 className={style.cardTitle}>{compText('orgAcademic')}</h3>
              <p className={style.cardDesc}>{compText('orgAcademicList')}</p>
            </div>
            <div className={style.cardBox}>
              <h3 className={style.cardTitle}>{compText('orgPartners')}</h3>
              <p className={style.cardDesc}>{compText('orgPartnersList')}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
