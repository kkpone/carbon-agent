import { request, ResponseData, IPageList } from '@src/api/request';

import {
  GeneralInfoProps,
  CbamRequest,
  SourceFlowRequest,
  SourceFlowResp,
  ProductCategoryResp,
  ProductCategoryRequest,
  ProductProcessRequest,
  CbamResultsSummaryEditRequest,
  ConfigProcessRequest,
  ConfigProcessResp,
  ConfigPrecursorRequest,
  ConfigPrecursorResp,
  PrecursorResp,
  PrecursorRequest,
  ProductProcessResp,
  ConfigProductRequest,
  ConfigProductResp,
  ConfigCNResp,
  ConfigCNRequest,
  OutsourcedPrecursorRequest,
  OutsourcedPrecursorResp,
  SaleProductRequest,
  SaleProductResp,
  DataQualityResp,
  OrderProcessRequest,
  ProcessEmissionRequest,
  ProcessEmissionResp,
  CarbonTaxRequest,
  CarbonTaxResp,
  CarbonTaxProductOption,
  CarbonTaxEmissionOption,
  CarbonTaxPrecursorOption,
  CnBenchmarkOption,
  CnBenchmarkSearchRequest,
  DefaultSale,
  HeatPowerResp,
  SupplyCollectionRequest,
  ElCalcRequest,
  EleDTO,
  ResultsSummarySunburstRequest,
  SunDTO,
  SaleTaxResultDTO,
  EdgeResultDTO,
} from './type';

/**
 * @description cbam报表列表
 */
export const getCbamList = (params: CbamRequest) =>
  request<ResponseData<IPageList<GeneralInfoProps>>>({
    method: 'GET',
    url: '/cbam2/cbam',
    params,
  });

/**
 * @description 生成报表
 */
export const postCbamReportCreate = (params: { cbamId: number }) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'GET',
    url: '/cbam2/productResult/createReport',
    params,
  });

/**
 * @description cbam报表列表-复制
 */
export const getCbamReportCopy = (params: { id: number }) =>
  request<ResponseData<ProductProcessResp>>({
    method: 'GET',
    url: `/cbam2/cbam/copy/${params?.id}`,
    params,
  });

/**
 * @description cbam报表-删除
 */
export const deleteCbamDelete = (params: { id: number }) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'DELETE',
    url: `/cbam2/cbam/${params.id}`,
    params,
  });

/**
 * @description cbam报表-新增：一般信息
 */
export const postGeneralInfoAdd = (data: GeneralInfoProps) =>
  request<ResponseData<number>>({
    method: 'POST',
    url: '/cbam2/cbam',
    data,
  });

/**
 * @description cbam报表-编辑：一般信息
 */
export const putGeneralInfoEdit = (data: GeneralInfoProps) =>
  request<ResponseData<number>>({
    method: 'PUT',
    url: '/cbam2/cbam',
    data,
  });

/**
 * @description cbam报表-详情：一般信息
 */
export const getGeneralInfoDetail = (params: { id: number }) =>
  request<ResponseData<GeneralInfoProps>>({
    method: 'GET',
    url: `/cbam2/cbam/${params.id}`,
    params,
  });

/**
 * @description cbam报表-工厂直接排放-源流列表
 */
export const getSourceFlowList = (params: SourceFlowRequest) =>
  request<ResponseData<IPageList<SourceFlowResp>>>({
    method: 'GET',
    url: '/cbam2/sourceFlow',
    params,
  });

/**
 * @description cbam报表-工厂直接排放-源流列表-删除
 */
export const deleteSourceFlowDelete = (params: { id: number }) =>
  request<ResponseData<boolean>>({
    method: 'DELETE',
    url: `/cbam2/sourceFlow/${params.id}`,
    params,
  });

/**
 * @description cbam报表-工厂直接排放-源流列表-详情
 */
export const getSourceFlowDetail = (params: { id: number }) =>
  request<ResponseData<SourceFlowResp>>({
    method: 'GET',
    url: `/cbam2/sourceFlow/${params.id}`,
    params,
  });

/**
 * @description cbam报表-工厂直接排放-源流列表-新增
 */
