import projectSelectChevronIcon from '@src/assets/images/carbonAgent/icons/project-select-chevron.svg';
import I18N from '@src/lang/I18N';
import { DatePicker, Form, Select } from 'antd';
import classNames from 'classnames';
// eslint-disable-next-line import/no-extraneous-dependencies
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';

import { useMobile } from '@/hooks/use-mobile';

import styles from './index.module.less';
import { fetchEnterpriseAccountingPreset } from './service';
import type { AgentProject } from '../../constants';
import projectStyles from '../../index.module.less';
import { createAgentProject, updateAgentProject } from '../../service';
import Icon from '../Icon';

/** 企业碳项目业务类型 */
const ENTERPRISE_CARBON_BUSINESS_TYPE = 'enterprise_carbon';

/** 企业碳项目字段限制 */
const PROJECT_NAME_MAX_LENGTH = 50;
const PROJECT_DESCRIPTION_MAX_LENGTH = 500;

/** 企业碳项目表单字段 */
type EnterpriseProjectFormValues = {
  accountingYear: Dayjs;
  gwp: string;
  projectGoal: string;
  projectName: string;
  timeType: number;
};

type EnterpriseCarbonProjectFormProps = {
  /** 当前企业碳项目类型是否可用 */
  available: boolean;
  /** 是否为编辑项目 */
  editMode: boolean;
  /** 供公共提交按钮关联表单 */
  formId: string;
  /** GWP 配置选项 */
  gwpOptions: Array<{ label: string; value: string }>;
  /** 项目保存成功 */
  onSuccess: (project?: AgentProject) => void;
  /** 同步提交状态到公共弹窗 */
  onSubmittingChange: (submitting: boolean) => void;
  /** 项目提交状态 */
  submitting: boolean;
  /** 核算周期配置选项 */
  timeTypeOptions: Array<{ label: string; value: number }>;
  /** 编辑项目详情 */
  project?: AgentProject;
  /** 编辑项目ID */
  projectId?: string;
};

