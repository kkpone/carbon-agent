/** *
 * @file 碳数据审核预览echert
 * @author @ljh
 * @description 碳数据审核预览支持数据下钻功能
 * * */
import { request } from '@api/request';
import {
  IndicatorListType,
  IndicatorListTypeMonth,
  TableDataType,
} from './detail/enterPriceBasicDataDetail';

const returnStr = () => '/data';
interface ApiTargetListType {
  targetName?: string;
  status?: string;
  pageNum: string;
  pageSize: string;
}
// 查询数据目标列表
export function ApiTargetList(params: ApiTargetListType) {
  return request<{ rows: []; total: number }>({
    method: 'get',
    url: `${returnStr()}/target/list`,
    params,
  });
}
/**
 *获取数据目标详细信息
 * @export
 * @param {string} targetId
 * @return {*}
 */
export function ApiTargetInfo(targetId: string) {
  return request<{
    data: {
      targetName: string;
      flag: string;
      discharge: string;
      validity: string;
      sublevel: string;
      subtype: string;
    };
  }>({
    method: 'get',
    url: `${returnStr()}/target/info/${targetId}`,
  });
}
/**
 *新增数据目标
 *
 * @interface ApiTargetType
 */
interface ApiTargetType {
  targetName: string; // 目标名称
  flag: string; // 内容描述
  sublevel: string; // 季度/月度
  delflag: string; // 0 正常 1删除
  validity: string; // 年份
  subtype: string; // 1年度 2 季度 2 月度
  status: string; // 当前目标状态 0未分配 1 进行中 2 归档
  type: string; // 1,企业碳核算,2,产品碳足迹
}
export function ApiTargetAdd(data: ApiTargetType) {
  return request<{
    code: number;
  }>({
    method: 'post',
    url: `${returnStr()}/target/add`,
    data,
  });
}
/**
 *修改数据目标
 * @export
 * @param {(ApiTargetType & { targetId: string })} data
 * @return {*}
 */
export function ApiTargetEdit(data: ApiTargetType & { targetId: string }) {
  return request<{ code: number }>({
    method: 'put',
    url: `${returnStr()}/target/edit`,
    data,
  });
}
/**
 * 删除数据目标
 * @param targetIds
 */
export function ApiTargetDelete(targetId: string) {
  return request<{
    code: number;
    msg: string;
  }>({
    method: 'DELETE',
    url: `${returnStr()}/target/${targetId}`,
  });
}
/**
 * 归档数据目标
 * @param targetId
 */
export function ApiTargetArchive(targetId: string) {
  return request<{
    code: number;
    msg: string;
  }>({
    method: 'get',
    url: `${returnStr()}/target/archive/${targetId}`,
  });
}
export function ApiTargetArchiveQuery(targetId: string) {
  return request<{
    code: number;
    msg: string;
    data: string;
  }>({
    method: 'get',
    url: `${returnStr()}/target/archiveQuery/${targetId}`,
  });
}
// interface ApiExecuteListType {
//   targetName?: string;
//   targetId?: string;
//   companyId?: string;
//   exStatus?: string;
// }
// /**
//  *获取目标执行关系详细信息
//  * @export
//  * @param {ApiExecuteListType} data
//  * @return {*}
//  */
// export function ApiExecuteList(data: ApiExecuteListType) {
//   return request<{ rows: []; total: number }>({
//     method: 'post',
//     url: `${returnStr()}/execute/list`,
//     data,
//   });
// }
// 根据name 模糊查询部门 层级
export function APiQueryDepartmentTree(data: {
  companyId?: string | number;
  name?: string;
}) {
  return request<{
    code: number;
    data: [];
  }>({
    method: 'post',
    url: `/management/department/queryDepartmentTree`,
    data,
  });
}

