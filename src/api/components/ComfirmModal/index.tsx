/**
 * @file 全局弹窗通知
 */

import I18N from '@src/lang/I18N';
import {
  addCacheMsg,
  dropShowedMsg,
  getCacheMsg,
} from '@src/store/global-modal';
import { Modal } from 'antd';
import { ReactNode } from 'react';

import style from './index.module.less';

export type GlobalModalProps = {
  content: ReactNode;
  onOk: () => any;
  okText?: ReactNode;
  title?: ReactNode;
  /** 使用code来判断优先级 */
  code: number;
  /* 是否缓存这条消息, 默人缓存 */
  noCache?: boolean;
};

/**
 * 特殊的状态码
 */
export const specialCode = {
  exitCode: [401, 403, 410],
  jump2AccountCode: [407, 406, 408],
};

let lastModal: ReturnType<typeof Modal.confirm> | null = null;

export const globalModal = ({
  content,
  onOk,
  okText,
  title,
  code,
  noCache,
}: // eslint-disable-next-line consistent-return
GlobalModalProps) => {
  const nowModalCode = getCacheMsg()?.[0]?.code;

  if (!noCache) {
    addCacheMsg({ content, okText, title, onOk, code, noCache: true });
  }
  /**
   * 有弹窗、现在弹窗码为 exitCode return null
   * 有弹窗、现在弹窗码为不为 exitCode 新码为 exitCode return null
   * 有弹窗、现在弹窗码不为 exitCode jump2AccountCode、新码不为 exitCode，现码为 jump2AccountCode return null
   */
  if (
    nowModalCode &&
    (specialCode.exitCode.includes(nowModalCode) ||
      (!specialCode.exitCode.includes(nowModalCode) &&
        !specialCode.exitCode.includes(code)) ||
      (![...specialCode.exitCode, ...specialCode.jump2AccountCode].includes(
        nowModalCode,
      ) &&
        !specialCode.jump2AccountCode.includes(code)))
  ) {
    return null;
  }
  /** 更高优先级的modal展示时，关闭其它modal */
  if (lastModal) {
    lastModal.destroy();
  }

  lastModal = Modal.confirm({
    wrapClassName: style.globalConfirmWrapper,
    title: title !== null ? title || I18N.carbonFootprint.prompt : null,
    content,
    icon: null,
    cancelText: null,
    cancelButtonProps: { style: { display: 'none' } },
    okText,
    onOk: () => {
      dropShowedMsg();
      lastModal?.destroy();
      lastModal = null;
      onOk();
      if (getCacheMsg().length) {
        setTimeout(() => {
          globalModal(getCacheMsg()[0]);
        }, 300);
      }
    },
  });
};
