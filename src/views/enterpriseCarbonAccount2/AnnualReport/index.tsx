/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-unused-vars */

import downImg from '@assets/svg/triangle.svg';
import I18N from '@src/lang/I18N';
import { Cascader, Select } from 'antd';
import classNames from 'classnames';
import { isNil } from 'lodash-es';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { ValueOf } from 'type-fest';

import { checkPermissions } from '@/components/Permission/utils';
import { IconAlibaba } from '@/components/iconfont';
import { Toast } from '@/utils/Toast';

import { Benchmarking } from './chart/Benchmarking';
import CateChart from './chart/CateChart';
import ChildOrgChart from './chart/ChildOrgChart';
import GaugeChart from './chart/GaugeChart';
import SankeyChart from './chart/SankeyChart';
import TopChart from './chart/TopChart';
import TrendChart from './chart/TrendChart';
import AIReductionAdvice from './components/AIReductionAdvice';
import { STANDARD } from './constant';
import styles from './index.module.less';
import {
  getDataBoardOrg,
  getEarliestYear,
  getStandardYear,
  getStandardYearList,
  saveStandardYear,
} from './service';
import { Indicator } from './type';
import { Org } from '../AccountingList/type';
import { ORG_TYPE } from '../constant';

type AnnualReportProps = {
  agentPreviewLayout?: boolean;
};

const OrgIconMap = {
  [ORG_TYPE.ENTERPRISE]: 'icon-a-icon-qiyebeijing',
  [ORG_TYPE.ORG]: 'icon-icon_hesuanfenzu',
  [ORG_TYPE.MAIN_PART]: 'icon-icon_hesuanzhuti',
};

