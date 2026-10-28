/*
 * @@description:列表搜索条件表单
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-10-18 14:21:08
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-10 17:06:50
 */

import I18N from '@src/lang/I18N';
import '../style.less';
import { RouteMaps } from '@src/router/route-paths';

interface FromItem {
  label: string;
  name: string;
  type: 'input' | 'select' | 'radio' | 'render' | 'date' | 'cascader';
  rules: boolean;
  placeholder: string;
  props: any;
}
interface BtnType {
  btnName: string;
  type?: string;
  flag?: string;
  onClick: () => void;
}
interface FormListType {
  titleName: string;
  formList?: FromItem[];
  btnInfo?: BtnType[];
}
export const getFormList = (history): FormListType => {
  const path = history.location.pathname;
  // eslint-disable-next-line react-hooks/rules-of-hooks

  switch (path) {
    case RouteMaps.enterpriseCarbonAccountingDataQualityControlPlanList:
      // 控制计划列表
      return {
        titleName: I18N.enterpriseCarbonAccount2.controlPlan,
        formList: [
          {
            label: '',
            name: 'versionCode',
            type: 'input',
            placeholder: I18N.Certification.versionNumber2,
            rules: false,
            props: {
              style: { width: 260 },
              maxLength: 50,
            },
          },
        ],
        btnInfo: [
          {
            btnName: I18N.carbonFootprint.newAddition,
            flag: 'enterprise:controlPlan:add',
            onClick: () => {
              history.push(
                RouteMaps.enterpriseCarbonAccountingDataQualityControlPlanAdd,
              );
            },
          },
        ],
      };

    case RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionStandardList:
      // 排放基准列表
      return {
        titleName: I18N.enterpriseCarbonAccount2.emissionBenchmark,
        btnInfo: [],
      };
    case RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionLessSceneList:
      // 减排场景列表
      return {
        titleName: I18N.enterpriseCarbonAccount2.emissionReductionScenarios,
        formList: [
          {
            label: '',
            name: 'sceneName',
            type: 'input',
            rules: false,
            placeholder:
              I18N.enterpriseCarbonAccount2.emissionReductionScenarioName,
            props: {
              style: { width: 260 },
              maxLength: 50,
            },
          },
        ],
        btnInfo: [
          {
            btnName: I18N.carbonFootprint.newAddition,
            flag: 'enterprise:lessenEmission:add',
            onClick: () => {
              history.push(
                RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionLessSceneAdd,
              );
            },
          },
        ],
      };
    case RouteMaps.enterpriseCarbonAccountingDownloadList:
      // 下载管理列表
      return {
        titleName: I18N.carbonFootprint.downloadManagement,
      };
    default:
      return {
        titleName: I18N.carbonFootprint.downloadManagement,
      };
  }
};
