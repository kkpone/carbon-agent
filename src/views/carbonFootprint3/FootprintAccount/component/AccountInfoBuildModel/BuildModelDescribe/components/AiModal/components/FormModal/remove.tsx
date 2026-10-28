import { DeleteOutlined } from '@ant-design/icons';
import { ArrayItems } from '@formily/antd-v5';
import { useField } from '@formily/react';
import { isUndef } from '@formily/shared';
import { Button } from 'antd';
import { FC, forwardRef } from 'react';

const { useIndex, useArray } = ArrayItems;

interface IRemoveProps {}

export const Remove: FC<IRemoveProps> = forwardRef<HTMLSpanElement, any>(
  (props, ref) => {
    const index = useIndex(props.index);
    const self = useField();
    const array = useArray();

    if (!array) return null;
    if (array.field?.pattern !== 'editable' || array.field.value.length === 1)
      return null;
    return (
      <Button
        type='ghost'
        {...props}
        style={{
          padding: '0 0 0 6px',
          width: 'auto',
          height: 'auto',
          ...props.style,
        }}
        disabled={self?.disabled}
        ref={ref}
        onClick={e => {
          if (self?.disabled) return;
          e.stopPropagation();
          if (props.onClick) {
            props.onClick(e);
            if (e.defaultPrevented) return;
          }
          array.field?.remove?.(index);
          array.props?.onRemove?.(index);
        }}
        icon={isUndef(props.icon) ? <DeleteOutlined /> : props.icon}
      >
        {props.title || self.title}
      </Button>
    );
  },
);
