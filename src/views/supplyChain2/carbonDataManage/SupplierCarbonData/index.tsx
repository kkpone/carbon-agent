/*
 * @@description: 供应商碳数据-审核详情
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-02-20 11:22:25
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-28 09:55:22
 */
/**
 * @file 供应商碳数据-审核详情
 */
import I18N from '@src/lang/I18N';
import '@src/views/supplyChain2/style.less';
import {
  FormGrid,
  FormLayout,
  FormItem,
  Input,
  Select,
  DatePicker,
  Checkbox,
  Radio,
  Cascader,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { FormActions } from '@src/components/FormActions';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { RouteMapsSupplyChain2 } from '@src/router/route-paths/supplyChain2';
import { Toast } from '@src/utils/Toast';
import { apiListALLByDictTypeData } from '@src/views/emission/Show/service';
import { useIndexColumn } from '@src/views/emission/utils';
import { Modal, Tabs } from 'antd';
import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { auditHistoryCloumn } from './cloumns';
import {
  carbonDataPriviewSchema,
  dataRequestSchema,
  auditSchema,
} from './schema';
import { apiDataAudit, apiDataAuditList } from './service';
import { DataAuditParams } from './type';
import CarbonAccountDetail from '../../components/EnterpriseCarbonAccount';
import ProductCarbonPrint from '../../components/ProductCarbonPrint';
import { apiChainData } from '../../service';
import { DataBackType } from '../../type';
import { translateCasCaderData } from '../../utils';
import { apiDataIfoReq } from '../CarbonDataFill/service';

const SupplySupplierDetail: FC<{ isComponent?: boolean }> = props => {
  const history = useHistory();
  const path = history.location.pathname;
  const [dataInfo, setDataInfo] = useState<DataBackType>();
  const search = new URLSearchParams(window.location.search);
  const id = search.get('id') || '';
  // 填报类型
  const [carbonFillType, setCarbonFillType] = useState<
    'carbonAccount' | 'footPrint'
  >('carbonAccount');
  // 数据请求类型
  const [requestType, setRequestType] = useState<
    'footPrint' | 'carbonAccount' | 'purchase' | 'supplier'
  >();
  const auditForm = useMemo(createForm, []);
  const AuditSchemaField = createSchemaField({
    // 组件列表
    components: {
      FormLayout,
      FormGrid,
      FormItem,
      Radio,
      Input,
      Select,
      DatePicker,
      Checkbox,
    },
  });
  const [modalVisible, setModalVisible] = useState(false);

  //   当前选中tab
  const [tabActive, setTabActive] = useState(
    localStorage.getItem('supplierCarbonDataTab') || 'carbonDataPriview',
  );
  const form = useMemo(
    () =>
      createForm({
        readPretty: true,
      }),
    [],
  );
  const getDataPriview = () => {
    const reqTypeObj = {
      1: 'purchase',
      2: 'supplier',
      3: 'footPrint',
      4: 'carbonAccount',
    };
    Promise.all([apiChainData(id), apiDataIfoReq({ id })]).then(
      ([chainData, dataIfoReq]) => {
        const accountSelect = dataIfoReq.data.data.computationScope
          ?.split(',')
          ?.map(num => Number(num));
        const computationScopeISO: number[] = [];
        const computationScopeGHG: number[] = [];
        accountSelect.forEach(num => {
          if (num > 3) {
            computationScopeISO.push(num);
          } else {
            computationScopeGHG.push(num);
          }
        });
        form.setValues({
          ...chainData.data.data.supplierData,
          ...dataIfoReq.data.data,
          computationUnitArr: dataIfoReq.data.data.computationUnit?.split(','),
          computationTypes: dataIfoReq.data.data.computationType?.split(','),
          computationScopeISO,
          computationScopeGHG,
          emissionDesc: chainData.data.data.supplierData.emissionDesc,
          computeCompanyName:
            chainData.data.data.supplierData.computeCompanyName,
        });
        setDataInfo(chainData.data.data);
        const { reqType } = chainData.data.data.supplierData;

        if (reqType === 1 || reqType === 3 || reqType === 4) {
          setCarbonFillType('footPrint');
        } else {
          setCarbonFillType('carbonAccount');
        }
        setRequestType(reqTypeObj[reqType]);
      },
    );
  };
  useEffect(() => {
    getDataPriview();
    apiListALLByDictTypeData({ dictType: 'factorUnitM' }).then(res => {
      form.setFieldState('computationUnitArr', {
        dataSource: translateCasCaderData(res.data.data),
      });
    });
  }, []);

  const SupplierInfoSchemaField = createSchemaField({
    // 组件列表
    components: {
      FormLayout,
      FormGrid,
      Checkbox,
      Radio,
      FormItem,
      Input,
      Select,
      DatePicker,
      Cascader,
    },
  });
  //   采购产品列表分页
  const [accountPage, setAccountPage] = useState({
    current: 1,
    pageSize: 10,
  });
  //   企业碳核算序号
  const accountIndexColumn = useIndexColumn<any>(
    (accountPage.current - 1) * accountPage.pageSize,
  );
  const renderTabs = () => {
    const tabList = [
      {
        key: 'carbonDataPriview',
        tab: I18N.carbonFootprint3.overviewOfCarbonData,
      },
      { key: 'dataRequest', tab: I18N.carbonFootprint3.dataRequest },
      { key: 'carbonFill', tab: I18N.carbonFootprint3.fillingInData },
      { key: 'auditHistory', tab: I18N.carbonFootprint3.auditRecords },
    ];
    const onChange = (key: string) => {
      setTabActive(key);
      localStorage.setItem('supplierCarbonDataTab', key);
    };
    const showComponent = (key: string): ReactNode => {
      //   碳数据概览相关逻辑
      if (key === 'carbonDataPriview') {
        return (
          <div className='padding-0-16'>
            <FormilyCommon form={form}>
              <SupplierInfoSchemaField schema={carbonDataPriviewSchema()} />
            </FormilyCommon>
          </div>
        );
      }
      //   数据请求表相关逻辑
      if (key === 'dataRequest') {
        return requestType ? (
          <div className='padding-0-16'>
            <FormilyCommon form={form}>
              <SupplierInfoSchemaField
                schema={dataRequestSchema(requestType)}
              />
            </FormilyCommon>
          </div>
        ) : (
          ''
        );
      }
      //   数据填报相关逻辑
      if (key === 'carbonFill') {
        return carbonFillType === 'carbonAccount' ? (
          <CarbonAccountDetail
            titType='radio'
            dataInfo={dataInfo}
            isChaniApi
            jumpDetailUrl={
              path === RouteMapsSupplyChain2.supplySupplierCarbonDataAudit
                ? RouteMapsSupplyChain2.supplySupplierCarbonDataCarbonAccountAuditEmissionDetail
                : RouteMapsSupplyChain2.supplySupplierCarbonDataCarbonAccountDetailEmissionDetail
            }
          />
        ) : (
          <ProductCarbonPrint
            titType='radio'
            isComponent={props.isComponent}
            dataInfo={dataInfo}
            isChaniApi
            jumpDetailUrl={
              path === RouteMapsSupplyChain2.supplySupplierCarbonDataAudit
                ? RouteMapsSupplyChain2.supplySupplierCarbonDataFootprintAuditEmissionDetail
                : RouteMapsSupplyChain2.supplySupplierCarbonDataFootprintDetailEmissionDetail
            }
          />
        );
      }

      if (key === 'auditHistory') {
        const returnFetchApi = back => ({
          data: back.data.rows,
          count: back.data.total,
        });
        return (
          <div className='padding-0-16'>
            <CommonTable
              className='margin-t-6'
              columns={[...accountIndexColumn, ...auditHistoryCloumn()]}
              scroll={{ y: 'calc(100vh - 296px)' }}
              pageSize={10}
              pagination={{
                showTotal: total =>
                  I18N.template(I18N.supplyChain2.totalTota8, { val1: total }),
              }}
              pagePosition={false}
              fetchApi={async params => {
                setAccountPage({ current: params.page, pageSize: params.size });
                return apiDataAuditList({
                  pageNum: params.page,
                  pageSize: params.size,
                  id,
                });
              }}
              returnFetchApi={returnFetchApi}
            />
          </div>
        );
      }
      return <div />;
    };
    return (
      <Tabs
        defaultActiveKey='footPrint'
        className='padd0-tabs'
        activeKey={tabActive}
        onChange={onChange}
      >
        {tabList.map(item => (
          <Tabs.TabPane {...item}>{showComponent(item.key)}</Tabs.TabPane>
        ))}
      </Tabs>
    );
  };
  return (
    <div className='supply-chain-container-p-0'>
      {renderTabs()}
      <Modal
        open={modalVisible}
        width={448}
        centered
        okButtonProps={{ type: 'default' }}
        title={I18N.carbonFootprint3.auditing}
        wrapClassName='info-modal'
        onCancel={() => {
          setModalVisible(false);
        }}
        onOk={async () => {
          let formData: DataAuditParams = await auditForm.submit();
          formData = { ...formData, id };

          apiDataAudit(formData).then(({ data }) => {
            if (data.code === 200) {
              Toast('success', I18N.enterpriseCarbonAccount2.reviewSuccessful);
              setTimeout(() => {
                history.goBack();
              }, 500);
              setModalVisible(false);
            }
          });
        }}
      >
        <FormilyCommon form={auditForm}>
          <AuditSchemaField schema={auditSchema()} />
        </FormilyCommon>
      </Modal>
      {!props.isComponent && (
        <FormActions
          place='center'
          buttons={
            path === RouteMapsSupplyChain2.supplySupplierCarbonDataAudit ||
            path ===
              RouteMapsCorbonFootprint3.carbonFootprint3SupplierCarbonDataAudit
              ? [
                  {
                    title: I18N.carbonFootprint3.auditing,
                    type: 'primary',
                    onClick: async () => {
                      // history.goBack();
                      setModalVisible(true);
                    },
                  },
                  {
                    title: I18N.carbonFootprint.return,
                    onClick: async () => {
                      history.goBack();
                    },
                  },
                ]
              : [
                  {
                    title: I18N.carbonFootprint.return,
                    onClick: async () => {
                      history.goBack();
                    },
                  },
                ]
          }
        />
      )}
    </div>
  );
};

export default SupplySupplierDetail;
