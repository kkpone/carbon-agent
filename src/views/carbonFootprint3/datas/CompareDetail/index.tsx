import useUrlState from '@ahooksjs/use-url-state';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { useRequest } from 'ahooks';
import { Button, Spin } from 'antd';
import classNames from 'classnames';
import { FC } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { PageWrapper } from '@/components/PageWrapper';
import { checkPermissions } from '@/components/Permission/utils';
import { virtualLinkTransform } from '@/router/route-paths';
import { RouteMapsCorbonFootprint3 } from '@/router/route-paths/corbonFootprint3';
import { PageInfoType } from '@/router/type';
import { Toast } from '@/utils';

import { LinkEmission } from './components/LinkEmission';
import { TopEmission } from './components/TopEmission';
import downSvg from './down.svg';
import style from './index.module.less';
import { getProductInfo, saveCompareInfo } from './service';
import upSvg from './up.svg';
import CommonTitleTooltip from '../../component/CommonTitleTooltip';
import { CompareCards } from '../components/CompareCards';

export interface ICompareDetailProps {}

export const CompareDetail: FC<ICompareDetailProps> = () => {
  const [state] = useUrlState({ id: null, compareId: null, showListTag: null });

  const isCreateReport = checkPermissions(true, 'footprint3:report:add');
  const { id, compareId, showListTag } = state;
  const history = useHistory();
  const { data, loading, refresh } = useRequest(() =>
    getProductInfo({ id, compareId }),
  );

  const createComparisonReport = () => {
    history.push(
      virtualLinkTransform(
        RouteMapsCorbonFootprint3.carbonFootprint3ProcessReportInfo,
        [':pageInfoType', ':id', ':comparisonId'],
        [PageInfoType.add, id, compareId],
      ),
    );
  };

  const info = data?.data.data?.detail;

  const save = async () => {
    await saveCompareInfo({ accountId: id, compareAccountId: compareId });
    Toast('success', I18N.carbonFootprint.saveSuccessful);
  };

  const breadCrumbItems = showListTag
    ? [
        {
          title: (
            <Link to={RouteMapsCorbonFootprint3.carbonFootprint3DatasCompare}>
              {I18N.carbonFootprint3.productComparison}
            </Link>
          ),
          href: RouteMapsCorbonFootprint3.carbonFootprint3DatasCompare,
        },
        {
          title: (
            <Link
              to={RouteMapsCorbonFootprint3.carbonFootprint3DatasCompareList}
            >
              {I18N.carbonFootprint3.historicalProducts}
            </Link>
          ),
          href: RouteMapsCorbonFootprint3.carbonFootprint3DatasCompareList,
        },
        {
          title: I18N.carbonFootprint3.productComparisonDetails,
        },
      ]
    : [
        {
          title: (
            <Link to={RouteMapsCorbonFootprint3.carbonFootprint3DatasCompare}>
              {I18N.carbonFootprint3.productComparison}
            </Link>
          ),
          href: RouteMapsCorbonFootprint3.carbonFootprint3DatasCompare,
        },
        {
          title: I18N.carbonFootprint3.productComparisonDetails,
        },
      ];
  return (
    <PageWrapper
      breadCrumbProps={{
        items: breadCrumbItems,
      }}
    >
      <div className={style.header}>
        <div className={style.title}>
          {I18N.carbonFootprint3.productComparisonDetails}
        </div>
        <div className={style.btns}>
          <Button type='primary' onClick={save}>
            {I18N.carbonFootprint.preserve}
          </Button>
          {isCreateReport && (
            <Button type='primary' onClick={createComparisonReport}>
              {I18N.carbonFootprint3.generateComparativeReport}
            </Button>
          )}
        </div>
      </div>
      <CompareCards refreshDetail={refresh} isDetail />
      <Spin spinning={loading}>
        <div className={style.analysisWrapper}>
          {!loading && (
            <>
              <div className={style.analysis}>
                {I18N.carbonFootprint3.emissionReductionAnalysis}
              </div>
              <div className={style.analysisContent}>
                <div className={style.analysisHeader}>
                  <div>
                    <CommonTitleTooltip
                      title={I18N.carbonFootprint3.emissionReductionKg2}
                      tooltip={I18N.carbonFootprint3.emissionReductionBenchmark}
                    />
                    <div className={style.analysisItemValueReduction}>
                      {info?.totalReduction}
                    </div>
                  </div>
                  <div>
                    <CommonTitleTooltip
                      title={
                        I18N.enterpriseCarbonAccount2.emissionReductionRatio
                      }
                      tooltip={I18N.carbonFootprint3.emissionReductionRatioBase}
                    />
                    <div
                      className={classNames(style.analysisItemUnit, {
                        [style.analysisItemUnitDown]:
                          Number(info?.totalReduction) > 0,
                        [style.analysisItemUnitUp]:
                          Number(info?.totalReduction) <= 0,
                      })}
                    >
                      <span className={style.analysisItemValue}>
                        {info?.totalReductionRate}%
                      </span>
                      {Number(info?.totalReduction) > 0 ? (
                        <ArrowDownOutlined
                          style={{ fontSize: 32, width: 32, height: 32 }}
                        />
                      ) : (
                        <ArrowUpOutlined
                          style={{ fontSize: 32, width: 32, height: 32 }}
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <img
                      src={Number(info?.totalReduction) > 0 ? downSvg : upSvg}
                      alt=''
                    />
                  </div>
                </div>
                <div className={style.analysisContentItemTitle}>
                  {I18N.carbonFootprint3.theEmissionReductionProcess}
                </div>
                <div className={style.topEmission}>
                  <LinkEmission
                    title={I18N.carbonFootprint3.accordingToTheEmissionCycle}
                    LinkEmissions={info?.byStages}
                  />
                  <LinkEmission
                    title={I18N.work.byEmissionSourceCategory}
                    LinkEmissions={info?.byTypes}
                  />
                </div>
                <div className={style.analysisContentItemTitle}>
                  {I18N.carbonData.topEmissions4}
                </div>
                <div className={style.topEmission}>
                  <TopEmission
                    title={I18N.carbonFootprint3.targetProduct}
                    topEmissions={info?.topEmissions}
                  />
                  <TopEmission
                    title={I18N.carbonFootprint3.benchmarkProduct}
                    topEmissions={info?.topEmissionsCompare}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </Spin>
    </PageWrapper>
  );
};

export default CompareDetail;
