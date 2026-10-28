import { ReactElement } from 'react';

export type DrawerProductFooterProps = {
  isEdit?: boolean;
  extraBtn?: ReactElement | undefined;
  okText?: string;
  onSubClick: () => Promise<any>;
  onCancelClick: () => void;
};
