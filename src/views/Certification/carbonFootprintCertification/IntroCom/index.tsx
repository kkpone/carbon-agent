import I18N from '@src/lang/I18N';
import IconFont from '@src/components/iconfont';
import React from 'react';

import style from './index.module.less';
import Division from '../component/Division';

interface IntroComProps {
  introTitle?: string;
  introBgUrl?: string;
  introImage?: string;
  contentNode: React.ReactNode;
  serviceTitle?: string;
  serviceList?: {
    name: 'string';
    url: 'string';
  }[];
}

export const IntroCom: React.FC<IntroComProps> = props => {
  const {
    introTitle = I18N.Certification.carbonFootprintVerification4,
    introImage = `https://oss-saas.carbonstop.net/saas-authentication/icon-certification.png`,
    introBgUrl = 'https://oss-saas.carbonstop.net/saas-authentication/light-blue-bg.jpg',
    contentNode,
    serviceTitle = I18N.carbonNeutral.serviceProcess,
    serviceList = [
      {
        name: I18N.Certification.applyingForServices,
        url: 'icon-icon-shenqingfuwu',
      },
      {
        name: I18N.Certification.submitMaterials,
        url: 'icon-icon-shijiaocailiao',
      },
      {
        name: I18N.Certification.verificationStage,
        url: 'icon-icon-hezhajieduan',
      },
      {
        name: I18N.Certification.verificationCompleted,
        url: 'icon-icon-hezhawancheng',
      },
    ],
  } = props;

  return (
    <div className={style.introCom}>
      <div className={style.introBox}>
        <div
          className={style.introTop}
          style={{
            backgroundImage: `url(${introBgUrl})`,
          }}
        >
          <img
            src={introImage}
            alt={I18N.carbonAccount.picture}
            className={style.introImage}
          />
          <div className={style.introTitle}>{introTitle}</div>
        </div>

        <div className={style.content}>{contentNode}</div>
      </div>

      <Division />

      <div className={style.serviece}>
        <div className={style.serviceTitle}>{serviceTitle}</div>
        <div className={style.servieceList}>
          {serviceList?.map?.((sl, i) => {
            const { url, name } = sl;

            const showArrow = i !== serviceList.length - 1;

            return (
              <div className={style.serviceItem}>
                <div className={style.textWrap}>
                  <IconFont type={url} className={style.icon} />

                  {/* TODO */}
                  <span className={style.text}>{name}</span>
                </div>

                {showArrow && (
                  <IconFont
                    type='icon-icon-jiantou-3'
                    className={style.arrow}
                    style={{
                      fontSize: '50px',
                      color: '#CCCCCC',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
