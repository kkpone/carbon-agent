/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  addFactor,
  editFactor,
  getFactor,
  getGasList,
} from '@components/FactorForm/service';
import { createForm } from '@formily/core';
import I18N from '@src/lang/I18N';
import { shouldHideEcoinventValue } from '@src/utils/ecoinvent';
import { Button, Spin, Tabs } from 'antd';
import { isNil, uniqBy } from 'lodash-es';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { listALLByDictTypeBatch } from '@/api/api';
import FactorBasic from '@/components/FactorForm/FactorBasic';
import FactorData from '@/components/FactorForm/FactorData';
import FactorSource from '@/components/FactorForm/FactorSource';
import {
  FORMULA_VALUE_TO_ENUM_KEY,
  NUMBER_FACTOR_TYPE,
  VALUE_TYPE_CO2E_TYPE,
} from '@/components/FactorForm/constant';
import { RouteMaps } from '@/router/route-paths';
import { Toast } from '@/utils';
import { changeDicts2Options } from '@/views/utils';

import styles from './index.module.less';

type FactorInfoProps = { title: string; id?: string; disabled?: boolean };

const TAB_KEYS = {
  BASIC: 'BASIC',
  DATA: 'DATA',
  SOURCE: 'SOURCE',
};

const fieldToTabMap = {
  name: TAB_KEYS.BASIC,
  unit: TAB_KEYS.BASIC,
  business: TAB_KEYS.BASIC,
  areaRepresent: TAB_KEYS.BASIC,
  yearRange: TAB_KEYS.BASIC,
  source: TAB_KEYS.SOURCE,
  institution: TAB_KEYS.SOURCE,
  year: TAB_KEYS.SOURCE,
  countries: TAB_KEYS.SOURCE,
};

