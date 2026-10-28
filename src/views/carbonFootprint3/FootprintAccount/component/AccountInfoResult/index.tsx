/**
 * 核算详情 - 碳足迹结果页
 */
import defaultImg from '@src/assets/svg/accountProductImg.svg';
import I18N from '@src/lang/I18N';
import { Image } from 'antd';
import classNames from 'classnames';
import { FC, memo } from 'react';

import co2CloudImg from '@/assets/images/carbonFootprint3/figma-agent-ui/co2-cloud.svg';

import { ProcessAccountResult } from './ProcessResult';
import { QucikAccountResult } from './QuickResult';
import style from './index.module.less';
import { AccountInfoResultProps } from './type';
import {
  ACCOUNT_SELECT_LIFE_CYCLE_LABEL,
  FootprintAccountLifeCycle,
  FootprintAccountStatusType,
} from '../../constant';

const { QUICK, PROCESS } = FootprintAccountStatusType;

const trimLabelColon = (label: string) => label.replace(/[:：]\s*$/, '');
const formatSummaryValue = (value?: string | number | null): string | number =>
  value === undefined || value === null || value === '' ? '-' : value;

export const AccountInfoResult: FC<AccountInfoResultProps> = memo(
  ({
    accountInfo,
    isDetail,
    apiExtraParams,
    showAISuggestion,
    showBusinessForesight,
    hideOverviewPanel,
    onAISuggestionReferenceSelect,
    onEmissionTaskCreate,
    onQuestionGuideClick,
    onSuggestionReferenceAdd,
  }) => {
    const { type } = accountInfo;
    const accountSummary = [
      {
        label: trimLabelColon(I18N.carbonFootprint.accountingCycle2),
        value: `${accountInfo.startTime}${I18N.carbonFootprint.to}${accountInfo.endTime}`,
      },
      {
        label: trimLabelColon(I18N.carbonFootprint3.functionalUnits2),
        value: accountInfo.accountName,
      },
      {
        label: trimLabelColon(I18N.carbonFootprint3.accountingQuantity),
        value: accountInfo.amount,
      },
      {
        label: trimLabelColon(I18N.carbonFootprint3.accountingPersonnel),
        value: accountInfo.updateByName,
      },
      {
        label: trimLabelColon(I18N.carbonFootprint3.recentAccountingDays),
        value: accountInfo.updateTime,
      },
    ];

    return (
      <div
        className={classNames(style.AccountInfoResultContainer, {
          [style.hideOverviewPanelContainer]: hideOverviewPanel,
        })}
      >
        <div
          className={classNames(style.resultContent, {
            [style.fullResultRight]: hideOverviewPanel,
          })}
        >
          {!hideOverviewPanel && (
            <div className={style.summaryCard}>
              <div className={style.summaryTop}>
                <div className={style.productContent}>
                  <Image
                    width={80}
                    height={80}
                    preview={{ getContainer: false }}
                    src={accountInfo.productPic || defaultImg}
                    onClick={e => {
                      e.stopPropagation();
                    }}
                  />
                  <div className={style.productInfo}>
                    <div
                      className={style.productName}
                      title={accountInfo.productName}
                    >
                      {accountInfo.productName}
                    </div>
                    <div
                      className={classNames(style.lifeCycleTag, {
                        [style.halfLifeCycleTag]:
                          accountInfo.scope === FootprintAccountLifeCycle.HALF,
                        [style.customLifeCycleTag]:
                          accountInfo.scope ===
                          FootprintAccountLifeCycle.CUSTOM,
                      })}
                    >
                      {ACCOUNT_SELECT_LIFE_CYCLE_LABEL[accountInfo.scope]}
                    </div>
                  </div>
                </div>
                <div className={style.emissionContent}>
                  <div>
                    <div className={style.emissionLabel}>
                      {I18N.carbonFootprint3.productCarbonFootprint}
                    </div>
                    <div
                      className={style.emissionValue}
                      title={`${accountInfo.emissionTotal}`}
                    >
                      {accountInfo.emissionTotal}
                    </div>
                  </div>
                  <img
                    className={style.emissionIcon}
                    src={co2CloudImg}
                    alt=''
                  />
                </div>
              </div>
              <div className={style.accountInfoContent}>
                {accountSummary.map(item => (
                  <div className={style.accountInfo} key={item.label}>
                    <div className={style.accountInfoLabel}>{item.label}</div>
                    <div
                      className={style.accountInfoValue}
                      title={`${formatSummaryValue(item.value)}`}
                    >
                      {formatSummaryValue(item.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className={style.resultBody}>
            {type === QUICK && (
              <QucikAccountResult
                apiExtraParams={apiExtraParams}
                isDetail={isDetail}
                accountInfo={accountInfo}
                showAISuggestion={showAISuggestion}
                showBusinessForesight={showBusinessForesight}
                onAISuggestionReferenceSelect={onAISuggestionReferenceSelect}
                onEmissionTaskCreate={onEmissionTaskCreate}
                onQuestionGuideClick={onQuestionGuideClick}
                onSuggestionReferenceAdd={onSuggestionReferenceAdd}
              />
            )}
            {type === PROCESS && (
              <ProcessAccountResult
                apiExtraParams={apiExtraParams}
                isDetail={isDetail}
                accountInfo={accountInfo}
                onEmissionTaskCreate={onEmissionTaskCreate}
              />
            )}
          </div>
        </div>
      </div>
    );
  },
);
