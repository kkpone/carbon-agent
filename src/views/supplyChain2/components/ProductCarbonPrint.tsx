/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * @@description: 产品碳足迹详情
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-02-20 11:22:25
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-26 20:15:07
 */

import I18N from '@src/lang/I18N';
import '@src/views/supplyChain2/style.less';
import {
  FormGrid,
  FormLayout,
  FormItem,
  Input,
  ArrayTable,
  Select,
  DatePicker,
  Cascader,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import { RouteMapsType } from '@src/router/route-paths';
import { apiListALLByDictTypeData } from '@src/views/emission/Show/service';
import { productCarbonPrintResultSchema } from '@src/views/supplyChain2/schema';
import ModelShareBadge from '@src/views/supplyChain/components/ModelShareBadge';
import {
  canShowModelShareFillResult,
  isModelShareSupplierTask,
} from '@src/views/supplyChain/utils/modelShare';
import { Empty, Radio, RadioChangeEvent, Tabs } from 'antd';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';

import ProcessAccountingInfo from './ProcessAccountingInfo';
import ProductFootprintQuick from './ProductFootprintQuick';
import ReportDownloadList from './ReportDownloadList';
import { Report } from '../carbonDataManage/CarbonDataFill/type';
import { DataBackType } from '../type';
import { translateCasCaderData } from '../utils';

const Text: React.FC<{
  value?: string;
  content?: string;
  mode?: 'normal' | 'h1' | 'h2' | 'h3' | 'p';
}> = ({ value, mode, content, ...props }) => {
  const tagName = mode === 'normal' || !mode ? 'div' : mode;
  return React.createElement(tagName, props, String(value) || content);
};
const UnitDischarge: React.FC<{
  value?: string;
  content?: string;
  mode?: 'normal' | 'h1' | 'h2' | 'h3' | 'p';
}> = ({ value, mode, content, ...props }) => {
  const tagName = mode === 'normal' || !mode ? 'div' : mode;
  return React.createElement(
    tagName,
    props,
    I18N.template(I18N.supplyChain2.unitProductScheduling4, {
      val1: value || '-',
    }) || content,
  );
};
interface PropsType {
  titType?: 'radio' | 'tab';
  dataInfo?: DataBackType;
  isComponent?: boolean;
  jumpDetailUrl?: string | RouteMapsType;
  isChaniApi: boolean;
}
const ProductCarbonPrint = (props: PropsType) => {
  const { titType, dataInfo, jumpDetailUrl, isChaniApi } = props;
  const [tabList, setTabList] = useState([
    {
      key: 'productCarbonPrintResult',
      tab: I18N.carbonFootprint3.carbonFootprintVerification2,
    },
    {
      key: 'productCarbonPrintReport',
      tab: I18N.supplyChain2.carbonFootprintVerification4,
    },
  ]);

  localStorage.removeItem('quickMenuItem');
  const [footBorderType, setFootBorderType] = useState<number>();

  // 快速 过程核算
  const [type, setType] = useState<'quick' | 'course' | 'empty'>();
  //   当前选中tab
  const [tabActive, setTabActive] = useState(
    localStorage.getItem('productCarbonPrintTab') || 'productCarbonPrintResult',
  );
  const form = useMemo(
    () =>
      createForm({
        readPretty: true,
      }),
    [],
  );

  const CarbonAccounResult = createSchemaField({
    // 组件列表
    components: {
      FormLayout,
      FormGrid,
      FormItem,
      Input,
      Select,
      DatePicker,
      ArrayTable,
      Text,
      UnitDischarge,
      Cascader,
    },
  });

  const [reportList, setReportList] = useState<Report[]>([]);

  const isModelShare = useMemo(
    () =>
      isModelShareSupplierTask({
        modelShareFlag: dataInfo?.supplierData?.modelShareFlag,
        reqType: dataInfo?.supplierData?.reqType,
        accountId: dataInfo?.supplierData?.accountId,
        businessId: dataInfo?.footprintResult?.businessId,
      }),
    [dataInfo],
  );

  const showShareResult = canShowModelShareFillResult(
    dataInfo?.supplierData?.status,
  );

  const shareActionsLocked = isModelShare && !showShareResult;

  useEffect(() => {
    const dataFootprintResult = dataInfo?.footprintResult;

    form.setValues({
      ...dataInfo?.supplierData,
      ...(shareActionsLocked ? {} : dataFootprintResult || {}),
      computationUnitArr: dataInfo?.supplierData?.computeUnit?.split(','),
      table: shareActionsLocked
        ? [
            {
              rawMaterial: '-',
              manufacturing: '-',
              distribution: '-',
              employ: '-',
              abandon: '-',
            },
          ]
        : [
            {
              rawMaterial: dataFootprintResult?.rawMaterial ?? '-',
              manufacturing: dataFootprintResult?.manufacturing ?? '-',
              distribution: dataFootprintResult?.distribution ?? '-',
              employ: dataFootprintResult?.employ ?? '-',
              abandon: dataFootprintResult?.abandon ?? '-',
            },
          ],
    });
    setFootBorderType(dataInfo?.supplierData?.footBorderType);
    if (dataInfo?.supplierData?.footBorderType === 1) {
      form.setFieldState('*.*(employ,abandon)', {
        visible: false,
      });
    }

    if (shareActionsLocked) {
      form.setFieldState('emission', { visible: false });
      form.setFieldState('*.*(table)', { visible: false });
      form.setFieldState(
        '*(emissionIntensityIsClear,emissionIntensityIsClear2)',
        {
          visible: false,
        },
      );
    } else {
      form.setFieldState('emission', { visible: true });
      form.setFieldState('*.*(table)', { visible: true });
    }

    if (!Array.isArray(dataFootprintResult?.report)) {
      setReportList(JSON.parse(dataFootprintResult?.report || '[]'));
    }
    const hasCarbonAccountCourse = tabList.find(
      item => item.key === 'productCarbonPrintCourse',
    );

    if (
      (dataInfo?.supplierData?.dataType === 2 ||
        dataInfo?.supplierData?.dataType === 3) &&
      !hasCarbonAccountCourse
    ) {
      tabList.splice(1, 0, {
        key: 'productCarbonPrintCourse',
        tab: I18N.carbonFootprint3.carbonFootprintVerification,
      });
      setTabList([...tabList]);
    }
    if (dataInfo?.supplierData?.status === 0) {
      setType('empty');
    } else if (dataInfo?.supplierData?.dataType === 2) {
      setType('course');
    } else if (dataInfo?.supplierData?.dataType === 3) {
      setType('quick');
    }
  }, [dataInfo, shareActionsLocked, form]);

  const renderTabs = () => {
    apiListALLByDictTypeData({ dictType: 'factorUnitM' }).then(res => {
      form.setFieldState('computationUnitArr', {
        dataSource: translateCasCaderData(res.data.data),
      });
    });
    const onChange = (key: string | RadioChangeEvent) => {
      let value = '';
      if (typeof key === 'string') {
        value = key;
      } else {
        value = key.target.value;
      }
      setTabActive(value as string);
      localStorage.setItem('productCarbonPrintTab', value as string);
    };
    const showComponent = (key: string): ReactNode => {
      //  产品碳足迹核算结果相关逻辑
      if (key === 'productCarbonPrintResult') {
        return (
          <div className='padding-0-16'>
            {footBorderType ? (
              <FormilyCommon form={form}>
                <CarbonAccounResult
                  schema={productCarbonPrintResultSchema(footBorderType)}
                />
              </FormilyCommon>
            ) : (
              ''
            )}
          </div>
        );
      }
      //   采购产品列表相关逻辑
      if (key === 'productCarbonPrintCourse') {
        if (shareActionsLocked) {
          return (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              imageStyle={{ height: 75, marginTop: '20vh' }}
              description={I18N.supplyChain.notYetFilledIn}
            />
          );
        }
        if (type === 'quick') {
          return (
            <ProductFootprintQuick
              jumpDetailUrl={jumpDetailUrl}
              titType={titType}
              isChaniApi={isChaniApi}
              isComponent={props.isComponent}
            />
          );
        }
        if (type === 'course') {
          if (
            !dataInfo ||
            dataInfo.supplierData.status === 0 ||
            dataInfo.supplierData.status === 1
          ) {
            return (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                imageStyle={{ height: 75, marginTop: '20vh' }}
              />
            );
          }
          return (
            <ProcessAccountingInfo
              id={dataInfo.supplierData.snapshootId}
              flag={false}
            />
          );
        }
        return (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            imageStyle={{ height: 75, marginTop: '20vh' }}
          />
        );
      }
      if (key === 'productCarbonPrintReport') {
        return (
          <div className='padding-0-16'>
            <ReportDownloadList
              reportList={reportList}
              disabled={shareActionsLocked}
            />
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
  return (
    <div className='supply-chain-container-p-0'>
      {isModelShare ? (
        <div className='padding-l-16 margin-b-16'>
          <ModelShareBadge />
        </div>
      ) : null}
      {renderTabs()}
    </div>
  );
};

export default ProductCarbonPrint;
