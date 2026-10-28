/**
 * @file 版本控制编辑详情
 * @author lixingchen
 * */
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { listALLByDictTypeBatchUsingGET1CDictEnumControllerApi } from '@src/sdks/java/management/api';
import { Toast } from '@src/utils/Toast';
import { apiListALLByDictTypeData } from '@src/views/emission/Show/service';
import { Dicts } from '@src/views/emission/Show/type';
import { apiAddressTree } from '@src/views/greenMeeting/service';
import { Form, Tabs } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import '../../style.less';
import { FormActions } from '@src/components/FormActions';
import { Page } from '@src/components/Page';

import { Boundary } from './component/Boundary';
import { DataManage } from './component/DataManage';
import { DataQuality } from './component/DataQuality';
import { OrgInfo } from './component/OrgInfo';
import { Product } from './component/Product';
import { Version } from './component/Version';
import {
  apiClassList,
  apiDeletePlaneEdit,
  apiEnterprisePlanDetail,
  apiPlanDataList,
} from '../../service';

const SupplierDashboardPage = () => {
  const [tabName, setTabName] = useState('');
  const [unitMList, setUnitMList] = useState<any>([]);
  const [controInfo, setControInfo] = useState<any>();
  const [pageType, setPageType] = useState<'detail' | 'edit'>('detail');
  const [form] = Form.useForm();
  const [cityList, setCityList] = useState([]);
  const [industry, setIndustry] = useState<Dicts[]>();
  const history = useHistory();
  const [ISOInfo, setISOInfo] = useState<any>([]);
  const [canEdit, setCanEdit] = useState<boolean | undefined>(undefined);
  const [GHGInfo, setGHGInfo] = useState<any>([]);
  const onTabChange = (key: string) => {
    setTabName(key);
  };
  const controlPlanId = new URLSearchParams(location.search).get('id') || '';

  const tabList = [
    { key: 'version', tab: I18N.enterpriseCarbonAccount2.versionAndRevision },
    {
      key: 'orgInfo',
      tab: I18N.enterpriseCarbonAccount2.organizationalBasicInformation,
    },
    { key: 'product', tab: I18N.enterpriseCarbonAccount2.mainProductService4 },
    {
      key: 'boundary',
      tab: I18N.enterpriseCarbonAccount2.organizationalBoundaries,
    },
    {
      key: 'dataManage',
      tab: I18N.enterpriseCarbonAccount2.dataManagementMeter,
    },
    {
      key: 'dataQuality',
      tab: I18N.enterpriseCarbonAccount2.dataQualityManagement,
    },
  ];
  const opretion = res => {
    if (res.data.code === 200) {
      Toast('success', I18N.carbonFootprint.saveSuccessful);
    } else {
      Toast('warn', I18N.enterpriseCarbonAccount2.saveFailedPlease);
    }
  };
  const showComponent = (tabName: string) => {
    switch (tabName) {
      case 'version':
        return (
          <Version
            data={controInfo}
            pageType={pageType}
            getData={getData}
            setPropCanEdit={canEdit}
            saveData={values => {
              const { versionCode, enactTime, enactContent, remark } = values;
              apiDeletePlaneEdit({
                controlPlanId,
                versionCode,
                enactTime: moment(enactTime).format('YYYY-MM-DD HH:mm'),
                enactContent,
                type: 0,
                remark,
              }).then(
                res => {
                  opretion(res);
                  setCanEdit(undefined);
                  setCanEdit(false);
                },
                () => {
                  setCanEdit(undefined);
                  setCanEdit(true);
                },
              );
            }}
          />
        );
      case 'orgInfo':
        return (
          <OrgInfo
            data={controInfo}
            pageType={pageType}
            getData={getData}
            cityList={cityList}
            industry={industry}
            saveData={values => {
              // const { versionCode, enactTime, enactContent } = values;
              apiDeletePlaneEdit({
                ...values,
                controlPlanId,
                versionCode: controInfo.versionCode,
                type: 1,
              }).then(res => {
                opretion(res);
              });
            }}
          />
        );
      case 'product':
        return (
          <Product
            industry={industry}
            unitMList={unitMList}
            getData={getData}
            data={controInfo}
            pageType={pageType}
            refreshData={getData}
            saveData={() => {}}
          />
        );
      case 'boundary':
        return (
          <Boundary
            data={controInfo}
            getData={getData}
            pageType={pageType}
            saveData={values => {
              apiDeletePlaneEdit({
                controlPlanId,
                ...values,
                type: 2,
              }).then(res => {
                opretion(res);
              });
            }}
          />
        );
      case 'dataManage':
        return (
          <DataManage
            data={controInfo}
            pageType={pageType}
            ISOInfo={ISOInfo}
            getData={getData}
            GHGInfo={GHGInfo}
            saveData={values => {
              apiDeletePlaneEdit({
                controlPlanId,
                ...values,
                type: 2,
              }).then(res => {
                opretion(res);
              });
            }}
          />
        );
      case 'dataQuality':
        return (
          <DataQuality
            data={controInfo}
            getData={getData}
            pageType={pageType}
            saveData={values => {
              apiDeletePlaneEdit({
                controlPlanId,
                ...values,
                type: 3,
              }).then(res => {
                opretion(res);
              });
            }}
          />
        );
      default:
        return <>&nbsp;</>;
    }
  };
  const getData = () => {
    const id = new URLSearchParams(location.search).get('id') || '';
    apiEnterprisePlanDetail(id).then((res: any) => {
      setControInfo({
        ...res.data.data,
        gasGroupImgList: res.data.data.gasGroupImgList || [],
        enactTime: moment(res.data.data.enactTime),
      });
      form.setFieldsValue({
        ...res.data.data,
      });
    });
  };
  useEffect(() => {
    getData();
  }, [tabName]);
  useEffect(() => {
    const tabNames =
      new URLSearchParams(location.search).get('tabName') || 'version';
    setPageType(
      history.location.pathname.includes('Detail') ? 'detail' : 'edit',
    );
    setTabName(tabNames);
    getData();
    apiListALLByDictTypeData({ dictType: 'factorUnitM' }).then(res => {
      setUnitMList(res.data.data);
    });
    listALLByDictTypeBatchUsingGET1CDictEnumControllerApi(
      'organizationIndustry',
    ).then((res: any) => {
      setIndustry(res.data.data.organizationIndustry);
    });
    apiAddressTree({ level: 3 }).then((res: any) => {
      setCityList(res.data.data);
    });
    // 数据管理列表
    apiClassList().then((res: any) => {
      const list = res.data;
      const initIso = list.filter(item => item.type === 0);
      const initGhg = list.filter(item => item.type === 1);

      apiPlanDataList({ controlPlanID: controlPlanId }).then((res: any) => {
        const dataList = res.data.rows || [];

        initIso.forEach((item, index) => {
          dataList.forEach(ite => {
            if (ite.type === item.commonId) {
              initIso[index].activityDesc = ite.activityDesc;
              initIso[index].controlPlanDataId = ite.controlPlanDataId;
            }
          });
        });
        initGhg.forEach((item, index) => {
          dataList.forEach(ite => {
            if (ite.type === item.commonId) {
              initGhg[index].activityDesc = ite.activityDesc;
              initGhg[index].controlPlanDataId = ite.controlPlanDataId;
            }
          });
        });

        setISOInfo(initIso);
        setGHGInfo(initGhg);
      });
    });
  }, []);
  return (
    <div className='enterprise-carbon-account2'>
      <Page
        styles={{ paddingLeft: 16 }}
        breadCrumbs={[
          {
            title: I18N.enterpriseCarbonAccount2.controlPlan,
            key: I18N.enterpriseCarbonAccount2.controlPlan,
            href: RouteMaps.enterpriseCarbonAccountingDataQualityControlPlanList,
          },
          {
            title:
              pageType === 'detail'
                ? I18N.enterpriseCarbonAccount2.detailedControlPlan
                : I18N.enterpriseCarbonAccount2.editControlMeter,
            key:
              pageType === 'detail'
                ? I18N.enterpriseCarbonAccount2.detailedControlPlan
                : I18N.enterpriseCarbonAccount2.editControlMeter,
          },
        ]}
      >
        {tabName ? (
          <Tabs
            className='tab-box'
            defaultActiveKey={tabName}
            onChange={onTabChange}
          >
            {tabList.map(item => (
              <Tabs.TabPane {...item}>{showComponent(tabName)}</Tabs.TabPane>
            ))}
          </Tabs>
        ) : (
          <div>&nbsp;</div>
        )}

        <FormActions
          place='center'
          buttons={[
            {
              type: 'default',
              title: I18N.carbonFootprint.return,
              onClick: async () => {
                history.goBack();
              },
            },
          ]}
        />
      </Page>
    </div>
  );
};
export default SupplierDashboardPage;
