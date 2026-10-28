import { request, ResponseData, IPageList } from '@src/api/request';

import {
  Request,
  Process,
  InputOutputRequest,
  ChooseInputRequest,
  ImpactAssessmentResp,
  ContributionAnalysisNode,
  ImpactAssessmentListResp,
  ImpactAssessmentPlanRequest,
  ImpactAssessmentPlanDeleteRequest,
  ProcessTreeDataResp,
  ProcessDeleteRequest,
  StructureChartResp,
  ProcessModelIORequest,
  ProcessModelIORes,
  ResearchObjectRequest,
  AllocFactorRequest,
  ChooseIOListRequest,
  IoWarn,
  AssessmentDataResp,
  DictEnumResp,
  DictEnumListRequest,
  ProcessFactorIORequest,
  SetMainResearchObjRequest,
  SaveProcessToLibRequest,
  ModelInfo,
  MatchDataRequest,
  MatchDataResp,
  SensibilityAnalysisListRequest,
  SensibilityAnalysisListResp,
  UncertaintyAnalysisCalcRequest,
  UncertaintyProgressCalcResp,
  AssessmentUncertaintyHistogramResp,
  AssessmentUncertaintyListResp,
  AssessmentVersionResp,
  ModelAuthRequest,
  SunburstDto,
  DataQualityRequest,
  AssessmentDataQualityResp,
  DataQualityRateDetailRequest,
  DataQualityRateDetailResq,
  AssessmentDataQualityProgressResp,
  CalculateInfoResp,
} from './type';
import { FactorResp } from '../components/FactorDatabase/type';
import {
  AssociationIo,
  ChooseInputOutputLibrary,
} from '../components/ProcessManageDrawer/type';
import { InputOutput } from '../components/ProcessManageTable/type';
/**
 * @description 碳足迹模型的列表
 */
export const getModelList = (params: Request) =>
  request<ResponseData<IPageList<ModelInfo>>>({
    method: 'GET',
    url: '/lca/model/page',
    params,
  });

/**
 * @description 碳足迹模型删除
 */
export const postModelDelete = (data: { id: number }) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca/model/delete',
    data,
  });

/**
 * @description 碳足迹模型复制
 */
export const postModelCopy = (data: { id: number }) =>
  request<ResponseData<ModelInfo>>({
    method: 'POST',
    url: `/lca/model/copy`,
    data,
  });

/**
 * @description 数据授权
 */
export const postModelAuth = (data: ModelAuthRequest) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: `/lca/model/dataAuth`,
    data,
  });

/** 目标与范围 */

/**
 * @description 碳足迹模型新增
 */
export const postModelAdd = (data: ModelInfo) =>
  request<ResponseData<number>>({
    method: 'POST',
    url: '/lca/model/add',
    data,
  });

/**
 * @description 碳足迹模型编辑
 */
export const postModelEdit = (data: ModelInfo) =>
  request<ResponseData<number>>({
    method: 'POST',
    url: '/lca/model/edit',
    data,
  });

/**
 * @description 碳足迹模型详情
 */
export const getModelDetail = (params: { id: number }) =>
  request<ResponseData<ModelInfo>>({
    method: 'GET',
    url: `/lca/model/${params.id}`,
    params,
  });

/** 清单分析 */
/**
 * @description 配置主要研究对象
 */
export const postSetMainResearchObj = (data: SetMainResearchObjRequest) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca/model/mainResearchObjectConfig',
    data,
  });

/**
 * @description 左侧菜单树
 */
export const getProcessTreeData = (params: {
  modelId: number;
  hidden: number;
}) =>
  request<ResponseData<ProcessTreeDataResp>>({
    method: 'GET',
    url: `/lca/model/model/tree/${params.modelId}/${params.hidden}`,
    params,
  });

/**
 * @description BOM一键建模
 */
export const postBomModel = (data: { id: number }) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca/bom/generateModel',
    data,
  });

/**
 * @description 检查模型是否建模中。返回true或false
 */
export const getCheckBomModel = (params: { modelId: number }) =>
  request<ResponseData<boolean>>({
    method: 'GET',
    url: `/lca/bom/model/check`,
    params,
  });

/**
 * @description 供应商数据建模
 */
export const postSupplyDataModel = (data: { id: number }) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca/supplierData/generateModel',
    data,
  });

/**
 * @description 检查模型是否供应商数据建模中。返回true或false
 */
export const getCheckSupplyDataModel = (params: { modelId: number }) =>
  request<ResponseData<boolean>>({
    method: 'GET',
    url: `/lca/supplierData/model/check`,
    params,
  });

