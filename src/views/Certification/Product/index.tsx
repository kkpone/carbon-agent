import IconFont from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { Button } from 'antd';
import { useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { Enterprise_verification_index } from './indesjson';
import style from './index.module.scss';
// 此页面代码为产品碳足迹、企业碳核查产品介绍页通用
const CertificationProductIndex = () => {
  const history = useHistory();
  const Service_list = useMemo(
    () =>
      // 根据不同的路由来判断展示的内容是什么
      Enterprise_verification_index(history.location.pathname),
    [history.location.pathname],
  );
  return (
    <div className={style.ProductIndex}>
      <div className={style.nav}>
        <div
          className={
            Service_list.title ===
            I18N.Certification.enterpriseCarbonVerification
              ? style.bg
              : style.productBg
          }
        />
        <div className={style.nav_con}>
          <div>
            {/* 产品介绍页title部分的背景图 */}
            <img
              alt=''
              src={Service_list.left_icon}
              className={
                Service_list.title ===
                I18N.Certification.enterpriseCarbonVerification
                  ? `${style.bg_icon}`
                  : `${style.bg_icon} ${style.bg_icon_product}`
              }
            />
          </div>
          {/* 产品介绍页的title文字 */}
          <div className={style.title}>
            {/* 主标题 */}
            <div className={style.title_text}>{Service_list.title}</div>
            {/* 副标题 */}
            <div className={style.title_con}>{Service_list.Subtitle}</div>
          </div>
        </div>
      </div>
      {/* 产品规格内容列表 */}
      <div className={style.titleNav}>
        {I18N.Certification.productSpecifications}
      </div>
      <div className={style.ProductList}>
        {/* 根据上方不同路由筛选出来的列表 */}
        {Service_list.Specifications.map(item => (
          <div className={style.ProductList_col}>
            {/* 产品规格标题 */}
            <div className={style.ProductList_col_title}>{item.title}</div>
            {/* 产品规格副标题 */}
            <div className={style.ProductList_col_text}>{item.text}</div>
            <div className={style.ProductList_col_detail}>
              <div className={style.ProductList_col_detail_list}>
                <IconFont
                  type='icon-icon-feishoucihezha'
                  className={style.ProductList_col_detail_list_icon}
                />
                <span>{item.isfirst}</span>
              </div>
              <div className={style.ProductList_col_detail_list_color}>
                {item.firsttext}
              </div>
            </div>
            <div className={style.ProductList_col_detail_detail}>
              {/* 产品规格灰色部分具体的列表内容 */}
              {item.list.map(atem => (
                <div className={style.ProductList_col_detail_detail_list}>
                  <span
                    className={style.ProductList_col_detail_detail_list_name}
                  >
                    {atem.name}
                  </span>
                  <span
                    className={style.ProductList_col_detail_detail_list_text}
                  >
                    {atem.value}
                  </span>
                </div>
              ))}
            </div>
            {/* 产品规格价格 */}
            <div className={style.ProductList_col_detail_detail_list_dollar}>
              <span
                className={style.ProductList_col_detail_detail_list_dollarColor}
              >
                {item.price}
              </span>
              {item.unit}
            </div>
            {/* 产品规格-立即申请按钮 */}
            <div
              className={style.ProductList_col_sub}
              onClick={() => {
                localStorage.setItem('initSelect', JSON.stringify(item.json));
                history.push(Service_list.url);
              }}
            >
              {I18N.Certification.applyNow}
            </div>
          </div>
        ))}
      </div>
      {/* 自定义规格按钮 */}
      <div className={style.custom}>
        <Button
          type='primary'
          className={style.customBtn}
          onClick={() => {
            localStorage.setItem(
              'initSelect',
              JSON.stringify(Service_list.Specifications[0].json),
            );
            history.push(Service_list.url);
          }}
        >
          {I18N.Certification.customSpecifications2}
        </Button>
      </div>
      {/* 间隔线 */}
      <div className={style.line} />
      <div className={style.titleNav}>{I18N.carbonNeutral.serviceProcess}</div>
      {/* 服务流程进度图 */}
      <div className={style.serve}>
        {Service_list.step.map(item => (
          <IconFont
            type={item.icon}
            className={item.title !== '' ? style.serveright : ''}
            style={{
              fontSize: item.icon !== 'icon-icon-jiantou-3' ? '160px' : '50px',
              color: item.icon !== 'icon-icon-jiantou-3' ? '' : '#CCCCCC',
            }}
          />
        ))}
      </div>
    </div>
  );
};
export default CertificationProductIndex;
