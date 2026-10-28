/**
 * @file  供应链管理-邀请链接页面
 * @author wangjiahui
 */
import I18N from '@src/lang/I18N';
import { LayoutHeader } from '@components/LayoutHeader';
import { apiQuideList, switchoverCompany } from '@src/api/api';
import { ApiAccpetInvitation, ApiInviteInfoGet } from '@src/api/supplychain';
import { Companys } from '@src/api/types';
import { Button } from '@src/components/Button';
import { getProductPermission } from '@src/components/LayoutNavBar/utils';
import { ModalBase } from '@src/components/UI/Modal';
import { RouteMaps } from '@src/router/route-paths';
import store from '@src/store';
import { SET_COMPANY_USER_INFO, UPDATE_INFO } from '@src/store/actionTypes';
import { GRT_NAV } from '@src/store/module/nav';
import { CompanyUserInfoAction } from '@src/store/module/user';

import { getUserInfo, mapChildren } from '@src/utils';
import { ProductIdentification } from '@src/utils/consts';

import { Toast } from '@src/utils/Toast';
import { apiCompanyList } from '@src/views/system/account/service';
import { Form, Select } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { InviteSearch } from '../utils/common';

import style from './index.module.less';

interface BecomeCode {
  code: string;
  companyId: number;
}
const InviteLinkPage = () => {
  const dispatch = useDispatch();
  const [becomeSupplyForm] = Form.useForm<BecomeCode>();
  const history = useHistory();
  const [loading, setLoading] = useState<boolean>(false);
  const [createGroupModal, setCreateGroupModal] = useState<string>('');
  const search = new URLSearchParams(window?.location?.search);
  /** 组织下拉框 */
  const [orgList, setOrgList] = useState<{
    companys: Companys[];
  }>({
    companys: [],
  });

  /** /邀请码/邀请人姓名   */
  const [orgInfo, setOrgInfo] = useState<{ code: string; name: string }>({
    code: '',
    name: '',
  });

  /** 查询组织列表方法 */
  const apiCompanyListFn = async () => {
    const storages = getUserInfo();
    if (storages) {
      const data = await apiCompanyList({
        userId: storages.userInfo.userId,
        page: '1',
        size: '10000',
      });
      const companys = data?.data?.rows || [];
      if (companys && companys.length > 0) {
        setOrgList({
          ...orgList,
          companys,
        });
        return companys;
      }
      /** 如果无组织出现去创建组织弹窗 */
      return setCreateGroupModal('CreateGroupModal');
    }
    return true;
  };

  /** 判断当前路径是否有参数来获取code和邀请人 */
  const getInviteInfo = async () => {
    if (search) {
      const invitedId = search?.get(InviteSearch.COMID);
      if (invitedId) {
        /** 如果通过邀请链接进入获取就存下来邀请id */
        sessionStorage.setItem(InviteSearch.COMID, invitedId);
        return ApiInviteInfoGet({ invitationCodeId: invitedId }).then(
          ({ data }) => {
            if (data?.code === 200) {
              setOrgInfo({
                ...orgInfo,
                name: data?.data?.companyName || '',
                code: data?.data?.code || '',
              });
              apiCompanyListFn();
            }
          },
        );
      }
      sessionStorage.removeItem(InviteSearch.COMID);
      return Toast('error', I18N.becomeSupplierOrPurchasing.thisInvitationLink);
    }
    return true;
  };

  /** 获取 所有的导航 */
  const updateNavData = async () => {
    await apiQuideList().then(({ data }) => {
      if (data.code === 200) {
        const newArr = data?.data?.map(item => ({
          id: item.id,
          name: item.guideName,
          isFloat: `${item.isFloat}`,
          web_path: '',
          children: mapChildren(item.categoryList),
          checkid: item.id,
        }));
        dispatch({
          type: GRT_NAV,
          payload: newArr,
        });
      }
    });
  };

  /** 更新左侧菜单 */
  const updatePermissionRole = async () => {
    await getProductPermission(ProductIdentification.SUPPLIER).then(
      ([, info]) => {
        if (info) {
          /** 为了判断如果供应商有权限点就跳转客户管理 */
          if (info?.permissionSet?.length > 0) {
            store.dispatch<CompanyUserInfoAction>({
              type: UPDATE_INFO,
              payload: info,
            });
            updateNavData();
            return history.push(
              `${RouteMaps.clientManagement}?${ProductIdentification.SAAS_PRODUCT_NAME}=${ProductIdentification.SUPPLIER}`,
            );
          }
          updateNavData();
          /** 没有权限点就跳转工作台首页 */
          return history.push(`${RouteMaps.workIndex}`);
        }
        return true;
      },
    );
  };

  /** 根据companyId进入系统 */
  const goSassManage = async () => {
    const user = getUserInfo();
    await switchoverCompany({
      companyId: becomeSupplyForm.getFieldValue('companyId'),
      userId: user?.userInfo?.userId || '',
    })
      .then(res => {
        const userData = res?.data?.data;
        if (res?.data?.code === 200 && userData) {
          dispatch<CompanyUserInfoAction>({
            type: SET_COMPANY_USER_INFO,
            payload: userData,
          });
          // 保证dispatch完成后再调整页面，防止出现异常退出（workIndex 会检测 SET_COMPANY_USER_INFO 数据，如果没有会退出）
          setTimeout(() => {
            updatePermissionRole();
          }, 300);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  /** 成为供应商  */
  const handleBecome = async (val: BecomeCode) => {
    await ApiAccpetInvitation({
      code: orgInfo.code,
      companyId: val.companyId,
    })
      .then(async ({ data }) => {
        if (data.code === 200) {
          Toast('success', I18N.carbonFootprint.operationSuccessful);
          setTimeout(() => {
            goSassManage();
          }, 500);
        }
        if (data.code === 609) {
          Toast('warn', data?.msg);
          setLoading(false);
        }
        if (data.code === 607) {
          Toast('warn', data?.msg);
          setLoading(false);
        }
      })
      .finally(() => {
        sessionStorage.removeItem(InviteSearch.COMID);
      });
  };

  /** 确认成为供应商 */
  const becomeSupply = async () => {
    becomeSupplyForm
      .validateFields()
      .then(async val => {
        setLoading(true);
        handleBecome({ ...val });
      })
      .catch(err => {
        setLoading(false);
        // eslint-disable-next-line no-console
        console.log(err);
      });
  };

  /** 去创建组织 */
  const handelCreatAccount = () => {
    history.push(RouteMaps.newOrganization);
  };

  useEffect(() => {
    getInviteInfo();
  }, []);
  return (
    <div className={style.invite_link} aria-label='invite_link'>
      <LayoutHeader showAvatar={false} />
      <main className={style.invite_link_main} aria-label='invite_link_main'>
        <div className={style.invite_head} aria-label='invite_head'>
          {orgInfo.name || ''}{I18N.becomeSupplierOrPurchasing.invitingYouToBecome}</div>
        <div aria-label='invite_tips' className={style.invite_tips}>
          {I18N.becomeSupplierOrPurchasing.clickToSelectYou}</div>
        <div className={style.select_com} aria-label='select_com'>
          <Form form={becomeSupplyForm}>
            <Form.Item
              label=''
              name='companyId'
              rules={[{ required: true, message: I18N.becomeSupplierOrPurchasing.pleaseSelectAnOrganization }]}
              aria-label='companyId'
            >
              <Select
                aria-label='company_select_supply'
                options={orgList.companys}
                fieldNames={{ label: 'companyName', value: 'companyId' }}
                style={{ width: '100%' }}
                placeholder={I18N.becomeSupplierOrPurchasing.pleaseSelectAnOrganization}
              />
            </Form.Item>
          </Form>
        </div>
        <div className={style.sure_button} aria-label='sure_button_supply'>
          <Button
            type='primary'
            onClick={async () => {
              becomeSupply();
            }}
            loading={loading}
            aria-label='become_button_supply'
          >
            {I18N.becomeSupplierOrPurchasing.confirmedAsSupply}</Button>
        </div>
        <ModalBase
          closable={false}
          getContainer={false}
          width={420}
          visible={createGroupModal === 'CreateGroupModal'}
          title={I18N.carbonFootprint.prompt}
          content={<div>{I18N.becomeSupplierOrPurchasing.youCurrentlyHaveNoGroups}</div>}
          footer={[
            <Button
              key='goaccount'
              type='primary'
              onClick={async () => {
                handelCreatAccount();
              }}
            >
              {I18N.enterpriseCarbonAccount2.goCreate}</Button>,
          ]}
        />
      </main>
    </div>
  );
};

export default InviteLinkPage;
