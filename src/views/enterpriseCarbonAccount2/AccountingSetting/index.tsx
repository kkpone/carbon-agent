import I18N from '@src/lang/I18N';
import { Button, Modal, Select } from 'antd';
import classNames from 'classnames';
import moment from 'moment';
import { FC, useEffect, useState } from 'react';

import { checkPermissions } from '@/components/Permission/utils';
import { Toast } from '@/utils/Toast';

import {
  YEAR_TYPE,
  YEAR_TYPE_LABEL,
  MONTH_OPTION,
  ACCOUNT_WAY,
  ACCOUNT_WAYS,
} from './constant';
import styles from './index.module.less';
import { editAccountSetting, getAccountingSetting } from './service';

const { PREV_YEAR, CURR_YEAR, NEXT_YEAR } = YEAR_TYPE;
const { CALENDAR_YEAR, FINANCIAL_YEAR } = ACCOUNT_WAY;

const FinancialYearDescription = ({
  startTime,
  endTime,
}: {
  startTime: { startYearType: number; startMonth: number };
  endTime: { endYearType: number; endMonth: number };
}) => {
  const { startYearType, startMonth } = startTime;
  const { endMonth, endYearType } = endTime;

  const year = moment().format('YYYY');

  const startTimeStr = `${
    startYearType === PREV_YEAR ? Number(year) - 1 : year
  }.${startMonth < 10 ? `0${startMonth}` : startMonth}`;

  const endTimeStr = `${endYearType === NEXT_YEAR ? Number(year) + 1 : year}.${
    endMonth < 10 ? `0${endMonth}` : endMonth
  }`;

  return (
    <div className={styles.financialYearDescription}>
      FY{year.slice(2)}：{startTimeStr}～{endTimeStr}
    </div>
  );
};

