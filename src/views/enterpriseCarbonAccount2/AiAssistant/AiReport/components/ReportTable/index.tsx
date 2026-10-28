import Permission, { usePermission } from '@src/components/Permission';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { IconAlibaba } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { Toast } from '@src/utils/Toast';
import { ColumnsType } from 'antd/lib/table';
import classNames from 'classnames';
import { isNil, omit } from 'lodash-es';
import { FC } from 'react';
import { useHistory } from 'react-router-dom';

import styles from './index.module.less';
import ScoresTag from '../../../components/RankTag';
import { RANK_LIST, REPORT_COLLECT_STATUS } from '../../constant';
import { collectReport, getReportList } from '../../service';
import { Report, SearchParams } from '../../type';

const reportAnalysisFlat = 'enterprise:cdpReportData:reportAnalysis';

type ReportTableProps = {
  searchParams: SearchParams;
  setSearchParams: (params: Partial<SearchParams>) => void;
  onCollectSuccess: () => void;
};

const ReportTable: FC<ReportTableProps> = ({
  searchParams,
  setSearchParams,
  onCollectSuccess,
}) => {
  const history = useHistory();
  const canEnderAi = usePermission(reportAnalysisFlat);

  const columns: ColumnsType<Report> = [
    {
      title: I18N.enterpriseCarbonAccount2.companyName,
      dataIndex: 'companyName',
      width: 232,
      ellipsis: true,
      fixed: 'left',
      render: (_, { companyName, collectStatus, id }) => {
        const collected = collectStatus === REPORT_COLLECT_STATUS.COLLECTED;
        return (
          <>
            <IconAlibaba
              className={classNames(styles.star, { [styles.cStar]: collected })}
              type={collected ? 'icon-icon_star_fill' : 'icon-icon_star_line'}
              onClick={async () => {
                await collectReport({ reportId: id });
                Toast('success', I18N.carbonFootprint.operationSuccessful);
                onCollectSuccess();
              }}
            />
            <span
              title={companyName}
              className={styles.companyName}
              onClick={() => {
                if (canEnderAi) {
                  history.push(
                    `${RouteMaps.enterpriseCarbonAccountingAiReportDetail}?reportId=${id}`,
                  );
                }
              }}
            >
              {companyName}
            </span>
          </>
        );
      },
    },
    {
      title: I18N.carbonFootprint.year,
      dataIndex: 'year',
      width: 96,
      ellipsis: true,
    },
    {
      title: I18N.enterpriseCarbonAccount2.score,
      dataIndex: 'scores',
      width: 96,
      ellipsis: true,
      filteredValue:
        !isNil(searchParams.scores) && !!searchParams.scores
          ? (searchParams.scores as string).split(',')
          : undefined,
      filters: RANK_LIST.map(score => ({
        value: score,
        text: score,
      })),
      render: (scores: string) =>
        RANK_LIST.includes(scores) ? <ScoresTag scores={scores} /> : scores,
    },
    {
      title: I18N.enterpriseCarbonAccount2.industry,
      dataIndex: 'industry',
      width: 112,
      ellipsis: true,
    },
    {
      title: I18N.enterpriseCarbonAccount2.range1And2Rows,
      dataIndex: 'scopes',
      width: 207,
      ellipsis: true,
    },
    {
      title: I18N.enterpriseCarbonAccount2.totalRevenue,
      dataIndex: 'revenue',
      width: 228,
      ellipsis: true,
      render: (t: string) => {
        if (isNaN(Number(t))) {
          return t;
        }
        return Number(t).toLocaleString();
      },
    },
    {
      title: I18N.enterpriseCarbonAccount2.unitRevenueAllocation,
      dataIndex: 'unitIntensity',
      width: 248,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: '__operate__',
      width: 142,
      fixed: 'right',
      render: (_, { id }) => (
        <Permission flag={reportAnalysisFlat}>
          <div
            className={styles.operateBtn}
            onClick={() =>
              history.push(
                `${RouteMaps.enterpriseCarbonAccountingAiReportDetail}?reportId=${id}`,
              )
            }
          >
            {I18N.enterpriseCarbonAccount2.aiInterpretation}
          </div>
        </Permission>
      ),
    },
  ];

  return (
    <CommonTable
      className={styles.reportTable}
      rowKey='id'
      columns={columns}
      scroll={{ x: 1200 }}
      pagination={{
        current: searchParams.pageNum,
        pageSize: searchParams.pageSize,
      }}
      searchParams={searchParams}
      fetchApi={() => getReportList(omit(searchParams, 'refreshFlag'))}
      returnFetchApi={back => ({
        data: back.data.rows,
        count: back.data.total,
      })}
      onChange={(pagination, filter, _, { action }) => {
        if (action === 'paginate') {
          setSearchParams({
            pageNum: pagination.current ?? 1,
            pageSize: pagination.pageSize ?? 10,
          });
        } else if (action === 'filter') {
          setSearchParams({
            scores:
              filter.scores instanceof Array
                ? (filter.scores as string[])
                : undefined,
            pageNum: 1,
          });
        }
      }}
    />
  );
};

export default ReportTable;
