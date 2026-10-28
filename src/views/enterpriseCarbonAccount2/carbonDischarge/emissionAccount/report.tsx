/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @file 核算报表
 * @author lixingchen
 * */

import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import useSyncCallback from '@src/utils/useSyncCallback';
import { useIndexColumn } from '@src/views/emission/utils';
import { Menu, Radio, Table } from 'antd';
import classNames from 'classnames';
import { isNil } from 'lodash-es';
import { useMemo, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import '../../style.less';
import { FormActions } from '@src/components/FormActions';
import CustResizable from '@src/components/Resizable';
import { Page } from '@src/components/Page';

import styles from './index.module.less';
import { crateArr, getTableColumns } from './reportDatas';
import { getDisclosureMajorGhgReportDetail } from '../../AccountingList/service';
import { DISCLOSURE_REPORT_STANDARD } from '../../AccountingList/type';
import type { DisclosureReportDetailData } from '../../AccountingList/type';
import { EVersionType } from '../../accounting/fillData/service';
import { ORG_TYPE } from '../../constant';
import {
  GHGFirstSelect,
  GHGSecondSelect,
  ISOFirstSelect,
  ISOSecondSelect,
} from '../../listInfo/util';
import {
  apiActivityDataRecognition,
  apiComputationEmission,
  apiDataGhg,
  apiDataIso,
  apiEmissionRecognition,
  apiInventoryGhg,
  apiInventoryIso,
  apiOrgDataGhg,
  apiOrgDataIso,
  apiRecognition,
  apiSurveyGhg,
} from '../../service';

type AccountReportProps = {
  name?: string;
  period?: string;
  computationId?: string;
  computationPeriod?: string;
  orgId?: number | string;
  orgType?: string;
  isPage?: boolean;
  versionType?: EVersionType;
};

type MajorGhgReportDetailData = Pick<
  DisclosureReportDetailData,
  'majorGhg' | 'factorOptions'
>;

const getMajorGhgReportDetail = (params: {
  period: string;
  orgId?: number | string;
  versionType?: EVersionType;
}) =>
  getDisclosureMajorGhgReportDetail({
    year: params.period || `${new Date().getFullYear()}`,
    orgId: Number(params.orgId) || 0,
    standard:
      params.versionType === EVersionType.ghg
        ? DISCLOSURE_REPORT_STANDARD.GHG
        : DISCLOSURE_REPORT_STANDARD.ISO,
  });

const AccountReport = (props: AccountReportProps) => {
  const history = useHistory();

  const name = decodeURIComponent(
    new URLSearchParams(window.location.search).get('name') || props.name || '',
  );
  const period = decodeURIComponent(
    new URLSearchParams(window.location.search).get('period') ||
      props.period ||
      '',
  );
  const id =
    new URLSearchParams(window.location.search).get('id') ||
    props.computationId;

  const { orgId, orgType, computationPeriod } = props;

  const isPage = props.isPage ?? true;

  const [page, setPage] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [commPage, setCommPage] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [currentWidth, setCurrentWidth] = useState(220);
  const indexColumn = useIndexColumn<any>((page.current - 1) * page.pageSize);
  const [key, setKey] = useState<string>('org');
  const type = props.versionType === EVersionType.ghg ? 'GHG' : 'ISO';
  // 组织运营边界调查表
  const [orgData, setOrgData] = useState<any>({
    ISO: [],
    GHG: [],
  });
  // 排放源识别表，活动数据收集表，排放因子选择表
  const [tarColectionFectoData, setTarColectionFectoData] = useState<any>();
  const [computedData, setComputedData] = useState<any>();
  const [dataClassify, setDataClassify] = useState<any>({
    ISO: [],
    GHG: [],
  });
  const [gasDischargeData, setGasDischargeData] = useState<any>({
    ISO: [],
    GHG: [],
  });
  const [majorGhgReportDetail, setMajorGhgReportDetail] =
    useState<MajorGhgReportDetailData>();
  const [orgUncertaintyData, setOrgUncertaintyData] = useState<any>({
    ISO: [],
    GHG: [],
  });

  const formatOrgScoreList = (orgScoreList = [], scope: string, key: string) =>
    orgScoreList.map((item: any, index) => ({
      key: `${key}-${item.orgId ?? item.seq ?? index}`,
      orderNum: item.seq,
      siteName: item.name,
      scope,
      score: item.score,
      grade: item.grade,
      categoryRatio: item.categoryRatio,
      weighting: item.weighting,
    }));

  const buildOrgUncertaintyData = (
    data: any,
    scopes: { key: string; scope: string; dataIndex?: string }[],
  ) =>
    scopes.map(item => {
      if (!item.dataIndex) {
        return {
          key: item.key,
          scope: item.scope,
          score: data?.totalScore,
          grade: data?.totalGrade,
        };
      }

      const scopeData = data?.[item.dataIndex];
      const child = formatOrgScoreList(
        scopeData?.orgScoreList || [],
        item.scope,
        item.key,
      );

      return {
        key: item.key,
        scope: item.scope,
        score: scopeData?.score,
        grade: scopeData?.grade,
        child,
      };
    });

  const formatOrgUncertaintyData = (ghgData: any, isoData: any) => ({
    GHG: buildOrgUncertaintyData(ghgData, [
      {
        key: '1',
        scope: I18N.enterpriseCarbonAccount2.scopeOne,
        dataIndex: 'scopeOne',
      },
      {
        key: '2',
        scope: I18N.enterpriseCarbonAccount2.scope2,
        dataIndex: 'scopeTwo',
      },
      {
        key: '3',
        scope: I18N.enterpriseCarbonAccount2.fanWeisan,
        dataIndex: 'scopeThree',
      },
      {
        key: '4',
        scope: I18N.enterpriseCarbonAccount2.overallEmissions,
      },
    ]),
    ISO: buildOrgUncertaintyData(isoData, [
      {
        key: '1',
        scope: I18N.enterpriseCarbonAccount2.directDischargeOr,
        dataIndex: 'scopeOne',
      },
      {
        key: '2',
        scope: I18N.enterpriseCarbonAccount2.indirectEnergyEmissions,
        dataIndex: 'scopeTwo',
      },
      {
        key: '3',
        scope: I18N.enterpriseCarbonAccount2.transportationIndirectDischarge,
        dataIndex: 'scopeThree',
      },
      {
        key: '4',
        scope: I18N.enterpriseCarbonAccount2.outsourcedProductsOr,
        dataIndex: 'scopeFour',
      },
      {
        key: '5',
        scope: I18N.enterpriseCarbonAccount2.downstreamOfSupplyChain,
        dataIndex: 'scopeFive',
      },
      {
        key: '6',
        scope: I18N.enterpriseCarbonAccount2.otherIndirectEmissions,
        dataIndex: 'scopeSix',
      },
      {
        key: '7',
        scope: I18N.enterpriseCarbonAccount2.overallEmissions,
      },
    ]),
  });

  const getOrgUncertaintyData = async () => {
    if (!orgId) {
      setOrgUncertaintyData({ ISO: [], GHG: [] });
      return;
    }

    const params = {
      computationPeriod,
      orgId: `${orgId}`,
      period,
    };

    Promise.all([apiOrgDataGhg(params), apiOrgDataIso(params)]).then(
      ([ghg, iso]) => {
        setOrgUncertaintyData(
          formatOrgUncertaintyData(
            // @ts-ignore
            ghg.data.data,
            // @ts-ignore
            iso.data.data,
          ),
        );
      },
    );
  };

  const getCommData = async () => {
    let reqFunc = apiRecognition;

    if (key === 'fector') {
      reqFunc = apiEmissionRecognition;
    }
    if (key === 'colection' && orgId) {
      reqFunc = apiActivityDataRecognition;
    }

    await reqFunc({
      computationId: id,
      computationPeriod,
      orgId,
      pageSize: commPage.pageSize,
      pageNum: commPage.current,
      period,
    }).then((res: any) => {
      setTarColectionFectoData(res.data.rows);
      setCommPage({ ...commPage, total: res.data.total });
    });
  };
  const noPageData = () => {
    // 组织运营边界调查表
    Promise.all([
      apiSurveyGhg({
        computationId: id,
        computationPeriod,
        orgId,
        type: 0,
        period,
      }),
      apiSurveyGhg({
        computationId: id,
        computationPeriod,
        orgId,
        type: 1,
        period,
      }),
    ]).then(([ghg, iso]) => {
      // @ts-ignore
      const isoData = iso.data.data;
      // @ts-ignore
      const ghgData = ghg.data.data;
      const generateArr = (data, type) => {
        if (data) {
          let arr: any = Object.values(data).flat();
          arr = arr.map(item => ({
            ...item,
            ghgCategory: (type === 'ghg' ? GHGFirstSelect : ISOFirstSelect)
              // @ts-ignore
              .find(ite => ite.id === item[`${type}Category`])?.category,
            ghgClassify: (type === 'ghg' ? GHGSecondSelect : ISOSecondSelect)
              // @ts-ignore
              .find(ite => ite.id === item[`${type}Classify`])?.category,
          }));
          for (let i = 0; i < arr.length; i++) {
            if (
              arr[i].ghgCategory ===
                I18N.enterpriseCarbonAccount2.directDischargeOr ||
              arr[i].ghgCategory === I18N.enterpriseCarbonAccount2.scopeOne
            ) {
              // @ts-ignore
              arr[i].type = I18N.enterpriseCarbonAccount2.directEmissions;
            } else {
              // @ts-ignore
              arr[i].type = I18N.enterpriseCarbonAccount2.indirectEmissions;
            }
          }
          return arr;
        }
        return [];
      };

      setOrgData({
        ISO: generateArr(isoData, 'iso'),
        GHG: generateArr(ghgData, 'ghg'),
      });
    });
  };
  // 排放源识别表->活动数据收集表->排放因子选择表数据
  const getTarColectionFectoData = async () => {
    // 排放量计算表
    await apiComputationEmission({
      computationId: id,
      computationPeriod,
      orgId,
      pageSize: page.pageSize,
      pageNum: page.current,
      period,
    }).then((res: any) => {
      setComputedData(res.data.rows);
      setPage({ ...page, total: res.data.total });
    });
    // 温室气体排放清单GHG
    // 温室气体排放清单ISO
    Promise.all([
      apiInventoryGhg({ computationId: id, computationPeriod, orgId, period }),
      apiInventoryIso({ computationId: id, computationPeriod, orgId, period }),
    ]).then(([ghg, iso]) => {
      // @ts-ignore
      const ghgData: any = ghg.data.data;
      // @ts-ignore
      const isoData = iso.data.data;
      const obj = crateArr(ghgData, isoData);
      // @ts-ignore
      setGasDischargeData(obj);
    });
    // 数据分类评价ISO
    // 数据分类评价ISO
    Promise.all([
      apiDataGhg({ computationId: id, computationPeriod, orgId, period }),
      apiDataIso({ computationId: id, computationPeriod, orgId, period }),
    ]).then(([ghg, iso]) => {
      // @ts-ignore
      const ghgData = ghg.data.data;
      // @ts-ignore
      const isoData = iso.data.data;
      const isoArr = [
        {
          scope: I18N.enterpriseCarbonAccount2.directDischargeOr,
          grade: isoData.scopeOne.grade,
          score: isoData.scopeOne.score,
          child: isoData.scopeOne.one,
          totalScore: isoData.totalScore,
          totalGrade: isoData.totalGrade,
          key: '1',
        },
        {
          scope: I18N.enterpriseCarbonAccount2.indirectEnergyEmissions,
          grade: isoData.scopeTwo.grade,
          score: isoData.scopeTwo.score,
          child: isoData.scopeTwo.two,
          key: '2',
        },
        {
          scope: I18N.enterpriseCarbonAccount2.transportationIndirectDischarge,
          grade: isoData.scopeThree.grade,
          score: isoData.scopeThree.score,
          child: isoData.scopeThree.three,
          key: '3',
        },
        {
          scope: I18N.enterpriseCarbonAccount2.wasteDisposal,
          grade: isoData.scopeFour.grade,
          score: isoData.scopeFour.score,
          child: isoData.scopeFour.four,
          key: '4',
        },
        {
          scope: I18N.carbonFootprint.productUsage,
          grade: isoData.scopeFive.grade,
          score: isoData.scopeFive.score,
          child: isoData.scopeFive.five,
          key: '5',
        },
        {
          scope: I18N.enterpriseCarbonAccount2.otherIndirectEmissions,
          grade: isoData.scopeSix.grade,
          score: isoData.scopeSix.score,
          child: isoData.scopeSix.six,
          key: '6',
        },
      ];
      const ghgArr = [
        {
          scope: I18N.enterpriseCarbonAccount2.scopeOne,
          grade: ghgData.scopeOne.grade,
          score: ghgData.scopeOne.score,
          child: ghgData.scopeOne.one,
          totalScore: ghgData.totalScore,
          totalGrade: ghgData.totalGrade,
          key: '1',
        },
        {
          scope: I18N.enterpriseCarbonAccount2.scope2,
          grade: ghgData.scopeTwo.grade,
          score: ghgData.scopeTwo.score,
          child: ghgData.scopeTwo.two,
          key: '2',
        },
        {
          scope: I18N.enterpriseCarbonAccount2.fanWeisan,
          grade: ghgData.scopeThree.grade,
          score: ghgData.scopeThree.score,
          child: ghgData.scopeThree.three,
          key: '3',
        },
      ];
      setDataClassify({ ISO: [...isoArr], GHG: [...ghgArr] });
    });
  };
  const syncGetTarColectionFectoData = useSyncCallback(
    getTarColectionFectoData,
  );
  const syncGetCommData = useSyncCallback(getCommData);
  useEffect(() => {
    noPageData();
    getTarColectionFectoData();
    getCommData();
    getOrgUncertaintyData();
  }, []);
  useEffect(() => {
    let ignore = false;

    getMajorGhgReportDetail({
      period,
      orgId,
      versionType: props.versionType,
    }).then(res => {
      if (!ignore) {
        setMajorGhgReportDetail(res.data.data);
      }
    });

    return () => {
      ignore = true;
    };
  }, [period, orgId, props.versionType]);
  useEffect(() => {
    setCommPage({ ...commPage, current: 1 });
    setPage({ ...page, current: 1 });
    // setComputedData([]);
    // if (key === 'fector') {
    syncGetCommData();
    // }
    if (key === 'computed') {
      syncGetTarColectionFectoData();
    }
  }, [key]);
  const pageData = useMemo(() => {
    const data = getTableColumns(
      Number(orgType) === ORG_TYPE.ENTERPRISE ||
        Number(orgType) === ORG_TYPE.ORG,
      key,
      type,
      tarColectionFectoData,
      orgData,
      computedData,
      gasDischargeData,
      dataClassify,
      orgUncertaintyData,
      majorGhgReportDetail?.majorGhg || [],
      majorGhgReportDetail?.factorOptions,
      indexColumn,
      commPage,
      page,
      setCommPage,
      setPage,
      syncGetCommData,
      syncGetTarColectionFectoData,
    );
    return data;
  }, [
    key,
    type,
    tarColectionFectoData,
    orgData,
    computedData,
    gasDischargeData,
    dataClassify,
    majorGhgReportDetail,
    page,
    commPage,
    orgUncertaintyData,
    indexColumn,
  ]);

  return (
    <div
      className={classNames('report-box', 'enterprise-carbon-account2', {
        [styles.accountReport]: !isPage,
      })}
    >
      <Page
        breadCrumbs={
          isPage
            ? [
                {
                  title: I18N.enterpriseCarbonAccount2.carbonEmissionAccounting,
                  key: I18N.enterpriseCarbonAccount2.carbonEmissionAccounting,
                  href: RouteMaps.enterpriseCarbonAccountingcarbonDischarge,
                },
                {
                  title: I18N.enterpriseCarbonAccount2.accountingResults,
                  key: I18N.enterpriseCarbonAccount2.accountingResults,
                },
              ]
            : undefined
        }
      >
        <div className='flex-a-s cont-box'>
          <div
            className={currentWidth === 20 ? 'left-box close-pos' : 'left-box'}
          >
            <CustResizable
              resizableCurrentSize={({ width }) => {
                setCurrentWidth(width);
              }}
              //  eslint-disable-next-line react/no-unstable-nested-components
              childRender={() => (
                <Menu
                  onClick={e => {
                    setKey(e.key);
                  }}
                  defaultSelectedKeys={['org']}
                  mode='vertical'
                  items={[
                    {
                      label:
                        I18N.enterpriseCarbonAccount2
                          .organizationalOperationsSide,
                      key: 'org',
                    },
                    {
                      label:
                        I18N.enterpriseCarbonAccount2
                          .emissionSourceIdentification,
                      key: 'target',
                    },
                    {
                      label:
                        I18N.enterpriseCarbonAccount2.activityDataCollection,
                      key: 'colection',
                    },
                    {
                      label:
                        I18N.enterpriseCarbonAccount2.emissionFactorSelection,
                      key: 'fector',
                    },
                    {
                      label: I18N.enterpriseCarbonAccount2.emissionCalculation,
                      key: 'computed',
                    },
                    {
                      label:
                        I18N.enterpriseCarbonAccount2.greenhouseGasEmissions2,
                      key: 'gasDischarge',
                    },
                    ...(!orgId
                      ? [
                          {
                            label:
                              I18N.enterpriseCarbonAccount2
                                .dataClassificationEvaluation,
                            key: 'dataClassify',
                          },
                        ]
                      : []),
                    ...(orgId
                      ? [
                          {
                            label:
                              I18N.enterpriseCarbonAccount2
                                .dataClassificationEvaluation,
                            key: 'orgDataClassify',
                          },
                        ]
                      : []),
                    {
                      label:
                        I18N.enterpriseCarbonAccount2
                          .majorGhgIndirectEmissionIdentification,
                      key: 'majorGhg',
                    },
                  ]}
                />
              )}
            />
          </div>
          <div
            className='right-box'
            style={{ width: `calc(100% - ${currentWidth}px)` }}
          >
            {pageData.map(item => (
              <>
                {item.title ? <div className='tit'>{item.title}</div> : ''}

                <Table
                  key={`${key}-${type}`}
                  rowKey='scope'
                  scroll={{ y: '67vh' }}
                  style={{ marginTop: 12 }}
                  {...item.tableData}
                />
              </>
            ))}
          </div>
        </div>
        {isPage && (
          <FormActions
            place='center'
            buttons={[
              {
                type: 'default',
                title: I18N.carbonFootprint.return,
                onClick: async () => {
                  history.goBack();
                },
              },
            ]}
          />
        )}
      </Page>
    </div>
  );
};
export default AccountReport;