export const postSourceFlowAdd = (data: SourceFlowResp) =>
  request<ResponseData<boolean>>({
    method: 'POST',
    url: '/cbam2/sourceFlow',
    data,
  });

/**
 * @description cbam报表-工厂直接排放-源流列表-编辑
 */
export const putSourceFlowEdit = (data: SourceFlowResp) =>
  request<ResponseData<boolean>>({
    method: 'PUT',
    url: '/cbam2/sourceFlow',
    data,
  });

/**
 * @description cbam报表-产品和前驱体-产品类别列表
 */
export const getProductCategoryList = (params: ProductCategoryRequest) =>
  request<ResponseData<IPageList<ProductCategoryResp>>>({
    method: 'GET',
    url: '/cbam2/product',
    params,
  });

/**
 * @description cbam报表-产品和前驱体-产品类别列表-删除
 */
export const deleteProductCategoryDelete = (params: { id: number }) =>
  request<ResponseData<boolean>>({
    method: 'DELETE',
    url: `/cbam2/product/${params.id}`,
    params,
  });

/**
 * @description cbam报表-产品和前驱体-产品类别列表-详情
 */
export const getProductCategoryDetail = (params: { id: number }) =>
  request<ResponseData<ProductCategoryResp>>({
    method: 'GET',
    url: `/cbam2/product/${params.id}`,
    params,
  });

/**
 * @description cbam报表-产品和前驱体-产品类别列表-新增
 */
export const postProductCategoryAdd = (data: ProductCategoryResp) =>
  request<ResponseData<boolean>>({
    method: 'POST',
    url: '/cbam2/product',
    data,
  });

/**
 * @description cbam报表-产品和前驱体-产品类别列表-编辑
 */
export const putProductCategoryEdit = (data: ProductCategoryResp) =>
  request<ResponseData<boolean>>({
    method: 'PUT',
    url: '/cbam2/product',
    data,
  });

/**
 * @description 参数配置-产品分类的生产工序列表（生产路线）
 */
export const getConfigProcessList = (params: ConfigProcessRequest) =>
  request<ResponseData<IPageList<ConfigProcessResp>>>({
    method: 'GET',
    url: '/cbam2/defaultProcess',
    params,
  });

/**
 * @description 参数配置-产品分类的相关前驱体列表（相关前驱体）
 */
export const getConfigPrecursorList = (params: ConfigPrecursorRequest) =>
  request<ResponseData<IPageList<ConfigPrecursorResp>>>({
    method: 'GET',
    url: '/cbam2/defaultPrecursor',
    params,
  });

/**
 * @description 参数配置-产品分类的包含产品列表（包含的产品类别）
 */
export const getConfigProductList = (params: ConfigProductRequest) =>
  request<ResponseData<IPageList<ConfigProductResp>>>({
    method: 'GET',
    url: '/cbam2/defaultProduct',
    params,
  });

/**
 * @description 参数配置-产品分类的CN编码及名称列表（CN编码）
 */
export const getCNList = (params: ConfigCNRequest) =>
  request<ResponseData<IPageList<ConfigCNResp>>>({
    method: 'GET',
    url: '/cbam2/defaultCn',
    params,
  });

/**
 * @description 前体默认CN详情
 */
export const getCNDetail = (params: {
  id: number;
  originCountryValue?: string;
}) =>
  request<ResponseData<ConfigCNResp>>({
    method: 'GET',
    url: `/cbam2/defaultCn/${params.id}`,
    params: {
      originCountryValue: params.originCountryValue,
    },
  });

/**
 * @description cbam报表-产品和前驱体-前驱体列表
 */
export const getPrecursorList = (params: PrecursorRequest) =>
  request<ResponseData<IPageList<PrecursorResp>>>({
    method: 'GET',
    url: '/cbam2/productPrecursor',
    params,
  });

/**
 * @description cbam报表-产品和前驱体-前驱体列表-删除
 */
export const deletePrecursorDelete = (params: { id: number }) =>
  request<ResponseData<boolean>>({
    method: 'DELETE',
    url: `/cbam2/productPrecursor/${params.id}`,
    params,
  });

/**
 * @description cbam报表-产品和前驱体-前驱体列表-详情
 */
