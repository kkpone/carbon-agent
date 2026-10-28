import I18N from '@src/lang/I18N';
import { Tooltip } from 'antd';
import classNames from 'classnames';
import copyToClipboard from 'copy-to-clipboard';
import { round } from 'lodash-es';
import { FC, useState } from 'react';

import { Toast } from '@/utils/Toast';
import { apiAddClew } from '@/views/system/login/service';

import collectSvg from './collect.svg';
import collectedSvg from './collected.svg';
import copySvg from './copy.svg';
import factorPng from './factor.png';
import styles from './index.module.less';
import { addCcdbCollect, IRecommendInfo } from '../../service';
import { Feedback } from '../Feedback';
import { FullPageDetail } from '../FullPageDetail';

interface ICollectCardProps extends IRecommendInfo {
  run: () => void;
}

const SubmitInfo = async (FormInfo: any) => {
  await apiAddClew({
    ...FormInfo,
    phonenumber: (FormInfo.phonenumber as any).phone_number,
    sourceType: 'ccdb_getValue',
  });
};

export const CollectCard: FC<ICollectCardProps> = props => {
  const {
    name,
    institution,
    year,
    isCollectFactor,
    unit,
    cValue,
    run,
    productPermissions,
    isEncryption,
  } = props;

  const [collected, setCollected] = useState(isCollectFactor);
  const collect = (id: string) => {
    setCollected(pre => (pre === '0' ? '1' : '0'));
    addCcdbCollect({ factorId: id });
  };
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className={styles.card} onClick={() => setOpen(true)}>
        <div className={styles.header}>
          <img src={factorPng} alt='' className={styles.img} />
          <div className={styles.content}>
            <div className={styles.nameWrapper}>
              <span className={styles.name}>{name}</span>
              <Tooltip
                placement='top'
                title={
                  collected === '0'
                    ? I18N.carbonFootprint.collection
                    : I18N.carbonFootprint.cancelFavorite
                }
              >
                <span
                  className={styles.collectAndCopy}
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    Toast(
                      'success',
                      collected === '0'
                        ? I18N.ccdb.collectionSuccessful
                        : I18N.ccdb.cancelBookmarking,
                    );
                    collect(props.id);
                  }}
                >
                  <img
                    className={styles.operation}
                    src={collected === '0' ? collectSvg : collectedSvg}
                    alt=''
                  />
                </span>
              </Tooltip>
              <Tooltip
                placement='top'
                title={I18N.ccdb.numberOfReplicationFactors}
              >
                <span
                  className={classNames(styles.collectAndCopy, styles.copy)}
                  onClick={e => {
                    const copySuccess = copyToClipboard(
                      `${name}: ${cValue}${unit}`,
                    );
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
                </span>
              </Tooltip>
            </div>
            <div>
              <span className={styles.cValue}>
                {productPermissions === '0' && (
                  <>
                    {isEncryption === '0' && (
                      <span className={styles.cValue}>
                        {round(Number(cValue), 6)}
                      </span>
                    )}
                    {isEncryption !== '0' && (
                      <Feedback
                        title={I18N.carbonFootprint.welcomeToCooperate}
                        type='mark'
                        des={I18N.ccdb.leaveYourLetterBehind}
                        onSubmit={SubmitInfo}
                      >
                        <span className={styles.encryptionTip}>
                          {I18N.ccdb.encryptDataPoints}
                        </span>
                      </Feedback>
                    )}
                  </>
                )}
                {productPermissions === '1' && (
                  <span className={styles.cValue}>
                    {round(Number(cValue), 6)}
                  </span>
                )}
              </span>
              <span className={styles.unit}>{unit}</span>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.institution} title={institution || ''}>
            {institution}
          </div>
          <div className={styles.year}>
            {year}
            {I18N.DomesticVersion.year}
          </div>
        </div>
      </div>
      {open && (
        <FullPageDetail
          open={open}
          hideNextPre
          onClose={() => {
            setOpen(false);
            run();
          }}
          isCollectFactor
          initFactorId={props.id}
          searchParams={{
            name: '',
          }}
        />
      )}
    </>
  );
};