// 部门下员工
const UserObj = {
  companyId: 1000000347019388,
  delflag: 0,
  employName: '李玉',
  employPhone: '15210107653',
  id: 360,
  status: 0,
  type: 0,
  updateTime: null,
  updateUser: null,
  userId: 1000000155199186,
};
export type UserObjType = typeof UserObj;
export function ApiGetUserCompanyByDeptId(departmentId?: string) {
  return request<{
    data: UserObjType[];
    code: number;
  }>({
    method: 'get',
    // eslint-disable-next-line no-restricted-globals
    url: `/management/userDepartment/getUserCompanyByDeptId?departmentId=${departmentId}&name=${name}`,
  });
}

//
/**
 *  查询目标执行关系列表  需要targetId
 *  执行列表中
 */
interface ApiExecutelistType {
  targetId?: string;
  pageNum: string;
  pageSize: string;
}
interface PerformanceManagementType {
  pageNum: string;
  pageSize: string;
  exStatus: string;
}
export function ApiExecutelist(
  params: ApiExecutelistType | PerformanceManagementType,
) {
  return request<{
    rows: [];
    total: number;
    code: number;
  }>({
    method: 'get',
    url: `${returnStr()}/execute/list`,
    params,
  });
}
export function ApiExecutelistEvaluate(
  params: ApiExecutelistType | PerformanceManagementType,
) {
  return request<{
    rows: [];
    total: number;
    code: number;
  }>({
    method: 'get',
    url: `${returnStr()}/execute/listEvaluate`,
    params,
  });
}
// 新增目标执行关系 / 分配目标
interface ApiExecuteAddType {
  targetId: string; // 目标
  userId?: string | number; // 用户
  companyId?: string; // 组织
  deptId: string; // 部门
  allotDischarge: string; // 分配个人排放量
}

export function ApiExecuteAdd(data: ApiExecuteAddType) {
  return request<{
    code: number;
    rows: [];
  }>({
    method: 'post',
    url: `${returnStr()}/execute/add`,
    data,
  });
}
// 修改目标执行关系 / 绩效管理的评价
export function ApiExecuteEdit(
  data:
    | (ApiExecuteAddType & { executeId: string })
    | { executeId: string; exStatus: string }
    | {
        executeId: string;
        score: string;
        evaluate: string;
        isScored?: boolean;
        evaluateTime: string;
      },
) {
  return request<{
    code: number;
    rows: [];
  }>({
    method: 'put',
    url: `${returnStr()}/execute`,
    data,
  });
}
// 查询报送数据列表:
interface ApisubmissionListType {
  targetId?: string;
  pageNum: string;
  pageSize: string;
  subStatus?: string | number;
}
export function ApisubmissionList(
  params:
    | ApisubmissionListType
    | {
        pageNum: string;
        pageSize: string;
        executeId: string;
        subStatus: string | number;
      },
) {
  return request<{
    rows: [];
    total: number;
    code: number;
  }>({
    method: 'get',
    url: `${returnStr()}/submission/list`,
    params,
  });
}

// 获取报送数据详细信息

