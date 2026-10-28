import I18N from '@src/lang/I18N';
import { Checkbox } from 'antd';

import styles from './index.module.less';

// 1:报告摘要GHG版 / 2: 完整报告GHG版 / 3:清册文件GHG版本/ 4: 报告摘要ISO版 / 5: 完整报告ISO版 / 6: 清册文件ISO版本
const GHGoptionsMap = [
  // {
  //   value: 1,
  //   label: '报告摘要',
  // },
  {
    value: 2,
    label: I18N.enterpriseCarbonAccount2.completeReport,
  },
  {
    value: 3,
    label: I18N.enterpriseCarbonAccount2.inventoryFile,
  },
];

const ISOoptionsMap = [
  {
    value: 5,
    label: I18N.enterpriseCarbonAccount2.completeReport,
  },
  {
    value: 6,
    label: I18N.enterpriseCarbonAccount2.inventoryFile,
  },
];

export const getFormList = (
  pageType,
  model,
  setModel,
  computationList,
  form,
): any => {
  const baseItemForm = [
    {
      label: I18N.carbonFootprint.accountingName,
      name: 'computationId',
      type: 'select',
      rules: pageType !== 'detail',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      props: {
        disabled: pageType === 'detail',
        options: computationList,
        onChange(value, row) {
          if (row.timeType === 3) {
            setModel('custem');
          } else {
            setModel('defalut');
          }

          form.setFieldsValue({
            ...form.getFieldsValue(true),
            calculatePeriod: row.period,
            standardLine: row.timeType,
            timeType: row.timeType,
            timeTypes: row.timeType,
            // standardLineEmission: row.totalQuantity,
            calculateName: row.value,
          });

          if (pageType === 'add' || pageType === 'edit') {
            form.setFieldsValue({
              reportName: I18N.template(I18N.enterpriseCarbonAccount2.rowla, {
                val1: row.label,
                val2: row.period,
              }),
            });
          }
        },
      },
    },
    {
      label: I18N.carbonFootprint.reportName,
      name: 'reportName',
      type: 'input',
      rules: pageType !== 'detail',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      props: {
        disabled: pageType === 'detail',
      },
    },
    {
      label: I18N.carbonFootprint.accountingCycle,
      name: 'calculatePeriod',
      type: 'select',
      rules: false,
      placeholder: I18N.carbonFootprint.pleaseEnter,
      padding: '0',
      props: {
        disabled: true,
      },
    },
    model === 'defalut'
      ? {
          label: I18N.enterpriseCarbonAccount2.baseline,
          name: 'timeTypes',
          type: 'select',
          rules: false,
          placeholder: I18N.carbonFootprint.pleaseEnter,
          props: {
            disabled: true,
            options: [
              { value: 0, label: I18N.enterpriseCarbonAccount2.baseYear },
              {
                value: 1,
                label: I18N.enterpriseCarbonAccount2.benchmarkQuarter,
              },
              { value: 2, label: I18N.enterpriseCarbonAccount2.baseMonth },
              { value: 3, label: I18N.carbonFootprint.custom },
            ],
          },
        }
      : {
          label: I18N.enterpriseCarbonAccount2.benchmarkEmissions,
          name: 'standardLineEmission',
          type: 'inputNumber',
          rules: false,
          placeholder: I18N.carbonFootprint.pleaseEnter,
          props: {
            disabled: pageType === 'detail',
          },
        },
    // {
    //   label: '数据质量控制计划版本',
    //   name: 'controlPlanVersion',
    //   type: 'select',
    //   rules: false,
    //   placeholder: '请输入',
    //   props: {
    //     disabled: pageType === 'detail',
    //     options: planList,
    //   },
    // },
  ];
  const reportPeopleItemForm = [
    {
      label: I18N.enterpriseCarbonAccount2.reportManager4,
      name: 'mainName',
      type: 'input',
      rules: false,
      placeholder: I18N.carbonFootprint.pleaseEnter,
      props: {
        disabled: pageType === 'detail',
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.reportManager3,
      name: 'mainPhone',
      type: 'input',
      rules: false,
      placeholder: I18N.carbonFootprint.pleaseEnter,
      props: {
        disabled: pageType === 'detail',
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.reportManager2,
      name: 'mainEmail',
      type: 'input',
      rules: false,
      placeholder: I18N.carbonFootprint.pleaseEnter,
      padding: '0',
      props: {
        disabled: pageType === 'detail',
      },
    },
  ];
  const lessInfoItemForm = [
    {
      label: I18N.enterpriseCarbonAccount2.emissionSourceExemption,
      name: 'absolution',
      type: 'textArea',
      rules: false,
      placeholder: I18N.enterpriseCarbonAccount2.emissionsGenerated,
      padding: '0',
      col: 24,
      props: {
        disabled: pageType === 'detail',
        rows: 4,
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.quantitativeMethodsChange,
      name: 'quantizationChangeDesc',
      type: 'textArea',
      rules: false,
      placeholder: I18N.enterpriseCarbonAccount2.ifTheQuantificationMethod,
      padding: '0',
      col: 24,
      props: {
        disabled: pageType === 'detail',
        rows: 4,
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.biomassRelated,
      name: 'biomassDesc',
      type: 'textArea',
      rules: false,
      placeholder: I18N.enterpriseCarbonAccount2.ifThereIsASource,
      padding: '0',
      col: 24,
      props: {
        disabled: pageType === 'detail',
        rows: 4,
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.otherSituations,
      name: 'elseDesc',
      type: 'textArea',
      rules: false,
      placeholder: I18N.enterpriseCarbonAccount2.descriptionForReporting,
      padding: '0',
      col: 24,
      props: {
        disabled: pageType === 'detail',
        rows: 4,
      },
    },
  ];

  const reportVersionItemForm = [
    {
      label: '',
      name: 'versionTypeList',
      type: 'render',
      rules: true,
      rulesCustom: [
        {
          required: true,
          message: I18N.enterpriseCarbonAccount2.pleaseSelectAtLeast2,
        },
      ],
      render: (value, onChange) => (
        <Checkbox.Group
          style={{ width: '100%' }}
          disabled={pageType === 'detail'}
          onChange={onChange}
        >
          <div>
            <div className={styles.versionTitle}>
              {I18N.enterpriseCarbonAccount2.ghgPr}
            </div>
            {GHGoptionsMap.map(item => (
              <Checkbox value={item.value}>{item.label}</Checkbox>
            ))}
            <div className={styles.versionTitle}>
              {I18N.enterpriseCarbonAccount2.isoVersion2}
            </div>
            {ISOoptionsMap.map(item => (
              <Checkbox value={item.value}>{item.label}</Checkbox>
            ))}
          </div>
        </Checkbox.Group>
      ),
    },
  ];
  return [
    baseItemForm,
    reportPeopleItemForm,
    lessInfoItemForm,
    reportVersionItemForm,
  ];
};
