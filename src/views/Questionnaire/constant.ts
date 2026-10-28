import I18N from '@src/lang/I18N';

export const STAFF_INFO = {
  NAME: 0,
  PHONE: 1,
  EMAIL: 2,
  DEPARTMENT: 3,
  WORK_NO: 4,
};

export const CONTACT_REQUIRED_STAFF_INFOS = [
  STAFF_INFO.PHONE,
  STAFF_INFO.EMAIL,
  STAFF_INFO.WORK_NO,
];

export const STAFF_INFO_LABEL = {
  [STAFF_INFO.NAME]: I18N.system.name,
  [STAFF_INFO.PHONE]: I18N.questionnaire.mobilePhone,
  [STAFF_INFO.EMAIL]: I18N.carbonFootprint.mailbox,
  [STAFF_INFO.DEPARTMENT]: I18N.dashborad.department,
  [STAFF_INFO.WORK_NO]: I18N.questionnaire.workNumber,
};

export const QUESTIONNAIRE_STATUS = {
  UN_PUBLISH: 0,
  PUBLISHED: 1,
  CLOSE: 2,
};

export const QUESTIONNAIRE_STATUS_LABEL = {
  [QUESTIONNAIRE_STATUS.UN_PUBLISH]:
    I18N.supplyChainCarbonManagement.unpublished,
  [QUESTIONNAIRE_STATUS.PUBLISHED]: I18N.supplyChainCarbonManagement.published,
  [QUESTIONNAIRE_STATUS.CLOSE]: I18N.cbam.closed,
};

export const QUESTIONNAIRE_CATEGORY = {
  COMMUTING: 0,
};

export const QUESTIONNAIRE_CATEGORY_LABEL = () => ({
  [QUESTIONNAIRE_CATEGORY.COMMUTING]:
    I18N.enterpriseCarbonAccount2.employeeCommuting,
});

export const TRANSPORT_WAY = {
  WALK_OR_BIKES: 0,
  ELECTRIC_BIKES: 1,
  MOTORCYCLE: 5,
  SHUTTLE_BUS: 4,
  BUS: 3,
  SUBWAY: 2,
  NEW_ENERGY_CAR: 6,
  CAR: 7,
  HIGH_SPEED_RAIL: 8,
};

export const TRANSPORT_WAY_LABEL = () => ({
  [TRANSPORT_WAY.WALK_OR_BIKES]: I18N.questionnaire.walkingAndCycling,
  [TRANSPORT_WAY.ELECTRIC_BIKES]: I18N.questionnaire.electricBicycle,
  [TRANSPORT_WAY.MOTORCYCLE]: I18N.questionnaire.fuelPoweredMotorcycle,
  [TRANSPORT_WAY.SHUTTLE_BUS]: I18N.questionnaire.shuttleBus,
  [TRANSPORT_WAY.BUS]: I18N.questionnaire.bus,
  [TRANSPORT_WAY.SUBWAY]: I18N.questionnaire.metro,
  [TRANSPORT_WAY.NEW_ENERGY_CAR]: I18N.questionnaire.newEnergyVehicles,
  [TRANSPORT_WAY.CAR]: I18N.questionnaire.oilTruck,
  [TRANSPORT_WAY.HIGH_SPEED_RAIL]: I18N.questionnaire.highSpeedRail,
});

export const TRANSPORT_WAY_ICON = {
  [TRANSPORT_WAY.WALK_OR_BIKES]: 'icon-icon_bicycle',
  [TRANSPORT_WAY.ELECTRIC_BIKES]: 'icon-icon_e-bicycle',
  [TRANSPORT_WAY.MOTORCYCLE]: 'icon-icon_e-bicycle',
  [TRANSPORT_WAY.SHUTTLE_BUS]: 'icon-icon_bus',
  [TRANSPORT_WAY.BUS]: 'icon-icon_bus',
  [TRANSPORT_WAY.SUBWAY]: 'icon-icon_Subway',
  [TRANSPORT_WAY.NEW_ENERGY_CAR]: 'icon-icon_e-car',
  [TRANSPORT_WAY.CAR]: 'icon-icon_oilcar',
  [TRANSPORT_WAY.HIGH_SPEED_RAIL]: 'icon-icon_railway',
};

export const TRANSPORT_WAY_COLOR = {
  [TRANSPORT_WAY.WALK_OR_BIKES]: '#57D9B8',
  [TRANSPORT_WAY.ELECTRIC_BIKES]: '#2FCCAA',
  [TRANSPORT_WAY.MOTORCYCLE]: '#005854',
  [TRANSPORT_WAY.SHUTTLE_BUS]: '#026961',
  [TRANSPORT_WAY.BUS]: '#048677',
  [TRANSPORT_WAY.SUBWAY]: '#0CBF9F',
  [TRANSPORT_WAY.NEW_ENERGY_CAR]: '#004541',
  [TRANSPORT_WAY.CAR]: '#004245',
  [TRANSPORT_WAY.HIGH_SPEED_RAIL]: '#08A28B',
};

export const BUS_TYPE = {
  SUPPORT: 0,
  THIRD_PART: 1,
  UN_SUPPORT: 2,
};

export const BUS_TYPE_LABEL = {
  [BUS_TYPE.SUPPORT]: I18N.questionnaire.yesAndTheBusIs,
  [BUS_TYPE.THIRD_PART]: I18N.questionnaire.itsAThirdPartyCar,
  [BUS_TYPE.UN_SUPPORT]: I18N.carbonNeutral.no,
};

export const TIME_TYPE = {
  PREV: 0,
  DURING: 1,
  AFTER: 2,
};

export const WORKDAY_TYPE = {
  WEEKLY: 0,
  YEARLY: 1,
};

export const WORKDAY_TYPE_LABEL = {
  [WORKDAY_TYPE.WEEKLY]: I18N.questionnaire.byWeek,
  [WORKDAY_TYPE.YEARLY]: I18N.questionnaire.byYear,
};

export const CHANGE_STATUS = {
  NO: 0,
  YES: 1,
};
