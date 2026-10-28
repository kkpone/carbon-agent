import I18N from '@src/lang/I18N';
import { useMount } from 'ahooks';
import { Modal, ModalProps } from 'antd';
import { isEmpty, round } from 'lodash-es';
import { FC, useState } from 'react';

import { Toast } from '@/utils/Toast';
import { apiAddClew } from '@/views/system/login/service';

import backSvg from './back.svg';
import styles from './index.module.less';
import nextSvg from './next.svg';
import preSvg from './pre.svg';
import { DataMain, queryCcdbinfo, queryCcdbNext } from '../../service';
import { CollectCopy } from '../CollectCopy';
import { Feedback } from '../Feedback';

const SubmitInfo = async (FormInfo: any) => {
  await apiAddClew({
    ...FormInfo,
    phonenumber: (FormInfo.phonenumber as any).phone_number,
    sourceType: 'ccdb_getValue',
  });
};

interface IFullPageDetailProps extends ModalProps {
  searchParams: {
    searchId?: string;
    name: string;
    factorUnitM: string;
    countries: string;
    institution: string;
  };
  initFactorId: string;
  isCollectFactor?: boolean;
  hideNextPre?: boolean;
  searchId?: string;
}

export const FullPageDetail: FC<IFullPageDetailProps> = props => {
  const {
    open,
    onClose,
    searchParams,
    initFactorId,
    hideNextPre = false,
  } = props;

  const [factorId, setFactorId] = useState(initFactorId);
  const [factorInfo, setFactorInfo] = useState<DataMain>();

  useMount(async () => {
    const { data } = await queryCcdbinfo({
      id: initFactorId,
      searchId: searchParams.searchId,
    });
    setFactorInfo(data.data);
  });
  const query = async (searchNext: 'up' | 'down') => {
    const { data } = await queryCcdbNext({
      factorId,
      ...searchParams,
      searchNext, // up 上一条
    });
    if (isEmpty(data.data)) {
      Toast('info', I18N.ccdb.noMoreDataAvailable);
      return;
    }
    setFactorId(data.data.id);
    setFactorInfo(data.data);
  };
  return (
    <Modal
      destroyOnClose
      open={open}
      style={{ zIndex: 1055 }}
      wrapClassName={styles.wrap}
      className={styles.fullscreenModal}
      width='100%'
      title={undefined}
      footer={null}
      onCancel={e => {
        onClose?.(e);
      }}
    >
      <div className={styles.wrapper}>
        <div className={styles.header} onClick={e => onClose?.(e)}>
          <img src={backSvg} alt='' />
          <div className={styles.back}>{I18N.carbonFootprint.return}</div>
        </div>
        <div className={styles.contentWrapper}>
          <div className={styles.buttonWrapper}>
            {!hideNextPre && (
              <div className={styles.nextBtn} onClick={() => query('up')}>
                <img src={preSvg} alt='' />
              </div>
            )}
          </div>
          <div className={styles.content}>
            <div className={styles.line1}>
              <div className={styles.card1}>
                <div className={styles.title}>
                  {I18N.carbonFootprint3.factorInformation}
                </div>
                <div className={styles.card1Content}>
                  <div className={styles.nameWrapper}>
                    <div className={styles.name}>{factorInfo?.name}</div>
                    {factorInfo && <CollectCopy {...factorInfo} />}
                  </div>
                  <div className={styles.info}>
                    <span className={styles.cValue}>
                      {factorInfo?.productPermissions === '0' && (
                        <>
                          {factorInfo?.isEncryption === '0' && (
                            <div className={styles.cValue}>
                              {round(Number(factorInfo?.cValue), 6)}
                            </div>
                          )}
                          {factorInfo?.isEncryption !== '0' && (
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
                      {factorInfo?.productPermissions === '1' && (
                        <div className={styles.cValue}>
                          {round(Number(factorInfo?.cValue), 6)}
                        </div>
                      )}
                    </span>
                    <span className={styles.unit}>{factorInfo?.unit}</span>
                  </div>
                  <div className={styles.detail}>
                    <div className={styles.detailTitle}>
                      {I18N.carbonFootprint3.specificationAndModel}
                    </div>
                    <div className={styles.inner}>
                      {factorInfo?.specification || '-'}
                    </div>
                  </div>
                  <div className={styles.detail}>
                    <div className={styles.detailTitle}>
                      {I18N.components.applicableScenarios}
                    </div>
                    <div className={styles.inner}>
                      {factorInfo?.description || '-'}
                    </div>
                  </div>
                  <div className={styles.detail}>
                    <div className={styles.detailTitle}>
                      {I18N.carbonFootprint.applicableIndustries}
                    </div>
                    <div className={styles.inner}>
                      {factorInfo?.business || '-'}
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.card2}>
                <div className={styles.title}>
                  {I18N.components.sourceInformation}
                </div>
                <div className={styles.company}>
                  {factorInfo?.institution || '-'}
                </div>
                <div className={styles.card2detail}>
                  <span className={styles.card2detailLabel}>
                    {I18N.carbonFootprint.yearOfPublication}
                  </span>
                  <span className={styles.card2detailValue}>
                    {factorInfo?.year || '-'}
                  </span>
                </div>
                <div className={styles.card2detail}>
                  <span className={styles.card2detailLabel}>
                    {I18N.components.literatureType}
                  </span>
                  <span className={styles.card2detailValue}>
                    {factorInfo?.documentType || '-'}
                  </span>
                </div>
                <div className={styles.card2detail}>
                  <span className={styles.card2detailLabel}>
                    {I18N.ccdb.sourceAnalogy}
                  </span>
                  <span className={styles.card2detailValue}>
                    {factorInfo?.sourceLevel || '-'}
                  </span>
                </div>
                <div className={styles.card2detail}>
                  <span className={styles.card2detailLabel}>
                    {I18N.ccdb.nationalOrganization}
                  </span>
                  <span className={styles.card2detailValue}>
                    {factorInfo?.countries || '-'}
                  </span>
                </div>
                <div className={styles.card2detail}>
                  <span className={styles.card2detailLabel}>
                    {I18N.emission.sourceFiles}
                  </span>
                  <span className={styles.card2detailValue}>
                    {factorInfo?.source || '-'}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.card3}>
              <div className={styles.title}>
                {I18N.enterpriseCarbonAccount2.dataDetails}
              </div>
              <div className={styles.grid}>
                {factorInfo?.gasData?.map(item => (
                  <div className={styles.card} key={item.type}>
                    <div className={styles.cardTitle}>
                      {item.greenhouseGasesType}
                    </div>
                    <div>
                      <span className={styles.factorValue}>
                        {item.factorValue}
                      </span>
                      <span className={styles.factorUnitM}>
                        {item.factorUnit}/{item.factorUnitM}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.buttonWrapper}>
            {!hideNextPre && (
              <div className={styles.nextBtn} onClick={() => query('down')}>
                <img src={nextSvg} alt='' />
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
