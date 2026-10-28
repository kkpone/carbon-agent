/**
 * @file 碳排放报告 编辑 3 步
 */
import I18N from '@src/lang/I18N';
import { useState, useRef, useEffect } from 'react';
import './carbon_report_index.less';
import './organizationalManagement.less';
import { Steps } from 'antd';
import { useHistory, useParams } from 'react-router-dom';
import { compact } from 'lodash-es';
import { useSelector } from 'react-redux';
import {
  ReportCover,
  creatChoosereport,
  getSummarytable,
  newCarbonEmissionInfo,
  putCarbonEmissionInfo,
} from '@api/carbon-international';
import { Toast } from '@utils/Toast';
import { RouteMaps, virtualLinkTransform } from '@src/router/route-paths';
import { FormActions } from '@src/components/FormActions';
import { Moment } from 'moment';
import { BackendResponse } from '@src/api/types';
import { ReportStepsOne } from './components/ReportStepsOne';
import { ReportStepsTwo } from './components/ReportStepsTwo';
import {
  CommitedMsgProps,
  ReportStepsThree,
} from './components/ReportStepsThree';
import styles from './addCarbonReport.module.less';
import { getEditionType } from '../utils';
import { StepOneChildType } from './types';

const { Step } = Steps;
const steps = [
  {
    title: I18N.carbonInternational.basicInformationFilling,
  },
  {
    title: I18N.carbonInternational.carbonEmissionData,
  },
  {
    title: I18N.carbonInternational.generatingCarbonEmissions,
  },
];

