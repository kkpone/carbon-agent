import guideLeftBg from '@src/assets/images/carbonAgent/guide/guide-left-bg.png';
import guideMenuDetailIcon from '@src/assets/images/carbonAgent/guide/icons/guide-menu-detail.svg';
import guideMenuHistoryIcon from '@src/assets/images/carbonAgent/guide/icons/guide-menu-history.svg';
import guideMenuProfileIcon from '@src/assets/images/carbonAgent/guide/icons/guide-menu-profile.svg';
import guideMenuStartIcon from '@src/assets/images/carbonAgent/guide/icons/guide-menu-start.svg';
import guideStep01 from '@src/assets/images/carbonAgent/guide/guide-step-01.png';
import guideStep02 from '@src/assets/images/carbonAgent/guide/guide-step-02.png';
import guideStep03 from '@src/assets/images/carbonAgent/guide/guide-step-03.png';
import guideStep04 from '@src/assets/images/carbonAgent/guide/guide-step-04.png';
import guideStep05 from '@src/assets/images/carbonAgent/guide/guide-step-05.png';
import guideStep06 from '@src/assets/images/carbonAgent/guide/guide-step-06.png';
import guideStep07 from '@src/assets/images/carbonAgent/guide/guide-step-07.png';
import guideStep08 from '@src/assets/images/carbonAgent/guide/guide-step-08.png';
import guideStep09 from '@src/assets/images/carbonAgent/guide/guide-step-09.png';
import guideStep10 from '@src/assets/images/carbonAgent/guide/guide-step-10.png';
import guideStep11 from '@src/assets/images/carbonAgent/guide/guide-step-11.png';
import guideStep12 from '@src/assets/images/carbonAgent/guide/guide-step-12.png';
import guideStep13 from '@src/assets/images/carbonAgent/guide/guide-step-13.png';
import guideStepEn01 from '@src/assets/images/carbonAgent/guide/guide-step-en-01.png';
import guideStepEn02 from '@src/assets/images/carbonAgent/guide/guide-step-en-02.png';
import guideStepEn03 from '@src/assets/images/carbonAgent/guide/guide-step-en-03.png';
import guideStepEn04 from '@src/assets/images/carbonAgent/guide/guide-step-en-04.png';
import guideStepEn05 from '@src/assets/images/carbonAgent/guide/guide-step-en-05.png';
import guideStepEn06 from '@src/assets/images/carbonAgent/guide/guide-step-en-06.png';
import guideStepEn07 from '@src/assets/images/carbonAgent/guide/guide-step-en-07.png';
import guideStepEn08 from '@src/assets/images/carbonAgent/guide/guide-step-en-08.png';
import guideStepEn09 from '@src/assets/images/carbonAgent/guide/guide-step-en-09.png';
import guideStepEn10 from '@src/assets/images/carbonAgent/guide/guide-step-en-10.png';
import guideStepEn11 from '@src/assets/images/carbonAgent/guide/guide-step-en-11.png';
import guideStepEn12 from '@src/assets/images/carbonAgent/guide/guide-step-en-12.png';
import guideStepEn13 from '@src/assets/images/carbonAgent/guide/guide-step-en-13.png';
import I18N, { LocaleType } from '@src/lang/I18N';
import { Modal } from 'antd';
import classNames from 'classnames';
import { useContext } from 'react';

import { LocaleContext } from '@/components/LocaleProvider';

import style from '../index.module.less';

type GuideSectionKey = 'start' | 'detail' | 'history' | 'profile';

type GuideSection = {
  key: GuideSectionKey;
  label: string;
  iconSrc: string;
};

type GuideStep = {
  section: GuideSectionKey;
  sectionStep: number;
  sectionTotal: number;
  title: string;
  description: string;
  imageSrc: string;
};

type AgentGuideModalProps = {
  open: boolean;
  stepIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onStepChange: (stepIndex: number) => void;
};

export const AGENT_GUIDE_STEP_COUNT = 13;

const GUIDE_STEP_IMAGES = [
  guideStep01,
  guideStep02,
  guideStep03,
  guideStep04,
  guideStep05,
  guideStep06,
  guideStep07,
  guideStep08,
  guideStep09,
  guideStep10,
  guideStep11,
  guideStep12,
  guideStep13,
];

