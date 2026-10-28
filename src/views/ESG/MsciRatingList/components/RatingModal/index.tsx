import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { useRequest } from 'ahooks';
import {
  Button,
  Checkbox,
  Dropdown,
  Form,
  Input,
  Modal,
  Progress,
  Select,
  Upload,
  message,
} from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import classNames from 'classnames';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { IconAlibabaNew } from '@/components/iconfont';
import { getFileIcon, getYear, sleep } from '@/utils';
import { Toast } from '@/utils/Toast';

import styles from './index.module.less';
import {
  addMsciRating,
  aiAsBusinessInfo,
  aiMsciScoreChatting,
  classifyIssuesByModuleType,
  convertIndustryToOptions,
  editMsciRating,
  extractAiAsBusinessInfo,
  extractIndustryData,
  extractIndustryIssues,
  extractIssuesWeight,
  extractMsciRatingDetail,
  getEsgReportList,
  getIndustryData,
  getIndustryIssues,
  getIssuesPercent,
  getMsciRatingDetail,
  getSubIndustryOptions,
  IndustryIssueItem,
  updateIssuesWithWeight,
} from '../../service';

export interface RatingModalProps {
  open: boolean;
  editId?: number;
  esgReportId?: number;
  onCancel: () => void;
  onConfirm?: (data: {
    files: Array<{ name: string; url: string }>;
    companyName: string;
    year: number;
    industry: string;
    subIndustry: string;
    topics: string[];
  }) => Promise<void>;
}

// TopicItem 类型与 IndustryIssueItem 兼容
type TopicItem = IndustryIssueItem;

