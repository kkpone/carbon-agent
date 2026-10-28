import { FC } from 'react';
import AccountingList from '../AccountingList';
import { FullscreenModal } from '@/components/FullscreenModal';

export interface IAccountingListShareProps {}

export const AccountingListShare: FC<IAccountingListShareProps> = () => (
  <FullscreenModal open>
    <div
      style={{
        height: '100vh',
        backgroundColor: '#f7f8f9',
        // overflowY: 'scroll'
      }}
    >
      <AccountingList isShare />
    </div>
  </FullscreenModal>
);

export default AccountingListShare;
