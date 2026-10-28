import I18N, { LocaleType } from '@src/lang/I18N';
import { FC, useContext, useEffect, useMemo, useState } from 'react';
import styles from './index.module.less';
import { Province, ProvinceLevel, GreenEnergyPolicy } from './type';
import {
  getProvinceList,
  getProvinceLevel,
  getGreenEnergyPolicy,
} from './service';
import { SearchOutlined } from '@ant-design/icons';
import { Cascader, Modal, Popover } from 'antd';
import Map from './Map/Map';
import { LEVEL, LEVEL_TEXT_COLOR } from './constant';
import DOMPurify from 'dompurify';
import qrCodeImg from '@assets/svg/service_qr_code.png';
import { LocaleContext } from '@/components/LocaleProvider';

const GreenEnergy: FC = () => {
  const [provinceList, setProvinceList] = useState<Province[]>([]);
  const [provinceLevelList, setProvinceLevelList] = useState<ProvinceLevel[]>(
    [],
  );
  const [selectedProvince, setSelectedProvince] = useState<Province[]>([]);
  const [policyList, setPolicyList] = useState<GreenEnergyPolicy[]>([]);
  const [policyHtmlContent, setPolicyHtmlContent] = useState('');

  const levelDesc = {
    [LEVEL.UNKNOWN]: I18N.carbonNeutral.unknown,
    [LEVEL.LOW]: I18N.carbonNeutral.low,
    [LEVEL.LOWER]: I18N.carbonNeutral.lower,
    [LEVEL.MEDIUM]: I18N.carbonNeutral.average,
    [LEVEL.HIGHER]: I18N.carbonNeutral.higher,
    [LEVEL.HIGH]: I18N.carbonNeutral.high,
  };

  const ratioDesc = {
    [LEVEL.LOW]: I18N.carbonNeutral.LowTip,
    [LEVEL.LOWER]: I18N.carbonNeutral.LowerTip,
    [LEVEL.MEDIUM]: I18N.carbonNeutral.MediumTip,
    [LEVEL.HIGHER]: I18N.carbonNeutral.HigherTip,
    [LEVEL.HIGH]: I18N.carbonNeutral.HighTip,
  };
  const currProvince = useMemo(() => {
    if (selectedProvince.length === 0) {
      return null;
    }

    const level = provinceLevelList.find(
      p => p.areaCode === selectedProvince[0].code,
    )?.level;
    return {
      ...selectedProvince[0],
      level,
    };
  }, [provinceLevelList, selectedProvince]);

  const { locale } = useContext(LocaleContext);

  const onMapClick = (areaCode: number) => {
    if (
      selectedProvince.length === 1 &&
      areaCode === selectedProvince[0].code
    ) {
      return;
    }

    const clickProvince = provinceList.find(p => p.code === areaCode);
    if (clickProvince) {
      setSelectedProvince([clickProvince]);
    }
  };

  useEffect(() => {
    getProvinceList({ level: 2 }).then(({ data }) => {
      setProvinceList(data.data.slice(0, -1));
    });

    getProvinceLevel().then(({ data }) => {
      setProvinceLevelList(data.data);
    });
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    getGreenEnergyPolicy(
      {
        areaCode: selectedProvince.map(p => p.code).join(','),
        pageNum: 1,
        pageSize: 50,
        status: 1,
      },
      abortController.signal,
    ).then(({ data }) => {
      setPolicyList(data.data.rows);
    });

    return () => abortController.abort();
  }, [selectedProvince]);
  return (
    <div className={styles.greenMap}>
      <Modal
        width={800}
        open={!!policyHtmlContent}
        closable
        destroyOnClose
        maskClosable
        footer={null}
        title=' '
        onCancel={() => setPolicyHtmlContent('')}
      >
        <div
          style={{ maxHeight: '60vh', overflowY: 'auto' }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(policyHtmlContent),
          }}
        />
      </Modal>
      <div className={styles.greenMapLeft}>
        <div>
          {!currProvince ? (
            <>
              {/* <div className={styles.secondaryTitle}>
                {I18N.carbonNeutral.visualizeYour}
              </div> */}
              <div className={styles.titleDesc}>
                {I18N.carbonNeutral.facingComplexChallenges}
              </div>
            </>
          ) : (
            <>
              <div className={styles.secondaryTitle}>{currProvince.name}</div>
              <div className={styles.ratio}>
                <div className={styles.ratioLevel}>
                  <div>
                    {I18N.carbonNeutral.greenElectricityCostEffectiveness}
                  </div>
                  <div
                    className={styles.ratioLevelValue}
                    style={{
                      color:
                        LEVEL_TEXT_COLOR[currProvince.level || LEVEL.UNKNOWN],
                    }}
                  >
                    {levelDesc[currProvince.level || LEVEL.UNKNOWN]}
                  </div>
                </div>
                <div className={styles.ratioDesc}>
                  {ratioDesc[currProvince.level || LEVEL.UNKNOWN]}
                </div>
              </div>
            </>
          )}
          <Popover
            content={<img src={qrCodeImg} style={{ width: '140px' }} alt='' />}
          >
            <div className={styles.contactBtn}>
              {I18N.carbonNeutral.consultImmediately}
            </div>
          </Popover>
        </div>
        <div className={styles.policyList}>
          {policyList.map(policy => (
            <div key={policy.id} className={styles.policyItem}>
              <div className={styles.policyHeader}>
                <div className={styles.policyArea}>
                  {policy.area1 && (
                    <div className={styles.areaTag}>{policy.area1}</div>
                  )}
                  {policy.area2 && (
                    <div className={styles.areaTag}>{policy.area2}</div>
                  )}
                </div>
                {policy.htmlContent && (
                  <svg
                    className={styles.downloadIcon}
                    xmlns='http://www.w3.org/2000/svg'
                    width='15'
                    height='12'
                    viewBox='0 0 15 12'
                    fill='none'
                    onClick={() => {
                      setPolicyHtmlContent(policy.htmlContent);
                    }}
                  >
                    <path
                      d='M0.75 4.77295C0.335786 4.77295 0 5.10874 0 5.52295C0 5.93716 0.335786 6.27295 0.75 6.27295V5.52295V4.77295ZM14.2803 6.05328C14.5732 5.76039 14.5732 5.28551 14.2803 4.99262L9.50736 0.219648C9.21447 -0.073245 8.73959 -0.073245 8.4467 0.219648C8.15381 0.512542 8.15381 0.987415 8.4467 1.28031L12.6893 5.52295L8.4467 9.76559C8.15381 10.0585 8.15381 10.5334 8.4467 10.8263C8.73959 11.1191 9.21447 11.1191 9.50736 10.8263L14.2803 6.05328ZM0.75 5.52295V6.27295H13.75V5.52295V4.77295H0.75V5.52295Z'
                      fill='#0CBF9F'
                    />
                  </svg>
                )}
              </div>
              <div className={styles.policyContent} title={policy.content}>
                {policy.content}
              </div>
              <div className={styles.publishInfoContent}>
                <div className={styles.publishInfo}>
                  {I18N.carbonNeutral.issuingAuthority}
                  {policy.publishBy || '-'}
                </div>
                <div className={styles.publishInfo}>
                  {I18N.carbonNeutral.releaseTime}
                  {policy.publishTime || '-'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.greenMapRight}>
        <Cascader
          className={styles.cascader}
          prefix={<SearchOutlined className={styles.searchIcon} />}
          placeholder={I18N.carbonNeutral.enterOrClick}
          suffixIcon={null}
          value={selectedProvince.map(p => p.code)}
          showSearch
          options={provinceList}
          changeOnSelect
          fieldNames={{ label: 'name', value: 'code' }}
          onChange={(_, pList) =>
            setSelectedProvince((pList || []) as unknown as Province[])
          }
        />
        <Map provinceLevelList={provinceLevelList} onMapClick={onMapClick} />
        <div>
          <div className={styles.colorBarContent}>
            <div>{I18N.carbonNeutral.low}</div>
            <div className={styles.colorBar} />
            <div>{I18N.carbonNeutral.high}</div>
          </div>
          {locale === LocaleType.zhCN ? (
            <div className={styles.greenElectricityDesc}>
              {I18N.carbonNeutral.theDarkerTheGreenTheBetter}；
              {I18N.carbonNeutral.theDarkerTheOrangeColorTheMorePronouncedItIs}
            </div>
          ) : (
            <div className={styles.greenElectricityDesc}>
              <div>{I18N.carbonNeutral.theDarkerTheGreenTheBetter}</div>
              <div>
                {
                  I18N.carbonNeutral
                    .theDarkerTheOrangeColorTheMorePronouncedItIs
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GreenEnergy;
