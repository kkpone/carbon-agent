import I18N from '@src/lang/I18N';
import { RootState } from '@src/store';
import { SET_COMPANY_USER_INFO } from '@src/store/actionTypes';
import { CompanyUserInfoAction } from '@src/store/module/user';
import { Toast } from '@src/utils/Toast';
import { Button, Input } from 'antd';
import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { IconAlibabaNew } from '@/components/iconfont';

import styles from './index.module.less';
import { editUserDetail } from '../../service';

interface ChangeNameProps {
  initName?: string;
}

export const ChangeName: FC<ChangeNameProps> = props => {
  const { initName } = props;
  const [showName, setShowName] = useState(initName);
  const [edit, setEdit] = useState(false);
  const [inputValue, setInputValue] = useState(initName);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const user = useSelector<RootState, RootState['companyUserInfo']>(
    s => s.companyUserInfo,
  );

  useEffect(() => {
    if (initName) {
      setShowName(initName);
      setInputValue(initName);
    }
  }, [initName]);

  const submit = async () => {
    if (!inputValue) {
      Toast('warn', I18N.system.pleaseEnterYourNickname);
      return;
    }
    if (inputValue.length < 2 || inputValue.length > 100) {
      Toast('warn', I18N.system.nicknameLengthIs);
      return;
    }
    try {
      setLoading(true);
      await editUserDetail({ nickName: inputValue });
      setShowName(inputValue);
      setEdit(false);

      if (user?.userInfo?.user) {
        user.userInfo.user.nickName = inputValue;
        dispatch<CompanyUserInfoAction>({
          type: SET_COMPANY_USER_INFO,
          payload: { ...user },
        });
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>{I18N.system.accountNickname}</span>
      {edit && (
        <>
          <Input
            style={{
              width: 200,
            }}
            minLength={2}
            maxLength={100}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />
          <Button
            className={styles.submitBtn}
            onClick={() => submit()}
            loading={loading}
            style={{
              padding: '0 12px',
            }}
            type='link'
          >
            {I18N.carbonFootprint.preserve}
          </Button>
          <Button
            type='link'
            style={{
              padding: '0',
            }}
            onClick={() => {
              setEdit(false);
              setInputValue(showName);
            }}
          >
            {I18N.carbonFootprint.cancel}
          </Button>
        </>
      )}
      {!edit && (
        <>
          <div className={styles.showName}>{showName}</div>
          <span className={styles.editButton} onClick={() => setEdit(true)}>
            <IconAlibabaNew type='icon-icon-bianji-saas' />
          </span>
        </>
      )}
    </div>
  );
};
