import I18N from '@src/lang/I18N';
import { Tooltip } from 'antd';
import copyToClipboard from 'copy-to-clipboard';
import { FC, useState } from 'react';

import { Toast } from '@/utils/Toast';

import collectSvg from './collect.svg';
import collectedSvg from './collected.svg';
import copySvg from './copy.svg';
import styles from './index.module.less';
import { addCcdbCollect, IRecommendInfo } from '../../service';

interface ICollectCopyProps extends IRecommendInfo {
  refresh?: () => void;
}

export const CollectCopy: FC<ICollectCopyProps> = props => {
  const { name, isCollectFactor = '0', unit, cValue, refresh } = props;

  const [collected, setCollected] = useState(isCollectFactor);
  const collect = async (id: string) => {
    setCollected(pre => (pre === '0' ? '1' : '0'));
    await addCcdbCollect({ factorId: id });
    refresh?.();
  };
  return (
    <div className={styles.nameWrapper}>
      <Tooltip
        placement='top'
        title={
          collected === '0'
            ? I18N.carbonFootprint.collection
            : I18N.carbonFootprint.cancelFavorite
        }
      >
        <div
          onClick={e => {
            Toast(
              'success',
              collected === '0'
                ? I18N.ccdb.collectionSuccessful
                : I18N.ccdb.cancelBookmarking,
            );
            collect(props.id);
            e.preventDefault();
            e.stopPropagation();
          }}
          className={styles.imgWrapper}
        >
          <img
            className={styles.operation}
            src={collected === '0' ? collectSvg : collectedSvg}
            alt=''
          />
        </div>
      </Tooltip>

      <Tooltip placement='top' title={I18N.ccdb.numberOfReplicationFactors}>
        <div
          className={styles.imgWrapper}
          onClick={e => {
            const copySuccess = copyToClipboard(`${name}: ${cValue}${unit}`);
            if (copySuccess) {
              Toast('success', I18N.carbonFootprint3.copySuccessful);
            } else {
              Toast('error', I18N.dashborad.copyFailed);
            }
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <img className={styles.operation} src={copySvg} alt='' />
        </div>
      </Tooltip>
    </div>
  );
};
