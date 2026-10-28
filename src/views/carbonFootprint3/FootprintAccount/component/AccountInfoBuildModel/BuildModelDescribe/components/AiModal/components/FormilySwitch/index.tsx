import I18N from '@src/lang/I18N';
import { connect, mapProps } from '@formily/react';
import { Switch as AntdSwitch, SwitchProps, App } from 'antd';

const WrapperSwitch = (props: SwitchProps) => {
  const { onChange } = props;
  const { modal } = App.useApp();
  const onWrapperChange = (checked: boolean) => {
    if (!checked) {
      modal.confirm({
        title: I18N.carbonFootprint.prompt,
        content: I18N.carbonFootprint3.confirmTheEmission,
        onOk: () => {
          onChange?.(checked, null);
        },
      });
    } else {
      onChange?.(checked, null);
    }
  };
  return <AntdSwitch {...props} onChange={onWrapperChange} />;
};

export const Switch = connect(
  WrapperSwitch,
  mapProps(
    {
      value: 'checked',
    },
    props => {
      const { onChange } = props;
      delete props.value;
      return {
        ...props,
        onChange(checked) {
          onChange?.(checked, null);
        },
      };
    },
  ),
);