const AccountingSetting: FC = () => {
  const [accountWay, setAccountWay] = useState(CALENDAR_YEAR);

  const [oriAccountWay, setOriAccountWay] = useState(CALENDAR_YEAR);

  const [startTime, setStartTime] = useState({
    startYearType: CURR_YEAR,
    startMonth: 1,
  });

  const [endTime, setEndTime] = useState({
    endYearType: CURR_YEAR,
    endMonth: 12,
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  const { startYearType, startMonth } = startTime;

  const { endYearType, endMonth } = endTime;

  const hasEditPermission = !!checkPermissions(
    true,
    'enterprise:FiscalYear:edit',
  );

  const onAccountWayChange = (newAccountWay: number) => {
    if (hasEditPermission && newAccountWay !== accountWay) {
      const isCalendar = newAccountWay === ACCOUNT_WAY.CALENDAR_YEAR;

      setAccountWay(newAccountWay);
      setStartTime({
        startYearType: CURR_YEAR,
        startMonth: isCalendar ? 1 : 2,
      });
      setEndTime({
        endYearType: isCalendar ? CURR_YEAR : NEXT_YEAR,
        endMonth: isCalendar ? 12 : 1,
      });
    }
  };

  const onStartYearTypeChange = (newStartYearType: number) => {
    const newStartMonth =
      newStartYearType === PREV_YEAR && startMonth === 1 ? 2 : startMonth;

    setStartTime({
      startYearType: newStartYearType,
      startMonth: newStartMonth,
    });

    setEndTime({
      endYearType: newStartMonth > 1 ? newStartYearType + 1 : newStartYearType,
      endMonth: newStartMonth > 1 ? (newStartMonth + 11) % 12 : 12,
    });
  };

  const onStartMonthChange = (newStartMonth: number) => {
    setStartTime({
      ...startTime,
      startMonth: newStartMonth,
    });

    setEndTime({
      endYearType: newStartMonth > 1 ? startYearType + 1 : startYearType,
      endMonth: newStartMonth > 1 ? (newStartMonth + 11) % 12 : 12,
    });
  };

  const queryAccountSetting = async () => {
    const { data } = await getAccountingSetting();
    const originSetting = data.data;
    setAccountWay(originSetting.accountWay);
    setOriAccountWay(originSetting.accountWay);
    setStartTime({
      startYearType: originSetting.startYearType,
      startMonth: originSetting.startMonth,
    });
    setEndTime({
      endYearType: originSetting.endYearType,
      endMonth: originSetting.endMonth,
    });
  };

  const submit = () => {
    Modal.confirm({
      width: 480,
      title: (
        <div className={styles.changeAccountWayTitle}>
          {I18N.enterpriseCarbonAccount2.confirmToModify}
        </div>
      ),
      content: (
        <div className={styles.changeAccountWayTip}>
          <span>{I18N.enterpriseCarbonAccount2.reviseDisclosureYear2}</span>
          <span className={styles.warnTip}>
            {I18N.enterpriseCarbonAccount2.andItWillBeCleared}
          </span>
          <span> {I18N.enterpriseCarbonAccount2.pleaseConfirmIf2}</span>
        </div>
      ),
      onOk: async () => {
        try {
          setSubmitLoading(true);
          await editAccountSetting({
            accountWay,
            startYearType,
            startMonth,
            endYearType,
            endMonth,
          });
          Toast('success', I18N.carbonFootprint.operationSuccessful);
        } finally {
          setSubmitLoading(false);
        }
      },
    });
  };

  useEffect(() => {
    queryAccountSetting();
  }, []);

  return (
    <div className={styles.accountingSetting}>
      <div className={styles.accountingSettingHeader}>
        <div className={styles.title}>
          {I18N.enterpriseCarbonAccount2.accountingSettings}
        </div>
      </div>
      <div className={styles.accountWay}>
        <div className={styles.label}>
          <span className={styles.requiredMark}>*</span>
          <span>{I18N.enterpriseCarbonAccount2.disclosureYearMethod}</span>
        </div>
        <div className={styles.accountWayContent}>
          {ACCOUNT_WAYS.map(({ value, name, desc }) => (
            <div
              className={classNames(styles.accountWayCard, {
                [styles.selectedAccountWayCard]: value === accountWay,
                [styles.usingAccountWayCard]: value === oriAccountWay,
                [styles.disabledAccountWayCard]: !hasEditPermission,
              })}
              onClick={() => onAccountWayChange(value)}
            >
              <div className={styles.accountWayHeader}>
                <div className={styles.accountWayName}>{name}</div>
                {value === oriAccountWay && (
                  <div className={styles.usingTip}>
                    {I18N.enterpriseCarbonAccount2.currentlyInUse}
                  </div>
                )}
              </div>
              <div className={styles.accountWayDesc}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.accountTime}>
        <div className={styles.label}>
          <span className={styles.requiredMark}>*</span>
          <span>{I18N.enterpriseCarbonAccount2.timeFrame}</span>
        </div>
        <div className={styles.accountTimeContent}>
          <div>
            <Select
              className={styles.yearSelect}
              value={startYearType}
              disabled={!hasEditPermission || accountWay === CALENDAR_YEAR}
              options={[
                { value: PREV_YEAR, label: YEAR_TYPE_LABEL[PREV_YEAR] },
                { value: CURR_YEAR, label: YEAR_TYPE_LABEL[CURR_YEAR] },
              ]}
              onChange={onStartYearTypeChange}
            />
            <Select
              className={styles.monthSelect}
              value={startMonth}
              disabled={!hasEditPermission || accountWay === CALENDAR_YEAR}
              options={MONTH_OPTION.map(({ value, label }) => ({
                value,
                label,
                disabled: value === 1,
              }))}
              onChange={onStartMonthChange}
            />
          </div>
          <div>
            <Select
              className={styles.yearSelect}
              value={endYearType}
              options={[
                { value: CURR_YEAR, label: YEAR_TYPE_LABEL[CURR_YEAR] },
                { value: NEXT_YEAR, label: YEAR_TYPE_LABEL[NEXT_YEAR] },
              ]}
              disabled
            />
            <Select
              className={styles.monthSelect}
              value={endMonth}
              options={MONTH_OPTION}
              disabled
            />
          </div>
        </div>
        {accountWay === FINANCIAL_YEAR && (
          <FinancialYearDescription startTime={startTime} endTime={endTime} />
        )}
      </div>
      <div className={styles.accountBottom}>
        {hasEditPermission && (
          <Button
            type='primary'
            className={styles.submitBtn}
            loading={submitLoading}
            onClick={submit}
          >
            {I18N.carbonFootprint3.confirmSwitch}
          </Button>
        )}
        <div className={styles.submitTip}>
          {I18N.enterpriseCarbonAccount2.reviseDisclosureYear}
        </div>
      </div>
    </div>
  );
};

export default AccountingSetting;
