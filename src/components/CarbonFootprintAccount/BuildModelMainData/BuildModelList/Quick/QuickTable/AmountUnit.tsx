import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { useRequest } from 'ahooks';
import { Cascader, Input } from 'antd';
import { uniqBy } from 'lodash-es';
import { FC, useContext, useEffect, useState } from 'react';

import { MeasurementPrecisionContext } from '@/components/CarbonFootprintAccount/BuildModelMainData/measurementPrecisionContext';
import { Dicts } from '@/hooks/useFieldUnitDictSource';
import { getDictList } from '@/views/carbonFootprint3/discharge/process/service';
import { RegAccountValue } from '@/views/carbonFootprint3/util';
import { changeDicts2Options } from '@/views/utils';

import { ArticleInfo, editListData } from './service';

// export interface IAmountUnitProps {
//   amount: number;
//   unitCode: string;
// }

export const AmountUnit: FC<
  ArticleInfo & { refresh: () => void; disabled: boolean }
> = ({
  amount: amountProps,
  unitCode,
  id,
  accountId,
  unitName,
  refresh,
  aiFlag,
  disabled,
}) => {
  const { enabled, amountDecimalPlace } = useContext(
    MeasurementPrecisionContext,
  );
  const { data } = useRequest(() => getDictList({ dictTypes: 'factorUnitM' }));

  const unitDicts = (data?.data?.data?.factorUnitM as Dicts[]) || [];

  const [amount, setAmount] = useState<string>(amountProps?.toString());

  const [unitNameValue, setUnitNameValue] = useState<string>(unitName || '');
  useEffect(() => {
    setAmount(amountProps?.toString() || '');
  }, [amountProps]);

  const [unit, setUnit] = useState<string[]>([]);

  const unitOptions: Dicts[] = uniqBy(
    unitDicts?.map(u => ({
      ...u,
      label: u.sourceName,
      value: u.sourceType,
      sourceType: u.sourceType,
      children: changeDicts2Options(
        unitDicts.filter(d => d.sourceType === u.sourceType),
      ) as Dicts[] | undefined,
    })),
    'value',
  );

  const displayRender = (label: string[]) => {
    if (!label) return '';
    if (label.length === 2) {
      return [label[1]];
    }
    return label;
  };

  useEffect(() => {
    if (unitOptions?.length > 0 && unitCode) {
      // eslint-disable-next-line no-restricted-syntax
      for (const dict of unitOptions) {
        // eslint-disable-next-line no-restricted-syntax
        for (const childDict of dict.children || []) {
          if (childDict.value === unitCode || childDict.label === unitCode) {
            setUnit([dict.value, childDict.value]);
            setUnitNameValue(childDict.label);
            return;
          }
        }
      }
    }
  }, [unitCode, unitOptions.length]);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Input
        value={amount}
        disabled={disabled}
        style={{ width: 150 }}
        onBlur={async e => {
          const nextAmount = e.target.value;

          if (enabled) {
            const errorText = RegAccountValue(nextAmount, amountDecimalPlace);
            if (errorText) {
              setAmount(amountProps?.toString() || '');
              Toast('warn', errorText);
              return;
            }
          }

          if (nextAmount && unit.length > 0) {
            await editListData({
              id,
              amount: nextAmount,
              unitCode: unit[1],
              accountId,
              unitName: unitNameValue,
              aiFlag,
            });
            refresh();
          }
        }}
        onChange={e => {
          setAmount(e.target.value);
        }}
      />
      <Cascader
        value={unit}
        disabled={disabled}
        displayRender={displayRender}
        options={unitOptions}
        allowClear={false}
        onChange={async (v, label) => {
          setUnit(v);
          setUnitNameValue(label[1].dictLabel);
          if (amount && v.length > 0) {
            await editListData({
              id,
              amount,
              unitCode: v[1],
              accountId,
              unitName: label[1].dictLabel,
              aiFlag,
            });
            refresh();
          }
        }}
        placeholder={I18N.carbonFootprint.pleaseSelectAUnit}
      />
    </div>
  );
};
