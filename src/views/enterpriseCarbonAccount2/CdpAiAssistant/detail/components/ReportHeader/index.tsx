import { Form } from '@formily/core';
// import { downloadFile } from '@src/components/DownLoadFile';
import { FormActions } from '@src/components/FormActions';
import { SearchInContent } from '@src/components/SearchInContent';
import I18N from '@src/lang/I18N';
import { getDictList } from '@src/views/carbonFootprint3/discharge/process/service';
import { useQuery } from '@tanstack/react-query';
import { Checkbox, Drawer, Popover, Space, App } from 'antd';
import { isUndefined } from 'lodash-es';
import moment from 'moment';
import React, { useEffect, useMemo, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import { Toast } from '@/views/subModules/CarbonFootprintModel/components/Toast/verifty';

import backSvg from './back.svg';
import closeSvg from './close.svg';
import editSvg from './edit.svg';
import filterSvg from './filter.svg';
import styles from './index.module.less';
import secondSvg from './second.svg';
import { StepOneForm } from '../../../list/components/CreateModal/StepOneForm';
import { IStepOneFormValues } from '../../../list/components/CreateModal/StepOneForm/schema';
import { StepTwoForm } from '../../../list/components/CreateModal/StepTwoForm';
import { IStepTwoFormValues } from '../../../list/components/CreateModal/StepTwoForm/schema';
import { GetQuickCreateInfo, PostQuickCreate } from '../../../list/service';
import { IReport, deleteReport, editReport } from '../../service';
import { FormItemStatus } from '../type';

interface ReportHeaderProps {
  reportInfo?: IReport;
  filter?: FormItemStatus[];
  setFilter?: (e: FormItemStatus[]) => void;
  refresh?: () => void;
  setDrawOpen?: () => void;
  userAnswerLoading?: boolean;
}

const plainOptions = [
  {
    value: FormItemStatus.filled,
    label: I18N.enterpriseCarbonAccount2.completed,
  },
  {
    value: FormItemStatus.unfilled,
    label: I18N.DomesticVersion.notFilledIn,
  },
  // {
  //   value: FormItemStatus.generating,
  //   label: 'AI 生成中',
  // },
  // {
  //   value: FormItemStatus.toBeConfirmed,
  //   label: '待确认',
  // },
];

const formatDate = (day?: string | null) =>
  day ? moment(day).format('LL') : '/';

const ReportHeader: React.FC<ReportHeaderProps> = props => {
  const {
    reportInfo,
    filter,
    setFilter,
    refresh,
    setDrawOpen,
    userAnswerLoading,
  } = props;
  const { modal } = App.useApp();

  const stepOneFormRef = useRef<Form<IStepOneFormValues>>(null);
  const stepTwoFormRef = useRef<Form<IStepTwoFormValues>>(null);
  const [stepOneVisible, setStepOneVisible] = React.useState(false);
  const [stepTwoVisible, setStepTwoVisible] = React.useState(false);
  const [stepOneMounted, setStepOneMounted] = React.useState(false);
  const [stepOneFormId, setStepOneFormId] = React.useState<number>(0);
  const [stepTwoFormId, setStepTwoFormId] = React.useState<number>(0);
  const [stepTwoMounted, setStepTwoMounted] = React.useState(false);
  const [stepTwoInfo, setStepTwoInfo] = React.useState<IStepTwoFormValues>();

  const { data: otherContentList } = useQuery(
    ['otherContentList'],
    () => getDictList<'cdp_other_content'>({ dictTypes: 'cdp_other_content' }),
    {
      refetchOnWindowFocus: false,
    },
  );

  const { data: cdpBusinessList } = useQuery(
    ['cdp_business'],
    () => getDictList<'cdp_business'>({ dictTypes: 'cdp_business' }),
    {
      refetchOnWindowFocus: false,
    },
  );

  const { data: questionModuleList } = useQuery(
    ['cdp_question_module'],
    () =>
      getDictList<'cdp_question_module'>({ dictTypes: 'cdp_question_module' }),
    {
      refetchOnWindowFocus: false,
    },
  );

  const { data: scopeThreeCategoryList } = useQuery(
    ['scope_three_category'],
    () =>
      getDictList<'scope_three_category'>({
        dictTypes: 'scope_three_category',
      }),
    {
      refetchOnWindowFocus: false,
    },
  );

  const scopeThreeCategory = useMemo(
    () => scopeThreeCategoryList?.data.data.scope_three_category || [],
    [scopeThreeCategoryList?.data.data.scope_three_category],
  );

  const otherContents = useMemo(
    () =>
      reportInfo?.otherContent?.split(',').map(item => {
        const otherContent = otherContentList?.data.data.cdp_other_content.find(
          b => b.dictValue === item,
        );
        return otherContent?.dictLabel;
      }),
    [otherContentList, reportInfo],
  );

  useEffect(() => {
    if (stepOneVisible && stepOneMounted) {
      setTimeout(() => {
        stepOneFormRef.current?.setValues({
          orgId: reportInfo?.orgId,
          title: reportInfo?.title,
          year: reportInfo?.year,
          industry: reportInfo?.industry,
          reportVersion: reportInfo?.reportVersion,
          business: reportInfo?.business,
          otherContent: reportInfo?.otherContent?.split(','),
          question_module: reportInfo?.questionModule?.split(','),
        });
        stepOneFormRef.current?.setFieldState('orgId', state => {
          state.disabled = true;
        });
      }, 300);
    }
  }, [reportInfo, stepOneVisible, stepOneMounted, stepOneFormId]);

  useEffect(() => {
    const getInfo = async () => {
      const step1InfoResult = await GetQuickCreateInfo({
        reportId: reportInfo?.id || 0,
      });
      setStepTwoInfo(
        step1InfoResult.data.data as unknown as IStepTwoFormValues,
      );
    };
    if (reportInfo) {
      getInfo();
    }
  }, [reportInfo]);

  useEffect(() => {
    if (stepTwoVisible && stepTwoMounted) {
      stepTwoFormRef.current?.setInitialValues({
        ...stepTwoInfo,
        baseYearStart: stepTwoInfo?.baseYearStart || undefined,
        baseYearEnd: stepTwoInfo?.baseYearEnd || undefined,
        scope3Emission:
          (stepTwoInfo?.scope3Emission || [])?.map((item: any) =>
            item.id.toString(),
          ) || [],
        scope4E: (stepTwoInfo?.scope3Emission || []).reduce((acc, cur: any) => {
          acc[cur.id] = cur.value;
          return acc;
        }, {}),
      });
    }
  }, [reportInfo, stepTwoVisible, stepTwoFormId, stepTwoMounted, stepTwoInfo]);

  const subStepOneForm = async () => {
    await stepOneFormRef.current?.validate();
    const formValue =
      (await stepOneFormRef.current?.submit<IStepOneFormValues>()) as IStepOneFormValues;
    const result = await editReport({
      id: reportInfo?.id,
      year: formValue.year,
      industry: formValue.industry,
      reportVersion: formValue.reportVersion,
      business: formValue.business,
      otherContent: formValue.otherContent.join(','),
      questionModule: formValue.question_module.join(','),
    });
    if ((result.data as any)?.code === 200) {
      setStepOneVisible(false);
      refresh?.();
    }
  };

  const subStepTwoForm = async () => {
    await stepTwoFormRef.current?.validate();
    const formValue =
      (await stepTwoFormRef.current?.submit()) as IStepTwoFormValues;
    const { scope4E } = formValue;
    await PostQuickCreate({
      id: reportInfo?.id,
      scope1Emissions: formValue.scope1Emissions,
      scope2EmissionsLocation: formValue.scope2EmissionsLocation,
      scope2EmissionsMarket: formValue.scope2EmissionsMarket,
      totalRevenue: formValue.totalRevenue,
      currency: formValue.currency,
      scope3Emission: formValue.scope3Emission?.map(item => ({
        id: item,
        value: scope4E[item],
      })),
      baseYearStart: formValue.baseYearStart,
      baseYearEnd: formValue.baseYearEnd,
      reportStart: formValue.reportStart,
      reportEnd: formValue.reportEnd,
    });
    setStepTwoVisible(false);
    const getInfo = async () => {
      const step1InfoResult = await GetQuickCreateInfo({
        reportId: reportInfo?.id || 0,
      });
      setStepTwoInfo(
        step1InfoResult.data.data as unknown as IStepTwoFormValues,
      );
    };
    getInfo();
    refresh?.();
  };

  const history = useHistory();

  const deleteReportCb = async () => {
    modal.confirm({
      title: I18N.carbonFootprint.delete,
      content: I18N.enterpriseCarbonAccount2.confirmDeletion,
      onOk: async () => {
        if (!isUndefined(reportInfo?.id)) {
          await deleteReport({
            reportId: reportInfo?.id,
          });
          history.push(`/enterpriseCarbonAccounting/CdpAiReport/list`);
        }
      },
    });
  };

  // const exportReportCb = async () => {
  //   if (!isUndefined(reportInfo?.id)) {
  //     const data = await exportReport({
  //       reportId: reportInfo?.id,
  //     });
  //     downloadFile(data.data.name, data.data.url);
  //   }
  // };

  return (
    <>
      <div className={styles.headerWrapper}>
        <div className={styles.left}>
          <div
            className={styles.back}
            onClick={() => {
              history.push(`/enterpriseCarbonAccounting/CdpAiReport/list`);
            }}
          >
            <img src={backSvg} alt='' />
          </div>
          <div className={styles.titles}>
            <div className={styles.info}>
              {I18N.carbonFootprint3.reportInformation}
            </div>
            <div className={styles.line} />
            <div className={styles.title}>
              {reportInfo?.title}
              {reportInfo?.year}
              {I18N.enterpriseCarbonAccount2.annualReport2}
            </div>
            <div className={styles.version}>
              {reportInfo?.reportVersion === '1'
                ? I18N.enterpriseCarbonAccount2.fullVersion
                : I18N.enterpriseCarbonAccount2.smallAndMediumSizedEnterpriseS}
            </div>
            <div className={styles.line} />
            {reportInfo?.questionModule && (
              <>
                <div className={styles.business}>
                  {reportInfo?.questionModule
                    ?.split(',')
                    .map(item => {
                      const questionModule =
                        questionModuleList?.data.data.cdp_question_module.find(
                          b => b.dictValue === item,
                        );
                      return questionModule?.dictLabel;
                    })
                    .join('、')}
                </div>
                <div className={styles.line} />
              </>
            )}
            {reportInfo?.business && (
              <>
                <div className={styles.business}>
                  {reportInfo?.business
                    ?.split(',')
                    .map(item => {
                      const business =
                        cdpBusinessList?.data.data.cdp_business.find(
                          b => b.dictValue === item,
                        );
                      return business?.dictLabel;
                    })
                    .join('、')}
                </div>
                <div className={styles.line} />
              </>
            )}
            <div className={styles.otherContent}>
              <Popover
                title={null}
                placement='bottomLeft'
                content={
                  <div>
                    {otherContents?.map(item => (
                      <div key={item} className={styles.ul}>
                        <span className={styles.li}>·</span>
                        {item}
                      </div>
                    ))}
                  </div>
                }
              >
                {otherContents?.[0]}
              </Popover>
            </div>
            {otherContents && otherContents?.length > 1 && (
              <span> + {otherContents.length - 1}</span>
            )}
            <div
              className={styles.edit}
              onClick={() => {
                if (userAnswerLoading) {
                  Toast(
                    'info',
                    I18N.enterpriseCarbonAccount2.inTheProcessOfRating,
                  );
                  return;
                }
                setStepOneVisible(true);
              }}
            >
              <img src={editSvg} alt='' />
            </div>
            <Drawer
              width={672}
              visible={stepOneVisible}
              closable={false}
              destroyOnClose
            >
              <div className={styles.header}>
                <div className={styles.titles}>
                  <div className={styles.title}>
                    {I18N.carbonFootprint.editReport}
                  </div>
                </div>
                <div
                  className={styles.close}
                  onClick={() => {
                    setStepOneVisible(false);
                  }}
                >
                  <img src={closeSvg} alt='' />
                </div>
              </div>
              <StepOneForm
                ref={stepOneFormRef}
                onMount={() => {
                  setStepOneMounted(true);
                  setStepOneFormId(pre => pre + 1);
                }}
                onUnmount={() => {
                  setStepOneMounted(false);
                }}
              />
              <FormActions
                width={672}
                place='center'
                buttons={[
                  {
                    type: 'primary',
                    title: I18N.carbonFootprint.confirm,
                    onClick: async () => subStepOneForm(),
                  },
                  {
                    title: I18N.carbonFootprint.cancel,
                    onClick: () => setStepOneVisible(false),
                  },
                  {
                    title: I18N.carbonFootprint.delete,
                    onClick: async () => deleteReportCb(),
                  },
                ]}
              />
            </Drawer>
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.create} onClick={() => setDrawOpen?.()}>
            <div className={styles.aiReport}>
              <svg
                width='22'
                height='22'
                viewBox='0 0 22 22'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M9.95867 6.5C10.2692 6.5 10.5476 6.6915 10.6589 6.98145L13.8464 15.2959C13.884 15.3941 13.8118 15.4999 13.7067 15.5H11.1696C10.8167 15.5 10.5111 15.254 10.4362 14.9092L10.2389 14H7.53874L6.99285 15.0869C6.8655 15.3402 6.60541 15.5 6.32195 15.5H3.67839C3.5643 15.5 3.49158 15.3773 3.54656 15.2773L8.16081 6.88867C8.29263 6.64901 8.54452 6.5 8.81804 6.5H9.95867ZM17.9548 9.5C18.0449 9.50008 18.1144 9.57946 18.1032 9.66895L17.4567 14.8428C17.4098 15.2181 17.0908 15.4999 16.7126 15.5H14.8444C14.7542 15.5 14.6848 15.4206 14.696 15.3311L15.3425 10.1572C15.3894 9.78192 15.7084 9.50002 16.0866 9.5H17.9548ZM9.51433 10.665C9.48433 10.5269 9.29762 10.5026 9.23406 10.6289L8.29265 12.5H9.91277L9.51433 10.665ZM18.3229 6.5C18.4154 6.50027 18.4856 6.58352 18.4704 6.6748L18.2292 8.12305C18.1689 8.48469 17.8556 8.75 17.4889 8.75H15.6012C15.5087 8.74978 15.4386 8.6665 15.4538 8.5752L15.695 7.12695C15.7553 6.76531 16.0686 6.5 16.4352 6.5H18.3229Z'
                  fill='url(#paint0_linear_40_3953)'
                />
                <defs>
                  <linearGradient
                    id='paint0_linear_40_3953'
                    x1='5.54742'
                    y1='0.499997'
                    x2='19.0588'
                    y2='15.6501'
                    gradientUnits='userSpaceOnUse'
                  >
                    <stop stopColor='#19E0BD' />
                    <stop offset='1' stopColor='#0CBF9F' />
                  </linearGradient>
                </defs>
              </svg>
              {I18N.enterpriseCarbonAccount2.score}
            </div>
          </div>
          {/* <Button
            type='default'
            icon={
              <img src={generateSvg} style={{ marginRight: '4px' }} alt='' />
            }
            onClick={() => confirmGenerate()}
          >
            {I18N.carbonFootprint.generateReport}
          </Button> */}
          {/* <LoadingButton
            type='primary'
            icon={<img src={exportSvg} alt='' />}
            onClick={exportReportCb}
          >
            导出
          </LoadingButton> */}
        </div>
      </div>
      <div className={styles.secondHeader}>
        <div className={styles.left}>
          <img src={secondSvg} alt='' />
          <div className={styles.underLineText}>
            <Popover
              title={null}
              placement='bottomLeft'
              content={
                <div>
                  <div>{I18N.enterpriseCarbonAccount2.baseYear}</div>
                  <div className=''>
                    {formatDate(reportInfo?.baseYearStart)} -{' '}
                    {formatDate(reportInfo?.baseYearEnd)}
                  </div>
                </div>
              }
            >
              {I18N.enterpriseCarbonAccount2.reportYear2}
            </Popover>
          </div>
          <div>
            {formatDate(reportInfo?.reportStart)} -{' '}
            {formatDate(reportInfo?.reportEnd)}
          </div>
          <div className={styles.line} />
          <div className={styles.grayText}>
            {I18N.enterpriseCarbonAccount2.scopeOne}
          </div>
          <div className={styles.blackText}>
            {(reportInfo?.scope1Emissions &&
              Number(reportInfo?.scope1Emissions).toFixed(3)) ||
              0}
          </div>
          <div className={styles.line} />
          <div className={styles.underLineText}>
            <Popover
              title={null}
              placement='bottomLeft'
              className={styles.underLineText}
              content={
                <div className={styles.items}>
                  <div className={styles.itemLong}>
                    <div className={styles.title}>
                      {I18N.enterpriseCarbonAccount2.reportYearScope2}
                    </div>
                    <div className={styles.value}>
                      {reportInfo?.scope2EmissionsLocation}
                    </div>
                  </div>
                  <div className={styles.itemLong}>
                    <div className={styles.title}>
                      {I18N.enterpriseCarbonAccount2.reportYearScope}
                    </div>
                    <div className={styles.value}>
                      {reportInfo?.scope2EmissionsMarket}
                    </div>
                  </div>
                </div>
              }
            >
              {I18N.enterpriseCarbonAccount2.scope2}
            </Popover>
          </div>
          <div className={styles.blackText}>
            {(
              (Number(reportInfo?.scope2EmissionsLocation) || 0) +
              (Number(reportInfo?.scope2EmissionsMarket) || 0)
            ).toFixed(3)}
          </div>
          <div className={styles.line} />
          <div className={styles.underLineText}>
            <Popover
              title={null}
              placement='bottomLeft'
              content={
                JSON.parse(reportInfo?.scope3Emission || '[]').length > 0 ? (
                  <div className={styles.items}>
                    {JSON.parse(reportInfo?.scope3Emission || '[]')?.map(
                      (item: { id: string; value: string }) => (
                        <div key={item.id} className={styles.item}>
                          <div className={styles.title}>
                            {
                              scopeThreeCategory.find(
                                i => i.dictValue === item.id,
                              )?.dictLabel
                            }
                          </div>
                          <div className={styles.value}>
                            {Number(item.value).toFixed(3)}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                ) : null
              }
            >
              {I18N.enterpriseCarbonAccount2.fanWeisan}
            </Popover>
          </div>
          <div className={styles.blackText}>
            {JSON.parse(reportInfo?.scope3Emission || '[]')?.reduce(
              (acc: number, cur: { value: string }) => {
                if (!isNaN(Number(cur.value))) {
                  acc = Number(acc) + Number(cur.value);
                }
                return Number(acc).toFixed(3);
              },
              0,
            )}
          </div>
          <div
            className={styles.edit}
            onClick={() => {
              if (userAnswerLoading) {
                Toast(
                  'info',
                  I18N.enterpriseCarbonAccount2.inTheProcessOfRating,
                );
                return;
              }
              setStepTwoVisible(true);
            }}
          >
            <img src={editSvg} alt='' />
          </div>
          <Drawer
            width={752}
            visible={stepTwoVisible}
            closable={false}
            destroyOnClose
          >
            <div className={styles.header}>
              <div className={styles.titles}>
                <div className={styles.title}>
                  {I18N.enterpriseCarbonAccount2.quickReporting}
                </div>
                <div className={styles.subTitle}>
                  {I18N.enterpriseCarbonAccount2.fillInQuickly}
                </div>
              </div>
              <div
                className={styles.close}
                onClick={() => setStepTwoVisible(false)}
              >
                <img src={closeSvg} alt='' />
              </div>
            </div>
            <div className={styles.stepTwoWrapper}>
              <StepTwoForm
                ref={stepTwoFormRef}
                onMount={() => {
                  setStepTwoMounted(true);
                  setStepTwoFormId(pre => pre + 1);
                }}
                onUnmount={() => setStepTwoMounted(false)}
              />
            </div>
            <FormActions
              width={672}
              place='center'
              buttons={[
                {
                  type: 'primary',
                  title: I18N.carbonFootprint.confirm,
                  onClick: async () => subStepTwoForm(),
                },
                {
                  title: I18N.carbonFootprint.cancel,
                  onClick: async () => setStepTwoVisible(false),
                },
              ]}
            />
          </Drawer>
        </div>
        <div className={styles.right}>
          {/* <div>进度</div> */}
          <div className={styles.line} />
          <div className={styles.filter}>
            <Popover
              placement='bottom'
              title={null}
              content={
                <div>
                  <Checkbox.Group
                    defaultValue={filter}
                    onChange={e => setFilter?.(e as FormItemStatus[])}
                  >
                    <Space direction='vertical' size='middle'>
                      {plainOptions.map(option => (
                        <Checkbox key={option.value} value={option.value}>
                          {option.label}
                        </Checkbox>
                      ))}
                    </Space>
                  </Checkbox.Group>
                </div>
              }
              trigger='click'
            >
              <div>
                <img src={filterSvg} alt='' />
              </div>
            </Popover>
          </div>
          <div className={styles.search}>
            <SearchInContent contentId='CDPFormFormilyContent' />
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportHeader;
