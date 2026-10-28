import I18N from '@src/lang/I18N';
import { isArray } from 'lodash-es';

import {
  renderFormItemSchema,
  renderSchemaWithLayout,
  renderFromGridSchema,
  renderEmptySchema,
} from '@/components/formily/utils';
import { reverseHandleLangFields } from '@/utils';
import { Dicts } from '@/views/dashborad/Dicts/hooks';

import style from './index.module.less';
import { ProcessModelIORes } from '../../CarbonFootprintModel/type';

/** 高精度25位小数 */
const stringMode25 = {
  stringMode: true,
  formatter: (v: string | number) => `${v}`,
  precision: 25,
  min: '0.0000000000000000000000001',
  max: '99999999999.9999999999999999999999999',
};

export const schema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 2,
        }),
        properties: {
          ioName: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.inTheOutputName,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          ioNameEn: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.outputNameInEnglish,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          outputCount: {
            type: 'void',
            title: I18N.carbonFootPrintLCA.quantity,
            'x-decorator': 'FormItem',
            'x-component': 'FormGrid',
            'x-component-props': {
              className: style.gridWrapper,
            },
            'x-decorator-props': {
              asterisk: `{{!$form.readPretty}}`,
            },
            properties: {
              dataValue: renderFormItemSchema({
                validateTitle: I18N.carbonFootPrintLCA.quantity,
                type: 'number',
                'x-component': 'NumberPicker',
                'x-component-props': {
                  placeholder: I18N.base.pleaseEnter,
                  ...stringMode25,
                },
              }),
              unit: renderFormItemSchema({
                validateTitle: I18N.carbonFootPrintLCA.quantityUnit,
                'x-component': 'Cascader',
                'x-component-props': {
                  placeholder: I18N.Factors.pleaseSelect,
                  displayRender: (label: string[]) => {
                    if (!label) return '';
                    return label.slice(-1);
                  },
                  showSearch: true,
                },
              }),
            },
          },
          weightRatio: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.qualityConversionSystem,
            type: 'number',
            'x-component': 'NumberPicker',
            'x-component-props': {
              placeholder: I18N.base.pleaseEnter,
              ...stringMode25,
              min: 0,
            },
          }),
          title: renderFormItemSchema({
            required: false,
            'x-component': 'InfoTitle',
            'x-component-props': {
              title: I18N.carbonFootPrintLCA.downstreamData,
              isFormily: true,
              borderLeft: false,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),
          subIoList: {
            type: 'array',
            required: false,
            'x-component': 'ArrayTable',
            'x-decorator': 'FormItem',
            'x-component-props': {
              pagination: false,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
            default: [],
            items: {
              type: 'object',
              properties: {
                columns1: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.carbonFootPrintLCA.outputDataClass,
                    width: 180,
                  },
                  properties: {
                    dataType_name: renderEmptySchema(
                      { type: 'string' },
                      {
                        showVal: row => <div>{row?.dataType_name || '-'}</div>,
                      },
                    ),
                  },
                },
                columns2: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.carbonFootPrintLCA.downstreamData,
                    width: 270,
                  },
                  properties: {
                    linkName: renderEmptySchema(
                      { type: 'string' },
                      {
                        showVal: row => <div>{row?.linkName || '-'}</div>,
                      },
                    ),
                  },
                },
                columns3: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title:
                      I18N.carbonFootPrintLCA.downstreamRelatedTransmission,
                    width: 270,
                  },
                  properties: {
                    linkIoName: renderEmptySchema(
                      { type: 'string' },
                      {
                        showVal: row => <div>{row?.linkIoName || '-'}</div>,
                      },
                    ),
                  },
                },
              },
            },
          },
        },
      },
    },
  );

/** 新增、编辑保存时的公共部分数据处理 */
export const onHandleAddOrEditData = ({
  formValues,
}: {
  /** 表单填写的数据 */
  formValues: ProcessModelIORes;
}) => {
  /** 表单填写的数据 */
  const { ioName, ioNameEn, dataValue, unit, weightRatio } = formValues || {};

  /** 数量单位的处理 */
  const unitBack = unit ? (isArray(unit) ? String(unit) : unit) : '';

  /** 输入输出基本信息 */
  const baseInfo = {
    ioName,
    ioNameEn,
    dataValue,
    unit: unitBack,
    weightRatio,
  };

  /** 全部公共信息 */
  const wholeIOData = {
    // 基本信息
    ...baseInfo,
  };

  return wholeIOData;
};

/** 编辑/详情反显时的数据处理 */
export const onHandleDetailData = ({
  showBaseLine,
  processManageDataSource,
  unitOptions,
  isDetail,
}: {
  /** 是否展示基准流 */
  showBaseLine?: boolean;
  /** 详情 */
  processManageDataSource: ProcessModelIORes;
  /** 单位 */
  unitOptions?: Dicts[];
  /** 是否是详情 */
  isDetail: boolean;
}) => {
  const {
    ioName,
    dataValue,
    baselineValue,
    unit,
    subIoList,
    /** 多语言数组 */
    languageSourceList,
  } = processManageDataSource || {};

  /** 反处理多语言 */
  const langFields = reverseHandleLangFields(languageSourceList);

  /** 获取单位名称 */
  const getUnitLabel = (dictValue: string) => {
    const unitEnumsItem = unitOptions?.find(
      item => item.dictValue === dictValue,
    );
    return unitEnumsItem?.dictLabel;
  };
  /** 数量单位处理 */
  const unitArr = unit ? unit.split(',') : undefined;
  const unitBack =
    isDetail && unit ? getUnitLabel((unitArr || [])?.[1]) : unitArr;

  return {
    ioName,
    ...langFields,
    dataValue: showBaseLine ? baselineValue : dataValue,
    unit: unitBack,
    subIoList,
  };
};
