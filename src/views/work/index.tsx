import I18N, { LocaleType } from '@src/lang/I18N';
import { useRequest } from 'ahooks';
import { Timeout } from 'ahooks/lib/useRequest/src/types';
import { Button, Empty, Popover, Select, Tooltip } from 'antd';
import classNames from 'classnames';
import {
  FC,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';

import bannerEnSvg from '@/assets/svg/banner_en.svg';
import headerSvg from '@/assets/svg/header.svg';
import { LocaleContext } from '@/components/LocaleProvider';
import Permission, { getPermission } from '@/components/Permission';
import IconFont, { IconAlibaba, IconAlibabaNew } from '@/components/iconfont';
import { RouteMaps } from '@/router/route-paths';
import { RouteMapsCorbonFootprint3 } from '@/router/route-paths/corbonFootprint3';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';

import { CompanyExportChart } from './components/CompanyExportChart';
import { DemoCards } from './components/DemoCards';
import { FuncList } from './components/FuncList';
import { InfoCard } from './components/InfoCard';
// import { SankeyChart } from './components/SankeyChart';
import { SourceTypeChart } from './components/SourceType';
import { LifecycleChart } from './components/lifecycle';
import card1Svg from './images/card1.svg';
import card2Svg from './images/card2.svg';
import card3Svg from './images/card3.svg';
import emissionSvg from './images/emission.svg';
import rightArrowSvg from './images/rightArrow.svg';
import styles from './index.module.less';
import {
  getCarbonAuthData,
  getContentArticle,
  getProductManualData,
  getWorkbenchDetail,
  EmissionData,
  getWorkbenchDetailByYear,
  getWorkbenchEnterpriseOrgComparisonByYear,
  TProductData,
  getWorkbenchAccountByAccountId,
  getUserIdentity,
} from './service';
import { ArticleData, EProductType } from './type';

export interface IWorkbenchProps {}

const overViewMap = () => ({
  '1': I18N.carbonFootprint.carbonFootprintVerification2,
  '2': I18N.carbonFootprint3.enterpriseCarbonAccounting,
});

/**
 * timeType  0 年度 1 季度 2 月度
 */
const fillInByTextMap = () => ({
  '0': I18N.work.fillInByYear,
  '1': I18N.work.fillInQuarterly,
  '2': I18N.work.fillInAppointmentsOnAMonthlyBasis,
});

const fillInbyTextTipMap = {
  '0': I18N.work.enterpriseForTheCurrentFiscalYear,
  '1': I18N.work.enterpriseForThisQuarter,
  '2': I18N.work.enterpriseForTheMonth,
};

const OptionRender = (props: {
  label?: ReactNode;
  data: { type: number; amount: number; unitName: string; accountName: string };
  onClick: () => void;
}) => (
  <div className={styles.optionWrapper} onClick={props.onClick}>
    <div className={styles.labelWrapper}>
      <div className={styles.label}>{props.label}</div>
      <div
        className={classNames(styles.tag, {
          [styles.quickAccounting]: props.data.type === 0,
          [styles.processAccounting]: props.data.type === 1,
        })}
      >
        {props.data.type === 0
          ? I18N.carbonFootprint3.quickAccounting
          : I18N.carbonFootprint3.processAccounting}
      </div>
    </div>
    <div className={styles.info}>{props.data?.accountName}</div>
  </div>
);

const cardInfo = () => [
  {
    title: I18N.work.calculatedProducts,
    unit: I18N.work.individual,
    value: 66,
    icon: card1Svg,
    bgColor: '#286090',
    hoverColor: '#E8F6FF',
    target: RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccount,
    permission: 'carbonstopFootprint:footprintAccount',
  },
  {
    title: I18N.work.certifiedProducts,
    unit: I18N.work.individual,
    value: 66,
    icon: card3Svg,
    bgColor: '#286090',
    hoverColor: '#E8F4E5',
    target: RouteMaps.CertificationProductIndex,
    permission: 'CertificationCarbonFootprintProject',
  },
  {
    title: I18N.work.carbonStandardsHaveBeenAppliedFor,
    unit: I18N.work.individual,
    value: 66,
    icon: card2Svg,
    bgColor: '#286090',
    hoverColor: '#E5E5FB',
    target: RouteMapsCorbonFootprint3.carbonFootprint3CarbonLabel,
    permission: 'carbonFootprint3:carbonLabel',
  },
];

export const Workbench: FC<IWorkbenchProps> = () => {
  const [overView, setOverView] = useState<EProductType>();
  const companyName = useSelector(
    (state: RootState) => state.companyUserInfo.userInfo?.companyName,
  );

  /** 产品使用手册 */
  const { data: ManualDataResult } = useRequest(getProductManualData);
  const productManuals = ManualDataResult?.data?.data || [];

  const { locale } = useContext(LocaleContext);

  /** 低碳资讯 */
  const { data: ContentArticleResult } = useRequest(getContentArticle);

  const ContentArticle = useMemo(
    () => ContentArticleResult?.data?.data || [],
    [ContentArticleResult],
  );

  const [ContentArticleData, setContentArticleData] = useState<ArticleData[]>(
    [],
  );

  useEffect(() => {
    const width = window.innerWidth;
    const showNumbers = Math.floor(width / 360);
    const data = ContentArticle.slice(0, showNumbers);
    setContentArticleData(data);
  }, [ContentArticle]);

  /** 碳认证 */
  const { data: CarbonAuthResult } = useRequest(getCarbonAuthData);

  const CarbonAuthData = CarbonAuthResult?.data.data || [];

  /** 数据概览 */
  const { data: WorkbenchDetailResult } = useRequest(
    () => getWorkbenchDetail({ productType: overView }),
    {
      ready: !!overView,
      refreshDeps: [overView],
    },
  );

  const [workbenchDetail, setWorkbenchDetail] = useState<EmissionData>();
  const [yearList, setYearList] = useState<string[]>([]);
  const [accountYear, setAccountYear] = useState<string>();

  const [productDetail, setProductDetail] = useState<TProductData>();
  const [productList, setProductList] = useState<TProductData['accountList']>(
    [],
  );
  const [activeProduct, setActiveProduct] = useState<number>();
  const [productCardNum, setProductCardNum] = useState<number[]>([]);

  useEffect(() => {
    if (overView === EProductType.company) {
      const companyInfo = WorkbenchDetailResult?.data?.data as EmissionData;
      setWorkbenchDetail(companyInfo);
      setYearList(companyInfo?.yearList || []);
      setAccountYear(companyInfo?.yearList?.[0]);
    } else if (overView === EProductType.product) {
      const productInfo = WorkbenchDetailResult?.data?.data as TProductData;
      setProductDetail(productInfo);
      setProductList(productInfo?.accountList || []);
      setActiveProduct(productInfo?.accountList?.[0]?.id);
      setProductCardNum([
        productInfo?.accountCounts,
        productInfo?.authCounts,
        productInfo?.labelCounts,
      ]);
    }
  }, [WorkbenchDetailResult, overView]);

  const orgComparisonResult = useRequest(
    () => getWorkbenchEnterpriseOrgComparisonByYear({ year: accountYear }),
    {
      ready: !!accountYear && overView === EProductType.company,
      refreshDeps: [accountYear],
    },
  );

  useEffect(() => {
    const get = async () => {
      if (!overView) {
        return;
      }
      if (overView === EProductType.product) {
        setAccountYear(undefined);
        if (activeProduct) {
          const result = await getWorkbenchAccountByAccountId({
            accountId: activeProduct,
          });
          if (result) {
            setProductDetail(result?.data?.data);
          }
        }
      } else if (accountYear) {
        const result = await getWorkbenchDetailByYear({ year: accountYear });
        setWorkbenchDetail(result?.data?.data);
      }
    };
    get();
  }, [accountYear, overView, activeProduct]);

  const infoItems = useMemo(
    () => [
      {
        title: I18N.work.total,
        value: workbenchDetail?.sumAccounts,
      },
      {
        title: I18N.components.notStartedYet,
        value: workbenchDetail?.unAccountCounts,
      },
      {
        title: I18N.enterpriseCarbonAccount2.toBeFilledOut,
        value: workbenchDetail?.preAccountingCounts,
      },
      {
        title: I18N.carbonFootprint3.fillingIn,
        value: workbenchDetail?.accountingCounts,
      },
      {
        title: I18N.components.completed,
        value: workbenchDetail?.finishCounts,
      },
    ],
    [workbenchDetail],
  );

  const count = useRef(0);
  const time = useRef<Timeout>();

  /** 是否是试用用户 */
  const { data: IdentityResult, run } = useRequest(async () =>
    getUserIdentity(),
  );

  const IdentityInfo = IdentityResult?.data?.data;

  useEffect(() => {
    window.clearTimeout(time.current);
    if (
      !(
        count.current < 5 &&
        IdentityInfo?.demoDataList.some(item => item.jumpUrl === '')
      )
    ) {
      return;
    }
    time.current = setTimeout(() => {
      if (
        count.current < 5 &&
        IdentityInfo?.demoDataList.some(item => item.jumpUrl === '')
      ) {
        run();
      }
      count.current += 1;
    }, 2000);
  }, [IdentityInfo?.demoDataList]);

  const OverViewTypeMap = useMemo(
    () =>
      IdentityInfo?.productList.map(item => ({
        value: item.productType,
        label: overViewMap()[item.productType],
      })),
    [IdentityInfo?.productList, locale],
  );

  useEffect(() => {
    setOverView(OverViewTypeMap?.[0]?.value);
  }, [OverViewTypeMap]);

  const [showPopup, setShowPopup] = useState(false);

  // const maxHeight = useMemo(() => {
  //   const result = [0];
  //   productDetail?.emissionSankey?.stageList?.forEach(stage => {
  //     stage?.typeList?.forEach(type => {
  //       result.push(type?.emissionList?.length);
  //     });
  //   });
  //   return Math.max(...result) * 60 + 200;
  // }, [productDetail?.emissionSankey?.stageList]);

  return (
    <div>
      <div className={styles.header}>
        <span>{I18N.workbench.workbench}</span>
        {companyName && (
          <div className={styles.organizationName} title={companyName}>
            <IconFont
              className={styles.organizationIcon}
              type='icon-icon-zuzhijiagou'
            />
            <span className={styles.organizationText}>{companyName}</span>
          </div>
        )}
      </div>
      <div className={styles.main}>
        {IdentityInfo?.userDemo === 0 && (
          <div className={styles.func}>
            <div className={styles.title}>{I18N.workbench.commonFunctions}</div>
            <FuncList />
          </div>
        )}
        {IdentityInfo?.userDemo === 1 && (
          <>
            <div className={styles.headerImg}>
              <img
                className={styles.headerImgInner}
                src={locale === LocaleType.enUS ? bannerEnSvg : headerSvg}
                alt=''
              />
            </div>
            <DemoCards
              demoData={IdentityInfo.demoDataList}
              trialExpired={IdentityInfo.trialExpired}
              duration={IdentityInfo.duration}
            />
          </>
        )}
        {IdentityInfo?.userDemo === 0 &&
          (IdentityInfo?.productList || []).length > 0 && (
            <div className={styles.overview}>
              <div className={styles.title}>
                <span className={styles.text}>
                  {I18N.carbonFootprint.dataOverview}
                </span>
                {OverViewTypeMap?.length === 2 && (
                  <Select
                    value={overView}
                    style={{ width: locale === LocaleType.enUS ? 264 : 134 }}
                    onChange={value => {
                      setOverView(value);
                    }}
                    options={OverViewTypeMap}
                  />
                )}
                {OverViewTypeMap?.length === 1 && (
                  <div className={styles.lonelyText}>
                    {
                      OverViewTypeMap.find(item => item.value === overView)
                        ?.label
                    }
                  </div>
                )}
                {overView === EProductType.company && (
                  <Select
                    value={accountYear}
                    style={{ width: 120 }}
                    onChange={value => {
                      setAccountYear(value);
                    }}
                    options={yearList.map(value => ({
                      value,
                      label: value,
                    }))}
                  />
                )}
              </div>
              {overView === EProductType.company && (
                <>
                  <div className={styles.companyExportInfo}>
                    <span className={styles.text1}>
                      {I18N.work.corporateCarbonEmissions}
                    </span>
                    <span className={styles.text2}>（tCO₂e）</span>
                    <span className={styles.text3}>
                      {workbenchDetail?.totalEmission || '-'}
                    </span>
                    {workbenchDetail?.totalEmissionRatio !== undefined &&
                      workbenchDetail?.totalEmissionRatio !== '-' && (
                        <>
                          <span className={styles.text4}>
                            {I18N.work.comparedToLastYear}
                          </span>
                          <IconAlibaba
                            type='icon-messages_icon_send'
                            style={{
                              transform:
                                workbenchDetail.totalEmissionRatioStatus === 2
                                  ? 'rotate(180deg)'
                                  : 'rotate(0deg)',
                            }}
                          />
                          {/* <img src='' alt='' /> */}
                          <span className={styles.text5}>
                            {workbenchDetail?.totalEmissionRatio}%
                          </span>
                        </>
                      )}
                  </div>
                  <div className={styles.scopeCards}>
                    <div
                      className={classNames(styles.scopeCard, styles.scopeOne)}
                    >
                      <div>
                        <div className={styles.scopeCardTitle}>
                          <div className={styles.box} />
                          <div>
                            {I18N.work.scope1}
                            {workbenchDetail?.scopeOne || '-'} tCO₂e
                          </div>
                        </div>
                        <div className={styles.scopeCardValue}>
                          {workbenchDetail?.oneRatio || '-'} %
                        </div>
                        <div className={styles.processWrapper}>
                          <div
                            className={styles.process}
                            style={{
                              width: `${workbenchDetail?.oneRatio || 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={classNames(styles.scopeCard, styles.scopeTwo)}
                    >
                      <div>
                        <div className={styles.scopeCardTitle}>
                          <div className={styles.box} />
                          <div>
                            {I18N.work.scope2}
                            {workbenchDetail?.scopeTwo || '-'} tCO₂e
                          </div>
                        </div>
                        <div className={styles.scopeCardValue}>
                          {workbenchDetail?.twoRatio || '-'} %
                        </div>
                        <div className={styles.processWrapper}>
                          <div
                            className={styles.process}
                            style={{
                              width: `${workbenchDetail?.twoRatio || 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={classNames(
                        styles.scopeCard,
                        styles.scopeThree,
                      )}
                    >
                      <div>
                        <div className={styles.scopeCardTitle}>
                          <div className={styles.box} />
                          <div>
                            {I18N.work.fanWeisan}
                            {workbenchDetail?.scopeThree || '-'} tCO₂e
                          </div>
                        </div>
                        <div className={styles.scopeCardValue}>
                          {workbenchDetail?.threeRatio || '-'} %
                        </div>
                        <div className={styles.processWrapper}>
                          <div
                            className={styles.process}
                            style={{
                              width: `${workbenchDetail?.threeRatio || 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={classNames(
                      styles.companyCards,
                      styles.companyInfoCards,
                    )}
                  >
                    <div className={styles.card}>
                      <div className={styles.info}>
                        <div>
                          <span className={styles.infoTitle}>
                            {I18N.work.numberOfAccountingEntities}
                          </span>
                          <span className={styles.unit}>
                            {I18N.work.individual}
                          </span>
                        </div>
                        <div className={styles.value}>
                          {workbenchDetail?.orgCounts || '-'}
                        </div>
                      </div>
                      <div>
                        <img src={card1Svg} alt='' />
                      </div>
                    </div>
                    <div className={styles.card}>
                      <div className={styles.info}>
                        <div>
                          <span className={styles.infoTitle}>
                            {I18N.work.reportProgress}
                          </span>
                          <span className={styles.unit}>
                            {I18N.work.percentage}
                          </span>
                        </div>
                        <div className={styles.value}>
                          {workbenchDetail?.accountPercent || '-'}%
                        </div>
                      </div>
                      <div>
                        <img src={card3Svg} alt='' />
                      </div>
                    </div>
                    <div className={styles.companyInfoCard}>
                      <div className={styles.companyInfoCardTitles}>
                        <span className={styles.infoCardTitle}>
                          {fillInByTextMap()[workbenchDetail?.timeType || '0']}
                        </span>
                        <span className={styles.infoCardUnit}>
                          {I18N.work.individual}
                        </span>
                        <Tooltip
                          title={
                            fillInbyTextTipMap[workbenchDetail?.timeType || '0']
                          }
                        >
                          <span>
                            <IconAlibabaNew type='icon-icon-tishi' />
                          </span>
                        </Tooltip>
                      </div>
                      <div className={styles.companyInfoItems}>
                        {infoItems.map(item => (
                          <div className={styles.companyInfoItem}>
                            <span className={styles.itemValue}>
                              {item.value || '0'}
                            </span>
                            <span className={styles.itemTitle}>
                              {item.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {!!infoItems?.[4]?.value && (
                    <div className={styles.CompanyExportChart}>
                      <CompanyExportChart
                        orgComparisonData={
                          orgComparisonResult?.data?.data?.data
                            ?.orgComparisonData || []
                        }
                      />
                    </div>
                  )}
                </>
              )}
              {overView === EProductType.product && (
                <div className={styles.cards}>
                  {cardInfo().map((item, index) => (
                    <Link
                      to={item.target}
                      className={styles.card}
                      target='_blank'
                      onClick={e => {
                        if (!getPermission(item.permission)) {
                          e.stopPropagation();
                          e.preventDefault();
                        }
                      }}
                    >
                      <div className={styles.info}>
                        <div>
                          <span className={styles.infoTitle}>{item.title}</span>
                          <span className={styles.unit}>{item.unit}</span>
                        </div>
                        {/* eslint-disable-next-line no-nested-ternary */}
                        <div className={styles.value}>
                          {productCardNum[index]}
                        </div>
                      </div>
                      <div>
                        <img src={item.icon} alt='' />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {overView === EProductType.product && !!productCardNum?.[0] && (
                <div className={styles.productChart}>
                  <div className={styles.chartHeader}>
                    <Popover
                      overlayInnerStyle={{ padding: '4px' }}
                      placement='bottomLeft'
                      open={showPopup}
                      onOpenChange={open => setShowPopup(open)}
                      arrow={false}
                      content={
                        <div className={styles.popoverWrapper}>
                          {productList?.map(item => (
                            <OptionRender
                              label={item.productName}
                              data={item}
                              onClick={() => {
                                setActiveProduct(item.id);
                                setShowPopup(false);
                              }}
                            />
                          ))}
                        </div>
                      }
                    >
                      <div className={styles.productNames}>
                        {
                          productList.find(item => item.id === activeProduct)
                            ?.productName
                        }
                        <IconAlibaba
                          type='icon-icon_arrow_rioght'
                          className={styles.arrowRight}
                          style={{
                            transform: showPopup
                              ? 'rotate(-90deg)'
                              : 'rotate(90deg)',
                          }}
                        />
                      </div>
                    </Popover>
                    {/* <Select
                      placeholder='Borderless'
                      variant='borderless'
                      style={{ flex: 1, width: '160px' }}
                      value={activeProduct}
                      onChange={value => {
                        setActiveProduct(value);
                      }}
                      options={productList.map(item => ({
                        ...item,
                        value: item.id,
                        label: item.productName,
                      }))}
                      optionRender={OptionRender}
                    /> */}
                    <div className={styles.info}>
                      <div>
                        <span className={styles.unit}>
                          {I18N.carbonFootprint3.functionalUnits2}
                        </span>
                        <span className={styles.value}>
                          {
                            productList.find(item => item.id === activeProduct)
                              ?.accountName
                          }
                        </span>
                      </div>
                      <div>
                        <span className={styles.unit}>
                          {I18N.carbonFootprint3.accountingType}
                        </span>
                        <span className={styles.value}>
                          {productList.find(item => item.id === activeProduct)
                            ?.type === 0
                            ? I18N.carbonFootprint3.quickAccounting
                            : I18N.carbonFootprint3.processAccounting}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.charts}>
                    <div className={classNames(styles.chart)}>
                      <div className={styles.title}>
                        <IconAlibabaNew type='icon-icon-zongpaifangliang' />
                        {I18N.enterpriseCarbonAccount2.totalEmissions}
                        <span>（kgCO₂e）</span>
                      </div>
                      <div className={styles.allEmission}>
                        <div className={styles.allEmissionTitle}>
                          {productDetail?.charType?.emissionTotal}
                        </div>
                        <img src={emissionSvg} alt='' />
                      </div>
                    </div>
                    <div className={styles.chart}>
                      <div className={styles.title}>
                        {I18N.work.byLifecycle}
                      </div>
                      <LifecycleChart data={productDetail?.chartStage} />
                    </div>
                    <div className={styles.chart}>
                      <div className={styles.title}>
                        {I18N.work.byEmissionSourceCategory}
                      </div>
                      <SourceTypeChart
                        chartData={productDetail?.charType?.byTypes}
                      />
                    </div>
                  </div>
                  {/* {productDetail?.emissionSankey &&
                    productDetail?.emissionSankey.stageList.length > 0 && (
                      <section className={styles.sankeyChartWrapper}>
                        <div className={styles.sankeyCate}>
                          <div>{I18N.carbonFootprint.emissions}</div>
                          <div>{I18N.carbonFootprint3.stage}</div>
                          <div>{I18N.carbonFootprint.emissionSourceType}</div>
                          <div>{I18N.carbonFootprint.emissionSources}</div>
                        </div>
                        <SankeyChart
                          sankeyChartData={productDetail?.emissionSankey}
                          height={maxHeight}
                        />
                      </section>
                    )} */}
                </div>
              )}
            </div>
          )}
        {IdentityInfo?.userDemo === 0 && (
          <div className={styles.links}>
            <div className={styles.linkHeader}>
              <div className={styles.linkText}>
                {I18N.work.carbonCertification}
              </div>
              <Permission flag='CertificationCarbonFootprintProject'>
                <Link
                  className={styles.more}
                  target='_blank'
                  to={RouteMaps.CertificationProductIndex}
                >
                  <div>{I18N.components.viewMore}</div>
                  <img src={rightArrowSvg} alt='' />
                </Link>
              </Permission>
            </div>
            <div className={styles.Certifications}>
              {CarbonAuthData.map(item => (
                <Permission flag='CertificationCarbonFootprintProject'>
                  <Link
                    className={styles.Certification}
                    key={item.name}
                    target='_blank'
                    to={RouteMaps.CertificationProductIndex}
                  >
                    <div className={styles.certImg}>
                      <img
                        src={item.imgUrl}
                        alt=''
                        className={styles.certImgTag}
                      />
                    </div>
                    <div className={styles.certTitle}>{item.name}</div>
                  </Link>
                </Permission>
              ))}
              {CarbonAuthData.length > 0 && CarbonAuthData.length < 3 && (
                <div className={styles.Certification}>
                  <div className={styles.emptyWrapper}>
                    <Empty
                      description={false}
                      image='https://oss-saas.carbonstop.com/saas/dashborad/empty.svg'
                    >
                      <Link
                        to={RouteMaps.CertificationProductIndex}
                        onClick={e => {
                          if (
                            !getPermission(
                              'CertificationCarbonFootprintProject',
                            )
                          ) {
                            e.stopPropagation();
                            e.preventDefault();
                          }
                        }}
                      >
                        <Button
                          type='default'
                          disabled={
                            !getPermission(
                              'CertificationCarbonFootprintProject',
                            )
                          }
                        >
                          {I18N.work.goAuthenticate}
                        </Button>
                      </Link>
                    </Empty>
                  </div>
                </div>
              )}
              {CarbonAuthData.length === 0 && (
                <div className={styles.CertificationsEmpty}>
                  <Empty
                    description={false}
                    image='https://oss-saas.carbonstop.com/saas/dashborad/empty.svg'
                  >
                    <Link
                      to={RouteMaps.CertificationProductIndex}
                      onClick={e => {
                        if (
                          !getPermission('CertificationCarbonFootprintProject')
                        ) {
                          e.stopPropagation();
                          e.preventDefault();
                        }
                      }}
                    >
                      <Button
                        type='default'
                        disabled={
                          !getPermission('CertificationCarbonFootprintProject')
                        }
                      >
                        {I18N.work.goAuthenticate}
                      </Button>
                    </Link>
                  </Empty>
                </div>
              )}
            </div>
          </div>
          // </Permission>
        )}
        <div className={styles.links}>
          <div className={styles.linkHeader}>
            <div className={styles.linkText}>
              {I18N.work.productUsageByHand}
            </div>
            <a
              className={styles.more}
              href={
                locale === LocaleType.enUS
                  ? 'https://carbonstop.feishu.cn/docx/D2xGdY1NXocIVix4kkEclYZ0nqp'
                  : 'https://carbonstop.feishu.cn/wiki/wikcny2F7yEJN35P0Z7SbwPzs7c'
              }
              target='_blank'
              rel='noreferrer'
            >
              <div>{I18N.components.viewMore}</div>
              <img src={rightArrowSvg} alt='' />
            </a>
          </div>
          <div className={styles.handbooks}>
            {productManuals.map(item => (
              <a
                href={item.manualUrl}
                target='_blank'
                className={styles.handbook}
                key={item.id}
                rel='noreferrer'
              >
                <div className={styles.handbookTitle}>{item.productName}</div>
                <div className={styles.handbookDes}>{item.productInfo}</div>
              </a>
            ))}
          </div>
        </div>
        <div className={styles.links}>
          <div className={styles.linkHeader}>
            <div className={styles.linkText}>
              {I18N.workbench.lowCarbonInformation}
            </div>
            <a
              className={styles.more}
              href={
                locale === LocaleType.enUS
                  ? 'https://www.carbonstop.com/en/dualCarbonInsight?lowCarbon=off'
                  : 'https://www.carbonstop.com/zh/dualCarbonInsight?lowCarbon=off'
              }
              target='_blank'
              rel='noreferrer'
            >
              <div>{I18N.components.viewMore}</div>
              <img src={rightArrowSvg} alt='' />
            </a>
          </div>
          <div className={styles.InfoCards}>
            {ContentArticleData?.map(item => (
              <InfoCard key={item.id} info={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workbench;
