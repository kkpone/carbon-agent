/** CBAM 文件共用模块，查看会话时按登记的业务类型区分 ID 空间。 */
export const getCbamFileBusinessType = (file: {
  module?: string | null;
  info?: string | null;
}): string => {
  if (file.info === 'operation_report') {
    return 'operation_report';
  }
  if (file.module === 'cbam2_monitor_plan' || file.info === 'monitor_plan') {
    return 'monitor_plan';
  }
  // 沟通表历史 info 可能为空或错误说明；后续业务接入时在这里增加明确类型。
  return 'report';
};
