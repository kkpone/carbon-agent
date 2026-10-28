import { FormActions } from '@src/components/FormActions';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { Checkbox } from 'antd';
import { FC, useEffect, useState } from 'react';

import styles from './index.module.less';
import { editBtnSettings, getBtnSettings } from './request';

const ButtonSetting: FC = () => {
  const [btnSetting, setBtnSetting] = useState<Record<string, number>>({});

  const toggleBtnSetting = (key: string, val: boolean) => {
    setBtnSetting({
      ...btnSetting,
      carbonStore: key === 'store' && !val ? 0 : btnSetting.carbonStore,
      [key]: Number(val),
    });
  };

  useEffect(() => {
    getBtnSettings().then(({ data }) => {
      setBtnSetting(data.data);
    });
  }, []);

  return (
    <div>
      <div className={styles.title}>
        {I18N.carbonAccount.buttonConfiguration}
      </div>
      <div className={styles.buttonItem}>
        <Checkbox
          checked={!!btnSetting.strategy}
          onChange={e => {
            toggleBtnSetting('strategy', e.target.checked);
          }}
        >
          <span className={styles.buttonName}>
            {I18N.carbonAccount.strategyButton}
          </span>
        </Checkbox>
      </div>
      <div className={styles.buttonItem}>
        <Checkbox
          checked={!!btnSetting.shared}
          onChange={e => {
            toggleBtnSetting('shared', e.target.checked);
          }}
        >
          <span className={styles.buttonName}>
            {I18N.carbonAccount.shareButton}
          </span>
        </Checkbox>
      </div>
      <div className={styles.buttonGroup}>
        <div className={styles.buttonItem}>
          <Checkbox
            checked={!!btnSetting.store}
            onChange={e => {
              toggleBtnSetting('store', e.target.checked);
            }}
          >
            <span className={styles.buttonName}>
              {I18N.carbonAccount.mallButton}
            </span>
          </Checkbox>
        </div>
        <div className={styles.buttonItem}>
          <Checkbox
            disabled={!btnSetting.store}
            checked={!!btnSetting.carbonStore}
            onChange={e => {
              toggleBtnSetting('carbonStore', e.target.checked);
            }}
          >
            <span className={styles.buttonName}>
              {I18N.carbonAccount.lowCarbonShoppingMall}
            </span>
          </Checkbox>
        </div>
      </div>
      <div className={styles.buttonItem}>
        <Checkbox
          checked={!!btnSetting.achievement}
          onChange={e => {
            toggleBtnSetting('achievement', e.target.checked);
          }}
        >
          <span className={styles.buttonName}>
            {I18N.carbonAccount.achievementButton}
          </span>
        </Checkbox>
      </div>
      <div className={styles.buttonItem}>
        <Checkbox
          checked={!!btnSetting.rank}
          onChange={e => {
            toggleBtnSetting('rank', e.target.checked);
          }}
        >
          <span className={styles.buttonName}>
            {I18N.carbonAccount.rankingButton}
          </span>
        </Checkbox>
      </div>
      <div className={styles.buttonItem}>
        <Checkbox
          checked={!!btnSetting.homePage}
          onChange={e => {
            toggleBtnSetting('homePage', e.target.checked);
          }}
        >
          <span className={styles.buttonName}>
            {I18N.carbonAccount.saplings}
          </span>
        </Checkbox>
      </div>
      <div className={styles.buttonItem}>
        <Checkbox
          checked={!!btnSetting.punchCard}
          onChange={e => {
            toggleBtnSetting('punchCard', e.target.checked);
          }}
        >
          <span className={styles.buttonName}>
            {I18N.carbonAccount.checkIn}
          </span>
        </Checkbox>
      </div>
      <div className={styles.buttonItem}>
        <Checkbox
          checked={!!btnSetting.feedback}
          onChange={e => {
            toggleBtnSetting('feedback', e.target.checked);
          }}
        >
          <span className={styles.buttonName}>意见反馈</span>
        </Checkbox>
      </div>
      <FormActions
        place='center'
        buttons={[
          {
            title: I18N.carbonFootprint.confirm2,
            type: 'primary',
            onClick: async () => {
              await editBtnSettings(btnSetting);
              Toast('success', I18N.carbonFootprint.operationSuccessful);
              const { data } = await getBtnSettings();
              setBtnSetting(data.data);
            },
          },
          {
            title: I18N.carbonFootprint.cancel,
            onClick: async () => {
              history.go(-1);
            },
          },
        ]}
      />
    </div>
  );
};

export default ButtonSetting;