const GUIDE_STEP_IMAGES_EN = [
  guideStepEn01,
  guideStepEn02,
  guideStepEn03,
  guideStepEn04,
  guideStepEn05,
  guideStepEn06,
  guideStepEn07,
  guideStepEn08,
  guideStepEn09,
  guideStepEn10,
  guideStepEn11,
  guideStepEn12,
  guideStepEn13,
];

const getGuideSections = (): GuideSection[] => [
  {
    key: 'start',
    label: I18N.carbonAgent.guideMenuStart,
    iconSrc: guideMenuStartIcon,
  },
  {
    key: 'detail',
    label: I18N.carbonAgent.guideMenuDetail,
    iconSrc: guideMenuDetailIcon,
  },
  {
    key: 'history',
    label: I18N.carbonAgent.guideMenuHistory,
    iconSrc: guideMenuHistoryIcon,
  },
  {
    key: 'profile',
    label: I18N.carbonAgent.guideMenuProfile,
    iconSrc: guideMenuProfileIcon,
  },
];

const getGuideSteps = (guideStepImages = GUIDE_STEP_IMAGES): GuideStep[] => [
  {
    section: 'start',
    sectionStep: 1,
    sectionTotal: 4,
    title: I18N.carbonAgent.guideMenuStart,
    description: I18N.carbonAgent.guideStartDescription,
    imageSrc: guideStepImages[0],
  },
  {
    section: 'start',
    sectionStep: 2,
    sectionTotal: 4,
    title: I18N.carbonAgent.guideMenuStart,
    description: I18N.carbonAgent.guideStartDescription,
    imageSrc: guideStepImages[1],
  },
  {
    section: 'start',
    sectionStep: 3,
    sectionTotal: 4,
    title: I18N.carbonAgent.guideMenuStart,
    description: I18N.carbonAgent.guideStartDescription,
    imageSrc: guideStepImages[2],
  },
  {
    section: 'start',
    sectionStep: 4,
    sectionTotal: 4,
    title: I18N.carbonAgent.guideMenuStart,
    description: I18N.carbonAgent.guideStartDescription,
    imageSrc: guideStepImages[3],
  },
  {
    section: 'detail',
    sectionStep: 1,
    sectionTotal: 4,
    title: I18N.carbonAgent.guideMenuDetail,
    description: I18N.carbonAgent.guideDetailDescription,
    imageSrc: guideStepImages[4],
  },
  {
    section: 'detail',
    sectionStep: 2,
    sectionTotal: 4,
    title: I18N.carbonAgent.guideMenuDetail,
    description: I18N.carbonAgent.guideDetailDescription,
    imageSrc: guideStepImages[5],
  },
  {
    section: 'detail',
    sectionStep: 3,
    sectionTotal: 4,
    title: I18N.carbonAgent.guideMenuDetail,
    description: I18N.carbonAgent.guideDetailDescription,
    imageSrc: guideStepImages[6],
  },
  {
    section: 'detail',
    sectionStep: 4,
    sectionTotal: 4,
    title: I18N.carbonAgent.guideMenuDetail,
    description: I18N.carbonAgent.guideDetailDescription,
    imageSrc: guideStepImages[7],
  },
  {
    section: 'history',
    sectionStep: 1,
    sectionTotal: 2,
    title: I18N.carbonAgent.guideMenuHistory,
    description: I18N.carbonAgent.guideHistoryDescription,
    imageSrc: guideStepImages[8],
  },
  {
    section: 'history',
    sectionStep: 2,
    sectionTotal: 2,
    title: I18N.carbonAgent.guideMenuHistory,
    description: I18N.carbonAgent.guideHistoryDescription,
    imageSrc: guideStepImages[9],
  },
  {
    section: 'profile',
    sectionStep: 1,
    sectionTotal: 3,
    title: I18N.carbonAgent.guideMenuProfile,
    description: I18N.carbonAgent.guideProfileDescription,
    imageSrc: guideStepImages[10],
  },
  {
    section: 'profile',
    sectionStep: 2,
    sectionTotal: 3,
    title: I18N.carbonAgent.guideMenuProfile,
    description: I18N.carbonAgent.guideProfileDescription,
    imageSrc: guideStepImages[11],
  },
  {
    section: 'profile',
    sectionStep: 3,
    sectionTotal: 3,
    title: I18N.carbonAgent.guideMenuProfile,
    description: I18N.carbonAgent.guideProfileDescription,
    imageSrc: guideStepImages[12],
  },
];

