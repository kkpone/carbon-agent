/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-09-29 11:15:11
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-03-15 11:40:09
 */
/**
 * @file modal 弹窗 基础状态
 */

import { Modal, ModalProps } from 'antd';
import { ReactNode } from 'react';

export type ModalBaseProps = {
  status?: string;
  content?: ReactNode;
} & ModalProps;
export const ModalBase = ({
  className,
  status,
  content,
  ...props
}: ModalBaseProps) => <Modal {...props}>{content}</Modal>;
