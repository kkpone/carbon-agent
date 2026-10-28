/*
 * @@description:因子详情数据
 * @Author: lixingchen qifeng@carbonstop.net
 * @Date: 2022-10-20 14:34:59
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-04-03 18:51:10
 */

import I18N from '@src/lang/I18N';
import { Cascader, FormInstance, Select, Table, Tooltip } from 'antd';
import React from 'react';
import '../../../style.less';
import {
  isoGhgCategory,
  GWPinfo,
  GHGSecondSelect,
  ISOSecondSelect,
  factorType,
} from '@src/views/enterpriseCarbonAccount2/listInfo/util';
import { Toast } from '@src/utils/Toast';
import { Selector } from '@src/views/carbonInternational/carbonManagement/Selector';
import { cloneDeep } from 'lodash-es';
import {
  apiAddLabel,
  apiRemoveLabel,
} from '@src/views/enterpriseCarbonAccount2/service';
import { RouteMaps } from '@src/router/route-paths';
import { activityCategorys } from '@src/views/enterpriseCarbonAccount2/utils';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { disabledDate } from '@src/views/supplyChain2/utils';

import { SupplierOptions } from './emissionFormPage';

export const getEmmissionPageInfo = ({
  pageType,
  form,
  cascaderOptions,
  classifyType,
  gHGFirstSelect,
  ghgSecondSelect,
  isoFirstSelect,
  isoSecondSelect,
  factorId,
  numberFactorDatas,
  columns,
  setActUnit,
  changUnitApi,
  factorUnit,
  activityRecordWayList,
  setGhgSecondSelect,
  setIsoSecondSelect,
  getLableList,
  activityDeptList,
  pathname,
  setSupplierList,
  supplierList,
  supplierItem,
  fillType,
  showSourceId,
  cequivalentUnitZ,
  isDict,
}: {
  form: FormInstance<any>;
  supplierItem?: React.MutableRefObject<SupplierOptions>;
  [key: string]: any;
}) => {
  const GHGSecondSelects = cloneDeep(
    GHGSecondSelect?.map(item => ({ ...item, disabled: !isDict })),
  );
  const ISOSecondSelects = cloneDeep(
    ISOSecondSelect?.map(item => ({ ...item, disabled: !isDict })),
  );
  const resetClassify = ({ ghgCa, isoCl, isoCa, ghgCl }) => {
    let newIsoSecondSelect;
    let newGhgSecondSelect;
    if (classifyType === '2') {
      newIsoSecondSelect = ISOSecondSelects.filter(item => item.pid === isoCa);
      newGhgSecondSelect = GHGSecondSelects?.filter(item => item.pid === ghgCa);
    } else {
      newIsoSecondSelect = isoSecondSelect.filter(item => item.pid === isoCa);
      newGhgSecondSelect = ghgSecondSelect?.filter(item => item.pid === ghgCa);
    }

    setGhgSecondSelect(newGhgSecondSelect);
    setIsoSecondSelect(newIsoSecondSelect);
    form.setFieldsValue({
      ...form.getFieldsValue(true),
      ghgCategory: ghgCa,
      ghgClassify: ghgCl,
      isoCategory: isoCa,
      isoClassify: isoCl,
    });
  };

  const baseFormItems: any = [
    {
      label: I18N.carbonFootprint3.emissionSourceName,
      name: 'name',
      type: 'input',
      rules: pageType !== 'detail',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      props: {
        disabled: pageType === 'detail',
      },
    },
    {
      label: I18N.components.emissionFacilityActivity,
      name: 'facility',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      type: 'input',
      rules: pageType !== 'detail',
      padding: showSourceId ? '0' : null,
      props: {
        disabled: pageType === 'detail',
      },
    },
    {
      label: '',
      name: '',
      placeholder: '',
      type: 'input',
      rules: false,
      props: {
        style: { display: 'none' },
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.ghgClassification2,
      name: 'ghgCategory',
      placeholder: pageType !== 'detail' ? I18N.carbonFootprint.pleaseSelect : '\n',
      type: 'select',
      rules: pageType !== 'detail',
      props: {
        disabled: pageType === 'detail' || classifyType === '0',
        options: gHGFirstSelect,
        fieldNames: {
          label: 'category',
          value: 'id',
        },
        onChange(id) {
          // if (classifyType === '2') {
          const { ghgClassify, isoCategory, isoClassify } =
            form.getFieldsValue(true);

          const [ghgCa, ghgCl, isoCa, isoCl] = isoGhgCategory({
            ghgCategory: id,
            ghgClassify,
            isoCategory,
            isoClassify,
            type: 'ghgCategory',
          });
          resetClassify({ ghgCa, ghgCl, isoCl, isoCa });
          form.setFieldsValue({
            ...form.getFieldsValue(true),
            ghgClassify: undefined,
            isoClassify: undefined,
          });
          // }
        },
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.ghgCategories,
      name: 'ghgClassify',
      placeholder: pageType !== 'detail' ? I18N.carbonFootprint.pleaseSelect : '\n',
      type: 'select',
      rules: pageType !== 'detail',
      props: {
        disabled: pageType === 'detail',
        options: ghgSecondSelect,
        fieldNames: {
          label: 'category',
          value: 'id',
        },
        onChange(id) {
          // if (classifyType === '2') {
          const { ghgCategory, isoCategory, isoClassify } =
            form.getFieldsValue(true);
          const [ghgCa, ghgCl, isoCa, isoCl] = isoGhgCategory({
            ghgCategory,
            ghgClassify: id,
            isoCategory,
            isoClassify,
            type: 'ghgClassify',
          });
          resetClassify({ ghgCa, ghgCl, isoCl, isoCa });
          // }
        },
      },
    },
    {
      label: '',
      name: '',
      placeholder: '',
      type: '',
      rules: false,
      props: {
        style: { display: 'none' },
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.isoClassification2,
      name: 'isoCategory',
      placeholder: pageType !== 'detail' ? I18N.carbonFootprint.pleaseSelect : '\n',
      type: 'select',
      rules: pageType !== 'detail',
      props: {
        disabled: pageType === 'detail' || classifyType === '1',
        options: isoFirstSelect,
        fieldNames: {
          label: 'category',
          value: 'id',
        },
        onChange(id) {
          // if (classifyType === '2') {
          const { ghgClassify, ghgCategory, isoClassify } =
            form.getFieldsValue(true);
          const [ghgCa, ghgCl, isoCa, isoCl] = isoGhgCategory({
            ghgCategory,
            ghgClassify,
            isoCategory: id,
            isoClassify,
            type: 'isoCategory',
          });
          resetClassify({ ghgCa, ghgCl, isoCl, isoCa });
          form.setFieldsValue({
            ...form.getFieldsValue(true),
            ghgClassify: undefined,
            isoClassify: undefined,
          });
          // }
        },
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.isoCategory,
      name: 'isoClassify',
      placeholder: pageType !== 'detail' ? I18N.carbonFootprint.pleaseSelect : '\n',
      type: 'select',
      rules: pageType !== 'detail',
      props: {
        disabled: pageType === 'detail',
        options: isoSecondSelect,
        fieldNames: {
          label: 'category',
          value: 'id',
        },
        onChange(id) {
          // if (classifyType === '2') {
          const { ghgClassify, ghgCategory, isoCategory } =
            form.getFieldsValue(true);
          const [ghgCa, ghgCl, isoCa, isoCl] = isoGhgCategory({
            ghgCategory,
            ghgClassify,
            isoCategory,
            isoClassify: id,
            type: 'isoClassify',
          });
          resetClassify({ ghgCa, ghgCl, isoCl, isoCa });
          // }
        },
      },
    },
  ];
  if (showSourceId) {
    baseFormItems.splice(2, 1);
    baseFormItems.splice(1, 0, {
      label: I18N.enterpriseCarbonAccount2.emissionSourceId,
      name: 'sourceId',
      placeholder: I18N.carbonFootprint.pleaseSelect,
      type: 'input',
      rulesCustom: [
        { required: pageType !== 'detail', message: I18N.enterpriseCarbonAccount2.pleaseEnterEmissions },
        {
          pattern: /^[A-Za-z0-9]+$/,
          message: I18N.enterpriseCarbonAccount2.inputTypeIs,
        },
      ],
      props: {
        disabled: pageType === 'detail' || pageType === 'edit',
      },
    });
  }

  const activeFormItems: any = [
    {
      label: I18N.components.activityDataSheet3,
      name: 'activityUnit',
      type: 'cascader',
      rules: pageType !== 'detail',
      placeholder: I18N.carbonFootprint.pleaseSelect,
      props: {
        disabled: pageType === 'detail',
        options: cascaderOptions,
        displayRender(label) {
          return label[label.length - 1];
        },
        fieldNames: {
          label: 'dictLabel',
          value: 'dictValue',
          children: 'enumList',
        },
        onChange(value, item) {
          if (item.length === 2) {
            const { dictLabel } = item[1];
            setActUnit(dictLabel);
            changUnitApi(dictLabel, factorUnit);
          }
        },
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.activityDataRecording,
      name: 'activityRecordWay',
      padding:
        pathname ===
        RouteMaps.enterpriseCarbonAccountingcarbonDischargeEditEmission
          ? '0'
          : '',
      type: 'render',
      rules: pageType !== 'detail',
      render: () => (
        <Selector
          placeholder={I18N.carbonFootprint.pleaseSelect}
          disabled={pageType === 'detail'}
          onAddItem={async labelname => {
            const labelArr = activityRecordWayList.map(item => item.value);
            if (labelArr?.includes(labelname)) {
              Toast('warn', I18N.enterpriseCarbonAccount2.pleaseDoNotAddAgain);
              return;
            }
            apiAddLabel({ type: 0, labelname }).then(() => {
              getLableList(0);
            });
          }}
          onDelItem={async (val, label, data) => {
            apiRemoveLabel({ sourceLabelId: data.sourceLabelId }).then(() => {
              getLableList(0);
            });
          }}
          options={activityRecordWayList}
          aria-label=''
        />
      ),
    },

    {
      label: I18N.enterpriseCarbonAccount2.activityDataProtection,
      name: 'activityDept',
      padding:
        pathname ===
          RouteMaps.enterpriseCarbonAccountingcarbonDischargeEditEmission ||
        pathname ===
          RouteMaps.enterpriseCarbonAccountingcarbonDischargeAddEmission ||
        pathname ===
          RouteMaps.enterpriseCarbonAccountingcarbonDischargeCopyEmission
          ? ''
          : '0',
      type: 'render',
      rules: pageType !== 'detail',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      render: () => (
        <Selector
          placeholder={I18N.carbonFootprint.pleaseSelect}
          disabled={pageType === 'detail'}
          onAddItem={async labelname => {
            const labelArr = activityDeptList.map(item => item.value);
            if (labelArr?.includes(labelname)) {
              Toast('warn', I18N.enterpriseCarbonAccount2.pleaseDoNotAddAgain);
              return;
            }
            apiAddLabel({ type: 1, labelname }).then(() => {
              getLableList(1);
            });
          }}
          onDelItem={async (val, label, data) => {
            apiRemoveLabel({ sourceLabelId: data.sourceLabelId }).then(() => {
              getLableList(1);
            });
          }}
          options={activityDeptList}
          aria-label=''
        />
      ),
    },
    {
      label: I18N.enterpriseCarbonAccount2.activityDataClass,
      name: 'activityCategory',
      type: 'select',
      rules: pageType !== 'detail',
      placeholder: pageType !== 'detail' ? I18N.carbonFootprint.pleaseSelect : '\n',
      props: {
        disabled: pageType === 'detail',
        options: activityCategorys,
        onChange(e) {
          form.setFieldsValue({
            ...form.getFieldsValue(true),
            activityScore: e,
          });
        },
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.activityDataReview,
      name: 'activityScore',
      padding:
        pathname ===
        RouteMaps.enterpriseCarbonAccountingcarbonDischargeEditEmission
          ? '0'
          : '',
      type: 'input',
      rules: pageType !== 'detail',
      placeholder: '\n',
      props: {
        disabled: true,
      },
    },
  ];

  const evaluateFormItems: any = [
    {
      label: I18N.enterpriseCarbonAccount2.emissionFactors,
      name: 'factorType',
      type: 'select',
      rules: pageType !== 'detail',
      placeholder: pageType !== 'detail' ? I18N.carbonFootprint.pleaseSelect : '\n',
      props: {
        disabled: pageType === 'detail',
        options: factorType,
        onChange(value) {
          form.setFieldsValue({
            ...form.getFieldsValue(true),
            factorScore: value,
          });
        },
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.emissionFactorAssessment,
      name: 'factorScore',
      type: 'input',
      rules: pageType !== 'detail',
      placeholder: '\n',
      props: {
        disabled: true,
      },
    },
    {
      label: I18N.carbonFootprint.emissionFactors2,
      name: 'factorSource',
      type: 'input',
      padding: '0',
      rules: pageType !== 'detail',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      props: {
        disabled:
          pageType === 'detail' ||
          // (pageType === 'edit' && editFactor) ||
          !!factorId ||
          fillType === 'emissionFactor',
      },
    },
    {
      label: I18N.carbonFootprint.yearOfPublication,
      name: 'factorPublic',
      type: 'date',
      rules: pageType !== 'detail',
      placeholder: pageType === 'detail' ? '\n' : I18N.carbonFootprint.pleaseSelect,
      props: {
        picker: 'year',
        disabled:
          pageType === 'detail' ||
          // (pageType === 'edit' && editFactor) ||
          !!factorId ||
          fillType === 'emissionFactor',
      },
    },
  ];
  /** 自定义供应商 选项数据 */
  const defaultAddSupplyData: SupplierOptions = {
    label: '',
    value: '',
    parmasId: NaN,
    email: '',
  };
  const gasEmissionFormItems: any = [
    {
      label: '',
      name: 'factorGasList',
      type: 'render',
      rules: false,
      placeholder: '',
      col: 24,
      padding: '0',
      render() {
        return (
          <Table
            style={{ marginTop: 12 }}
            bordered
            dataSource={numberFactorDatas}
            columns={columns}
            pagination={false}
          />
        );
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.unitConversionRatio,
      name: 'unitConver',
      type: 'inputNumber',
      rules: pageType !== 'detail',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      props: {
        // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
        max: 99999999999.9999999999,
        min: 0.0000000001,
        disabled: pageType === 'detail',
      },
    },
  ];
  const GWPInfo = {
    label: (
      <div>
        <Tooltip title={I18N.enterpriseCarbonAccount2.gwpRefersTo}>
          {I18N.enterpriseCarbonAccount2.gwpInformation}<QuestionCircleOutlined />
        </Tooltip>
      </div>
    ),
    name: 'gwp',
    type: 'select',
    rules: false,
    padding: '0',
    placeholder: '\n',
    col: 16,
    props: {
      options: GWPinfo,
      disabled: true,
    },
  };
  const supplierDataFormItems: any = [
    {
      label: I18N.carbonFootprint.unitProductScheduling,
      name: 'unitDischarge',
      type: 'input',
      rules: false,
      props: {
        disabled: true,
      },
    },
    {
      label: I18N.carbonFootprint.unit,
      name: 'render',
      type: 'render',
      rules: false,
      render: () => (
        <div className='flex-a-c flex-j-b'>
          <Select
            value={form.getFieldValue('unitSupplier')}
            style={{ width: '47.55%', transition: 'none' }}
            options={cequivalentUnitZ}
            disabled
          />
          /
          <Cascader
            value={form.getFieldValue('unitmSupplier')}
            style={{ width: '47.55%', transition: 'none' }}
            disabled
            options={cascaderOptions}
            fieldNames={{
              label: 'dictLabel',
              value: 'dictValue',
              children: 'enumList',
            }}
          />
        </div>
      ),
    },
    {
      label: I18N.carbonFootprint3.accountingYear2,
      name: 'year',
      // type: 'input',
      type: 'date',
      rules: false,
      props: {
        picker: 'year',
        disabled: true,
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.emissionFactors,
      name: 'factorType',
      type: 'select',
      rules: false,
      props: {
        disabled: pageType === 'detail',
        options: factorType,
        onChange(value) {
          form.setFieldsValue({
            ...form.getFieldsValue(true),
            factorScore: value,
          });
        },
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.emissionFactorAssessment,
      name: 'factorScore',
      type: 'input',
      rules: false,
      props: {
        disabled: true,
      },
    },
    {
      label: '',
      name: '',
      type: '',
      rules: false,
      props: {
        style: { display: 'none' },
      },
    },
    {
      label: I18N.carbonFootprint3.supplierName,
      name: 'supplierName',
      type: 'select',
      rules: pageType !== 'detail',
      props: {
        disabled: pageType === 'detail',
        showSearch: true,
        onBlur: () => {
          const hasSuplier = supplierList?.find(
            item => item.label === supplierItem?.current?.label,
          );
          if (!hasSuplier && supplierItem?.current?.label) {
            setSupplierList([...supplierList, supplierItem?.current]);
            form.setFieldsValue({
              ...form.getFieldsValue(),
              supplierName: supplierItem?.current?.label,
            });
            supplierItem!.current = {
              ...defaultAddSupplyData,
            };
          } else {
            setSupplierList([...supplierList]);
          }
        },
        onInput() {
          form.setFieldsValue({
            ...form.getFieldsValue(),
            email: '',
          });
        },
        onSelect: (lable, item) => {
          form.setFieldsValue({
            ...form.getFieldsValue(),
            email: item?.email || '-',
          });
          supplierItem!.current = {
            ...defaultAddSupplyData,
          };
        },
        filterOption(input: string, option: SupplierOptions) {
          if (
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          ) {
            return true;
          }
          supplierItem!.current = {
            ...defaultAddSupplyData,
            label: input,
            value: input,
          };

          return false;
        },
        options: supplierList,
      },
    },
    {
      label: I18N.carbonFootprint3.eMail,
      name: 'email',
      type: 'input',
      rulesCustom: [
        { required: pageType !== 'detail', message: I18N.enterpriseCarbonAccount2.emailCannotBe },
        {
          type: 'email',
          message: I18N.enterpriseCarbonAccount2.emailFormatIsIncorrect,
        },
      ],
      props: {
        disabled:
          !supplierList?.some(
            item =>
              item.label === form.getFieldValue('supplierName') &&
              Number.isNaN(item.parmasId),
          ) || pageType === 'detail',
        onBlur(e) {
          const { value } = e.target;
          const supItem = supplierList.find(
            item => item.label === form.getFieldValue('supplierName'),
          );
          if (supItem.label === supItem.parmasId) {
            // 用户输入
            supplierList.forEach(item => {
              if (item.label === supItem.label) {
                item.email = value;
              }
            });
            setSupplierList([...supplierList]);
          }
        },
      },
    },
    {
      label: I18N.carbonFootprint3.deadline,
      name: 'expireTime',
      type: 'date',
      rules: pageType !== 'detail',
      props: {
        disabled: pageType === 'detail',
        disabledDate,
      },
    },
    {
      label: I18N.carbonFootprint3.dataRequestClass,
      name: 'dataType',
      type: 'radio',
      rules: pageType !== 'detail',
      col: 24,
      props: {
        disabled: pageType === 'detail',
        options: [
          { value: 1, label: I18N.carbonFootprint3.carbonFootprintVerification2 },
          { value: 2, label: I18N.carbonFootprint3.carbonFootprintVerification },
        ],
      },
    },
    {
      label: I18N.carbonFootprint3.theSystemBoundaryNeedsTo,
      name: 'borderType',
      type: 'radio',
      rules: pageType !== 'detail',
      col: 24,
      props: {
        disabled: pageType === 'detail',
        className: 'brstyle',
        options: [
          {
            value: 1,
            label: (
              <div style={{ marginBottom: 16 }}>
                <span>{I18N.carbonFootprint3.halfLifeCycle}</span>
                <span style={{ color: '#999EA4' }}>
                  {I18N.carbonFootprint3.fromResourceExtraction2}</span>
              </div>
            ),
          },
          {
            value: 2,
            label: (
              <>
                <span>{I18N.carbonFootprint3.fullLifecycle}</span>
                <span style={{ color: '#999EA4' }}>
                  {I18N.carbonFootprint3.fromResourceExtraction}</span>
              </>
            ),
          },
        ],
      },
    },
    {
      label: I18N.carbonFootprint3.dataRequirementDescription,
      name: 'descr',
      type: 'textArea',
      rules: false,
      col: 16,
      props: {
        disabled: pageType === 'detail',
        row: 4,
      },
    },
  ];
  return {
    baseFormItems,
    activeFormItems,
    evaluateFormItems,
    gasEmissionFormItems,
    GWPInfo,
    supplierDataFormItems,
  };
};

export const radioSelect = [
  { label: I18N.carbonFootprint.emissionFactors, value: 'emissionFactor' },
  { label: I18N.carbonFootprint3.newFactor, value: 'newFactor' },
  { label: I18N.carbonFootprint3.supplierData, value: 'supplierData' },
];
