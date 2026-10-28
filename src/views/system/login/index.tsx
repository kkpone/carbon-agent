/**
 * @file 登录页
 */
import { LocaleContext } from '@src/components/LocaleProvider';
import { SUPPLY_LOGIN_IDENTIFIER } from '@src/config';
import { RouteMaps } from '@src/router/route-paths';
import { RootState } from '@src/store';
import { getToken } from '@src/utils/cookie';
import { checkCompanyTypeAndRedirect, logout } from '@utils/index';
import { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import I18N from 'src/lang/I18N';

import { LoginPageHeader } from './component/Header';
import { CompanyType } from './component/Login';
import LoginWrapper from './component/LoginWrapper';
import style from './index.module.less';
import { submitObj } from '../../notOrder/pageInfo';

const Login = () => {
  const { locale } = useContext(LocaleContext);

  const [companyType, setCompanyType] = useState<CompanyType>(
    CompanyType.company,
  );

  // 强制刷新一下登录组件
  const [ScreenKey, setScreenKey] = useState(new Date().getTime());
  useEffect(() => {
    setScreenKey(pre => pre + 1);
  }, [locale]);

  const history = useHistory();
  const companyUserInfo = useSelector<RootState, RootState['companyUserInfo']>(
    s => s.companyUserInfo,
  );

  const checkCompanyType = async () => {
    const hasRedirected = await checkCompanyTypeAndRedirect(history);
    if (hasRedirected) {
      return;
    }
    history.replace(RouteMaps.workIndex);
  };

  useEffect(() => {
    const supplyTicket = new URLSearchParams(location.search).get(
      SUPPLY_LOGIN_IDENTIFIER,
    );

    const companyTypeFromUrl = new URLSearchParams(location.search).get(
      'companyType',
    );
    if (companyTypeFromUrl) {
      setCompanyType(companyTypeFromUrl as CompanyType);
    }

    // 如果已经登录过，直接跳转控制台
    if (companyUserInfo.access_token && getToken()) {
      if (supplyTicket) {
        // 是从供应商邀请邮件进入的碳云系统
        // 清除原先的登录信息
        logout({ jumpToLoginPage: false });
      } else {
        checkCompanyType();
        return;
      }
    }
    let localSubmitObj: any = localStorage.getItem('submitObj');
    if (!localSubmitObj) {
      localStorage.setItem('submitObj', JSON.stringify(submitObj));
    } else {
      localSubmitObj = JSON.parse(localSubmitObj);
    }
  }, []);

  return (
    <div className={style.loginWrapper}>
      <div className={style.articleMedia}>
        <video
          className={style.video}
          src={`${process.env.REACT_APP_API_URL_OSS}/saas-mp4/login/2024-0.mp4`}
          autoPlay
          muted
          loop
        />
        <div className={style.hover} />
      </div>
      <div className={style.main}>
        <LoginPageHeader />
        <div className={style.content}>
          <LoginWrapper
            key={ScreenKey}
            companyType={companyType}
            isLoginPage
            showWechatLogin
          />
        </div>
        <div className={style.footer}>
          <div className={style.text}>
            © 2011-{new Date().getFullYear()}{' '}
            {I18N.system.carbonFootprintInBeijing}
          </div>
          <a
            className={style.text}
            href='https://beian.miit.gov.cn/'
            rel='noopener noreferrer'
            target='_blank'
          >
            {I18N.system.beijingIcpPreparation}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
