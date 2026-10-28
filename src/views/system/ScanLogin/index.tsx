import useUrlState from '@ahooksjs/use-url-state';
import { LocaleContext } from '@src/components/LocaleProvider';
import { LocaleType } from '@src/lang/I18N';
import { useMount } from 'ahooks';
import { FC, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { useGlobalLoginModal } from '@/components/GlobalLoginModal';
import { RouteMaps } from '@/router/route-paths';
import { RootState } from '@/store';
import { sleep } from '@/utils';
import { getToken } from '@/utils/cookie';
import { AI_IMPORT_TYPE } from '@/views/enterpriseCarbonAccount2/AiImport/constant';

import { ENTERPRISE_USER_STATUS } from './constant';
import styles from './index.module.less';
import {
  createLightEnterpriseAccount,
  getEnterpriseUserStatus,
  createLightEnterpriseAiModel,
  createLightEnterpriseTravelAiModel,
} from './service';
import { ProductSource } from '../login/component/Login';

const ScanLogin: FC = () => {
  const { openLoginModal } = useGlobalLoginModal();
  const { changeLocale, locale } = useContext(LocaleContext);

  const [{ entryPoint, AIModelType, key }] = useUrlState({
    entryPoint: 'enterprise',
    AIModelType: AI_IMPORT_TYPE.COMMON,
    key: '',
  });

  const history = useHistory();

  const companyUserInfo = useSelector(
    (state: RootState) => state.companyUserInfo,
  );
  const { userInfo } = companyUserInfo;

  const onEnterpriseLoginSuccess = async () => {
    const userStatusResp = await getEnterpriseUserStatus();
    const { userStatus, beModeling } = userStatusResp.data.data;

    if (userStatus === ENTERPRISE_USER_STATUS.SAAS_USER) {
      // saas用户
      history.push(RouteMaps.workIndex);
      return;
    }

    if (userStatus === ENTERPRISE_USER_STATUS.LIGHT_TRIAL_EXPIRED_USER) {
      // 轻量版用户过期
      history.push(RouteMaps.enterpriseCarbonAccountingcarbonDischarge);
      return;
    }

    if (
      userStatus === ENTERPRISE_USER_STATUS.LIGHT_USER ||
      userStatus === ENTERPRISE_USER_STATUS.LIGHT_TRIAL_USER
    ) {
      // 轻量版用户

      if (!beModeling) {
        history.push(RouteMaps.enterpriseCarbonAccountingcarbonDischarge);
        return;
      }

      // 可进行建模操作
      const createAccountResp = await createLightEnterpriseAccount();

      const {
        computationId,
        orgId,
        orgName,
        period: periodName,
      } = createAccountResp.data.data || {};

      const computationPeriod = '1';

      const modelingApi =
        AIModelType === AI_IMPORT_TYPE.TRAVEL
          ? createLightEnterpriseTravelAiModel
          : createLightEnterpriseAiModel;

      modelingApi({
        computationId,
        computationPeriod,
        key,
      });

      await sleep(1000);

      history.push({
        pathname: RouteMaps.enterpriseCarbonAccountingAccounting,
        search: `?AIModelType=${AIModelType}&computationId=${computationId}&computationPeriod=${computationPeriod}&orgId=${orgId}&orgName=${orgName}&periodName=${periodName}&step=1`,
      });

      return;
    }

    if (userStatus === ENTERPRISE_USER_STATUS.NO_PERMISSION_USER) {
      history.push(RouteMaps.enterpriseCarbonAccountingcarbonDischarge);
    }
  };

  // 根据 URL 参数切换语言（未登录时）
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');

    // 如果 URL 中有 lang 参数且用户未登录，则切换语言
    if (langParam && !getToken()) {
      const langMap: Record<string, LocaleType> = {
        zh: LocaleType.zhCN,
        en: LocaleType.enUS,
        'zh-CN': LocaleType.zhCN,
        'en-US': LocaleType.enUS,
      };

      const targetLocale = langMap[langParam.toLowerCase()];
      // 只有当目标语言与当前语言不同时才切换
      if (targetLocale && targetLocale !== locale) {
        changeLocale({
          currentLocale: targetLocale,
          onlyFeSwitch: true, // 未登录时只切换前端语言
        });
      }
    }
  }, [changeLocale, locale]);

  useMount(() => {
    const onLoginSuccess = () => {
      switch (entryPoint) {
        case 'enterprise':
          onEnterpriseLoginSuccess();
          break;
        default:
          break;
      }
    };

    if (userInfo?.token) {
      onLoginSuccess();
    } else {
      openLoginModal({
        mask: false,
        maskClosable: false,
        closable: false,
        keyboard: false,
        productSource: ProductSource.enterprise,
        onSuccess: onLoginSuccess,
      });
    }
  });

  return <div className={styles.scanLogin} />;
};

export default ScanLogin;
