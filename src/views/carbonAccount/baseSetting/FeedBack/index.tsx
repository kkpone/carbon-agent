/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-09-22 14:15:46
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-27 16:38:41
 */
/**
 * @file 意见反馈
 */
import { checkPermissions } from '@src/components/Permission/utils';
import SearchFormUtil from '@src/components/SearchForm';
import { Table } from '@src/components/Table';
import { TableActions } from '@src/components/Table/components/TableActions';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import {
  pageUsingGET5DefaultApi,
  Robject,
  UserFeedbackDto,
} from '@src/sdks/java/carbonAccount';
import { addEllipsisToColumn } from '@src/utils';
import { Toast } from '@src/utils/Toast';
import { useForm } from 'antd/es/form/Form';
import { compact, get } from 'lodash-es';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import style from './index.module.less';
import {
  feedbackColumns,
  useCarbonFootprintProductType,
  feedbackSearch,
} from './utils';
import { FeedBackSearchParams } from './utils/types';

const FeedBack = () => {
  const history = useHistory();
  const [productType] = useCarbonFootprintProductType();
  const columns = useMemo(
    () =>
      addEllipsisToColumn([
        ...feedbackColumns(),
        {
          dataIndex: 'actions',
          title: I18N.carbonFootprint.operation,
          fixed: 'right',
          render(t: string, record: any) {
            return (
              <TableActions
                menus={compact([
                  checkPermissions(
                    {
                      label: I18N.carbonFootprint3.details,
                      search: (record: any) => get(record, 'id'),
                    },
                    'carbonAccount:feedback:query',
                  ),
                  checkPermissions(
                    {
                      label: I18N.carbonFootprint.edit,
                      search: (record: any) => `${get(record, 'id')}&type=edit`,
                    },
                    'carbonAccount:feedback:edit',
                  ),
                ]).map(item => ({
                  label: item.label,
                  key: item.label,
                  onClick: async () => {
                    if (record.id) {
                      history.push(
                        `${
                          RouteMaps.carbonAccountFeedBackDetail
                        }?id=${item.search(record)}`,
                      );
                    } else {
                      Toast('info', I18N.carbonFootprint.dataAnomaly);
                    }
                  },
                }))}
              />
            );
          },
        },
      ]),
    [productType],
  );
  const [searchVal, setSearchVal] = useState<Partial<FeedBackSearchParams>>({});

  const [searchForm] = useForm();

  return (
    <div
      className={`${style.wrapper}  border-bottom-global-actions autoHeight`}
    >
      <SearchFormUtil
        antdFormProps={{
          form: searchForm,
          layout: 'inline',
          className: style.searchForm,
        }}
        searchSub={() => {
          setSearchVal({ ...searchForm.getFieldsValue() });
        }}
        resetBack={() => {
          setSearchVal({});
        }}
        formItems={feedbackSearch()}
      />
      <Table<UserFeedbackDto, Robject, Partial<FeedBackSearchParams>>
        columns={columns}
        searchParams={searchVal}
        pagePosition
        returnFetchApi={({ data }) => ({
          // @ts-ignore
          data: data?.data?.rows || ([] as UserFeedbackDto),
          // @ts-ignore
          count: data?.data?.total,
        })}
        fetchApi={params =>
          pageUsingGET5DefaultApi(
            params.page,
            params.size,
            undefined,
            undefined,
            undefined,
            undefined,
            // @ts-ignore
            params.dateRange?.[1]
              ? moment(params.dateRange?.[1]).format('YYYY-MM-DD')
              : undefined,
            // @ts-ignore
            params.feedbackLevel,
            // @ts-ignore
            params.feedbackStatus,
            undefined,
            undefined,
            params.mobile,
            undefined,
            undefined,
            // @ts-ignore
            params.dateRange?.[0]
              ? moment(params.dateRange?.[0]).format('YYYY-MM-DD')
              : undefined,
          )
        }
        bordered={false}
      />
    </div>
  );
};

export default FeedBack;