export const getPrecursorDetail = (params: { id: number }) =>
  request<ResponseData<PrecursorResp>>({
    method: 'GET',
    url: `/cbam2/productPrecursor/${params.id}`,
    params,
  });

/**
 * @description cbam报表-产品和前驱体-前驱体列表-新增
 */
export const postPrecursorAdd = (data: PrecursorResp) =>
  request<ResponseData<boolean>>({
    method: 'POST',
    url: '/cbam2/productPrecursor',
    data,
  });

/**
 * @description cbam报表-产品和前驱体-前驱体列表-编辑
 */
export const putPrecursorEdit = (data: PrecursorResp) =>
  request<ResponseData<boolean>>({
    method: 'PUT',
    url: '/cbam2/productPrecursor',
    data,
  });

/**
 * @description cbam报表-结果汇总-详情接口
 */
export const getResultsSummaryDetailApi = (params: { id: number }) =>
  request<ResponseData<SourceFlowResp>>({
    method: 'GET',
    url: `/cbam2/productResult/${params.id}`,
    params,
  });

/**
 * @description cbam报表-结果汇总-编辑接口
 */
export const updateResultsSummaryEditApi = (
  data: CbamResultsSummaryEditRequest,
) =>
  request<ResponseData<boolean>>({
    method: 'PUT',
    url: '/cbam2/productResult',
    data,
  });

/**
 * @description cbam报表-结果汇总-新增接口
 */
export const postResultsSummaryAddApi = (
  data: Omit<CbamResultsSummaryEditRequest, 'id'>,
) =>
  request<ResponseData<boolean>>({
    method: 'POST',
    url: '/cbam2/productResult',
    data,
  });

/* -----------------------------------------new----------------------------------------- */

/**
 *  @description cbam报表-工业过程-自厂工序信息表列表
 *  @description cbam报表-产品数据-自厂工序产品数据列表
 */
export const getProductProcessListApi = (params: ProductProcessRequest) =>
  request<ResponseData<ProductProcessResp[]>>({
    method: 'GET',
    url: '/cbam2/productProcess',
    params,
  });

/**
 * @description cbam报表-工业过程-自厂工序信息表列表-删除
 */
export const deleteProductProcessDelete = (params: { id: number }) =>
  request<ResponseData<boolean>>({
    method: 'DELETE',
    url: `/cbam2/productProcess/${params.id}`,
    params,
  });

/**
 * @description cbam报表-工业过程-自厂工序信息表列表-详情
 */
export const getProductProcessDetail = (params: { id: number }) =>
  request<ResponseData<ProductProcessResp>>({
    method: 'GET',
    url: `/cbam2/productProcess/${params.id}`,
    params,
  });

/**
 * @description cbam报表-工业过程-自厂工序信息表列表-复制
 */
export const getProductProcessCopy = (params: { id: number }) =>
  request<ResponseData<ProductProcessResp>>({
    method: 'GET',
    url: `/cbam2/productProcess/copyProcess`,
    params,
  });

/**
 * @description cbam报表-工业过程-自厂工序信息表列表-新增
 */
export const postProductProcessAdd = (data: ProductProcessResp) =>
  request<ResponseData<boolean>>({
    method: 'POST',
    url: '/cbam2/productProcess',
    data,
  });

/**
 * @description cbam报表-工业过程-自厂工序信息表列表-编辑
 */
export const putProductProcessEdit = (data: ProductProcessResp) =>
  request<ResponseData<boolean>>({
    method: 'PUT',
    url: '/cbam2/productProcess',
    data,
  });

/**
 *  @description cbam报表-工业过程-外购前体信息表列表
 *  @description cbam报表-产品数据-外购前体产品数据列表
 */
export const getOutsourcedPrecursorListApi = (
  params: OutsourcedPrecursorRequest,
) =>
  request<ResponseData<OutsourcedPrecursorResp[]>>({
    method: 'GET',
    url: '/cbam2/productPrecursor',
    params,
  });

/**
 * @description cbam报表-工业过程-外购前体信息表列表-删除
 */
export const deleteOutsourcedPrecursorDelete = (params: { id: number }) =>
  request<ResponseData<boolean>>({
    method: 'DELETE',
    url: `/cbam2/productPrecursor/${params.id}`,
    params,
  });

