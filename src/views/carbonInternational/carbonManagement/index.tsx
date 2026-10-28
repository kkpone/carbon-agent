/**
 * @file 报告主体列表
 * @author qifeng
 */
import { SearchOutlined } from '@ant-design/icons';
import {
  delOrganizationItem,
  getOrganizationList,
} from '@api/carbon-international';
import {
  GetOrganizationListArgsResponse,
  Organizations,
} from '@api/carbon-international/types';
import Permission from '@src/components/Permission';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import I18N from '@src/lang/I18N';
import { RouteMaps, virtualLinkTransform } from '@src/router/route-paths';
import { useGetStatisticInfo } from '@src/router/utils';
import { getStatisticsRequest } from '@src/utils/statistics';
import { Toast } from '@utils/Toast';
import { Button, DatePicker, Input } from 'antd';
import moment from 'moment';
import { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { organizationColumns } from './columns';
import style from './index.module.less';

const { RangePicker } = DatePicker;

const InternationalCarbonManagement = () => {
  const title = I18N.Certification.reportSubject;
  const history = useHistory();
  const [searchName, setSearchName] = useState('');
  const [searchTimeRange, setSearchTimeRange] = useState<string[]>([]);
  const [statisticValue] = useGetStatisticInfo();

  const ref = useRef<TableRef>();
  const onConfirm = async ({ id }: Organizations) =>
    delOrganizationItem(id).then(() => {
      Toast('success', I18N.carbonInternational.deleteSuccessful);
      ref.current?.reset();
    });
  const onEdit = ({ id, isShow }: Organizations) => {
    history.push(
      virtualLinkTransform(
        isShow
          ? RouteMaps.internationaloperationManagementShow
          : RouteMaps.internationaloperationManagement,
        [':id'],
        [id],
      ),
    );
  };
  const columns = [
    ...organizationColumns({
      onConfirm,
      onEdit,
      onShow: record => onEdit({ ...record, isShow: true }),
    }),
  ];
  /** 临时保存搜索值 */
  const [searchVal, setSearchVal] = useState('');
  return (
    <div className={style.organization_management}>
      <div className={style.header}>
        <div className={style.searchWrapper}>
          <div className={style.searchItem}>
            <Input
              className={style.searchInput}
              placeholder={I18N.template(I18N.carbonInternational.canInputTi, {
                val1: title,
              })}
              style={{ width: 380 }}
              onChange={ev => setSearchVal(ev.target.value)}
              onPressEnter={e => {
                setSearchName(
                  // @ts-ignore
                  e.target.value,
                );
                ref.current?.reset({ page: 1 });
              }}
              suffix={
                <SearchOutlined
                  onClick={() => {
                    setSearchName(searchVal);
                    ref.current?.reset({ page: 1 });
                  }}
                  style={{ color: 'rgba(0,0,0,.45)' }}
                />
              }
            />
          </div>
          <div className={style.searchItem}>
            <RangePicker
              showTime={{ format: 'HH:mm' }}
              format='YYYY-MM-DD HH:mm'
              onChange={(moment, string) => {
                setSearchTimeRange(string || []);
                ref.current?.reset({ page: 1 });
              }}
              ranges={{
                最近一周: [moment().startOf('week'), moment().endOf('week')],
                最近一个月: [
                  moment().startOf('month'),
                  moment().endOf('month'),
                ],
                最近三个月: [
                  moment().subtract(3, 'month'),
                  moment().endOf('day'),
                ],
              }}
            />
          </div>
        </div>
        <Permission flag='Jtl3ebpKAX'>
          <Button
            className={style.addButton}
            type='primary'
            onClick={() => {
              getStatisticsRequest()({
                data: {
                  ...statisticValue,
                  element: I18N.carbonInternational.reportSubjectManagement,
                },
              });
              history.push(
                virtualLinkTransform(
                  RouteMaps.internationaloperationManagement,
                  [':id'],
                  [],
                ),
              );
            }}
          >
            {I18N.carbonFootprint.newAddition}
          </Button>
        </Permission>
      </div>
      <CommonTable<Organizations, GetOrganizationListArgsResponse>
        columns={columns}
        cRef={ref}
        bordered={false}
        searchParams={{
          g_time: searchTimeRange[0],
          l_time: searchTimeRange[1],
          organization_name: searchName,
        }}
        returnFetchApi={({ data }) => ({
          data: data.results,
          count: data.count,
        })}
        fetchApi={params =>
          getOrganizationList({
            g_time: searchTimeRange[0],
            l_time: searchTimeRange[1],
            organization_name: searchName,
            page: params.page,
            page_size: params.size,
          })
        }
      />
    </div>
  );
};
export default InternationalCarbonManagement;
