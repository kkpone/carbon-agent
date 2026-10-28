import qrCodeImg from '@assets/svg/service_qr_code.png';
import I18N, { LocaleType } from '@src/lang/I18N';
import { ConfigProvider, theme, Tooltip } from 'antd';
import classNames from 'classnames';
import { FC, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';

import { getMessages, logout_send } from '@/api/api';
import { ECompanyType, SwitchoverCompanyData } from '@/api/types';
import { CustomDrawer } from '@/components/CustomDrawer';
import { FeedBackModal } from '@/components/Factor/FeedBackModal';
import { FeedBackType } from '@/components/Factor/utils';
import { LocaleContext } from '@/components/LocaleProvider';
import { languageMap } from '@/components/SelectLanguage';
import { IconAlibabaNew } from '@/components/iconfont';
import { withCurrentLocalePrefix } from '@/router/localePath';
import { RouteMaps } from '@/router/route-paths';
import store, { RootState } from '@/store';
import { CLEAR } from '@/store/actionTypes';
import { clearSideBarRoutes } from '@/store/module/app';
import { getUserInfo } from '@/utils';
import { getToken } from '@/utils/cookie';
import { isInviteLogin } from '@/views/becomeSupplierOrPurchasing/utils/commonActions';
import { UserInfo } from '@/views/system/account/component/UserInfo';

import { SwitchEnterprise } from './components/SwitchEnterprise';
import styles from './index.module.less';

interface IUserInfoCardProps {
  collapsed?: boolean;
}

const { useToken } = theme;

// const products = [
//   {
//     title: '产品碳足迹',
//     period: '2024.10.20-2024.10.28',
//   },
//   {
//     title: '产品碳足迹',
//     period: '2024.10.20-2024.10.28',
//   },
//   {
//     title: '产品碳足迹',
//     period: '2024.10.20-2024.10.28',
//   },
//   {
//     title: '产品碳足迹',
//     period: '2024.10.20-2024.10.28',
//   },
//   {
//     title: '产品碳足迹',
//     period: '2024.10.20-2024.10.28',
//   },
//   {
//     title: '产品碳足迹',
//     period: '2024.10.20-2024.10.28',
//   },
//   {
//     title: '产品碳足迹',
//     period: '2024.10.20-2024.10.28',
//   },
// ];

const Products: FC<{
  productItems?: SwitchoverCompanyData['userInfo']['companyProductList'];
}> = props => (
  <div className={styles.ProductsWrapper}>
    <div className={styles.productTitle}>{I18N.components.versionDetails}</div>
    <div className={styles.productItems}>
      {props.productItems?.map(product => (
        <div className={styles.productItem}>
          <div className={styles.productItemTitle}>{product.productName}</div>
          <div className={styles.productItemSubtitle}>
            {product.createTime}-{product.expireTime}
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * @description 判断推出登录
 */
const logout = (option?: { jumpToLoginPage?: boolean }) => {
  logout_send();
  localStorage.clear();
  sessionStorage.clear();
  store.dispatch(clearSideBarRoutes());
  store.dispatch({ type: CLEAR });

  const jumpToLoginPage = option?.jumpToLoginPage ?? true;

  if (!jumpToLoginPage) {
    return;
  }
  /** 用来判断是否是从供应链跳转过来的 @author wangjiahui */
  isInviteLogin();

  window.location.href = withCurrentLocalePrefix(RouteMaps.login);
};

const InfoToolTip = (props: { setShowSettingDrawer: () => void }) => {
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const storages = getUserInfo();

  const { token } = useToken();

  const isLiteCompany =
    getUserInfo()?.userInfo?.companyType === ECompanyType.lite;

  const isPersonalCompany = getUserInfo()?.userInfo?.companyType === '2';

  const history = useHistory();

  const { changeLocale, locale } = useContext(LocaleContext);
  return (
    <div className={styles.infoToolTip}>
      <div className={styles.header}>
        <IconAlibabaNew type='icon-icon-morentouxiang' />
        <div>
          <div className={styles.name}>
            {storages?.userInfo?.user?.nickName || storages?.userInfo?.username}
          </div>
          <div className={styles.companyName}>
            {storages?.userInfo?.companyName}
          </div>
        </div>
      </div>
      <div className={styles.items}>
        {!isPersonalCompany && (
          <Tooltip
            trigger={['click']}
            title={
              <Products productItems={storages?.userInfo?.companyProductList} />
            }
            color={token.Menu?.itemBg}
            overlayInnerStyle={{ padding: '8px 0' }}
            arrow={false}
            placement='right'
          >
            <div className={styles.item}>
              {I18N.components.productSubscription}
              {storages?.userInfo?.companyProductList?.length ? (
                <div className={styles.productNum}>
                  {I18N.system.opened}{' '}
                  {storages?.userInfo.companyProductList?.length}
                </div>
              ) : null}
            </div>
          </Tooltip>
        )}
        {!isLiteCompany && (
          <Tooltip
            title={<SwitchEnterprise storages={storages} />}
            trigger={['click']}
            color={token.Menu?.itemBg}
            overlayInnerStyle={{ padding: '4px 0' }}
            arrow={false}
            placement='right'
          >
            <div className={styles.item}>
              {I18N.components.switchingEnterprises}
            </div>
          </Tooltip>
        )}
        <Tooltip
          trigger={['click']}
          overlayInnerStyle={{ padding: '4px 0' }}
          title={
            <div className={styles.languageWrapper}>
              {languageMap.map(item => (
                <div
                  key={item.value}
                  className={classNames(styles.languageItem, {
                    [styles.active]: item.value === locale,
                  })}
                  onClick={() =>
                    changeLocale({
                      currentLocale: item.value,
                      syncUrl: true,
                    })
                  }
                >
                  {item.text}
                </div>
              ))}
            </div>
          }
          color={token.Menu?.itemBg}
          arrow={false}
          placement='right'
        >
          <div className={styles.item}>{I18N.components.switchLanguage}</div>
        </Tooltip>
        {isPersonalCompany && (
          <div
            className={styles.item}
            onClick={() => history.push(RouteMaps.homeProductOrderRecord)}
          >
            {I18N.system.orderRecords}
          </div>
        )}
        {isPersonalCompany && (
          <div
            className={styles.item}
            onClick={() => history.push(RouteMaps.homeInvoiceManagement)}
          >
            {I18N.system.controlOverInvoices}
          </div>
        )}
        <div
          className={styles.item}
          onClick={() => history.push(RouteMaps.homeOpenPlatform)}
        >
          {I18N.components.openPlatform}
        </div>
        <div
          className={styles.item}
          onClick={() => props.setShowSettingDrawer()}
        >
          {I18N.workbench.setUp}
        </div>
        <Tooltip
          trigger={['click']}
          title={
            <div className={styles.contact}>
              <div>{I18N.carbonFootprint3.contactExclusiveCustomers}</div>
              <img src={qrCodeImg} style={{ width: '140px' }} alt='' />
            </div>
          }
          color={token.Menu?.itemBg}
          arrow={false}
          placement='rightTop'
        >
          <div className={styles.item}>
            {I18N.components.consultCustomerService}
          </div>
        </Tooltip>
        <div className={styles.item} onClick={() => setFeedbackVisible(true)}>
          {I18N.components.feedback}
        </div>
        <FeedBackModal
          visible={feedbackVisible}
          showProductList
          type={FeedBackType.other}
          onCancel={() => {
            setFeedbackVisible(false);
          }}
          onOk={() => {
            setFeedbackVisible(false);
          }}
        />
      </div>
      <div className={styles.footer} onClick={() => logout()}>
        {I18N.components.logOutAndLogIn}
      </div>
    </div>
  );
};

export const UserInfoCard: FC<IUserInfoCardProps> = ({ collapsed }) => {
  const [showSettingDrawer, setShowSettingDrawer] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const { token } = useToken();
  const { locale } = useContext(LocaleContext);
  const userInfo = useSelector<
    RootState,
    RootState['companyUserInfo']['userInfo']
  >(s => s.companyUserInfo.userInfo);

  const isPersonalCompany = getUserInfo()?.userInfo?.companyType === '2';

  useEffect(() => {
    if (isPersonalCompany || !getToken()) return;
    getMessages({ pageNum: 1, pageSize: 10, readStatus: '0' })
      .then(res => {
        const total = res?.data?.data?.total ?? 0;
        setHasUnreadMessages(total > 0);
      })
      .catch(() => {});
  }, [isPersonalCompany]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgSpotlight: '#002A23',
        },
      }}
    >
      <div
        className={classNames(styles.wrapper, {
          [styles.collapsedWrapper]: collapsed,
        })}
      >
        {!isPersonalCompany && (
          <a
            className={styles.item}
            href={
              locale === LocaleType.enUS
                ? 'https://carbonstop.feishu.cn/docx/D2xGdY1NXocIVix4kkEclYZ0nqp'
                : 'https://carbonstop.feishu.cn/wiki/wikcny2F7yEJN35P0Z7SbwPzs7c'
            }
            target='_blank'
            rel='noreferrer'
          >
            <IconAlibabaNew type='icon-icon-bangzhu-saas' />
            {I18N.components.help}
          </a>
        )}
        {!isPersonalCompany && (
          <Link
            className={classNames(styles.item, {
              [styles.active]: location.pathname === RouteMaps.broadcast,
            })}
            to={RouteMaps.broadcast}
          >
            <IconAlibabaNew
              className={styles.icon}
              type='icon-icon-tongzhi-saas'
            />
            <span className={styles.noticeTextWrapper}>
              {I18N.system.notice}
              {hasUnreadMessages && <span className={styles.noticeBadge} />}
            </span>
          </Link>
        )}
        <Tooltip
          title={
            <InfoToolTip
              setShowSettingDrawer={() => setShowSettingDrawer(true)}
            />
          }
          trigger={['click']}
          color={token.Menu?.itemBg}
          overlayInnerStyle={{ padding: 0 }}
          arrow={false}
          placement='rightTop'
        >
          <div className={styles.item}>
            <IconAlibabaNew type='icon-icon-morentouxiang' />
            <div className={styles.nickName}>{userInfo?.user?.nickName}</div>
          </div>
        </Tooltip>
        <CustomDrawer
          maskClosable={false}
          width={560}
          open={showSettingDrawer}
          title={I18N.workbench.setUp}
          onClose={() => setShowSettingDrawer(false)}
        >
          <UserInfo onCancel={() => setShowSettingDrawer(false)} />
        </CustomDrawer>
      </div>
    </ConfigProvider>
  );
};
