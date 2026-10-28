import I18N from '@src/lang/I18N';
import { InputNumber } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import BigNumber from 'bignumber.js';
import {
  CarbonFactorFormula,
  FactorInfoForms,
  GasDatum,
} from '../../utils/index-type';

const culDisAbled = () => {
  if (
    window.location.pathname.includes('detail') ||
    window.location.pathname.includes('Detail')
  ) {
    return true;
  }
  return false;
};

type FormulaColumnsProps = {
  setValues: (v: CarbonFactorFormula[]) => void;
  setValues2: (v: GasDatum[]) => void;
  dataValue?: Partial<FactorInfoForms>;
};
/**
 * @description 计算表头
 */
export const useFormulaColumns = ({
  setValues,
  setValues2,
  dataValue,
}: FormulaColumnsProps): ColumnsType<CarbonFactorFormula> => [
  {
    title: I18N.emission.parameterName,
    dataIndex: 'paraName',
    key: 'paraName',
  },
  {
    title: I18N.emission.parameterValues,
    dataIndex: 'paraValue',
    key: 'paraValue',
    render: (value, record, index) => (
      <InputNumber
        placeholder={I18N.carbonFootprint.pleaseEnter}
        style={{ width: '100%' }}
        value={value}
        max={record.paraUnit.includes('%') ? 100.0 : 99999.99999}
        disabled={
          record.paraName.includes(I18N.emission.molecularWeightRatio)
            ? true
            : culDisAbled()
        }
        onChange={e => {
          // @ts-ignore
          setValues(arr => {
            if (record.paraUnit.includes('%')) {
              // eslint-disable-next-line no-param-reassign
              arr[index].paraValue = e ? `${new BigNumber(e).toFixed(2)}` : '';
            } else {
              // eslint-disable-next-line no-param-reassign
              arr[index].paraValue = e || '';
            }
            let resultValue = new BigNumber(Number(arr[0].paraValue));
            if (dataValue?.formula === '1') {
              resultValue = resultValue
                .multipliedBy(arr[1].paraValue)
                .multipliedBy(arr[2].paraValue)
                .multipliedBy(arr[3]?.paraValue?.split('/')[0])
                .dividedBy(arr[3]?.paraValue?.split('/')[1])
                .dividedBy(100);
            }

            if (dataValue?.formula === '2') {
              resultValue = resultValue
                .multipliedBy(arr[1]?.paraValue)
                .multipliedBy(new BigNumber(arr[2]?.paraValue).plus(1))
                .multipliedBy(arr[3]?.paraValue)
                .multipliedBy(arr[4]?.paraValue?.split('/')?.[0])
                .dividedBy(arr[4]?.paraValue?.split('/')?.[1]);
            }
            if (dataValue?.formula === '3') {
              resultValue = resultValue.dividedBy(
                new BigNumber(arr[1]?.paraValue),
              );
            }
            if (dataValue?.formula === '4') {
              resultValue = resultValue.multipliedBy(
                new BigNumber(arr[1]?.paraValue),
              );
            }
            const result = resultValue?.isNaN() ? '0' : resultValue?.toFixed(5);
            // @ts-ignore
            setValues2((resultArr: GasDatum[]) => {
              // eslint-disable-next-line
              resultArr.forEach(reco => (reco.factorValue = result));
              return [...resultArr];
            });
            return [...arr];
          });
        }}
      />
    ),
  },
  {
    title: I18N.emission.parameterUnits,
    dataIndex: 'paraUnit',
    key: 'paraUnit',
    render: (paraUnit: string) => paraUnit,
  },
];
