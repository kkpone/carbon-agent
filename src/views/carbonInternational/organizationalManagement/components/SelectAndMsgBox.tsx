/**
 * @file 选项 带 自动value 展示
 * @author liqifeng
 */

import I18N from '@src/lang/I18N';
import { Form, InputNumber } from 'antd';
import { NamePath } from 'antd/es/form/interface';
import { Rule } from 'antd/lib/form';
import { combineClassName } from '@utils/index';
import {
  Selector,
  Props as SelectorProps,
} from '../../carbonManagement/Selector';
import { BaseProps } from './Selector';
import style from './formItems.module.less';

export type Props = {
  secondValue?: number;
  secondPlaceholder?: string;
  name2?: NamePath;
  editAble?: boolean;
  rules2?: Rule[];
  numberMin?: number;
  onSecondValueChange?: (val?: number) => void;
  // co2e 时不展示内容
  showContent?: boolean;
} & Omit<SelectorProps, 'aria-label'> &
  BaseProps;

export const SelectAndMsgBox = ({
  label,
  rules,
  rules2,
  name,
  name2,
  secondValue,
  editAble,
  secondPlaceholder,
  onSecondValueChange,
  className,
  showContent = true,
  numberMin,
  ...props
}: Props) => (
  <div className={combineClassName(style.selectAndMsgBox, className)}>
    {showContent && (
      <>
        <Form.Item label={label} name={name} rules={rules}>
          <Selector
            {...props}
            aria-label={typeof name === 'object' ? name.join('-') : name}
          />
        </Form.Item>
        <div className={style.factorBox}>
          <Form.Item hidden name={name2} rules={rules2} />
          <InputNumber
            type='number'
            value={secondValue}
            placeholder={secondPlaceholder ?? I18N.carbonFootprint.pleaseEnter}
            className={style.value}
            min={numberMin}
            onChange={num => {
              onSecondValueChange?.(num ?? undefined);
            }}
            disabled={!editAble}
          />
        </div>
      </>
    )}
  </div>
);
