import { EditOutlined } from '@ant-design/icons';
import { downloadFile } from '@src/components/DownLoadFile';
import { checkPermissions } from '@src/components/Permission/utils';
import I18N from '@src/lang/I18N';
import {
  initUsingGETDefaultApi,
  editInviteCodeUsingPOSTDefaultApi,
} from '@src/sdks/java/carbonAccount';
import { Toast } from '@src/utils/Toast';
import { Button, Modal, Input, Spin, Alert, Form } from 'antd';
import ClipboardJS from 'clipboard';
import { isUndefined } from 'lodash-es';
import { useEffect, useState } from 'react';

import styles from './index.module.less';
import '../../index.less';

function InvitationCode() {
  const [info, setInfo] = useState<{ inviteCode?: string; codeUrl?: string }>();
  const [editedInviteCode, setEditedInviteCode] = useState<string>();
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  useEffect(() => {
    setEditedInviteCode(info?.inviteCode);
  }, [info?.inviteCode]);

  useEffect(() => {
    initUsingGETDefaultApi().then(res => {
      setInfo(res.data?.data);
    });
  }, []);

  useEffect(() => {
    /** 复制文本 */
    const copy = new ClipboardJS('#copy', {
      text() {
        return info?.inviteCode || '';
      },
    });
    return () => copy?.destroy && copy.destroy();
  }, [info?.inviteCode]);

  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  const submit = async () => {
    setConfirmLoading(true);
    if (
      isUndefined(editedInviteCode) ||
      editedInviteCode?.length > 20 ||
      editedInviteCode?.length === 0
    ) {
      Toast('error', I18N.carbonAccount.invitationCodeLength);
      setConfirmLoading(false);
      return;
    }
    if (editedInviteCode === info?.inviteCode) {
      setShowEditModal(false);
      setConfirmLoading(false);
      return;
    }
    try {
      await editInviteCodeUsingPOSTDefaultApi({ inviteCode: editedInviteCode });
      const res = await initUsingGETDefaultApi();
      setInfo(res.data?.data);
    } catch (error) {
      Toast('error', error);
    }
    setShowEditModal(false);
    setConfirmLoading(false);
  };
  const download = () => {
    downloadFile(I18N.carbonAccount.miniProgram2D2, info?.codeUrl || '');
  };
  return (
    <div className={styles.wrapper}>
      <div className={styles.headerTitle}>
        {I18N.carbonAccount.inviteMembersToAdd}
      </div>
      <div className={styles.innerHeader}>
        <span className={styles.des}>
          {I18N.carbonAccount.canBeAchievedThroughTheFollowing}
        </span>

        {checkPermissions(
          <Button
            icon={<EditOutlined />}
            type='link'
            onClick={() => setShowEditModal(true)}
          >
            {I18N.carbonAccount.editInvitationCode2}
          </Button>,
          'carbonAccount:company:editInviteCode',
        )}
        <Modal
          title={I18N.carbonAccount.editInvitationCode2}
          open={showEditModal}
          confirmLoading={confirmLoading}
          onCancel={() => {
            setEditedInviteCode(info?.inviteCode);
            setShowEditModal(false);
          }}
          onOk={submit}
        >
          <Alert
            message={I18N.carbonAccount.editInvitationCode}
            type='warning'
            showIcon
          />
          <div className={styles.block} />
          <Form layout='vertical'>
            <Form.Item label={I18N.carbonAccount.invitationCode} required>
              <Input
                value={editedInviteCode}
                onChange={value => setEditedInviteCode(value.target.value)}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
      <Spin spinning={confirmLoading}>
        <div className={styles.content}>
          <div className={styles.contentBox}>
            <div className={styles.contentTitle}>
              {I18N.carbonAccount.miniProgramInvitation}
            </div>
            <div className={styles.contentDes}>
              {I18N.carbonAccount.whenTheUserLogsIn}
            </div>
            <div className={styles.inner}>
              <span className={styles.inviteCode}>{info?.inviteCode}</span>
            </div>
            <Button
              id='copy'
              onClick={() => {
                Toast('success', I18N.carbonFootprint3.copySuccessful);
              }}
            >
              {I18N.carbonAccount.copyInvitationCode}
            </Button>
          </div>
          <div className={styles.contentBox}>
            <div className={styles.contentTitle}>
              {I18N.carbonAccount.miniProgram2D}
            </div>
            <div className={styles.contentDes}>
              {I18N.carbonAccount.usersCanAccessItThrough}
            </div>
            <div className={styles.inner}>
              <img className={styles.img} src={info?.codeUrl} alt='' />
            </div>
            <Button disabled={!info?.codeUrl} onClick={() => download()}>
              {I18N.carbonFootprint3.downloadQrCode}
            </Button>
          </div>
        </div>
      </Spin>
    </div>
  );
}

export default InvitationCode;
