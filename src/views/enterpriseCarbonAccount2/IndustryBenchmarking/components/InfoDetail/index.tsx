import I18N from '@src/lang/I18N';
import { Collapse, Select, Tooltip } from 'antd';
import classNames from 'classnames';
import { FC, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { CompanyInfo } from './CompanyInfo';
import arrow1Svg from './arrow1.svg';
import arrow2Svg from './arrow2.svg';
import styles from './index.module.less';
import { BenchMarkDetailComparison } from '../../service';
import { dataType } from '../EmissionsChart';

const { Panel } = Collapse;

interface IInfoDetailProps {
  benchMarkDetailComparison?: BenchMarkDetailComparison[];
  benchMarkItem: 'avg' | 'median';
  setBenchMarkItem: (value: 'avg' | 'median') => void;
  updateYear: (value: {
    benchMarkYear: string;
    benchMarkDataType: string;
    industryId: string;
    targetYear: string;
    index: number;
  }) => void;
  unitType: string;
}

export const InfoDetail: FC<IInfoDetailProps> = props => {
  const {
    benchMarkDetailComparison,
    benchMarkItem,
    setBenchMarkItem,
    updateYear,
    unitType,
  } = props;

  const [companyInfo, setCompanyInfo] = useState<BenchMarkDetailComparison>();

  const scopeThreeEmissions = useMemo(() => {
    const origin: {
      type: string;
      name: string;
      values: {
        categoryEmissionsAvg: number;
        categoryEmissionsMedian: number;
        categoryDisclosureRate: number;
      }[];
    }[] = [];
    benchMarkDetailComparison?.forEach(item =>
      item.categoryIndustry?.forEach((category, index) => {
        if (!origin[index]) {
          origin[index] = {
            type: I18N.template(I18N.enterpriseCarbonAccount2.categoryInd, {
              val1: index + 1,
            }),
            name: category.categoryName,
            values: [],
          };
        }
        origin[index].values.push({
          categoryEmissionsAvg: category.categoryEmissionsAvg,
          categoryEmissionsMedian: category.categoryEmissionsMedian,
          categoryDisclosureRate: category.categoryDisclosureRate,
        });
      }),
    );
    return origin;
  }, [benchMarkDetailComparison]);

  const baseInfo = useMemo(() => {
    const origin: {
      type: string;
      name: string;
      subName: string;
      values: any[];
    }[] = [
      {
        type: 'select',
        name: I18N.Certification.dataYear,
        subName: '',
        values: [],
      },
      {
        type: 'numberPick',
        name: I18N.carbonFootprint3.totalEmissions,
        subName:
          unitType === dataType.amount
            ? 'tCO₂e'
            : I18N.enterpriseCarbonAccount2.tcOe100,
        values: [],
      },
      {
        type: 'numberPick',
        name: I18N.enterpriseCarbonAccount2.scope1Emissions2,
        subName:
          unitType === dataType.amount
            ? 'tCO₂e'
            : I18N.enterpriseCarbonAccount2.tcOe100,
        values: [],
      },
      {
        type: 'numberPick',
        name: I18N.enterpriseCarbonAccount2.scope2Emissions2,
        subName:
          unitType === dataType.amount
            ? 'tCO₂e'
            : I18N.enterpriseCarbonAccount2.tcOe100,
        values: [],
      },
      {
        type: 'numberPick',
        name: I18N.enterpriseCarbonAccount2.scopeThreeEmissions3,
        subName:
          unitType === dataType.amount
            ? 'tCO₂e'
            : I18N.enterpriseCarbonAccount2.tcOe100,
        values: [],
      },
      {
        type: 'content',
        name: I18N.enterpriseCarbonAccount2.emissionReductionTargets,
        subName: '',
        values: [],
      },
      {
        type: 'content',
        name: I18N.enterpriseCarbonAccount2.emissionReductionProjects,
        subName: '',
        values: [],
      },
    ];
    benchMarkDetailComparison?.forEach(item => {
      origin[0].values.push({
        benchMarkYear: item.benchMarkYear,
        benchMarkYearSelect: item.benchMarkYearSelect,
        industryId: item.industryId,
        benchMarkDataType: item.benchMarkDataType,
      });
      origin[1].values.push({
        avg: item.emissionsTotalAvg,
        median: item.emissionsTotalMedian,
        level: item.totalRatingCompany,
      });
      origin[2].values.push({
        avg: item.scope1EmissionsAvg,
        median: item.scope1EmissionsMedian,
        level: item.scope1RatingCompany,
      });
      origin[3].values.push({
        avg: item.scope2EmissionsAvg,
        median: item.scope2EmissionsMedian,
        level: item.scope2RatingCompany,
      });
      origin[4].values.push({
        avg: item.scope3EmissionsAvg,
        median: item.scope3EmissionsMedian,
        level: item.scope3RatingCompany,
        scope3PublishRate: item.scope3PublishRate,
      });
      origin[5].values.push(item.reductionContent);
      origin[6].values.push(item.reductionProjectPublish);
    });
    return origin;
  }, [benchMarkDetailComparison, unitType]);

  const headerInfo = useMemo(() => {
    const info: { name: string; industryId: string; benchMarkYear: number }[] =
      [];
    benchMarkDetailComparison
      ?.filter(item => item.benchMarkDataType !== '1')
      .forEach(item => {
        info.push({
          name: item.benchMarkName,
          industryId: item.industryId,
          benchMarkYear: item.benchMarkYear,
        });
      });
    return info;
  }, [benchMarkDetailComparison]);

  useEffect(() => {
    const scrollContainers = document.querySelectorAll('.scrollWrapper');
    setCompanyInfo(undefined);
    scrollContainers.forEach(container => {
      container.addEventListener('scroll', () => {
        const { scrollLeft } = container;

        scrollContainers.forEach(otherContainer => {
          if (otherContainer !== container) {
            otherContainer.scrollLeft = scrollLeft;
          }
        });
      });
    });
  }, [benchMarkDetailComparison]);
  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>
        {I18N.enterpriseCarbonAccount2.detailedList}
      </div>
      <div className={styles.header}>
        <div className={styles.firstCol}>
          {I18N.enterpriseCarbonAccount2.benchmarkTerm}
        </div>
        <div className={styles.secondCol}>
          <div
            onClick={() => setBenchMarkItem('avg')}
            className={classNames(styles.btn, {
              [styles.active]: benchMarkItem === 'avg',
            })}
          >
            {I18N.enterpriseCarbonAccount2.industryAverage}
          </div>
          <div
            onClick={() => setBenchMarkItem('median')}
            className={classNames(styles.btn, {
              [styles.active]: benchMarkItem === 'median',
            })}
          >
            {I18N.enterpriseCarbonAccount2.industryMedian3}
          </div>
        </div>
        <div className={classNames(styles.scrollWrapper, 'scrollWrapper')}>
          {headerInfo.map(item => (
            <div className={styles.item}>{item.name}</div>
          ))}
        </div>
      </div>
      <div className={classNames(styles.row, styles.operation)}>
        <div className={styles.firstCol} style={{ color: '#343a40' }}>
          {I18N.carbonFootprint.operation}
        </div>
        <div className={styles.secondCol} />
        <div className={classNames(styles.scrollWrapper, 'scrollWrapper')}>
          <div className={styles.item}>
            <Link to='/enterpriseCarbonAccounting/pom'>
              {I18N.enterpriseCarbonAccount2.operationalData}
            </Link>
            <Link to='/enterpriseCarbonAccounting/reducingPlan'>
              {I18N.enterpriseCarbonAccount2.emissionReductionTargets}
            </Link>
          </div>
          {headerInfo.slice(1).map(item => (
            <div
              className={styles.item}
              onClick={() => {
                if (companyInfo?.industryId === item.industryId) {
                  setCompanyInfo(undefined);
                } else {
                  setCompanyInfo(
                    benchMarkDetailComparison?.find(
                      i =>
                        i.industryId === item.industryId &&
                        i.benchMarkYear === item.benchMarkYear,
                    ),
                  );
                }
              }}
            >
              {companyInfo?.industryId === item.industryId &&
              companyInfo?.benchMarkYear === item.benchMarkYear
                ? I18N.enterpriseCarbonAccount2.storageDetails
                : I18N.enterpriseCarbonAccount2.expandDetails}
              <img
                src={
                  companyInfo?.industryId === item.industryId &&
                  companyInfo?.benchMarkYear === item.benchMarkYear
                    ? arrow1Svg
                    : arrow2Svg
                }
                alt=''
              />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.companyInfo}>
        <CompanyInfo companyInfo={companyInfo} />
      </div>
      <div className={styles.scopeInfo}>
        <Collapse defaultActiveKey={['1', '2']} onChange={() => {}}>
          <Panel header={I18N.carbonFootprint3.basicInformation} key='1'>
            {baseInfo.map(item => (
              <div className={styles.row}>
                <div className={styles.firstCol}>
                  <div className={styles.unitName}>{item.name}</div>
                  <div className={styles.unitType}>{item.subName}</div>
                </div>
                <div className={styles.secondCol}>
                  {item.type === 'numberPick' && (
                    <div className={styles.item}>
                      {/* {item.values[0]?.avg || '-'} */}

                      {(benchMarkItem === 'avg'
                        ? item.values[0]?.avg
                        : item.values[0]?.median) || '-'}
                      {item.values[0]?.scope3PublishRate && (
                        <>
                          <br />
                          <div
                            className={styles.unitType}
                            style={{ textAlign: 'center' }}
                          >
                            {I18N.template(
                              I18N.enterpriseCarbonAccount2.itemv,
                              { val1: item.values[0]?.scope3PublishRate },
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  {item.type === 'content' && (
                    <div className={styles.item}>{item.values[0] || '-'}</div>
                  )}
                  {item.type === 'select' && (
                    <div className={styles.item}>
                      <Select
                        defaultValue={item.values[0]?.benchMarkYear}
                        value={item.values[0]?.benchMarkYear}
                        style={{ width: 120, textAlign: 'center' }}
                        onChange={v => {
                          updateYear({
                            ...item.values[0],
                            targetYear: v,
                          });
                        }}
                        options={item.values[0]?.benchMarkYearSelect.map(i => ({
                          label: i,
                          value: i,
                        }))}
                      />
                    </div>
                  )}
                </div>
                <div
                  className={classNames(styles.scrollWrapper, 'scrollWrapper')}
                >
                  {item.type === 'numberPick' &&
                    item.values.slice(1).map(value => (
                      <div className={styles.item}>
                        <div>{value.avg || '-'}</div>
                        <div
                          className={styles.unitType}
                          style={{ textAlign: 'center' }}
                        >
                          {I18N.enterpriseCarbonAccount2.enterpriseRating2}
                          {value.level}
                        </div>
                      </div>
                    ))}
                  {item.type === 'content' &&
                    item.values
                      .slice(1)
                      .map(value => (
                        <div className={styles.item}>{value || '-'}</div>
                      ))}
                  {item.type === 'select' &&
                    item.values.slice(1).map((value, index) => (
                      <div className={styles.item}>
                        <Select
                          defaultValue={value?.benchMarkYear}
                          value={value?.benchMarkYear}
                          style={{ width: 120 }}
                          onChange={v => {
                            updateYear({
                              ...value,
                              targetYear: v,
                              index,
                            });
                          }}
                          options={value?.benchMarkYearSelect.map(i => ({
                            label: i,
                            value: i,
                          }))}
                        />
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </Panel>
          <Panel
            header={
              <div>
                {I18N.enterpriseCarbonAccount2.scopeThreeEmissions2}{' '}
                <span>
                  {unitType === dataType.amount
                    ? I18N.enterpriseCarbonAccount2.unitTCo
                    : I18N.enterpriseCarbonAccount2.unitTCo6}
                </span>
              </div>
            }
            key='2'
          >
            {scopeThreeEmissions.map((item, index) => (
              <div className={styles.row}>
                <div className={styles.firstCol}>
                  <div className={styles.unitType}>{item.type}</div>
                  <Tooltip title={item.name}>
                    <div
                      className={classNames(
                        styles.unitName,
                        styles.colUnitName,
                      )}
                    >
                      {item.name}
                    </div>
                  </Tooltip>
                </div>
                <div className={styles.secondCol}>
                  <div className={styles.unitName}>
                    {(benchMarkItem === 'avg'
                      ? item.values[0].categoryEmissionsAvg
                      : item.values[0].categoryEmissionsMedian) || '-'}
                  </div>
                  <div className={styles.unitType}>
                    {item.values[0].categoryDisclosureRate}
                    {I18N.enterpriseCarbonAccount2.disclosure}
                  </div>
                </div>
                <div
                  className={classNames('scrollWrapper', {
                    [styles.scrollWrapper]:
                      index !== scopeThreeEmissions.length - 1,
                    [styles.lastScrollWrapper]:
                      index === scopeThreeEmissions.length - 1,
                  })}
                >
                  {item.values.slice(1).map(value => (
                    <div className={styles.item}>
                      {value.categoryEmissionsAvg || '-'}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Panel>
        </Collapse>
      </div>
    </div>
  );
};