/**
 * @description 手动计算
 */
export const postCalc = (data: { modelId: number }) =>
  request<ResponseData<IoWarn[]>>({
    method: 'POST',
    url: '/lca/model/calc',
    data,
  });

/**
 * @description 模型计算信息
 */
export const getModelCalcStatus = (params: { id: number }) =>
  request<ResponseData<CalculateInfoResp>>({
    method: 'GET',
    url: `/lca/model/calc/progress/${params.id}`,
    params,
  });

/**
 * @description 是否有计算错误信息（true为有错误）
 */
export const getCheckCalc = (params: { id: number }) =>
  request<ResponseData<boolean>>({
    method: 'GET',
    url: `/lca/model/calc/error/${params.id}`,
    params,
  });

/**
 * @description 保存到库
 */
export const postSaveToLibrary = (data: SaveProcessToLibRequest) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca/processLib/save2lib',
    data,
  });

/**
 * @description 过程描述-新增
 */
export const postProcessDescAdd = (data: Process) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca/process/add',
    data,
  });

/**
 * @description 过程描述-编辑
 */
export const postProcessDescEdit = (data: Process) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca/process/edit',
    data,
  });

/**
 * @description 过程描述-删除
 */
export const postProcessDescDelete = (data: ProcessDeleteRequest) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca/process/delete',
    data,
  });

/**
 * @description 过程描述-详情
 */
export const getProcessDescDetail = (params: { id: number }) =>
  request<ResponseData<Process>>({
    method: 'GET',
    url: `/lca/process/${params.id}`,
    params,
  });

/**
 * @description 过程模型列表（产品、输入、输出）
 */
export const getProcessModelList = (params: InputOutputRequest) =>
  request<ResponseData<InputOutput>>({
    method: 'GET',
    url: '/lca/model/data/process',
    params,
  });

/**
 * @description 过程模型的研究对象-编辑分配系数
 */
export const postAllocFactorEdit = (data: AllocFactorRequest) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca/io/allocFactor/edit',
    data,
  });

/**
 * @description 过程模型的输入输出-编辑研究对象
 */
export const postResearchObjectEdit = (data: ResearchObjectRequest) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca/io/researchObject/edit',
    data,
  });

/**
 * @description 过程模型的新增（输入、输出）-过程数据&模型引用
 */
export const postProcessModelIOAdd = (data: ProcessModelIORequest) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca/io/addWithProcess',
    data,
  });

/**
 * @description 过程模型的编辑（输入、输出）-过程数据&模型引用
 */
export const postProcessModelIOEdit = (data: ProcessModelIORequest) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca/io/editWithProcess',
    data,
  });

/**
 * @description 过程模型的新增（输入、输出）-自建因子
 */
export const postProcessFactorIOAdd = (data: ProcessFactorIORequest) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca/io/addWithFactor',
    data,
  });

/**
 * @description 过程模型的编辑（输入、输出）-自建因子
 */
export const postProcessFactorIOEdit = (data: ProcessFactorIORequest) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca/io/editWithFactor',
    data,
  });

/**
 * @description 过程模型的输入输出-删除
 */
export const postProcessModelIODelete = (data: { id: number }) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca/io/delete',
    data,
  });

/**
 * @description 过程模型的详情（输入、输出）- 非多重引用主输出
 */
export const getProcessModelIODetail = (params: { id: number }) =>
  request<ResponseData<ProcessModelIORes>>({
    method: 'GET',
    url: `/lca/io/${params.id}`,
    params,
  });

/**
 * @description 过程模型的详情（输入、输出）- 多重引用主输出
 */
export const getProcessModelMultipleRefIODetail = (params: { id: number }) =>
  request<ResponseData<ProcessModelIORes>>({
    method: 'GET',
    url: `/lca/io/multi/${params.id}`,
    params,
  });

/**
 * @description 输入输出列表-选择关联输入输出的弹窗
 */
export const getChooseIOList = (params: ChooseIOListRequest) =>
  request<ResponseData<IPageList<AssociationIo>>>({
    method: 'GET',
    url: '/lca/io/page',
    params,
  });

/**
 * @description 校验过程库生命周期
 */
// export const getCheckLib = (params: { modelId: number; selectLibId: number }) =>
//   request<ResponseData<{ [key: string]: any }>>({
//     method: 'GET',
//     url: '/lca/lifeCycle/checkLib',
//     params,
//   });

