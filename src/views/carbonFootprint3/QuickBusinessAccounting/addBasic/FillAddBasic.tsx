import { Modal } from 'antd';

import '../../ProcessBusinessAccounting/index.less';
import QuickBusinessAccountingBasic from '.';

const QuickBusinessAccountingFillAddBasic = () => (
  <Modal
    destroyOnClose
    open
    className='businessAccountingFillModal'
    width='100%'
    title={undefined}
    footer={null}
    closable={false}
    transitionName=''
  >
    <QuickBusinessAccountingBasic />
  </Modal>
);

export default QuickBusinessAccountingFillAddBasic;
