import { request } from '@api/request';

// 新增活动

// 新增活动
// 活动详情

// 新增碳核算

// 编辑碳核算

// 碳核算数据管理详情

// 模型列表-新增碳核算时

// 编辑初始化
// 保存碳核算数据

// 数据统计
// 地址树

// 新增碳核算报告

// 编辑碳核算报告

// 碳核算报告详情
// 生成碳核算报告
// 建筑行业相关接口

/**
 * 房间类型数据
 * **/
export function apiComputationRoomValue<T>() {
  return request<{
    code: number;
    msg: string;
    data: T[];
    total: number;
  }>({
    method: 'get',
    url: `/architectureComputation/computation/room/value`,
  });
}
