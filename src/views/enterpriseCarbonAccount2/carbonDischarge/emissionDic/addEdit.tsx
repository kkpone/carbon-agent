/*
 * @@description:排放源 新增 复制 编辑 详情
 * @Author: lixingchen qifeng@carbonstop.net
 * @Date: 2022-11-07 10:51:29
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-04-27 15:45:14
 */

import I18N from '@src/lang/I18N';
import '../../style.less';
import { Page } from '@src/components/Page';
import { RouteMaps } from '@src/router/route-paths';
import EmissionEditPage from '@src/views/enterpriseCarbonAccount2/carbonDischarge/components/AddEmission';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';

import style from './addEdit.module.less';

const DictsEmission = () => {
  const history = useHistory();

  const tabBarArr = () => {
    const path = history.location.pathname;
    if (path === RouteMaps.enterpriseCarbonAccountSelectEmissionDetail) {
      const { name, period, computationId, classifyType } = JSON.parse(
        sessionStorage.getItem('computationObj') || '',
      );
      return [
        {
          title: I18N.enterpriseCarbonAccount2.carbonEmissionAccounting,
          key: I18N.enterpriseCarbonAccount2.carbonEmissionAccounting,
          href: RouteMaps.enterpriseCarbonAccountingcarbonDischarge,
        },
        {
          title: I18N.enterpriseCarbonAccount2.emissionSourceManagement,
          key: I18N.enterpriseCarbonAccount2.emissionSourceManagement,
          href: `${RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionManage}?computationId=${computationId}&name=${name}&period=${period}&classifyType=${classifyType}`,
        },
        {
          title: I18N.carbonFootprint3.selectingEmissionSources,
          key: I18N.carbonFootprint3.selectingEmissionSources,
          href: `${RouteMaps.enterpriseCarbonAccountingcarbonDischargeSelectEmission}`,
        },
        {
          title: I18N.carbonFootprint3.emissionSourceDetails,
          key: I18N.carbonFootprint3.emissionSourceDetails,
          href: ``,
        },
      ];
    }
    return [];
  };
  return (
    <div
      className={classNames(
        'emissions-box enterprise-carbon-account-2',
        style.wrapper,
      )}
    >
      <Page breadCrumbs={tabBarArr()} wrapperClassName={style.page}>
        <EmissionEditPage />
      </Page>
    </div>
  );
};
export default DictsEmission;