const FactorInfo: FC<FactorInfoProps> = props => {
  const { id, disabled, title } = props;

  const history = useHistory();

  const [tabKey, setTabKey] = useState(TAB_KEYS.BASIC);

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

  const ghgTreeRef = useRef<Record<string, any>[]>([]);

  const [formula, setFormula] = useState<{
    carbonFactorGas: Record<string, any>[];
    carbonFactorFormula: Record<string, any>[];
  }>({ carbonFactorGas: [], carbonFactorFormula: [] });

  const [loading, setLoading] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);

  const form = useMemo(() => createForm(), []);

  const checkFactorGasValue = (gasValue: string) =>
    gasValue !== null && gasValue !== undefined && gasValue !== '';

  const checkFactorGasComplete = (factorGasData: Record<string, any>[]) =>
    factorGasData.every(gas => {
      const {
        type,
        factorUnit,
        factorValue,
        co2eFactorUnit,
        co2eValue,
        greenhouseGases,
      } = gas;
      const factorInfoIsEmpty =
        !factorUnit && !checkFactorGasValue(factorValue);
      const factorInfoIsComplete =
        !!factorUnit && checkFactorGasValue(factorValue);
      if (['g2', 'g3'].includes(type)) {
        // 甲烷，氧化亚氮：有二氧化碳当量值和单位
        const co2eInfoIsEmpty =
          !co2eFactorUnit && !checkFactorGasValue(co2eValue);
        const co2eInfoIsComplete =
          !!co2eFactorUnit && checkFactorGasValue(co2eValue);
        return (
          (factorInfoIsEmpty || factorInfoIsComplete) &&
          (co2eInfoIsEmpty || co2eInfoIsComplete)
        );
      }
      if (['g4', 'g5'].includes(type)) {
        // greenhouseGases 氢氟碳化物 全氟化碳：有温室气体
        return (
          (factorInfoIsEmpty && !greenhouseGases) ||
          (factorInfoIsComplete && !!greenhouseGases)
        );
      }
      return factorInfoIsEmpty || factorInfoIsComplete;
    });

  const submit = async () => {
    let formValues: Record<string, any> = {};

    try {
      formValues = await form.submit();
    } catch (e) {
      const fieldError = e as { path: string }[];
      setTabKey(fieldToTabMap[fieldError[0].path] || TAB_KEYS.BASIC);
      throw e;
    }

    const {
      yearRange,
      scope,
      unit,
      boundary,
      factorType,
      factorValue,
      factorUnit,
      formulaDesc,
      ...rest
    } = formValues as {
      scope: string[][];
      yearRange: string[];
      unit: string[];
      boundary: string;
      factorType: string;
      factorValue: string;
      factorUnit: string;
      formulaDesc: string;
    };

    const isNumberType = factorType === NUMBER_FACTOR_TYPE;

    if ((scope || []).length === 0 && isNil(boundary)) {
      Toast('warning', I18N.emission.pleaseSelectApplicable2);
      return;
    }

    let submitData: Record<string, any> = {
      ...rest,
      factorType,
      applyYear: yearRange[0],
      applyYearEnd: yearRange[1],
      boundary,
      scope: (scope || [])
        .map((item: string[]) => {
          if (item.length === 1) {
            return (ghgTreeRef.current || [])
              .find(parent => parent.dictValue === item[0])
              ?.children?.map(child => child.dictValue);
          }
          return item[1];
        })
        .flat()
        .join(','),
      sourceFileList,
    };

    if (isNumberType) {
      // 数值类
      const carbonFactorGas: Record<string, any>[] = gasList.map(gas => {
        const unitM = unit?.join(',');

        return {
          ...gas,
          factorUnitM: unitM,
          co2eFactorUnitm: unitM,
          factorUnit:
            gas.type === VALUE_TYPE_CO2E_TYPE ? factorUnit : gas.factorUnit,
          factorValue:
            gas.type === VALUE_TYPE_CO2E_TYPE ? factorValue : gas.factorValue,
        };
      });

      const hasOneCompleteData = carbonFactorGas.some(gas => {
        const valueUnitComplete =
          (!!gas.factorUnit &&
            !!gas.factorUnitM &&
            checkFactorGasValue(gas.factorValue)) ||
          (!!gas.co2eFactorUnit &&
            !!gas.co2eFactorUnitm &&
            checkFactorGasValue(gas.co2eValue));
        return (
          valueUnitComplete &&
          (!['g4', 'g5'].includes(gas.type) || !!gas.greenhouseGases)
        );
      });

      if (!hasOneCompleteData) {
        Toast('error', I18N.emission.fillInAtLeastOne);
        return;
      }

      if (isNumberType && !checkFactorGasComplete(carbonFactorGas)) {
        Toast('error', I18N.emission.factorListNotAvailable);
        return;
      }
      submitData = { ...submitData, carbonFactorGas };
    } else {
      // 公式类
      submitData = { ...submitData, ...formula };
    }

    setSubmitLoading(true);

    try {
      if (isNil(id)) {
        await addFactor(submitData);
      } else {
        await editFactor({ ...submitData, id });
      }
      Toast('success', I18N.carbonFootprint.operationSuccessful);
      history.push(RouteMaps.emissionOrganization);
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const gasResp = await getGasList();
        formulaTempRef.current = gasResp.data.data.formulaData;

        const ghgResp = await listALLByDictTypeBatch({
          dictTypes: 'ghg_type',
          // @ts-ignore
          debounced: true,
        });
        ghgTreeRef.current = uniqBy(
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

        if (isNil(id)) {
          setGasList(gasResp.data.data.gasData);
          form.setValues({ factorType: NUMBER_FACTOR_TYPE });
        } else {
          const { data } = await getFactor({ id });

          const {
            gasData,
            applyYear,
            applyYearEnd,
            factorType,
            scope,
            factorPattern,
            sourceFileList: fileList,
            ...rest
          } = data.data;

          form.setValues({
            ...rest,
            factorType,
            factorPattern,
            yearRange:
              applyYear && applyYearEnd ? [applyYear, applyYearEnd] : undefined,
            scope: (() => {
              const scopeValues: string[][] = [];

              scope?.split(',')?.forEach((val: string) => {
                ghgTreeRef.current.forEach(parent => {
                  if (parent.children.find(child => child.dictValue === val)) {
                    scopeValues.push([parent.dictValue, val]);
                  }
                });
              });

              return scopeValues;
            })(),
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
        }
      } catch (e) {
        setLoading(false);
        throw e;
      } finally {
        setLoading(false);
      }
    })();
  }, [id, form]);
  return (
    <div className={styles.factorInfo}>
      <Spin spinning={loading}>
        <div className={styles.title}>{title}</div>
        <Tabs
          activeKey={tabKey}
          items={[
            {
              label: I18N.carbonFootprint3.basicInformation,
              key: TAB_KEYS.BASIC,
              children: (
                <FactorBasic
                  form={form}
                  showEmissionLabel={false}
                  disabled={disabled}
                  setGasList={setGasList}
                />
              ),
              forceRender: true,
            },
            {
              label: I18N.components.factorData,
              key: TAB_KEYS.DATA,
              children: (
                <FactorData
                  form={form}
                  disabled={disabled}
                  gasList={gasList}
                  formulaTempRef={formulaTempRef}
                  formula={formula}
                  setFormula={setFormula}
                  setGasList={setGasList}
                />
              ),
              forceRender: true,
            },
            {
              label: I18N.components.sourceInformation,
              key: TAB_KEYS.SOURCE,
              children: (
                <FactorSource
                  form={form}
                  disabled={disabled}
                  sourceFileList={sourceFileList}
                  setSourceFileList={setSourceFileList}
                />
              ),
              forceRender: true,
            },
          ]}
          onChange={setTabKey}
        />
        <div className={styles.footer}>
          <Button onClick={() => history.push(RouteMaps.emissionOrganization)}>
            {I18N.carbonFootprint.return}
          </Button>
          {!disabled && (
            <Button type='primary' loading={submitLoading} onClick={submit}>
              {I18N.carbonFootprint.preserve}
            </Button>
          )}
        </div>
      </Spin>
    </div>
  );
};

export default FactorInfo;
