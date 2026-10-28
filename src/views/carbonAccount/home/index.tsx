/**
 * 碳账户-首页欢迎页
 * @returns
 */
import IconFont from '@src/components/iconfont';
import I18N, { LocaleType } from '@src/lang/I18N';
import { Tabs, Image } from 'antd';
import { useContext, useEffect, useState } from 'react';

import '../index.less';
import CarbonAccountNoOrder from './noOrder';
import { carbonAccountHomeInit } from './service';
import { CarbonAccountHomeTabs } from './type';
import { LocaleContext } from '@/components/LocaleProvider';

const carbonAccountC1 = `${process.env.REACT_APP_API_URL_OSS}/saas-product/carbonAccountHomeC1.svg`;

const { TabPane } = Tabs;

const CarbonAccountHome = (props: { noOrder: boolean }) => {
  const { noOrder } = props;
  const [tabActive, setTabActive] = useState<string>('1');

  const getPath = (fileName: string) =>
    `${process.env.REACT_APP_API_URL_OSS}/saas-product/CarbonAccount/homepage/${fileName}.png`;

  const tabs: CarbonAccountHomeTabs[] = [
    {
      label: I18N.enterpriseCarbonAccount2.emissionReductionScenarios,
      cont: I18N.carbonAccount.provideMultipleReductions,
      imgPath: getPath('0'),
      enImgPath: getPath('0-en'),
      value: '1',
    },
    {
      label: I18N.carbonAccount.professionalComputing,
      cont: I18N.carbonAccount.provideProfessionalPlans,
      imgPath: getPath('1'),
      enImgPath: getPath('1-en'),
      value: '2',
    },
    {
      label: I18N.carbonAccount.flexibleConfiguration,
      cont: I18N.carbonAccount.supportSaa,
      imgPath: getPath('2'),
      enImgPath: getPath('2-en'),
      value: '3',
    },
  ];
  const changeTabActive = (activeKey: string) => {
    setTabActive(activeKey);
  };
  /** 初始化-生成秘钥 */
  const init = async () => {
    !noOrder && (await carbonAccountHomeInit());
  };
  useEffect(() => {
    init();
  }, []);

  const { locale } = useContext(LocaleContext);

  const isEn = locale === LocaleType.enUS;

  return (
    <div
      style={{ padding: '0 20px 0 0', marginBottom: 40 }}
      className='carbonAccount'
    >
      <div className='home'>
        <div className='homeTitle'>
          <div className='homeTitleMain'>
            <div style={{ paddingTop: 40 }}>
              <div className='homeTitleText'>
                {I18N.carbonAccount.carbonAccount}
              </div>
              <div className='homeTitleTextDetail mt20'>
                {I18N.carbonAccount.carbonAccountWithCarbon}
              </div>
            </div>
            <div className='homeTitleIllustration'>
              <img src={carbonAccountC1} alt='' />
            </div>
          </div>
        </div>

        {noOrder && (
          <div>
            <CarbonAccountNoOrder />
          </div>
        )}

        <div className='homeTab'>
          <div className='tabTitle'>
            {I18N.carbonFootprint.functionIntroduction}
          </div>
          <div className='tabMain'>
            <Tabs activeKey={tabActive} onChange={changeTabActive}>
              {tabs.map((item: CarbonAccountHomeTabs) => (
                <TabPane tab={item.label} key={item.value}>
                  <div className='tabMainItem'>
                    <div style={{ margin: '20px 0' }}>{item.cont}</div>
                    <Image
                      height={380}
                      preview={false}
                      src={isEn ? item.enImgPath : item.imgPath}
                    />
                  </div>
                </TabPane>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
      <div
        style={{
          color: '#6C757D',
          position: 'absolute',
          height: 60,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#F7F8F9',
        }}
      >
        <span>
          {I18N.carbonFootprint.customerConsultantConsultation}
          <IconFont
            style={{ margin: '0 10px 0 10px' }}
            type='icon-icon-dianhua'
          />
          010-50973498
        </span>
        <span style={{ marginLeft: 30 }}>
          <IconFont style={{ marginRight: 10 }} type='icon-icon-youxiang' />
          mail@carbonstop.com
        </span>
      </div>
    </div>
  );
};

export default CarbonAccountHome;