/**
 * @description cbam报表-工业过程-外购前体信息表列表-详情
 */
export const getOutsourcedPrecursorDetail = (params: { id: number }) =>
  request<ResponseData<OutsourcedPrecursorResp>>({
    method: 'GET',
    url: `/cbam2/productPrecursor/${params.id}`,
    params,
  });

/**
 * @description cbam报表-工业过程-外购前体信息表列表-复制
 */
export const getOutsourcedPrecursorCopy = (params: { id: number }) =>
  request<ResponseData<OutsourcedPrecursorResp>>({
    method: 'GET',
    url: `/cbam2/productPrecursor/copyPre`,
    params,
  });

/**
 * @description cbam报表-工业过程-外购前体信息表列表-新增
 */
export const postOutsourcedPrecursorAdd = (data: OutsourcedPrecursorResp) =>
  request<ResponseData<boolean>>({
    method: 'POST',
    url: '/cbam2/productPrecursor',
    data,
  });

/**
 * @description cbam报表-工业过程-外购前体信息表列表-编辑
 */
export const putOutsourcedPrecursorEdit = (data: OutsourcedPrecursorResp) =>
  request<ResponseData<boolean>>({
    method: 'PUT',
    url: '/cbam2/productPrecursor',
    data,
  });

/**
 * @description cbam报表-工业过程-外购前体信息表列表-发起供应商收数
 */
export const postOutsourcedPrecursorSupplyCollection = (
  data: SupplyCollectionRequest,
) =>
  request<ResponseData<boolean>>({
    method: 'POST',
    url: `/cbam2/supplyInfo`,
    data,
  });

/**
 * @description cbam报表-工业过程-排序
 * 工序1 前体2
 */
export const postOrderProcess = (data: OrderProcessRequest) =>
  request<ResponseData<boolean>>({
    method: 'POST',
    url: `/cbam2/productProcess/orderProcess`,
    data,
  });

/**
 *  @description cbam报表-工业过程-过程直接排放列表
 */
export const getProcessEmissionListApi = (params: ProcessEmissionRequest) =>
  request<ResponseData<ProcessEmissionResp[]>>({
    method: 'GET',
    url: '/cbam2/sourceFlow',
    params,
  });

/**
 * @description cbam报表-工业过程-过程直接排放-删除
 */
export const deleteProcessEmissionDelete = (params: { id: number }) =>
  request<ResponseData<boolean>>({
    method: 'DELETE',
    url: `/cbam2/sourceFlow/${params.id}`,
    params,
  });

/**
 * @description cbam报表-产品数据-自厂工序产品数据列表-详情
 */
export const getProductDataProcessDetail = (params: { id: number }) =>
  request<ResponseData<ProductProcessResp>>({
    method: 'GET',
    url: `/cbam2/productProcess/processDataInfo/${params.id}`,
    params,
  });

/**
 * @description cbam报表-产品数据-自厂工序产品数据列表-编辑(配置数据)
 */
export const postProductDataProcessEdit = (data: ProductProcessResp) =>
  request<ResponseData<boolean>>({
    method: 'POST',
    url: '/cbam2/productProcess/fillProcessData',
    data,
  });

/**
 * @description cbam报表-产品数据-自厂工序产品数据列表-编辑(配置数据)-计算电力
 */
export const postProductDataProcessElCalc = (data: ElCalcRequest) =>
  request<ResponseData<EleDTO>>({
    method: 'POST',
    url: '/cbam2/productProcess/addEleCalculator',
    data,
  });

/**
 * @description cbam报表-产品数据-外购前体产品数据列表-详情
 */
export const getProductOutsourcedPrecursorDetail = (params: { id: number }) =>
  request<ResponseData<OutsourcedPrecursorResp>>({
    method: 'GET',
    url: `/cbam2/productPrecursor/processDataInfo/${params.id}`,
    params,
  });

/**
 * @description cbam报表-产品数据-外购前体产品数据列表-编辑(配置数据)
 */
export const postProductOutsourcedPrecursorEdit = (
  data: OutsourcedPrecursorResp,
) =>
  request<ResponseData<boolean>>({
    method: 'POST',
    url: '/cbam2/productPrecursor/fillProcessData',
    data,
  });

