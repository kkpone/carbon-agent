import carbonCoin from '@src/assets/svg/accountProductImg.svg';
import I18N from '@src/lang/I18N';
import TextOverflowTable from '@src/views/carbonFootprint3/component/TextOverflowTable';
import TextWidthOverflow from '@src/views/carbonFootprint3/component/TextOverflowTable/byWidth';
import { Image } from 'antd';
import classNames from 'classnames';
import { memo } from 'react';

import {
  FOOTPRINT_ACCOUNT_TYPE_STATUS_OPTION,
  FootprintAccountStatusType,
} from '@/views/carbonFootprint3/FootprintAccount/constant';

import style from './index.module.less';
import { CompareDetailProps } from './types';

export const CompareDetail = memo(
  ({ primaryColor, changeProdBtn, isRight, detail }: CompareDetailProps) => {
    const cardData = detail?.card;
    const accountData = detail?.account;

    const { QUICK } = FootprintAccountStatusType;
    return (
      <div
        className={classNames(
          {
            [style.changePrimaryColor]: primaryColor,
            [style.hideRightLine]: isRight,
          },
          style.wrapper,
        )}
      >
        <div
          className={classNames(style.info, {
            [style.infoRight]: isRight,
          })}
        >
          <div className={style.top}>
            <div className={style.prodName}>
              <div
                className={classNames(style.tag, {
                  [style.tagRight]: isRight,
                })}
              />
              {isRight
                ? I18N.carbonFootprint3.benchmarkProduct
                : I18N.carbonFootprint3.targetProduct}
            </div>
            <div className={style.changeProduct}>{changeProdBtn}</div>
          </div>
          <aside>
            <div className={style.itemInfo}>
              <Image
                preview={{ getContainer: false }}
                src={accountData?.productPic || carbonCoin}
                onClick={e => {
                  e.stopPropagation();
                }}
                className={style.productPic}
              />
            </div>
            <div className={classNames(style.itemInfo, style.name)}>
              <TextWidthOverflow
                className={style.productName}
                width={140}
                value={accountData?.productName}
              />
              <TextWidthOverflow
                className={style.subName}
                width={90}
                value={accountData?.accountName}
              />
            </div>
            <div className={style.itemInfo}>
              <div
                className={classNames(style.itemInfoVal, style.accountType, {
                  [style.optionNodeTypeQuick]: accountData?.type === QUICK,
                })}
              >
                {FOOTPRINT_ACCOUNT_TYPE_STATUS_OPTION[accountData?.type || 0]}
              </div>
              <div style={{ color: '#6C757D' }}>
                <TextWidthOverflow
                  width={186}
                  value={I18N.template(I18N.carbonFootprint3.accou6, {
                    val1: accountData?.startTime,
                    val2: accountData?.endTime,
                  })}
                />
              </div>
            </div>
          </aside>
        </div>
        <div className={style.dataView}>
          <div className={style.item}>
            <div className={style.itemInfoVal}>
              {I18N.carbonFootprint3.totalEmissionsK2}
            </div>
            <div className={style.itemInfoTotal}>{cardData?.emissionTotal}</div>
          </div>
          <div className={style.item}>
            <div className={style.itemInfoVal}>
              {I18N.carbonFootprint3.maximumDischargeRing}
            </div>
            <div className={style.itemInfoKey}>
              <TextOverflowTable
                className={style.step}
                maxWidth={100}
                value={cardData?.stage || '-'}
                maxLength={7}
              />
              <TextWidthOverflow
                className={classNames(style.num, style.primary)}
                width={120}
                value={cardData?.stageEmissions}
              />
            </div>
          </div>
          <div className={style.item}>
            <div className={style.itemInfoVal}>
              {I18N.carbonFootprint3.maximumEmissionsCategory}
            </div>
            <div className={style.itemInfoKey}>
              <TextOverflowTable
                className={style.step}
                maxWidth={100}
                value={cardData?.type || '-'}
                maxLength={7}
              />
              <TextWidthOverflow
                className={classNames(style.num, style.primary)}
                width={120}
                value={cardData?.typeEmissions}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);
