import type { ProColumns } from '@ant-design/pro-components';
import { Modal, Radio } from 'antd';
import BigNumber from 'bignumber.js';

import { TableActions } from '@/components/Table/TableActions';
import I18N from '@/lang/I18N';
import { PageTypeInfo } from '@/router/utils/enums';
import type { Dicts } from '@/utils';
import { modelFooterBtnStyle, Toast } from '@/utils';
import { CbamEnumResp } from '@/views/cbam/hook/type';

import { deleteCarbonTax, putCarbonTaxReportSelection } from '../../service';
import { CarbonTaxResp } from '../../type';

const { edit, show } = PageTypeInfo;

const getEnumName = (options: CbamEnumResp[], code?: number) =>
  options.find(item => Number(item.code) === Number(code))?.name || '-';

const getCurrencyUnit = (options: Dicts[], currencyType?: string) =>
  options.find(item => item.dictValue === currencyType)?.relatedValue ||
  currencyType ||
  '-';

const calculateCarbonTaxTotal = (row: CarbonTaxResp) => {
  if (
    row.seeg === null ||
    row.seeg === undefined ||
    row.sefa === null ||
    row.sefa === undefined ||
    row.taxValue === null ||
    row.taxValue === undefined
  ) {
    return undefined;
  }
  return new BigNumber(row.seeg)
    .minus(row.sefa)
    .times(row.taxValue)
    .decimalPlaces(6);
};

const calculateOffsetRatio = (row: CarbonTaxResp) => {
  const carbonTaxTotal = calculateCarbonTaxTotal(row);
  if (!carbonTaxTotal || carbonTaxTotal.isZero()) return new BigNumber(0);
  return new BigNumber(row.offsetPrice || 0)
    .div(carbonTaxTotal)
    .times(100)
    .decimalPlaces(6);
};

export const columns = ({
  isDetail,
  taxTypeEnum,
  currencyTypeEnum,
  offsetMethodEnum,
  onActionBtnClick,
  reload,
}: {
  isDetail: boolean;
  taxTypeEnum: CbamEnumResp[];
  currencyTypeEnum: Dicts[];
  offsetMethodEnum: CbamEnumResp[];
  onActionBtnClick: (type: string, id?: number) => void;
  reload: () => void;
}): ProColumns<CarbonTaxResp>[] => [
  {
    title: I18N.cbam.reportFiling,
    dataIndex: 'reportSelected',
    width: 90,
    fixed: 'left',
    align: 'center',
    render: (_, row) => (
      <Radio
        disabled={isDetail}
        checked={row.reportSelected === 1}
        onChange={async () => {
          if (!row.id || row.reportSelected === 1) return;
          await putCarbonTaxReportSelection(row.id);
          Toast('success', I18N.cbam.carbonTaxReportSelected);
          reload();
        }}
      />
    ),
  },
  {
    title: I18N.cbam.product,
    dataIndex: 'saleProductName',
    width: 160,
    fixed: 'left',
    ellipsis: true,
  },
  {
    title: I18N.Factors.productName,
    dataIndex: 'productName',
    width: 180,
    fixed: 'left',
    ellipsis: true,
  },
  {
    title: I18N.cbam.cnClassificationName,
    dataIndex: 'cnCode',
    width: 110,
    ellipsis: true,
  },
  {
    title: I18N.cbam.productCarbonEmissionIntensity,
    dataIndex: 'seeg',
    width: 180,
    render: (_, row) => (row.seeg === undefined ? '-' : `${row.seeg} tCO2e/t`),
  },
  {
    title: I18N.cbam.carbonTaxType,
    dataIndex: 'taxType',
    width: 120,
    renderText: value => getEnumName(taxTypeEnum, value),
  },
  {
    title: I18N.cbam.carbonTaxCoverage,
    dataIndex: 'emissionPer',
    width: 150,
    renderText: value =>
      value === null || value === undefined ? '-' : `${value}%`,
  },
  {
    title: I18N.cbam.currency,
    dataIndex: 'currencyTypeName',
    width: 100,
    render: (_, row) => row.currencyTypeName || row.currencyType || '-',
  },
  {
    title: I18N.cbam.cbamCertificatePrice,
    dataIndex: 'taxValue',
    width: 180,
    render: (_, row) => {
      const carbonTaxTotal = calculateCarbonTaxTotal(row);
      return carbonTaxTotal === undefined
        ? '-'
        : `${carbonTaxTotal.toString()} ${getCurrencyUnit(
            currencyTypeEnum,
            row.currencyType,
          )}/t`;
    },
  },
  {
    title: I18N.cbam.carbonTaxDeductionMethod,
    dataIndex: 'offsetMethod',
    width: 150,
    renderText: value => getEnumName(offsetMethodEnum, value),
  },
  {
    title: I18N.cbam.offsetRatio,
    dataIndex: 'offsetPer',
    width: 130,
    render: (_, row) => `${calculateOffsetRatio(row).toString()}%`,
  },
  {
    title: I18N.cbam.discountedPrice,
    dataIndex: 'offsetPrice',
    width: 130,
    render: (_, row) =>
      row.offsetPrice === undefined
        ? '-'
        : `${row.offsetPrice} ${getCurrencyUnit(
            currencyTypeEnum,
            row.currencyType,
          )}/t`,
  },
  {
    title: I18N.cbam.carbonTaxCost,
    dataIndex: 'payTax',
    width: 170,
    render: (_, row) =>
      row.payTax === undefined
        ? '-'
        : `${row.payTax} ${getCurrencyUnit(
            currencyTypeEnum,
            row.currencyType,
          )}/t`,
  },
  {
    title: I18N.Factors.operation,
    dataIndex: 'action',
    width: 155,
    fixed: 'right',
    render: (_, row) => (
      <TableActions
        menus={[
          ...(!isDetail
            ? [
                {
                  label: I18N.Factors.edit,
                  key: `edit-${row.id}`,
                  onClick: () => onActionBtnClick(edit, row.id),
                },
                {
                  label: I18N.Factors.delete,
                  key: `delete-${row.id}`,
                  onClick: () => {
                    Modal.confirm({
                      title: I18N.Factors.prompt,
                      icon: '',
                      content:
                        row.reportSelected === 1
                          ? I18N.cbam.confirmDeleteSelectedCarbonTax
                          : I18N.cbam.confirmDeleteProductCarbonTax,
                      ...modelFooterBtnStyle,
                      okText: I18N.base.confirm,
                      cancelText: I18N.Factors.cancel,
                      onOk: async () => {
                        if (!row.id) return;
                        await deleteCarbonTax(row.id);
                        Toast('success', I18N.Factors.deleteSuccessful);
                        reload();
                      },
                    });
                  },
                },
              ]
            : []),
          {
            label: I18N.Factors.check,
            key: `show-${row.id}`,
            onClick: () => onActionBtnClick(show, row.id),
          },
        ]}
      />
    ),
  },
];
