/**
 * @file 国际版接口
 */

import { requestPython as http } from '@api/request';
import { Dictionary } from '@typings/index';
import { genFormData, shakingObj } from '@utils/index';
import { AxiosPromise, Method } from 'axios';

import {
  AddEmissionSelectItemPayload,
  AllCarbonInfoRealtionsResponse,
  BackendPageResponse,
  BackendRes,
  BackendResponse,
  BoundarytableResponse,
  CarbonEmissionInfoIndex,
  CarbonEmissionInfoResponse,
  CarbonInfosPayload,
  CarbonInfosResponse,
  CarbonInternationalHomePageOptionResponse,
  CreateCarbonInfoRelationsPayload,
  CreateEmissionSourceDataPayload,
  GetOrganizationListArgsResponse,
  InternationalEmmitionTableParams,
  OrganizationsCreateResponse,
  OrganizationsSelectorResponse,
  BackGroundImg,
  EmissionSourceDataRelySerializersEmissionSourceDataRelySerializers,
  EmissionSourceIntCreateSerializersEmissionSourceIntCreateSerializersPayload,
  EmissionSourceIntListSerializersEmissionSourceIntListSerializersPayload,
  EmissionSourceIntListSerializersEmissionSourceIntListSerializersRes,
  ExhaustGasIntListSerializers,
  FacilityIntCreateSerializersFacilityIntCreateSerializersPayload,
  ReportCoverPayload,
  ReportCovers,
  EmissionInfoValues,
  ReportData,
  ReportDataResponse,
  ReportSubjectInfo,
  AllEmissionData,
} from './types';

// S 获取首页全部数据
export function getAlldata(params: CarbonEmissionInfoIndex): BackendRes<any> {
  return http({
    url: '/carbon_inventory_int/carbon_emission_info_index/',
    params,
  });
}

// S 首页下拉框
export const getHomePageOption =
  (): CarbonInternationalHomePageOptionResponse =>
    http({
      url: '/carbon_inventory_int/organization_info_carbon_emission_info/',
    });
// 上传封面
export const ReportCover = ({
  id,
  ...obj
}: ReportCoverPayload): BackendRes<any> => {
  const f = genFormData(obj);

  return http({
    method: 'put',
    url: `/carbon_inventory_int/report_cover/${id}/`,
    data: f,
  });
};

// 获取封面
export const getReportCover = (id: number): BackendRes<ReportCovers> =>
  http({ url: `/carbon_inventory_int/report_cover/${id}/` });

// 获取所有的封面
export const getAllBackgroundImgs = (): BackendRes<BackGroundImg[]> =>
  http({
    url: '/carbon_inventory_int/background_img/',
  });
/* 通用版修改 2021.12 2022-05-27 */
export const getEmissionSourceDataRelySerializersEmissionSourceDataRelySerializers =
  (
    edition: number | string,
  ): BackendRes<
    EmissionSourceDataRelySerializersEmissionSourceDataRelySerializers[]
  > =>
    http({
      url: `/carbon_inventory_int/emission_source_data_rely/`,
      params: { edition },
    });

export const getEmissionSourceIntListSerializersEmissionSourceIntListSerializers =
  (
    params: EmissionSourceIntListSerializersEmissionSourceIntListSerializersPayload,
  ): BackendRes<
    EmissionSourceIntListSerializersEmissionSourceIntListSerializersRes[]
  > =>
    http({
      url: `/carbon_inventory_int/emission_source_facility_int_data/`,
      params,
    });
/** 添加排放源 */
export const addEmissionSourceIntCreateSerializersEmissionSourceIntCreateSerializers =
  (
    data: EmissionSourceIntCreateSerializersEmissionSourceIntCreateSerializersPayload,
  ): BackendRes<any> =>
    http({
      data,
      method: 'post',
      url: `/carbon_inventory_int/emission_source_facility_int_data/`,
    });

export const delEmissionSourceIntCreateSerializersEmissionSourceIntCreateSerializers =
  (id: number): BackendRes<any> =>
    http({
      method: 'DELETE',
      url: `/carbon_inventory_int/emission_source_facility_int_data/${id}/`,
    });

