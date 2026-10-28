import I18N from '@src/lang/I18N';
import { Cascader, Form, Select } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';
import { ValueOf } from 'type-fest';

import styles from './index.module.less';
import { getTrendAnalysisOrgData } from './service';
import { Org } from '../AccountingList/type';
import CompareChart from '../AnnualReport/chart/CompareChart';
import { STANDARD } from '../AnnualReport/constant';

const TrendAnalysis: FC = () => {
  const [type, setType] = useState<ValueOf<typeof STANDARD>>(STANDARD.GHG);

  const [yearNum, setYearNum] = useState(5);

  const [orgTree, setOrgTree] = useState<Org[]>([]);

  const [selectedOrgList, setSelectedOrgList] = useState<Org[]>([]);

  const [orgTreeLoading, setOrgTreeLoading] = useState(false);

  const org = useMemo(() => [...selectedOrgList].pop(), [selectedOrgList]);

  useEffect(() => {
    setOrgTreeLoading(true);

    getTrendAnalysisOrgData({ yearNum: 15 })
      .then(({ data }) => {
        setOrgTree(data.data || []);

        if (data.data?.length > 0) {
          setSelectedOrgList([data.data[0]]);
        }
      })
      .finally(() => {
        setOrgTreeLoading(false);
      });
  }, []);

  return (
    <div className={styles.trendAnalysis}>
      <div className={styles.trendAnalysisHeader}>
        <div className={styles.title}>
          {I18N.enterpriseCarbonAccount2.trendAnalysis}
        </div>
        <Form layout='inline'>
          <Form.Item label={I18N.enterpriseCarbonAccount2.accountingEntity}>
            <Cascader
              className={styles.select}
              popupClassName={styles.orgSelectDropdown}
              allowClear={false}
              changeOnSelect
              value={selectedOrgList.map(({ id }) => id)}
              loading={orgTreeLoading}
              placeholder={I18N.enterpriseCarbonAccount2.pleaseSelectAccounting}
              options={orgTree}
              fieldNames={{ label: 'name', value: 'id' }}
              displayRender={labels => [...labels].pop()}
              expandTrigger='hover'
              onChange={(_, orgs) => {
                setSelectedOrgList(orgs as unknown as Org[]);
              }}
            />
          </Form.Item>
          <Form.Item label={I18N.enterpriseCarbonAccount2.time}>
            <Select
              className={styles.select}
              value={yearNum}
              placeholder={I18N.enterpriseCarbonAccount2.time}
              options={[
                { value: 5, label: I18N.enterpriseCarbonAccount2.recentYears2 },
                {
                  value: 10,
                  label: I18N.enterpriseCarbonAccount2.recentYears3,
                },
                {
                  value: 15,
                  label: I18N.enterpriseCarbonAccount2.recentYears4,
                },
              ]}
              onChange={setYearNum}
            />
          </Form.Item>
          <Form.Item label={I18N.enterpriseCarbonAccount2.standard}>
            <Select
              className={styles.select}
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
              onChange={setType}
            />
          </Form.Item>
        </Form>
      </div>
      <CompareChart
        type={type}
        yearNum={yearNum}
        chartType='amount'
        org={org}
      />
      <CompareChart
        type={type}
        yearNum={yearNum}
        chartType='intensity'
        org={org}
      />
    </div>
  );
};

export default TrendAnalysis;
