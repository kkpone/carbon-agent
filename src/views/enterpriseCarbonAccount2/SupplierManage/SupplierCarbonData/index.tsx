/*
 * @@description: 供应商碳数据-审核详情
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-02-20 11:22:25
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-28 10:00:24
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
import { RouteMaps } from '@src/router/route-paths';
import { Toast } from '@src/utils/Toast';
import { apiListALLByDictTypeData } from '@src/views/emission/Show/service';
import { useIndexColumn } from '@src/views/emission/utils';
import { apiDataIfoReq } from '@src/views/supplyChain2/carbonDataManage/CarbonDataFill/service';
import { apiDataAuditList } from '@src/views/supplyChain2/carbonDataManage/SupplierCarbonData/service';
import ProductCarbonPrint from '@src/views/supplyChain2/components/ProductCarbonPrint';
import { apiChainData } from '@src/views/supplyChain2/service';
import { DataBackType } from '@src/views/supplyChain2/type';
import { translateCasCaderData } from '@src/views/supplyChain2/utils';
import { Modal, Tabs } from 'antd';
import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { auditHistoryCloumn } from './cloumns';
import {
  carbonDataPriviewSchema,
  dataRequestSchema,
  auditSchema,
} from './schema';
import { apiInnerEnterpriseAudit } from '../service';
import { InnerEnterpriseAuditParmas } from '../type';

const SupplySupplierDetail: FC = () => {
  const history = useHistory();
  const path = history.location.pathname;
  const search = new URLSearchParams(window.location.search);
  const id = search.get('id') || '';
  const auditForm = useMemo(createForm, []);
  const [dataInfo, setDataInfo] = useState<DataBackType>();
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
  const form = useMemo(
    () =>
      createForm({
        readPretty: true,
      }),
    [],
  );
  //   当前选中tab
  const [tabActive, setTabActive] = useState(
    localStorage.getItem('supplierCarbonDataTab') || 'carbonDataPriview',
  );
  const getInfo = () => {
    apiChainData(id).then(({ data }) => {
      // const { reqType } = data.data.supplierData;
      // if (reqType === 2 || reqType === 4) {
      form.setValues({
        ...data.data.supplierData,
        createBy: '',
        computationUnitArr: data.data.supplierData.computeUnit?.split(','),
      });
      // } else {
      //   form.setValues(data.data.supplierData);
      // }
      setDataInfo(data.data);
      apiDataIfoReq({ id }).then(({ data }) => {
        form.setValues({
          createBy: data.data.createBy,
        });
      });
    });
  };
  useEffect(() => {
    getInfo();
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
        return (
          <div className='padding-0-16'>
            <FormilyCommon form={form}>
              <SupplierInfoSchemaField schema={dataRequestSchema()} />
            </FormilyCommon>
          </div>
        );
      }
      //   数据填报相关逻辑
      if (key === 'carbonFill') {
        return (
          <ProductCarbonPrint
            jumpDetailUrl={
              RouteMaps.enterpriseCarbonAccountingSupplierManagDetailEmissionDetail
            }
            isChaniApi
            titType='radio'
            dataInfo={dataInfo}
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
                  I18N.template(I18N.enterpriseCarbonAccount2.totalTota5, {
                    val1: total,
                  }),
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
          let formData: InnerEnterpriseAuditParmas = await auditForm.submit();
          formData = { ...formData, id };
          apiInnerEnterpriseAudit(formData).then(({ data }) => {
            if (data.code === 200) {
              Toast('success', I18N.enterpriseCarbonAccount2.reviewSuccessful);
              setModalVisible(false);
              history.goBack();
            }
          });
        }}
      >
        <FormilyCommon form={auditForm}>
          <AuditSchemaField schema={auditSchema()} />
        </FormilyCommon>
      </Modal>
      <FormActions
        place='center'
        buttons={
          path.includes('Audit')
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
    </div>
  );
};

export default SupplySupplierDetail;