/**
 * @description 校验模型引用生命周期
 */
// export const getCheckModelRef = (params: {
//   modelId: number;
//   selectModelId: number;
// }) =>
//   request<ResponseData<{ [key: string]: any }>>({
//     method: 'GET',
//     url: '/lca/lifeCycle/checkModelRef',
//     params,
//   });

/**
 * @description 选择输入的弹窗
 */
export const getChooseInputList = (params: ChooseInputRequest) =>
  request<ResponseData<IPageList<ChooseInputOutputLibrary>>>({
    method: 'GET',
    url: '/carbonfootprintLca/inputOutput/renewingInputPage',
    params,
  });

/**
 * @description 因子详情id
 */
export const getFactorDetail = (params: { code: string }) =>
  request<ResponseData<FactorResp>>({
    method: 'GET',
    url: `/lca/model/data/factor`,
    params,
  });

/**
 * @description 过程结构图
 */
export const getStructureChart = (params: { modelId: number }) =>
  request<ResponseData<StructureChartResp>>({
    method: 'GET',
    url: `/lca/model/structureChart/${params.modelId}`,
    params,
  });

/**
 * @description 数据匹配-输入输出数据库数据
 */
export const getMatchData = (params: MatchDataRequest) =>
  request<ResponseData<MatchDataResp>>({
    method: 'GET',
    url: `/management/lcaDb/factor/match`,
    params,
  });
/** 影响评价 */

/**
 * @description 方案列表
 */
export const getImpactAssessmentList = (params: { modelId: number }) =>
  request<ResponseData<ImpactAssessmentListResp[]>>({
    method: 'GET',
    url: `/lca/assessment/list/${params.modelId}`,
    params,
  });

/**
 * @description 新增方案
 */
export const postImpactAssessmentListAdd = (
  data: ImpactAssessmentPlanRequest,
) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: `/lca/assessment/add`,
    data,
  });

/**
 * @description 删除方案
 */
export const postImpactAssessmentListDelete = (
  data: ImpactAssessmentPlanDeleteRequest,
) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: `/lca/assessment/delete`,
    data,
  });

/**
 * @description 去计算
 */
export const postImpactAssessmentCalc = (data: { id: number }) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: `/lca/assessment/calc`,
    data,
  });

/**
 * @description 整体影响评价结果
 */
export const getImpactAssessmentTotal = (params: { assessmentId: number }) =>
  request<ResponseData<AssessmentDataResp[]>>({
    method: 'GET',
    url: `/lca/assessment/data/list/${params.assessmentId}`,
    params,
  });

/**
 * @description 生命周期影响评价
 */
export const getImpactAssessmentData = (params: {
  assessmentId: number;
  assessmentTarget: string;
}) =>
  request<ResponseData<ImpactAssessmentResp[]>>({
    method: 'GET',
    url: `/lca/assessment/target/data/list`,
    params,
  });

/**
 * @description 生命周期影响评价-旭日图
 */
export const getImpactAssessmentDataSunburst = (params: {
  assessmentId: number;
  assessmentTarget: string;
  cutOff: number;
}) =>
  request<ResponseData<SunburstDto[]>>({
    method: 'GET',
    url: `/lca/assessment/sunburst`,
    params,
  });

/** 结果解释 */
/**
 * @description 贡献度分析
 */
export const getContributionAnalysisList = (params: { assessmentId: number }) =>
  request<ResponseData<ContributionAnalysisNode>>({
    method: 'GET',
    url: `/lca/result/contribution/${params.assessmentId}`,
    params,
  });

/**
 * @description 敏感性分析列表
 */
export const getSensibilityAnalysisList = (
  params: SensibilityAnalysisListRequest,
) =>
  request<ResponseData<SensibilityAnalysisListResp[]>>({
    method: 'GET',
    url: `/lca/result/sensibility/list`,
    params,
  });

/**
 * @description 敏感性计算
 */
export const postSensibilityCalc = (data: { id: number }) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: `/lca/result/sensibility/calc`,
    data,
  });

/**
 * @description 不确定性分析-描述
 */
export const postUncertaintyAnalysisDesc = (data: {
  /** 方案id */
  assessmentId: number;
  /** 不确定性描述 */
  uncertaintyDesc: string;
}) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: `/lca/assessment/edit`,
    data,
  });

/**
 * @description 不确定分析-计算
 */
export const postUncertaintyAnalysisCalc = (
  data: UncertaintyAnalysisCalcRequest,
) =>
  request<ResponseData<UncertaintyProgressCalcResp>>({
    method: 'POST',
    url: `/lca/result/uncertainty/calc`,
    data,
  });

