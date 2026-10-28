import { ReportDataType } from '@src/views/carbonInternational/organizationalManagement/utils';
import { AxiosPromise } from 'axios';

/** 数据汇总表 table */
export interface AllEmissionData {
  id: number;
  facility: string;
  emission_source: string;
  emissions_category: string;
  active_data: number;
  uncertainty: number;
  emissions_total: number;
  carbon_emission_percentage: number;
  unit: string;
}

/** 报告主体信息 */
export interface ReportSubjectInfo {
  id: number;
  organization_info: number;
  year: string;
  start_base_year: string;
  end_base_year: string;
  base_year_change_explain: string;
  quantitative_method: string[];
  emission_source_exempt_explain: string;
  quantitative_method_change_explain: string;
  biomass_related_emissions: string;
  preparer_name: string;
  preparer_email: string;
  preparer_phone: string;
  filling_date: string;
  other_information: string;
  average_annual_emissions: number;
  edition: number;
  organization: number;
}
export type Organizations = {
  id: number;
  isShow?: boolean;
  organization_name: 'string';
  create_time: string;
  modification: string;
};
export type GetOrganizationListArgsResponse = {
  count: number;
  next?: string;
  previous?: string;
  results: Organizations[];
};

export type OrganizationsCreateResponse = {
  code: number;
  msg?: any;
  id?: number;
  organization_name: string;
  industry: string | number;
  department: string | number;
  boundaries: string | number;
  company_address: string;
  basic_info: string;
  boundaries_detailed: string;
  floor_plan_img: string;
  leader_organization_chart: string;
  execute_organization_chart: string;
};
// 组织信息依赖列表
export type OrganizationsSelectorResponse = {
  count: number;
  next: string;
  previous: string;
  data: readonly [OrganizationsSelector];
};
type SelectBase = {
  id: number;
  user?: number;
};
type BoundariesSelect = {
  boundaries_name: string;
} & SelectBase;
type IndustrySelect = {
  industry_name: string;
} & SelectBase;
type DepartmentSelect = {
  department_name: string;
} & SelectBase;

export type OrganizationsSelector = {
  department_list: DepartmentSelect[];
  industry_list: IndustrySelect[];
  boundaries_list: BoundariesSelect[];
};

export type CarbonInfosPayload = {
  g_time: string;
  l_time: string;
  year: string;
  id: string;
  organization_info_name: string;
  page: number;
  page_size: number;
  edition: number;
};

export type CarbonInfosSearchParams = Omit<
  CarbonInfosPayload,
  'page' | 'page_size'
>;

export type CarbonInfosResponse = {
  count: number;
  next: string;
  previous: string;
  results: CarbonInfos[];
};

export type CarbonInfos = {
  id: number;
  year: string;
  organization_info_name: string;
  version_num: string;
  create_time: string;
  modification: string;
  relation: null | any;
  emission_source_data: boolean;
  edition: number;
  start_base_year: string;
  end_base_year: string;
  /* 空数据时代表未提报 */
  submit_data: SubmitDatum[];
};

/**
 *  (0, '待提报'),
    (1, '已提报'),
    (2, '审核不通过'),
    (3, '审核通过'),
 */
export enum SubmitDatumStatus {
  '未提报',
  '已提报',
  '未通过',
  '已通过',
}

interface SubmitDatum {
  id: number;
  /** 审核状态:0,默认待审核,1,审核通过,2,审核驳回 */
  status: number;
  data_name: string;
  period: string;
  target_id: null | number;
  execution_id: null | number;
  associated_target: null | string;
  submission_id: null | number;
}

// 排放数据字段 end

// 碳排放数据创建
export type CreateEmissionSourceDataPayload = {
  emission_category: number;
  emission_subcategory: number;
  emission_source: number;
  facility: number;
  active_data: string;
  unit: string;
  active_data_record_mode: number;
  active_data_type: string;
  active_data_grade: number;
  department: number;
  gas_type: string[];
  emission_factor: number;
  emission_factor_grade: number;
  emission_factor_source: string;
  potential_energy_name: string;
  potential_energy_name_n_id: number;
  facility_int: number;
  gas_info?: CreateEmissionSourceDataPayload;
  unit_int?: number;
  emission_source_int?: number;
  emission_factor_type?: number;
  carbon_emission_info?: string;
  unit_conversion_ratio?: number;
  produce_gas_type_list?: ProduceGasTypeList[];
} & { [key: string]: Ch };

