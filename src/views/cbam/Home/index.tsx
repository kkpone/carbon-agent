/**
 * @description 关于CBAM工具
 */
import I18N from '@src/lang/I18N';
import { Image } from 'antd';
import { useContext } from 'react';

import { LocaleContext } from '@/components/LocaleProvider';
import { LocaleType } from '@/lang/I18N';

import style from './index.module.less';
import enStepOne from '@/image/cbam/en_step1.png';
import enStepTwo from '@/image/cbam/en_step2.png';
import enStepThree from '@/image/cbam/en_step3.png';
import enStepFour from '@/image/cbam/en_step4.png';
import enStepFive from '@/image/cbam/en_step5.png';
import enStepSix from '@/image/cbam/en_step6.png';
import enStepSeven from '@/image/cbam/en_step7.png';
import enStepEight from '@/image/cbam/en_step8.png';
import enStepNine from '@/image/cbam/en_step9.png';
import zhStepOne from '@/image/cbam/zh_step1.png';
import zhStepTwo from '@/image/cbam/zh_step2.png';
import zhStepThree from '@/image/cbam/zh_step3.png';
import zhStepFour from '@/image/cbam/zh_step4.png';
import zhStepFive from '@/image/cbam/zh_step5.png';
import zhStepSix from '@/image/cbam/zh_step6.png';
import zhStepSeven from '@/image/cbam/zh_step7.png';
import zhStepEight from '@/image/cbam/zh_step8.png';
import zhStepNine from '@/image/cbam/zh_step9.png';

const CbamHome = () => {
  const { locale } = useContext(LocaleContext);
  const isEn = locale === LocaleType.enUS;
  /** 步骤列表 */
  const stepList = [
    {
      title: I18N.cbam.stepFactoryLetter,
      content: I18N.cbam.theFirstStepIsToAdd,
      describe: '',
      img: zhStepOne,
      imgEn: enStepOne,
    },
    {
      title: I18N.cbam.stepCba,
      content: I18N.cbam.theSecondStepIsToBuild,
      describe: '',
      img: zhStepTwo,
      imgEn: enStepTwo,
    },
    {
      title: I18N.cbam.stepCba2,
      content: I18N.cbam.thenYouNeedTo,
      describe: '',
      img: zhStepThree,
      imgEn: enStepThree,
    },
    {
      title: I18N.cbam.stepCba3,
      content: I18N.cbam.afterwardsYouWillNeedTo,
      describe: I18N.cbam.exampleOfOutsourcing,
      img: zhStepFour,
      imgEn: enStepFour,
    },
    {
      title: I18N.cbam.stepCba4,
      content: I18N.cbam.nextYouNeedTo,
      describe: I18N.cbam.forExampleDirectlyArranging,
      img: zhStepFive,
      imgEn: enStepFive,
    },
    {
      title: I18N.cbam.stepCba5,
      content: I18N.cbam.theNextStepIsToFillIn,
      describe: '',
      img: zhStepSix,
      imgEn: enStepSix,
    },
    {
      title: I18N.cbam.stepCba6,
      content: I18N.cbam.theFormIsAboutToBeCompleted,
      describe: I18N.cbam.inTheExampleTheCommunistPartyOfChina,
      img: zhStepSeven,
      imgEn: enStepSeven,
    },
    {
      title: I18N.cbam.stepCba7,
      content: I18N.cbam.youCanFollow,
      describe: '',
      img: zhStepEight,
      imgEn: enStepEight,
    },
    {
      title: I18N.cbam.stepCba8,
      content: I18N.cbam.youCanDoItThrough,
      describe: '',
      img: zhStepNine,
      imgEn: enStepNine,
    },
  ];

  return (
    <div className={style.wrapper}>
      <div className={style.rightWrapper}>
        {/* cbam介绍 */}
        <div>
          <p>{I18N.cbam.cbamIsComposedOf}</p>
        </div>

        {/* cbam工具介绍 */}
        <div>
          <p>{I18N.cbam.thisToolAimsTo}</p>
        </div>

        {/* 步骤 */}
        {stepList?.map(item => (
          <div>
            <h4>{item.title}</h4>
            <p>{item.content}</p>
            <p>{item.describe}</p>
            <Image src={isEn ? item.imgEn : item.img} />
          </div>
        ))}

        {/* 其他功能 */}
        <div>
          <h4>{I18N.cbam.otherFunctions}</h4>
          <p>{I18N.cbam.thisCbam}</p>
        </div>
      </div>
    </div>
  );
};

export default CbamHome;
