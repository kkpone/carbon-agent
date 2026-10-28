/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import questionnaireBgImg from '@assets/images/questionnaire_bg.png';
import {
  Form,
  FormItem,
  Input,
  FormGrid,
  DatePicker,
  NumberPicker,
  Checkbox,
  Radio,
} from '@formily/antd-v5';
import { Form as FormType } from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N, { serviceLangMap } from '@src/lang/I18N';
import { useMount } from 'ahooks';
import { Button, Spin } from 'antd';
import classNames from 'classnames';
import EChartsReact from 'echarts-for-react';
import { omit } from 'lodash-es';
import moment from 'moment';
import { FC, useRef, useState } from 'react';

import { FullscreenModal } from '@/components/FullscreenModal';
import { FormilyAreaCodeInput } from '@/components/formily/components/AreaCodeInput';
import { IconAlibabaNew } from '@/components/iconfont';
import { LocaleType } from '@/lang/I18N';
import { Toast } from '@/utils';

import styles from './index.module.less';
import { getQuestionnaireOverview, questionnaireSubmit } from './service';
import {
  BUS_TYPE,
  CHANGE_STATUS,
  QUESTIONNAIRE_CATEGORY_LABEL,
  QUESTIONNAIRE_STATUS,
  STAFF_INFO,
  TIME_TYPE,
  TRANSPORT_WAY,
  TRANSPORT_WAY_COLOR,
  TRANSPORT_WAY_ICON,
  TRANSPORT_WAY_LABEL,
  WORKDAY_TYPE,
} from '../../constant';
import { Questionnaire } from '../../type';
import AddressList from '../AddressList';
import CustomSelect from '../CustomSelect';
import CustomSlider from '../CustomSlider';
import MapQuery from '../MapQuery';
import WorkdayCountInput from '../WorkdayCountInput';

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    FormGrid,
    DatePicker,
    NumberPicker,
    Checkbox,
    Radio,
    AddressList,
    FormilyAreaCodeInput,
    MapQuery,
    CustomSelect,
    CustomSlider,
    WorkdayCountInput,
  },
});

