/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react/no-unstable-nested-components */
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
import { createForm, onFieldInputValueChange } from '@formily/core';
import { createSchemaField, FormConsumer } from '@formily/react';
import I18N from '@src/lang/I18N';
import { useRequest } from 'ahooks';
import { Button } from 'antd';
import classNames from 'classnames';
import { isNil, omit, omitBy } from 'lodash-es';
import moment from 'moment';
import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { FullscreenModal } from '@/components/FullscreenModal';
import { LocaleContext } from '@/components/LocaleProvider';
import { FormilyAreaCodeInput } from '@/components/formily/components/AreaCodeInput';
import { IconAlibabaNew } from '@/components/iconfont';
import { serviceLangMap } from '@/lang/I18N';
import { RouteMaps } from '@/router/route-paths';
import { Toast } from '@/utils';
import { getAreaCode } from '@/views/system/login/service';

import styles from './index.module.less';
import {
  addQuestionnaire,
  editQuestionnaire,
  getQuestionnaire,
} from './service';
import {
  BUS_TYPE,
  BUS_TYPE_LABEL,
  CHANGE_STATUS,
  CONTACT_REQUIRED_STAFF_INFOS,
  QUESTIONNAIRE_STATUS,
  STAFF_INFO,
  STAFF_INFO_LABEL,
  TIME_TYPE,
  TRANSPORT_WAY,
  TRANSPORT_WAY_ICON,
  TRANSPORT_WAY_LABEL,
  WORKDAY_TYPE,
  WORKDAY_TYPE_LABEL,
} from '../../constant';
import { Questionnaire } from '../../type';
import {
  formatQuestionnaireYear,
  getAnnualWorkdayCount,
  getChangeWorkdayCount,
} from '../../utils';
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

