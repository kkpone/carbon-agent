/**
 * @file Button
 */
import { Button as AntButton, ButtonProps as AntButtonProps } from 'antd';
import { useState } from 'react';

export type ButtonProps = {
  onClick?: (
    ev: React.MouseEvent<HTMLElement, MouseEvent>,
  ) => Promise<any> | void;
} & Omit<AntButtonProps, 'onClick'>;

export const Button = ({ onClick, ...props }: ButtonProps) => {
  const [loading, setLoading] = useState(false);
  const clickEvent: React.MouseEventHandler<HTMLElement> = async ev => {
    if (loading) return;
    setLoading(true);
    onClick?.(ev)?.finally(() => {
      setLoading(false);
    });
  };
  return <AntButton onClick={clickEvent} loading={loading} {...props} />;
};
