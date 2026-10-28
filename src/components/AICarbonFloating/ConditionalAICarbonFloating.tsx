import { useLocation } from 'react-router-dom';

import { RouteMaps } from '@/router/route-paths';
import { RouteMapsCorbonFootprint3 } from '@/router/route-paths/corbonFootprint3';

import AICarbonFloating from './AICarbonFloating';
// import { checkPermissions } from '../Permission/utils';

// 定义不需要显示 AICarbonFloating 的路径
const HIDDEN_PATHS = [
  '/system/login',
  '/register',
  '/account',
  '/forgot-password',
  '/reset-password',
  '/404',
  '/403',
  '/500',
  '/ESG/aiGenerateDetail',
  '/carbonFootprint3/footprintAccount/shareAccountLogin',
  '/carbonFootprint3/footprintAccount/share',
  /** 碳足迹核算详情（左侧自带 AI 对话，隐藏悬浮小碳） */
  RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountDetail,
  '/enterpriseCarbonAccounting/share',
  '/enterpriseCarbonAccounting/accounting/share',
  RouteMaps.enterpriseCarbonAccountingNoLoginTaskList,
  RouteMaps.enterpriseCarbonAccountingNoLoginApprovalList,
  RouteMaps.questionnaireFill.replace(':id', ''),
  RouteMaps.ESGImportanceAnalysisFill.replace(':id', ''),
  RouteMaps.scanLogin,
  RouteMaps.carbonAgent,
  RouteMaps.carbonAgentShare.replace(':shareId', ''),
];

// 包装组件，根据路径决定是否显示 AICarbonFloating
const ConditionalAICarbonFloating: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // 检查当前路径是否在隐藏列表中
  const shouldHide = HIDDEN_PATHS.some(path => currentPath.startsWith(path));

  // const hasAIReduce = checkPermissions(true, 'aiReduceFloating');

  if (shouldHide) {
    return null;
  }

  return <AICarbonFloating />;
};

export default ConditionalAICarbonFloating;
