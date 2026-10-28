import { FC } from 'react';
import Accounting from '../accounting';

export interface IAccountingShareProps {}

export const AccountingShare: FC<IAccountingShareProps> = () => (
    <div>
      <Accounting isShare />
    </div>
  );

export default AccountingShare;