const clampStepIndex = (stepIndex: number, steps: GuideStep[]) =>
  Math.min(Math.max(stepIndex, 0), Math.max(steps.length - 1, 0));

const getStepCountText = (step: GuideStep) =>
  I18N.template(I18N.carbonAgent.guideStepCountFormat, {
    val1: step.sectionStep,
    val2: step.sectionTotal,
  });

const GuidePreview = ({ step }: { step: GuideStep }) => (
  <div className={style.agentGuidePreview} aria-hidden='true'>
    <img
      className={style.agentGuidePreviewImage}
      src={step.imageSrc}
      alt=''
      draggable={false}
    />
  </div>
);

const AgentGuideModal = ({
  open,
  stepIndex,
  onClose,
  onNext,
  onPrev,
  onStepChange,
}: AgentGuideModalProps) => {
  const { locale } = useContext(LocaleContext);
  const sections = getGuideSections();
  const steps = getGuideSteps(
    locale === LocaleType.enUS ? GUIDE_STEP_IMAGES_EN : GUIDE_STEP_IMAGES,
  );
  const resolvedStepIndex = clampStepIndex(stepIndex, steps);
  const currentStep = steps[resolvedStepIndex];
  const isFirstStep = resolvedStepIndex === 0;
  const isLastStep = resolvedStepIndex === steps.length - 1;

  const handleSectionClick = (sectionKey: GuideSectionKey) => {
    const nextIndex = steps.findIndex(step => step.section === sectionKey);

    if (nextIndex >= 0) {
      onStepChange(nextIndex);
    }
  };

  if (!currentStep) {
    return null;
  }

  return (
    <Modal
      centered
      destroyOnClose={false}
      footer={null}
      open={open}
      width={1024}
      closable={false}
      rootClassName={style.agentGuideModalRoot}
      className={style.agentGuideModal}
      onCancel={onClose}
    >
      <div className={style.agentGuideLayout}>
        <aside className={style.agentGuideIntro}>
          <img
            className={style.agentGuideIntroBackground}
            src={guideLeftBg}
            alt=''
            aria-hidden='true'
          />
          <div className={style.agentGuideIntroText}>
            <h2>{I18N.carbonAgent.guideWelcomeTitle}</h2>
            <p>{I18N.carbonAgent.guideWelcomeSubtitle}</p>
          </div>
          <nav
            className={style.agentGuideMenu}
            aria-label={I18N.carbonAgent.guideMenuAriaLabel}
          >
            {sections.map(section => {
              const active = section.key === currentStep.section;

              return (
                <button
                  key={section.key}
                  type='button'
                  className={classNames(style.agentGuideMenuItem, {
                    [style.agentGuideMenuItemActive]: active,
                  })}
                  aria-current={active ? 'step' : undefined}
                  onClick={() => handleSectionClick(section.key)}
                >
                  <span className={style.agentGuideMenuIcon}>
                    <img
                      className={style.agentGuideMenuIconImage}
                      src={section.iconSrc}
                      alt=''
                      aria-hidden='true'
                      draggable={false}
                    />
                  </span>
                  <span className={style.agentGuideMenuLabel}>
                    {section.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className={style.agentGuideContent}>
          <GuidePreview step={currentStep} />
          <div className={style.agentGuideStepCopy}>
            <h3>
              <span>{currentStep.title}</span>
              <em>{getStepCountText(currentStep)}</em>
            </h3>
            <p>{currentStep.description}</p>
          </div>
          <div className={style.agentGuideFooter}>
            <button
              className={style.agentGuideSecondaryButton}
              type='button'
              onClick={onClose}
            >
              {I18N.carbonAgent.guideClose}
            </button>
            <button
              className={style.agentGuideSecondaryButton}
              type='button'
              disabled={isFirstStep}
              onClick={onPrev}
            >
              {I18N.carbonAgent.guidePrev}
            </button>
            <button
              className={style.agentGuidePrimaryButton}
              type='button'
              onClick={onNext}
            >
              {isLastStep
                ? I18N.carbonAgent.guideDone
                : I18N.carbonAgent.guideNext}
            </button>
          </div>
        </section>
      </div>
    </Modal>
  );
};

export default AgentGuideModal;
