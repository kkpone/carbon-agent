import avatarImg from '@assets/svg/icon_avatar.svg';
import I18N from '@src/lang/I18N';
import { Button, Checkbox, Modal, Select } from 'antd';
import classNames from 'classnames';
import { debounce } from 'lodash-es';
import { FC, ReactNode, useEffect, useMemo, useState } from 'react';

import styles from './index.module.less';
import { getUserList } from './service';
import { User } from './type';

type UserSelectModalProps = {
  userIds?: number[];
  children: ReactNode;
  orgId?: number | string | null;
  disabled?: boolean;
  showClear?: boolean;
  onConfirm: (userIds: number[], clearAppoint: boolean) => Promise<void> | void;
};

const UserSelectModal: FC<UserSelectModalProps> = ({
  userIds,
  orgId,
  children,
  disabled,
  showClear,
  onConfirm,
}) => {
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [userList, setUserList] = useState<User[]>([]);

  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  const [clearAppoint, setClearAppoint] = useState(false);

  const [selectLoading, setSelectLoading] = useState(false);

  const fetchUserList = async (params?: {
    searchName?: string;
    orgId?: number | string | null;
  }) => {
    try {
      setSelectLoading(true);
      const { data } = await getUserList(params);
      setUserList(data.data);
    } finally {
      setSelectLoading(false);
    }
  };

  const onSearchNameInputChange = useMemo(
    () =>
      debounce((searchName: string) => {
        fetchUserList({ searchName, orgId });
      }, 300),
    [orgId],
  );

  const optionRender = ({ data }: { data: unknown }) => {
    const { userId, employEmail, employName, employPhone } = data as User;
    const selected = selectedUserIds.includes(userId);
    return (
      <div
        className={classNames(styles.userOption, {
          [styles.selectedOption]: selected,
        })}
      >
        <img className={styles.avatarImg} alt='' src={avatarImg} />
        <div>
          <div className={styles.userName}>{employName}</div>
          <div className={styles.userInfo}>
            <div>{employPhone || '--'}</div>
            <div className={styles.split} />
            <div>{employEmail || '--'}</div>
          </div>
        </div>
      </div>
    );
  };

  const submit = async () => {
    try {
      setLoading(true);

      await onConfirm(
        selectedUserIds.filter(Boolean) as number[],
        clearAppoint,
      );
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setClearAppoint(false);
  }, [open]);

  useEffect(() => {
    if (open) {
      fetchUserList({ orgId });
    }
  }, [open, orgId]);

  useEffect(() => {
    setSelectedUserIds(userIds || []);
  }, [userIds, open]);

  return (
    <>
      <Modal
        className={styles.userSelectModal}
        open={open}
        title={I18N.components.inviteThePersonToFillIn}
        width={512}
        destroyOnClose
        maskClosable={false}
        footer={
          <div className={styles.modalFooter}>
            {showClear ? (
              <Checkbox
                checked={clearAppoint}
                onChange={e => {
                  setClearAppoint(e.target.checked);
                }}
              >
                {I18N.components.clearInvitedItems}
              </Checkbox>
            ) : (
              <div />
            )}
            <div>
              <Button
                className={styles.cancelBtn}
                onClick={() => setOpen(false)}
              >
                {I18N.carbonFootprint.cancel}
              </Button>
              <Button type='primary' loading={loading} onClick={submit}>
                {I18N.supplyChain.sendInvitation}
              </Button>
            </div>
          </div>
        }
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      >
        <div className={styles.userSelectLabel}>{I18N.carbonAccount.user}</div>
        <Select
          className={styles.userSelect}
          value={selectedUserIds[0]}
          popupClassName={styles.userSelectPopup}
          loading={selectLoading}
          placeholder={I18N.components.pleaseSelectAUser}
          // mode='multiple'
          virtual={false}
          allowClear
          fieldNames={{ value: 'userId', label: 'employName' }}
          notFoundContent={I18N.components.noSearchResultsAvailableAtTheMoment}
          filterOption={false}
          options={userList}
          onSearch={onSearchNameInputChange}
          optionRender={optionRender}
          onChange={userIds => {
            setSelectedUserIds([userIds]);
          }}
          showSearch
          onDropdownVisibleChange={dropdownOpen => {
            if (dropdownOpen) {
              fetchUserList({ orgId });
            }
          }}
        />
      </Modal>
      <div
        onClick={() => {
          if (!disabled) {
            setOpen(!open);
          }
        }}
      >
        {children}
      </div>
    </>
  );
};

export default UserSelectModal;
