import { LocaleContext } from '@src/components/LocaleProvider';
import { useContext } from 'react';
import I18N, { LocaleType } from 'src/lang/I18N';

import styles from './index.module.less';

export const Introduction = () => {
  const { locale } = useContext(LocaleContext);
  const imgMap = {
    [LocaleType.enUS]:
      'https://oss-saas.carbonstop.net/saas/dashborad/content-en.png',
    [LocaleType.zhCN]:
      'https://oss-saas.carbonstop.net/saas/dashborad/content.png',
  };

  return (
    <div className={styles.introWrapper}>
      <h2>{I18N.dashborad.whatIsAccounting}</h2>
      <ul>
        <li>{I18N.dashborad.accountingEntityRefersTo}</li>
        <li>{I18N.dashborad.eachAccountingMaster}</li>
        <li>{I18N.dashborad.ifASetNeedsToBeAligned}</li>
      </ul>
      <h2>{I18N.dashborad.whatIsGrouping}</h2>
      <ul>
        <li>{I18N.dashborad.groupingIsEitherOr}</li>
        <li>{I18N.dashborad.groupable}</li>
      </ul>
      <img className={styles.content} src={imgMap[locale]} alt='' />
      <h5>{I18N.dashborad.businessRules}</h5>
      <div>
        {I18N.dashborad.currentlyOnlyAccounting}
        <br />
        {I18N.dashborad.corporateCarbonEmissions}
      </div>
    </div>
  );
};