const AddCarbonReport = () => {
  const [editionTypeNum, editionTypeStr] = getEditionType();
  const selector = useSelector((state: any) => state.carbonInternational);
  const history = useHistory();
  const params = useParams<{
    step?: string;
    id?: string;
  }>();
  const step = Number(params?.step) || 0;
  const id = Number(params?.id);
  const [status, setStatus] = useState<number>(0);
  const childRef = useRef<StepOneChildType>();

  const [coverFile, setCoverFile] = useState<CommitedMsgProps>();

  useEffect(() => {
    if (id) {
      setStatus(1);
      getSummarytable({
        page: 1,
        page_size: 10,
        carbon_emission_info_id: id,
        edition: editionTypeNum,
      }).then(({ data }) => {
        if (data?.results?.length > 0) {
          setStatus(2);
        }
      });
      creatChoosereport(
        'get',
        `/carbon_inventory_int/carbon_emission_info/${id}/`,
      ).then(({ data }) => {
        if (!data?.data?.quantitative_method) {
          history.replace(
            `/clods/carbonInternational/addCarbonReport/${editionTypeStr}/0/${
              id || ''
            }`,
          );
        }
      });
    } else {
      setStatus(0);
    }
  }, []);
  // 下一步具体操作
  const handleNext = async (num?: number) => {
    const current = num ?? step;
    setStatus(current);
    // 最后一步，直接跳转到碳排放信息列表
    if (step === 2 && id && num === undefined) {
      if (!coverFile) {
        Toast('warn', I18N.carbonInternational.pleaseSelectACoverPage);
        return;
      }
      if (
        !coverFile.hasDefaultCover &&
        coverFile.report_word_cover_status === 2
      ) {
        // eslint-disable-next-line consistent-return
        return Toast('warn', I18N.carbonInternational.pleaseUploadTheCoverPage);
      }
      await ReportCover({
        ...coverFile,
        report_word_cover:
          coverFile?.report_word_cover instanceof File
            ? coverFile?.report_word_cover
            : undefined,
        id,
      }).then(({ data }) => {
        if (data.msg === 'success') {
          Toast('success', I18N.carbonInternational.coverUpdatedTo);

          history.push(
            virtualLinkTransform(
              RouteMaps.internationalManageGHGOrISO,
              [':edition'],
              [editionTypeStr],
            ),
          );
        }
      });
    }
    // 当传step 的时候直接跳转
    if (Number(num) >= 0) {
      // eslint-disable-next-line consistent-return
      return history.push(
        virtualLinkTransform(
          RouteMaps.internationaladdCarbonReport,
          [':edition', ':step', ':id?'],
          // @ts-ignore num 必为 number
          [editionTypeStr, num, id],
        ),
      );
    }
    // 新增、编辑碳排放报告
    if (current === 0) {
      const childMsg = childRef.current;

      const stepOneForm = childMsg?.getForm();
      if (!stepOneForm) return;
      // eslint-disable-next-line
      return stepOneForm.validateFields().then((values: any) => {
        const dateFormatStr = 'YYYY-MM-DD';
        const newVal = {
          ...values,
          filling_date: (values.filling_date as Moment).format(dateFormatStr),
          start_base_year: (values.range_year as Moment[])[0].format(
            dateFormatStr,
          ),
          end_base_year: (values.range_year as Moment[])[1].format(
            dateFormatStr,
          ),
          year: (values.year as Moment[])
            .map(m => m.format(dateFormatStr))
            .join(I18N.carbonFootprint.to),
          edition: editionTypeNum,
          average_annual_emissions: values.average_annual_emissions || 0,
        };
        const finishFn = (data: BackendResponse<any>) => {
          if (data?.code === 200) {
            Toast('success', I18N.carbonFootprint.operationSuccessful);

            history.push(
              virtualLinkTransform(
                RouteMaps.internationaladdCarbonReport,
                [':edition', ':step', ':id?'],
                [editionTypeStr, 1, id || data?.data?.id || ''],
              ),
            );
          }
        };
        if (id) {
          return putCarbonEmissionInfo(newVal, id).then(({ data }) =>
            finishFn(data),
          );
        }
        return newCarbonEmissionInfo(newVal).then(({ data }) => finishFn(data));
      });
    }
    if (current === 1) {
      history.push(
        virtualLinkTransform(
          RouteMaps.internationaladdCarbonReport,
          [':edition', ':step', ':id?'],
          [editionTypeStr, 2, id],
        ),
      );
    }
  };
  const onChange = (index: number) => {
    handleNext(index);
  };

  const getStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 1:
        return <ReportStepsTwo />;
      case 2:
        return <ReportStepsThree commitedMsg={setCoverFile} id={id} />;
      default:
        // @ts-ignore
        return <ReportStepsOne ref={childRef} />;
    }
  };
  return (
    <div className={`addcarbon_report ${styles.addcarbon_report}`}>
      <div className={styles.topStep}>
        <span
          className='text-14 text-gray text-cursor'
          onClick={() => {
            history.push(
              virtualLinkTransform(
                RouteMaps.internationalManageGHGOrISO,
                [':edition'],
                [editionTypeStr],
              ),
            );
          }}
        >
          {I18N.carbonInternational.carbonEmissionReport}</span>
        <span className='text-14 text-gray margin10'>/</span>
        <span className='text-14 text-block'>
          {status >= 1 ? I18N.carbonFootprint.editReport : I18N.carbonInternational.newCarbonEmissions}
        </span>
        <div className={styles.staps}>
          <Steps current={step} className='steps_list'>
            {steps.map((item, index) =>
              index <= status ? (
                <Step
                  status='process'
                  key={item.title}
                  title={item.title}
                  onClick={() => {
                    onChange(index);
                  }}
                />
              ) : (
                <Step
                  key={item.title}
                  title={item.title}
                  onClick={() => {
                    if (status >= 1 && index > 1) {
                      onChange(index);
                    }
                  }}
                />
              ),
            )}
          </Steps>
        </div>
      </div>
      <div className={styles.grayBar} />
      <div className={styles.mainContent}>{getStepContent(step)}</div>
      <FormActions
        buttons={compact([
          {
            type: 'primary',
            disabled: selector?.isDis && step === 1,
            onClick: () => handleNext(),
            // eslint-disable-next-line no-nested-ternary
            title: step === 0 ? I18N.supplyChain2.saveNextStep : step === 1 ? I18N.carbonFootprint.nextStep : I18N.carbonFootprint.preserve,
          },
          step === 1 && {
            type: 'primary',
            title: I18N.DomesticVersion.previousStep,
            onClick: () => handleNext(0),
          },
        ])}
      />
    </div>
  );
};
export default AddCarbonReport;