const SubmitDataObj = {
  subTime: '',
  achieveDischarge: null,
  allDischarge: 1,
  allWeighting: 1,
  allotDischarge: null,
  baseDischarge: 1,
  baseYear: '1',
  beginTime: '1',
  businessId: 1,
  circle: '1',
  companyId: 1000000347019388,
  createBy: null,
  createTime: '2022-05-12 14:54:42',
  delflag: 1,
  deptId: 1,
  directDischarge: 1,
  discharge: 1,
  endTime: 11,
  executeId: null,
  indirectDischarge: 1,
  pageNum: null,
  pageSize: null,
  params: {},
  phone: '1',
  pvgWeighting: '1',
  recordList: [
    {
      activity: 1,
      activityRecord: '1',
      activityScore: 1,
      activityType: '1',
      activityUnit: '1',
      createBy: null,
      createTime: null,
      delflag: 0,
      emissionSource: '1',
      facility: '1',
      factorScore: 1,
      factorSource: '1',
      factorType: '1',
      filePath: null,
      gasesType: '1',
      keepDept: '1',
      letType: '1',
      params: {},
      recordId: 1,
      remark: null,
      searchValue: null,
      standbyFour: '1',
      standbyOne: '1',
      standbyThree: '1',
      standbyTwo: '1',
      status: 0,
      subclassType: '1',
      submissionId: 1,
      updateBy: null,
      updateTime: null,
    },
  ],
  remark: null,
  scopeOne: 1,
  scopeThree: 1,
  scopeTwo: 1,
  searchValue: null,
  standbyFour: '1',
  standbyOne: '1',
  standbyThree: '1',
  standbyTwo: '1',
  subData: '1',
  subName: '1',
  subStatus: 1,
  submissionId: 1,
  targetId: 1,
  targetName: null,
  type: 1,
  updateBy: null,
  updateTime: null,
  userId: 1000001881306838,
  userIds: null,
  userName: '李金海',
  percentOne: '',
  percentTwo: '',
  percentTree: '',
  percentThree: '',
};
export type SubmitDataObjType = typeof SubmitDataObj;
export function ApisubmissionData(submissionId: string) {
  return request<{
    data: SubmitDataObjType;
    total: number;
    code: number;
  }>({
    method: 'get',
    url: `${returnStr()}/submission/${submissionId}`,
  });
}
// 查询审核等操作列表
interface ApioperatListType {
  submissionId: string;
  pageNum: string;
  pageSize: string;
}
const ApioperatListObj = {
  companyId: 1000000347019388,
  createBy: null,
  createTime: '2022-05-12 14:51:14',
  flag: '11',
  operatingId: 1,
  pageNum: null,
  pageSize: null,
  params: {},
  remark: null,
  searchValue: null,
  subStatus: 1,
  submissionId: 1,
  targetId: 1,
  updateBy: null,
  updateTime: null,
  userId: 1000001881306838,
  userName: '',
};
export type ApioperatListObjType = typeof ApioperatListObj;
export function ApioperatList(params: ApioperatListType) {
  return request<{
    rows: ApioperatListObjType[];
    total: number;
    code: number;
  }>({
    method: 'get',
    url: `${returnStr()}/operating/list`,
    params,
  });
}
// 新增审核等操作

interface ApioperatingType {
  subStatus: string;
  flag: string;
  submissionId: string;
}
export function Apioperating(data: ApioperatingType) {
  return request<{
    rows: ApioperatListObjType[];
    total: number;
    code: number;
  }>({
    method: 'post',
    url: `${returnStr()}/operating`,
    data,
  });
}