export const RatingModal: FC<RatingModalProps> = ({
  open,
  editId,
  esgReportId: esgReportIdFromProps,
  onCancel,
  onConfirm,
}) => {
  const history = useHistory();
  const [form] = Form.useForm();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndustryId, setSelectedIndustryId] = useState<
    number | undefined
  >();
  const [selectedSubIndustryId, setSelectedSubIndustryId] = useState<
    number | undefined
  >();
  const hasCalledAiApiRef = useRef(false); // 标记是否已调用过 AI 接口
  const lastToastTimeRef = useRef<number>(0); // 记录上次显示 Toast 的时间戳，用于节流

  const [esgReportId, setEsgReportId] = useState<number>();

  const { data: esgReportListResp } = useRequest(getEsgReportList, {
    ready: open,
  });

  const esgReportList = esgReportListResp?.data.data || [];

  const esgReport = esgReportList.find(report => report.id === esgReportId);

  // 获取行业数据
  const { data: industryResponse } = useRequest(getIndustryData, {
    ready: open,
  });

  // 获取详情数据（编辑模式）
  const { data: detailResponse } = useRequest(
    () => {
      if (!editId) {
        return Promise.resolve(null);
      }
      return getMsciRatingDetail(editId);
    },
    {
      ready: open && !!editId,
      refreshDeps: [editId],
    },
  );

  // 提取并转换行业数据
  const industryData = extractIndustryData(industryResponse);
  const industryOptions = convertIndustryToOptions(industryData);
  const subIndustryOptions = getSubIndustryOptions(
    industryData,
    selectedIndustryId,
  );

  // 获取议题数据（当选择子行业时）
  const { data: issuesResponse, loading: issuesLoading } = useRequest(
    () => {
      if (!selectedSubIndustryId) {
        return Promise.resolve(null);
      }
      return getIndustryIssues(selectedSubIndustryId);
    },
    {
      ready: open && !!selectedSubIndustryId,
      refreshDeps: [selectedSubIndustryId],
    },
  );

  // 提取议题数据
  const rawIssuesData = extractIndustryIssues(issuesResponse);

  // 获取议题权重信息（当有选择的议题时）
  const { data: weightResponse } = useRequest(
    () => {
      if (!selectedSubIndustryId || selectedTopics.length === 0) {
        return Promise.resolve(null);
      }
      const issuesIds = selectedTopics.map(id => Number(id));
      return getIssuesPercent({
        industryId: selectedSubIndustryId,
        issuesIds,
      });
    },
    {
      ready: open && !!selectedSubIndustryId && selectedTopics.length > 0,
      refreshDeps: [selectedSubIndustryId, selectedTopics.join(',')],
    },
  );

  // 提取权重数据并更新议题权重
  // 当没有选择议题或切换子行业时，使用原始议题数据（不应用权重）
  const weightData =
    selectedTopics.length > 0 && selectedSubIndustryId
      ? extractIssuesWeight(weightResponse)
      : [];
  const issuesData = updateIssuesWithWeight(rawIssuesData, weightData);

  // 分类议题数据
  const { environment, social, governance } =
    classifyIssuesByModuleType(issuesData);

  // 获取各支柱的总权重
  const getPillarTotalWeight = (modelType: number): number => {
    const pillar = weightData.find(item => item.modelType === modelType);
    return pillar ? Number.parseFloat(pillar.totalWeight) || 0 : 0;
  };

  const environmentTotalWeight = getPillarTotalWeight(1);
  const socialTotalWeight = getPillarTotalWeight(2);
  const governanceTotalWeight = getPillarTotalWeight(3);

  // 回填表单数据（编辑模式）
  useEffect(() => {
    if (!editId || !detailResponse) {
      // 非编辑模式时，重置 AI 接口调用标记
      hasCalledAiApiRef.current = false;
      return;
    }

    // 编辑模式下，标记已调用（防止触发 AI 接口）
    hasCalledAiApiRef.current = true;

    const detail = extractMsciRatingDetail(detailResponse);
    if (!detail) return;

    setEsgReportId(detail.esgReportId);
    // 设置行业和子行业
    const industryId = Number(detail.industry);
    const subIndustryId = Number(detail.industrySub);
    setSelectedIndustryId(industryId);
    setSelectedSubIndustryId(subIndustryId);

    // 回填表单字段
    form.setFieldsValue({
      companyName: detail.businessName,
      year: Number(detail.period),
      industry: Number(detail.industry),
      subIndustry: Number(detail.industrySub),
    });

    // 回填文件列表
    if (detail.referFiles && detail.referFiles.length > 0) {
      const fileList: UploadFile[] = detail.referFiles.map((file, index) => ({
        uid: `-${index}`,
        name: file.name,
        status: 'done' as const,
        url: file.url,
        content: file.content,
        response: { data: file.url },
      }));
      setFiles(fileList);
    }

    // 回填议题选择（合并所有议题ID）
    const topicIds: string[] = [];
    if (detail.environmentalIssues) {
      topicIds.push(
        ...detail.environmentalIssues.split(',').filter(id => id.trim()),
      );
    }
    if (detail.socialIssues) {
      topicIds.push(...detail.socialIssues.split(',').filter(id => id.trim()));
    }
    if (detail.governanceIssues) {
      topicIds.push(
        ...detail.governanceIssues.split(',').filter(id => id.trim()),
      );
    }
    setSelectedTopics(topicIds);
  }, [detailResponse, editId, form]);

  const handleClose = () => {
    form.resetFields();
    setFiles([]);
    setSelectedTopics([]);
    setSelectedIndustryId(undefined);
    setSelectedSubIndustryId(undefined);
    hasCalledAiApiRef.current = false; // 重置标记
    onCancel();
  };

  // 处理行业选择变化
  const handleIndustryChange = (industryId: number) => {
    setSelectedIndustryId(industryId);
    // 清空子行业选择和议题
    form.setFieldsValue({ subIndustry: undefined });
    setSelectedSubIndustryId(undefined);
    setSelectedTopics([]);
  };

  // 处理子行业选择变化
  const handleSubIndustryChange = (subIndustryId: number) => {
    setSelectedSubIndustryId(subIndustryId);
    // 清空已选择的议题（治理支柱会自动全选）
    setSelectedTopics([]);
  };

  // 自定义文件列表项渲染
  const itemRender = useCallback(
    (
      originNode: React.ReactElement,
      file: UploadFile,
      fileList: UploadFile[],
      actions: {
        download: () => void;
        preview: () => void;
        remove: () => void;
      },
    ) => {
      const { status, name, percent } = file;
      const isError = status === 'error';
      const isDone = status === 'done';
      const isUploading = status === 'uploading';

      return (
        <div className={styles.customFileItem}>
          <div className={styles.fileLeft}>
            <div className={styles.fileIcon}>
              <IconAlibabaNew
                style={{
                  fontSize: 32,
                }}
                type={getFileIcon(name)}
              />
            </div>
            <span className={styles.fileName} title={name}>
              {name}
            </span>
          </div>
          <div className={styles.fileRight}>
            {isUploading && (
              <div className={styles.uploadProgress}>
                <Progress
                  percent={percent || 0}
                  size='small'
                  strokeColor='#026961'
                  showInfo={false}
                />
              </div>
            )}
            {isError && (
              <>
                <CloseCircleOutlined className={styles.errorIcon} />
                <span className={styles.errorText}>
                  {I18N.emission.uploadFailed}
                </span>
                <span
                  className={styles.actionText}
                  onClick={() => actions.remove()}
                >
                  {I18N.carbonFootprint.delete}
                </span>
              </>
            )}
            {isDone && (
              <>
                <CheckCircleOutlined className={styles.successIcon} />
                <span className={styles.successText}>
                  {I18N.enterpriseCarbonAccount2.uploadSuccessful}
                </span>
                <span
                  className={styles.actionText}
                  onClick={() => actions.remove()}
                >
                  {I18N.carbonFootprint.delete}
                </span>
              </>
            )}
          </div>
        </div>
      );
    },
    [],
  );

  // 当议题数据加载完成后，自动选中所有议题
  useEffect(() => {
    if (issuesData.length > 0 && selectedSubIndustryId && !editId) {
      const allTopicIds = issuesData.map(topic => String(topic.id));
      setSelectedTopics(prev => {
        // 合并所有议题，确保它们始终被选中
        const allTopics = [...prev, ...allTopicIds];
        // 去重
        return Array.from(new Set(allTopics));
      });
    }
  }, [issuesData.length, selectedSubIndustryId, editId]);

  useEffect(() => {
    if (open) {
      setEsgReportId(esgReportIdFromProps);
    }
  }, [open, esgReportIdFromProps]);

  useEffect(() => {
    if (open && !editId && esgReport) {
      const { orgName, period } = esgReport;

      if (!form.getFieldValue('companyName')) {
        form.setFieldValue('companyName', orgName);
      }

      if (!form.getFieldValue('year')) {
        form.setFieldValue('year', Number(period));
      }
    }
  }, [open, editId, esgReport, form]);

  const handleSubmit = async () => {
    try {
      const values = (await form.validateFields()) as {
        companyName: string;
        year: number;
        industry: string;
        subIndustry: string;
      };
      const uploadedFiles = files
        .filter(file => file.status === 'done')
        .map(file => ({
          name: file.name,
          content: (file as any).content,
          url: (file.response as { data: string })?.data || '',
        }));

      if (uploadedFiles.length === 0 && !esgReport) {
        message.warning(I18N.esg.pleaseUploadAtLeast);
        return;
      }

      // 检查环境支柱和社会支柱是否至少各选择一个
      const selectedIssuesIds = selectedTopics.map(id => Number(id));
      const selectedIssues = issuesData.filter(issue =>
        selectedIssuesIds.includes(Number(issue.id)),
      );

      const hasEnvironmental = selectedIssues.some(
        issue => issue.moduleType === 1,
      );
      const hasSocial = selectedIssues.some(issue => issue.moduleType === 2);

      if (!hasEnvironmental) {
        message.warning(I18N.esg.pleaseChooseAtLeast2);
        return;
      }

      if (!hasSocial) {
        message.warning(I18N.esg.pleaseChooseAtLeast);
        return;
      }

      setLoading(true);

      // 根据议题的 moduleType 分类议题ID（已在上面获取）

      const environmentalIssuesIds: number[] = [];
      const socialIssuesIds: number[] = [];
      const governanceIssuesIds: number[] = [];

      selectedIssues.forEach(issue => {
        const issueId = Number(issue.id);
        if (issue.moduleType === 1) {
          environmentalIssuesIds.push(issueId);
        } else if (issue.moduleType === 2) {
          socialIssuesIds.push(issueId);
        } else if (issue.moduleType === 3) {
          governanceIssuesIds.push(issueId);
        }
      });

      // 准备接口参数
      const submitParams = {
        period: String(values.year),
        businessName: values.companyName,
        industry: values.industry,
        industrySub: values.subIndustry,
        environmentalIssues:
          environmentalIssuesIds.length > 0
            ? environmentalIssuesIds.join(',')
            : undefined,
        socialIssues:
          socialIssuesIds.length > 0 ? socialIssuesIds.join(',') : undefined,
        governanceIssues:
          governanceIssuesIds.length > 0
            ? governanceIssuesIds.join(',')
            : undefined,
        referFiles: uploadedFiles,
        esgReportId: esgReport?.id,
      };

      // 根据是否有 editId 决定调用新增还是编辑接口
      if (editId) {
        await editMsciRating({
          ...submitParams,
          id: editId,
        });
        message.success(I18N.carbonFootprint.editSuccessful);
      } else {
        const addResponse = await addMsciRating(submitParams);
        message.success(I18N.carbonFootprint.submittedSuccessfully);

        // 从返回值中获取 reportId
        const reportId =
          (addResponse as any)?.data?.data?.data ||
          (addResponse as any)?.data?.data ||
          (addResponse as any)?.data;

        // 如果获取到 reportId，调用 AI 评分接口
        if (reportId) {
          try {
            await aiMsciScoreChatting(Number(reportId));
            // 调用成功后跳转到详情页面
            message.success(I18N.esg.ratingCreation);
            handleClose();
            history.push(`/ESG/msciRatingDetail?id=${reportId}`);
            return; // 跳转后直接返回，不执行后续逻辑
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(I18N.esg.aiScoringSystem, error);
            // 不阻塞主流程，只记录错误
          }
        }
      }

      // 如果提供了 onConfirm 回调，也调用它
      if (onConfirm) {
        await sleep(1000);
        await onConfirm({
          files: uploadedFiles,
          companyName: values.companyName,
          year: values.year,
          industry: values.industry,
          subIndustry: values.subIndustry,
          topics: selectedTopics,
        });
      }

      handleClose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(I18N.carbonFootprint.submissionFailed, error);
      message.error(I18N.esg.submissionFailedPlease);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicChange = (
    topicId: string | number,
    checked: boolean,
    moduleType?: number,
  ) => {
    const idStr = String(topicId);

    // 如果是治理支柱（moduleType === 3），不允许取消
    if (moduleType === 3 && !checked) {
      return; // 阻止取消治理支柱的议题
    }

    if (checked) {
      setSelectedTopics([...selectedTopics, idStr]);
    } else {
      setSelectedTopics(selectedTopics.filter(id => id !== idStr));
    }
  };

  const renderPillar = (
    title: string,
    color: string,
    bgColor: string,
    topics: TopicItem[],
    totalWeight?: number,
    moduleType?: number,
  ) => {
    // 如果有总权重则使用总权重，否则通过求和计算
    const displayWeight =
      totalWeight !== undefined
        ? totalWeight
        : topics.reduce((sum, t) => sum + t.percent, 0);

    // 治理支柱的议题应该始终被选中且不可取消
    const isGovernance = moduleType === 3;

    return (
      <div className={styles.pillar}>
        <div
          className={styles.pillarHeader}
          style={{ backgroundColor: bgColor }}
        >
          <div className={styles.pillarTitle}>
            <div
              className={styles.pillarBar}
              style={{ backgroundColor: color }}
            />
            <span>{title}</span>
          </div>
          <span className={styles.pillarPercent}>
            {displayWeight ? `${displayWeight}%` : ''}
          </span>
        </div>
        <div className={styles.pillarContent}>
          <div className={styles.topicsList}>
            {topics.map(topic => {
              const isChecked = selectedTopics.includes(String(topic.id));
              // 治理支柱的议题应该始终被选中
              const shouldBeChecked = isGovernance ? true : isChecked;

              return (
                <div key={topic.id} className={styles.topicItem}>
                  <Checkbox
                    checked={shouldBeChecked}
                    disabled={isGovernance} // 治理支柱禁用取消
                    onChange={e =>
                      handleTopicChange(topic.id, e.target.checked, moduleType)
                    }
                  >
                    <span className={styles.topicName}>{topic.name}</span>
                    {!isGovernance && (
                      <span className={styles.topicPercent}>
                        {topic.percent ? `${topic.percent}%` : ''}
                      </span>
                    )}
                  </Checkbox>
                </div>
              );
            })}
          </div>
          {/* <div className={styles.scrollbar} /> */}
        </div>
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={900}
      centered
      destroyOnClose
      className={styles.ratingModal}
      closeIcon={null}
    >
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='34'
                height='22'
                viewBox='0 0 34 22'
                fill='none'
              >
                <g clipPath='url(#clip0_6961_4266)'>
                  <path
                    fillRule='evenodd'
                    clipRule='evenodd'
                    d='M23.3494 21.8139L15.8439 0.440026C15.8039 0.315762 15.7268 0.206469 15.6229 0.12685C15.5193 0.0439802 15.3903 -0.000760009 15.2574 9.7698e-06H11.3644C11.2475 0.00101583 11.1331 0.0332453 11.0329 0.0931776C10.9376 0.160034 10.8614 0.250278 10.8119 0.355328L0.016899 21.7969C0.0097306 21.816 0.0097306 21.8371 0.016899 21.8562C0.00836441 21.878 0.00836441 21.902 0.016899 21.9238C0.0201991 21.9346 0.0256673 21.9448 0.0329688 21.9535C0.0402702 21.9622 0.0492583 21.9694 0.0594016 21.9746H0.127403H5.83941C5.96042 21.968 6.0776 21.9302 6.1794 21.8647C6.27735 21.7971 6.354 21.7031 6.40041 21.5939L8.57641 17.6H15.2319L16.5494 21.4501C16.5728 21.5968 16.6466 21.7309 16.7582 21.8296C16.8698 21.9283 17.0122 21.9856 17.1614 21.9915H23.2219H23.2814C23.2814 21.9915 23.2814 21.9915 23.2814 21.9407C23.2854 21.9313 23.2874 21.9214 23.2874 21.9112C23.2874 21.901 23.2854 21.891 23.2814 21.8816C23.3112 21.8675 23.3352 21.8435 23.3494 21.8139ZM10.1319 13.3523L12.7839 7.42927C12.7963 7.38956 12.8238 7.3561 12.8604 7.3361C12.9021 7.32455 12.9462 7.32455 12.9879 7.3361C13.0338 7.33984 13.0764 7.36111 13.1069 7.39539C13.142 7.4228 13.1661 7.46192 13.1749 7.50549L14.6114 13.4286L10.1319 13.3523Z'
                    fill='#0CBF9F'
                  />
                  <path
                    fillRule='evenodd'
                    clipRule='evenodd'
                    d='M33.8639 0H33.9149H33.9659C33.9699 0.00937231 33.9719 0.0193679 33.9719 0.029541C33.9719 0.0397141 33.9699 0.0499163 33.9659 0.0592886C33.9706 0.0787559 33.9706 0.0989034 33.9659 0.118371L33.1669 4.88232C33.1411 5.04048 33.0598 5.18438 32.9374 5.28846C32.8156 5.39643 32.6585 5.45655 32.4954 5.45765H27.2084H27.1489H27.0979V5.40683C27.0979 5.40683 27.0979 5.40698 27.0979 5.34775L27.8884 0.583797C27.9138 0.421135 27.9985 0.27351 28.1264 0.169189C28.2482 0.0621858 28.406 0.0048337 28.5684 0.0084698L33.8639 0Z'
                    fill='#0CBF9F'
                  />
                  <path
                    fillRule='evenodd'
                    clipRule='evenodd'
                    d='M27.6844 7.32764C27.5171 7.32816 27.3562 7.39181 27.2339 7.5055C27.1067 7.61279 27.0248 7.76384 27.0044 7.92858L25.3044 21.8478C25.3044 21.8478 25.3044 21.8478 25.3044 21.8986C25.2986 21.915 25.2986 21.9328 25.3044 21.9492C25.3181 21.9544 25.3332 21.9544 25.3469 21.9492H25.4064H30.6679C30.8364 21.9499 30.9995 21.8898 31.1269 21.78C31.25 21.6659 31.3308 21.5139 31.3564 21.3485L33.0564 7.43774C33.0606 7.41821 33.0606 7.39799 33.0564 7.37846C33.0564 7.37846 33.0564 7.37841 33.0564 7.32764H33.0054H27.6844Z'
                    fill='#0CBF9F'
                  />
                </g>
                <defs>
                  <clipPath id='clip0_6961_4266'>
                    <rect width='34' height='22' fill='white' />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <span className={styles.headerTitle}>
              {I18N.carbonFootPrintLCA.rating}
            </span>
          </div>
          <CloseOutlined className={styles.closeIcon} onClick={handleClose} />
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalBodyHeader}>
            <div className={styles.description}>
              {I18N.esg.pleaseUploadYour}
            </div>
            <Dropdown
              trigger={['click']}
              overlayClassName={styles.esgReportDropdown}
              placement='bottomRight'
              menu={{
                items: esgReportList.map(report => ({
                  key: report.id,
                  label: (
                    <div className={styles.reportItem}>
                      <div
                        className={styles.reportName}
                        title={report.reportName}
                      >
                        {report.reportName}
                      </div>
                      <div className={styles.reportInfoRow}>
                        <div className={styles.reportInfo}>
                          {I18N.esg.year}
                          {report.period}
                        </div>
                        <div
                          className={classNames(
                            styles.reportInfo,
                            styles.reportCreatorInfo,
                          )}
                          title={report.createUserName}
                        >
                          {I18N.Certification.creator}
                          {report.createUserName}
                        </div>
                      </div>
                    </div>
                  ),
                  onClick: ({ key }) => setEsgReportId(Number(key)),
                })),
              }}
            >
              <Button className={styles.selectReportBtn}>
                {I18N.esg.pleaseSelectEs}
              </Button>
            </Dropdown>
          </div>

          {esgReport && (
            <div className={styles.customFileItem}>
              <div className={styles.fileLeft}>
                <div className={styles.fileIcon}>
                  <IconAlibabaNew
                    style={{
                      fontSize: 32,
                    }}
                    type='icon-guanlian'
                  />
                </div>
                <span className={styles.fileName} title={esgReport.reportName}>
                  {esgReport.reportName}
                </span>
              </div>
              <div className={styles.fileRight}>
                <span
                  className={styles.actionText}
                  onClick={() => setEsgReportId(undefined)}
                >
                  {I18N.carbonFootprint.delete}
                </span>
              </div>
            </div>
          )}
          <div className={styles.uploadSection}>
            <div className={styles.uploadArea}>
              <Upload.Dragger
                className={styles.upload}
                name='file'
                accept='.pdf,.PDF,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png'
                action={`${
                  process.env.REACT_APP_API_URL || ''
                }/file/file/uploadImg`}
                fileList={files}
                showUploadList={{
                  showPreviewIcon: false,
                  showRemoveIcon: false,
                }}
                disabled={files.length >= 20}
                itemRender={itemRender}
                beforeUpload={uploadFile => {
                  if (uploadFile.size > 50 * 1024 * 1024) {
                    Toast('error', I18N.esg.theFileSizeIsIncorrect);
                    return Upload.LIST_IGNORE;
                  }
                  if (files.length >= 20) {
                    Toast('error', I18N.esg.atMostItCanOnlyBeAccessed2);
                    return Upload.LIST_IGNORE;
                  }
                  return true;
                }}
                onChange={async info => {
                  // 检查文件总数，确保不超过 20 个
                  if (info.fileList.length > 20) {
                    // 节流处理：如果距离上次显示 Toast 的时间小于 2 秒，则不显示
                    const now = Date.now();
                    if (now - lastToastTimeRef.current > 2000) {
                      Toast('error', I18N.esg.atMostItCanOnlyBeAccessed);
                      lastToastTimeRef.current = now;
                    }
                    // 只保留前 20 个文件
                    const limitedFileList = info.fileList.slice(0, 20);
                    setFiles(limitedFileList);
                    return;
                  }
                  // Upload.LIST_IGNORE 会确保被阻止的文件不会出现在 fileList 中
                  setFiles(info.fileList);

                  // 检测第一次上传成功的情况（非编辑模式）
                  if (
                    !editId &&
                    !hasCalledAiApiRef.current &&
                    info.fileList.length === 1 &&
                    info.fileList[0].status === 'done'
                  ) {
                    const firstFile = info.fileList[0];
                    const fileUrl =
                      (firstFile.response as { data?: string })?.data ||
                      firstFile.url;

                    if (fileUrl) {
                      hasCalledAiApiRef.current = true; // 标记已调用

                      try {
                        // 调用 AI 接口获取企业信息
                        const aiResponse = await aiAsBusinessInfo({
                          referFiles: [
                            {
                              name: firstFile.name || '',
                              url: fileUrl,
                              content: (firstFile as any).content || '',
                            },
                          ],
                        });

                        const businessInfo =
                          extractAiAsBusinessInfo(aiResponse);

                        if (businessInfo) {
                          // 获取表单当前值
                          const currentFormValues = form.getFieldsValue();
                          const fieldsToUpdate: Record<string, any> = {};

                          // 只有当 businessInfo 中有值且 form 中没有值时才回填
                          if (
                            businessInfo.name &&
                            !currentFormValues?.companyName
                          ) {
                            fieldsToUpdate.companyName = businessInfo.name;
                          }

                          if (businessInfo.year && !currentFormValues?.year) {
                            fieldsToUpdate.year = Number(businessInfo.year);
                          }

                          if (businessInfo.industry) {
                            const industryId = Number(businessInfo.industry);
                            if (!currentFormValues?.industry) {
                              fieldsToUpdate.industry = industryId;
                              setSelectedIndustryId(industryId);
                            }
                          }

                          if (businessInfo.industrySub) {
                            const subIndustryId = Number(
                              businessInfo.industrySub,
                            );
                            if (!currentFormValues?.subIndustry) {
                              fieldsToUpdate.subIndustry = subIndustryId;
                              setSelectedSubIndustryId(subIndustryId);
                            }
                          }

                          // 只有当有字段需要更新时才回填
                          if (Object.keys(fieldsToUpdate).length > 0) {
                            form.setFieldsValue(fieldsToUpdate);
                            message.success(I18N.esg.aiHasAutomatically);
                          }
                        }
                      } catch (error) {
                        // eslint-disable-next-line no-console
                        console.error(I18N.esg.aiAnalysisEnterprise, error);
                        // 不显示错误提示，静默失败，用户可以手动填写
                      }
                    }
                  }
                }}
                multiple
              >
                <div className={styles.uploadContent}>
                  <div className={styles.uploadText}>
                    <svg
                      className={styles.uploadIcon}
                      xmlns='http://www.w3.org/2000/svg'
                      width='16'
                      height='16'
                      viewBox='0 0 16 16'
                      fill='none'
                    >
                      <path
                        d='M8.03027 7.8418L8.04492 7.84277L8.06152 7.84473L8.08008 7.84668L8.09277 7.84863L8.11328 7.85156L8.12305 7.85352L8.14355 7.8584L8.1543 7.86035L8.17383 7.86621L8.18457 7.86914C8.1905 7.87094 8.1972 7.87302 8.20312 7.875L8.21484 7.87891L8.23145 7.88477L8.25879 7.89648L8.27441 7.90332L8.30371 7.91797L8.31348 7.92383C8.31958 7.92724 8.32611 7.93 8.33203 7.93359L8.34082 7.93945C8.34674 7.94294 8.3527 7.94637 8.3584 7.9502L8.36719 7.95703C8.37361 7.96085 8.38135 7.96629 8.38477 7.96875C8.388 7.97108 8.38932 7.97261 8.39453 7.97656C8.39968 7.98047 8.40518 7.9842 8.41016 7.98828L8.42188 7.99805L8.43359 8.00879C8.4406 8.01525 8.44825 8.0215 8.45508 8.02832L10.6035 10.1768C10.7246 10.2981 10.7931 10.4624 10.793 10.6338C10.7928 10.8052 10.7238 10.9697 10.6025 11.0908C10.4811 11.212 10.3161 11.2805 10.1445 11.2803C9.97316 11.2799 9.80853 11.2112 9.6875 11.0898L8.64648 10.0488V14.2891C8.64648 14.4604 8.57817 14.6249 8.45703 14.7461C8.33582 14.8673 8.17141 14.9355 8 14.9355C7.82855 14.9355 7.66421 14.8673 7.54297 14.7461C7.42175 14.6249 7.35352 14.4605 7.35352 14.2891V10.0498L6.31152 11.0908C6.19031 11.2122 6.02602 11.2801 5.85449 11.2803C5.68291 11.2804 5.51792 11.213 5.39648 11.0918C5.27522 10.9707 5.2073 10.8061 5.20703 10.6348C5.20688 10.4632 5.27525 10.2982 5.39648 10.1768L7.54004 8.03027L7.54297 8.02832C7.5497 8.0216 7.55657 8.01517 7.56348 8.00879L7.57617 7.99805L7.58789 7.98828L7.6123 7.96875C7.61787 7.96462 7.62414 7.96098 7.62988 7.95703L7.6377 7.9502C7.6438 7.94624 7.65038 7.94304 7.65625 7.93945L7.66504 7.93359L7.68262 7.92383L7.69238 7.91797L7.70996 7.90918L7.7207 7.90332L7.73633 7.89648L7.75098 7.89062L7.76465 7.88477L7.78027 7.87891L7.79297 7.875C7.79858 7.87307 7.80459 7.87091 7.81055 7.86914L7.82227 7.86621L7.8418 7.86035L7.85156 7.8584L7.87207 7.85352L7.88281 7.85156L7.90332 7.84863L7.91504 7.84668L7.93457 7.84473L7.95117 7.84277L7.96582 7.8418C7.98712 7.84072 8.00898 7.84072 8.03027 7.8418ZM8.01172 2C9.20723 2.00087 10.3699 2.39194 11.3232 3.11328C12.2767 3.83468 12.9691 4.84769 13.2949 5.99805C14.0239 6.2948 14.6595 6.78301 15.1338 7.41113C15.6159 8.05328 15.909 8.81749 15.9814 9.61719C16.0538 10.4168 15.9028 11.2212 15.5439 11.9395C15.1851 12.6576 14.633 13.2613 13.9502 13.6836C13.2672 14.1059 12.4797 14.33 11.6768 14.3301C11.5054 14.3301 11.341 14.2618 11.2197 14.1406C11.0985 14.0194 11.0303 13.855 11.0303 13.6836C11.0303 13.5121 11.0985 13.3478 11.2197 13.2266C11.341 13.1054 11.5053 13.0371 11.6768 13.0371C13.3476 13.037 14.707 11.6781 14.707 10.0078C14.7091 9.35149 14.4961 8.71223 14.1006 8.18848C13.714 7.67558 13.1752 7.29794 12.5615 7.1084C12.451 7.07472 12.3515 7.01189 12.2734 6.92676C12.1953 6.84148 12.1411 6.7362 12.1172 6.62305C11.9171 5.68176 11.4 4.83728 10.6523 4.23145C9.90473 3.6258 8.97192 3.29548 8.00977 3.29492C7.04743 3.29442 6.11359 3.6235 5.36523 4.22852C4.61685 4.83362 4.09847 5.67796 3.89746 6.61914C3.87331 6.73249 3.81975 6.83762 3.74121 6.92285C3.66263 7.00811 3.56224 7.07022 3.45117 7.10352C2.83452 7.29067 2.29264 7.66811 1.90332 8.18164C1.50509 8.70638 1.29075 9.3481 1.29297 10.0068C1.29301 11.6777 2.65233 13.0371 4.32324 13.0371C4.49461 13.0372 4.6591 13.1054 4.78027 13.2266C4.90142 13.3478 4.96973 13.5122 4.96973 13.6836C4.96972 13.855 4.90143 14.0194 4.78027 14.1406C4.6591 14.2618 4.49461 14.33 4.32324 14.3301C3.51939 14.3301 2.73136 14.1057 2.04785 13.6826C1.36429 13.2595 0.811602 12.6542 0.453125 11.9346C0.0947226 11.2151 -0.0553759 10.4098 0.0185547 9.60938C0.0925056 8.80896 0.387939 8.04499 0.87207 7.40332C1.34968 6.77363 1.98924 6.28474 2.72266 5.99023C3.0501 4.84044 3.74389 3.82845 4.69824 3.1084C5.65263 2.38841 6.81621 1.99919 8.01172 2Z'
                        fill='#026961'
                      />
                    </svg>
                    <span>
                      {I18N.enterpriseCarbonAccount2.directlyTransferFiles}
                    </span>
                    <span className={styles.uploadClickText}>
                      {I18N.components.clickToUpload}
                    </span>
                  </div>
                  <div className={styles.uploadTip}>
                    {I18N.esg.supportUploadingW}
                  </div>
                </div>
              </Upload.Dragger>
            </div>
          </div>

          <Form form={form} layout='vertical' className={styles.form}>
            <div className={styles.formRow}>
              <Form.Item
                name='companyName'
                label={I18N.dashborad.enterpriseName}
                rules={[
                  {
                    required: true,
                    message: I18N.system.pleaseEnterTheCompany,
                  },
                ]}
                className={styles.formItem}
              >
                <Input
                  placeholder={I18N.dashborad.enterpriseName}
                  disabled={!!editId}
                />
              </Form.Item>

              <Form.Item
                name='year'
                label={I18N.esg.evaluationYear}
                rules={[
                  { required: true, message: I18N.esg.pleaseSelectEvaluation },
                ]}
                className={styles.formItem}
              >
                <Select
                  placeholder='2025'
                  disabled={!!editId}
                  options={getYear(2015, new Date().getFullYear()).map(y => ({
                    label: y.toString(),
                    value: y,
                  }))}
                />
              </Form.Item>
            </div>

            <div className={styles.formRow}>
              <Form.Item
                name='industry'
                label={I18N.dashborad.industry}
                rules={[
                  {
                    required: true,
                    message: I18N.dashborad.pleaseSelectTheAffiliation,
                  },
                ]}
                className={styles.formItem}
              >
                <Select
                  placeholder={I18N.esg.pleaseSelectIndustry}
                  options={industryOptions}
                  onChange={handleIndustryChange}
                />
              </Form.Item>

              <Form.Item
                name='subIndustry'
                label={I18N.esg.subSector}
                rules={[
                  { required: true, message: I18N.esg.pleaseSelectASubRow },
                ]}
                className={styles.formItem}
              >
                <Select
                  placeholder={I18N.esg.pleaseSelectASubRow}
                  options={subIndustryOptions}
                  disabled={
                    !selectedIndustryId || subIndustryOptions.length === 0
                  }
                  onChange={handleSubIndustryChange}
                />
              </Form.Item>
            </div>
          </Form>

          <div className={styles.topicsSection}>
            <div className={styles.topicsTitle}>
              <span>{I18N.esg.relatedTopics}</span>
              <span className={styles.topicsSubtitle}>
                {I18N.esg.asRequired}
              </span>
            </div>
            {(() => {
              if (issuesLoading) {
                return (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    {I18N.components.loading}
                  </div>
                );
              }
              if (selectedSubIndustryId) {
                return (
                  <div className={styles.pillarsContainer}>
                    {renderPillar(
                      I18N.esg.environmentalPillar,
                      '#3ab86e',
                      '#ebf8f0',
                      environment,
                      environmentTotalWeight || undefined,
                      1, // moduleType
                    )}
                    {renderPillar(
                      I18N.esg.pillarsOfSociety,
                      '#f0d56c',
                      '#fcf7e2',
                      social,
                      socialTotalWeight || undefined,
                      2, // moduleType
                    )}
                    {renderPillar(
                      I18N.esg.governancePillar,
                      '#6e9fda',
                      '#e2ecf8',
                      governance,
                      governanceTotalWeight || undefined,
                      3, // moduleType
                    )}
                  </div>
                );
              }
              return (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#999',
                  }}
                >
                  {I18N.esg.pleaseSelectTheSubFirst}
                </div>
              );
            })()}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <Button onClick={handleClose}>{I18N.carbonFootprint.cancel}</Button>
          <Button type='primary' loading={loading} onClick={handleSubmit}>
            {editId ? I18N.esg.reRating : I18N.esg.startRating}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