const AnnualReport: React.FC<AnnualReportProps> = ({
  agentPreviewLayout = false,
}) => {
  const [type, setType] = useState<ValueOf<typeof STANDARD>>(STANDARD.GHG);

  const [year, setYear] = useState<number>();

  const [standardYear, setStandardYear] = useState<string>();

  const [standardYearList, setStandardYearList] = useState<string[]>([]);

  const [standardYearRefresh, setStandardYearRefresh] = useState(true);

  const [foreignId, setForeignId] = useState<number>();

  const [orgTree, setOrgTree] = useState<Org[]>([]);

  const [selectedOrgList, setSelectedOrgList] = useState<Org[]>([]);

  const [orgTreeLoading, setOrgTreeLoading] = useState(false);

  const [indicatorList, setIndicatorList] = useState<Indicator[]>([]);

  const [yearOptions, setYearOptions] = useState<
    { value: number; label: string }[]
  >([]);

  const org = useMemo(() => [...selectedOrgList].pop(), [selectedOrgList]);

  const queryStandardYear = async () => {
    const { data } = await getStandardYear();
    setStandardYear(data.data.reductionPlan.standardYear);
  };

  const onStandardYearChange = async (data: { standardYear: string }) => {
    await saveStandardYear(data);
    Toast('success', I18N.carbonFootprint.operationSuccessful);
    queryStandardYear();
    setStandardYearRefresh(!standardYearRefresh);
  };

  const hasAIReduce = checkPermissions(
    true,
    '/enterpriseCarbonAccounting/aiReduce',
  );

  useEffect(() => {
    getEarliestYear()
      .then(({ data }) => {
        const { years } = data.data;
        setYearOptions(
          (years || []).map(yearVal => ({
            value: yearVal,
            label: Number.isNaN(Number(yearVal))
              ? `${yearVal}`
              : I18N.template(I18N.enterpriseCarbonAccount2.yearV, {
                  val1: yearVal,
                }),
          })),
        );
        setYear(years[0]);
      })
      .catch(err => {
        setYear(moment().year() - 1);
        throw err;
      });
    getStandardYearList().then(({ data }) => {
      setStandardYearList(data.data);
    });
    queryStandardYear();
  }, []);

  useEffect(() => {
    if (!isNil(year)) {
      setOrgTreeLoading(true);
      getDataBoardOrg({ cYear: year })
        .then(({ data }) => {
          setOrgTree(data.data || []);

          if (data.data?.length > 0) {
            setSelectedOrgList([data.data[0]]);
          }
        })
        .finally(() => {
          setOrgTreeLoading(false);
        });
    }
  }, [year]);

  return (
    <div className={styles.annualReportContent}>
      <div className={classNames(styles.reportSection)}>
        <Cascader
          className={styles.orgSelect}
          popupClassName={styles.orgSelectDropdown}
          allowClear={false}
          changeOnSelect
          value={selectedOrgList.map(({ id }) => id)}
          loading={orgTreeLoading}
          placeholder={I18N.enterpriseCarbonAccount2.pleaseSelectAccounting}
          options={orgTree}
          fieldNames={{ label: 'name', value: 'id' }}
          expandTrigger='hover'
          displayRender={labels => {
            const childOrgs = labels.slice(1);

            return (
              <div className={styles.orgSelectLabel}>
                {org && (
                  <div
                    className={classNames(styles.orgIcon, {
                      [styles.companyOrgIcon]:
                        org.orgType === ORG_TYPE.ENTERPRISE,
                    })}
                  >
                    <IconAlibaba
                      className={styles.companyOrgImg}
                      type={OrgIconMap[org.orgType]}
                    />
                  </div>
                )}
                <div className={styles.rootOrgLabel}>{labels[0]}</div>
                {childOrgs.map(orgName => (
                  <div className={styles.orgLabel}>/{orgName}</div>
                ))}
                <img className={styles.downImg} src={downImg} alt='' />
              </div>
            );
          }}
          suffixIcon={null}
          onChange={(_, orgs) => {
            setSelectedOrgList(orgs as unknown as Org[]);
          }}
        />
        {!agentPreviewLayout && (
          <div>
            <Select
              className={styles.yearSelect}
              value={year}
              placeholder={I18N.enterpriseCarbonAccount2.time}
              options={yearOptions}
              onChange={value => {
                setYear(value);
                setForeignId(undefined);
                setSelectedOrgList([]);
              }}
            />
            <Select
              className={styles.classifySelect}
              value={type}
              placeholder={I18N.enterpriseCarbonAccount2.standard}
              options={[
                {
                  value: STANDARD.GHG,
                  label: I18N.enterpriseCarbonAccount2.ghgPr2,
                },
                {
                  value: STANDARD.ISO,
                  label: I18N.enterpriseCarbonAccount2.isoStandard,
                },
              ]}
              onChange={value => {
                setType(value);
              }}
            />
          </div>
        )}
      </div>
      <div className={styles.chartContent}>
        <GaugeChart
          year={year}
          type={type}
          foreignId={foreignId}
          org={org}
          standardYearList={standardYearList}
          standardYear={standardYear}
          standardYearRefresh={standardYearRefresh}
          setForeignId={setForeignId}
          setIndicatorList={setIndicatorList}
          onStandardYearChange={onStandardYearChange}
        />
        {year && org?.id && hasAIReduce && (
          <AIReductionAdvice year={year} orgId={org?.id} />
        )}
        <Benchmarking
          hideTypeSwitch={agentPreviewLayout}
          period={year}
          orgId={org?.id}
          orgName={org?.name}
        />
        {!agentPreviewLayout && (
          <TrendChart
            org={org}
            type={type}
            standardYearRefresh={standardYearRefresh}
          />
        )}
        <CateChart
          year={year}
          type={type}
          orgId={org?.id}
          standardYearRefresh={standardYearRefresh}
        />
        <TopChart org={org} year={year} />
        {org?.orgType !== ORG_TYPE.MAIN_PART && (
          <ChildOrgChart org={org} year={year} type={type} />
        )}
        <SankeyChart year={year} type={type} orgId={org?.id} />
      </div>
    </div>
  );
};

export default AnnualReport;
