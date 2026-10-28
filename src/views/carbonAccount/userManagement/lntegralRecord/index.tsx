/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-09-22 14:15:46
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-12 17:14:41
 */
/**
 * 碳币记录
 * @returns
 */
import { formPropsInit } from '@src/components/FormUtil/util';
import Permission from '@src/components/Permission';
import SearchFormUtil from '@src/components/SearchForm';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { Alert, Button, Form, FormProps } from 'antd';
import { AxiosResponse } from 'axios';
import classNames from 'classnames';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import {
  carbonAccountLntegralRecordSearchForm,
  CarbonAccountLntegralRecordTableCol,
} from './model';
import {
  ApiGetLntegralRecordData,
  CarbonAccountActiveDataGetParams,
  CarbonAccountLntegralRecordTable,
} from './type';
import '../../index.less';
import ExportModel from '../../component/exportModel';
import styles from './index.module.less';
import {
  ApicarbonAccountIntegralRecordGet,
  ApiScoreExportExcel,
} from './service';

const CarbonAccountLntegralRecord = () => {
  const childRef = useRef<TableRef>(); /** 查询的条件 */
  const history = useHistory();

  /** 导出弹窗 */
  const [showExport, setShowExport] = useState<boolean>(false);

  const [exportLoading, setExportLoading] = useState(false);

  const [searchParamsData, setSearchParamsData] =
    useState<
      Pick<
        CarbonAccountActiveDataGetParams,
        'likeRealName' | 'sceneId' | 'begTime' | 'endTime'
      >
    >();
  const [searchForm] = Form.useForm();
  /** 搜索的form */
  const searchFormProps: FormProps = {
    ...formPropsInit(),
    layout: 'inline',
    form: searchForm,
  };
  /** 搜索回调 */
  const searchSub = () => {
    const res = searchForm.getFieldsValue();
    const data = {
      ...res,
      begTime: moment(res?.time[0]).format('YYYY-MM-DD HH:mm:ss'),
      endTime: moment(res?.time[1]).format('YYYY-MM-DD HH:mm:ss'),
    };
    delete data?.time;
    setSearchParamsData(data);
  };

  const resetBack = () => {
    setSearchParamsData({
      begTime: moment().subtract(1, 'month').format('YYYY-MM-DD HH:mm:ss'),
      endTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
    setTimeout(() => {
      searchForm.setFieldsValue({
        time: [moment().subtract(1, 'month'), moment()],
      });
    }, 100);
  };
  const [dataCount, setDataCount] = useState(0);
  const returnFetchApi = (
    back: AxiosResponse<ApiGetLntegralRecordData, any>,
  ) => {
    const count = back.data.data.total || 0;
    setDataCount(count);
    return {
      data: back.data.data.rows,
      count,
    };
  };
  useEffect(() => {
    searchForm.setFieldsValue({
      time: [moment().subtract(1, 'month'), moment()],
    });
  }, []);

  return (
    <div
      className={classNames(
        { 'border-bottom-global-actions': dataCount > 10 },
        'autoHeight',
      )}
    >
      <div className='main'>
        <div className='searchWrapper'>
          <SearchFormUtil
            antdFormProps={searchFormProps}
            searchSub={searchSub}
            resetBack={resetBack}
            formItems={carbonAccountLntegralRecordSearchForm()}
          />
          <Permission flag='carbonAccount:score:excel'>
            <Button
              className='exportBtn'
              type='primary'
              onClick={() => setShowExport(true)}
            >
              {I18N.carbonFootprint3.export}
            </Button>
          </Permission>
        </div>
        <div style={{ marginTop: 20 }}>
          <CommonTable<CarbonAccountLntegralRecordTable, any>
            bordered={false}
            searchParams={searchParamsData}
            cRef={childRef}
            scroll={{ x: 1500 }}
            pageSize={10}
            returnFetchApi={returnFetchApi}
            fetchApi={params => {
              params.begTime ||= moment()
                .subtract(1, 'month')
                .format('YYYY-MM-DD HH:mm:ss');
              params.endTime ||= moment().format('YYYY-MM-DD HH:mm:ss');
              const {
                page,
                size,
                begTime,
                endTime,
                likeRealName,
                likeSceneName,
                sceneId,
                thirdId,
              } = params;
              return ApicarbonAccountIntegralRecordGet({
                page,
                size,
                begTime,
                endTime,
                likeRealName,
                likeSceneName,
                sceneId,
                thirdId,
              });
            }}
            columns={CarbonAccountLntegralRecordTableCol()}
            rowKey='name'
            pagePosition
          />
        </div>
      </div>
      <ExportModel
        showModel={showExport}
        title={I18N.carbonAccount.carbonCoinRecordImport}
        okButtonProps={{ loading: exportLoading }}
        exportDesc={
          <Alert
            className={styles.exportAlert}
            showIcon
            type='info'
            message={I18N.carbonAccount.onlyBeforeExport}
          />
        }
        handelOk={(value: any) => {
          const searchData: any = searchForm.getFieldsValue();
          const data = {
            ...searchData,
            excelName: value?.fileName,
            begTime: moment(searchData?.time[0]).format('YYYY-MM-DD HH:mm:ss'),
            endTime: moment(searchData?.time[1]).format('YYYY-MM-DD HH:mm:ss'),
          };
          delete data.time;

          setExportLoading(true);
          ApiScoreExportExcel(data)
            .then(() => {
              history.push(RouteMaps.CarbonAccountDownload);
            })
            .finally(() => {
              setExportLoading(false);
            });
        }}
        handelCancel={() => setShowExport(false)}
      />
    </div>
  );
};

export default CarbonAccountLntegralRecord;
