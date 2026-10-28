import { CloseOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Button, Input, Modal, Radio } from 'antd';
import classNames from 'classnames';

import styles from './index.module.less';
import { LinkShareModalProps } from './type';

/** 链接分享弹框，布局对齐 Figma node 4147:13704 */
const LinkShareModal = ({
  open,
  content,
  errorSharePassword,
  onClose,
  onContentChange,
  onPasswordErrorChange,
  onOpenShareRecord,
  onCopy,
  copying = false,
  editTypeReadonly = false,
}: LinkShareModalProps) => {
  const editTypeValue = editTypeReadonly ? 0 : content.editType;

  return (
    <Modal
      className={styles.linkShareModal}
      open={open}
      width={624}
      footer={null}
      title={null}
      closable={false}
      destroyOnClose
      centered
      maskClosable={false}
      onCancel={onClose}
    >
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <div className={styles.title}>{I18N.carbonFootprint3.share}</div>
          <CloseOutlined className={styles.closeBtn} onClick={onClose} />
        </div>

        <div className={styles.main}>
          <div className={styles.topGroup}>
            <div className={styles.fieldBlock}>
              <div className={styles.label}>
                {I18N.carbonFootprint3.shareLink}
              </div>
              <Input
                className={styles.shareLinkInput}
                placeholder={I18N.carbonFootprint3.generatingPoints}
                value={content.url}
                disabled
              />
            </div>

            <div className={styles.fieldBlock}>
              <div className={styles.label}>
                {I18N.carbonFootprint3.password}
              </div>
              <div className={styles.passwordControlRow}>
                <Radio.Group
                  className={classNames(
                    styles.radioGroup,
                    styles.passwordRadioGroup,
                  )}
                  value={content.type}
                  disabled={copying}
                  onChange={event => {
                    onContentChange({
                      ...content,
                      type: event.target.value,
                    });
                  }}
                >
                  <Radio value={1}>
                    {I18N.carbonFootprint3.thereIsAPassword}
                  </Radio>
                  <Radio value={0}>{I18N.carbonFootprint3.noPassword}</Radio>
                </Radio.Group>
                {content.type === 1 && (
                  <Input
                    className={styles.passwordInput}
                    placeholder={
                      I18N.carbonFootprint3.pleaseEnterPasswordWithHint
                    }
                    value={content.password}
                    maxLength={20}
                    readOnly={copying}
                    status={errorSharePassword ? 'error' : undefined}
                    onChange={event => {
                      const regex = /^[A-Za-z0-9]{1,20}$/;
                      onContentChange({
                        ...content,
                        password: event.target.value,
                      });
                      onPasswordErrorChange(!regex.test(event.target.value));
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <div className={styles.configGroup}>
            <div className={styles.configItem}>
              <div className={styles.label}>
                {I18N.carbonFootprint3.supportEditAndDataSync}
              </div>
              <Radio.Group
                className={styles.radioGroup}
                value={editTypeValue}
                disabled={copying || editTypeReadonly}
                onChange={event => {
                  onContentChange({
                    ...content,
                    editType: event.target.value,
                    editPermit:
                      event.target.value === 1
                        ? content.editPermit ?? 0
                        : undefined,
                  });
                }}
              >
                <Radio value={1}>
                  {I18N.carbonFootprint3.shareEditSupported}
                </Radio>
                <Radio value={0}>
                  {I18N.carbonFootprint3.shareEditNotSupported}
                </Radio>
              </Radio.Group>
            </div>

            {editTypeValue === 1 && (
              <div className={styles.configItem}>
                <div className={styles.label}>
                  {I18N.carbonFootprint3.editPermissionSetting}
                </div>
                <Radio.Group
                  className={styles.radioGroup}
                  value={content.editPermit ?? 0}
                  disabled={copying}
                  onChange={event => {
                    onContentChange({
                      ...content,
                      editPermit: event.target.value,
                    });
                  }}
                >
                  <Radio value={0}>
                    {I18N.carbonFootprint3.firstCompletionInvalid}
                  </Radio>
                  <Radio value={1}>
                    {I18N.carbonFootprint3.editableWithinValidity}
                  </Radio>
                </Radio.Group>
              </div>
            )}

            <div className={styles.configItem}>
              <div className={styles.label}>
                {I18N.carbonFootprint3.validityPeriod}
              </div>
              <Radio.Group
                className={styles.radioGroup}
                value={content.expireValue}
                disabled={copying}
                onChange={event => {
                  onContentChange({
                    ...content,
                    expireValue: event.target.value,
                  });
                }}
              >
                <Radio value={1}>{I18N.carbonFootprint3.day4}</Radio>
                <Radio value={7}>{I18N.carbonFootprint3.day3}</Radio>
                <Radio value={15}>{I18N.carbonFootprint3.day2}</Radio>
                <Radio value={30}>{I18N.carbonFootprint3.day}</Radio>
                <Radio value={-1}>
                  {I18N.carbonFootprint3.permanentValidity}
                </Radio>
              </Radio.Group>
            </div>
          </div>

          <div className={styles.infoBox}>
            {I18N.carbonFootprint3.shareInfoDescription}
          </div>
        </div>

        <div className={styles.footer}>
          <Button
            className={styles.shareRecordBtn}
            disabled={copying}
            onClick={onOpenShareRecord}
          >
            {I18N.carbonFootprint3.shareRecord}
          </Button>
          <Button
            type='primary'
            className={styles.copyLinkBtn}
            loading={copying}
            disabled={copying}
            onClick={onCopy}
          >
            {content.type === 1
              ? I18N.carbonFootprint3.copyLinkAnd
              : I18N.carbonFootprint3.copyLink}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LinkShareModal;