/** 排放数据——设施/活动(创建) 2022-05-27 */
export const addFacilityIntCreateSerializersFacilityIntCreateSerializers = (
  data: FacilityIntCreateSerializersFacilityIntCreateSerializersPayload,
): BackendRes<any> =>
  http({
    method: 'post',
    data,
    url: `/carbon_inventory_int/facility_int_data/`,
  });
export const delFacilityIntCreateSerializersFacilityIntCreateSerializers = (
  id: number,
): BackendRes<any> =>
  http({
    method: 'delete',
    url: `/carbon_inventory_int/facility_int_data/${id}/`,
  });

/** 排放数据——温室气体信息(查询) 2022-05-27 */
export const getExhaustGasIntListSerializers = (params: {
  facility: number;
  emission_source: number;
  emission_category: number;
  // emission_subcategory: number;
}): BackendRes<ExhaustGasIntListSerializers[]> =>
  http({
    url: `/carbon_inventory_int/exhaust_gas_int_unit_data/`,
    params: { ...params, emission_subcategory: params.emission_category },
  });

// 保存关联关系
export const addExhaustGasIntCreateSerializersExhaustGasIntCreateSerializers = (
  data: any,
): BackendRes<any> =>
  http({
    method: 'POST',
    url: `/carbon_inventory_int/exhaust_gas_int_unit_data/`,
    data,
  });
// 修改关联关系
export const putExhaustGasIntCreateSerializersExhaustGasIntCreateSerializers = (
  /** 之前保存气体关联关系时记录的id */
  id: number | string,
  data: any,
): BackendRes<any> =>
  http({
    method: 'put',
    url: `/carbon_inventory_int/exhaust_gas_int_unit_data/${id}/`,
    data,
  });

/* 碳排放数据创建 2022-05-27 */
export const createEmissionSourceData = (
  data: CreateEmissionSourceDataPayload,
): BackendRes<any> =>
  http({
    url: '/carbon_inventory_int/emission_source_data/',
    data,
    method: 'post',
  });

/** 碳排放数据更新 */
export const putEmissionSourceData = (
  id: string | number,
  data: CreateEmissionSourceDataPayload,
): BackendRes<any> =>
  http({
    method: 'PUT',
    url: `/carbon_inventory_int/emission_source_data/${id}/`,
    data,
  });

// 国际碳核算
/* 组织信息列表 */
export const getOrganizationList = (obj: {
  g_time: string;
  organization_name: string;
  page: number;
  l_time: string;
  page_size: number;
}) =>
  http<GetOrganizationListArgsResponse>({
    url: '/carbon_inventory_int/organization_info/',
    params: shakingObj(obj),
  });

export const delOrganizationItem = (id: number) =>
  http({
    method: 'delete',
    url: `/carbon_inventory_int/organization_info/${id}/`,
  });

// 组织信息创建
export const createOrganization = (
  data: FormData, // CreateOrganizationsPayload,
): AxiosPromise<OrganizationsCreateResponse> =>
  http({
    method: 'post',
    url: '/carbon_inventory_int/organization_info/',
    data,
  });

//   组织信息修改
export const putOrganization = (
  data: FormData,
  id: number,
): AxiosPromise<OrganizationsCreateResponse> =>
  http({
    method: 'put',
    data,
    url: `/carbon_inventory_int/organization_info/${id}/`,
  });

//   组织信息查询
export const getOrganizationInfo = (
  id: number,
): AxiosPromise<{ data: Required<OrganizationsCreateResponse> }> =>
  http({
    method: 'GET',
    url: `/carbon_inventory_int/organization_info/${id}/`,
  });

export const getOrganizationSelectors =
  (): AxiosPromise<OrganizationsSelectorResponse> =>
    http({
      url: '/carbon_inventory_int/organization_info_rely/',
    });

