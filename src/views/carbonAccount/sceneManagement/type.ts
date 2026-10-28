import { FetchPage } from '@src/components/TableUtil/types/util';
import { SceneDto, SceneDtoSceneTypeEnum } from '@src/sdks/java/carbonAccount';

/** 获取列表的接口返回 */
export interface ApiGetSceneManage {
  code: number;
  msg: string;
  data: {
    rows: SceneDto[];
    total: number;
  };
}

/** 碳账户-场景管理-表格列表默认显示数据 */
export interface CarbonAccountSceneManageTable {
  id: number; // 场景id
  companyId: number; // 组织id
  sceneTplId: null | number; // 场景模板id
  sceneCode: null | string; // 场景编号
  sceneName: string; // 场景名称
  sceneType: 0 | 1 | 2; // 类型:0默认，1小任务，2自定义
  rate: number; // 场景系数
  unitScore: number; // 单位分数
  sceneUnit: string; // 单位

  periodType: number; // 单位周期
  limitType: 1 | 2; // 是否限制
  timesMaxValue: number; // 最大次数
  scoreMaxValue: number; // 最大分数
  sceneStatus: 0 | 1; // 0启用 1未启用
  orderNum: number; // 排序
  createBy: string;
  createTime: string; // 创建时间
  updateBy: string;
  updateTime: string; // 更新时间
  remark: string;
  delFlag: number;
}

/** 跳转场景详情的路由携带参数 */
export interface SceneManagementDetailLoaction {
  status: 'add' | 'detail' | 'edit'; // 只有查看或者编辑两种场景
  id?: number; // 当前列表的id
}

/** 场景管理接口 -- 参数*/
export interface CarbonAccountSceneManageTableGetParams extends FetchPage {
  sceneName?: string; // 场景名称
}

/** 场景管理 -- 新增场景*/
export interface CarbonAccountSceneManageSubNew {
  id?: number;
  sceneTplId?: string | number; // 场景模板id
  sceneCode?: string; // 场景编码
  sceneName: string; // 场景名称
  sceneType: SceneDtoSceneTypeEnum; // 类型:0默认，1小任务，2自定义
  rate?: number; // 场景系数
  unitScore: number; // 单位分数
  sceneUnitName: string; // 单位对应的Value值
  sceneUnit: string; // 单位
  periodType: string; // 单位周期
  limitType: 0 | 1 | 2 | 3; // 限制类型。0不限制 1限制分数 2 限制次数 3 限制分数和次数
  scoreMaxValue?: number; // 最大分数
  timesMaxValue?: number; // 最大分数
  sceneStatus?: 0 | 1; // 0启用 1未启用
  orderNum: number; // 排序
}

// 场景限制
export type LimitValue = { value: number | ''; checked: boolean };
