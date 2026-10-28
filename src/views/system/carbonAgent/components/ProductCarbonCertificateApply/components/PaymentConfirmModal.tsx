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
  const text = I18N.carbonAgent.certificateApplication;

  return (
    <Modal
      cancelButtonProps={{ disabled: submitting }}
      cancelText={I18N.carbonAgent.cancel}
      closable={!submitting}
      confirmLoading={submitting}
      maskClosable={!submitting}
      okText={text.pay}
      open={open}
      title={text.payTitle}
      onCancel={onCancel}
      onOk={onConfirm}
    >
      <p>{I18N.template(text.payContent, { val1: pointCost ?? '-' })}</p>
    </Modal>
  );
}
