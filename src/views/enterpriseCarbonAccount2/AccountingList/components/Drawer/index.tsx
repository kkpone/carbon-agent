import { GetComponentProps } from '@src/utils/utilTypes';
import { Drawer } from 'antd';
import React, {
  ComponentType,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useState,
} from 'react';

export const AddDrawer: <T extends { onClose: () => void }>(
  props: PropsWithChildren<
    {
      title?: ReactNode;
      onClose?: () => void;
      Content: ComponentType<T>;
    } & Omit<T, 'onClose'>
  >,
) => ReactElement = props => {
  const { title, children, onClose, Content, ...restProps } = props;
  const [open, setOpen] = useState(false);
  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <>
      <Drawer
        title={title}
        open={open}
        onClose={handleClose}
        destroyOnClose
        width={688}
        closable={false}
      >
        <Content
          {...({
            ...restProps,
            onClose: handleClose,
          } as unknown as GetComponentProps<typeof Content>)}
        />
      </Drawer>
      {React.isValidElement(children) &&
        React.cloneElement(children as ReactElement, {
          onClick: handleClick,
        })}
    </>
  );
};
