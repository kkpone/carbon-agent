import I18N from '@src/lang/I18N';

const ossPath = process.env.REACT_APP_API_URL_OSS;
const generalBanner = `${ossPath}/saas-product/general-bg.jpg`;
const industryBanner = `${ossPath}/saas-product/industry-bg.jpg`;
const adjustBanner = `${ossPath}/saas-product/adjust-bg.jpg`;
const controlledBanner = `${ossPath}/saas-product/controlled-bg.png`;
const consulting = `${ossPath}/consulting-service/caculate/20220302-141417.jpeg`;

const generalDatacheck = `${ossPath}/saas-product/general-datacheck.svg`;
const generalIndustry = `${ossPath}/saas-product/general-industry.svg`;
const generalReport = `${ossPath}/saas-product/general-report.svg`;

const industrySupply = `${ossPath}/saas-product/industry-supply.svg`;
const industryExquisite = `${ossPath}/saas-product/industry-exquisite.svg`;
const industryData = `${ossPath}/saas-product/industry-data.svg`;

const adjustInfo = `${ossPath}/saas-product/adjust-info.svg`;
const adjustmMatch = `${ossPath}/saas-product/adjust-match.svg`;
const adjusData = `${ossPath}/saas-product/adjust-data.svg`;
const adjustReport = `${ossPath}/saas-product/adjust-report.svg`;

// const controlledTab1 =
//   'https://oss-saas.carbonstop.net/saas-product/controlled-tab1.svg';
// const controlledTab2 =
//   'https://oss-saas.carbonstop.net/saas-product/controlled-tab2.svg';
// const controlledTab3 =
//   'https://oss-saas.carbonstop.net/saas-product/controlled-tab3.svg';

const greenMeetingTab1 = `${ossPath}/saas-product/greenmeeting-adjust.svg`;
const greenMeetingTab2 = `${ossPath}/saas-product/greenmeeting-report.svg`;
const greenMeetingBanner = `${ossPath}/saas-product/greenmeeting-banner.jpg`;

const controlledTab1 = `${ossPath}/saas-product/controlled-tab1.svg`;
const controlledTab2 = `${ossPath}/saas-product/controlled-tab2.svg`;
const controlledTab3 = `${ossPath}/saas-product/controlled-tab3.svg`;
/**
 * 建筑碳核算
 */
const carbonAccountBanner = `${ossPath}/saas-product/carbonAccountBanner.png`;
const carbonAccountBannerTab1 = `${ossPath}/saas-product/carbonAccountBannerTab1.png`;
const carbonAccountBannerTab2 = `${ossPath}saas-product/carbonAccountBannerTab2.png`;
const carbonAccountBannerTab3 = `${ossPath}/saas-product/carbonAccountBannerTab3.png`;
const Consultingicon = (index: string) =>
  `${ossPath}/consulting-service/caculate/${index}.svg`;

