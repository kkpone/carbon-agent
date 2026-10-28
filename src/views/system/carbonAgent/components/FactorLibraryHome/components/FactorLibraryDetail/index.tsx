import I18N from '@src/lang/I18N';
import { Drawer } from 'antd';
import { useMemo } from 'react';

import { useMobile } from '@/hooks/use-mobile';

import styles from './index.module.less';
import {
  createCcdbFactorShare,
  type CcdbFactorPreviewTarget,
} from '../../../../ccdbFactor';
import CcdbFactorDetailPane from '../../../CcdbFactorDetailPane';
import type { FactorLibraryItem } from '../../types';

interface Props {
  item: FactorLibraryItem;
  onClose: () => void;
}

export default function FactorLibraryDetail({ item, onClose }: Props) {
  const isMobile = useMobile();
  const target = useMemo<CcdbFactorPreviewTarget>(
    () => ({ factorId: String(item.factorId), entrySource: 'LIBRARY' }),
    [item.factorId],
  );
  return (
    <Drawer
      open
      onClose={onClose}
      width={isMobile ? '100%' : 560}
      closable={false}
      styles={{ body: { padding: 0 } }}
    >
      <div className={styles.body}>
        <CcdbFactorDetailPane
          open
          target={target}
          onClose={onClose}
          onShare={factorId =>
            createCcdbFactorShare(factorId).then(result => {
              if (!result.shareUrl) {
                throw new Error(I18N.ccdb.shareCreateFailed);
              }
              return result.shareUrl;
            })
          }
        />
      </div>
    </Drawer>
  );
}
