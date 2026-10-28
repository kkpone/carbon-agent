import { QuestionCircleOutlined, RedoOutlined } from '@ant-design/icons';
import step1Img from '@assets/svg/cf_guide_step1.svg';
import currStep1Img from '@assets/svg/cf_guide_step1_g.svg';
import step2Img from '@assets/svg/cf_guide_step2.svg';
import currStep2Img from '@assets/svg/cf_guide_step2_g.svg';
import step3Img from '@assets/svg/cf_guide_step3.svg';
import currStep3Img from '@assets/svg/cf_guide_step3_g.svg';
import I18N, { LocaleType } from '@src/lang/I18N';
import { Button, Modal } from 'antd';
import classNames from 'classnames';
import { FC, useContext, useEffect, useState } from 'react';

import styles from './index.module.less';
import { LocaleContext } from '@/components/LocaleProvider';

const Guide: FC = () => {
  const [visible, setVisible] = useState(false);

  const [step, setStep] = useState(0);

  const getFilePath = (fileName: string) =>
    `${process.env.REACT_APP_API_URL_OSS}/saas-product/carbonFootprint3/guide/${fileName}.png`;

  const { locale } = useContext(LocaleContext);

  const isEn = locale === LocaleType.enUS;

  const stepConfig = [
    {
      title: I18N.carbonFootprint3.addProduct,
      process: '（1/2）',
      img: getFilePath('step1'),
      enImg: getFilePath('en_step1'),
      desc: <span>{I18N.carbonFootprint3.clickToAddProduct}</span>,
    },
    {
      title: I18N.carbonFootprint3.fillOutProductLetter,
      process: '（2/2）',
      img: getFilePath('step2'),
      enImg: getFilePath('en_step2'),
      desc: <span>{I18N.carbonFootprint3.fillInTheProducts}</span>,
    },
    {
      title: I18N.carbonFootprint3.carbonFootprintAccounting2,
      process: '（1/4）',
      img: getFilePath('step3'),
      enImg: getFilePath('en_step3'),
      desc: <span>{I18N.carbonFootprint3.buildingProductModels}</span>,
    },
    {
      title: I18N.carbonFootprint3.carbonFootprintAccounting,
      process: '（2/4）',
      img: getFilePath('step4'),
      enImg: getFilePath('en_step4'),
      desc: <span>{I18N.carbonFootprint3.whenModelingItIsPossibleTo}</span>,
    },
    {
      title: I18N.carbonFootprint3.viewCarbonFootprint,
      process: '（3/4）',
      img: getFilePath('step5'),
      enImg: getFilePath('en_step5'),
      desc: <span>{I18N.carbonFootprint3.afterModelingIsCompleted}</span>,
    },
    {
      title: I18N.carbonFootprint3.fillOutTheReportLetter,
      process: '（4/4）',
      img: getFilePath('step6'),
      enImg: getFilePath('en_step6'),
      desc: <span>{I18N.carbonFootprint3.editReportName}</span>,
    },
    {
      title: I18N.carbonFootprint.carbonFootprintReport,
      process: '（1/1）',
      img: getFilePath('step7'),
      enImg: getFilePath('en_step7'),
      desc: <span>{I18N.carbonFootprint3.expandableReport}</span>,
    },
  ];

  const currStep = stepConfig[step] || step[0];

  useEffect(() => {
    setStep(0);
  }, [visible]);

  return (
    <>
      <div className={styles.guide} onClick={() => setVisible(true)}>
        <QuestionCircleOutlined />
        <span className={styles.guideText}>
          {I18N.carbonFootprint3.beginnerGuidance}
        </span>
      </div>
      <Modal
        className={styles.guideModal}
        open={visible}
        closable={false}
        maskClosable
        footer={null}
        width={1064}
        onCancel={() => setVisible(false)}
      >
        <div className={styles.guideContent}>
          <div className={styles.guideContentLeft}>
            <div className={styles.guideTitle}>
              {I18N.carbonFootprint3.welcomeToCarbon}
            </div>
            <div className={styles.guideDesc}>
              {I18N.carbonFootprint3.teachingThroughBeginners}
            </div>
            <div className={styles.stepContent}>
              <div
                className={classNames(styles.stepItem, {
                  [styles.currentStepItem]: step <= 1,
                })}
              >
                <img
                  className={styles.stepImg}
                  alt=''
                  src={step <= 1 ? currStep1Img : step1Img}
                />
                <span>{I18N.carbonFootprint3.newProductsAdded}</span>
              </div>
              <div
                className={classNames(styles.stepItem, {
                  [styles.currentStepItem]: step >= 2 && step <= 5,
                })}
              >
                <img
                  className={styles.stepImg}
                  alt=''
                  src={step >= 2 && step <= 5 ? currStep2Img : step2Img}
                />
                <span>{I18N.carbonFootprint.carbonFootprintAccounting}</span>
              </div>
              <div
                className={classNames(styles.stepItem, {
                  [styles.currentStepItem]: step > 5,
                })}
              >
                <img
                  className={styles.stepImg}
                  alt=''
                  src={step > 5 ? currStep3Img : step3Img}
                />
                <span>{I18N.carbonFootprint.carbonFootprintReport}</span>
              </div>
            </div>
          </div>
          <div className={styles.guideContentRight}>
            <div className={styles.guideImgWrapper}>
              <img
                className={styles.guideImg}
                alt=''
                src={isEn ? currStep.enImg : currStep.img}
              />
            </div>
            <div className={styles.stepIntro}>
              <div className={styles.stepIntroTitle}>
                <span>{currStep.title}</span>
                <span className={styles.stepIntroProcess}>
                  {currStep.process}
                </span>
              </div>
              <div className={styles.stepIntroDesc}>{currStep.desc}</div>
            </div>
            <div className={styles.buttonContent}>
              {step === stepConfig.length - 1 && (
                <span className={styles.reDoBtn} onClick={() => setStep(0)}>
                  <RedoOutlined className={styles.reDoIcon} />
                  {I18N.carbonFootprint3.takeAnotherLook}
                </span>
              )}
              {step > 0 && (
                <Button
                  className={styles.prevBtn}
                  onClick={() => setStep(step - 1)}
                >
                  {I18N.carbonFootprint3.lastPage}
                </Button>
              )}
              <Button
                type='primary'
                onClick={() => {
                  if (step === stepConfig.length - 1) {
                    setVisible(false);
                  } else {
                    setStep(step + 1);
                  }
                }}
              >
                {step === stepConfig.length - 1
                  ? I18N.carbonFootprint3.close
                  : I18N.carbonFootprint3.nextPage}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Guide;
