import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { Modal } from 'antd';

import { postModelShareSubmit } from './FootprintAccount/service';

const { confirm } = Modal;

/** 受共享方提交共享模型：直接调用 submit 接口 */
export const submitSharedModel = async ({
  accountId,
  onSuccess,
}: {
  accountId: number;
  onSuccess?: () => void | Promise<void>;
}) => {
  const resp = await postModelShareSubmit({ accountId });
  if (resp.data.code === 200) {
    Toast('success', I18N.carbonFootprint3.shareModelSubmitSuccess);
    await onSuccess?.();
  }
};

/** 受共享方提交共享模型：二次确认后调用 submit 接口 */
export const confirmSubmitSharedModel = ({
  accountId,
  onSuccess,
}: {
  accountId: number;
  onSuccess?: () => void | Promise<void>;
}) => {
  confirm({
    title: I18N.carbonFootprint.prompt,
    icon: null,
    content: I18N.carbonFootprint3.confirmSubmitSharedModel,
    okText: I18N.components.submit,
    cancelText: I18N.carbonFootprint.cancel,
    onOk: async () => {
      await submitSharedModel({ accountId, onSuccess });
    },
  });
};
