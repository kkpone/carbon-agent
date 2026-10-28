import { StepOptionValue } from '@src/views/carbonFootprint3/util/constant';
import type { ReactNode } from 'react';

export type AccountInfoStepProps = {
  /** 是否是分享的页面 */
  shareStatus?: boolean;
  /** 是否是查看权限 */
  isDetail?: boolean;
  /** 分享链接 snapFlag（共享编辑=8），优先于 URL 解析 */
  snapFlag?: number;
  /** 共享编辑是否可操作（完成建模/编辑模型），与建模区只读 isDetail 解耦 */
  shareCanAction?: boolean;
  /** 失效时间 */
  expireTime?: string;
  /** 是否使用 Agent 预览布局 */
  agentPreviewLayout?: boolean;
  /** 点击返回的回调方法 */
  backClick: () => void;
  /** 改变步骤 */
  changeSetp: (val: number) => void;
  backText: string;
  stepValue: StepOptionValue;
  /** 当前允许点击到的步骤 */
  stepStatus: StepOptionValue;
  /** 生成碳足迹结果 */
  createFinishReport: () => void;
  /** 生成碳足迹报告 */
  goAddReport: () => void;
  /** 生成碳标签 */
  goCarbonLabel: () => void;
  /** 模型共享 */
  onModelShare?: () => void;
  /** 重新编辑模型 */
  goEditModel?: (changeStep: boolean) => void;
  /** 是否隐藏左侧返回区 */
  hideBackHeader?: boolean;
  /** 是否隐藏结果页碳标签/报告操作 */
  hideResultOutputActions?: boolean;
  /** 共享标识，受共享方提交用 */
  shareFlag?: number;
  /** account/info shareStatus：1、4 时在结果页展示提交 */
  accountShareStatus?: number;
  accountId?: number;
  /** 当前核算步骤状态 */
  accountStatus?: number;
  /** 核算类型：0 快速核算，1 过程核算 */
  accountType?: number;
  /** 提交共享模型成功后刷新 */
  onShareModelSubmitSuccess?: () => void | Promise<void>;
  /** 顶部 AI Agent 入口 */
  aiAgentSlot?: ReactNode;
};
