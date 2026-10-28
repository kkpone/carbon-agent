/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-04-28 17:34:44
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-04 20:50:47
 */
import I18N from '@src/lang/I18N';
import { ColUmsType } from '@src/views/emission/Show/service';
import { compact } from 'lodash-es';

type Props = {
  includeCo2e?: boolean;
};

export const defaultFactorData = (props?: Props): ColUmsType[] =>
  compact([
    {
      factorUnit: '',
      factorUnitM: null,
      greenhouseGasesType: I18N.enterpriseCarbonAccount2.carbonDioxideC,
      greenhouseGases: I18N.enterpriseCarbonAccount2.carbonDioxideC,
      factorValue: '',
      id: 1,
      type: 'g1',
      activeUnit: null,
    },
    {
      factorUnit: '',
      factorUnitM: null,
      greenhouseGasesType: I18N.enterpriseCarbonAccount2.methaneCh,
      greenhouseGases: I18N.enterpriseCarbonAccount2.methaneCh,
      factorValue: '',
      id: 2,
      type: 'g2',
      activeUnit: null,
    },
    {
      factorUnit: null,
      factorUnitM: null,
      greenhouseGasesType: I18N.enterpriseCarbonAccount2.nitrousOxideN,
      greenhouseGases: I18N.enterpriseCarbonAccount2.nitrousOxideN,
      factorValue: '',
      id: 3,
      type: 'g3',
      activeUnit: null,
    },
    {
      factorUnit: null,
      factorUnitM: null,
      greenhouseGasesType: I18N.enterpriseCarbonAccount2.hydrofluorocarbons,
      greenhouseGases: '',
      factorValue: '',
      id: 4,
      type: 'g4',
      activeUnit: null,
      gwp: null,
    },
    {
      factorUnit: null,
      factorUnitM: null,
      greenhouseGasesType: I18N.enterpriseCarbonAccount2.perfluorocarbonP,
      greenhouseGases: '',
      factorValue: '',
      id: 5,
      type: 'g5',
      activeUnit: null,
      gwp: null,
    },
    {
      factorUnit: null,
      factorUnitM: null,
      greenhouseGasesType: I18N.enterpriseCarbonAccount2.sulfurHexafluorideS,
      greenhouseGases: I18N.enterpriseCarbonAccount2.sulfurHexafluorideS,
      factorValue: '',
      id: 6,
      type: 'g6',
      activeUnit: null,
    },
    {
      factorUnit: null,
      factorUnitM: null,
      greenhouseGasesType: I18N.enterpriseCarbonAccount2.nitrogenTrifluorideN,
      greenhouseGases: I18N.enterpriseCarbonAccount2.nitrogenTrifluorideN,
      factorValue: '',
      id: 7,
      type: 'g7',
      activeUnit: null,
    },
    !Object.is(props?.includeCo2e, false)
      ? {
          factorUnit: null,
          factorUnitM: null,
          greenhouseGasesType: I18N.enterpriseCarbonAccount2.carbonDioxideWhen,
          greenhouseGases: '',
          factorValue: '',
          id: 9,
          type: 'g9',
          activeUnit: null,
          gwp: null,
        }
      : null,
  ]);