/** 企业碳项目新增、编辑表单 */
const EnterpriseCarbonProjectForm = ({
  available,
  editMode,
  formId,
  gwpOptions,
  onSuccess,
  onSubmittingChange,
  project,
  projectId,
  submitting,
  timeTypeOptions,
}: EnterpriseCarbonProjectFormProps) => {
  const isMobile = useMobile();
  const [form] = Form.useForm<EnterpriseProjectFormValues>();
  const [accountingInfoLocked, setAccountingInfoLocked] = useState(false);
  const [accountingInfoLoading, setAccountingInfoLoading] = useState(false);
  const accountingYear = Form.useWatch('accountingYear', form);
  const projectGoal = Form.useWatch('projectGoal', form) || '';
  const suffixIcon = (
    <Icon
      className={projectStyles.projectSelectChevron}
      src={projectSelectChevronIcon}
    />
  );

  let initialAccountingYear = dayjs();
  if (project?.enterpriseSetting) {
    initialAccountingYear = dayjs().year(
      project.enterpriseSetting.accountingYear,
    );
  }

  /** 新增使用当前年度，编辑直接使用项目详情回显 */
  const initialValues: Partial<EnterpriseProjectFormValues> = {
    accountingYear: initialAccountingYear,
    gwp: project?.enterpriseSetting?.gwp,
    projectGoal: project?.projectGoal || '',
    projectName: project?.name || '',
    timeType: project?.enterpriseSetting?.timeType,
  };

  /** 新增时按核算年度带出核算周期和 GWP */
  useEffect(() => {
    if (editMode || !accountingYear) {
      return undefined;
    }

    let cancelled = false;
    const abortController = new AbortController();

    setAccountingInfoLoading(true);
    fetchEnterpriseAccountingPreset(
      accountingYear.year(),
      abortController.signal,
    )
      .then(preset => {
        if (cancelled) {
          return;
        }

        if (!preset.accountingExists) {
          form.setFieldsValue({ gwp: undefined, timeType: undefined });
          setAccountingInfoLocked(false);
          return;
        }

        form.setFieldsValue({
          gwp: preset.gwp,
          timeType: preset.timeType,
        });
        setAccountingInfoLocked(preset.locked);
      })
      .catch(() => {
        if (!cancelled) {
          form.setFieldsValue({ gwp: undefined, timeType: undefined });
          setAccountingInfoLocked(false);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setAccountingInfoLoading(false);
        }
      });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [accountingYear, editMode, form]);

  /** 创建或更新企业碳项目 */
  const handleSave = async (values: EnterpriseProjectFormValues) => {
    if (!available) {
      return;
    }

    onSubmittingChange(true);

    const payload = {
      accountingYear: values.accountingYear.format('YYYY'),
      businessType: ENTERPRISE_CARBON_BUSINESS_TYPE,
      gwp: values.gwp,
      projectGoal: values.projectGoal.trim(),
      projectName: values.projectName.trim(),
      timeType: values.timeType,
    } as const;

    try {
      let savedProject: AgentProject | undefined;

      if (editMode) {
        if (!projectId || project?.version === undefined) {
          return;
        }

        savedProject = await updateAgentProject(projectId, {
          ...payload,
          version: project.version,
        });
      } else {
        savedProject = await createAgentProject(payload);
      }

      onSuccess(savedProject);
    } catch {
      /** 请求错误由请求层统一处理 */
    } finally {
      onSubmittingChange(false);
    }
  };

  /** 切换核算年度后重新获取周期和 GWP */
  const handleYearChange = () => {
    form.setFieldsValue({ gwp: undefined, timeType: undefined });
    setAccountingInfoLocked(false);
  };

  return (
    <Form<EnterpriseProjectFormValues>
      id={formId}
      className={projectStyles.projectCreateForm}
      form={form}
      initialValues={initialValues}
      onFinish={handleSave}
    >
      <section className={styles.section}>
        <div className={projectStyles.projectCreateField}>
          <label htmlFor='carbon-agent-enterprise-project-name'>
            <b aria-hidden='true'>*</b>
            {I18N.carbonAgent.projectName}
          </label>
          <Form.Item<EnterpriseProjectFormValues>
            className={styles.formItem}
            name='projectName'
            rules={[
              {
                message: I18N.carbonAgent.projectNamePlaceholder,
                required: true,
                whitespace: true,
              },
              {
                max: PROJECT_NAME_MAX_LENGTH,
                message: I18N.carbonAgent.projectNameMaxLength,
              },
            ]}
          >
            <input
              id='carbon-agent-enterprise-project-name'
              className={styles.textInput}
              disabled={submitting}
              maxLength={PROJECT_NAME_MAX_LENGTH}
              placeholder={I18N.carbonAgent.projectNamePlaceholder}
            />
          </Form.Item>
        </div>

        <div className={projectStyles.projectCreateField}>
          <label htmlFor='carbon-agent-enterprise-project-goal'>
            {I18N.carbonAgent.enterpriseProjectDescription}
          </label>
          <div className={projectStyles.projectCreateTextareaWrap}>
            <Form.Item<EnterpriseProjectFormValues>
              className={classNames(styles.formItem, styles.textareaFormItem)}
              name='projectGoal'
              rules={[{ max: PROJECT_DESCRIPTION_MAX_LENGTH }]}
            >
              <textarea
                id='carbon-agent-enterprise-project-goal'
                disabled={submitting}
                maxLength={PROJECT_DESCRIPTION_MAX_LENGTH}
                placeholder={
                  I18N.carbonAgent.enterpriseProjectDescriptionPlaceholder
                }
              />
            </Form.Item>
            <span>
              {projectGoal.length}/{PROJECT_DESCRIPTION_MAX_LENGTH}
            </span>
          </div>
        </div>

        <div className={projectStyles.projectCreateField}>
          <label htmlFor='carbon-agent-enterprise-accounting-year'>
            <b aria-hidden='true'>*</b>
            {I18N.carbonAgent.enterpriseProjectAccountingYear}
          </label>
          <Form.Item<EnterpriseProjectFormValues>
            className={styles.formItem}
            name='accountingYear'
            rules={[{ required: true, message: I18N.carbonAgent.pleaseSelect }]}
          >
            <DatePicker
              id='carbon-agent-enterprise-accounting-year'
              allowClear={false}
              className={styles.datePicker}
              disabled={editMode || submitting}
              format='YYYY'
              inputReadOnly={isMobile}
              picker='year'
              placeholder={I18N.carbonAgent.pleaseSelect}
              onChange={handleYearChange}
            />
          </Form.Item>
        </div>

        <div className={styles.fieldGrid}>
          <div className={projectStyles.projectCreateField}>
            <label htmlFor='carbon-agent-enterprise-accounting-period'>
              <b aria-hidden='true'>*</b>
              {I18N.carbonAgent.enterpriseProjectAccountingPeriod}
            </label>
            <Form.Item<EnterpriseProjectFormValues>
              className={styles.formItem}
              name='timeType'
              rules={[
                { required: true, message: I18N.carbonAgent.pleaseSelect },
              ]}
            >
              <Select<number>
                id='carbon-agent-enterprise-accounting-period'
                className={projectStyles.projectCreateSelect}
                disabled={
                  editMode ||
                  accountingInfoLocked ||
                  accountingInfoLoading ||
                  submitting
                }
                loading={accountingInfoLoading}
                options={timeTypeOptions}
                placeholder={I18N.carbonAgent.pleaseSelect}
                suffixIcon={suffixIcon}
              />
            </Form.Item>
          </div>

          <div className={projectStyles.projectCreateField}>
            <label htmlFor='carbon-agent-enterprise-gwp'>
              <b aria-hidden='true'>*</b>
              {I18N.carbonAgent.enterpriseProjectGwp}
            </label>
            <Form.Item<EnterpriseProjectFormValues>
              className={styles.formItem}
              name='gwp'
              rules={[
                { required: true, message: I18N.carbonAgent.pleaseSelect },
              ]}
            >
              <Select<string>
                id='carbon-agent-enterprise-gwp'
                className={projectStyles.projectCreateSelect}
                disabled={
                  editMode ||
                  accountingInfoLocked ||
                  accountingInfoLoading ||
                  submitting
                }
                loading={accountingInfoLoading}
                options={gwpOptions}
                placeholder={I18N.carbonAgent.pleaseSelect}
                suffixIcon={suffixIcon}
              />
            </Form.Item>
          </div>
        </div>
      </section>
    </Form>
  );
};

export default EnterpriseCarbonProjectForm;