/**
 * @description cbam报表-热电联产-详情
 */
export const getHeatPowerDetail = (params: { cbamId: number }) =>
  request<ResponseData<HeatPowerResp>>({
    method: 'GET',
    url: `/cbam2/productProcess/getHotEleInfo`,
    params,
  });

/**
 * @description cbam报表-热电联产-编辑
 */
export const putHeatPowerEdit = (data: HeatPowerResp) =>
  request<ResponseData<HeatPowerResp>>({
    method: 'PUT',
    url: '/cbam2/productProcess/putHotEle',
    data,
  });

/**
 *  @description cbam报表-外售产品信息列表
 */
export const getSaleProductListApi = (params: SaleProductRequest) =>
  request<ResponseData<SaleProductResp[]>>({
    method: 'GET',
    url: '/cbam2/saleProduct',
    params,
  });

/**
 * @description cbam报表-外售产品信息列表-删除
 */
export const deleteSaleProductDelete = (params: { id: number }) =>
  request<ResponseData<boolean>>({
    method: 'DELETE',
    url: `/cbam2/saleProduct/${params.id}`,
    params,
  });

/**
 * @description cbam报表-外售产品信息列表-详情
 */
export const getSaleProductDetail = (params: { id: number }) =>
  request<ResponseData<SaleProductResp>>({
    method: 'GET',
    url: `/cbam2/saleProduct/${params.id}`,
    params,
  });

/**
 * @description cbam报表-外售产品信息列表-新增
 */
export const postSaleProductAdd = (data: SaleProductResp) =>
  request<ResponseData<boolean>>({
    method: 'POST',
    url: '/cbam2/saleProduct',
    data,
  });

/**
 * @description cbam报表-外售产品信息列表-编辑
 */
export const putSaleProductEdit = (data: SaleProductResp) =>
  request<ResponseData<boolean>>({
    method: 'PUT',
    url: '/cbam2/saleProduct',
    data,
  });

/**
 * @description cbam报表-外售产品信息列表-获取参数配置的外售产品信息字段配置
 */
export const getConfigSale = (params: { productCategoryId: number }) =>
  request<ResponseData<DefaultSale[]>>({
    method: 'GET',
    url: `/cbam2/defaultSale`,
    params,
  });

/**
 *  @description cbam报表-碳税计算列表
 */
export const getCarbonTaxListApi = (params: CarbonTaxRequest) =>
  request<ResponseData<CarbonTaxResp[]>>({
    method: 'GET',
    url: '/cbam2/saleTax',
    params,
  });

/**
 * @description cbam报表-碳税计算-新增
 */
export const postCarbonTaxAdd = (data: CarbonTaxResp) =>
  request<ResponseData<CarbonTaxResp>>({
    method: 'POST',
    url: '/cbam2/saleTax',
    data,
  });

/**
 * @description cbam报表-碳税计算-编辑
 */
export const putCarbonTaxEdit = (data: CarbonTaxResp) =>
  request<ResponseData<CarbonTaxResp>>({
    method: 'PUT',
    url: `/cbam2/saleTax/${data.id}`,
    data,
  });

export const deleteCarbonTax = (id: number) =>
  request<ResponseData<boolean>>({
    method: 'DELETE',
    url: `/cbam2/saleTax/${id}`,
  });

export const getCarbonTaxDetail = (id: number) =>
  request<ResponseData<CarbonTaxResp>>({
    method: 'GET',
    url: `/cbam2/saleTax/${id}`,
  });

export const getAuthCarbonTaxDetail = (id: number) =>
  request<ResponseData<CarbonTaxResp>>({
    method: 'GET',
    url: `/cbam2/saleTax/auth/${id}`,
  });

export const putCarbonTaxReportSelection = (id: number) =>
  request<ResponseData<boolean>>({
    method: 'PUT',
    url: `/cbam2/saleTax/${id}/reportSelection`,
  });

export const getCarbonTaxProductOptions = (cbamId: number) =>
  request<ResponseData<CarbonTaxProductOption[]>>({
    method: 'GET',
    url: '/cbam2/saleTax/productOptions',
    params: { cbamId },
  });

