/**
 * @file 系统日志
 */
import SearchForm from '@src/components/SearchForm';
import { Table } from '@src/components/Table';
import I18N from '@src/lang/I18N';
import {
  listALLByDictTypeBatchUsingGET1CDictEnumControllerApi,
  listUsingGET8SysOperationLogControllerApi,
  Robject,
} from '@src/sdks/java/management/api';
import { addEllipsisToColumn } from '@src/utils';
import { Dicts } from '@src/views/emission/Show/type';
import { useForm } from 'antd/es/form/Form';
import classNames from 'classnames';
import moment from 'moment';
import type { Moment } from 'moment';
import { useEffect, useState } from 'react';

import style from './index.module.less';
import { logColumn } from '../utils';
import { LogRow } from '../utils/type';

type SearchParams = {
  time: Moment[];
  userId?: string;
  moduleType?: string;
};

const ActionsLog = () => {
  const [modules, setModules] = useState<Dicts[]>([]);
  const columns = addEllipsisToColumn<LogRow>(logColumn(modules));
  const [searchVal, setSearchVal] = useState<SearchParams>({ time: [] });
  const [form] = useForm();
  const formatDate = (m?: Moment) =>
    m ? moment(m)?.format?.('YYYY-MM-DD HH:mm:ss') : undefined;
  useEffect(() => {
    listALLByDictTypeBatchUsingGET1CDictEnumControllerApi(
      'operation_module',
    ).then(({ data }) => {
      // @ts-ignore
      setModules((data?.data?.operation_module || []) as Dicts[]);
    });
  }, []);

  return (
    <div className={style.wrapper}>
      <h3>{I18N.system.operationLog}</h3>
      <SearchForm
        wrapperClassName={style.searchForm}
        antdFormProps={{ layout: 'inline', form }}
        searchSub={() => {
          const formVal = form.getFieldsValue();
          setSearchVal({ ...formVal });
        }}
        resetBack={() => setSearchVal({ time: [] })}
        formItems={[
          {
            type: 'input',
            label: '',
            placeholder: I18N.carbonFootprint.operator,
            name: 'userId',
            rules: false,
            className: style.formItem,
          },
          {
            type: 'select',
            label: '',
            placeholder: I18N.system.operationModule,
            name: 'moduleType',
            rules: false,
            className: style.formItem,
            props: {
              options: modules.map(s => ({
                label: s.dictLabel,
                value: s.dictValue,
              })),
            },
          },
          {
            type: 'dateRange',
            label: '',
            name: 'time',
            rules: false,
            className: classNames(style.formItem, style.time),
            props: {
              showTime: true,
              format: 'YYYY-MM-DD HH:mm:ss',
            },
          },
        ]}
      />
      <Table<LogRow, Robject, SearchParams>
        columns={columns}
        bordered={false}
        searchParams={searchVal}
        pagePosition
        returnFetchApi={({ data }) => {
          const r = data?.data;
          return {
            // @ts-ignore
            data: r?.rows as LogRow[],
            // @ts-ignore
            count: r.total || 0,
          };
        }}
        fetchApi={params =>
          listUsingGET8SysOperationLogControllerApi(
            undefined,
            undefined,
            undefined,
            undefined,
            formatDate(params.time?.[1]),
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            params.moduleType,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            params.page,
            params.size,
            undefined,
            undefined,
            undefined,
            undefined,
            formatDate(params.time?.[0]),
            undefined,
            undefined,
            undefined,
            params.userId?.trim(),
          )
        }
      />
    </div>
  );
};

export default ActionsLog;