// 分页查询  — -基准年列表
export function Apistandard(params: { pageNum: string; pageSize: string }) {
  return request<{
    rows: [];
    total: number;
    code: number;
  }>({
    method: 'get',
    url: `${returnStr()}/standa`,
    params,
  });
}
// 通过主键查询详情 - id
export function ApistandardId(params: { standaId: string }) {
  return request<{
    data: {
      standardList: TableDataType[];
      type: string; // 基准年设定方式 默认0单一年份;1为滚动
      yearType: string; // 基准年类型 默认0单一年份;1多年平均
      fillType: string; // 数据填写方式 默认0按年填写;1按月填写
      beginYear?: string; // 开始年 单一年份时的年份选择
      endYear?: string; // 结束年份
      fixedYear?: string; // 年份选择
    };
    total: number;
    code: number;
  }>({
    method: 'get',
    url: `${returnStr()}/standa/info/${params.standaId}`,
  });
}
// 新增基准年
interface ApistandardAddType {
  type: string; // 基准年设定方式 默认0单一年份;1为滚动
  yearType: string; // 基准年类型 默认0单一年份;1多年平均
  fillType: string; // 数据填写方式 默认0按年填写;1按月填写
  beginYear?: string; // 开始年 单一年份时的年份选择
  endYear?: string; // 结束年份
  fixedYear?: string; // 年份选择
  standardList: {
    discharge: string; // 排放量
    scopeOne: string; // 范围一
    scopeTwo: string; // 范围2
    scopeThree: string; // 范围3
    fillYear: string; // 年
    fillMonth?: string; // 月份
  }[];
}
export function ApistandardAdd(data: ApistandardAddType) {
  return request<{
    msg: string;
    code: number;
  }>({
    method: 'post',
    url: `${returnStr()}/standa`,
    data,
  });
}
// 编辑 基准年
export function ApistandardEdit(
  data: ApistandardAddType & { standaId: string },
) {
  return request<{
    msg: string;
    code: number;
  }>({
    method: 'put',
    url: `${returnStr()}/standa`,
    data,
  });
}
// 生产经营指标 列表
interface ApiIndicatorListType {
  pageNum: string;
  pageSize: string;
  delFlag?: string; // 0正常,1禁用(在生产运营数据添加的地方,delflag传0)
  status: string; // 传0
}
export function ApiIndicatorList(params: ApiIndicatorListType) {
  return request<{
    rows: [];
    total: number;
    code: number;
  }>({
    method: 'get',
    url: `${returnStr()}/indicator`,
    params,
  });
}
// 新增生产运营指标
interface ApiIndicatorAddType {
  indicatorName: string; //	指标名称	false	-
  unitType: string; //	单位选项	false	-
  unitValue: string; //	单位值	false	-
  isAdd: string; //	是否可累加:0,是;1,否	false	-
  unitLabel: string; //	单位标签	false	-
  orderNum: string; //	排序字段
}
export function ApiIndicatorAdd(
  data: ApiIndicatorAddType,
  opt: 'post' | 'put',
) {
  return request<{
    rows: [];
    total: number;
    code: number;
    msg: string;
  }>({
    method: opt,
    url: `${returnStr()}/indicator`,
    data,
  });
}
// 编辑生产运营指标

// 禁用指标
export function ApiIndicatorDisAble(params: { id: string }) {
  return request<{
    rows: [];
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'delete',
    url: `${returnStr()}/indicator`,
    params,
  });
}

// 生产运营数据
export function ApiOperateList(params: { pageNum: string; pageSize: string }) {
  return request<{
    rows: [];
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'get',
    url: `${returnStr()}/operate`,
    params,
  });
}
export function ApiOperateDel(params: { id: string }) {
  return request<{
    rows: [];
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'DELETE',
    url: `${returnStr()}/operate?id=${params.id}`,
  });
}
// 新增数据
type ApiOperateAdd = {
  operationYear: string;
  fillType: string;
  indicatorList: IndicatorListType[] | IndicatorListTypeMonth[];
  operateId?: string;
};
export function ApiOperateDataAdd(data: ApiOperateAdd, method) {
  return request<{
    rows: [];
    total: number;
    code: number;
    msg: string;
  }>({
    method,
    url: `${returnStr()}/operate`,
    data,
  });
}
// 详情
export function ApiOperateInfo(params: { id: string }) {
  return request<{
    data: ApiOperateAdd;
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'get',
    url: `${returnStr()}/operate/info/${params.id}`,
  });
}

// 报送数据列表,有风险,风险查看;
type RiskDataType = {
  thresholdDown: number;
  thresholdUp: number;
  thresholdDownValue: number;
  thresholdUpValue: number;
};
export function ApiSubRisk(params: { targetId: string; submissionId: string }) {
  return request<{
    data: RiskDataType;
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'get',
    url: `${returnStr()}/submission/subRisk`,
    params,
  });
}

/**
 * 上月碳排放 环比
 */
export function ApianalysisLastDischarge() {
  return request<{
    data: { percent: number | null; value: number };
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'get',
    url: `${returnStr()}/analysis/lastDischarge`,
  });
}

