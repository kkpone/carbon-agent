/*
 * @@description: 供应商详情-企业碳核算详情
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-02-20 11:22:25
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-27 11:25:37
 */
/**
 * @file 供应商详情-企业碳核算详情
 */
import I18N from '@src/lang/I18N';
import '@src/views/supplyChain2/style.less';
import {
  FormGrid,
  FormLayout,
  FormItem,
  Input,
  Select,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import {
  carbonAccounResultGHGSchema,
  carbonAccounResultISOSchema,
  carbonAccounResultSchema,
} from '@src/views/supplyChain2/schema';
import { Empty, Radio, RadioChangeEvent, Tabs } from 'antd';
import { ReactNode, useEffect, useMemo, useState } from 'react';

import CarbonAccountCourse from './CarbonAccountCourse';
import ReportDownloadList from './ReportDownloadList';
import { Report } from '../carbonDataManage/CarbonDataFill/type';
import { DataBackType } from '../type';

interface PropsType {
  titType?: 'radio' | 'tab';
  dataInfo?: DataBackType;
  jumpDetailUrl?: string;
  isChaniApi?: boolean;
}
const CarbonAccountDetail = (props: PropsType) => {
  const { titType, dataInfo, jumpDetailUrl, isChaniApi } = props;
  const [tabList, setTabList] = useState([
    {
      key: 'carbonAccountResult',
      tab: I18N.supplyChain2.enterpriseCarbonAccounting5,
    },
    {
      key: 'carbonAccountReport',
      tab: I18N.supplyChain2.enterpriseCarbonAccounting2,
    },
  ]);
  //   当前选中tab
  const [tabActive, setTabActive] = useState(
    localStorage.getItem('carbonAccountTab') || 'carbonAccountResult',
  );
  const form = useMemo(
    () =>
      createForm({
        readPretty: true,
      }),
    [],
  );

  const [reportList, setReportList] = useState<Report[]>();
  const [computationType, setComputationType] = useState<string[]>([]);
  const CarbonAccounResult = createSchemaField({
    // 组件列表
    components: {
      FormLayout,
      FormGrid,
      FormItem,
      Input,
      Select,
    },
  });
  const hindScope = computationScope => {
    const accountSelect = computationScope?.split(',')?.map(num => Number(num));
    const scopeName = {
      1: '.scopeOne',
      2: '.scopeTwo',
      3: '.scopeThree',
      4: '.direct',
      5: '.energy',
      6: '.transportation',
      7: '.outsourcing',
      8: '.supply',
      9: '.rests',
    };
    Object.keys(scopeName).forEach(key => {
      form.setFieldState(scopeName[key], {
        visible: false,
      });
    });

    accountSelect?.forEach(num => {
      form.setFieldState(scopeName[num], {
        visible: true,
      });
    });
  };
  useEffect(() => {
    form.setValues(
      { ...dataInfo?.supplierData, ...(dataInfo?.enterprice || {}) } || {},
    );

    setComputationType(
      dataInfo?.supplierData.computationType?.split(',') || [],
    );

    hindScope(dataInfo?.supplierData.computationScope);
    const hasCarbonAccountCourse = tabList.find(
      item => item.key === 'carbonAccountCourse',
    );
    if (
      (dataInfo?.supplierData?.dataType === 2 ||
        dataInfo?.supplierData?.dataType === 3) &&
      !hasCarbonAccountCourse
    ) {
      tabList.splice(1, 0, {
        key: 'carbonAccountCourse',
        tab: I18N.supplyChain2.enterpriseCarbonAccounting4,
      });
      setTabList([...tabList]);
    }
    if (!Array.isArray(dataInfo?.enterprice?.report)) {
      setReportList(JSON.parse(dataInfo?.enterprice?.report || '[]'));
    }
  }, [dataInfo]);
  const renderTabs = () => {
    const onChange = (key: string | RadioChangeEvent) => {
      let value = '';
      if (typeof key === 'string') {
        value = key;
      } else {
        value = key.target.value;
      }
      setTabActive(value as string);
      localStorage.setItem('carbonAccountTab', value as string);
      hindScope(dataInfo?.supplierData.computationScope);
    };
    const showComponent = (key: string): ReactNode => {
      //   企业碳核算结果
      if (key === 'carbonAccountResult') {
        return (
          <div className='padding-0-16'>
            <FormilyCommon form={form}>
              <CarbonAccounResult schema={carbonAccounResultSchema()} />
            </FormilyCommon>
            {computationType.includes('1') ? (
              <FormilyCommon form={form}>
                <CarbonAccounResult schema={carbonAccounResultGHGSchema()} />
              </FormilyCommon>
            ) : (
              ''
            )}
            {computationType.includes('2') ? (
              <FormilyCommon form={form}>
                <CarbonAccounResult schema={carbonAccounResultISOSchema()} />
              </FormilyCommon>
            ) : (
              ''
            )}
          </div>
        );
      }
      //   企业碳核算过程
      if (key === 'carbonAccountCourse') {
        if (dataInfo?.supplierData.status === 0) {
          return (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              imageStyle={{ height: 75, marginTop: '20vh' }}
            />
          );
        }
        return (
          <CarbonAccountCourse
            isChaniApi={isChaniApi}
            dataInfo={dataInfo}
            jumpDetailUrl={jumpDetailUrl}
          />
        );
      }
      if (key === 'carbonAccountReport') {
        return (
          <div className='padding-0-16'>
            <ReportDownloadList reportList={reportList} />
          </div>
        );
      }
      return <div />;
    };
    if (titType === 'radio') {
      return (
        <>
          <div className='margin-b-16'>
            <Radio.Group
              className='padding-l-16'
              onChange={onChange}
              value={tabActive}
            >
              {tabList.map(item => (
                <Radio.Button value={item.key}>{item.tab}</Radio.Button>
              ))}
            </Radio.Group>
          </div>
          {showComponent(tabActive)}
        </>
      );
    }
    return (
      <Tabs
        defaultActiveKey='1'
        activeKey={tabActive}
        onChange={onChange}
        className='padd0-tabs'
      >
        {tabList.map(item => (
          <Tabs.TabPane {...item}>{showComponent(item.key)}</Tabs.TabPane>
        ))}
      </Tabs>
    );
  };
  return <div className='supply-chain-container-p-0'>{renderTabs()}</div>;
};

export default CarbonAccountDetail;
