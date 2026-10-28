import I18N from '@src/lang/I18N';

export const AI_HISTORY_STATUS = {
  PENDING: 0,
  SUCCESS: 1,
  FAIL: 2,
};

export const JSON_ANSWER_ICON_TYPE = {
  HAS_ICON: 0,
  NO_ICON: 1,
};

export const AI_INPUT_MENU_ITEMS = {
  ADD_EMISSION_SOURCE: '1',
  REMODEL: '2',
};

export const AI_INPUT_MENU_ITEMS_LABEL = (key: string) => {
  const labelMap = {
    [AI_INPUT_MENU_ITEMS.ADD_EMISSION_SOURCE]:
      I18N.components.supplementaryEmissionSources,
    [AI_INPUT_MENU_ITEMS.REMODEL]: I18N.carbonFootprint3.reModeling,
  };
  return labelMap[key];
};
