import { Form } from '@formily/core';
import I18N from '@src/lang/I18N';
import { Modal, Steps, Button, Alert } from 'antd';
import { useState, FC, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import { StepOneForm } from './StepOneForm';
// import { StepThreeForm } from './StepThreeForm';
import { StepTwoForm } from './StepTwoForm';
import { IStepTwoFormValues } from './StepTwoForm/schema';
import styles from './index.module.less';
import {
  GetQuickCreateInfo,
  IReportForm,
  PostQuickCreate,
  // PostQuickCreateAi,
  createReport,
} from '../../service';

interface ICreateModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  refresh: () => void;
}

const steps = [
  {
    title: I18N.DomesticVersion.createReport,
    description: I18N.enterpriseCarbonAccount2.fillInTheReportBase,
  },
  {
    title: I18N.enterpriseCarbonAccount2.basicDataConfirmation,
    description: I18N.enterpriseCarbonAccount2.carbonEmissionData,
  },
  // {
  //   title: 'AI填报',
  //   description: '解析上传文件内容',
  // },
];

enum Step {
  Create = 0,
  baseInfo = 1,
  AI = 2,
}

export const CreateModal: FC<ICreateModalProps> = props => {
  const { visible, setVisible, refresh } = props;

  const [step, setStep] = useState(0);
  const [reportId, setReportId] = useState<number>(0);

  const step0Form = useRef<Form>(null);
  const step1Form = useRef<Form>(null);
  // const step2Form = useRef<Form>(null);

  const history = useHistory();

  const submitInfoForm = async () => {
    await step0Form.current?.validate();
    const formValue =
      (await step0Form.current?.submit<IReportForm>()) as IReportForm;

    const submitInfo = {
      ...formValue,
      orgId: formValue.orgId.toString(),
      industry: formValue.industry, // 行业-组织范围
      business: formValue.business, // 业务
      year: formValue.year, // 所属年度
      reportVersion: formValue.reportVersion, // 1完整 / 2简版
      otherContent: formValue.otherContent.join(','), // 其他问卷内容
      questionModule: formValue.question_module.join(','), // 问卷模块
    };
    const data = await createReport(submitInfo);
    setReportId(data.data.data.id);
    setStep(1);
    const step1InfoResult = await GetQuickCreateInfo({
      reportId: data.data.data.id,
    });
    setTimeout(() => {
      step1Form.current?.setInitialValues({
        ...step1InfoResult.data.data,
        scope3Emission:
          (step1InfoResult.data.data.scope3Emission || [])?.map(item =>
            item.id.toString(),
          ) || [],
        scope4E: (step1InfoResult.data.data.scope3Emission || []).reduce(
          (acc, cur) => {
            acc[cur.id] = cur.value;
            return acc;
          },
          {},
        ),
      });
    }, 200);
  };

  const submitStepTwoForm = async (notJump?: boolean) => {
    await step1Form.current?.validate();
    const formValue =
      (await step1Form.current?.submit<IStepTwoFormValues>()) as IStepTwoFormValues;

    const { scope4E } = formValue;
    await PostQuickCreate({
      id: reportId,
      scope1Emissions: formValue.scope1Emissions,
      scope2EmissionsLocation: formValue.scope2EmissionsLocation,
      scope2EmissionsMarket: formValue.scope2EmissionsMarket,
      totalRevenue: formValue.totalRevenue,
      currency: formValue.currency,
      scope3Emission: formValue.scope3Emission?.map(item => ({
        id: item,
        value: scope4E[item],
        // name: '类别1: 外购商品和服务'
      })),
      baseYearStart: formValue.baseYearStart,
      baseYearEnd: formValue.baseYearEnd,
      reportStart: formValue.reportStart,
      reportEnd: formValue.reportEnd,
    });
    if (!notJump) {
      history.push(
        `/enterpriseCarbonAccounting/CdpAiReport/detail/?reportId=${reportId}`,
      );
    }
  };

  // const submitStepThreeForm = async () => {
  //   await step2Form.current?.validate();
  //   const formValue = await step2Form.current?.submit<any>();

  //   // console.log(formValue);

  //   await PostQuickCreateAi({
  //     reportId,
  //     yesReportId: formValue.yesReportId,
  //     fileUpLoadList: formValue.fileUpLoadList?.fileList.map(file => ({
  //       name: file.name,
  //       url: file.response.data,
  //     })),
  //     description: formValue.description,
  //   });
  //   // await PostQuickCreate({
  //   //   id: reportId?.toString() || '0',
  //   //   ...formValue,
  //   // });
  //   setVisible(false);
  //   setStep(0);
  //   refresh();
  // };

  return (
    <Modal
      destroyOnClose
      closable={false}
      open={visible}
      footer={null}
      width={1050}
      styles={{
        body: {
          padding: 0,
        },
      }}
      centered
    >
      <div className={styles.wrapper}>
        <div className={styles.left}>
          <div className={styles.title}>
            {I18N.DomesticVersion.createReport}
          </div>
          <div className={styles.des}>
            {I18N.enterpriseCarbonAccount2.throughCarbonInventoryCheck}
          </div>
          <div className={styles.step}>
            <Steps progressDot current={step} direction='vertical'>
              {steps.map(stepItem => (
                <Steps.Step
                  key={stepItem.title}
                  title={stepItem.title}
                  description={stepItem.description}
                />
              ))}
            </Steps>
          </div>
        </div>
        <div className={styles.right}>
          {step === Step.Create && (
            <div className={styles.step0}>
              <StepOneForm ref={step0Form} />
              <div className={styles.step0Btn}>
                <Button onClick={() => setVisible(false)}>
                  {I18N.carbonFootprint.cancel}
                </Button>
                <Button onClick={() => submitInfoForm()} type='primary'>
                  {I18N.enterpriseCarbonAccount2.determineTheBasicNumber}
                </Button>
              </div>
            </div>
          )}
          {step === Step.baseInfo && (
            <div className={styles.step0}>
              <Alert
                message={I18N.enterpriseCarbonAccount2.theRelevantDataWill}
                type='info'
                showIcon
              />
              <div className={styles.step1FormWrapper}>
                <StepTwoForm ref={step1Form} />
              </div>
              <div className={styles.step1Btn}>
                <Button
                  onClick={async () => {
                    await submitStepTwoForm(true);
                    refresh();
                    setVisible(false);
                    setStep(0);
                  }}
                >
                  {I18N.carbonFootprint.cancel}
                </Button>
                <div className=''>
                  <Button type='text' onClick={() => submitStepTwoForm()}>
                    {I18N.enterpriseCarbonAccount2.skip}
                  </Button>
                  <Button onClick={() => submitStepTwoForm()} type='primary'>
                    {I18N.enterpriseCarbonAccount2.confirmFillingInTo}
                  </Button>
                </div>
              </div>
            </div>
          )}
          {/* {step === Step.AI && (
            <div className={styles.step0}>
              <Alert
                message='可上传一些企业材料，通过材料内容及AI能力，自动完成部分问题的填写。也直接跳过，在报告填写页面可再次生成。示例如下'
                type='info'
                showIcon
              />
              <StepThreeForm ref={step2Form} />
              <div className={styles.step1Btn}>
                <Button
                  onClick={() => {
                    setVisible(false);
                    setStep(0);
                  }}
                >
                  取消
                </Button>
                <div className=''>
                  <Button
                    type='text'
                    onClick={() =>
                      history.push(
                        `/enterpriseCarbonAccounting/CdpAiReport/detail/?reportId=${reportId}`,
                      )
                    }
                  >
                    跳过
                  </Button>
                  <Button onClick={() => submitStepThreeForm()} type='primary'>
                    AI 填报
                  </Button>
                </div>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </Modal>
  );
};