export interface TabListType {
  name: string;
  cont: string;
  imgPath: string;
  id: number;
}
export interface PageInfoType {
  title: string;
  intor: string;
  bannerImg: string;
  paramsData: { type: string };
  tabList: TabListType[];
}
/** pageType 为产品id */
export const creatPageInfo = (pageType: string): PageInfoType => {
  const infos = {
    Carbon_Footprint_General: {
      title: I18N.notOrder.carbonFootprintVerification3,
      intor: I18N.carbonFootprint.carbonFootprintVerification,
      bannerImg: generalBanner,
      paramsData: { type: 'tanzuji' },
      tabList: [
        {
          name: I18N.carbonFootprint.dataOverview,
          cont: I18N.carbonFootprint.carbonFootprintVerification3,
          imgPath: generalDatacheck,
          id: '1',
        },
        {
          name: I18N.carbonFootprint.industryBenchmarking,
          cont: I18N.carbonFootprint.sameTypeOfProduct,
          imgPath: generalIndustry,
          id: '2',
        },
        {
          name: I18N.carbonFootprint.generateReport,
          cont: I18N.carbonFootprint.oneClickAutomaticGeneration,
          imgPath: generalReport,
          id: '3',
        },
      ],
    },
    CarbonFootprint_Flag: {
      title: I18N.notOrder.carbonFootprintVerification2,
      intor: I18N.carbonFootprint.carbonFootprintVerification,
      bannerImg: generalBanner,
      paramsData: { type: 'tanzuji' },
      tabList: [
        {
          name: I18N.carbonFootprint.dataOverview,
          cont: I18N.carbonFootprint.carbonFootprintVerification3,
          imgPath: generalDatacheck,
          id: '1',
        },
        {
          name: I18N.carbonFootprint.industryBenchmarking,
          cont: I18N.carbonFootprint.sameTypeOfProduct,
          imgPath: generalIndustry,
          id: '2',
        },
        {
          name: I18N.carbonFootprint.generateReport,
          cont: I18N.carbonFootprint.oneClickAutomaticGeneration,
          imgPath: generalReport,
          id: '3',
        },
      ],
    },
    Product_PET: {
      title: I18N.notOrder.petRegeneration,
      intor: I18N.notOrder.carbonFootprintVerification,
      bannerImg: industryBanner,
      paramsData: { type: 'PET' },
      tabList: [
        {
          name: I18N.notOrder.fineAccounting,
          cont: I18N.notOrder.fullLifecycle,
          imgPath: industryExquisite,
          id: '1',
        },
        {
          name: I18N.notOrder.supplyChainManagement,
          cont: I18N.notOrder.accurateTraceabilityNumber,
          imgPath: industrySupply,
          id: '2',
        },
        {
          name: I18N.notOrder.dataBenchmarking,
          cont: I18N.notOrder.internalSimilarProducts,
          imgPath: industryData,
          id: '3',
        },
      ],
    },
    Product_PE: {
      title: I18N.notOrder.peRecycledPlastic,
      intor: I18N.notOrder.carbonFootprintVerification,
      bannerImg: industryBanner,
      paramsData: { type: 'PE' },
      tabList: [
        {
          name: I18N.notOrder.fineAccounting,
          cont: I18N.notOrder.fullLifecycle,
          imgPath: industryExquisite,
          id: '1',
        },
        {
          name: I18N.notOrder.supplyChainManagement,
          cont: I18N.notOrder.accurateTraceabilityNumber,
          imgPath: industrySupply,
          id: '2',
        },
        {
          name: I18N.notOrder.dataBenchmarking,
          cont: I18N.notOrder.internalSimilarProducts,
          imgPath: industryData,
          id: '3',
        },
      ],
    },
    Product_PVC: {
      title: I18N.notOrder.pvcRegeneration,
      intor: I18N.notOrder.carbonFootprintVerification,
      bannerImg: industryBanner,
      paramsData: { type: 'PVC' },
      tabList: [
        {
          name: I18N.notOrder.fineAccounting,
          cont: I18N.notOrder.fullLifecycle,
          imgPath: industryExquisite,
          id: '1',
        },
        {
          name: I18N.notOrder.supplyChainManagement,
          cont: I18N.notOrder.accurateTraceabilityNumber,
          imgPath: industrySupply,
          id: '2',
        },
        {
          name: I18N.notOrder.dataBenchmarking,
          cont: I18N.notOrder.internalSimilarProducts,
          imgPath: industryData,
          id: '3',
        },
      ],
    },
    ecaccounting_general: {
      title: I18N.notOrder.enterpriseCarbonAccounting,
      intor: I18N.notOrder.carbonCloudSaa,
      bannerImg: adjustBanner,
      paramsData: { type: 'tanhesuan' },
      tabList: [
        {
          name: I18N.notOrder.organizationalInformationManagement,
          cont: I18N.notOrder.organizationalDimensionReference,
          imgPath: adjustInfo,
          id: '1',
        },
        {
          name: I18N.carbonFootprint.matchingEmissionFactors,
          cont: I18N.notOrder.intelligentMatchingRow,
          imgPath: adjustmMatch,
          id: '2',
        },
        {
          name: I18N.notOrder.dataAnalysis,
          cont: I18N.notOrder.visualizationData,
          imgPath: adjusData,
          id: '3',
        },
        {
          name: I18N.notOrder.inventoryReport,
          cont: I18N.notOrder.oneClickGenerationClear,
          imgPath: adjustReport,
          id: '4',
        },
      ],
    },
    ecaccounting_controlled: {
      title: I18N.notOrder.carbonForPowerEnterprises,
      intor: I18N.notOrder.accordingToPowerGenerationCompanies,
      bannerImg: controlledBanner,
      paramsData: { type: 'electricity_tanhesuan' },
      tabList: [
        {
          name: I18N.notOrder.accountingDataManagement,
          cont: I18N.notOrder.importAccountingQuantity,
          imgPath: controlledTab1,
          id: '1',
        },
        {
          name: I18N.notOrder.generateReport,
          cont: I18N.notOrder.automaticProcessingQuantity,
          imgPath: controlledTab2,
          id: '2',
        },
        {
          name: I18N.notOrder.specialScenarioCore,
          cont: I18N.notOrder.supportMergingMachines,
          imgPath: controlledTab3,
          id: '3',
        },
      ],
    },
    greenMeeting: {
      title: I18N.notOrder.greenConference,
      intor: I18N.notOrder.accordingToLargeScaleActivities,
      bannerImg: greenMeetingBanner,
      paramsData: { type: 'green_meeting' },
      tabList: [
        {
          name: I18N.greenMeeting.carbonEmissionAccounting,
          cont: I18N.notOrder.basedOnAccountingModel2,
          imgPath: greenMeetingTab1,
          id: '1',
        },
        {
          name: I18N.carbonNeutral.carbonAccountingReport,
          cont: I18N.notOrder.quickGenerationAnd,
          imgPath: greenMeetingTab2,
          id: '2',
        },
      ],
    },
    Enterprise_CarbonAccount: {
      title: I18N.notOrder.buildingCarbonAccounting2,
      intor: I18N.notOrder.buildingCarbonAccounting,
      bannerImg: carbonAccountBanner,
      paramsData: { type: 'green_meeting' },
      tabList: [
        {
          name: I18N.notOrder.convenientAccounting,
          cont: I18N.notOrder.quickAccountingConstruction,
          imgPath: carbonAccountBannerTab1,
          id: '1',
        },
        {
          name: I18N.notOrder.reportGeneration,
          cont: I18N.notOrder.oneClickGenerationAndCreation,
          imgPath: carbonAccountBannerTab2,
          id: '2',
        },
        {
          name: I18N.notOrder.intelligentAnalysis,
          cont: I18N.notOrder.understandTheReductionOfBuildings,
          imgPath: carbonAccountBannerTab3,
          id: '3',
        },
      ],
    },
    carbon_DataManagemen: {
      title: I18N.notOrder.carbonDataManagement,
      intor: I18N.notOrder.includingDataPoints,
      bannerImg: carbonAccountBanner,
      paramsData: { type: 'green_meeting' },
      tabList: [
        {
          name: I18N.notOrder.dataAnalysis,
          cont: I18N.notOrder.visualKanban,
          imgPath: carbonAccountBannerTab1,
          id: '1',
        },
        {
          name: I18N.notOrder.processManagement,
          cont: I18N.notOrder.pdcaModule,
          imgPath: carbonAccountBannerTab2,
          id: '2',
        },
        {
          name: I18N.notOrder.dataReview,
          cont: I18N.notOrder.auditArchivingHigh,
          imgPath: carbonAccountBannerTab3,
          id: '3',
        },
      ],
    },
    Consulting_Service: {
      title: I18N.consulting.carbonEmissionCalculation,
      intor: I18N.notOrder.aUsefulLaborer,
      bannerImg: consulting,
      paramsData: { type: 'carbon_counter' },
      tabList: [
        {
          name: I18N.consulting.industrialWastewaterCarbon,
          cont: I18N.notOrder.multidimensionalSynthesis,
          imgPath: Consultingicon('figure1'),
          id: '1',
        },
        {
          name: I18N.consulting.outsourcedThermalCarbon,
          cont: I18N.notOrder.hotWaterSaturationSteam,
          imgPath: Consultingicon('figure2'),
          id: '2',
        },
        {
          name: I18N.consulting.aircraftTravelCarbon2,
          cont: '',
          imgPath: Consultingicon('wating'),
          id: '3',
        },
      ],
    },
    Enterprise_Carbon_Accounting: {
      title: I18N.carbonFootprint3.enterpriseCarbonAccounting,
      intor: I18N.notOrder.accordingToGhg,
      bannerImg: consulting,
      paramsData: { type: 'enterpriseCarbonAccounting' },
      tabList: [
        {
          name: I18N.greenMeeting.carbonEmissionAccounting,
          cont: I18N.notOrder.basedOnAccountingModel,
          imgPath: Consultingicon('emission-account'),
          id: '1',
        },
        {
          name: I18N.notOrder.carbonEmissionReport,
          cont: I18N.notOrder.canBeQuicklyGenerated,
          imgPath: Consultingicon('emssion-report'),
          id: '2',
        },
      ],
    },
  };
  return infos[pageType] || {};
};
export const submitObj = {
  Carbon_Footprint_General: '0',
  Product_PET: '0',
  Product_PE: '0',
  Product_PVC: '0',
  ecaccounting_general: '0',
  ecaccounting_controlled: '0',
  login: '0',
  carbon_counter: '0',
  Enterprise_Carbon_Accounting: '0',
  CarbonFootprint_Flag: '0',
};
