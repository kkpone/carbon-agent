import I18N from '@src/lang/I18N';
import { Button, Input, Modal, QRCode } from 'antd';
import {
  cloneElement,
  FC,
  ReactElement,
  useContext,
  useRef,
  useState,
} from 'react';

import { LocaleContext } from '@/components/LocaleProvider';
import { RouteMaps } from '@/router/route-paths';
import { copyToClipboard, downloadFile, Toast } from '@/utils';

import styles from './index.module.less';

type QRCodeModalProps = {
  id: number;
  name: string;
  children: ReactElement;
};
const QRCodeModal: FC<QRCodeModalProps> = ({ name, children, id }) => {
  const [open, setOpen] = useState(false);

  const QRCodeContentRef = useRef<HTMLDivElement>(null);

  const { locale } = useContext(LocaleContext);

  const shareUrl = `${location.origin}${RouteMaps.questionnaireFill.replace(
    ':id',
    `${id}`,
  )}?locale=${locale}`;

  return (
    <>
      <Modal
        open={open}
        width={534}
        title={I18N.questionnaire.shareQuestionnaire}
        footer={null}
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      >
        <div>{I18N.questionnaire.questionnaireLink}</div>
        <div className={styles.urlContent}>
          <Input value={shareUrl} readOnly />
          <Button
            type='primary'
            onClick={() => {
              copyToClipboard(shareUrl).then(() => {
                Toast('success', I18N.carbonFootprint3.copySuccessful);
              });
            }}
          >
            {I18N.carbonFootprint.copy}
          </Button>
        </div>

        <div className={styles.QRCodeContent} ref={QRCodeContentRef}>
          <div>{I18N.carbonFootprint3.qrCode}</div>
          <div className={styles.QRCodeArea}>
            <QRCode
              color='#000'
              bgColor='#fff'
              value={shareUrl}
              bordered={false}
            />
            <div
              className={styles.download}
              onClick={() => {
                const canvas =
                  QRCodeContentRef.current?.querySelector<HTMLCanvasElement>(
                    'canvas',
                  );
                if (canvas) {
                  downloadFile(canvas.toDataURL(), `${name}.png`);
                }
              }}
            >
              {I18N.carbonFootprint3.downloadQrCode}
            </div>
          </div>
        </div>
      </Modal>
      {cloneElement(children, { onClick: () => setOpen(true) })}
    </>
  );
};

export default QRCodeModal;
