import I18N from '@src/lang/I18N';
import { useMount } from 'ahooks';
import { Modal, Spin } from 'antd';
import classNames from 'classnames';
import { omit } from 'lodash-es';
import { FC, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { switchoverCompany } from '@/api/api';
import { Companys, SwitchoverCompanyData } from '@/api/types';
import { CustomDrawer } from '@/components/CustomDrawer';
import ProductPopover from '@/components/ProductPopover';
import { IconAlibabaNew } from '@/components/iconfont';
import { RouteMaps } from '@/router/route-paths';
import store from '@/store';
import { SET_COMPANY_USER_INFO } from '@/store/actionTypes';
import { getUserInfo } from '@/utils';
import { Toast } from '@/utils/Toast';
import { COMPANY_ID } from '@/utils/consts';
import CreateTrialOrg from '@/views/system/account/component/CreateTrialOrg';
import {
  PRODUCT_TYPE,
  PRODUCT_TYPE_LABEL,
} from '@/views/system/account/constant';
import { apiCompanyList } from '@/views/system/account/service';

import styles from './index.module.less';

export const SwitchEnterprise: FC<{
  storages?: SwitchoverCompanyData;
}> = props => {
  const [list, setList] = useState<Companys[]>([]);

  const currentCompanyId = props.storages?.userInfo?.companyId;

  const [loading, setLoading] = useState<boolean>(false);
  const history = useHistory();
  const apiCompanyListFn = async () => {
    const storages = getUserInfo();
    if (storages) {
      setLoading(true);
      const data = await apiCompanyList({
        userId: storages.userInfo.userId,
        page: '1',
        size: '10000',
      }).finally(() => {
        setLoading(false);
      });
      setList(data?.data?.rows);
    }
  };

  const switchCompany = async (companyId: string) => {
    if (getUserInfo()?.userInfo.companyId === Number(companyId)) {
      return;
    }
    const result = await switchoverCompany({
      userId: getUserInfo()?.userInfo.userId || '',
      companyId,
    });
    store.dispatch({
      type: SET_COMPANY_USER_INFO,
      payload: omit(result.data.data, ['productId', 'companyId']),
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
    }, 300);
  };

  useMount(apiCompanyListFn);

  const [open, setOpen] = useState<boolean>(false);

  const [CreateTrialOrgOpen, setCreateTrialOrgOpen] = useState<boolean>(false);

  return (
    <div className={styles.enterpriseWrapper}>
      <div className={styles.enterpriseExpand}>
        <div className={styles.expandIcon} onClick={() => setOpen(true)}>
          <IconAlibabaNew
            type='icon-icon-zhankai-new'
            className={styles.icon}
          />
        </div>
      </div>
      <Spin spinning={false} delay={300}>
        <div className={styles.enterpriseItems}>
          {list.map(i => (
            <div
              className={classNames(styles.enterpriseItem, {
                [styles.active]: i.companyId === currentCompanyId,
              })}
              key={i.companyId}
              onClick={() => switchCompany(i.companyId.toString())}
            >
              <div className={styles.enterpriseItemInner}>{i.companyName}</div>
            </div>
          ))}
        </div>
      </Spin>
      <CustomDrawer
        open={open}
        title={I18N.components.switchingEnterprises}
        width={570}
        styles={{
          mask: {
            pointerEvents: 'none',
          },
          wrapper: {
            pointerEvents: 'none',
          },
        }}
        destroyOnClose
        onClose={() => setOpen(false)}
      >
        <Spin spinning={loading}>
          <div className={styles.drawerWrapper}>
            {list.map((i, index) => (
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
                    <div className={styles.lastTime}>
                      {I18N.system.lastLogin}
                    </div>
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
                      [styles.expiredTag]:
                        i.productType === PRODUCT_TYPE.EXPIRED,
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
            <div
              className={styles.enterpriseFooter}
              onClick={() => setCreateTrialOrgOpen(true)}
            >
              <div className={classNames(styles.drawerItem, styles.add)}>
                <IconAlibabaNew type='icon-icon-tianjia-new' />
                <div>{I18N.components.newEnterprise}</div>
              </div>
            </div>
          </div>
        </Spin>
      </CustomDrawer>
      <div
        className={styles.enterpriseFooter}
        onClick={() => setCreateTrialOrgOpen(true)}
      >
        <IconAlibabaNew className={styles.icon} type='icon-icon-tianjia-new' />
        <div className={styles.btn}>{I18N.components.newEnterprise}</div>
      </div>
      <Modal
        open={CreateTrialOrgOpen}
        width={847}
        destroyOnClose
        centered
        footer={null}
        onCancel={() => setCreateTrialOrgOpen(false)}
        style={{ zIndex: 1999 }}
        styles={{
          mask: {
            pointerEvents: 'none',
          },
          wrapper: {
            pointerEvents: 'none',
          },
        }}
      >
        <CreateTrialOrg simple onCancel={() => setCreateTrialOrgOpen(false)} />
      </Modal>
    </div>
  );
};
