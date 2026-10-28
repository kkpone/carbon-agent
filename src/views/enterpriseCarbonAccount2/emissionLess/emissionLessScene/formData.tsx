import I18N from '@src/lang/I18N';
import { InputNumber } from 'antd';

export const getFormList = (
  pageType,
  unitMList,
  setSceneType,
  setUnitObject,
  unitObject,
  setTotalObject,
  totalObject,
  sceneType,
  form,
): any => {
  const baseItemForm = [
    {
      label: I18N.enterpriseCarbonAccount2.emissionReductionScenarioName,
      name: 'sceneName',
      type: 'input',
      rules: pageType !== 'detail',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      col: 12,
      props: {
        disabled: pageType === 'detail',
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.quantificationOfEmissionReduction,
      name: 'sceneType',
      type: 'checkbox',
      rules: pageType !== 'detail',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      padding: '0',
      col: 24,
      props: {
        options: [
          { value: '0', label: I18N.enterpriseCarbonAccount2.totalEmissionReduction },
          { value: '1', label: I18N.enterpriseCarbonAccount2.unitEmissionReduction },
        ],
        disabled: pageType === 'detail',
        onChange(e) {
          // form.setFieldsValue({
          //   ...form.getFieldsValue(true),
          // });
          setTimeout(() => {
            setSceneType(e);
          }, 300);
        },
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.descriptionOfEmissionReductionScenarios,
      name: 'sceneDesc',
      type: 'textArea',
      rules: pageType !== 'detail',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      padding: '0',
      col: 24,
      props: {
        rows: 4,
        disabled: pageType === 'detail',
      },
    },
  ];
  const emsiionLessItemForm = [
    {
      label: I18N.enterpriseCarbonAccount2.descriptionOfTotalEmissionReduction,
      name: 'totalDesc',
      type: 'input',
      rules: pageType !== 'detail' && sceneType.includes('0'),
      padding: '0',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      col: 24,
      props: {
        disabled: pageType === 'detail',
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.setType,
      name: 'totalLessenType',
      type: 'radio',
      padding: '0',
      rules: pageType !== 'detail' && sceneType.includes('0'),
      col: 24,
      placeholder: I18N.carbonFootprint.pleaseEnter,
      props: {
        options: [
          { value: 0, label: I18N.enterpriseCarbonAccount2.determinedValue },
          { value: 1, label: I18N.enterpriseCarbonAccount2.intervalValue },
        ],
        style: { marginBottom: -3 },
        disabled: pageType === 'detail',
        onChange(e) {
          form.setFieldsValue({
            ...form.getFieldsValue(true),
            totalInitValue: null,
          });

          setTotalObject({
            ...totalObject,
            totalLessenType: e.target.value,
            totalEndValue: null,
            totalQuantity: null,
            totalInitValue: null,
          });
        },
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.totalEmissionReduction,
      name: 'totalInitValue',
      type: 'render',
      rules: pageType !== 'detail' && sceneType.includes('0'),
      placeholder: I18N.carbonFootprint.pleaseEnter,
      col: 12,
      render() {
        return (
          <div>
            {totalObject.totalLessenType === 1 ? (
              <>
                <InputNumber
                  value={totalObject.totalInitValue}
                  disabled={pageType === 'detail'}
                  onChange={value => {
                    setTotalObject({ ...totalObject, totalInitValue: value });
                  }}
                  max={999999999999.999}
                  min={0}
                  placeholder={I18N.carbonFootprint.pleaseEnter}
                  style={{ width: '47.55%', transition: 'none' }}
                />{' '}
                -{' '}
                <InputNumber
                  disabled={pageType === 'detail'}
                  value={totalObject.totalEndValue}
                  onChange={value => {
                    setTotalObject({ ...totalObject, totalEndValue: value });
                  }}
                  max={999999999999.999}
                  min={0}
                  placeholder={I18N.carbonFootprint.pleaseEnter}
                  style={{ width: '45.55%', transition: 'none' }}
                />
              </>
            ) : (
              <InputNumber
                disabled={pageType === 'detail'}
                value={totalObject.totalQuantity}
                onChange={value => {
                  setTotalObject({ ...totalObject, totalQuantity: value });

                  form.setFieldsValue({
                    ...form.getFieldsValue(true),
                    totalInitValue: value,
                  });
                }}
                max={999999999999.999}
                min={0}
                placeholder={I18N.carbonFootprint.pleaseEnter}
                style={{ transition: 'none', width: '100%' }}
              />
            )}
          </div>
        );
      },
    },
    // {
    //   label: '总减排量',
    //   name: 'totalQuantity',
    //   type: 'input',
    //   rules: pageType !== 'detail',
    //   placeholder: '请输入',
    //   col: 12,
    //   props: {
    //     disabled: pageType === 'detail',
    //   },
    // },
    {
      label: I18N.enterpriseCarbonAccount2.totalEmissionReductionOrder,
      name: 'totalUnit',
      type: 'select',
      rules: pageType !== 'detail' && sceneType.includes('0'),
      placeholder: I18N.carbonFootprint.pleaseEnter,
      col: 12,
      padding: '0',
      props: {
        options: [
          { value: '0', label: 'tCO₂e' },
          { value: '1', label: 'kgCO₂e' },
          { value: '2', label: 'gCO₂e' },
          { value: '3', label: 'tCO₂' },
          { value: '4', label: 'kgCO₂' },
          { value: '5', label: 'gCO₂' },
        ],
        disabled: pageType === 'detail',
      },
    },
  ];
  const unitLessDeschargeItemForm = [
    {
      label: I18N.enterpriseCarbonAccount2.unitEmissionReduction3,
      name: 'unitDesc',
      type: 'input',
      rules: pageType !== 'detail' && sceneType.includes('1'),
      padding: '0',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      col: 24,
    },
    {
      label: I18N.enterpriseCarbonAccount2.setType,
      name: 'unitLessenType',
      type: 'radio',
      rules: pageType !== 'detail' && sceneType.includes('1'),
      padding: '0',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      col: 24,
      props: {
        options: [
          { value: 0, label: I18N.enterpriseCarbonAccount2.determinedValue },
          { value: 1, label: I18N.enterpriseCarbonAccount2.intervalValue },
        ],
        disabled: pageType === 'detail',
        onChange(e) {
          form.setFieldsValue({
            ...form.getFieldsValue(true),
            unitInitValue: null,
          });
          setUnitObject({
            ...unitObject,
            unitLessenType: e.target.value,
            unitInitValue: null,
            unitEndValue: null,
            unitQuantity: null,
          });
        },
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.unitEmissionReduction,
      name: 'unitInitValue',
      type: 'render',
      rules: pageType !== 'detail' && sceneType.includes('1'),
      placeholder: I18N.carbonFootprint.pleaseEnter,
      col: 12,
      render() {
        return (
          <div>
            {unitObject.unitLessenType === 1 ? (
              <div>
                <InputNumber
                  value={unitObject.unitInitValue}
                  disabled={pageType === 'detail'}
                  onChange={value => {
                    setUnitObject({ ...unitObject, unitInitValue: value });
                    form.setFieldsValue({
                      ...form.getFieldsValue(true),
                      unitInitValue: value,
                    });
                  }}
                  max={999999999999.999}
                  min={0}
                  placeholder={I18N.carbonFootprint.pleaseEnter}
                  style={{ width: '47.6%', transition: 'none' }}
                />{' '}
                -{' '}
                <InputNumber
                  value={unitObject.unitEndValue}
                  disabled={pageType === 'detail'}
                  onChange={value => {
                    setUnitObject({ ...unitObject, unitEndValue: value });
                  }}
                  max={999999999999.999}
                  min={0}
                  placeholder={I18N.carbonFootprint.pleaseEnter}
                  style={{ width: '47.6%', transition: 'none' }}
                />
              </div>
            ) : (
              <InputNumber
                value={unitObject.unitQuantity}
                disabled={pageType === 'detail'}
                onChange={value => {
                  setUnitObject({ ...unitObject, unitQuantity: value });
                  form.setFieldsValue({
                    ...form.getFieldsValue(true),
                    unitInitValue: value,
                  });
                }}
                max={999999999999.999}
                min={0}
                placeholder={I18N.carbonFootprint.pleaseEnter}
                style={{ transition: 'none', width: '100%' }}
              />
            )}
          </div>
        );
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.unitEmissionReduction2,
      name: 'unitUnit',
      type: 'select',
      rules: pageType !== 'detail' && sceneType.includes('1'),
      placeholder: I18N.carbonFootprint3.molecularUnit,
      col: 6,
      props: {
        options: [
          { value: '0', label: 'tCO₂e' },
          { value: '1', label: 'kgCO₂e' },
          { value: '2', label: 'gCO₂e' },
          { value: '3', label: 'tCO₂' },
          { value: '4', label: 'kgCO₂' },
          { value: '5', label: 'gCO₂' },
        ],
      },
    },
    {
      label: <>&nbsp;</>,
      name: 'unitUnitType',
      type: 'cascader',
      rules: false,
      padding: '0',
      placeholder: I18N.carbonFootprint3.denominatorUnit,
      col: 6,
      props: {
        options: unitMList,
        fieldNames: {
          label: 'dictLabel',
          value: 'dictValue',
          children: 'enumList',
        },
      },
      // render: () => (
      //   <div
      //     style={{
      //       display: 'flex',
      //       justifyContent: 'space-between',
      //     }}
      //   >
      //     <span style={{ position: 'relative', top: 5, left: -15 }}>/</span>
      //     <Cascader
      //       value={form.getFieldValue('unitUnitType')}
      //       options={unitMList}
      //       fieldNames={{
      //         label: 'dictLabel',
      //         value: 'dictValue',
      //         children: 'enumList',
      //       }}
      //       onChange={e => {
      //         console.log(e);

      //         form.setFieldsValue({
      //           ...form.getFieldsValue(true),
      //           unitUnitType: e,
      //         });
      //       }}
      //     />
      //   </div>
      // ),
    },
  ];

  return [baseItemForm, emsiionLessItemForm, unitLessDeschargeItemForm];
};
