import { EcoinventGeographyContext } from '@/components/SearchFactor/ModalFactor/ecoinventContext';
import { Drawer } from 'antd';

import { PageInfoType } from '@/router/type';
import type { EVersionType } from '@/views/enterpriseCarbonAccount2/accounting/fillData/service';
import AccountAddEmission from '@/views/enterpriseCarbonAccount2/carbonDischarge/components/AccountAddEmission';

import styles from './index.module.less';

export type AccountAddEmissionDrawerProps = {
  addSuccess?: () => void;
  agentPreviewLayout?: boolean;
  computationId: string;
  computationPeriod?: string;
  dictSourceId?: string;
  enableProductFootprintAssociation?: boolean;
  fromSource?: 'model' | 'accounting';
  groupId?: number;
  id?: string;
  initGhgCategory?: string;
  initGhgClassify?: string;
  isShare?: boolean;
  isTemp?: boolean;
  modelId?: string;
  onClose: () => void;
  open: boolean;
  pageInfoType?: PageInfoType;
  readPretty?: boolean;
  sessionId?: string;
  shareId?: string;
  title?: string;
  versionType?: EVersionType;
};

const AccountAddEmissionDrawer = ({
  addSuccess,
  onClose,
  open,
  title,
  ...otherProps
}: AccountAddEmissionDrawerProps) => (
  <Drawer
    title={title}
    open={open}
    closeIcon={null}
    width={688}
    onClose={onClose}
    destroyOnClose
    rootClassName={styles.emissionDrawer}
  >
    <EcoinventGeographyContext.Provider value={!!otherProps.agentPreviewLayout}>
      <AccountAddEmission
        {...otherProps}
        hide={onClose}
        addSuccess={() => {
          onClose();
          addSuccess?.();
        }}
      />
    </EcoinventGeographyContext.Provider>
  </Drawer>
);

export default AccountAddEmissionDrawer;
