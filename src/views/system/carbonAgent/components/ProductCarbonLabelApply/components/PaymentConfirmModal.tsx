import I18N from '@src/lang/I18N';
import { Modal } from 'antd';

export function PaymentConfirmModal({
  open,
  pointCost,
  submitting,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  pointCost?: number;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const text = I18N.carbonAgent.labelApplication;
  return (
    <Modal
      open={open}
      title={text.payTitle}
      okText={text.pay}
      cancelText={I18N.carbonAgent.cancel}
      confirmLoading={submitting}
      closable={!submitting}
      maskClosable={!submitting}
      cancelButtonProps={{ disabled: submitting }}
      onCancel={onCancel}
      onOk={onConfirm}
    >
      <p>{I18N.template(text.payContent, { val1: pointCost ?? '-' })}</p>
    </Modal>
  );
}
