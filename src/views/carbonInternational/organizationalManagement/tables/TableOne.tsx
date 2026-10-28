/*
 * @@description:数据汇总表
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-01-16 10:24:44
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-04-20 11:49:01
 */

import I18N from '@src/lang/I18N';
import {
  copyCarbonData,
  delEmissionInfo,
  getSummarytable,
} from '@api/carbon-international';
import IconFont from '@components/iconfont';
import {
  AllEmissionData,
  PythonPageResponse,
} from '@src/api/carbon-international/types';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import { RouteMaps, virtualLinkTransform } from '@src/router/route-paths';
import { useGetStatisticInfo } from '@src/router/utils';
import { RouterHistory } from '@src/types';
import { getStatisticsRequest } from '@src/utils/statistics';
import ComparisonMode from '@src/views/carbonproduct/comparisonMode/comparisonMode';
import { Toast } from '@utils/Toast';
import { Col, Popconfirm, Row } from 'antd';
import { ColumnProps } from 'antd/es/table';
import { useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { EditionType, getEditionType } from '../../utils';
import { dataCountsColumns } from '../utils/columns';

const TableOne = ({
  history,
  checkedTab,
}: {
  checkedTab: number;
  history: RouterHistory;
}) => {
  const [editionTypeNum, editionTypeStr] = getEditionType();
  const infoId = useParams() as { id?: number | undefined };
  const tableRef = useRef<TableRef>();
  const [statisticValue] = useGetStatisticInfo();

  const dataCountsColumnsActions: ColumnProps<AllEmissionData> = {
    title: I18N.carbonFootprint.operation,
    key: 'action',
    fixed: 'right',
    width: 237,
    render: record => (
      <div>
        <span
          className='text-14 text-green margin-right30 text-cursor'
          onClick={() => {
            history.push(
              virtualLinkTransform(
                RouteMaps.internationalAddEmissions,
                [':edition', ':id', ':editId?'],
                [editionTypeStr, infoId?.id || '', record?.id],
              ),
            );
          }}
        >
          {I18N.carbonFootprint.edit}</span>
        <span
          className='text-14 text-blue margin-right30 text-cursor'
          onClick={async () => {
            await copyCarbonData(record.id).then(({ data }) => {
              if (data.code === 200) {
                Toast('success', I18N.carbonFootprint3.copySuccessful);
                tableRef.current?.reset();
              } else {
                Toast('warn', data.msg);
              }
            });
          }}
        >
          {I18N.carbonFootprint.copy}</span>
        <Popconfirm
          title={I18N.carbonInternational.notAllowedAfterDeletion}
          onConfirm={async () => {
            await delEmissionInfo(record.id).then(({ data }) => {
              if (data.code === 200) {
                Toast('success', I18N.carbonFootprint.deleteSuccessful);
                tableRef.current?.reset();
              } else {
                Toast('warn', I18N.supplyChain2.deleteFailed);
              }
            });
          }}
          onCancel={() => Toast('warn', I18N.carbonproduct.cancelOperation, 1)}
          okText={I18N.carbonFootprint.confirm}
          cancelText={I18N.carbonFootprint.cancel}
        >
          <span className='text-14 text-error margin-right30 text-cursor'>
            {I18N.carbonFootprint.delete}</span>
        </Popconfirm>
        {record.baseline ? (
          <span className='text-14 text-blue text-cursor' onClick={() => {}}>
            {' '}
            <ComparisonMode title='title' record={record} />
          </span>
        ) : (
          ''
        )}
      </div>
    ),
  };
  const dataCountColumns = [...dataCountsColumns(), dataCountsColumnsActions];
  const columns = useMemo(() => dataCountColumns, [checkedTab]);

  return (
    <div>
      <Row>
        <Col span={24}>
          {checkedTab === 0 && (
            <div className='add_export_data'>
              <div
                style={{ display: 'inline-block' }}
                onClick={() => {
                  getStatisticsRequest()({
                    data: {
                      ...statisticValue,
                      element: I18N.template(I18N.carbonInternational.editi, { val1: 
                        editionTypeNum === EditionType.GHG
                          ? 'GHG protocol'
                          : 'ISO 14064'
                       }),
                    },
                  });
                  history.push(
                    virtualLinkTransform(
                      RouteMaps.internationalAddEmissions,
                      [':edition', ':id', ':editId?'],
                      [editionTypeStr, infoId?.id || ''],
                    ),
                  );
                }}
              >
                <IconFont
                  type='icon-icon-xinjianbaifangshuju'
                  style={{ color: '#07C160', marginRight: '8px' }}
                />
                {I18N.carbonInternational.newEmissions}</div>
            </div>
          )}
          <CommonTable<AllEmissionData, PythonPageResponse<AllEmissionData>>
            columns={columns}
            cRef={tableRef}
            bordered={false}
            returnFetchApi={({ data }) => ({
              data: data?.results,
              count: data?.count,
            })}
            fetchApi={params =>
              getSummarytable({
                page: params.page,
                page_size: params.size,
                carbon_emission_info_id: infoId.id,
                edition: editionTypeNum,
              })
            }
          />
        </Col>
      </Row>
    </div>
  );
};
export default TableOne;
