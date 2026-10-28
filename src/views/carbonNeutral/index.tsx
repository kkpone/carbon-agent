/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-08-31 21:24:01
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-07 14:33:59
 */
import I18N from '@src/lang/I18N';
import IconFont from '@src/components/iconfont';

// import { useHistory } from 'react-router-dom';
import './style.less';
import qrCodeImg from './qrCode_cj.png';

const ossPath = process.env.REACT_APP_API_URL_OSS;
// 此页面代码为产品碳足迹、企业碳核查产品介绍页通用
const CertificationProductIndex = () => {
  // const history = useHistory();
  const Service_list = {
    // bg: `${ossPath}/saas-authentication/bg.jpeg`,
    left_icon: `${ossPath}/saas-authentication/city.png`, // 右方iccon
    url: '/Certification/Enterprise/apply',
    addul: '/Certification/Enterprise/product/apply', // 自定义规格跳转路径
    title: I18N.carbonNeutral.carbonNeutralityServices, // 标题
    Subtitle: I18N.carbonNeutral.carbonNeutralityRefersTo, // 副标题
    step: [
      // 服务流程icon
      { srcPath: 'nature_1.png', title: '' },
      { icon: 'icon-icon-jiantou-3', title: 'row' },
      { srcPath: 'nature_2.png', title: '' },
      { icon: 'icon-icon-jiantou-3', title: 'row' },
      { srcPath: 'nature_3.png', title: '' },
      { icon: 'icon-icon-jiantou-3', title: 'row' },
      { srcPath: 'nature_4.png', title: '' },
    ],
  };
  return (
    <div className='ProductIndex'>
      <div className='nav'>
        <div
          className={
            Service_list.title === I18N.carbonNeutral.carbonNeutralityServices
              ? 'bg'
              : 'productBg'
          }
        />
        <div className='nav_con'>
          <div>
            {/* 产品介绍页title部分的背景图 */}
            <img
              src='https://carbonstop-saas.oss-cn-beijing.aliyuncs.com/saas-product/bg_carbonNeurtal_right.png'
              className={
                Service_list.title ===
                I18N.carbonNeutral.carbonNeutralityServices
                  ? `bg_icon`
                  : `bg_icon bg_icon_product`
              }
              alt=''
            />
          </div>
          {/* 产品介绍页的title文字 */}
          <div className='title'>
            {/* 主标题 */}
            <div className='title_text'>{Service_list.title}</div>
            {/* 副标题 */}
            <div className='title_con'>{Service_list.Subtitle}</div>
          </div>
        </div>
      </div>
      {/* 产品规格内容列表 */}
      <p className='car_text'>{I18N.carbonNeutral.carbonHindranceInCarbon}</p>
      <p className='car_text_other'>
        {I18N.carbonNeutral.commentSubmissionNote}
      </p>
      <img className='car_img' src={qrCodeImg} alt='' />
      <p className='car_text_img'>
        {I18N.carbonNeutral.ifYouHaveAnyQuestionsYouCan}
      </p>
      {/* 间隔线 */}
      <div className='line' />
      <div className='titleNav'>{I18N.carbonNeutral.serviceProcess}</div>
      {/* 服务流程进度图 */}
      <div className='serve'>
        {Service_list.step.map(item =>
          item.icon ? (
            <IconFont
              type={item.icon}
              className={item.title !== '' ? 'serveright' : ''}
              style={{
                fontSize:
                  item.icon !== 'icon-icon-jiantou-3' ? '160px' : '50px',
                color: item.icon !== 'icon-icon-jiantou-3' ? '' : '#CCCCCC',
              }}
            />
          ) : (
            <img
              style={{ width: 180, height: 180 }}
              // eslint-disable-next-line
              src={require(`./svg/${item.srcPath}`)}
              alt=''
            />
          ),
        )}
      </div>
    </div>
  );
};
export default CertificationProductIndex;