//   部门类别创建
export const createDepartmentType = (department_name: string) =>
  http({
    url: '/carbon_inventory_int/organization_info_rely_department/',
    method: 'post',
    data: {
      department_name,
    },
  });
//   行业类别创建
export const createIndustryType = (industry_name: string) =>
  http({
    method: 'post',
    url: '/carbon_inventory_int/organization_info_rely_industry/',
    data: {
      industry_name,
    },
  });

export const delIndustryType = (id: number) =>
  http({
    method: 'delete',
    url: `/carbon_inventory_int/organization_info_rely_industry/${id}/`,
  });
// 部门类别删除
export const delDepartmentType = (id: number) =>
  http({
    method: 'delete',
    url: `/carbon_inventory_int/organization_info_rely_department/${id}/`,
  });

// 碳排放信息列表和搜索
export const getCarbonInfos = (
  params: CarbonInfosPayload,
): AxiosPromise<CarbonInfosResponse> =>
  http({
    url: '/carbon_inventory_int/carbon_emission_info/',
    params: shakingObj(params),
  });

// 复制排放信息
export const copyCarbonInfo = (
  carbon_emission_info_id: number,
): BackendRes<any> =>
  http({
    url: '/carbon_inventory_int/copy_carbon_emission_info/',
    params: { carbon_emission_info_id },
  });

export const delCarbonInfo = (id: number) =>
  http({
    method: 'delete',
    url: `/carbon_inventory_int/carbon_emission_info/${id}/`,
  });

// 碳排放信息关联删除
export const delCarbonInfoRealtion = (id: number) =>
  http({
    method: 'delete',
    url: `/carbon_inventory_int/carbon_emission_info_relation/${id}/`,
  });

// 碳排放信息关联可列表
export const getAllCarbonInfoRealtions = (params: {
  carbon_emission_info_id: number;
  edition: number;
}): AxiosPromise<AllCarbonInfoRealtionsResponse> =>
  http({
    method: 'get',
    url: '/carbon_inventory_int/carbon_emission_info_relation_list/',
    params,
  });

// 碳排放信息关联创建
export const createCarbonInfoRelations = (
  data: CreateCarbonInfoRelationsPayload,
): AxiosPromise<BackendResponse<any>> =>
  http({
    method: 'post',
    data,
    url: '/carbon_inventory_int/carbon_emission_info_relation/',
  });

// 碳排放数据依赖

// 碳排放数据依赖关联关系

// 新建排放数据添加依赖项
export const addEmissionSelectItem = (
  data: AddEmissionSelectItemPayload,
): AxiosPromise<BackendResponse<any>> =>
  http({
    method: 'post',
    url: '/carbon_inventory_int/emission_source_data_rely_create/',
    data,
  });

export const deleteEmissionSelectItem = (
  id: number | string,
  params: Pick<AddEmissionSelectItemPayload, 'rely_type'>,
): AxiosPromise<BackendResponse<any>> =>
  http({
    method: 'delete',
    url: `/carbon_inventory_int/emission_source_data_rely_create/${id}/`,
    params,
  });

// 排放数据依赖关联创建

// 排放子类别关联排放源 保存时生效

// 获取排放信息详情
export const getEmissionInfo = (id: number) =>
  http<BackendResponse<EmissionInfoValues>>({
    url: `/carbon_inventory_int/emission_source_data/${id}/`,
  });

// 下载清册报告
export const downloadCarbonEmissionInfo = (
  id: number,
  type: 'docx' | 'excel',
): AxiosPromise<CarbonEmissionInfoResponse> =>
  http({
    url: `/carbon_inventory_int/carbon_emission_info/${type}/${id}/`,
  });

// S 国际版数据汇总表
export const getSummarytable = (
  params: InternationalEmmitionTableParams,
): BackendPageResponse<AllEmissionData> =>
  http({
    url: '/carbon_inventory_int/emission_source_data/',
    params,
  });

// S 国际版排放源识别表
export const getIdentificationtable = (
  params: InternationalEmmitionTableParams,
): BackendPageResponse<any> =>
  http({
    url: '/carbon_inventory_int/emission_source_identification/',
    params,
  });
