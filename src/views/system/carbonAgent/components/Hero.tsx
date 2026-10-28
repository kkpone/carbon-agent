import { icons } from '../constants';
import style from '../index.module.less';
import I18N from '@src/lang/I18N';

const Hero = () => (
  <section className={style.hero}>
    <img className={style.aiIcon} src={icons.aiAssistant} alt='' />
    <div className={style.titleBlock}>
      <h1 className={style.title}>{I18N.carbonAgent.productCarbonFootprint}</h1>
      <p className={style.subtitle}>{I18N.carbonAgent.heroSubtitle}</p>
    </div>
  </section>
);

export default Hero;
