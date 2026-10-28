import type { ProColumns } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';

import { SourceFlowResp } from '../../type';

export const columns = (): ProColumns<SourceFlowResp>[] =>
  compact([
    {
      title: I18N.cbam.product,
      dataIndex: 'productName',
      fixed: 'left',
      width: 150,
      ellipsis: true,
    },
    {
      title: I18N.cbam.processName,
      dataIndex: 'processName',
      width: 150,
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: I18N.cbam.impliedEmissionsDirectly,
      dataIndex: 'outPower',
      ellipsis: true,
    },
    {
      title: I18N.cbam.impliedEmissionRoom,
      dataIndex: 'inputPower',
      ellipsis: true,
    },
    {
      title: I18N.cbam.impliedTotalEmissions,
      dataIndex: 'inputAll',
      ellipsis: true,
    },
    {
      title: I18N.cbam.emissionUnit,
      dataIndex: 'unitName',
      ellipsis: true,
      render: (_, row) => (row.unitName ? `tCO2e/${row.unitName}` : '-'),
    },
    {
      title: I18N.cbam.defaultValueProportion,
      dataIndex: 'defaultPer',
      ellipsis: true,
    },
    {
      title: I18N.cbam.carbonTaxNeedsToBePaid,
      dataIndex: 'payTax',
      ellipsis: true,
      render: (_, row) => {
        const { payTax, currType } = row || {};
        return payTax || payTax === 0 ? `${payTax}${currType || '-'}/t` : '-';
      },
    },
    {
      title: I18N.cbam.theMainPrecursor,
      dataIndex: 'reducing_name',
      ellipsis: true,
    },
    {
      title: I18N.cbam.steelMillIdentificationNumber,
      dataIndex: 'steelCode',
      ellipsis: true,
    },
    {
      title: I18N.cbam.manganeseElementRatio,
      dataIndex: 'mnPer',
      ellipsis: true,
    },
    {
      title: I18N.cbam.chromiumElementRatio,
      dataIndex: 'crPer',
      ellipsis: true,
    },
    {
      title: I18N.cbam.nickelElementRatio,
      dataIndex: 'niPer',
      ellipsis: true,
    },
    {
      title: I18N.cbam.otherAlloyRatios,
      dataIndex: 'alloyPer',
      ellipsis: true,
    },
    {
      title: I18N.cbam.carbonContent2,
      dataIndex: 'cper',
      ellipsis: true,
    },
    {
      title: I18N.cbam.otherMaterialsAccountFor,
      dataIndex: 'materialPer',
      ellipsis: true,
    },
    {
      title: I18N.cbam.producedPerTonOfSteel,
      dataIndex: 'steelScrap',
      ellipsis: true,
    },
    {
      title: I18N.cbam.preConsumptionWaste,
      dataIndex: 'wasteMaterial',
      ellipsis: true,
    },
    {
      title: I18N.cbam.productionPerTonOfAluminum,
      dataIndex: 'alUse',
      ellipsis: true,
    },
    {
      title: I18N.cbam.nonAluminumElementsAccountFor,
      dataIndex: 'nonAl',
      ellipsis: true,
    },
    {
      title: I18N.cbam.clinkerParameters,
      dataIndex: 'clinker',
      ellipsis: true,
    },
    {
      title: I18N.cbam.whetherToCalcineOrNot,
      dataIndex: 'calcine_name',
      ellipsis: true,
    },
    {
      title: I18N.cbam.concentratedAqueousSolution2,
      dataIndex: 'solution',
      ellipsis: true,
    },
    {
      title: I18N.cbam.nitricAcidRatio,
      dataIndex: 'nitric',
      ellipsis: true,
    },
    {
      title: I18N.cbam.urea,
      dataIndex: 'urea',
      ellipsis: true,
    },
    {
      title: I18N.cbam.nitrogenContent,
      dataIndex: 'nitrogen',
      ellipsis: true,
    },
    {
      title: I18N.cbam.nIsAmmoniumNitrogen,
      dataIndex: 'ammonium',
    },
    {
      title: I18N.cbam.nAsNitrate,
      dataIndex: 'noPer',
    },
    {
      title: I18N.cbam.nIsInTheFormOfUrea,
      dataIndex: 'urPer',
    },
    {
      title: I18N.cbam.nInOtherForms,
      dataIndex: 'organic',
    },
  ]);