const QuestionnaireDetails: FC<{ id?: string }> = ({ id }) => {
  const isAdd = isNil(id);
  const title = isAdd
    ? I18N.questionnaire.createCommutingQuestions
    : I18N.questionnaire.commutingQuestionnaireDetails;
  const year = moment().format('YYYY');
  const [currentQuestionnaire, setCurrentQuestionnaire] =
    useState<Questionnaire>();
  const lockedEmployeeInfos = (currentQuestionnaire?.employeeInfos || []).map(
    item => Number(item),
  );
  const isEmployeeInfosLocked =
    !isAdd && Number(currentQuestionnaire?.submitCount || 0) > 0;

  const employeeInfosSchemaPart = useMemo(() => {
    const enumOptions = Object.values(STAFF_INFO).map(value => ({
      value,
      label: STAFF_INFO_LABEL[value],
      disabled:
        [STAFF_INFO.NAME].includes(value) ||
        (isEmployeeInfosLocked && lockedEmployeeInfos.includes(value)),
    }));

    return {
      enum: enumOptions,
      description: isEmployeeInfosLocked
        ? I18N.questionnaire.employeeInfoExpandOnly
        : undefined,
      'x-validator': (value: unknown) => {
        const currentValue = (value as number[]) || [];

        if (
          !CONTACT_REQUIRED_STAFF_INFOS.some(info =>
            currentValue.includes(info),
          )
        ) {
          return I18N.questionnaire.employeeInfoRequireOneContact;
        }

        if (
          isEmployeeInfosLocked &&
          !lockedEmployeeInfos.every(info => currentValue.includes(info))
        ) {
          return I18N.questionnaire.employeeInfoExpandOnly;
        }

        return '';
      },
    };
  }, [
    isEmployeeInfosLocked,
    currentQuestionnaire?.employeeInfos,
    currentQuestionnaire?.submitCount,
    isAdd,
  ]);

  const form = useMemo(
    () =>
      createForm({
        effects: () => {
          const syncPreviewWorkdayCount = () => {
            const values = form.values as Record<string, any>;
            const currentYear =
              formatQuestionnaireYear(values.year) || moment().format('YYYY');

            form.setValues({
              preview: {
                weekdayCount:
                  values.workdayType === WORKDAY_TYPE.YEARLY
                    ? getAnnualWorkdayCount({
                        year: currentYear,
                        entryTimeType: values.preview?.entryTimeType,
                        entryTime: values.preview?.entryTime,
                      })
                    : undefined,
              },
            });
          };

          const syncPreviewChangeWorkdayCount = () => {
            const values = form.values as Record<string, any>;
            const currentYear =
              formatQuestionnaireYear(values.year) || moment().format('YYYY');

            form.setValues({
              preview: {
                changeWeekdayCount:
                  values.preview?.changeStatus === CHANGE_STATUS.YES
                    ? getChangeWorkdayCount({
                        year: currentYear,
                        changeTime: values.preview?.changeTime,
                      })
                    : undefined,
              },
            });
          };

          onFieldInputValueChange('preview.transportWay', field => {
            const { value = [] } = field;
            const step = Number((100 / value.length).toFixed(0));

            form.setValues({
              preview: {
                transportRatio: value.map((val, index) => ({
                  transType: val,
                  transName: TRANSPORT_WAY_LABEL()[val],
                  value: index === value.length - 1 ? 100 : (index + 1) * step,
                })),
              },
            });

            form.validate('preview.transportRatio');
          });

          onFieldInputValueChange('preview.changeTransportWay', field => {
            const { value = [] } = field;
            const step = Number((100 / value.length).toFixed(0));

            form.setValues({
              preview: {
                changeTransportRatio: value.map((val, index) => ({
                  transType: val,
                  transName: TRANSPORT_WAY_LABEL()[val],
                  value: index === value.length - 1 ? 100 : (index + 1) * step,
                })),
              },
            });

            form.validate('preview.changeTransportRatio');
          });

          onFieldInputValueChange('workdayType', syncPreviewWorkdayCount);
          onFieldInputValueChange('year', syncPreviewWorkdayCount);
          onFieldInputValueChange('year', syncPreviewChangeWorkdayCount);
          onFieldInputValueChange(
            'preview.entryTimeType',
            syncPreviewWorkdayCount,
          );
          onFieldInputValueChange('preview.entryTime', syncPreviewWorkdayCount);
          onFieldInputValueChange(
            'preview.changeStatus',
            syncPreviewChangeWorkdayCount,
          );
          onFieldInputValueChange(
            'preview.changeTime',
            syncPreviewChangeWorkdayCount,
          );
        },
      }),
    [],
  );

  const history = useHistory();

  const back = () => history.push(RouteMaps.questionnaireList);

  const { locale } = useContext(LocaleContext);

  const { data: areaCode = [] } = useRequest(
    () =>
      getAreaCode({
        lang: serviceLangMap[locale],
      }),
    {
      cacheKey: locale,
      staleTime: 30 * 1000 * 60,
      refreshDeps: [locale],
    },
  );
  const areaCodeList = useMemo(
    () =>
      areaCode.map(item => ({
        label: item.areaContent,
        value: item.areaContent,
      })),
    [areaCode],
  );

  const submit = async (status?: number) => {
    try {
      await form.validate('grid.*');
      const rawData = omit(form.values, 'preview') as Record<string, any>;
      const employeeInfos = isEmployeeInfosLocked
        ? Array.from(
            new Set([
              ...(lockedEmployeeInfos || []),
              ...(rawData.employeeInfos || []),
            ]),
          )
        : rawData.employeeInfos;
      const payload = omitBy(
        {
          name: rawData.name,
          year: formatQuestionnaireYear(rawData.year),
          expireTime: rawData.expireTime
            ? moment(rawData.expireTime).format('YYYY-MM-DD')
            : undefined,
          employeeInfos,
          employeeCount: rawData.employeeCount
            ? Number(rawData.employeeCount)
            : undefined,
          busType:
            rawData.busType !== undefined ? Number(rawData.busType) : undefined,
          companyAddress: rawData.companyAddress,
          companyId: rawData.companyId,
          workDayWay:
            rawData.workdayType !== undefined
              ? Number(rawData.workdayType)
              : undefined,
          workdayType: undefined,
          status,
        },
        value => value === undefined,
      );

      if (isNil(id)) {
        await addQuestionnaire(payload);
      } else {
        await editQuestionnaire({ ...payload, id });
      }

      Toast('success', I18N.carbonFootprint.operationSuccessful);
      back();
    } catch (error) {
      return error;
    }
  };

  useEffect(() => {
    form.setFieldState('preview.phoneNum', {
      dataSource: areaCodeList,
    });
  }, [areaCodeList, form]);

  useEffect(() => {
    if (isNil(id)) {
      form.setValues({
        employeeInfos: [STAFF_INFO.NAME, STAFF_INFO.PHONE],
        companyAddress: [{}],
        workdayType: WORKDAY_TYPE.WEEKLY,
        preview: {
          changeStatus: CHANGE_STATUS.NO,
        },
      });
    } else {
      getQuestionnaire({ id }).then(({ data }) => {
        setCurrentQuestionnaire(data.data);
        form.setValues({
          ...data.data,
          workdayType: data.data.workdayType ?? WORKDAY_TYPE.WEEKLY,
          preview: {
            ...(data.data as Record<string, any>).preview,
            changeStatus:
              (data.data as Record<string, any>).preview?.changeStatus ??
              CHANGE_STATUS.NO,
          },
        });
        form.query('year').take()?.setComponentProps({ disabled: true });
      });
    }
  }, [form, id]);

  useEffect(() => {
    form.setFieldState('grid.employeeInfos', state => {
      state.dataSource = employeeInfosSchemaPart.enum;
      state.description = employeeInfosSchemaPart.description;
      state.validator = employeeInfosSchemaPart['x-validator'];
    });
  }, [form, employeeInfosSchemaPart]);

  useEffect(() => {
    if (Number(currentQuestionnaire?.submitCount || 0) > 0) {
      form.setFieldState('grid.workdayType', state => {
        state.disabled = true;
      });
    }
  }, [currentQuestionnaire?.submitCount]);

  const getPreviewQuestionnaireTitle = (values: Record<string, any>) => {
    const previewYear =
      formatQuestionnaireYear(values.year) || moment().format('YYYY');
    const previewName =
      typeof values.name === 'string' ? values.name.trim() : '';

    return `${previewYear}${
      previewName || I18N.questionnaire.employeeCommutingCarbon
    }`;
  };

  return (
    <FullscreenModal>
      <div className={styles.details}>
        <div className={styles.header}>
          <div className={styles.nav}>
            <div className={styles.prevNav} onClick={back}>
              <IconAlibabaNew
                className={styles.prevIcon}
                type='icon-icon-fanhui2'
              />
              <div className={styles.navText}>
                {I18N.questionnaire.questionnaireService}
              </div>
            </div>
            <div className={styles.navText}>/</div>
            <div className={styles.currNavText}>{title}</div>
          </div>
          <div className={styles.title}>{title}</div>
        </div>
        <div className={styles.content}>
          <div className={styles.contentItem}>
            <Form form={form} layout='vertical' colon={false}>
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
                      },
                      properties: {
                        name: {
                          type: 'string',
                          title:
                            I18N.supplyChainCarbonManagement.questionnaireName2,
                          required: true,
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            gridSpan: 2,
                          },
                          'x-component': 'Input',
                          'x-component-props': {
                            placeholder: I18N.base.pleaseEnter,
                            maxLength: 50,
                          },
                        },
                        year: {
                          type: 'string',
                          title: I18N.questionnaire.collectYear,
                          required: true,
                          'x-decorator': 'FormItem',
                          'x-component': 'DatePicker',
                          'x-component-props': {
                            picker: 'year',
                            placeholder: I18N.carbonFootprint.pleaseSelect,
                          },
                        },
                        expireTime: {
                          type: 'string',
                          title:
                            I18N.questionnaire.atTheDeadlineOfTheQuestionnaire,
                          'x-decorator': 'FormItem',
                          'x-component': 'DatePicker',
                          'x-component-props': {
                            placeholder: I18N.carbonFootprint.pleaseSelect,
                          },
                        },
                        employeeCount: {
                          type: 'string',
                          title:
                            I18N.questionnaire
                              .totalNumberOfEmployeesInTheEnterprise,
                          required: true,
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            gridSpan: 2,
                          },
                          'x-component': 'NumberPicker',
                          'x-component-props': {
                            placeholder: I18N.base.pleaseEnter,
                            min: 0,
                            controls: false,
                            precision: 0,
                            stringMode: true,
                            addonAfter: I18N.greenMeeting.people,
                            style: {
                              width: 'calc(50% - 8px)',
                            },
                          },
                        },
                        employeeInfos: {
                          type: 'string',
                          title: I18N.questionnaire.employeeInformationInquiry,
                          required: true,
                          ...employeeInfosSchemaPart,
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            gridSpan: 2,
                          },
                          'x-component-props': {
                            disabled: false,
                          },
                          'x-component': 'Checkbox.Group',
                        },
                        busType: {
                          type: 'string',
                          title: I18N.questionnaire.doYouProvideClasses,
                          required: true,
                          enum: Object.values(BUS_TYPE).map(value => ({
                            value,
                            label: BUS_TYPE_LABEL[value],
                          })),
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            gridSpan: 2,
                          },
                          'x-component': 'Radio.Group',
                        },
                        workdayType: {
                          type: 'number',
                          title: I18N.questionnaire.workdayStatisticsType,
                          required: true,
                          enum: Object.values(WORKDAY_TYPE).map(value => ({
                            value,
                            label: WORKDAY_TYPE_LABEL[value],
                          })),
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            gridSpan: 2,
                          },
                          'x-component': 'Radio.Group',
                        },
                        companyAddress: {
                          type: 'array',
                          title: I18N.carbonInternational.companyAddress,
                          required: true,
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            gridSpan: 2,
                          },
                          'x-component': 'AddressList',
                        },
                      },
                    },
                  },
                }}
              />
            </Form>
          </div>
          <div className={styles.contentSplit} />
          <div className={styles.contentItem}>
            <div className={styles.title}>
              {I18N.questionnaire.questionnairePreview}
            </div>

            <Form form={form} layout='vertical' colon={false}>
              <FormConsumer>
                {currentForm => (
                  <div className={styles.previewTitle}>
                    {getPreviewQuestionnaireTitle(
                      currentForm.values as Record<string, any>,
                    )}
                  </div>
                )}
              </FormConsumer>
              <SchemaField
                schema={{
                  type: 'object',
                  properties: {
                    preview: {
                      type: 'object',
                      properties: {
                        previewGrid: {
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
                              'x-visible': false,
                              'x-decorator': 'FormItem',
                              'x-component': 'FormilyAreaCodeInput',
                              'x-component-props': {
                                placeholder: I18N.base.pleaseEnter,
                              },
                              'x-reactions': {
                                dependencies: ['employeeInfos'],
                                fulfill: {
                                  state: {
                                    visible: `{{ ($deps[0] || []).includes(${STAFF_INFO.PHONE}) }}`,
                                  },
                                },
                              },
                            },
                            email: {
                              type: 'string',
                              title: I18N.carbonFootprint.mailbox,
                              required: true,
                              'x-decorator': 'FormItem',
                              'x-component': 'Input',
                              'x-component-props': {
                                placeholder: I18N.base.pleaseEnter,
                              },
                              'x-reactions': {
                                dependencies: ['employeeInfos'],
                                fulfill: {
                                  state: {
                                    visible: `{{ ($deps[0] || []).includes(${STAFF_INFO.EMAIL}) }}`,
                                  },
                                },
                              },
                            },
                            department: {
                              type: 'string',
                              title: I18N.dashborad.department,
                              required: true,
                              'x-visible': false,
                              'x-decorator': 'FormItem',
                              'x-component': 'Input',
                              'x-component-props': {
                                placeholder: I18N.base.pleaseEnter,
                              },
                              'x-reactions': {
                                dependencies: ['employeeInfos'],
                                fulfill: {
                                  state: {
                                    visible: `{{ ($deps[0] || []).includes(${STAFF_INFO.DEPARTMENT}) }}`,
                                  },
                                },
                              },
                            },
                            employeeCode: {
                              type: 'string',
                              title: I18N.questionnaire.workNumber,
                              required: true,
                              'x-visible': false,
                              'x-decorator': 'FormItem',
                              'x-component': 'Input',
                              'x-component-props': {
                                placeholder: I18N.base.pleaseEnter,
                              },
                              'x-reactions': {
                                dependencies: ['employeeInfos'],
                                fulfill: {
                                  state: {
                                    visible: `{{ ($deps[0] || []).includes(${STAFF_INFO.WORK_NO}) }}`,
                                  },
                                },
                              },
                            },
                            empty: {
                              'x-visible': false,
                              'x-decorator': 'FormItem',
                              'x-reactions': {
                                dependencies: ['employeeInfos'],
                                fulfill: {
                                  state: {
                                    visible: `{{ ($deps[0] || []).length % 2 != 0 }}`,
                                  },
                                },
                              },
                            },
                            entryTimeType: {
                              type: 'string',
                              title:
                                I18N.questionnaire.atTheTimeOfYourEmployment,
                              required: true,
                              enum: [
                                {
                                  value: TIME_TYPE.PREV,
                                  label: I18N.template(
                                    I18N.questionnaire.yearYear3,
                                    { val1: year },
                                  ),
                                },
                                {
                                  value: TIME_TYPE.DURING,
                                  label: I18N.template(
                                    I18N.questionnaire.yearYear2,
                                    { val1: year },
                                  ),
                                },
                                {
                                  value: TIME_TYPE.AFTER,
                                  label: I18N.template(
                                    I18N.questionnaire.yearYear,
                                    { val1: year },
                                  ),
                                },
                              ],
                              'x-decorator': 'FormItem',
                              'x-decorator-props': {
                                gridSpan: 2,
                              },
                              'x-component': 'Radio.Group',
                            },
                            entryTime: {
                              type: 'string',
                              title: I18N.questionnaire.entryTime,
                              required: true,
                              'x-decorator': 'FormItem',
                              'x-component': 'DatePicker',
                              'x-component-props': {
                                placeholder: I18N.carbonFootprint.pleaseSelect,
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
                              title: I18N.questionnaire.yourWeeklyWork,
                              required: true,
                              'x-decorator': 'FormItem',
                              'x-decorator-props': {
                                gridSpan: 2,
                              },
                              'x-component': 'WorkdayCountInput',
                              'x-component-props': {
                                mode: WORKDAY_TYPE.WEEKLY,
                              },
                              'x-reactions': [
                                {
                                  dependencies: [
                                    'workdayType',
                                    '.entryTimeType',
                                  ],
                                  fulfill: {
                                    state: {
                                      title: `{{ $deps[0] == ${WORKDAY_TYPE.YEARLY} ? '${I18N.questionnaire.yourAnnualWorkDays}' : '${I18N.questionnaire.yourWeeklyWork}' }}`,
                                      visible: `{{ $deps[1] != ${TIME_TYPE.AFTER} }}`,
                                      componentProps: {
                                        mode: `{{ $deps[0] }}`,
                                      },
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
                              'x-visible': false,
                              'x-reactions': [
                                {
                                  dependencies: [
                                    'workdayType',
                                    '.entryTimeType',
                                  ],
                                  fulfill: {
                                    state: {
                                      visible: `{{ $deps[0] == ${WORKDAY_TYPE.WEEKLY} && $deps[1] != ${TIME_TYPE.AFTER} }}`,
                                    },
                                  },
                                },
                              ],
                            },
                            distance: {
                              type: 'string',
                              title: I18N.questionnaire.yourCommutingDistance,
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
                                onConfirm: distance => {
                                  form.setValues({
                                    preview: {
                                      distance,
                                    },
                                  });
                                },
                              },
                              'x-reactions': [
                                {
                                  dependencies: ['companyAddress'],
                                  fulfill: {
                                    state: {
                                      componentProps: {
                                        addressList: `{{ $deps[0] }}`,
                                      },
                                    },
                                  },
                                },
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
                                      className={styles.transportOptionLabel}
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
                                {
                                  dependencies: ['busType'],
                                  when: `{{ $deps[0] == ${BUS_TYPE.SUPPORT} || $deps[0] == ${BUS_TYPE.THIRD_PART} }}`,
                                  fulfill: {
                                    state: {
                                      componentProps: {
                                        options: Object.values(
                                          TRANSPORT_WAY,
                                        ).map(way => ({
                                          value: way,
                                          label: TRANSPORT_WAY_LABEL()[way],
                                          icon: TRANSPORT_WAY_ICON[way],
                                        })),
                                      },
                                    },
                                  },
                                  otherwise: {
                                    state: {
                                      componentProps: {
                                        options: Object.values(TRANSPORT_WAY)
                                          .filter(
                                            way =>
                                              way !== TRANSPORT_WAY.SHUTTLE_BUS,
                                          )
                                          .map(way => ({
                                            value: way,
                                            label: TRANSPORT_WAY_LABEL()[way],
                                            icon: TRANSPORT_WAY_ICON[way],
                                          })),
                                      },
                                    },
                                  },
                                },
                              ],
                            },
                            transportRatio: {
                              type: 'string',
                              title:
                                I18N.questionnaire.variousTransportationModes,
                              required: true,
                              'x-decorator': 'FormItem',
                              'x-decorator-props': {
                                gridSpan: 2,
                              },
                              'x-component': 'CustomSlider',
                              'x-component-props': {},
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
                              'x-decorator': 'FormItem',
                              'x-decorator-props': {
                                gridSpan: 2,
                              },
                              'x-component': 'Radio.Group',
                              default: CHANGE_STATUS.NO,
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
                                placeholder: I18N.carbonFootprint.pleaseSelect,
                                disabledDate: current => {
                                  const currentYear =
                                    formatQuestionnaireYear(form.values.year) ||
                                    moment().format('YYYY');
                                  const entryTimeType = Number(
                                    form.values.preview?.entryTimeType,
                                  );
                                  const entryTime =
                                    form.values.preview?.entryTime;
                                  const minDate =
                                    entryTimeType === TIME_TYPE.DURING &&
                                    entryTime
                                      ? moment(entryTime)
                                      : moment(`${currentYear}-01-01`);
                                  const maxDate = moment(
                                    `${currentYear}-12-31`,
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
                                onConfirm: distance => {
                                  form.setValues({
                                    preview: {
                                      changeDistance: distance,
                                    },
                                  });
                                },
                              },
                              'x-visible': false,
                              'x-reactions': [
                                {
                                  dependencies: ['companyAddress'],
                                  fulfill: {
                                    state: {
                                      componentProps: {
                                        addressList: `{{ $deps[0] }}`,
                                      },
                                    },
                                  },
                                },
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
                              title: I18N.questionnaire.changedCommutingRoute,
                              required: true,
                              'x-decorator': 'FormItem',
                              'x-decorator-props': {
                                gridSpan: 2,
                              },
                              'x-component': 'CustomSelect',
                              'x-component-props': {
                                multiple: true,
                                style: { columnGap: 4 },
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
                                      className={styles.transportOptionLabel}
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
                                {
                                  dependencies: ['busType'],
                                  when: `{{ $deps[0] == ${BUS_TYPE.SUPPORT} || $deps[0] == ${BUS_TYPE.THIRD_PART} }}`,
                                  fulfill: {
                                    state: {
                                      componentProps: {
                                        options: Object.values(
                                          TRANSPORT_WAY,
                                        ).map(way => ({
                                          value: way,
                                          label: TRANSPORT_WAY_LABEL()[way],
                                          icon: TRANSPORT_WAY_ICON[way],
                                        })),
                                      },
                                    },
                                  },
                                  otherwise: {
                                    state: {
                                      componentProps: {
                                        options: Object.values(TRANSPORT_WAY)
                                          .filter(
                                            way =>
                                              way !== TRANSPORT_WAY.SHUTTLE_BUS,
                                          )
                                          .map(way => ({
                                            value: way,
                                            label: TRANSPORT_WAY_LABEL()[way],
                                            icon: TRANSPORT_WAY_ICON[way],
                                          })),
                                      },
                                    },
                                  },
                                },
                              ],
                            },
                            changeTransportRatio: {
                              type: 'string',
                              title:
                                I18N.questionnaire.changedTransportationModes,
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
                    },
                  },
                }}
              />
            </Form>
          </div>
        </div>
        <div className={styles.footer}>
          <Button onClick={back}>{I18N.carbonFootprint.return}</Button>
          <Button onClick={() => submit()}>
            {I18N.carbonFootprint.preserve}
          </Button>
          <Button
            type='primary'
            onClick={() => submit(QUESTIONNAIRE_STATUS.PUBLISHED)}
          >
            {I18N.supplyChainCarbonManagement.publishQuestionnaire}
          </Button>
        </div>
      </div>
    </FullscreenModal>
  );
};

export default QuestionnaireDetails;