interface Ch {
  prpduce_gas_emission_factor: number;
  greenhouse_gases: string;
  prpduce_gas_unit: string;
  potential_energy_numeric: number;
}

interface ProduceGasTypeList {
  prpduce_gas_name: string;
  prpduce_gas_emission_factor: number;
  greenhouse_gases: string;
  prpduce_gas_unit: string;
  potential_energy_name: string;
  potential_energy_numeric: number;
  prpduce_gas_id: string;
  id: number;
}

export enum GasCheckedSubKey {
  prpduce_gas_emission_factor = 'prpduce_gas_emission_factor',
  greenhouse_gases = 'greenhouse_gases',
  /** 分子单位 */
  prpduce_gas_unit = 'prpduce_gas_unit',
  prpduce_gas_name = 'prpduce_gas_name',
  /** 分母单位 */
  prpduce_gas_unit_denominator = 'prpduce_gas_unit_denominator',
  potential_energy_name = 'potential_energy_name_n_id',
  potential_energy_numeric = 'potential_energy_numeric',
}

// 数据关联关系 end

export interface AllCarbonInfoRealtionsResponse {
  code: number;
  data: AllCarbonInfoRealtions[];
  msg: string;
  status: string;
}

export interface AllCarbonInfoRealtions {
  id: number;
  year: string;
  version_num: string;
}

export interface CreateCarbonInfoRelationsPayload {
  master_carbon_emission: number;
  slave_carbon_emission: number;
}

export type BackendRes<T> = AxiosPromise<{
  code: number;
  data: T;
  msg: string;
  status: string;
}>;

export type BackendPageResponse<T> = AxiosPromise<PythonPageResponse<T>>;

export type PythonPageResponse<T> = {
  count: number;
  next: any;
  previous: any;
  results: T[];
};

export interface BackendResponse<T = any> {
  code: number;
  data: T;
  msg: string;
  status: string;
}

export interface AddEmissionSelectItem {
  facility?: string;
  activitydatarecord?: string;
  emissionsourcedepartment?: string;
  emissionfactorsource?: string;
}

export type AddEmissionSelectItemPayload = {
  rely_type: keyof AddEmissionSelectItem;
  label: string;
  edition: string | number;
};

// 获取排放信息详情
export interface EmissionInfoValues {
  carbon_emission_info: number;
  facility: string;
  emission_source: string;
  emissions_category: string;
  emissions_subcategory: string;
  active_data: number;
  unit: string;
  active_data_record_mode: string;
  active_data_type: string;
  active_data_grade: number;
  department: string;
  emission_factor: string;
  emission_factor_grade: number;
  emission_factor_source: string;
  gas_type?: string[];
  produce_gas_type_list: ProduceGasTypeList[];
  json_raw: string;
  [key: string]: any;
}

export interface CarbonEmissionInfoResponse {
  code: number;
  data: CarbonEmissionInfoResponseData;
  msg: string;
  status: string;
}
interface CarbonEmissionInfoResponseData {
  id: number;
  create_datetime: string;
  update_datetime: string;
  creator_name: string;
  file_url: string;
  file_url_path: string;
  modifier: string;
  dept_belong_id: string;
  name: string;
  type: string;
  size: string;
  address: string;
  source: string;
  oss_url: string;
  status: boolean;
  file: string;
  creator: number;
}
// 国际版 首页下拉框
export type CarbonInternationalHomePageOptionResponse = BackendRes<
  HomePageOptionResponse[]
>;

export interface HomePageOptionResponse {
  id: number;
  organization_name: string;
  carbon_emission_info_list: CarbonEmissionInfoList[];
}

interface CarbonEmissionInfoList {
  version_num: string;
  year: string;
  id: number;
  edition: number;
  edition_status: string;
}
export type ReportCovers = {
  id: number;
  report_word_cover: string;
  report_word_cover_status: number;
  default_cover_report_image: string;
  default_cover_report_image_id: number;
};

export type BackGroundImg = {
  id: number;
  images: string;
  images_url: string;
};

export type ReportCoverPayload = {
  id: number;
  default_cover_report_image?: string | number;
  report_word_cover?: File;
  report_word_cover_status: number | string;
};

export type CarbonEmissionInfoIndex = {
  edition: string;
  version_num: string;
  year: string;
  organization_info_name: string;
};

