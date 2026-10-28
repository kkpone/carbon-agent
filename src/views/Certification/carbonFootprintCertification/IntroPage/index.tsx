import I18N from '@src/lang/I18N';
import IconFont, { IconAlibaba } from '@src/components/iconfont';
import classNames from 'classnames';

import style from './index.module.less';
import { IntroCom } from '../IntroCom';

const IntroPage = () => (
  <IntroCom
    contentNode={
      <div className={style.introPageContentWrap}>
        <div className={style.introPageContent}>
          <IconAlibaba type='icon-zanwushuju' className={style.iconEmpty} />
          <div className={style.title}>
            {I18N.Certification.helloYouHaveNotYet}
          </div>
          <div className={style.subTItitle}>
            {I18N.Certification.inOrderToEnjoyItAll}
          </div>
          <div className={style.extra}>
            <span>{I18N.Certification.customerConsultantConsultation}</span>
            <div className={style.flex}>
              <div className={style.flex}>
                <IconFont type='icon-icon-dianhua' className={style.icon} />
                <span className={style.text}>010-50973498</span>
              </div>
              <div className={classNames(style.flex, style.marginl24)}>
                <IconFont type='icon-icon-youxiang' className={style.icon} />

                <span className={style.text}>mail@carbonstop.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  />
);

export default IntroPage;