/** 上月碳排放强度**/
export function ApianalysisLastStrength() {
  return request<{
    data: { percent: number | null; value: number };
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'get',
    url: `${returnStr()}/analysis/lastStrength`,
  });
}
/** 本月通过审核**/
export function ApianalysisAudit() {
  return request<{
    data: number;
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'get',
    url: `${returnStr()}/analysis/auditMonth`,
  });
}
/** 本月待审核数据**/
export function ApianalysisDelay() {
  return request<{
    data: number;
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'get',
    url: `${returnStr()}/analysis/delay`,
  });
}
/** 目标分配人数 **/
export function ApiexecuteMen(data: { targetPublish: string | number }) {
  return request<{
    data: number;
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'post',
    url: `${returnStr()}/analysis/executeMen`,
    data,
  });
}
/** *目标分配次数 */
export function ApiexecuteCount(data: { targetPublish: string | number }) {
  return request<{
    data: number;
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'post',
    url: `${returnStr()}/analysis/executeCount`,
    data,
  });
}
/** *目标分布数**/
export function ApitargetPublish(data: { targetPublish: string | number }) {
  return request<{
    data: number;
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'post',
    url: `${returnStr()}/analysis/targetPublish`,
    data,
  });
}
/** *部门报送趋势图 1近一周 2近一月 3近一年**/
export type ApiSubmissionTrendType = {
  xaxis: string[];
  yaxis: string[];
};
export function ApiSubmissionTrend(data: { audit: string | number }) {
  return request<{
    data: ApiSubmissionTrendType;
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'post',
    url: `${returnStr()}/analysis/submissionTrend`,
    data,
  });
}

/** *部门排放排行榜 部门排放排行榜 1上月、2近三月、3今年以来、4历史以来***/
export function ApiSeniorityRank(data: { rank: string | number }) {
  return request<{
    data: { name: string; value: string }[];
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'post',
    url: `${returnStr()}/analysis/seniorityRank`,
    data,
  });
}
/** 碳数据审核预览**/
export type ApiAuditType = {
  deptId: string;
  name: string;
  percent: string;
  value: string;
  key: string;
};
export function ApiAudit(data: { audit: string | number }) {
  return request<{
    data: ApiAuditType[];
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'post',
    url: `${returnStr()}/analysis/audit`,
    data,
  });
}
/** 碳数据审核 预览二级   - 部门分组**/

export function ApiAuditSubclass(data: {
  audit: string | number; // 1 近一周、2 近一月、3 近一年
  subStatus: string | number; // 0,待审核,1,审核通过,2,审核驳回
}) {
  return request<{
    data: ApiAuditType[];
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'post',
    url: `${returnStr()}/analysis/auditSubclass`,
    data,
  });
}
/** 碳绩效概览***/
export function ApiEffect(data: {
  audit: string | number; // 1 近一周、2 近一月、3 近一年
}) {
  return request<{
    data: ApiAuditType[];
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'post',
    url: `${returnStr()}/analysis/effect`,
    data,
  });
}
/** 碳绩效预览二级--部门分组***/
export function ApiEffectSubclass(data: {
  audit: string | number; // 1 近一周、2 近一月、3 近一年
  score: string;
}) {
  return request<{
    data: ApiAuditType[];
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'post',
    url: `${returnStr()}/analysis/effectSubclass`,
    data,
  });
}
/** *对比基准年变化趋势图**/
export function ApiCompanyByYear(data: {
  contrastYear: string | number; // 1,历史以来;2,近10年;3,近5年
}) {
  return request<{
    data: ApiSubmissionTrendType;
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'post',
    url: `${returnStr()}/analysis/companyByYear`,
    data,
  });
}
/** 部门排放占比***/
export function ApiProportionByDept(data: {
  deptMonth: string | number; // 1,上月;2,近三个月;3,今年以来
}) {
  return request<{
    data: ApiAuditType[];
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'post',
    url: `${returnStr()}/analysis/proportionByDept`,
    data,
  });
}
/** 类别占比图:范围一二三 饼图 该接口可接收组织id或者部门id展示二级**/
/**
 * 
    deptId	int64	部门id
    strengthNorm	string	排放量&强度变化趋势图 强度标准
    strengthType	int32	排放量&强度变化趋势图 强度类型 1,月度;2,年度
    strengthYear	int32	排放量&强度变化趋势图中月度时勾选的年年度时勾选的:1“近五年”;2“近十年”;3“历史以来”
    isAdd	int32	强度标准是否可累加:0,可累加;1不可累加
    strengthTime int32 强度趋势图 选择的下钻时间  传值int不要单位 
    deptMonth	int32	部门排放占比的勾选月份 1,上月;2,近三个月;3,今年以来
 * **/
