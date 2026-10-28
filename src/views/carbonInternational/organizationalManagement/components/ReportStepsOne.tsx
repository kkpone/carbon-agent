/**
 * @file 基本信息填写 新增碳排放报告
 */
import I18N from '@src/lang/I18N';
import { Form, Input, Select, DatePicker, Checkbox } from 'antd';
import moment from 'moment';
import { useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import '../organizationalManagement.less';
import TextArea from 'antd/es/input/TextArea';
import { useParams } from 'react-router-dom';
import {
  getChooselistOption,
  getReportSubjectInfo,
} from '@api/carbon-international';
import { ReportSubjectInfo } from '@api/carbon-international/types';
import { EmptyLoading } from '@components/EmptyLoading';
import { Toast } from '@utils/Toast';
import { antFormSrcoll2FirstErrorConfig } from '@src/utils';

import {
  REPORT_NAME_OPTION,
  REPORT_SUBJECT,
} from '../../../../store/actionTypes';
import { StepOneChildType } from '../types';
import { transformDate } from '../utils';

const { RangePicker } = DatePicker;

export const ReportStepsOne = forwardRef<StepOneChildType, any>(
  (props, ref) => {
    const [form] = Form.useForm();
    const { id } = useParams<{ id: string }>();
    const [organizations, setSelectoption] = useState<
      {
        organization_name: string;
        id: string | number;
      }[]
    >([]);
    const [formInitialValues, setFormInitialValues] =
      useState<ReportSubjectInfo>();
    useImperativeHandle(ref, () => ({
      getForm: () => form,
    }));

    const getChooselist = async () => {
      await getChooselistOption().then(res => {
        const r = res?.data?.data;
        if (res?.data?.code === 200 && r) {
          setSelectoption(r);
          sessionStorage.setItem(REPORT_NAME_OPTION, r);
        }
      });
    };

    useEffect(() => {
      getChooselist();
      if (id) {
        getReportSubjectInfo(id).then(res => {
          const r = res?.data?.data;
          if (res?.data?.code === 200 && r) {
            setFormInitialValues({
              ...r,
              range_year: [
                moment(transformDate(r.start_base_year)),
                moment(transformDate(r.end_base_year)),
              ],
              // @ts-ignore
              quantitative_method:
                typeof r.quantitative_method === 'string'
                  ? [r.quantitative_method]
                  : r.quantitative_method,
              // @ts-ignore
              filling_date: moment(transformDate(r.filling_date)),
              // @ts-ignore
              year: r.year?.split(I18N.carbonFootprint.to)?.map(t => {
                const time = moment(transformDate(t));
                if (time.isValid()) return time;
                return undefined;
              }),
            });

            // @ts-ignore
          } else if (res?.data?.msg?.msg) Toast('warn', res?.data?.msg.msg);
        });
      } else {
        const cachedInfo = sessionStorage.getItem(REPORT_SUBJECT);
        // @ts-ignore
        const data = {
          // year: date.getFullYear() - 1,
          quantitative_method: [
            I18N.enterpriseCarbonAccount2.emissionFactorMethod,
          ],
          organization_info: cachedInfo || '',
        } as ReportSubjectInfo;
        setFormInitialValues(data);
      }
    }, []);
    if (!formInitialValues && id) return <EmptyLoading />;

    return (
      <div className='report_steps_one'>
        <div>
          <Form
            className='addlist_content_From'
            form={form}
            scrollToFirstError={antFormSrcoll2FirstErrorConfig}
            name='basic'
            initialValues={formInitialValues}
          >
            <div className='report_steps_one_title'>
              {I18N.carbonInternational.reportSubjectAnd}
            </div>
            <div className='parallel_content'>
              <Form.Item
                label={I18N.Certification.reportSubject}
                name='organization_info'
                rules={[
                  {
                    required: true,
                    message:
                      I18N.carbonInternational.theReportingSubjectDoesNot,
                  },
                ]}
              >
                <Select
                  style={{ width: 400 }}
                  placeholder={I18N.carbonFootprint.pleaseSelect}
                  onChange={value =>
                    sessionStorage.setItem(REPORT_SUBJECT, value)
                  }
                  options={organizations.map(t => ({
                    label: t.organization_name,
                    value: t.id,
                  }))}
                />
              </Form.Item>
              <Form.Item
                label={I18N.Certification.whenTheReportCovers2}
                name='year'
                rules={[
                  {
                    required: true,
                    message: I18N.carbonInternational.whenTheReportCovers,
                  },
                ]}
              >
                <RangePicker
                  picker='date'
                  format='YYYY-MM-DD'
                  style={{ width: 400 }}
                />
              </Form.Item>
            </div>
            <div className='parallel_content'>
              <Form.Item
                label={I18N.enterpriseCarbonAccount2.baseYear}
                name='range_year'
                rules={[
                  {
                    required: true,
                    message: I18N.carbonInternational.theBaseYearIsNot,
                  },
                ]}
              >
                <RangePicker
                  picker='date'
                  format='YYYY-MM-DD'
                  style={{ width: 400 }}
                />
              </Form.Item>
              <Form.Item
                label={I18N.carbonInternational.annualAverageEmissions}
                name='average_annual_emissions'
              >
                <Input
                  style={{ width: '400px' }}
                  placeholder={
                    I18N.carbonInternational.enterOnlyNumericalValues
                  }
                  suffix='tCO₂e'
                  min='0'
                  type='number'
                />
              </Form.Item>
            </div>
            <div>
              <Form.Item
                label={I18N.carbonInternational.baseYearChange2}
                name='base_year_change_explain'
                rules={[
                  {
                    required: true,
                    message: I18N.carbonInternational.baseYearChange,
                  },
                ]}
              >
                <TextArea
                  style={{ width: '998px' }}
                  rows={4}
                  placeholder={I18N.carbonInternational.whenTheEmissionSource}
                />
              </Form.Item>
            </div>
            {/* 第二部分 */}
            <div className='report_steps_one_title'>
              {I18N.carbonInternational.reportBasicInformation}
            </div>
            <div>
              <Form.Item
                label={I18N.enterpriseCarbonAccount2.quantitativeMethods}
                name='quantitative_method'
                rules={[
                  {
                    required: true,
                    message:
                      I18N.carbonInternational
                        .quantificationMethodNotApplicable,
                  },
                ]}
              >
                <Checkbox.Group>
                  <Checkbox
                    value={I18N.enterpriseCarbonAccount2.emissionFactorMethod}
                  >
                    {I18N.enterpriseCarbonAccount2.emissionFactorMethod}
                  </Checkbox>
                  <Checkbox
                    value={I18N.enterpriseCarbonAccount2.materialBalanceMethod}
                  >
                    {I18N.enterpriseCarbonAccount2.materialBalanceMethod}
                  </Checkbox>
                </Checkbox.Group>
              </Form.Item>
            </div>
            <div className='parallel_content'>
              <Form.Item
                label={
                  I18N.carbonInternational.nameOfThePersonFillingOutTheForm2
                }
                name='preparer_name'
                rules={[
                  {
                    required: true,
                    message:
                      I18N.carbonInternational.nameOfThePersonFillingOutTheForm,
                  },
                ]}
              >
                <Input
                  style={{ width: '400px' }}
                  placeholder={I18N.components.pleaseFillIn}
                />
              </Form.Item>
              <Form.Item
                label={I18N.carbonInternational.fillingPersonsPhoneNumber2}
                name='preparer_phone'
                rules={[
                  {
                    required: true,
                    message: I18N.carbonInternational.fillingPersonsPhoneNumber,
                  },
                  {
                    pattern: /^((0\d{2,3}-\d{7,8})|(1[3679584]\d{9}))$/,
                    message: I18N.carbonInternational.theCorrectPhone,
                  },
                ]}
              >
                <Input
                  style={{ width: '400px' }}
                  placeholder={I18N.components.pleaseFillIn}
                />
              </Form.Item>
            </div>
            <div className='parallel_content'>
              <Form.Item
                label={
                  I18N.carbonInternational.emailOfThePersonFillingOutTheForm2
                }
                name='preparer_email'
                rules={[
                  {
                    required: true,
                    message:
                      I18N.carbonInternational
                        .emailOfThePersonFillingOutTheForm,
                  },
                  {
                    pattern:
                      /^([a-zA-Z]|[0-9])(\w|-|\.)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/,
                    message: I18N.carbonInternational.theCorrectEmailAddress,
                  },
                ]}
              >
                <Input
                  style={{ width: '400px' }}
                  placeholder={I18N.components.pleaseFillIn}
                />
              </Form.Item>
              <Form.Item
                label={I18N.carbonInternational.fillingDate}
                name='filling_date'
                rules={[
                  {
                    required: true,
                    message:
                      I18N.carbonInternational.dateOfFillingOutFormIsIncorrect,
                  },
                ]}
              >
                <DatePicker
                  style={{ width: '400px' }}
                  placeholder={I18N.DomesticVersion.selectTime}
                />
              </Form.Item>
            </div>
            {/* 第三部分 */}
            <div className='report_steps_one_title'>
              {I18N.enterpriseCarbonAccount2.otherSituations}
            </div>
            <div>
              <Form.Item
                label={I18N.enterpriseCarbonAccount2.emissionSourceExemption}
                name='emission_source_exempt_explain'
              >
                <TextArea
                  style={{ width: '998px' }}
                  rows={4}
                  placeholder={`${I18N.carbonInternational.emissionsGenerated}\n${I18N.carbonInternational.xxxEmissions2}\n${I18N.carbonInternational.xxxEmissions}`}
                />
              </Form.Item>
            </div>
            <div>
              <Form.Item
                label={I18N.enterpriseCarbonAccount2.quantitativeMethodsChange}
                name='quantitative_method_change_explain'
              >
                <TextArea
                  style={{ width: '998px' }}
                  rows={4}
                  placeholder={
                    I18N.carbonInternational.ifTheQuantificationMethod
                  }
                />
              </Form.Item>
            </div>
            <div>
              <Form.Item
                label={I18N.enterpriseCarbonAccount2.biomassRelated}
                name='biomass_related_emissions'
              >
                <TextArea
                  style={{ width: '998px' }}
                  rows={4}
                  placeholder={I18N.carbonInternational.ifThereIsASource}
                />
              </Form.Item>
            </div>
            <div>
              <Form.Item
                label={I18N.enterpriseCarbonAccount2.otherSituations}
                name='other_information'
              >
                <TextArea
                  style={{ width: '998px' }}
                  rows={4}
                  placeholder={I18N.carbonInternational.hereYouCan}
                />
              </Form.Item>
            </div>
          </Form>
        </div>
      </div>
    );
  },
);
