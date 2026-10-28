/**
 * @file 控制计划列表
 * @author lixingchen
 * */

import I18N from '@src/lang/I18N';
import { useEffect, useState } from 'react';
import { Button, Radio, RadioChangeEvent, Table } from 'antd';
import { useHistory } from 'react-router-dom';
import '../../../style.less';
import { RouteMaps } from '@src/router/route-paths';
import { PropsType } from '@src/views/enterpriseCarbonAccount2/service';
import { updateUrl } from '@src/utils';

export const DataManage = (props: PropsType) => {
  const history = useHistory();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tabValue, setTabValue] = useState('GHG');
  const [isDetail, setIsDetail] = useState(true);
  const controlPlanId = new URLSearchParams(location.search).get('id');
  const currentTabValue =
    new URLSearchParams(location.search).get('tabValue') || 'GHG';

  useEffect(() => {
    setTabValue(currentTabValue);
    setIsDetail(history.location.pathname.includes('Detail'));
  }, []);

  const tableColumns = [
    {
      title: I18N.carbonFootprint.emissionClassification,
      dataIndex: 'className',
      width: 150,
      onCell: (_, index) => {
        if (tabValue === 'GHG') {
          if (index === 0 || index === 5) {
            return { rowSpan: 5 };
          }
          if (index === 10) {
            return { rowSpan: 15 };
          }
          return { rowSpan: 0 };
        }
        if (
          index === 0 ||
          index === 5 ||
          index === 10 ||
          index === 15 ||
          index === 20
        ) {
          return { rowSpan: 5 };
        }
        if (index === 25) {
          return { rowSpan: 1 };
        }
        return { rowSpan: 0 };
      },
    },
    {
      title: I18N.enterpriseCarbonAccount2.emissionCategories,
      width: 280,
      dataIndex: 'categoryName',
    },
    {
      title: I18N.enterpriseCarbonAccount2.categoryDescription,
      width: 500,
      dataIndex: 'categoryDesc',
    },
    {
      title: I18N.enterpriseCarbonAccount2.activityDescriptionIs,
      width: 300,
      dataIndex: 'activityDesc',
    },
    {
      title: I18N.carbonFootprint.operation,
      width: 150,
      dataIndex: 'supplyQuantity',
      render: (text, record) => (
        <>
          {/* <Permission flag='meeting:activity:edit'> */}
          {props.pageType === 'detail' ? (
            ''
          ) : (
            <Button
              type='link'
              style={{ paddingLeft: 0 }}
              onClick={() => {
                history.push(
                  `${
                    RouteMaps.enterpriseCarbonAccountingDataQualitydataManagePlanEdit
                  }?controlPlanDataId=${record.controlPlanDataId}&isEdit=${
                    record.activityDesc ? 1 : 0
                  }&controlPlanId=${controlPlanId}&emissionClassMainId=${
                    record.emissionClassMainId
                  }&commId=${record.commonId}&tabValue=${tabValue}`,
                );
              }}
            >
              {I18N.carbonFootprint.edit}</Button>
          )}
          {/* </Permission> */}
          {/* <Permission flag='meeting:activity:edit'> */}
          {record.activityDesc ? (
            <Button
              style={{ paddingLeft: 0 }}
              type='link'
              onClick={() => {
                history.push(
                  `${
                    RouteMaps.enterpriseCarbonAccountingDataQualityControldataManagePlanDetail
                  }?controlPlanDataId=${record.controlPlanDataId}&isEdit=${
                    record.activityDesc ? 1 : 0
                  }&controlPlanId=${controlPlanId}&emissionClassMainId=${
                    record.emissionClassMainId
                  }&tabValue=${tabValue}&isDetail=${isDetail}`,
                );
              }}
            >
              {I18N.carbonFootprint3.details}</Button>
          ) : (
            ''
          )}
          {/* </Permission> */}
        </>
      ),
    },
  ];
  return (
    <div className='product padd-t-16'>
      <Radio.Group
        onChange={(e: RadioChangeEvent) => {
          setTabValue(e.target.value);
          updateUrl('tabValue', e.target.value);
        }}
        value={tabValue}
        style={{ marginBottom: 10 }}
      >
        <Radio.Button value='GHG'>GHG Protocol</Radio.Button>
        <Radio.Button value='ISO'>ISO 14064-1:2018</Radio.Button>
      </Radio.Group>
      <Table
        columns={tableColumns}
        dataSource={tabValue === 'GHG' ? props.GHGInfo : props.ISOInfo}
        bordered
        scroll={{ y: 'calc(100vh - 356px)' }}
        pagination={false}
      />
    </div>
  );
};
