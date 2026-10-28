import * as ICONS from '@ant-design/icons';
import { Form, FormItem, Input, Submit, Switch } from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { LocaleContext } from '@src/components/LocaleProvider';
import { serviceLangMap } from '@src/lang/I18N';
import React, { FC, useContext, useMemo } from 'react';
import I18N from 'src/lang/I18N';

import MaterialPassword from '@/components/FormilyMaterial/MaterialPassword';
import { MaterialPhoneNumber } from '@/components/FormilyMaterial/PhoneNumber';
import { Toast } from '@/utils/Toast';

import styles from './index.module.less';
import { apiSendSMS, LoginType, editUserForgot } from '../../service';
import { ModuleType } from '../LoginWrapper/type';
import { VerifyCode } from '../VerifyCode';

const phoneSchema = (lang: string) => ({
  type: 'object',
  properties: {
    phone: {
      type: 'object',
      title: '',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'PhoneNumber',
      'x-component-props': {
        prefix: "{{icon('PhoneOutlined')}}",
      },
      'x-validator': {
        triggerType: 'onBlur',
        validator: (value: { phoneNumber: string }) => {
          if (!value.phoneNumber) {
            return I18N.dashborad.pleaseEnterMobilePhoneNumber;
          }
          return '';
        },
      },
    },
    verifyCode: {
      type: 'string',
      title: '',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'VerifyCode',
      'x-component-props': {
        label: I18N.system.verificationCode,
        sendVerifyCode: async (value: {
          areaCode: string;
          phoneNumber: string;
        }) => {
          await apiSendSMS({
            areaCode: value.areaCode?.match(/\d+/g)?.[0],
            number: value.phoneNumber,
            lang,
          });
        },
        placeholder: I18N.system.pleaseEnterVerification,
      },
      'x-reactions': [
        {
          dependencies: ['.phone#value', '.phone#valid'],
          fulfill: {
            state: {
              'component[1].readyPost': true,
              'component[1].phoneNumber': '{{$deps[0]}}',
            },
          },
        },
      ],
    },
    password: {
      type: 'string',
      title: '',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'Password',
      'x-component-props': {
        label: I18N.system.newPassword,
        fullWidth: true,
        placeholder: I18N.system.pleaseEnterTheNewPassword,
      },
      'x-reactions': [
        {
          dependencies: ['.confirm_password'],
          fulfill: {
            state: {
              selfErrors:
                '{{$deps[0] && $self.value && $self.value !== $deps[0] ? notMatch() : ""}}',
            },
          },
        },
      ],
    },
    confirm_password: {
      type: 'string',
      title: '',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'Password',
      'x-component-props': {
        label: I18N.system.confirmNewPassword,
        fullWidth: true,
        placeholder: I18N.system.pleaseEnterAgain,
      },
      'x-reactions': [
        {
          dependencies: ['.password'],
          fulfill: {
            state: {
              selfErrors:
                '{{$deps[0] && $self.value && $self.value !== $deps[0] ? notMatch() : ""}}',
            },
          },
        },
      ],
    },
  },
});

// const emailSchema = (lang: string) => ({
//   type: 'object',
//   properties: {
//     email: {
//       type: 'string',
//       title: '',
//       required: true,
//       'x-decorator': 'FormItem',
//       'x-validator': 'email',
//       'x-component': 'Input',
//       'x-component-props': {
//         placeholder: I18N.dashborad.pleaseEnterYourEmailAddress,
//       },
//     },
//     verifyCode: {
//       type: 'string',
//       title: '',
//       required: true,
//       'x-decorator': 'FormItem',
//       'x-component': 'VerifyCode',
//       'x-component-props': {
//         // prefix: "{{icon('LockOutlined')}}",
//         sendVerifyCode: async (value: {
//           areaCode: string;
//           phoneNumber: string;
//         }) => {
//           // TODO: 忘记密码发送邮件验证码
//           await apiSendSMS({
//             areaCode: value.areaCode?.match(/\d+/g)?.[0],
//             number: value.phoneNumber,
//             lang,
//           });
//         },
//         placeholder: I18N.system.pleaseEnterVerification,
//       },
//       'x-reactions': [
//         {
//           dependencies: ['.email#value', '.email#valid'],
//           fulfill: {
//             state: {
//               'component[1].readyPost': true,
//               'component[1].phoneNumber': '{{$deps[0]}}',
//             },
//           },
//         },
//       ],
//     },
//     password: {
//       type: 'string',
//       title: '',
//       required: true,
//       'x-decorator': 'FormItem',
//       'x-component': 'Password',
//       'x-component-props': {
//         placeholder: I18N.system.pleaseEnterANewPassword,
//       },
//       'x-reactions': [
//         {
//           dependencies: ['.confirm_password'],
//           fulfill: {
//             state: {
//               selfErrors:
//                 '{{$deps[0] && $self.value && $self.value !== $deps[0] ? notMatch() : ""}}',
//             },
//           },
//         },
//       ],
//     },
//     confirm_password: {
//       type: 'string',
//       title: '',
//       required: true,
//       'x-decorator': 'FormItem',
//       'x-component': 'Password',
//       'x-component-props': {
//         placeholder: I18N.system.pleaseEnterAgain,
//       },
//       'x-reactions': [
//         {
//           dependencies: ['.password'],
//           fulfill: {
//             state: {
//               selfErrors:
//                 '{{$deps[0] && $self.value && $self.value !== $deps[0] ? notMatch() : ""}}',
//             },
//           },
//         },
//       ],
//     },
//   },
// });

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Password: MaterialPassword,
    VerifyCode,
    Switch,
    PhoneNumber: MaterialPhoneNumber,
  },
  scope: {
    icon(name: string | number) {
      return React.createElement(ICONS[name]);
    },
    notMatch() {
      return I18N.system.confirmPasswordNot1;
    },
  },
});