// S 国际版活动数据收集表
export const getCollectiontable = (
  params: InternationalEmmitionTableParams,
): BackendPageResponse<any> =>
  http({
    url: '/carbon_inventory_int/activity_data_collection/',
    params,
  });
// S 排放因子选择表
export const getFactortable = (
  params: InternationalEmmitionTableParams,
): BackendPageResponse<any> =>
  http({
    url: '/carbon_inventory_int/emission_factor_selection/',
    params,
  });
// S 排放量计算表
export const getCalculationtable = (
  params: InternationalEmmitionTableParams,
): BackendPageResponse<any> =>
  http({
    url: '/carbon_inventory_int/emission_calculation/',
    params,
  });
// S 温室气体排放清单
export const getGreenHouseable = (params: {
  carbon_emission_info_id?: string | number;
  edition: number;
}): BackendPageResponse<any> =>
  http({
    url: '/carbon_inventory_int/greenhouse_gas_emission/',
    params,
  });
// S 组织运营边界调查表
export const getBoundarytable = (params: {
  carbon_emission_info_id: number | undefined;
  edition: number;
}): BackendPageResponse<BoundarytableResponse> =>
  http({
    url: '/carbon_inventory_int/organization_operation_boundary/',
    params,
  });
// S 数据分类评分等级
export const getGradetable = (params: {
  carbon_emission_info_id: number | undefined;
  edition: number;
}): BackendRes<any> =>
  http({
    url: '/carbon_inventory_int/data_classification_grade/',
    params,
  });
// S 碳排放数据删除
export const delEmissionInfo = (id: number): BackendRes<any> =>
  http({
    method: 'delete',
    url: `/carbon_inventory_int/emission_source_data/${id}/`,
  });

// S 复制排放数据
export const copyCarbonData = (
  emission_source_data_id: number,
): BackendRes<any> =>
  http({
    url: '/carbon_inventory_int/copy_emission_source_data/',
    params: { emission_source_data_id },
  });
// 绿色会议订单列表筛选项

// S 国际版新增报告
export function creatChoosereport(
  method_type: Method,
  url: string,
  params?: Dictionary<any>,
): BackendRes<any> {
  const data = {
    ...params,
    average_annual_emissions: params?.average_annual_emissions || 0,
  };
  return http({
    url,
    method: method_type,
    data,
  });
}

/** 查询报告主体信息 */
export const getReportSubjectInfo = (id: string | number) =>
  http<BackendResponse<ReportSubjectInfo>>({
    url: `/carbon_inventory_int/carbon_emission_info/${id}/`,
  });

// S 国际版碳排放新增报告主体列表
export function getChooselistOption(): BackendRes<any> {
  return http({
    url: '/carbon_inventory_int/organization_info_choose_list/',
    method: 'get',
  });
}

/** 数据提报 */
export const reportData = (data: ReportData) =>
  http<BackendResponse<ReportDataResponse>>({
    url: '/carbon_inventory_int/carbon_emission_data_submitted/',
    method: 'post',
    data,
  });
export const updateReportData = (
  id: string | number,
  /** 如果继续报送传 { proceed: 1 } 根据reportData 返回值决定 risk	
integer (是否有风险) 1 或 2 时使用 */
  data: ReportData | { proceed: 1 },
) =>
  http<BackendResponse<ReportDataResponse>>({
    url: `/carbon_inventory_int/carbon_emission_data_submitted/${id}/`,
    method: 'put',
    data,
  });

/** 新增碳排放报告 */
export const newCarbonEmissionInfo = (data: any) =>
  http<BackendResponse<any>>({
    method: 'post',
    url: `/carbon_inventory_int/carbon_emission_info/`,
    data,
  });

/** 编辑碳排放报告 */
export const putCarbonEmissionInfo = (data: any, id: string | number) =>
  http<BackendResponse<any>>({
    method: 'put',
    url: `/carbon_inventory_int/carbon_emission_info/${id}/`,
    data,
  });
