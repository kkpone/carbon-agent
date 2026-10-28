import I18N from '@src/lang/I18N';
import { connect, mapProps, useField } from '@formily/react';
import { Button } from 'antd';
import { FC } from 'react';

interface IEditButtonProps {
  showDrawer: (id: number) => void;
}

const EditButtonComponent: FC<IEditButtonProps> = props => {
  const field = useField();
  return (
    <Button
      type='link'
      style={{
        padding: '7px 8px',
      }}
      onClick={() => {
        const { id } =
          field
            .query(field.path.toString()?.replace('edit', 'set'))
            ?.get('value') || {};
        props.showDrawer(id);
      }}
    >
      {I18N.carbonFootprint.edit}
    </Button>
  );
};

export const EditButton = connect(
  EditButtonComponent,
  mapProps({ value: true }, props => ({
    ...props,
  })),
);
