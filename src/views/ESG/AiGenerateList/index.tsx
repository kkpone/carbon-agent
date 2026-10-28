import I18N from '@src/lang/I18N';
import { FC, useState } from 'react';
import styles from './index.module.less';
import { IconAlibaba } from '@/components/iconfont';
import { useHistory } from 'react-router-dom';
import { RouteMaps } from '@/router/route-paths';
import { useRequest } from 'ahooks';
import { getReportList } from '../AiGenerateHome/service';
import { ReportCard } from '../components/ReportCard';
import { Input, Select, Spin } from 'antd';

export interface IAiGenerateListProps {}

export const AiGenerateList: FC<IAiGenerateListProps> = () => {
  const history = useHistory();
  const [name, setName] = useState('');
  const [searchName, setSearchName] = useState('');
  const [status, setStatus] = useState<0 | 1 | 4>(4);
  const {
    data: reportListData,
    run,
    loading,
  } = useRequest(
    () =>
      getReportList({
        reportName: searchName,
        state: status === 4 ? undefined : status,
        pageSize: 1000,
      }),
    {
      refreshDeps: [searchName, status],
    },
  );

  const reportList = reportListData?.data.rows || [];
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div
          className={styles.back}
          onClick={() => history.push(RouteMaps.ESGAiGenerateHome)}
        >
          <IconAlibaba type='icon-a-icon_return' />
        </div>
        {I18N.esg.moreReports}
      </div>
      <div className={styles.searchWrapper}>
        <Input.Search
          // prefix={<SearchOutlined />}
          style={{
            width: 220,
          }}
          placeholder={I18N.esg.searchReportName}
          value={name}
          onSearch={() => setSearchName(name)}
          onChange={e => setName(e.target.value)}
          // onBlur={e => setName(e.target.value)}
        />
        <Select
          style={{
            width: 220,
          }}
          value={status}
          onChange={v => setStatus(v)}
          options={[
            {
              label: I18N.esg.allFormsSubmitted,
              value: 4,
            },
            {
              label: I18N.esg.outline,
              value: 0,
            },
            {
              label: I18N.carbonNeutral.report,
              value: 1,
            },
          ]}
        />
      </div>
      <Spin spinning={loading}>
        <div className={styles.content}>
          {reportList.map(report => (
            <ReportCard report={report} run={run} />
          ))}
        </div>
      </Spin>
    </div>
  );
};

export default AiGenerateList;
