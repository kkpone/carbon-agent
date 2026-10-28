// eslint-disable-next-line no-restricted-imports
import { message } from 'antd';

import login from '../styles/toast.module.less';

function verifyMobile(mobile: string): boolean {
  return /\d{11}/.test(`${mobile}`.trim());
}

function desensitizationPhoneNumber(phoneNumber: string): string {
  return `${phoneNumber.slice(0, 3)}****${phoneNumber.slice(7)}`;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function get_time(text: string): string {
  const time = new Date(text);
  return `${time.toLocaleDateString()} ${time.toLocaleTimeString('chinese', {
    hour12: false,
  })}`;
}
const ToastObj = {
  200: 'success',
  500: 'warn',
  400: 'info',
  601: 'info',
  success: 'success',
  warn: 'warn',
  error: 'error',
  info: 'info',
};

function Toast(code: keyof typeof ToastObj, contents: string) {
  if (ToastObj[code] === 'success' && contents) {
    return message.success({
      content: contents,
      className: `${login.toast} ${login.toast_success}`,
    });
  }
  if (ToastObj[code] === 'error' && contents) {
    return message.error({
      content: contents,
      className: `${login.toast} ${login.toast_error}`,
    });
  }
  if (ToastObj[code] === 'warn' && contents) {
    return message.warning({
      content: contents,
      className: `${login.toast} ${login.toast_warn}`,
    });
  }
  if (ToastObj[code] === 'info' && contents) {
    return message.info({
      content: contents,
      className: `${login.toast} ${login.toast_info}`,
    });
  }
}
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/naming-convention
function get_msg(data: string | any) {
  if (typeof data === 'string') {
    Toast('warn', data);
  } else {
    let txt = '';
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const i in data) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      txt = data[i];
    }
    Toast('warn', txt);
  }
}

const VerifyUtils = {
  verifyMobile,
  desensitizationPhoneNumber,
  get_time,
  get_msg,
  Toast,
};

export default VerifyUtils;
