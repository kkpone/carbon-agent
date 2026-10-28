/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-06-30 18:12:04
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-04-13 16:08:20
 */
/**
 * @file 顶部导航头像 通知 反馈 使用说明区域
 */
import { noticeReaded } from '@api/api';
import avatarIcon from '@assets/svg/icon_avatar.svg';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import {
  getMessageAndNoticeData,
  getNoticesAndMessagesCount,
} from '@src/store/notices-and-messages/actions';
import { logout } from '@src/utils';
import { Broadcast } from '@src/views/system/Broadcast';
import BroadcastDetail from '@src/views/system/Broadcast/list/show';
import {
  PRODUCT_TYPE,
  PRODUCT_TYPE_LABEL,
} from '@src/views/system/account/constant';
import { BroadcastTabType } from '@src/views/system/utils/type';
import { RootDispatch, RootState } from '@store/index';
import { useRequest } from 'ahooks';
import { Badge, Button, Dropdown, Tooltip } from 'antd';
import classNames from 'classnames';
import { isNil } from 'lodash-es';
import { memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import './MenuItem.scss';

import NavDropdown from './NavDropdown';
import style from './index.module.less';
import {
  getCompanyProductInfo,
  getShowLanguageSwitch,
  SwitchState,
} from './service';
import { FeedBackModal } from '../Factor/FeedBackModal';
import { FeedBackType } from '../Factor/utils';
import ProductPopover from '../ProductPopover';
import { SelectLanguage } from '../SelectLanguage';
import { ModalBase } from '../UI/Modal';
import IconFont, { IconAlibaba } from '../iconfont';

interface AvatarDropdownProps {
  className: string;
  showActions?: boolean;
}

const AvatarDropdown = ({ className, showActions }: AvatarDropdownProps) => {
  const dispatch = useDispatch<RootDispatch>();
  const messageAndNotice = useSelector<
    RootState,
    RootState['messageAndNotices']
  >(s => s.messageAndNotices);
  const { modalNotices } = messageAndNotice;
  const user = useSelector<RootState, RootState['companyUserInfo']>(
    s => s.companyUserInfo,
  );
  const companyId = user?.userInfo?.companyId;
  useEffect(() => {
    if (companyId && showActions) getMessageAndNoticeData();
  }, [companyId, showActions]);

  const userInfos = useSelector<RootState, RootState['companyUserInfo']>(
    state => state.companyUserInfo,
  );

  const history = useHistory();

  const [companyProductInfo, setCompanyProductInfo] =
    useState<
      Pick<
        RootState['companyUserInfo']['userInfo'],
        'productType' | 'companyProductList' | 'openProductCount' | 'residueDay'
      >
    >();

  const onAvatarDropdownVisible = (visible: boolean) => {
    if (visible) {
      getCompanyProductInfo().then(({ data }) => {
        setCompanyProductInfo(data.data);
      });
    }
  };
  function renderManageUser() {
    const { companyName = '', username = '' } = userInfos?.userInfo || {};

    const {
      companyProductList = [],
      productType,
      residueDay,
      openProductCount,
    } = companyProductInfo || {};

    const nickName = userInfos?.userInfo?.user?.nickName;
    return (
      <div className={style.avatarDropdown}>
        <ProductPopover
          placement='leftTop'
          productList={companyProductList}
          tipText={
            productType === PRODUCT_TYPE.EXPIRED
              ? I18N.components.theServiceYouHaveOpened
              : ''
          }
        >
          <div
            className={classNames(style.companyTag, {
              [style.activatedTag]: productType === PRODUCT_TYPE.ACTIVATED,
              [style.trialTag]: productType === PRODUCT_TYPE.TRIAL,
              [style.expiredTag]: productType === PRODUCT_TYPE.EXPIRED,
            })}
          >
            {!isNil(productType) && PRODUCT_TYPE_LABEL()[productType]}
            {productType === PRODUCT_TYPE.ACTIVATED &&
              I18N.template(I18N.components.openP, { val1: openProductCount })}
            {productType === PRODUCT_TYPE.TRIAL &&
              I18N.template(I18N.components.remainingRes, { val1: residueDay })}
          </div>
        </ProductPopover>
        <div className={style.avatarCompanyName}>{companyName}</div>
        <div className={style.avatarUser}>
          <img className={style.avatarUserIcon} alt='' src={avatarIcon} />
          <div className={style.avatarUserContent}>
            <div className={style.avatarUserNickname}>{nickName}</div>
            <div className={style.avatarUsername}>{username}</div>
          </div>
        </div>
        <div
          className={style.avatarBtn}
          onClick={() => {
            sessionStorage.setItem('url', window.location.pathname);
            history.push(RouteMaps.account);
          }}
        >
          <IconAlibaba
            className={style.avatarBtnIcon}
            type='icon-icon_cutover'
          />
          <span>{I18N.components.switchingEnterprises}</span>
        </div>
        <div
          className={style.avatarBtn}
          onClick={() => {
            history.push(RouteMaps.accountSettions);
          }}
        >
          <IconAlibaba
            className={style.avatarBtnIcon}
            type='icon-icon_account'
          />
          <span>{I18N.components.accountManagement}</span>
        </div>
        <div className={style.avatarSplit} />
        <div
          className={classNames(style.avatarBtn, style.avatarLogoutBtn)}
          onClick={() => logout()}
        >
          <IconAlibaba
            className={style.avatarBtnIcon}
            type='icon-icon_signout'
          />
          <span>{I18N.components.logOutAndLogIn}</span>
        </div>
      </div>
    );
  }

  const [feedbackVisiable, setFeedbackVisiable] = useState(false);

  const { data } = useRequest(() => getShowLanguageSwitch(), {
    cacheKey: 'multi_switchCompany',
    staleTime: 1000 * 60 * 3,
    refreshOnWindowFocus: false,
    ready: !!companyId,
  });

  const showSwitch = data?.data?.data?.multi_switchCompany === SwitchState.show;

  return (
    <div className={style.avatarWrapper}>
      {showActions && (
        <>
          {showSwitch && <SelectLanguage />}
          {/* 帮助文档尚未开发 */}
          <Tooltip overlay={I18N.components.helpCenter}>
            <div className={style.toolsIcon}>
              <IconFont
                type='icon-icon-bangchuzhongxin'
                aria-label='bangchuzhongxin'
                onClick={() =>
                  window.open(
                    process.env.REACT_APP_HELP_DOCUMENT_LINK,
                    '_blank',
                  )
                }
              />
            </div>
          </Tooltip>
          <Tooltip overlay={I18N.components.feedback}>
            <div className={style.toolsIcon}>
              <IconFont
                type='icon-icon-yonghufankui'
                aria-label='yonghufankui'
                onClick={() => {
                  setFeedbackVisiable(true);
                }}
              />
            </div>
          </Tooltip>
          <Tooltip
            overlay={
              <a href='tel:010-50973498' className={style.tel}>
                010-50973498
              </a>
            }
          >
            <div className={style.toolsIcon}>
              <IconFont type='icon-icon-lianjiwomen' aria-label='kefu' />
            </div>
          </Tooltip>
          <Dropdown
            trigger={['click']}
            // visible
            overlay={
              <Broadcast
                AllMessage={{
                  [BroadcastTabType.message]: messageAndNotice.messageCounts,
                  [BroadcastTabType.notice]: messageAndNotice.noticeCounts,
                }}
              />
            }
            className={classNames(style.toolsIcon)}
          >
            <Tooltip overlay={I18N.components.messageNotification}>
              <Badge
                count={messageAndNotice.unReadCounts}
                overflowCount={99}
                size='small'
              >
                <IconFont
                  type='icon-icon-xiaoxizhongxin'
                  aria-label='xiaoxizhongxin'
                />
              </Badge>
            </Tooltip>
          </Dropdown>
        </>
      )}
      <NavDropdown
        overlay={renderManageUser()}
        trigger={['click']}
        onVisibleChange={onAvatarDropdownVisible}
      >
        <div className={className}>
          <IconFont
            type='icon-icon-yonghutouxiang'
            style={{ fontSize: '30px', color: '#fff' }}
          />
          <IconFont
            type='icon-icon-zhankai'
            style={{ fontSize: '16px', color: '#fff', marginLeft: '11px' }}
          />
        </div>
      </NavDropdown>

      <FeedBackModal
        visible={feedbackVisiable}
        showProductList
        type={FeedBackType.other}
        onCancel={() => {
          setFeedbackVisiable(false);
        }}
        onOk={() => {
          setFeedbackVisiable(false);
        }}
      />
      {/* 弹窗通知 ，有companyId 情况下才弹窗*/}
      {!!companyId && (
        <ModalBase
          key={modalNotices[0]?.id}
          closable={false}
          wrapClassName={style.messageModal}
          footer={
            <Button
              type='primary'
              onClick={() => {
                noticeReaded(modalNotices[0]?.id).then(({ data }) => {
                  if (data?.code === 200) {
                    dispatch({ type: 'DROP_SHOWED_MODAL_NOTICE' });
                    getNoticesAndMessagesCount();
                  }
                });
              }}
            >
              {I18N.components.gotIt}
            </Button>
          }
          visible={modalNotices.length > 0}
          content={<BroadcastDetail message={modalNotices[0]} />}
        />
      )}
    </div>
  );
};

export default memo(AvatarDropdown);
