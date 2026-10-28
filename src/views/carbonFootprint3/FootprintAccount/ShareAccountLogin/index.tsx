/**
 * 分享登录页
 */
import useUrlState from '@ahooksjs/use-url-state';
import { ShareBuildModelMainData } from '@src/components/CarbonFootprintAccount/ShareBuildModelMainData';
import I18N, { LocaleType } from '@src/lang/I18N';
import { deCrypt } from '@src/utils';
import { Toast } from '@src/utils/Toast';
import { useMount, useUnmount } from 'ahooks';
import { Button, Input, Modal } from 'antd';
import { omit } from 'lodash-es';
import { useCallback, useContext, useEffect, useState } from 'react';

import './index.less';
import { useSelector } from 'react-redux';

import logoPng from '@/assets/images/logo_white_bg.png';
import EnLogoPng from '@/assets/images/logo_white_bg_en.png';
import { LocaleContext } from '@/components/LocaleProvider';
import { RootState } from '@/store';
import { API_EXTRA_PARAMS_SNAPFLAG } from '@src/components/CarbonFootprintAccount/BuildModelMainData/constant';
import {
  getShareCanEdit,
  getShareEditPermit,
  getShareEditType,
  getShareSupplyAccountId,
  hasShareCanEditField,
  SHARE_UNAUTH_EVENT,
} from '@src/views/carbonFootprint3/shareEditPermission';

import { getShareInfo, postShareSub } from '../service';
import { ShareAccountInfoById } from '../type';

const { ACCOUNT_SHARE_EDIT, SAASSHARE } = API_EXTRA_PARAMS_SNAPFLAG;

type ShareAccountLoginUrlParams = {
  shareId: number;
  productId: number;
  status: number;
  accountId: number;
  stepValue: number;
  listOrGraph: number;
  lang?: LocaleType;
};

