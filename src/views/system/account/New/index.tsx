/*
 * @@description:创建企业 / 我的账号 修改密码
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-01-16 10:24:44
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-05 15:19:31
 */

// import { apiCity } from '@src/api/api';
// import { Citys } from '@src/api/types';
// // import I18N from '@src/lang/I18N';
// import { RouteMaps } from '@src/router/route-paths';
// import { getUserInfo, switchCompany } from '@src/utils';
// import {
//   apiListALLByDictTypeData,
//   apiMnumListALLByDictTypeBatch,
// } from '@src/views/emission/Show/service';
// import { Dicts } from '@src/views/emission/Show/type';
// import { Button, Cascader, Form, Input, Radio } from 'antd';
// import { useEffect, useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { useHistory } from 'react-router-dom';

import Style from './index.module.less';
// import { IndustryAndPersionel } from '../../utils/type';
import CreateTrialOrg from '../component/CreateTrialOrg';
// import { apiAddCompany } from '../service';

const CreateOrganization = () => (
  // const history = useHistory();
  // const isSettings = history.location.pathname.includes(
  //   RouteMaps.accountSettions,
  // );

  // const dispatch = useDispatch();

  // const [companySizeList, setCompanySizeList] = useState<Dicts[]>([]);

  // const [industryList, setIndustryList] = useState<Dicts[]>([]);

  // const [cityList, setCityList] = useState<Citys[]>([]);

  // const [submitLoading, setSubmitLoading] = useState(false);

  // // 获取创建企业字段
  // const getList = async () => {
  //   apiCity().then(setCityList);
  //   apiMnumListALLByDictTypeBatch({
  //     dictTypes: 'organizationScale',
  //   }).then(({ data }) => {
  //     const d = data?.data as unknown as IndustryAndPersionel;
  //     if (d) {
  //       setCompanySizeList(d.organizationScale || []);
  //     }
  //   });
  //   apiListALLByDictTypeData({
  //     dictType: 'business',
  //   }).then(({ data }) => {
  //     const d = data?.data;
  //     if (d) {
  //       setIndustryList(d || []);
  //     }
  //   });
  // };
  // useEffect(() => {
  //   if (!isSettings) getList();
  // }, []);
  // const [form] = Form.useForm();

  // const createCompany = async () => {
  //   try {
  //     setSubmitLoading(true);
  //     const userId = getUserInfo()?.userInfo.userId;
  //     const formValues = await form.validateFields();
  //     const { data } = await apiAddCompany({
  //       ...formValues,
  //       area: JSON.stringify((formValues as { area: string[] }).area),
  //       industry: formValues.industry.join(','),
  //       userId,
  //     });

  //     const { companyId } = (data as unknown as { data: { companyId: string } })
  //       .data;

  //     await switchCompany({ companyId, dispatch, history });
  //   } finally {
  //     setTimeout(() => {
  //       setSubmitLoading(false);
  //     }, 500);
  //   }
  // };

  <div className={Style.wrapper}>
    {/* <LayoutHeader /> */}
    {/* {!isSettings && (
        <div className={Style.header}>
          <div className={Style.headerContent}>
            <div className={Style.headerTitle}>
              {I18N.system.creatingABusiness}
            </div>
          </div>
        </div>
      )}
      {isSettings && <UserInfo />} */}

    {/* {!isSettings && (
        <div className={Style.content}>
          <div className={Style.contentTitle}>
            <span>{I18N.system.fillInInformation}</span>
            <span className={Style.contentCaption}>
              {I18N.system.newlyCreatedEnterprise}
            </span>
          </div>
          <div className={Style.formContent}>
            <Form form={form} colon={false} layout='vertical'>
              <Form.Item
                name='companyName'
                label={I18N.dashborad.enterpriseName}
                rules={[
                  {
                    required: true,
                    message: I18N.system.enterpriseNameNotApplicable,
                  },
                  { max: 100, message: I18N.system.upToInput },
                ]}
              >
                <Input placeholder={I18N.carbonFootprint.pleaseEnter} />
              </Form.Item>
              <Form.Item
                name='industry'
                label={I18N.dashborad.industry}
                rules={[
                  {
                    required: true,
                    message: I18N.dashborad.pleaseSelectTheAffiliation,
                  },
                ]}
              >
                <Cascader
                  placeholder={I18N.carbonFootprint.pleaseSelect}
                  fieldNames={{
                    value: 'dictValue',
                    label: 'dictLabel',
                    children: 'enumList',
                  }}
                  options={industryList}
                />
              </Form.Item>
              <Form.Item
                name='area'
                label={I18N.system.location}
                rules={[
                  {
                    required: true,
                    message: I18N.dashborad.pleaseSelectTheLocation,
                  },
                ]}
              >
                <Cascader
                  placeholder={I18N.carbonFootprint.pleaseSelect}
                  fieldNames={{ value: 'code', label: 'name' }}
                  options={cityList}
                />
              </Form.Item>
              <Form.Item
                name='scale'
                label={I18N.dashborad.enterpriseScale}
                rules={[
                  {
                    required: true,
                    message: I18N.dashborad.pleaseSelectACompany,
                  },
                ]}
              >
                <Radio.Group
                  className={Style.companySizeRadio}
                  options={companySizeList.map(({ dictLabel, dictValue }) => ({
                    value: dictValue,
                    label: dictLabel,
                  }))}
                />
              </Form.Item>
            </Form>
            <Button
              className={Style.submitBtn}
              type='primary'
              loading={submitLoading}
              onClick={createCompany}
            >
              {I18N.system.createAndEnter}
            </Button>
            <Button
              className={Style.cancelBtn}
              onClick={() => history.push(RouteMaps.account)}
            >
              {I18N.carbonFootprint.cancel}
            </Button>
          </div>
        </div>
      )} */}
    <CreateTrialOrg simple />
  </div>
);
export default CreateOrganization;
