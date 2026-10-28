/**
 * @file 碳排放信息管理表头
 */

import I18N from '@src/lang/I18N';
import { Popconfirm, Tooltip } from 'antd';
import { ColumnProps } from 'antd/lib/table';

import {
  AllEmissionData,
  CarbonInfos,
  SubmitDatumStatus,
} from '@api/carbon-international/types';

import Permission from '@components/Permission';
import IconFont from '@components/iconfont';
import { ReactNode } from 'react';
import { useHistory } from 'react-router-dom';
import { addEllipsisToColumn, fixTableText } from '@utils/index';
import { Toast } from '@utils/Toast';
import { RouteMaps, virtualLinkTransform } from '@src/router/route-paths';
import { TableActions } from '@src/components/Table/components/TableActions';
import { checkPermissions } from '@src/components/Permission/utils';
import { compact } from 'lodash-es';
import { Tags } from '@src/components/UI/Tags';
import { ButtonPermissions } from '@src/utils/consts';
import { getStatisticsRequest } from '@src/utils/statistics';
import { useGetStatisticInfo } from '@src/router/utils';
import { EditionType } from '../../utils';
import { transformTimestamp, twoDecimal } from './index';

type UseCarbonColumn = {
  onCopy: (id: number) => Promise<any>;
  onDel: (id: number) => Promise<any>;
  onDownload: (id: number, type: DownType) => Promise<any>;
  renderRelations: (record: CarbonInfos) => ReactNode;
  onReport: (record: CarbonInfos) => void;
  editionType: string;
};
export enum DownType {
  list,
  report,
}

const renderReportTag = (record: CarbonInfos) => {
  const type = record?.submit_data?.[0]?.status;
  switch (type) {
    case SubmitDatumStatus[I18N.carbonInternational.reported]:
      return (
        <Tags
          color='orange'
          kind='raduis'
          tagText={I18N.carbonInternational.reported}
        />
      );
    case SubmitDatumStatus[I18N.carbonFootprint3.passed]:
      return (
        <Tags
          color='blue'
          kind='raduis'
          tagText={I18N.carbonFootprint3.passed}
        />
      );
    case SubmitDatumStatus[I18N.carbonFootprint3.notPassed]:
      return (
        <Tags
          color='red'
          kind='raduis'
          tagText={I18N.carbonFootprint3.notPassed}
        />
      );
    default:
      return (
        <Tags
          color='default'
          kind='raduis'
          tagText={I18N.emission.notReported}
        />
      );
  }
};