/**
 * @description 不确定分析-计算进度
 */
export const getUncertaintyAnalysisCalcProgress = (params: {
  assessmentId: number;
}) =>
  request<ResponseData<UncertaintyProgressCalcResp>>({
    method: 'GET',
    url: `/lca/result/uncertainty/calc/progress`,
    params,
  });

/**
 * @description 不确定分析-柱状图
 */
export const getUncertaintyAnalysisHistogram = (params: {
  assessmentId: number;
  assessmentTarget: string;
}) =>
  request<ResponseData<AssessmentUncertaintyHistogramResp[]>>({
    method: 'GET',
    url: `/lca/result/uncertainty/histogram`,
    params,
  });

/**
 * @description 不确定分析-列表
 */
export const getUncertaintyAnalysisList = (params: { assessmentId: number }) =>
  request<ResponseData<AssessmentUncertaintyListResp[]>>({
    method: 'GET',
    url: `/lca/result/uncertainty/list`,
    params,
  });

/**
 * 查询字典枚举值
 */
export const getDictEnum = (params: DictEnumListRequest) =>
  request<ResponseData<IPageList<DictEnumResp>>>({
    method: 'GET',
    url: `/management/system/enum/listALLByDictTypeData`,
    params,
  });

/**
 * @description 计算版本是否是最新
 */
export const getVersion = (params: { assessmentId: number }) =>
  request<ResponseData<AssessmentVersionResp>>({
    method: 'GET',
    url: `/lca/assessment/version`,
    params,
  });

/**
 * 影响评价/贡献度分析的导出接口
 */
export const getExportAssessment = (params: { id: number }) =>
  request<ResponseData<string>>({
    method: 'GET',
    url: `/lca/assessment/export/${params.id}`,
    params,
  });

/**
 * 清单分析导入
 */
export const postImportList = (data: {
  fileName?: string;
  fileUrl?: string;
  modelId: number;
}) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: `/lca/model/import`,
    data,
  });

/**
 * 清单分析导出
 */
export const getExportList = (params: { modelId: number }) =>
  request<ResponseData<string>>({
    method: 'GET',
    url: `/lca/model/export/${params.modelId}`,
    params,
  });

/**
 * 结果解释-数据质量评价列表
 */
export const getDataQualityList = (params: DataQualityRequest) =>
  request<ResponseData<AssessmentDataQualityResp[]>>({
    method: 'GET',
    url: `/lca/dataQuality/list`,
    params,
  });

/**
 * 结果解释-数据质量评价-评级详情
 */
export const getDataQualityRateDetail = (
  params: DataQualityRateDetailRequest,
) =>
  request<ResponseData<DataQualityRateDetailResq>>({
    method: 'GET',
    url: `/lca/dataQuality/rating/detail`,
    params,
  });

/**
 * 结果解释-数据质量评价-评级
 */
export const getDataQualityRate = (data: DataQualityRateDetailResq) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: `/lca/dataQuality/rating`,
    data,
  });

/**
 * 结果解释-数据质量评价-计算
 */
export const getDataQualityCalc = (data: { id: number }) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: `/lca/dataQuality/calc`,
    data,
  });

/**
 * 结果解释-数据质量评价-计算进度信息
 */
export const getDataQualityCalcProcess = (params: { id: number }) =>
  request<ResponseData<AssessmentDataQualityProgressResp>>({
    method: 'GET',
    url: `/lca/dataQuality/calc/progress/${params.id}`,
    params,
  });

/**
 * 结果解释-数据质量评价-导入评分模版下载
 */
export const getDataQualityDownloadTemplate = (params: {
  /** 方案id */
  assessmentId: number;
  /** 数据质量类别 */
  dataQualityCategory: number;
}) =>
  request<{ data: Blob | MediaSource }>({
    method: 'GET',
    url: `/lca/dataQuality/downloadTemplate`,
    params,
    responseType: 'blob',
  });
/**
 * 结果解释-数据质量评价-评分-导入
 */
export const postDataQualityImport = (data: {
  /** 方案id */
  assessmentId?: number;
  /** 数据质量类别 */
  dataQualityCategory?: number;
  /** 文件名称 */
  fileName?: string;
  /** 文件地址 */
  fileUrl?: string;
}) =>
  request<ResponseData<any>>({
    method: 'POST',
    url: `/lca/dataQuality/importDataQuality`,
    data,
  });
