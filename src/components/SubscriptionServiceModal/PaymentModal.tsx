import serviceQrCodeImg from '@assets/svg/service_qr_code.png';
import paySuccess from '@src/assets/svg/pay_success.svg';
import IconFont from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { Button, Modal, Radio } from 'antd';
import { toCanvas } from 'qrcode';
import { useCallback, useEffect, useRef, useState } from 'react';

import { PaymentCountdown } from './PaymentCountdown';
import styles from './index.module.less';
import { OrderDetailsPersonal, OrderPayStatusPersonal } from './type';

const PAY_STATUS = {
  WAIT_PAY: '0',
  SUCCESS: '1',
  CANCEL: '2',
} as const;

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  orderDetails: OrderDetailsPersonal | null;
  orderPayStatus: OrderPayStatusPersonal | null;
  totalAmount: number;
  restPayTime: string;
  onViewOrder?: () => void;
  onApplyInvoice?: () => void;
}

export const PaymentModal = ({
  open,
  onClose,
  orderDetails,
  orderPayStatus,
  totalAmount,
  restPayTime,
  onViewOrder,
  onApplyInvoice,
}: PaymentModalProps) => {
  const qrCodeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'transfer'>(
    'wechat',
  );

  // 绘制支付二维码的函数
  const drawQrCode = useCallback(() => {
    if (qrCodeCanvasRef.current && orderDetails?.codeUrl) {
      toCanvas(qrCodeCanvasRef.current, orderDetails.codeUrl, { width: 136 });
    }
  }, [orderDetails?.codeUrl]);

  // 当 Modal 打开且订单详情更新时，尝试绘制二维码（仅微信支付时）
  useEffect(() => {
    if (
      !open ||
      !orderDetails?.codeUrl ||
      paymentMethod !== 'wechat' ||
      orderPayStatus?.status === PAY_STATUS.CANCEL
    ) {
      return () => {
        // 清理函数
      };
    }

    // 使用 setTimeout 确保 Modal 完全渲染后再绘制二维码
    const timer = setTimeout(() => {
      drawQrCode();
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [
    orderDetails?.codeUrl,
    open,
    drawQrCode,
    paymentMethod,
    orderPayStatus?.status,
  ]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      destroyOnClose
      closable={false}
      footer={null}
      maskClosable={false}
      width={440}
      afterOpenChange={visible => {
        // Modal 完全打开后再绘制二维码
        if (visible && orderDetails?.codeUrl) {
          setTimeout(() => {
            drawQrCode();
          }, 100);
        }
      }}
      styles={{
        content: {
          padding: 0,
          borderRadius: 12,
        },
      }}
      wrapClassName={styles.paymentModal}
    >
      <div className={styles.paymentModalContent}>
        {/* 标题栏 */}
        <div className={styles.paymentModalHeader}>
          <h2 className={styles.paymentModalTitle}>
            {orderPayStatus?.status === PAY_STATUS.SUCCESS
              ? I18N.components.paymentCompleted
              : I18N.components.scanCodePayment}
          </h2>
          <span
            className={`cursorPointerFont ${styles.paymentModalClose}`}
            onClick={onClose}
          >
            <IconFont type='icon-icon-shanshu' style={{ fontSize: 16 }} />
          </span>
        </div>

        {/* 内容区域 */}
        <div className={styles.paymentModalBody}>
          {/* 扫码支付状态 */}
          {(orderPayStatus?.status === PAY_STATUS.WAIT_PAY ||
            orderPayStatus?.status === PAY_STATUS.CANCEL) && (
            <>
              {/* 付款方式选择 */}
              <div className={styles.paymentMethodSection}>
                <span className={styles.paymentMethodLabel}>
                  {I18N.components.paymentMethod}
                </span>
                <Radio.Group
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className={styles.paymentMethodRadioGroup}
                >
                  <Radio value='wechat' className={styles.paymentMethodRadio}>
                    {I18N.carbonNeutral.weChatPayment}
                  </Radio>
                  <Radio value='transfer' className={styles.paymentMethodRadio}>
                    {I18N.components.corporateTransfer}
                  </Radio>
                </Radio.Group>
              </div>

              {/* 应付金额 */}
              <div className={styles.paymentAmountSection}>
                <div className={styles.paymentAmount}>
                  <span className={styles.paymentCurrency}>¥</span>
                  <span className={styles.paymentAmountValue}>
                    {totalAmount.toLocaleString()}
                  </span>
                </div>
                {/* 支付剩余时间倒计时 */}
                {paymentMethod === 'wechat' && (
                  <PaymentCountdown
                    restPayTime={restPayTime}
                    active={
                      open && orderPayStatus?.status === PAY_STATUS.WAIT_PAY
                    }
                  />
                )}
                {paymentMethod === 'transfer' && (
                  <div className={styles.paymentTip}>
                    {I18N.components.pleaseScanTheCodeToAdd}
                  </div>
                )}
              </div>

              {/* 二维码区域 */}
              <div className={styles.paymentQrCodeSection}>
                <div className={styles.paymentQrCodeWrapper}>
                  {paymentMethod === 'wechat' ? (
                    <>
                      {orderPayStatus.status === PAY_STATUS.CANCEL && (
                        <div className={styles.paymentQrCodeExpire}>
                          <span>{I18N.components.orderHasTimedOut}</span>
                          <span>{I18N.components.pleasePlaceANewOrder}</span>
                        </div>
                      )}
                      <canvas
                        ref={qrCodeCanvasRef}
                        className={styles.paymentQrCode}
                      />
                    </>
                  ) : (
                    <img
                      src={serviceQrCodeImg}
                      alt={I18N.components.customerServiceQrCode}
                      className={styles.paymentServiceQrCode}
                    />
                  )}
                </div>
                {/* 服务协议 */}
                {/* <div className={styles.paymentAgreement}>
                  <Checkbox
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    className={styles.paymentAgreementCheckbox}
                  />
                  <span className={styles.paymentAgreementText}>
                    我已阅读并同意
                    <span className={styles.paymentAgreementLink}>
                      《服务协议》
                    </span>
                  </span>
                </div> */}
              </div>
            </>
          )}

          {/* 支付成功 */}
          {orderPayStatus?.status === PAY_STATUS.SUCCESS && (
            <div className={styles.paymentSuccessSection}>
              <div className={styles.paymentSuccessIconWrapper}>
                <img
                  className={styles.paymentSuccessImg}
                  src={paySuccess}
                  alt=''
                />
              </div>
              <div className={styles.paymentSuccessTitle}>
                {I18N.carbonNeutral.paymentSuccessful2}
              </div>
              <div className={styles.paymentSuccessDetails}>
                <div className={styles.paymentSuccessDetailRow}>
                  <span className={styles.paymentSuccessDetailLabel}>
                    {I18N.components.paymentAmount}
                  </span>
                  <span className={styles.paymentSuccessDetailValue}>
                    {totalAmount.toLocaleString()}
                    {I18N.components.element}
                  </span>
                </div>
                {orderDetails?.payTime && (
                  <div className={styles.paymentSuccessDetailRow}>
                    <span className={styles.paymentSuccessDetailLabel}>
                      {I18N.components.paymentTime3}
                    </span>
                    <span className={styles.paymentSuccessDetailValue}>
                      {orderDetails.payTime}
                    </span>
                  </div>
                )}
              </div>
              <div className={styles.paymentSuccessActions}>
                {onApplyInvoice && (
                  <Button
                    className={styles.paymentSuccessSecondaryButton}
                    onClick={onApplyInvoice}
                  >
                    {I18N.components.applyForInvoice}
                  </Button>
                )}
                {onViewOrder && (
                  <Button
                    type='primary'
                    className={styles.paymentSuccessPrimaryButton}
                    onClick={onViewOrder}
                  >
                    {I18N.components.viewOrders}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
