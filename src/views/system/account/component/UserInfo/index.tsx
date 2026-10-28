import { FormActions } from '@src/components/FormActions';
import { IconAlibabaNew } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { getUserInfo } from '@src/utils';
import { Button } from 'antd';
import { useEffect, useRef, useState } from 'react';
// import { useHistory } from 'react-router-dom';

import styles from './index.module.less';
import { BindType, getUserInfoByUserName, Info } from '../../service';
import AccountNumber from '../AccountNumber';
import { BindModal } from '../BindModal';
import { ChangeName } from '../ChangeName';
import { CheckModal } from '../CheckModal';

export const UserInfo = (props: { onCancel: () => void }) => {
  const userInfo = getUserInfo();
  const [info, setInfo] = useState<Info | undefined>();

  // const history = useHistory();

  const getInfo = async () => {
    const data = await getUserInfoByUserName({
      userName: userInfo?.userInfo.username,
    });
    setInfo(data.data.data);
  };

  useEffect(() => {
    getInfo();
  }, []);
  const checkModalRef = useRef<{
    showCheckModal: (bindType: BindType) => void;
  }>(null);
  const bindPhoneModalRef = useRef<{ showBindModal: () => void }>(null);
  const bindEmailModalRef = useRef<{ showBindModal: () => void }>(null);

  const showBindModal = (bindType: BindType) => {
    if (bindType === BindType.phone) {
      bindPhoneModalRef.current?.showBindModal();
    } else if (bindType === BindType.email) {
      bindEmailModalRef.current?.showBindModal();
    }
  };
  return (
    <div className={styles.userInfoWrapper}>
      <div className={styles.contentWrapper}>
        <div className={styles.baseInfo}>
          <div className={styles.title}>
            {I18N.carbonFootprint.basicInformation}
          </div>
          <div>
            <ChangeName initName={info?.nickName} />
          </div>
        </div>
        <BindModal
          bindType={BindType.phone}
          ref={bindPhoneModalRef}
          onSuccess={() => getInfo()}
        />
        <BindModal
          bindType={BindType.email}
          ref={bindEmailModalRef}
          onSuccess={() => getInfo()}
        />
        <CheckModal
          email={info?.email}
          mobile={info?.mobile}
          ref={checkModalRef}
          onSuccess={bindType => showBindModal(bindType)}
          initBindType={BindType.email}
        />
        <div className={styles.loginMethod}>
          <div className={styles.title}>{I18N.system.loginMethod}</div>
          <div className={styles.item}>
            <div className={styles.itemLeft}>
              <div className={styles.imgBox}>
                <IconAlibabaNew
                  className={styles.img}
                  size={48}
                  style={{
                    fontSize: 48,
                  }}
                  type={
                    info?.mobile
                      ? 'icon-icon-shoujihao-filled'
                      : 'icon-icon-shoujihao-filled'
                  }
                />
              </div>
              <div>
                <div className={styles.itemMain}>
                  {I18N.dashborad.mobilePhoneNumber}
                </div>
                <div className={styles.itemDes}>
                  {info?.mobile || I18N.system.afterBinding}{' '}
                  {I18N.system.canBeAccessedThroughMobilePhone}
                </div>
              </div>
            </div>
            <div>
              {!info?.mobile && (
                <Button
                  onClick={() => showBindModal(BindType.phone)}
                  // type='primary'
                >
                  {I18N.system.bindPhone}
                </Button>
              )}
              {info?.mobile && (
                <Button
                  onClick={() =>
                    checkModalRef.current?.showCheckModal(BindType.phone)
                  }
                >
                  {I18N.system.replaceThePhone}
                </Button>
              )}
            </div>
          </div>
          <div className={styles.item}>
            <div className={styles.itemLeft}>
              <div className={styles.imgBox}>
                <IconAlibabaNew
                  className={styles.img}
                  type={
                    info?.email
                      ? 'icon-icon-youxiang-filled'
                      : 'icon-icon-youxiang-filled'
                  }
                />
              </div>
              <div>
                <div className={styles.itemMain}>
                  {I18N.carbonFootprint.mailbox}
                </div>
                <div className={styles.itemDes}>
                  {info?.email || I18N.system.afterBinding}{' '}
                  {I18N.system.canBeSentViaEmail}
                </div>
              </div>
            </div>
            <div>
              {!info?.email && (
                <Button
                  onClick={() => showBindModal(BindType.email)}
                  // type='primary'
                >
                  {I18N.system.bindEmail}
                </Button>
              )}
              {info?.email && (
                <Button
                  onClick={() =>
                    checkModalRef.current?.showCheckModal(BindType.email)
                  }
                >
                  {I18N.system.changeEmail}
                </Button>
              )}
            </div>
          </div>
          <div className={styles.item}>
            <div className={styles.itemLeft}>
              <div className={styles.imgBox}>
                <IconAlibabaNew
                  className={styles.img}
                  type={
                    info?.password
                      ? 'icon-icon-mima-filled'
                      : 'icon-icon-mima-filled'
                  }
                />
              </div>
              <div>
                <div className={styles.itemMain}>
                  {I18N.carbonFootprint3.password}
                </div>
                <div className={styles.itemDes}>
                  {info?.password || I18N.system.afterSettingUp}{' '}
                  {I18N.system.canBeAccessedThroughPassword}
                </div>
              </div>
            </div>
            <div>
              <AccountNumber
                password={info?.password}
                onSuccess={() => getInfo()}
              />
            </div>
          </div>
        </div>
      </div>
      <FormActions
        width='560px'
        place='center'
        buttons={[
          {
            title: I18N.carbonFootprint.return,
            onClick: async () => props.onCancel(),
          },
        ]}
      />
    </div>
  );
};
