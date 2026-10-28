import I18N from '@src/lang/I18N';
import { HomePageProps } from '@src/components/Homepage';

const getImgPath = (filename: string) =>
  `${process.env.REACT_APP_API_URL_OSS}/saas-product/carbonFootprint3/homePage/${filename}.png`;

export const CarbonFootprint3HomeConfig: HomePageProps = {
  title: I18N.carbonFootprint.carbonFootprintVerification2,
  introduction: [
    I18N.carbonFootprint3.carbonFootprintVerification7,
    I18N.carbonFootprint3.withSimplicityAndClarity,
    I18N.carbonFootprint3.atTheSameTimeItCanBeLinked,
  ],
  introTabs: [
    {
      label: I18N.carbonFootprint.carbonFootprintAccounting,
      cont: I18N.carbonFootprint3.theBoundaryOfVisualization,
      id: '0',
      imgPath: getImgPath('00'),
      enImgPath: getImgPath('0-en'),
    },
    {
      label: I18N.carbonFootprint3.supplyChainCollaboration,
      cont: I18N.carbonFootprint3.canConnectUpAndDown,
      id: '1',
      imgPath: getImgPath('01'),
      enImgPath: getImgPath('1-en'),
    },
    {
      label: I18N.carbonFootprint3.carbonFootprintVerification6,
      cont: I18N.carbonFootprint3.multidimensionalPresentation,
      id: '2',
      imgPath: getImgPath('02'),
      enImgPath: getImgPath('2-en'),
    },
    {
      label: I18N.carbonFootprint3.carbonFootprintVerification4,
      cont: I18N.carbonFootprint3.canBeQuicklyGenerated,
      id: '3',
      imgPath: getImgPath('03'),
      enImgPath: getImgPath('3-en'),
    },
  ],
  introImage: getImgPath('introImage'),
};