export const useCarbonInfoColumn = ({
  onCopy,
  onDel,
  onDownload,
  onReport,
  renderRelations,
  editionType,
}: UseCarbonColumn): ColumnProps<CarbonInfos>[] => {
  const history = useHistory();

  const [statisticValue] = useGetStatisticInfo();
  const statisticReq = getStatisticsRequest();
  return addEllipsisToColumn(
    compact([
      { title: I18N.carbonFootprint.number, dataIndex: 'index', fixed: 'left' },
      {
        title: I18N.Certification.reportSubject,
        dataIndex: 'organization_info_name',
        key: 'organization_info_name',
        render: txt => <span className='text-14'>{txt}</span>,
      },
      {
        title: I18N.carbonInternational.reportCoveragePeriod,
        dataIndex: 'year',
        key: 'year',
        render: txt => <span className='text-14'>{txt}</span>,
      },
      {
        title: I18N.Certification.versionNumber2,
        dataIndex: 'version_num',
        key: 'version_num',
        render: txt => <span className='text-14'>{txt}</span>,
      },
      {
        title: 'ID',
        dataIndex: 'id',
        render: txt => <span className='text-14'>{txt}</span>,
      },
      editionType === EditionType[2] && {
        title: I18N.carbonInternational.reportingStatus,
        dataIndex: 'id',
        render: (t, record) => renderReportTag(record),
      },
      {
        title: I18N.carbonInternational.lastCompilation,
        dataIndex: 'modification',
        key: 'modification',
        render: txt => (
          <span className='text-14'>{transformTimestamp(txt)}</span>
        ),
      },
      {
        title: I18N.carbonFootprint.creationTime,
        dataIndex: 'create_time',
        key: 'create_time',
        render: txt => (
          <span className='text-14'>{transformTimestamp(txt)}</span>
        ),
      },
      {
        title: () => (
          <Permission
            flag={EditionType[2] === editionType ? 'IW6ADLHhu5' : 'sCYTjZJUQv'}
          >
            <span className='text-14'>
              {I18N.carbonInternational.correlationComparisonNumber2}
              <Tooltip
                title={I18N.carbonInternational.correlationComparisonNumber}
              >
                <IconFont
                  type='icon-icon-zhuyi-1'
                  style={{ color: '#EE9E25', marginLeft: '5px' }}
                />
              </Tooltip>
            </span>
          </Permission>
        ),
        key: 'baseline',
        render: (t, record) => renderRelations(record),
      },
      {
        title: I18N.carbonFootprint.download,
        key: 'baseline',
        render: (t, record) => (
          <div>
            {record?.emission_source_data && (
              <div>
                <Permission
                  flag={
                    editionType === EditionType[1] ? '2SdpHc1ZBw' : 'HCknPYJize'
                  }
                >
                  <span
                    className='text-14 text-green margin-right30 text-cursor'
                    onClick={async () => {
                      statisticReq({
                        data: {
                          ...statisticValue,
                          element: I18N.template(
                            I18N.carbonInternational.editi3,
                            {
                              val1:
                                editionType === EditionType[1]
                                  ? 'GHG protocol'
                                  : 'ISO 14064',
                            },
                          ),
                        },
                      });
                      if (
                        sessionStorage.getItem('docs') &&
                        JSON.parse(sessionStorage.getItem('docs') as string)
                          .id === record.id &&
                        JSON.parse(sessionStorage.getItem('docs') as string)
                          .type === DownType.list
                      ) {
                        const timestamps = new Date().getTime();
                        const oldTime = JSON.parse(
                          sessionStorage.getItem('docs') as string,
                        ).timestamp;
                        const last = (timestamps - oldTime) / (60 * 1000);
                        if (last > 1) {
                          onDownload(record.id, DownType.list);
                        } else {
                          Toast(
                            'info',
                            I18N.carbonInternational.pleaseTakeOneMinute,
                          );
                        }
                      } else {
                        onDownload(record.id, DownType.list);
                      }
                    }}
                  >
                    {I18N.Certification.downloadInventory}
                  </span>
                </Permission>
                <Permission
                  flag={
                    editionType === EditionType[1] ? '0v1P5dkLcs' : 'wiMKqbR4sB'
                  }
                >
                  <span
                    className='text-14 text-blue text-cursor'
                    onClick={async () => {
                      statisticReq({
                        data: {
                          ...statisticValue,
                          element: I18N.template(
                            I18N.carbonInternational.editi2,
                            {
                              val1:
                                editionType === EditionType[1]
                                  ? 'GHG protocol'
                                  : 'ISO 14064',
                            },
                          ),
                        },
                      });
                      if (
                        sessionStorage.getItem('docs') &&
                        JSON.parse(sessionStorage.getItem('docs') as string)
                          .id === record.id &&
                        JSON.parse(sessionStorage.getItem('docs') as string)
                          .type === DownType.report
                      ) {
                        const timestamps = new Date().getTime();
                        const oldTime = JSON.parse(
                          sessionStorage.getItem('docs') as string,
                        ).timestamp;
                        const last = (timestamps - oldTime) / (60 * 1000);
                        if (last > 1) {
                          onDownload(record.id, DownType.report);
                        } else {
                          Toast(
                            'info',
                            I18N.carbonInternational.pleaseTakeOneMinute,
                          );
                        }
                        // const timestamp = new Date().getTime();
                      } else {
                        onDownload(record.id, DownType.report);
                      }
                    }}
                  >
                    {I18N.Certification.downloadReport}
                  </span>
                </Permission>
              </div>
            )}
          </div>
        ),
      },
      {
        title: I18N.carbonFootprint.operation,
        key: 'action',
        fixed: 'right',
        render: (text, record) => (
          <div>
            <TableActions
              dropDownKey={record.id}
              menus={compact([
                checkPermissions(
                  {
                    key: 'copy',
                    label: I18N.carbonFootprint.edit,
                    onClick: () => {
                      history.push(
                        virtualLinkTransform(
                          RouteMaps.internationaladdCarbonReport,
                          [':edition', ':step', ':id?'],
                          [editionType, 0, record.id],
                        ),
                      );
                    },
                  },
                  editionType === EditionType[1]
                    ? 'editEmissionInfo'
                    : 'pC60RTY8Xv',
                ),
                checkPermissions(
                  {
                    key: 'copy',
                    label: I18N.carbonFootprint.copy,
                    onClick: () => onCopy(record.id),
                  },
                  editionType === EditionType[1] ? 'uxhJqBiLfj' : 'BRGAJKm0Tt',
                ),
                checkPermissions(
                  {
                    key: 'del',
                    label: (
                      <Popconfirm
                        title={
                          I18N.carbonInternational.notAllowedAfterDeletion2
                        }
                        onConfirm={async () => onDel(record.id)}
                        okText={I18N.carbonFootprint.confirm}
                        cancelText={I18N.carbonFootprint.cancel}
                      >
                        {I18N.carbonFootprint.delete}
                      </Popconfirm>
                    ),
                  },
                  editionType === EditionType[1] ? 'IS40nmGjhA' : 'D1A0P4qGIf',
                ),
                checkPermissions(
                  record?.emission_source_data &&
                    editionType === EditionType[2] &&
                    (record.submit_data?.[0]?.status ===
                      SubmitDatumStatus[I18N.carbonFootprint3.notPassed] ||
                      record.submit_data?.[0]?.status ===
                        SubmitDatumStatus[I18N.emission.notReported] ||
                      record.submit_data?.[0]?.status === undefined) && {
                      key: 'report',
                      label: I18N.carbonInternational.toPutForwardAndHandIn,
                      onClick: () => onReport(record),
                    },
                  ButtonPermissions.internationalReportButton,
                ),
              ])}
            />
          </div>
        ),
      },
    ]),
  );
};