const ShareAccountLogin = () => {
  /** 页面存储参数 */
  const [urlState, setUrlState] = useUrlState<Record<string, any>>();
  const [shareUrlParams, setShareUrlParams] =
    useState<ShareAccountLoginUrlParams>();
  const [visible, setVisible] = useState(true);
  const [shareInfo, setShareInfo] = useState<ShareAccountInfoById>();
  const [password, setPassword] = useState<string>();
  const [shareAuth, setShareAuth] = useState<string>();
  const [canEditShare, setCanEditShare] = useState(false);
  const [shareSession, setShareSession] = useState<{
    shareId?: number;
    password?: string;
    editType?: number;
    editPermit?: number;
  }>({});
  const [loading, setLoading] = useState(false);
  const { locale, changeLocale } = useContext(LocaleContext);
  // 链接是否失效
  const [expireUrl, setExpireUrl] = useState(urlState?.expireUrl || false);

  const applySharePermit = (
    permit: {
      code: number;
      data: string;
      canEdit?: number;
      supplyAccountId?: number;
    },
    info: ShareAccountInfoById | undefined,
    baseParams: ShareAccountLoginUrlParams,
    pwd?: string,
  ) => {
    const canEdit = getShareCanEdit({ ...info, ...permit });
    const supplyAccountId =
      getShareSupplyAccountId(permit) ?? getShareSupplyAccountId(info);
    const editType = getShareEditType(info);
    const editable = editType === 1 && canEdit === 1 && !!supplyAccountId;
    const resolvedAccountId =
      editType === 1 && supplyAccountId
        ? supplyAccountId
        : baseParams.accountId;

    setCanEditShare(editable);
    setShareSession({
      shareId: info?.id,
      password: pwd,
      editType,
      editPermit: getShareEditPermit(info),
    });

    const nextParams: Record<string, unknown> = {
      ...baseParams,
      shareAuth: permit.data,
      snapFlag: editType === 1 ? ACCOUNT_SHARE_EDIT : SAASSHARE,
      accountId: resolvedAccountId,
    };

    setUrlState(nextParams);
    setShareAuth(permit.data);
    return nextParams;
  };

  const restoreSharePermitFromAuth = (
    auth: string,
    info: ShareAccountInfoById,
    currentParams: Record<string, any>,
  ) => {
    const isShareEditUrl =
      Number(currentParams.snapFlag) === ACCOUNT_SHARE_EDIT && !!auth;
    const editType = isShareEditUrl ? 1 : getShareEditType(info);
    const canEdit =
      hasShareCanEditField(info) || !isShareEditUrl ? getShareCanEdit(info) : 1;
    const supplyAccountId =
      getShareSupplyAccountId(info) ??
      (isShareEditUrl ? currentParams.accountId : undefined);
    const editable = editType === 1 && canEdit === 1 && !!supplyAccountId;
    const resolvedAccountId =
      editType === 1 && supplyAccountId
        ? supplyAccountId
        : currentParams.accountId;

    setShareAuth(auth);
    setVisible(false);
    setShareSession({
      shareId: info.id,
      editType,
      editPermit: getShareEditPermit(info),
    });
    setCanEditShare(editable);
    setUrlState({
      ...currentParams,
      shareAuth: auth,
      snapFlag: editType === 1 ? ACCOUNT_SHARE_EDIT : SAASSHARE,
      accountId: resolvedAccountId,
    });
  };

  const subShare = async () => {
    if (!shareInfo) return;
    if (shareInfo?.password && !password) {
      Toast('error', I18N.carbonFootprint3.pleaseEnterToView);
      return;
    }
    setLoading(true);
    try {
      const { data } = await postShareSub({ id: shareInfo.id, password });

      if (data.data.code === 3) {
        if (shareUrlParams) {
          applySharePermit(data.data, shareInfo, shareUrlParams, password);
        }
        const localData = localStorage.getItem('shareAuth');
        if (localData) {
          const localDataById: Record<string, string> = JSON.parse(localData);
          localStorage.setItem(
            'shareAuth',
            JSON.stringify({
              ...localDataById,
              [shareInfo.id]: data.data.data,
            }),
          );
        } else {
          localStorage.setItem(
            'shareAuth',
            JSON.stringify({
              [shareInfo.id]: data.data.data,
            }),
          );
        }

        setTimeout(() => {
          setVisible(false);
          setLoading(false);
        }, 1000);
      } else if (data.data.code === 1) {
        setExpireUrl(true);
        setUrlState({
          expireUrl: 1,
        });
      } else {
        Toast('error', data.data.msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useUnmount(() => {
    localStorage.removeItem('shareAuth');
  });

  const userInfos = useSelector<RootState, RootState['companyUserInfo']>(
    state => state.companyUserInfo,
  );

  const clearLocalShareAuth = useCallback((shareId?: number | string) => {
    if (!shareId) return;
    const localData = localStorage.getItem('shareAuth');
    if (!localData) return;
    const localDataById: Record<string, string> = JSON.parse(localData);
    if (localDataById[shareId]) {
      const omitData = omit(localDataById, shareId);
      localStorage.setItem('shareAuth', JSON.stringify(omitData));
    }
  }, []);

  const handleShareUnauth = useCallback(() => {
    setShareAuth(undefined);
    setCanEditShare(false);
    setExpireUrl(1);
    setVisible(true);
    clearLocalShareAuth(urlState?.shareId || shareInfo?.id);
  }, [clearLocalShareAuth, shareInfo?.id, urlState?.shareId]);

  const cacheShareAuth = useCallback(
    (shareId: number | string, auth: string) => {
      const localData = localStorage.getItem('shareAuth');
      if (localData) {
        const localDataById: Record<string, string> = JSON.parse(localData);
        localStorage.setItem(
          'shareAuth',
          JSON.stringify({
            ...localDataById,
            [shareId]: auth,
          }),
        );
        return;
      }
      localStorage.setItem(
        'shareAuth',
        JSON.stringify({
          [shareId]: auth,
        }),
      );
    },
    [],
  );

  const getSharePasswordFromParams = useCallback(
    (params: Record<string, any>) =>
      params.password || params['密码'] || params.sharePassword || password,
    [password],
  );

  useEffect(() => {
    window.addEventListener(SHARE_UNAUTH_EVENT, handleShareUnauth);
    return () => {
      window.removeEventListener(SHARE_UNAUTH_EVENT, handleShareUnauth);
    };
  }, [handleShareUnauth]);

  useMount(async () => {
    const localData = localStorage.getItem('shareAuth');

    // 如果当前链接已失效 不再处理后续逻辑,清楚本地缓存的信息
    if (urlState.expireUrl) {
      setShareAuth(undefined);
      setExpireUrl(1);
      clearLocalShareAuth(urlState?.shareId);
      return;
    }

    // 如果链接上已经有参数，说明已经进入了分享页面
    if (urlState?.shareId) {
      const info = await getShareInfo({ id: urlState.shareId });
      const shareInfoData = info.data.data;
      setShareInfo(shareInfoData);
      const currentShareParams = {
        shareId: urlState?.shareId,
        productId: urlState?.productId,
        status: urlState?.status,
        accountId: urlState?.accountId,
        stepValue: urlState?.stepValue,
        listOrGraph: urlState?.listOrGraph,
      };
      setShareUrlParams(currentShareParams);

      const shareAuthFromUrl =
        typeof urlState.shareAuth === 'string' ? urlState.shareAuth : undefined;
      let shareAuthFromCache: string | undefined;
      if (localData) {
        const localDataById: Record<string, string> = JSON.parse(localData);
        shareAuthFromCache = localDataById[urlState.shareId];
      }
      const resolvedShareAuth = shareAuthFromUrl || shareAuthFromCache;
      if (resolvedShareAuth) {
        if (Number(urlState.snapFlag) === SAASSHARE) {
          const pwd = getSharePasswordFromParams(urlState);
          const permitResp = await postShareSub({
            id: shareInfoData.id,
            password: pwd,
          });
          const permit = permitResp.data.data;
          if (permit.code === 1) {
            handleShareUnauth();
            return;
          }
          if (permit.code === 2) {
            setShareAuth(undefined);
            setCanEditShare(false);
            setVisible(true);
            Toast('error', permit.msg);
            return;
          }
          if (permit.code === 3) {
            applySharePermit(permit, shareInfoData, currentShareParams, pwd);
            cacheShareAuth(shareInfoData.id, permit.data);
            setVisible(false);
          }
        } else {
          restoreSharePermitFromAuth(
            resolvedShareAuth,
            shareInfoData,
            urlState,
          );
        }
      }
      if (
        urlState.lang &&
        locale !== urlState.lang &&
        !userInfos.access_token
      ) {
        changeLocale({
          currentLocale: urlState.lang,
          onlyFeSwitch: true,
        });
      }
      return;
    }

    const rawSearch = window.location.search.slice(1);
    // snapFlag 为 '6' 时参数为明文，不需要解密
    const parsedForSnapFlag = rawSearch.split('&').reduce((acc, part) => {
      const [k, v] = part.split('=');
      if (v !== undefined) {
        acc[k] = isNaN(Number(v)) ? v : Number(v);
      }
      return acc;
    }, {} as Record<string, any>);

    const promcoSnapFlag = ['6', 6, '7', 7];
    const isPlainTextParams = promcoSnapFlag.includes(
      parsedForSnapFlag.snapFlag,
    );
    if (isPlainTextParams) {
      setShareAuth(parsedForSnapFlag.shareAuth);
      setVisible(false);
      changeLocale({
        currentLocale: parsedForSnapFlag.lang || LocaleType.zhCN,
        onlyFeSwitch: true,
      });
      return;
    }
    const locationHref = isPlainTextParams ? rawSearch : deCrypt(rawSearch);
    const hrefSearch = locationHref.split('&');
    const defaultParams: ShareAccountLoginUrlParams = {
      shareId: 0,
      productId: 0,
      status: 0,
      accountId: 0,
      stepValue: 0,
      listOrGraph: 0,
    };
    hrefSearch.forEach(search => {
      const searchArr = search.split('=');
      const obj: Record<string, any> = {
        [searchArr[0]]: isNaN(Number(searchArr[1]))
          ? searchArr[1]
          : Number(searchArr[1]),
      };
      Object.assign(defaultParams, obj);
    });
    setShareUrlParams({ ...defaultParams, stepValue: 1 });
    if (
      defaultParams.lang &&
      locale !== defaultParams.lang &&
      !userInfos.access_token
    ) {
      changeLocale({
        currentLocale: defaultParams.lang,
        onlyFeSwitch: true,
      });
    }

    const info = await getShareInfo({ id: defaultParams.shareId });
    setShareInfo(info.data.data);

    if (localData) {
      const localDataById: Record<string, string> = JSON.parse(localData);
      // 如果缓存中找到了之前登陆过返回的Id
      if (localDataById[defaultParams.shareId]) {
        // setShareAuth(localDataById[defaultParams.shareId]);
      }
    }
  });

  useEffect(() => {
    if (urlState.expireUrl) {
      // 如果当前链接已失效 不再处理后续逻辑,清楚本地缓存的信息
      if (urlState.expireUrl) {
        setShareAuth(undefined);
        setExpireUrl(1);
        clearLocalShareAuth(urlState?.shareId);
      }
    }
  }, [clearLocalShareAuth, urlState]);

  return (
    <div>
      <Modal
        destroyOnClose
        open={visible}
        rootClassName='FoorprintAccountingAddShareModal'
        width='100%'
        title={undefined}
        footer={null}
        closable={false}
        transitionName=''
        style={{
          top: 0,
          maxWidth: '100%',
          padding: 0,
        }}
        styles={{
          body: {
            width: '100%',
            height: '100vh',
          },
          content: {
            padding: 0,
          },
          wrapper: {
            height: '100vh',
          },
        }}
      >
        <div className='accountShareMain'>
          <div className='shareLogo'>
            <img
              src={locale === LocaleType.enUS ? EnLogoPng : logoPng}
              alt='logo'
            />
          </div>
          <div className='shareLeft'>
            {expireUrl ? (
              <div className='shareLoginExpire'>
                <div className='expireMain'>
                  <img
                    src='https://carbonstop-saas.oss-cn-beijing.aliyuncs.com/carbonFootprint/shareExpire.png'
                    alt={I18N.carbonFootprint3.invalid}
                  />
                </div>
                <div className='expireMainText'>
                  {I18N.carbonFootprint3.shareLinkAlready}
                </div>
              </div>
            ) : (
              <div className='shareLoginMain'>
                <div className='avatar'>
                  <img
                    src='https://carbonstop-saas.oss-cn-beijing.aliyuncs.com/carbonFootprint/shareAvatar.png'
                    alt={I18N.carbonFootprint3.avatar}
                  />
                </div>
                <div className='avatarName'>
                  {shareInfo?.updateByName ||
                    I18N.carbonFootprint3.carbonCloudUsers}
                </div>
                <div className='avatarDesc'>
                  {I18N.carbonFootprint3.iSharedItWithYou}
                </div>
                {shareInfo?.password && (
                  <div className='passwordMain'>
                    <Input.Password
                      size='large'
                      placeholder={I18N.carbonFootprint3.pleaseEnterToView}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onPressEnter={subShare}
                    />
                  </div>
                )}

                <div>
                  <Button
                    type='primary'
                    className='shareButton'
                    loading={loading}
                    onClick={subShare}
                  >
                    {I18N.carbonFootprint3.viewCarbonFootprint2}
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className='shareRight' />
        </div>
      </Modal>
      {shareAuth && (
        <ShareBuildModelMainData
          apiExtraParams={{
            shareAuth,
            snapFlag:
              urlState?.snapFlag != null
                ? Number(urlState.snapFlag)
                : getShareEditType(shareInfo) === 1
                ? ACCOUNT_SHARE_EDIT
                : SAASSHARE,
            lang: locale === LocaleType.enUS ? 'en' : 'zh',
          }}
          initialCanEdit={canEditShare}
          shareSession={shareSession}
          expireTime={
            shareInfo?.expireValue === -1 ? undefined : shareInfo?.expireTime
          }
        />
      )}
    </div>
  );
};

export default ShareAccountLogin;
