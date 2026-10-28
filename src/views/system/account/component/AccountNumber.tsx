/**
 * @file 我的账号 修改密码
 */
import I18N from '@src/lang/I18N';
import { getUserInfo } from '@src/utils';
import { Button, Form, Input, Modal } from 'antd';
import type { ModalProps } from 'antd';
import { FC, useState } from 'react';

import Style from './style.module.less';
import VerifyUtils from '../../../../utils/verifty';
import { editUser } from '../../login/service';

const getPassList = [
  {
    title: I18N.system.oldPassword,
    require: [{ required: true, message: I18N.system.oldPasswordCannotBeUsed }],
    value: '',
    placeholder: I18N.carbonFootprint.pleaseEnter,
    name: 'old_pass',
  },
  {
    title: I18N.system.newPassword,
    require: [
      { required: true, message: I18N.system.theNewPasswordCannotBeUsed },
      {
        pattern: /^(?=.*[0-9])(?=.*[a-zA-Z])(.{8,20})$/,
        message: I18N.system.passwordMustBeInDigits,
      },
    ],
    value: '',
    placeholder: I18N.system.bitContainsAtLeast,
    name: 'new_pass',
  },
  {
    title: I18N.system.confirmPassword,
    require: [{ required: true, message: I18N.system.confirmPasswordNot }],
    value: '',
    placeholder: I18N.carbonFootprint.pleaseEnter,
    name: 'check_pass',
  },
];
const getPassLists = [
  {
    title: I18N.system.newPassword,
    require: [
      { required: true, message: I18N.system.theNewPasswordCannotBeUsed },
      {
        pattern: /^(?=.*[0-9])(?=.*[a-zA-Z])(.{8,20})$/,
        message: I18N.system.passwordMustBeInDigits,
      },
    ],
    value: '',
    placeholder: I18N.system.bitContainsAtLeast,
    name: 'new_pass',
  },
  {
    title: I18N.system.confirmPassword,
    require: [{ required: true, message: I18N.system.confirmPasswordNot }],
    value: '',
    placeholder: I18N.carbonFootprint.pleaseEnter,
    name: 'check_pass',
  },
];
const AccountNumber: FC<{
  modalGetContainer?: ModalProps['getContainer'];
  modalRootClassName?: string;
  modalWrapClassName?: string;
  password?: string;
  onSuccess: () => void;
  modalZIndex?: number;
}> = props => {
  const {
    modalGetContainer,
    modalRootClassName,
    modalWrapClassName,
    modalZIndex,
    password,
    onSuccess,
  } = props;
  const [form] = Form.useForm();
  const [list, setList] = useState({
    sex: 1,
    visible: false,
    confirmLoading: false,
    formobj: {},
    isword: false,
    nickname: '',
  });

  return (
    <>
      <Button
        // type={password ? 'default' : 'primary'}
        onClick={() => setList({ ...list, visible: !list.visible })}
      >
        {password ? I18N.system.changePassword : I18N.system.setPassword}
      </Button>
      {/* 弹窗区域 */}
      <Modal
        className={Style.changePWD}
        getContainer={modalGetContainer}
        rootClassName={modalRootClassName}
        wrapClassName={modalWrapClassName}
        zIndex={modalZIndex}
        title={I18N.system.changePassword}
        width={412}
        centered
        open={list.visible}
        destroyOnClose
        footer={null}
        onCancel={() => {
          setList({ ...list, visible: !list.visible });
          form.resetFields();
        }}
      >
        <Form
          form={form}
          layout='vertical'
          initialValues={list.formobj}
          onFinish={e => {
            if (!list.confirmLoading) {
              setList({ ...list });
              return editUser({
                oldPassword: e.old_pass || '',
                newPassword: e.check_pass,
                username: getUserInfo()?.userInfo.username || '',
                identify: null,
                type: 1,
              }).then((Res: any) => {
                if (Res.data.code === 200) {
                  VerifyUtils.Toast(200, Res.data.msg);
                  setList({
                    ...list,
                    visible: false,
                  });
                  form.resetFields();
                  onSuccess();
                }
                if (Res.data.code === 500) {
                  VerifyUtils.Toast(500, Res.data.msg);
                  setList({
                    ...list,
                    visible: true,
                  });
                }
              });
            }
            return undefined;
          }}
        >
          {password
            ? getPassList.map(item => (
                <Form.Item
                  label={item.title}
                  name={item.name}
                  rules={
                    item.title === I18N.system.confirmPassword
                      ? [
                          {
                            required: true,
                            message: I18N.system.cannotBeEmpty,
                          },
                          ({ getFieldValue }) => ({
                            validator(rule, value) {
                              if (
                                !value ||
                                getFieldValue('new_pass') === value
                              ) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error(I18N.system.enterPasswordTwice),
                              );
                            },
                          }),
                        ]
                      : item.require
                  }
                >
                  <Input.Password placeholder={item.placeholder} />
                </Form.Item>
              ))
            : getPassLists.map(item => (
                <Form.Item
                  label={item.title}
                  name={item.name}
                  rules={
                    item.title === I18N.system.confirmPassword
                      ? [
                          {
                            required: true,
                            message: I18N.system.cannotBeEmpty,
                          },
                          ({ getFieldValue }) => ({
                            validator(rule, value) {
                              if (
                                !value ||
                                getFieldValue('new_pass') === value
                              ) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error(I18N.system.enterPasswordTwice),
                              );
                            },
                          }),
                        ]
                      : item.require
                  }
                >
                  <Input.Password placeholder={item.placeholder} />
                </Form.Item>
              ))}
          <Form.Item>
            <div className={Style.sublist}>
              <Button
                className={`${Style.sub_btn} ${Style.subCancel}`}
                onClick={() => {
                  setList({ ...list, visible: !list.visible });
                  form.resetFields();
                }}
              >
                {I18N.carbonFootprint.cancel}
              </Button>
              <Button
                className={`${Style.sub_btn} `}
                htmlType='submit'
                type='primary'
                loading={list.confirmLoading}
              >
                {I18N.components.submit}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AccountNumber;