// '数据汇总表'
export const dataCountsColumns = (): ColumnProps<AllEmissionData>[] => [
  {
    title: I18N.dashborad.number,
    key: 'index',
  },
  {
    title: I18N.enterpriseCarbonAccount2.facilityActivities,
    dataIndex: 'facility',
    key: 'facility',
  },
  {
    title: I18N.carbonFootprint.emissionSources,
    dataIndex: 'emission_source',
    key: 'emission_source',
  },
  {
    title: I18N.carbonInternational.emissionSourceCategory,
    dataIndex: 'emissions_category',
    key: 'emissions_category',
  },
  {
    title: I18N.carbonFootprint3.activityData,
    dataIndex: 'active_data',
    key: 'active_data',
    render: (txt, record) => (
      <span className='text-14'>
        {fixTableText(txt + (record?.unit || ''))}
      </span>
    ),
  },
  {
    title: I18N.enterpriseCarbonAccount2.emissionsTC2,
    dataIndex: 'emissions_total',
    key: 'emissions_total',
  },
  {
    title: I18N.carbonInternational.uncertainty,
    dataIndex: 'uncertainty',
    key: 'uncertainty',
    render: txt => <span className='text-14'>{fixTableText(txt)}</span>,
  },
  {
    title: I18N.carbonInternational.proportion,
    dataIndex: 'carbon_emission_percentage',
    key: 'carbon_emission_percentage',
    render: txt => (
      <span className='text-14'>{fixTableText(twoDecimal(txt))}</span>
    ),
  },
];

// 组织运营边界调查表
