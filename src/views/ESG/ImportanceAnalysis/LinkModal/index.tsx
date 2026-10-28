import I18N from '@src/lang/I18N';
import { Input, Modal, Button, QRCode } from 'antd';
import { FC, useRef } from 'react';

import { RouteMaps } from '@/router/route-paths';
import { copyToClipboard, downloadFile, Toast } from '@/utils';

import styles from './index.module.less';

const LinkModal: FC<{ open: boolean; id?: number; onCancel: () => void }> = ({
  open,
  id,
  onCancel,
}) => {
  const shareUrl = `${
    location.origin
  }${RouteMaps.ESGImportanceAnalysisFill.replace(':id', `${id}`)}`;

  const QRCodeContentRef = useRef<HTMLDivElement>(null);

  return (
    <Modal
      title={I18N.questionnaire.shareQuestionnaire}
      width={492}
      open={open}
      footer={null}
      onCancel={onCancel}
      onClose={onCancel}
    >
      <div>
        <div>{I18N.questionnaire.questionnaireLink}</div>
        <div className={styles.urlContent}>
          <Input className={styles.urlInput} value={shareUrl} readOnly />
          <Button
            type='primary'
            onClick={() =>
              copyToClipboard(shareUrl).then(() =>
                Toast('success', I18N.carbonFootprint3.copySuccessful),
              )
            }
          >
            {I18N.carbonFootprint.copy}
          </Button>
        </div>
        <div className={styles.qrCodeContent}>
          <div className={styles.qrCode} ref={QRCodeContentRef}>
            <QRCode
              color='#000'
              bgColor='#fff'
              size={176}
              value={shareUrl}
              bordered={false}
            />
          </div>
          <Button
            className={styles.downloadQrCodeBtn}
            type='link'
            onClick={() => {
              const canvas =
                QRCodeContentRef.current?.querySelector<HTMLCanvasElement>(
                  'canvas',
                );
              if (canvas) {
                downloadFile(canvas.toDataURL(), 'qrcode.png');
              }
            }}
          >
            {I18N.carbonFootprint3.downloadQrCode}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LinkModal;