// 组织运营边界调查表
export type BoundarytableResponse = {
  id: number;
  emission_source_data_detail: EmissionSourceDataDetail;
};
interface EmissionSourceDataDetail {
  direct_emission: Emission[];
  indirect_energy_emissions: Emission[];
  transport_emissions: Emission[];
  outsourcing_emissions: Emission[];
  supply_chain_emissions: Emission[];
  else_emissions: Emission[];
}

interface Emission {
  emissions_category: string;
  emissions_subcategory: string;
  emission_source: string;
  facility: string;
}

// 通用版修改 2021.12

export interface EmissionSourceDataRelySerializersEmissionSourceDataRelySerializers {
  emission_source_unit_list: EmissionList[];
  activity_data_record_mode_list: List[];
  activity_data_list: ActivityDataList;
  emission_source_department_list: List[];
  emissions_sub_category_list: EmissionsSubCategoryList[];
  emission_source_emission_factor_list: ActivityDataList;
  gwp_edition: GwpEdition[];
  gwp_potential_energy_int_list: {
    [key: string]: GwpPotentialEnergyIntList[];
  }[];
}

interface GwpEdition {
  id: number;
  gwp_edition_name: string;
}

interface GwpPotentialEnergyIntList {
  gwp_edition__gwp_edition_name: string;
  gas_type: string;
  greenhouse_gases_name: string;
  gwp_num: string;
}
type EmissionsSubCategoryList = EmissionList & { value_two: number };
export interface EmissionList {
  value: number;
  label: string;
  label_two: string;
}
type ActivityDataList = Array<Array<number | string>>;

interface List {
  organization_id: number;
  value: number;
  label: string;
}

export type EmissionSourceIntListSerializersEmissionSourceIntListSerializersPayload =
  {
    emission_subcategory: number;
    edition: number;
  };

export interface EmissionSourceIntListSerializersEmissionSourceIntListSerializersRes {
  id: number;
  emission_source_name: string;
  /** 0 为系统 */
  organization_id: number;
  facility_name_list: FacilityNameList[];
}

interface FacilityNameList {
  id: number;
  facility_name: string;
  organization_id: number;
}

export type EmissionSourceIntCreateSerializersEmissionSourceIntCreateSerializersPayload =
  {
    emission_source_name: string;
    // title: 排放源名称
    // maxLength: 20
    // minLength: 1
    emission_subcategory: number;
    // title: 排放源子类别
    // maxLength: 40
    // minLength: 1
    edition: number;
    // title: 版本
    // Enum:
    // [ 1, 2 ]
  };

export type FacilityIntCreateSerializersFacilityIntCreateSerializersPayload = {
  facility_name: string;
  // title: 设施/活动
  // maxLength: 20
  // minLength: 1
  // organization: number;
  // title: 组织
  emission_source_data: number;
  emission_subcategory: number;
  // title: 排放源ID
  edition: number;
  // title: 版本
  // default: 1
  // Enum:
  // [ 1, 2 ]
};

export interface ExhaustGasIntListSerializers {
  gwp_edition: number;
  activity_data_unit: number;
  unit_conversion_ratio: number;
  gas_info: GasInfo;
  emission_factor_type: string;
  emission_factor_grade: string;
  emission_factor_source: string;
  id?: number;
}
// export interface GasInfo {
//   gas_type: string[];
//   "CO₂":    Co;
// }
type GasInfo = {
  gas_type: string[];
} & {
  [key: string]: GasDetail;
};

interface GasDetail {
  greenhouse_gases: string;
  prpduce_gas_emission_factor: number;
  prpduce_gas_unit: string;
}

export type InternationalEmmitionTableParams = {
  page: number;
  page_size: number;
  edition: number;
  carbon_emission_info_id: number | undefined;
};

export type ReportData = {
  /* required integer (碳排放信息id) */
  carbon_emission_info: number;
  /* required string (数据名称) [ 1 .. 200 ] characters */
  data_name: string;
  /* string (所属周期) [ 1 .. 50 ] characters */
  period: string;
  /* integer (关联目标ID) [ -9223372036854776000 .. 9223372036854776000 ] Nullable */
  target_id?: number;
  /* integer (目标执行ID) [ -9223372036854776000 .. 9223372036854776000 ] Nullable */
  execution_id?: number;
  /* string (关联目标) <= 200 characters Nullable */
  associated_target?: string;

  data_type: ReportDataType;
};

export interface ReportDataResponse {
  id: number;
  carbon_emission_info: number;
  data_name: string;
  period: string;
  target_id: number;
  execution_id: null | number;
  associated_target: null | string;
  submission_id: null | number;
  status: number;
  risk: number;
  data_type: number;
}
