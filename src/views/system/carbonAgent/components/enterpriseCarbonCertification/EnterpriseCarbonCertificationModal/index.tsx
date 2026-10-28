/**
 * @file 企业碳 Agent 第三方认证咨询弹窗，只提供企业碳核算认证选项。
 */
import I18N from '@src/lang/I18N';
import { Modal } from 'antd';

import type { EnterpriseCarbonCertificationModalProps } from './types';
import style from './index.module.less';

const EnterpriseCarbonCertificationModal = ({
  open,
  onCancel,
  onConfirm,
}: EnterpriseCarbonCertificationModalProps) => (
  <Modal
    centered
    className={style.modal}
    closable={false}
    destroyOnClose
    footer={null}
    open={open}
    rootClassName={style.modalRoot}
    width={560}
    onCancel={onCancel}
  >
    <div className={style.layout} onClick={event => event.stopPropagation()}>
      <div className={style.main}>
        <header className={style.header}>
          <h2>{I18N.carbonAgent.thirdPartyCertificationModalTitle}</h2>
          <button
            aria-label={I18N.carbonAgent.closeDialog}
            className={style.closeButton}
            type='button'
            onClick={onCancel}
          >
            ×
          </button>
        </header>

        <div className={style.content}>
          <p className={style.intro}>
            {I18N.carbonAgent.thirdPartyCertificationIntro}
          </p>
          <section className={style.typeSection}>
            <h3>{I18N.carbonAgent.thirdPartyCertificationType}</h3>
            <div className={style.option}>
              <strong>
                {I18N.carbonAgent.enterpriseCarbonCertificationTitle}
              </strong>
              <span>
                {I18N.carbonAgent.enterpriseCarbonCertificationDescription}
              </span>
            </div>
          </section>
          <div className={style.info}>
            <div className={style.infoItem}>
              <span>
                {I18N.carbonAgent.thirdPartyCertificationReferencePrice}
              </span>
              <strong>
                {I18N.carbonAgent.thirdPartyCertificationReferencePriceValue}
              </strong>
            </div>
            <div className={style.infoItem}>
              <span>{I18N.carbonAgent.thirdPartyCertificationActualQuote}</span>
              <strong>
                {I18N.carbonAgent.thirdPartyCertificationActualQuoteValue}
              </strong>
            </div>
            <div className={style.infoItem}>
              <span>
                {I18N.carbonAgent.thirdPartyCertificationPaymentMethod}
              </span>
              <strong>
                {I18N.carbonAgent.thirdPartyCertificationPaymentMethodValue}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <footer className={style.footer}>
        <button className={style.cancelButton} type='button' onClick={onCancel}>
          {I18N.carbonAgent.cancel}
        </button>
        <button
          className={style.confirmButton}
          type='button'
          onClick={onConfirm}
        >
          {I18N.carbonAgent.thirdPartyCertificationConfirm}
        </button>
      </footer>
    </div>
  </Modal>
);

export default EnterpriseCarbonCertificationModal;
