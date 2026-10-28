/**
 * 碳账户-首页欢迎页
 * @returns
 */
import IconFont from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { Tabs, Image } from 'antd';
import { useState } from 'react';

import './index.less';
import CarbonAccountNoOrder from './noOrder';
import { CarbonAccountHomeTabs } from './type';

const carbonAccountC1 = `${process.env.REACT_APP_API_URL_OSS}/saas-product/carbonDataC1.svg`;
const carbonAccountT1 = `${process.env.REACT_APP_API_URL_OSS}/saas-product/carbonData_1.svg`;
const carbonAccountT2 = `${process.env.REACT_APP_API_URL_OSS}/saas-product/carbonData_2.svg`;
const carbonAccountT3 = `${process.env.REACT_APP_API_URL_OSS}/saas-product/carbonData_3.svg`;

const { TabPane } = Tabs;
const CarbonDatatHome = (props: { noOrder: boolean }) => {
  const { noOrder } = props;
  const [tabActive, setTabActive] = useState<string>('1');
  const tabs: CarbonAccountHomeTabs[] = [
    {
      label: I18N.notOrder.dataAnalysis,
      cont: I18N.notOrder.visualKanban,
      imgPath: carbonAccountT1,
      value: '1',
    },
    {
      label: I18N.notOrder.processManagement,
      cont: I18N.notOrder.pdcaModule,
      imgPath: carbonAccountT2,
      value: '2',
    },
    {
      label: I18N.notOrder.dataReview,
      cont: I18N.notOrder.auditArchivingHigh,
      imgPath: carbonAccountT3,
      value: '3',
    },
  ];
  const changeTabActive = (activeKey: string) => {
    setTabActive(activeKey);
  };
  /** 初始化-生成秘钥 */
  // const init = async () => {
  //   !noOrder && (await carbonAccountHomeInit());
  // };
  // useEffect(() => {
  //   init();
  // }, []);
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
                {I18N.carbonDataManagemen.carbonData}
              </div>
              <div className='homeTitleTextDetail mt20'>
                {I18N.notOrder.includingDataPoints}
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
          <div className='tabTitle' style={{ marginBottom: '28px' }}>
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
                      src={item.imgPath}
                      style={{ marginBottom: '40px' }}
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

export default CarbonDatatHome;
