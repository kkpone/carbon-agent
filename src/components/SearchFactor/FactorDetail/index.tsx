/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-03-08 16:26:13
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-03-26 14:40:06
 * @Date: 2023-02-08 14:15:34
 * @@description: 因子详情页
 */
import { createForm } from '@formily/core';
import I18N from '@src/lang/I18N';
import { shouldHideEcoinventValue } from '@src/utils/ecoinvent';
import { Tabs } from 'antd';
import { uniqBy } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';

import { listALLByDictTypeBatch } from '@/api/api';
import FactorBasic from '@/components/FactorForm/FactorBasic';
import FactorData from '@/components/FactorForm/FactorData';
import FactorSource from '@/components/FactorForm/FactorSource';
import {
  FORMULA_VALUE_TO_ENUM_KEY,
  NUMBER_FACTOR_TYPE,
  VALUE_TYPE_CO2E_TYPE,
} from '@/components/FactorForm/constant';
import { getFactor, getGasList } from '@/components/FactorForm/service';
import { changeDicts2Options } from '@/views/utils';

import style from './index.module.less';

import '@views/enterpriseCarbonAccount2/style.less';

const SearchFactorDetail = ({
  id,
  searchId,
}: {
  id: string;
  searchId?: string;
}) => {
  const form = useMemo(() => createForm(), []);

  const [tabName, setTabName] = useState('baseInfo');

  const [gasList, setGasList] = useState<Record<string, any>[]>([]);

  const [sourceFileList, setSourceFileList] = useState<
    { name: string; uid: string; url: string }[]
  >([]);

  const formulaTempRef = useRef<
    Record<
      string,
      {
        carbonFactorGas: Record<string, any>[];
        carbonFactorFormula: Record<string, any>[];
      }
    >
  >();

  const [formula, setFormula] = useState<{
    carbonFactorGas: Record<string, any>[];
    carbonFactorFormula: Record<string, any>[];
  }>({ carbonFactorGas: [], carbonFactorFormula: [] });

  const onTabChange = (key: string) => {
    setTabName(key);
  };

  useEffect(() => {
    (async () => {
      const gasResp = await getGasList();
      formulaTempRef.current = gasResp.data.data.formulaData;

      const ghgResp = await listALLByDictTypeBatch({
        dictTypes: 'ghg_type,emission_type_label',
        // @ts-ignore
        debounced: true,
      });
      const ghgTree = uniqBy(
        ghgResp.data.data.ghg_type.map(u => ({
          ...u,
          label: u.sourceName,
          value: u.sourceType,
          sourceType: u.sourceType,
          children: changeDicts2Options(
            ghgResp.data.data.ghg_type.filter(
              d => d.sourceType === u.sourceType,
            ),
          ),
        })),
        'value',
      );

      const emissionLabelResp = ghgResp.data.data.emission_type_label;

      const { data } = await getFactor({ id, searchId });

      const {
        gasData,
        applyYear,
        applyYearEnd,
        factorType,
        scope,
        sourceFileList: fileList,
        factorPattern,
        ...rest
      } = data.data;

      form.setFieldState('emissionLabel', {
        dataSource: emissionLabelResp.map(item => ({
          label: item.dictLabel,
          value: item.dictValue,
        })),
      });

      form.setValues({
        ...rest,
        factorType,
        factorPattern,
        yearRange:
          applyYear && applyYearEnd ? [applyYear, applyYearEnd] : undefined,
        applyYear,
        applyYearEnd,
        scope: (() => {
          const scopeValues: string[][] = [];

          scope?.split(',')?.forEach((val: string) => {
            ghgTree.forEach(parent => {
              if (parent.children?.find(child => child.dictValue === val)) {
                scopeValues.push([parent.dictValue, val]);
              }
            });
          });

          return scopeValues;
        })(),
        boundary: data.data.boundary?.split(',') || [],
        emissionLabel: data.data.emissionLabel,
      });

      if (factorType === NUMBER_FACTOR_TYPE) {
        const co2eGas =
          gasData.find(gas => gas.type === VALUE_TYPE_CO2E_TYPE) || {};

        form.setValues({
          unit: co2eGas.factorUnitM?.split(','),
          factorValue: shouldHideEcoinventValue(data.data)
            ? I18N.carbonFootprint3.notDisplayedTemporarily
            : co2eGas.factorValue,
          factorUnit: co2eGas.factorUnit,
        });
      } else {
        setFormula(
          data.data.formulaData[FORMULA_VALUE_TO_ENUM_KEY[rest.formula]],
        );
      }

      setGasList(gasData);
      setSourceFileList(fileList);
    })();
  }, [id, form, searchId]);
  return (
    <div
      className={`enterprise-carbon-account2 ${style.searchFactorDetail}`}
      style={{ borderBottom: 0 }}
    >
      {tabName ? (
        <Tabs
          className='tab-box'
          style={{ margin: 0 }}
          defaultActiveKey={tabName}
          items={[
            {
              key: 'baseInfo',
              label: I18N.carbonFootprint.basicInformation,
              children: <FactorBasic form={form} disabled />,
              forceRender: true,
            },
            {
              key: 'factorData',
              label: I18N.components.factorData,
              children: (
                <FactorData
                  form={form}
                  disabled
                  gasList={gasList}
                  formulaTempRef={formulaTempRef}
                  formula={formula}
                  co2eColumnShow={false}
                  setFormula={setFormula}
                  setGasList={setGasList}
                />
              ),
              forceRender: true,
            },
            {
              key: 'sourceInfo',
              label: I18N.components.sourceInformation,
              children: (
                <FactorSource
                  form={form}
                  disabled
                  sourceFileList={sourceFileList}
                  setSourceFileList={setSourceFileList}
                />
              ),
              forceRender: true,
            },
            // {
            //   key: 'relevanceFactor',
            //   label: I18N.components.correlationFactor,
            // },
          ]}
          onChange={onTabChange}
        />
      ) : (
        ''
      )}
    </div>
  );
};
export default SearchFactorDetail;
