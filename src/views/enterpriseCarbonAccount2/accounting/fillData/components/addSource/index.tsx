import { PageInfoType } from '@src/router/type';
import AccountAddEmission from '@src/views/enterpriseCarbonAccount2/carbonDischarge/components/AccountAddEmission';
import { Drawer } from 'antd';
import { FC, useState } from 'react';

import styles from './index.module.less';
import { EVersionType } from '../../service';

type AddSourceProps = {
  computationId: string;
  computationPeriod?: string;
  title?: string;
  id?: string;
  pageInfoType?: PageInfoType;
  addSuccess?: () => void;
  dictSourceId?: string;
  modelId?: string;
  readPretty?: boolean;
  fromSource?: 'model' | 'accounting';
  initGhgCategory?: string;
  initGhgClassify?: string;
  stopPropagation?: boolean;
  children: React.ReactNode;
  isShare?: boolean;
  isTemp?: boolean;
  groupId?: number;
  versionType?: EVersionType;
  agentPreviewLayout?: boolean;
  sessionId?: string;
  shareId?: string;
  enableProductFootprintAssociation?: boolean;
};

export const AddSource: FC<AddSourceProps> = props => {
  const {
    children,
    title,
    stopPropagation = true,
    addSuccess,
    ...otherProps
  } = props;
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Drawer
        title={title}
        open={visible}
        closeIcon={null}
        width={688}
        onClose={() => setVisible(false)}
        destroyOnClose
        rootClassName={styles.drawer}
      >
        <AccountAddEmission
          {...otherProps}
          hide={() => setVisible(false)}
          addSuccess={() => {
            setVisible(false);
            addSuccess?.();
          }}
        />
      </Drawer>
      <div
        onClick={e => {
          if (stopPropagation) {
            e.stopPropagation();
          }
          setVisible(true);
        }}
      >
        {children}
      </div>
    </>
  );
};
