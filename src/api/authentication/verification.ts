import { AuthData, AuthIndex } from '@src/views/Certification/indexjson';
import { QBSAASrequest, requestPython as wenborequest } from '../request';

const request = QBSAASrequest;
interface projectInspectType {
  type: string | number;
  pageNum: string | number;
  pageSize: string | number;
  id: string | number;
  companyId: any;
  projectId: string | number;
}
type projectInspectTypeList = Partial<projectInspectType>;

export const projectInspectqueryByPage = (
  data: projectInspectTypeList,
): AuthData<any> =>
  request({
    url: `/projectInspect/queryByPage`,
    method: 'POST',
    data,
  });

export const projectInspectqueryById = (params: projectInspectTypeList) =>
  request({
    url: `/projectInspect/queryById`,
    method: 'GET',
    params,
  });
export const operatingRecordqueryByPage = (data: projectInspectTypeList) =>
  request({
    url: `/operatingRecord/queryByPage`,
    method: 'POST',
    data,
  });
export const operatingRecordaddOperating = (data: AuthIndex['authSubStatus']) =>
  request({
    url: `/operatingRecord/addOperating`,
    method: 'POST',
    data,
  });
export const addmaterials = (
  data: [
    {
      reportNum?: string;
      projectId?: string;
      reportName?: string;
      versions?: string;
      cycleDate?: string;
      type?: string;
      status?: string;
      userId?: string;
    },
  ],
) =>
  request({
    url: `/materials/`,
    method: 'POST',
    data,
  });
export const materialsqueryByPage = (data: { projectId: string | number }) =>
  request({
    url: `/materials/queryByPage`,
    method: 'POST',
    data,
  });
interface wenboprojectInspectType {
  page: string | number;
  page_size: string | number;
  is_baseline: string;
}
type wenboprojectInspectTypelist = Partial<wenboprojectInspectType>;
export const carbon_emission_info_export = (
  params: wenboprojectInspectTypelist,
) =>
  wenborequest({
    url: `/carbon_footprints/products/`,
    method: 'GET',
    params,
  });
export const carbon_emission_info = (params: {
  page: string;
  pageSize: string;
}) =>
  wenborequest({
    url: `/carbon_inventory_int/carbon_emission_info/`,
    method: 'GET',
    params,
  });

export const carbon_emission_info_docx = (params: string) =>
  wenborequest({
    url: `/carbon_inventory_int/carbon_emission_info/docx/${params}/`,
    method: 'GET',
  });
export const carbon_emission_info_excel = (params: string) =>
  wenborequest({
    url: `/carbon_inventory_int/carbon_emission_info/excel/${params}/`,
    method: 'GET',
  });
export const carbon_footprint_reduction = (data: {
  reportID: string;
  button_status: string;
}) =>
  wenborequest({
    url: `/carbon_footprints/reduction/`,
    method: 'POST',
    data,
  });