export const getCarbonTaxEmissionOptions = (params: {
  cbamId: number;
  saleProductId: number;
  emissionValueType: number;
}) =>
  request<ResponseData<CarbonTaxEmissionOption[]>>({
    method: 'GET',
    url: '/cbam2/saleTax/emissionOptions',
    params,
  });

export const getCarbonTaxPrecursorOptions = (params: {
  cbamId: number;
  saleProductId: number;
}) =>
  request<ResponseData<CarbonTaxPrecursorOption[]>>({
    method: 'GET',
    url: '/cbam2/saleTax/precursorOptions',
    params,
  });

export const getCnBenchmarkOptions = (cnCode: string) =>
  request<ResponseData<CnBenchmarkOption[]>>({
    method: 'GET',
    url: `/cbam2/cnBenchmark/${encodeURIComponent(cnCode)}`,
  });

export const getCnBenchmarkPage = (params: CnBenchmarkSearchRequest) =>
  request<ResponseData<IPageList<CnBenchmarkOption>>>({
    method: 'GET',
    url: '/cbam2/cnBenchmark/page',
    params,
  });

export const exportCarbonTax = (cbamId: number) =>
  request<Blob>({
    method: 'GET',
    url: '/cbam2/saleTax/export',
    params: { cbamId },
    responseType: 'blob',
  });

/**
 *  @description cbam报表-碳税计算列表-页面计算状态
 *  @description cbam报表-结果汇总-页面计算状态
 */
export const getCarbonTaxStatus = (params: { cbamId: number }) =>
  request<ResponseData<number>>({
    method: 'GET',
    url: `/cbam2/saleTax/isCal/${params.cbamId}`,
    params,
  });

/**
 *  @description cbam报表-碳税计算列表-计算
 *  @description cbam报表-结果汇总-计算
 */
export const getCarbonTaxCalc = (params: { cbamId: number }) =>
  request<ResponseData<number>>({
    method: 'GET',
    url: `/cbam2/saleProduct/calSaleProduct`,
    params,
  });

/**
 * @description cbam报表-数据质量及其他-详情
 */
export const getDataQualityDetail = (params: { id: number }) =>
  request<ResponseData<DataQualityResp>>({
    method: 'GET',
    url: `/cbam2/productResult/${params.id}`,
    params,
  });

/**
 * @description cbam报表-数据质量及其他-新增
 */
export const postDataQualityAdd = (data: DataQualityResp) =>
  request<ResponseData<boolean>>({
    method: 'POST',
    url: '/cbam2/productResult',
    data,
  });

/**
 * @description cbam报表-数据质量及其他-编辑
 */
export const putDataQualityEdit = (data: DataQualityResp) =>
  request<ResponseData<boolean>>({
    method: 'PUT',
    url: '/cbam2/productResult',
    data,
  });

/**
 * @description cbam报表-结果汇总-过程排放明细（旭日图）
 */
export const getResultsSummarySunburst = (
  params: ResultsSummarySunburstRequest,
) =>
  request<ResponseData<SunDTO[]>>({
    method: 'GET',
    url: `/cbam2/productResult/getSun`,
    params,
  });

/**
 * @description cbam报表-结果汇总-前置工序排放情况（柱状堆叠图）
 */
export const getResultsSummaryPreEmission = (
  params: ResultsSummarySunburstRequest,
) =>
  request<ResponseData<SunDTO[]>>({
    method: 'GET',
    url: `/cbam2/productResult/getPreEmission`,
    params,
  });

/**
 * @description cbam报表-结果汇总-TOP10预估需净缴纳碳税产品（柱状堆叠图）
 */
export const getResultsSummaryTop = (params: { cbamId: number }) =>
  request<ResponseData<SaleTaxResultDTO[]>>({
    method: 'GET',
    url: `/cbam2/productResult/getTop10`,
    params,
  });

/**
 * @description 工序过程流程图数据
 */
export const getProcessResultEdge = (params: { cbamId: number }) =>
  request<ResponseData<EdgeResultDTO>>({
    method: 'GET',
    url: `/cbam2/productResult/resultEdge`,
    params,
  });
