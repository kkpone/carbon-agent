import I18N from '@src/lang/I18N';
import { createI18nLabelMap } from '@src/lang/createI18nLabelMap';

export const NUMBER_FACTOR_TYPE = '1';

export const FORMULA_DESC = createI18nLabelMap({
  '1': () => I18N.emission.carbonDioxideEmissions,
  '2': () => I18N.emission.forestryCarbonSequestration,
  '3': () => I18N.emission.carbonEmissionsPerKilometer,
  '4': () => I18N.emission.tonKilometerCarbonEmissions,
});

export const GAS_TYPE_TO_ENUM_KEY = {
  g1: 'factorUnitZ',
  g2: 'methaneUnitZ',
  g3: 'nitrousUnitZ',
  g4: 'hydrofluorocarbonUnitZ',
  g5: 'perfluorocarbonUnitZ',
  g6: 'sulfurUnitZ',
  g7: 'nitrogenUnitZ',
};

export const FORMULA_VALUE_TO_ENUM_KEY = {
  '1': 'fossilFormulaData',
  '2': 'forestryFormulaData',
  '3': 'transportationKMFormulaData',
  '4': 'transportationTKMFormulaData',
};

export const FORMULA_VALUE_TO_UNIT_ENUM = {
  '1': ['formulaUnitZ', 'formulaUnitM', 'co2eFormulaUnitZ'],
  '2': ['forestryUnitZ', 'forestryUnitM', 'co2eForestryUnitZ'],
  '3': ['transportationKMZ', 'transportationKMM', 'co2eTransportationKMZ'],
  '4': ['transportationTKMZ', 'transportationTKMM', 'co2eTransportationTKMZ'],
};

export const FOSSIL_FORMULA_VAL = '1';

export const FOREST_FORMULA_VAL = '2';

export const TRANSPORT_FORMULA_VAL = '3';

export const TRANSPORT_TKM_FORMULA_VAL = '4';

export const VALUE_TYPE_CO2E_TYPE = 'g9';

export const FORMULA_TYPE_CO2E_TYPE = 'g12';

export const FACTOR_PATTERN = {
  ORDINARY: '1',
  ECOINVENT: '2',
};