interface LoginProps {
  toggleModuleType: (type: ModuleType) => void;
}

export const ResetPassword: FC<LoginProps> = props => {
  const { toggleModuleType } = props;
  const { locale } = useContext(LocaleContext);

  const lang = serviceLangMap[locale];

  // const emailForm = useMemo(
  //   () =>
  //     createForm({
  //       // validateFirst: true,
  //     }),
  //   [],
  // );

  const phoneForm = useMemo(
    () =>
      createForm({
        // validateFirst: true,
      }),
    [locale],
  );

  const phoneSubmit = async (value: {
    phone: any;
    password: any;
    verifyCode: any;
  }) => {
    const { phone, password, verifyCode } = value;
    await editUserForgot({
      username: phone.phoneNumber,
      newPassword: password,
      identify: verifyCode,
      areaCode: phone.areaCode?.match(/\d+/g)?.[0],
      loginType: LoginType.phone,
      lang,
    });
    Toast('success', I18N.system.changePasswordTo);
    setTimeout(() => {
      toggleModuleType(ModuleType.login);
    }, 1000);
  };

  // const emailSubmit = async (value: {
  //   email: any;
  //   password: any;
  //   verifyCode: any;
  // }) => {
  //   const { email, password, verifyCode } = value;
  //   await editUserForgot({
  //     username: email,
  //     newPassword: password,
  //     identify: verifyCode,
  //     areaCode: null,
  //     loginType: LoginType.email,
  //     lang,
  //   });
  // };

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.backToLogin}
        type='button'
        onClick={() => toggleModuleType(ModuleType.login)}
      >
        <svg
          aria-hidden='true'
          xmlns='http://www.w3.org/2000/svg'
          width='6'
          height='10'
          viewBox='0 0 6 10'
          fill='none'
        >
          <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M5.176 9.375C5.07741 9.375 4.9778 9.33851 4.89461 9.26553L0.542393 5.37814C0.436617 5.2835 0.375 5.14096 0.375 4.98929C0.375 4.83877 0.436617 4.69509 0.542393 4.60158L4.87613 0.734721C5.06919 0.562531 5.35161 0.596741 5.50668 0.811123C5.66175 1.02551 5.63094 1.3391 5.43787 1.51129L1.53956 4.99043L5.45738 8.48896C5.65045 8.66115 5.68126 8.97474 5.52619 9.18913C5.43684 9.31114 5.30745 9.375 5.176 9.375Z'
            fill='#04252B'
          />
        </svg>
        <span className={styles.label}>{I18N.system.returnToLogin}</span>
      </button>
      <h2 className={styles.title}>{I18N.system.forgotPassword}</h2>
      <Form
        key={`${locale}-reset-password`}
        form={phoneForm}
        layout='vertical'
        size='large'
        onAutoSubmit={async value => phoneSubmit(value)}
      >
        <SchemaField schema={phoneSchema(lang)} />
        <Submit
          block
          style={{
            marginTop: 12,
            height: 48,
          }}
        >
          {I18N.system.confirmModifications}
        </Submit>
      </Form>
    </div>
  );
};
