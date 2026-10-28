/*
 * @@description:组织管理
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-03-28 17:23:00
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-04-22 09:55:08
 */

import { Companys } from '@src/api/types';
import ProductPopover from '@src/components/ProductPopover';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { SET_COMPANY_USER_INFO } from '@src/store/actionTypes';
import { CompanyUserInfoAction } from '@src/store/module/user';
import { Toast } from '@src/utils/Toast';
import { COMPANY_ID } from '@src/utils/consts';
import { InviteSearch } from '@src/views/becomeSupplierOrPurchasing/utils/common';
import { GRT_NAV } from '@store/module/nav';
import {
  checkCompanyTypeAndRedirect,
  getUserInfo,
  logout,
  mapChildren,
  sleep,
} from '@utils/index';
import { Spin } from 'antd';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { EmptyLoading } from '@/components/EmptyLoading';

import styles from './index.module.less';
import Style from './style.module.less';
import { switchoverCompany, apiQuideList } from '../../../../api/api';
import VerifyUtils from '../../../../utils/verifty';
import { PRODUCT_TYPE, PRODUCT_TYPE_LABEL } from '../constant';
import { apiCompanyList } from '../service';

interface ManOrganType {
  propsApiSwitchoverCompany?: (companyId: string) => void;
}

const Organizations = ({ propsApiSwitchoverCompany }: ManOrganType) => {
  const dispatch = useDispatch();
  // 是否正在切换企业
  const [isSwitching, setIsSwitching] = useState(false);
  const history = useHistory();
  const [list, setList] = useState<{ visible: boolean; companys: Companys[] }>({
    visible: false,
    companys: [],
  });
  /** 为了判断是否有邀请码存在来进行跳转供应链邀请页面 @author wangjiahui */
  const isInviteIdInfo = sessionStorage.getItem(InviteSearch.COMID);

  /**
   * @description 进入指定组织系统
   * @param institutionID 组织id
   */
  const inIndex = async (institutionID: string) => {
    setIsSwitching(true);
    if (isSwitching) return;
    const userId = getUserInfo();
    // 存储companyId
    localStorage.setItem(COMPANY_ID, institutionID);
    propsApiSwitchoverCompany?.(`${institutionID}`);

    // 切换企业 获取首页的权限点
    await switchoverCompany({
      companyId: institutionID,
      userId: userId?.userInfo.userId || '',
    }).then(async res => {
      const userData = res?.data?.data;
      if (res.data.code === 200 && userData) {
        dispatch<CompanyUserInfoAction>({
          type: SET_COMPANY_USER_INFO,
          payload: userData,
        });
        // Toast('success', I18N.system.switchSuccessful, 0.5);
        setTimeout(() => {
          setIsSwitching(true);
          // 切换企业 获取 所有的导航 (使用新token)
          apiQuideList()
            .then(({ data }) => {
              if (data.code === 200) {
                const newArr = data.data.map(item => ({
                  id: item.id,
                  name: item.guideName,
                  isFloat: `${item.isFloat}`,
                  web_path: '',
                  children: mapChildren(item?.categoryList || []),
                  checkid: item.id,
                }));
                dispatch({
                  type: GRT_NAV,
                  payload: newArr,
                });
              }
            })
            .finally(() => {
              setIsSwitching(false);
            });
        });
        // 保证dispatch完成后再调整页面，防止出现异常退出（workIndex 会检测 SET_COMPANY_USER_INFO 数据，如果没有会退出）
        await sleep(300);

        // 检查用户公司类型，如果是类型 '2' 则跳转到产品碳足迹核算页面
        const hasRedirected = await checkCompanyTypeAndRedirect(history);
        if (hasRedirected) {
          return;
        }

        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
          history.push(
            `${
              RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccount
            }?code=${encodeURIComponent(code)}`,
          );
        } else {
          history.push(RouteMaps.workIndex);
        }
      }
    });
  };
  // 查询公司列表方法
  const apiCompanyListFn = async () => {
    const storages = getUserInfo();
    if (storages) {
      const data = await apiCompanyList({
        userId: storages.userInfo.userId,
        page: '1',
        size: '10000',
      });
      const companys = data?.data?.rows;
      if (data?.data?.code === 500) {
        VerifyUtils.Toast(500, data.data.msg);
      } else {
        setList({
          ...list,
          companys,
        });

        /** 为了控制是否通过供应链跳转过来的，从而根据缓存id来建立供应关系 @author wangjiahui */
        if (data?.data?.rows?.some(r => r.status === 0) && isInviteIdInfo) {
          /** 供应链邀请人id @author wangjiahui */
          const supplyId = isInviteIdInfo;
          return history.push(
            `${RouteMaps.inviteLink}?${InviteSearch.COMID}=${supplyId}`,
          );
        }
        if (isInviteIdInfo) {
          /**  供应链判断 当组织有禁用时 跳转创建组织 @author wangjiahui */
          return history.push(RouteMaps.newOrganization);
        }
        if (
          // data?.data?.rows?.length === 1 &&
          !sessionStorage.getItem('url') &&
          data.data.rows[0]?.status === 0 &&
          data.data.rows[0]?.ucStatus !== 1
        ) {
          await inIndex(String(data?.data?.rows?.[0]?.companyId));
        }
      }
      return companys;
    }
    logout();
    VerifyUtils.Toast(500, I18N.system.pleaseLogInFirst);
    return undefined;
  };

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // setload(false);
    setLoading(true);
    apiCompanyListFn().finally(() => {
      setLoading(false);
    });
  }, []);

  const switchCompany = async (companyId: string) => {
    const result = await switchoverCompany({
      userId: getUserInfo()?.userInfo.userId || '',
      companyId,
    });
    localStorage.setItem(
      SET_COMPANY_USER_INFO,
      JSON.stringify(result.data.data),
    );
    localStorage.setItem(
      COMPANY_ID,
      result.data.data.userInfo.companyId?.toString() || '',
    );
    Toast('success', I18N.system.switchSuccessful);
    setTimeout(() => {
      history.push(RouteMaps.workIndex);
      window.location.reload();
    }, 100);
  };

  if (loading) {
    return <EmptyLoading />;
  }
  return (
    <div className={Style.organizations}>
      <Spin spinning={false}>
        <div className={styles.drawerWrapper}>
          {list.companys.map((i, index) => (
            <div
              className={styles.drawerItem}
              key={i.companyId}
              onClick={() => switchCompany(i.companyId.toString())}
            >
              <div className={styles.companyName}>
                <div
                  className={
                    index === 0
                      ? styles.shortCompanyName
                      : styles.innerCompanyName
                  }
                >
                  {i.companyName}
                </div>
                {index === 0 && (
                  <div className={styles.lastTime}>{I18N.system.lastLogin}</div>
                )}
              </div>
              <div className={styles.companyNum}>{i.companyNum}</div>
              <ProductPopover
                placement='rightTop'
                visible={i.status === 1 ? false : undefined}
                productList={i.companyProductList}
                tipText={
                  i.productType === PRODUCT_TYPE.EXPIRED
                    ? I18N.components.theServiceYouHaveOpened
                    : ''
                }
              >
                <div
                  className={classNames(styles.companyTag, {
                    [styles.activatedTag]:
                      i.productType === PRODUCT_TYPE.ACTIVATED,
                    [styles.trialTag]: i.productType === PRODUCT_TYPE.TRIAL,
                    [styles.expiredTag]: i.productType === PRODUCT_TYPE.EXPIRED,
                    [styles.disabledTag]: i.status === 1,
                  })}
                >
                  {i.status === 1 || i.ucStatus === 1 ? (
                    I18N.system.disabled
                  ) : (
                    <>
                      {PRODUCT_TYPE_LABEL()[i.productType]}
                      {i.productType === PRODUCT_TYPE.ACTIVATED &&
                        I18N.template(I18N.system.itemo, {
                          val1: i.openProductCount,
                        })}
                      {i.productType === PRODUCT_TYPE.TRIAL &&
                        I18N.template(I18N.system.remainingIte, {
                          val1: i.residueDay,
                        })}
                    </>
                  )}
                </div>
              </ProductPopover>
            </div>
          ))}
          {/* <div
              className={styles.enterpriseFooter}
              onClick={() => setCreateTrialOrgOpen(true)}
            >
              <div className={classNames(styles.drawerItem, styles.add)}>
                <IconAlibabaNew type='icon-icon-tianjia-new' />
                <div>{I18N.components.newEnterprise}</div>
              </div>
            </div> */}
        </div>
      </Spin>
    </div>
  );
};

export default Organizations;
