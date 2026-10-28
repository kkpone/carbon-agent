import { connect, useField } from '@formily/react';
import { Button } from 'antd';
import { FC } from 'react';

interface IEditButtonProps {
  showDrawer: (id: number) => void;
  text: string;
}

const EditButtonC: FC<IEditButtonProps> = props => {
  const field = useField();
  return (
    <Button
      type='link'
      onClick={() => {
        const { id } =
          field
            .query(field.path.toString()?.replace('edit', 'set'))
            ?.get('value') || {};
        props.showDrawer(id);
      }}
    >
      {props.text}
    </Button>
  );
};

export const EditButton = connect(EditButtonC);
