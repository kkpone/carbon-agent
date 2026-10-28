/**
 * @file  组织管理
 */
import { RootState } from '@src/store';
import { useCheckHomeRouterChange } from '@src/utils';
import { FC, useState } from 'react';
import { useSelector } from 'react-redux';

import CreateTrialOrg from './component/CreateTrialOrg';
import ManOrganization from './component/ManOrganization';
import Style from './style.module.less';

const Accounts: FC = () => {
  useCheckHomeRouterChange();
  const [showout, setShowout] = useState<boolean>(false);

  const user = useSelector<RootState, RootState['companyUserInfo']>(
    s => s.companyUserInfo,
  );

  const hasCodeParam =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('code');

  const hasChannelParam =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('channel');

  return (
    <div className={Style.Organization} onClick={() => setShowout(!showout)}>
      {!!user.access_token &&
        !user.haveCompany &&
        !hasCodeParam &&
        !hasChannelParam && (
          <div className={Style.createTrialOrgContent}>
            <CreateTrialOrg />
          </div>
        )}
      {/* <div className={Style.organizationHeader}>
        <div className={Style.organizationHeaderContent}>
          <div className={Style.headerTitle}>
            {I18N.system.pleaseSelectACompany}
          </div>
        </div>
      </div> */}
      <div className={Style.organizationContent}>
        <main className={Style.main}>
          {/* <div className={Style.user}>
            <div className={Style.userInfo}>
              <img className={Style.avatar} src={avatarIcon} alt='' />
              <div>
                <div
                  className={Style.userNickName}
                  title={
                    user?.userInfo?.user?.nickName ||
                    I18N.system.carbonCloudAccount
                  }
                >
                  {user?.userInfo?.user?.nickName ||
                    I18N.system.carbonCloudAccount}
                </div>
                <div className={Style.userName}>{user?.userInfo?.username}</div>
              </div>
            </div>
            <div className={Style.userSetting}>
              <div
                className={Style.userSettingItem}
                onClick={() => history.push(RouteMaps.accountSettions)}
              >
                <IconAlibaba
                  className={Style.userSettingIcon}
                  type='icon-icon_account'
                />
                <span className={Style.userSettingText}>
                  {I18N.components.accountManagement}
                </span>
              </div>
              <div className={Style.userSettingSplit} />
              <div
                className={classNames(
                  Style.userSettingItem,
                  Style.userLogoutItem,
                )}
                onClick={() => logout()}
              >
                <IconAlibaba
                  className={Style.userSettingIcon}
                  type='icon-icon_signout'
                />
                <span className={Style.userSettingText}>
                  {I18N.components.logOutAndLogIn}
                </span>
              </div>
            </div>
          </div> */}

          <section className={Style.organizations}>
            <ManOrganization />
          </section>
        </main>
      </div>
    </div>
  );
};

export default Accounts;
