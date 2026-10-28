import I18N from '@src/lang/I18N';
import { Input, TextArea } from '@components/Input';
import { Select } from '@components/Select';
import {
  DatePicker,
  Radio,
  Cascader,
  InputNumber,
  TreeSelect,
  Checkbox,
} from 'antd';
import classNames from 'classnames';

import { FromItemProps, FromItemTypeBack } from './type';
import { SearchInput } from '../SearchInput';

/**
 * Form中的每一项内置的
 * @param item
 * @returns
 */
export const getFormItem = <P extends keyof FromItemTypeBack>({
  item,
  readOnly,
}: {
  item: FromItemProps<P>;
  readOnly?: boolean;
}) => {
  // 描述信息
  const placeholder = item.placeholder || `${item.label || ''}`;
  switch (item.type) {
    case 'inputNumber':
      return (
        <InputNumber
          style={{ width: '100%' }}
          placeholder={placeholder}
          {...(item.props as FromItemTypeBack['inputNumber'])}
        />
      );
    case 'date':
      return (
        <DatePicker
          placeholder={placeholder}
          style={{ width: '100%' }}
          {...(item.props as FromItemTypeBack['date'])}
        />
      );
    case 'dateRange':
      return (
        <DatePicker.RangePicker
          placeholder={
            placeholder
              ? [I18N.template(I18N.components.startingPla, { val1: placeholder }), I18N.template(I18N.components.endPla, { val1: placeholder })]
              : undefined
          }
          style={{ width: '100%' }}
          {...(item.props as FromItemTypeBack['dateRange'])}
        />
      );
    case 'textArea':
      return (
        <TextArea
          readonly={readOnly}
          aria-label={`form-utils-textarea-${item.name}`}
          placeholder={placeholder}
          {...(item.props as FromItemTypeBack['textArea'])}
        />
      );
    case 'searchInput':
      return (
        <SearchInput {...(item.props as FromItemTypeBack['searchInput'])} />
      );
    case 'select':
      return (
        <Select
          allowClear
          {...(item.props as FromItemTypeBack['select'])}
          placeholder={placeholder}
          readonly={readOnly}
          aria-label={`form-utils-select-${item.name}`}
          {...(item.props as FromItemTypeBack['select'])}
          dropdownClassName={classNames(
            (item?.props as FromItemTypeBack['select'])?.dropdownClassName,
            `form-utils-select-dropdown-${item.name}`,
          )}
        />
      );
    case 'radio':
      return <Radio.Group {...(item.props as FromItemTypeBack['radio'])} />;
    case 'checkbox':
      return (
        <Checkbox.Group {...(item.props as FromItemTypeBack['checkbox'])} />
      );
    case 'cascader':
      return (
        <Cascader
          allowClear
          placeholder={placeholder}
          {...(item.props as FromItemTypeBack['cascader'])}
        />
      );

    case 'treeSelect':
      return (
        <TreeSelect
          allowClear
          placeholder={placeholder}
          {...(item.props as FromItemTypeBack['treeSelect'])}
        />
      );

    case 'render':
      return item.render?.();

    default:
      return (
        <Input
          readonly={readOnly}
          aria-label={`form-utils-input-${item.name}`}
          placeholder={placeholder}
          {...(item.props as FromItemTypeBack['input'])}
        />
      );
  }
};