const PCFill: FC<{
  questionId: string;
  locale: LocaleType;
  questionnaire: Questionnaire | undefined;
  loading: boolean;
  form: FormType;
  changeLang: (lang: LocaleType) => void;
}> = ({ questionId, form, locale, loading, questionnaire, changeLang }) => {
  const [submitLoading, setSubmitLoading] = useState(false);

  const [overviewData, setOverviewData] = useState<Record<string, any>>();

  const [entryTimeType, setEntryTimeType] = useState<number>();

  const timeRef = useRef(0);

  const submit = async () => {
    try {
      setSubmitLoading(true);
      const {
        phoneNum,
        transportWay,
        transportRatio,
        changeStatus,
        changeTime: _changeTime,
        changeWeekdayCount,
        changeDistance,
        changeTransportWay,
        changeTransportRatio,
        ...rest
      } = await form.submit<Record<string, any>>();

      const resp = await questionnaireSubmit({
        ...rest,
        weekdayCount:
          questionnaire?.workdayType === WORKDAY_TYPE.YEARLY
            ? undefined
            : rest.weekdayCount,
        workdayTotal:
          questionnaire?.workdayType === WORKDAY_TYPE.YEARLY
            ? rest.weekdayCount
            : rest.workdayTotal,
        addressChanged: changeStatus,
        workdayTotal2:
          changeStatus === CHANGE_STATUS.YES ? changeWeekdayCount : undefined,
        distance2:
          changeStatus === CHANGE_STATUS.YES ? changeDistance : undefined,
        lang: serviceLangMap[locale],
        useTime: Number(((Date.now() - timeRef.current) / 1000).toFixed(0)),
        questionId,
        phoneNum: phoneNum?.phone_number,
        areaCode: phoneNum?.areaCode?.match(/\((\+\d+)\)/)?.[1] || '+86',
        transList: transportRatio?.map((item, index) => ({
          transType: item.transType,
          transRate: item.value - (transportRatio[index - 1]?.value || 0),
        })),
        transList2:
          changeStatus === CHANGE_STATUS.YES
            ? changeTransportRatio?.map((item, index) => ({
                transType: item.transType,
                transRate:
                  item.value - (changeTransportRatio[index - 1]?.value || 0),
              }))
            : undefined,
      });

      const { data } = await getQuestionnaireOverview({
        resultId: resp.data.data,
      });

      setOverviewData({
        ...data.data,
        factors: (data.data.factors || []).sort((p, c) =>
          p.factorValue !== c.factorValue
            ? Number(c.factorValue) - Number(p.factorValue)
            : c.transType - p.transType,
        ),
      });

      Toast('success', I18N.carbonFootprint.submittedSuccessfully);
    } finally {
      setSubmitLoading(false);
    }
  };

  useMount(() => {
    timeRef.current = Date.now();
  });

  return (
    <FullscreenModal>
      <div className={styles.fill}>
        <Spin spinning={loading}>
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              {I18N.template(I18N.questionnaire.quest10, {
                val1: questionnaire?.year,
              })}
              {questionnaire && (
                <div className={styles.questionnaireTag}>
                  {QUESTIONNAIRE_CATEGORY_LABEL()[questionnaire.type]}
                </div>
              )}
            </div>
            <IconAlibabaNew
              className={styles.langIcon}
              type={locale === LocaleType.zhCN ? 'icon-zhongwen' : 'icon-EN'}
              onClick={() => {
                changeLang(
                  locale === LocaleType.zhCN
                    ? LocaleType.enUS
                    : LocaleType.zhCN,
                );
              }}
            />
          </div>
          {questionnaire &&
            (questionnaire.status === QUESTIONNAIRE_STATUS.PUBLISHED ? (
              <>
                <div
                  className={styles.content}
                  style={{ background: overviewData ? '#fff' : '#f5f7fa' }}
                >
                  <div
                    className={classNames(styles.fillContent, {
                      [styles.hide]: !!overviewData,
                    })}
                  >
                    <div
                      className={styles.questionnaireTitle}
                      title={questionnaire.name}
                    >
                      {questionnaire.name}
                    </div>
                    {questionnaire.expireTime && (
                      <div className={styles.expireTime}>
                        {I18N.supplyChainCarbonManagement.deadline2}
                        {questionnaire.expireTime}
                      </div>
                    )}
                    <Form
                      className={styles.fillForm}
                      form={form}
                      layout='vertical'
                      colon={false}
                    >
                      <SchemaField
                        schema={{
                          type: 'object',
                          properties: {
                            grid: {
                              type: 'void',
                              'x-component': 'FormGrid',
                              'x-component-props': {
                                maxColumns: 2,
                                columnGap: 16,
                                rowGap: 0,
                              },
                              properties: {
                                employeeName: {
                                  type: 'string',
                                  title: I18N.system.name,
                                  required: true,
                                  'x-decorator': 'FormItem',
                                  'x-component': 'Input',
                                  'x-component-props': {
                                    placeholder: I18N.base.pleaseEnter,
                                  },
                                },
                                phoneNum: {
                                  type: 'string',
                                  title: I18N.dashborad.mobilePhoneNumber,
                                  required: true,
                                  'x-visible':
                                    questionnaire.employeeInfos.includes(
                                      STAFF_INFO.PHONE,
                                    ),
                                  'x-decorator': 'FormItem',
                                  'x-component': 'FormilyAreaCodeInput',
                                  'x-component-props': {
                                    placeholder: I18N.base.pleaseEnter,
                                  },
                                  'x-validator': val => {
                                    if (!val || !val.phone_number) {
                                      return I18N.dashborad
                                        .pleaseEnterMobilePhoneNumber;
                                    }

                                    return '';
                                  },
                                },
                                email: {
                                  type: 'string',
                                  title: I18N.carbonFootprint.mailbox,
                                  required: true,
                                  'x-visible':
                                    questionnaire.employeeInfos.includes(
                                      STAFF_INFO.EMAIL,
                                    ),
                                  'x-decorator': 'FormItem',
                                  'x-component': 'Input',
                                  'x-component-props': {
                                    placeholder: I18N.base.pleaseEnter,
                                  },
                                },
                                department: {
                                  type: 'string',
                                  title: I18N.dashborad.department,
                                  required: true,
                                  'x-visible':
                                    questionnaire.employeeInfos.includes(
                                      STAFF_INFO.DEPARTMENT,
                                    ),
                                  'x-decorator': 'FormItem',
                                  'x-component': 'Input',
                                  'x-component-props': {
                                    placeholder: I18N.base.pleaseEnter,
                                  },
                                },
                                employeeCode: {
                                  type: 'string',
                                  title: I18N.questionnaire.workNumber,
                                  required: true,
                                  'x-visible':
                                    questionnaire.employeeInfos.includes(
                                      STAFF_INFO.WORK_NO,
                                    ),
                                  'x-decorator': 'FormItem',
                                  'x-component': 'Input',
                                  'x-component-props': {
                                    placeholder: I18N.base.pleaseEnter,
                                  },
                                },
                                empty: {
                                  'x-decorator': 'FormItem',
                                  'x-visible':
                                    questionnaire.employeeInfos.length % 2 !==
                                    0,
                                },
                                entryTimeType: {
                                  type: 'string',
                                  title:
                                    I18N.questionnaire
                                      .atTheTimeOfYourEmployment,
                                  required: true,
                                  enum: [
                                    {
                                      value: TIME_TYPE.PREV,
                                      label: I18N.template(
                                        I18N.questionnaire.quest9,
                                        { val1: questionnaire.year },
                                      ),
                                    },
                                    {
                                      value: TIME_TYPE.DURING,
                                      label: I18N.template(
                                        I18N.questionnaire.quest8,
                                        { val1: questionnaire.year },
                                      ),
                                    },
                                    {
                                      value: TIME_TYPE.AFTER,
                                      label: I18N.template(
                                        I18N.questionnaire.quest7,
                                        { val1: questionnaire.year },
                                      ),
                                    },
                                  ],
                                  'x-decorator': 'FormItem',
                                  'x-decorator-props': {
                                    gridSpan: 2,
                                  },
                                  'x-component': 'Radio.Group',
                                  'x-component-props': {
                                    onChange: e =>
                                      setEntryTimeType(e.target.value),
                                  },
                                },
                                entryTime: {
                                  type: 'string',
                                  title: I18N.questionnaire.entryTime,
                                  required: true,
                                  'x-decorator': 'FormItem',
                                  'x-component': 'DatePicker',
                                  'x-component-props': {
                                    placeholder:
                                      I18N.carbonFootprint.pleaseSelect,
                                    defaultPickerValue: moment(
                                      `${questionnaire.year}-01-01`,
                                    ),
                                    disabledDate: current =>
                                      current?.format('YYYY') !==
                                      questionnaire.year,
                                  },
                                  'x-visible': false,
                                  'x-reactions': {
                                    dependencies: ['.entryTimeType'],
                                    fulfill: {
                                      state: {
                                        visible: `{{ $deps[0] == ${TIME_TYPE.DURING} }}`,
                                      },
                                    },
                                  },
                                },
                                timeEmpty: {
                                  title: ' ',
                                  'x-decorator': 'FormItem',
                                  'x-reactions': {
                                    dependencies: ['.entryTimeType'],
                                    fulfill: {
                                      state: {
                                        visible: `{{ $deps[0] == ${TIME_TYPE.DURING} }}`,
                                      },
                                    },
                                  },
                                },
                                weekdayCount: {
                                  type: 'string',
                                  title:
                                    questionnaire.workdayType ===
                                    WORKDAY_TYPE.YEARLY
                                      ? I18N.questionnaire.yourAnnualWorkDays
                                      : I18N.questionnaire.yourWeeklyWork,
                                  required: true,
                                  'x-decorator': 'FormItem',
                                  'x-decorator-props': {
                                    gridSpan: 2,
                                  },
                                  'x-component': 'WorkdayCountInput',
                                  'x-component-props': {
                                    mode:
                                      questionnaire.workdayType ??
                                      WORKDAY_TYPE.WEEKLY,
                                  },
                                  'x-validator': value => {
                                    if (
                                      questionnaire?.workdayType !==
                                        WORKDAY_TYPE.YEARLY ||
                                      Number(form.values.changeStatus) !==
                                        CHANGE_STATUS.YES ||
                                      !form.values.changeWeekdayCount ||
                                      !value
                                    ) {
                                      return '';
                                    }

                                    return Number(value) >
                                      Number(form.values.changeWeekdayCount)
                                      ? ''
                                      : I18N.questionnaire.annualWorkDaysLimit;
                                  },
                                  'x-reactions': [
                                    {
                                      dependencies: ['.entryTimeType'],
                                      fulfill: {
                                        state: {
                                          visible: `{{ $deps[0] != ${TIME_TYPE.AFTER} }}`,
                                        },
                                      },
                                    },
                                  ],
                                },
                                workdayTotal: {
                                  type: 'string',
                                  title: I18N.questionnaire.yourAnnualWorkDays,
                                  required: true,
                                  'x-decorator': 'FormItem',
                                  'x-decorator-props': {
                                    gridSpan: 2,
                                  },
                                  'x-component': 'WorkdayCountInput',
                                  'x-component-props': {
                                    mode: WORKDAY_TYPE.YEARLY,
                                  },
                                  'x-validator': value => {
                                    if (
                                      questionnaire?.workdayType !==
                                        WORKDAY_TYPE.WEEKLY ||
                                      Number(form.values.changeStatus) !==
                                        CHANGE_STATUS.YES ||
                                      !form.values.changeWeekdayCount ||
                                      !value
                                    ) {
                                      return '';
                                    }

                                    return Number(value) >
                                      Number(form.values.changeWeekdayCount)
                                      ? ''
                                      : I18N.questionnaire.annualWorkDaysLimit;
                                  },
                                  'x-visible': false,
                                  'x-reactions': [
                                    {
                                      dependencies: ['.entryTimeType'],
                                      fulfill: {
                                        state: {
                                          visible: `{{ ${
                                            questionnaire.workdayType ===
                                            WORKDAY_TYPE.WEEKLY
                                          } && $deps[0] != ${
                                            TIME_TYPE.AFTER
                                          } }}`,
                                        },
                                      },
                                    },
                                  ],
                                },
                                distance: {
                                  type: 'string',
                                  title:
                                    I18N.questionnaire.yourCommutingDistance,
                                  required: true,
                                  'x-decorator': 'FormItem',
                                  'x-decorator-props': {
                                    gridSpan: 2,
                                    style: { marginBottom: 8 },
                                  },
                                  'x-component': 'NumberPicker',
                                  'x-component-props': {
                                    placeholder: I18N.base.pleaseEnter,
                                    min: 0,
                                    controls: false,
                                    stringMode: true,
                                    precision: 2,
                                    addonAfter: 'pkm',
                                    style: {
                                      width: '100%',
                                    },
                                  },
                                  'x-reactions': [
                                    {
                                      dependencies: ['.entryTimeType'],
                                      fulfill: {
                                        state: {
                                          visible: `{{ $deps[0] != ${TIME_TYPE.AFTER} }}`,
                                        },
                                      },
                                    },
                                  ],
                                },
                                mapQuery: {
                                  type: 'void',
                                  'x-decorator': 'FormItem',
                                  'x-decorator-props': {
                                    gridSpan: 2,
                                    style: { marginBottom: 16, height: 22 },
                                  },
                                  'x-component': 'MapQuery',
                                  'x-component-props': {
                                    addressList: questionnaire.companyAddress,
                                    onConfirm: distance => {
                                      form.setValues({
                                        distance,
                                      });
                                    },
                                  },
                                  'x-reactions': [
                                    {
                                      dependencies: ['.entryTimeType'],
                                      fulfill: {
                                        state: {
                                          visible: `{{ $deps[0] != ${TIME_TYPE.AFTER} }}`,
                                        },
                                      },
                                    },
                                  ],
                                },
                                transportWay: {
                                  type: 'string',
                                  title: I18N.questionnaire.yourCommutingRoute,
                                  required: true,
                                  'x-decorator': 'FormItem',
                                  'x-decorator-props': {
                                    gridSpan: 2,
                                  },
                                  'x-component': 'CustomSelect',
                                  'x-component-props': {
                                    multiple: true,
                                    style: { columnGap: 4 },
                                    options: Object.values(
                                      omit(
                                        TRANSPORT_WAY,
                                        questionnaire.busType ===
                                          BUS_TYPE.UN_SUPPORT
                                          ? 'SHUTTLE_BUS'
                                          : '',
                                      ),
                                    ).map(way => ({
                                      value: way,
                                      label: TRANSPORT_WAY_LABEL()[way],
                                      icon: TRANSPORT_WAY_ICON[way],
                                    })),
                                    optionRender: (
                                      option: Record<string, any>,
                                      selected: boolean,
                                    ) => (
                                      <div
                                        className={classNames(
                                          styles.transportOption,
                                          {
                                            [styles.selectedTransportOption]:
                                              selected,
                                          },
                                        )}
                                      >
                                        <IconAlibabaNew
                                          className={styles.transportOptionIcon}
                                          type={option.icon}
                                        />
                                        <div
                                          className={
                                            styles.transportOptionLabel
                                          }
                                        >
                                          {option.label}
                                        </div>
                                      </div>
                                    ),
                                  },
                                  'x-reactions': [
                                    {
                                      dependencies: ['.entryTimeType'],
                                      fulfill: {
                                        state: {
                                          visible: `{{ $deps[0] != ${TIME_TYPE.AFTER} }}`,
                                        },
                                      },
                                    },
                                  ],
                                },
                                transportRatio: {
                                  type: 'string',
                                  title:
                                    I18N.questionnaire
                                      .variousTransportationModes,
                                  required: true,
                                  'x-decorator': 'FormItem',
                                  'x-decorator-props': {
                                    gridSpan: 2,
                                  },
                                  'x-component': 'CustomSlider',
                                  'x-reactions': [
                                    {
                                      dependencies: ['.entryTimeType'],
                                      fulfill: {
                                        state: {
                                          visible: `{{ $deps[0] != ${TIME_TYPE.AFTER} }}`,
                                        },
                                      },
                                    },
                                  ],
                                },
                                changeStatus: {
                                  type: 'number',
                                  title: I18N.questionnaire.addressChanged,
                                  required: true,
                                  enum: [
                                    {
                                      value: CHANGE_STATUS.YES,
                                      label: I18N.carbonNeutral.yes,
                                    },
                                    {
                                      value: CHANGE_STATUS.NO,
                                      label: I18N.carbonNeutral.no,
                                    },
                                  ],
                                  default: CHANGE_STATUS.NO,
                                  'x-decorator': 'FormItem',
                                  'x-decorator-props': {
                                    gridSpan: 2,
                                  },
                                  'x-component': 'Radio.Group',
                                  'x-reactions': [
                                    {
                                      dependencies: ['.entryTimeType'],
                                      fulfill: {
                                        state: {
                                          visible: `{{ $deps[0] != ${TIME_TYPE.AFTER} }}`,
                                        },
                                      },
                                    },
                                  ],
                                },
                                changeTime: {
                                  type: 'string',
                                  title: I18N.questionnaire.changedAddressTime,
                                  required: true,
                                  'x-decorator': 'FormItem',
                                  'x-component': 'DatePicker',
                                  'x-component-props': {
                                    placeholder:
                                      I18N.carbonFootprint.pleaseSelect,
                                    defaultPickerValue: moment(
                                      `${questionnaire.year}-01-01`,
                                    ),
                                    disabledDate: current => {
                                      const {
                                        entryTime,
                                        entryTimeType: currentEntryTimeType,
                                      } = form.values;
                                      const minDate =
                                        Number(currentEntryTimeType) ===
                                          TIME_TYPE.DURING && entryTime
                                          ? moment(entryTime)
                                          : moment(
                                              `${questionnaire.year}-01-01`,
                                            );
                                      const maxDate = moment(
                                        `${questionnaire.year}-12-31`,
                                      ).endOf('day');

                                      return (
                                        !current ||
                                        current.isBefore(minDate, 'day') ||
                                        current.isAfter(maxDate, 'day')
                                      );
                                    },
                                  },
                                  'x-visible': false,
                                  'x-reactions': [
                                    {
                                      dependencies: [
                                        '.entryTimeType',
                                        '.changeStatus',
                                      ],
                                      fulfill: {
                                        state: {
                                          visible: `{{ $deps[0] != ${TIME_TYPE.AFTER} && $deps[1] == ${CHANGE_STATUS.YES} }}`,
                                        },
                                      },
                                    },
                                  ],
                                },
                                changeWeekdayCount: {
                                  type: 'string',
                                  title: I18N.questionnaire.changedWorkDays,
                                  required: true,
                                  'x-decorator': 'FormItem',
                                  'x-decorator-props': {
                                    gridSpan: 2,
                                  },
                                  'x-component': 'WorkdayCountInput',
                                  'x-component-props': {
                                    mode: WORKDAY_TYPE.YEARLY,
                                  },
                                  'x-validator': value => {
                                    const totalWorkdayCount = Number(
                                      questionnaire?.workdayType ===
                                        WORKDAY_TYPE.YEARLY
                                        ? form.values.weekdayCount
                                        : form.values.workdayTotal,
                                    );
                                    const changedWorkdayCount = Number(value);

                                    if (
                                      !value ||
                                      Number.isNaN(totalWorkdayCount) ||
                                      Number.isNaN(changedWorkdayCount)
                                    ) {
                                      return '';
                                    }

                                    return changedWorkdayCount <
                                      totalWorkdayCount
                                      ? ''
                                      : I18N.questionnaire.annualWorkDaysLimit;
                                  },
                                  'x-visible': false,
                                  'x-reactions': [
                                    {
                                      dependencies: [
                                        '.entryTimeType',
                                        '.changeStatus',
                                      ],
                                      fulfill: {
                                        state: {
                                          visible: `{{ $deps[0] != ${TIME_TYPE.AFTER} && $deps[1] == ${CHANGE_STATUS.YES} }}`,
                                        },
                                      },
                                    },
                                  ],
                                },
                                changeDistance: {
                                  type: 'string',
                                  title:
                                    I18N.questionnaire.changedCommutingDistance,
                                  required: true,
                                  'x-decorator': 'FormItem',
                                  'x-decorator-props': {
                                    gridSpan: 2,
                                    style: { marginBottom: 8 },
                                  },
                                  'x-component': 'NumberPicker',
                                  'x-component-props': {
                                    placeholder: I18N.base.pleaseEnter,
                                    min: 0,
                                    controls: false,
                                    stringMode: true,
                                    precision: 2,
                                    addonAfter: 'pkm',
                                    style: {
                                      width: '100%',
                                    },
                                  },
                                  'x-visible': false,
                                  'x-reactions': [
                                    {
                                      dependencies: [
                                        '.entryTimeType',
                                        '.changeStatus',
                                      ],
                                      fulfill: {
                                        state: {
                                          visible: `{{ $deps[0] != ${TIME_TYPE.AFTER} && $deps[1] == ${CHANGE_STATUS.YES} }}`,
                                        },
                                      },
                                    },
                                  ],
                                },
                                changeMapQuery: {
                                  type: 'void',
                                  'x-decorator': 'FormItem',
                                  'x-decorator-props': {
                                    gridSpan: 2,
                                    style: { marginBottom: 16, height: 22 },
                                  },
                                  'x-component': 'MapQuery',
                                  'x-component-props': {
                                    addressList: questionnaire.companyAddress,
                                    onConfirm: distance => {
                                      form.setValues({
                                        changeDistance: distance,
                                      });
                                    },
                                  },
                                  'x-visible': false,
                                  'x-reactions': [
                                    {
                                      dependencies: [
                                        '.entryTimeType',
                                        '.changeStatus',
                                      ],
                                      fulfill: {
                                        state: {
                                          visible: `{{ $deps[0] != ${TIME_TYPE.AFTER} && $deps[1] == ${CHANGE_STATUS.YES} }}`,
                                        },
                                      },
                                    },
                                  ],
                                },
                                changeTransportWay: {
                                  type: 'string',
                                  title:
                                    I18N.questionnaire.changedCommutingRoute,
                                  required: true,
                                  'x-decorator': 'FormItem',
                                  'x-decorator-props': {
                                    gridSpan: 2,
                                  },
                                  'x-component': 'CustomSelect',
                                  'x-component-props': {
                                    multiple: true,
                                    style: { columnGap: 4 },
                                    options: Object.values(
                                      omit(
                                        TRANSPORT_WAY,
                                        questionnaire.busType ===
                                          BUS_TYPE.UN_SUPPORT
                                          ? 'SHUTTLE_BUS'
                                          : '',
                                      ),
                                    ).map(way => ({
                                      value: way,
                                      label: TRANSPORT_WAY_LABEL()[way],
                                      icon: TRANSPORT_WAY_ICON[way],
                                    })),
                                    optionRender: (
                                      option: Record<string, any>,
                                      selected: boolean,
                                    ) => (
                                      <div
                                        className={classNames(
                                          styles.transportOption,
                                          {
                                            [styles.selectedTransportOption]:
                                              selected,
                                          },
                                        )}
                                      >
                                        <IconAlibabaNew
                                          className={styles.transportOptionIcon}
                                          type={option.icon}
                                        />
                                        <div
                                          className={
                                            styles.transportOptionLabel
                                          }
                                        >
                                          {option.label}
                                        </div>
                                      </div>
                                    ),
                                  },
                                  'x-visible': false,
                                  'x-reactions': [
                                    {
                                      dependencies: [
                                        '.entryTimeType',
                                        '.changeStatus',
                                      ],
                                      fulfill: {
                                        state: {
                                          visible: `{{ $deps[0] != ${TIME_TYPE.AFTER} && $deps[1] == ${CHANGE_STATUS.YES} }}`,
                                        },
                                      },
                                    },
                                  ],
                                },
                                changeTransportRatio: {
                                  type: 'string',
                                  title:
                                    I18N.questionnaire
                                      .changedTransportationModes,
                                  required: true,
                                  'x-decorator': 'FormItem',
                                  'x-decorator-props': {
                                    gridSpan: 2,
                                  },
                                  'x-component': 'CustomSlider',
                                  'x-visible': false,
                                  'x-reactions': [
                                    {
                                      dependencies: [
                                        '.entryTimeType',
                                        '.changeStatus',
                                      ],
                                      fulfill: {
                                        state: {
                                          visible: `{{ $deps[0] != ${TIME_TYPE.AFTER} && $deps[1] == ${CHANGE_STATUS.YES} }}`,
                                        },
                                      },
                                    },
                                  ],
                                },
                              },
                            },
                          },
                        }}
                      />
                    </Form>
                  </div>
                  {overviewData && (
                    <div className={styles.overviewContent}>
                      <div className={styles.overviewTitle}>
                        {I18N.questionnaire.thankYouForYourReply}
                      </div>
                      <img
                        className={styles.overviewImg}
                        alt=''
                        src={questionnaireBgImg}
                      />
                      <div className={styles.chartContent}>
                        <div className={styles.pieChartContent}>
                          {entryTimeType === TIME_TYPE.AFTER ? (
                            <div className={styles.secondaryTitle}>
                              {I18N.questionnaire.sinceYouAreARecipient}
                            </div>
                          ) : (
                            <>
                              <div className={styles.secondaryTitle}>
                                {I18N.questionnaire.yourAnnualCommute}
                              </div>
                              <div className={styles.emission}>
                                <div className={styles.emissionValue}>
                                  {overviewData.emissionTotal}
                                </div>
                                <div className={styles.emissionUnit}>
                                  kgCO₂e
                                </div>
                              </div>
                              <EChartsReact
                                option={{
                                  tooltip: {
                                    trigger: 'item',
                                  },
                                  series: [
                                    {
                                      type: 'pie',
                                      center: ['50%', '50%'],
                                      radius: ['40%', '60%'],
                                      data: (overviewData.transList || []).map(
                                        item => ({
                                          name: TRANSPORT_WAY_LABEL()[
                                            item.transType
                                          ],
                                          value: item.emission,
                                          itemStyle: {
                                            color:
                                              TRANSPORT_WAY_COLOR[
                                                item.transType
                                              ],
                                          },
                                        }),
                                      ),
                                      label: {
                                        position: 'outside',
                                        edgeDistance: 5,
                                        bleedMargin: 0,
                                        formatter:
                                          '{name|{b}}\n{value|{c}}{unit|kgCO₂e}',
                                        rich: {
                                          value: {
                                            padding: [2, 2],
                                            fontSize: 12,
                                            color: '#0CBF9F',
                                          },
                                          name: {
                                            fontSize: 12,
                                            color: '#525866',
                                          },
                                          unit: {
                                            padding: [2, 0],
                                            fontSize: 12,
                                            color: '#525866',
                                          },
                                        },
                                      },
                                    },
                                  ],
                                }}
                              />
                            </>
                          )}
                        </div>
                        <div className={styles.barChartContent}>
                          <div className={styles.tipsContent}>
                            <div className={styles.tips}>
                              <span>
                                {I18N.questionnaire.popularizationOfScience}
                              </span>
                              {locale === LocaleType.zhCN && <span>Tips</span>}
                            </div>
                            <div className={styles.tipText}>
                              {
                                I18N.questionnaire
                                  .differentTypesOfTransportation
                              }
                            </div>
                          </div>
                          <div className={styles.barArea}>
                            <div className={styles.barTitle}>
                              {I18N.questionnaire.variousModesOfTransportation}
                            </div>
                            <EChartsReact
                              style={{ height: 276 }}
                              option={{
                                type: 'bar',
                                tooltip: {
                                  trigger: 'axis',
                                },
                                grid: {
                                  top: 0,
                                  left: 80,
                                },
                                xAxis: {
                                  type: 'value',
                                  splitNumber: 2,
                                  splitLine: {
                                    lineStyle: {
                                      color: '#E7EAEE',
                                    },
                                  },
                                },
                                yAxis: {
                                  type: 'category',
                                  axisLine: {
                                    show: false,
                                  },
                                  axisTick: {
                                    show: false,
                                  },
                                  data: (overviewData.factors || []).map(
                                    item =>
                                      TRANSPORT_WAY_LABEL()[item.transType],
                                  ),
                                  axisLabel: {
                                    width: 70,
                                    overflow: 'breakAll',
                                    interval: 0,
                                  },
                                },
                                series: [
                                  {
                                    type: 'bar',
                                    barMaxWidth: 12,
                                    data: (overviewData.factors || []).map(
                                      item => ({
                                        value: item.factorValue,
                                        itemStyle: {
                                          color:
                                            TRANSPORT_WAY_COLOR[item.transType],
                                        },
                                      }),
                                    ),
                                    itemStyle: {
                                      borderRadius: 4,
                                    },
                                  },
                                ],
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.footer}>
                  {!overviewData ? (
                    <Button
                      type='primary'
                      loading={submitLoading}
                      onClick={submit}
                    >
                      {I18N.questionnaire.submitQuestionnaire}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setOverviewData(undefined);
                        timeRef.current = Date.now();
                      }}
                    >
                      {I18N.carbonFootprint.return}
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className={styles.expired}>
                <IconAlibabaNew
                  className={styles.expiredIcon}
                  type='icon-yemianweikong'
                />
                <div className={styles.expiredText}>
                  {I18N.questionnaire.theQuestionnaireHasBeenClosed}
                </div>
              </div>
            ))}
        </Spin>
      </div>
    </FullscreenModal>
  );
};

export default PCFill;