export function ApiCategory(
  data:
    | {
        deptMonth: string | number; // 1,上月;2,近三个月;3,今年以来
        deptId: string | number;
      }
    | {
        strengthNorm: string; // 排放量&强度变化趋势图 强度标准
        strengthType: string; // 排放量&强度变化趋势图 强度类型 1,月度;2,年度
        strengthYear: string; // 排放量&强度变化趋势图中  月度时勾选的年 年度时勾选的:1“近五年”;2“近十年”;3“历史以来”
        strengthTime: string; // 强度趋势图 选择的下钻时间  传值int不要单位
      },
) {
  return request<{
    data: ApiAuditType[];
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'post',
    url: `${returnStr()}/analysis/category`,
    data,
  });
}
/** **子类比占比: 三级下钻图表  接收组织或者部门id***/

export function ApiSubclass(
  data:
    | {
        deptMonth: string | number; // 1,上月;2,近三个月;3,今年以来
        deptId: string | number; // 部门id
        scopeType: string | number; // 排放量&强度变化趋势图 或 各部门排放占比图 1,范围1;2,范围2;3,范围3
      }
    | {
        strengthType: string | number;
        strengthYear: number | string;
        scopeType: string;
        isAdd: string | number;
        strengthTime: string;
      },
) {
  return request<{
    data: ApiAuditType[];
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'post',
    url: `${returnStr()}/analysis/subclass`,
    data,
  });
}
/** 强度变化趋势图--月度筛选项年份查询**/
export function ApiQueryYears() {
  return request<{
    data: string[];
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'get',
    url: `${returnStr()}/analysis/queryYears`,
  });
}
/** 强度变化趋势图**/
export function ApiCompanyByStrength(data: {
  strengthNorm?: string; // 排放量&强度变化趋势图 强度标准
  strengthType?: string; // 排放量&强度变化趋势图 强度类型 1,月度;2,年度
  strengthYear?: string; // 排放量&强度变化趋势图中 月度时勾选的年 年度时勾选的:1“近五年”;2“近十年”;3“历史以来”
  scopeType?: string; // 排放量&强度变化趋势图 或 各部门排放占比图 1,范围1;2,范围2;3,范围3
  isAdd?: number;
}) {
  return request<{
    data: {
      xaxis: number[] | string[];
      yaxis: number[];
      zaxis: number[];
    };
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'post',
    url: `${returnStr()}/analysis/companyByStrength`,
    data,
  });
}
/** 强度标准下拉框接口**/
export function ApiQueryIndicators(data: {
  strengthType: string;
  strengthYear: string;
}) {
  return request<{
    data: {
      indicatorName: string;
      unitValue: string;
      isAdd: number;
      strengthNorm: string;
    }[];
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'post',
    url: `${returnStr()}/analysis/queryIndicators`,
    data,
  });
}
/** 图表拖拽位置保存**/
export function ApiDragSave(data: { dragData: string; type?: number }) {
  return request<{
    data: { indicatorName: string; unitValue: string; isAdd: number }[];
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'post',
    url: `${returnStr()}/analysis/dragSave`,
    data,
  });
}
/** 图表拖拽位置查询**/
export function ApiDragQuery(params = { type: 1 }) {
  return request<{
    data: {
      dragData: string;
      companyName: string;
    };
    total: number;
    code: number;
    msg: string;
  }>({
    method: 'get',
    url: `${returnStr()}/analysis/dragQuery`,
    params,
  });
}
