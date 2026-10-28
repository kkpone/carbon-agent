import { GetComponentProps } from '@src/utils/utilTypes';
import { Button } from 'antd';
import { FormProps } from 'antd/lib/form';

import { FromItemProps, FromItemTypeBack } from '../FormUtil/type';
/** 搜索表单的参数 */
export interface FromUtilSearchProps {
  antdFormProps: FormProps; // Form 内置的参数
  formItems: FromItemProps<keyof FromItemTypeBack>[]; // 配置的default数据
  searchSub: () => void; // 触发搜索方法
  resetBack?: () => void; // 重置
  paddRight?: number | string;
  /** 外层容器类名 */
  wrapperClassName?: string;
  useSearch?: boolean;
  showReset?: boolean;
  searchButtonProps?: GetComponentProps<typeof Button>;
  resetButtonProps?: GetComponentProps<typeof Button>;
}
