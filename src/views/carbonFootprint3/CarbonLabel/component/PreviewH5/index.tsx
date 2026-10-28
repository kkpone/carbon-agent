import carbonLabelWill from '@src/assets/images/carbonLabel/carbonLabelWill.png';
import icon_car from '@src/assets/svg/carbonLabel/icon_car.svg';
import icon_dian from '@src/assets/svg/carbonLabel/icon_dian.svg';
import icon_gas from '@src/assets/svg/carbonLabel/icon_gas.svg';
import icon_phone from '@src/assets/svg/carbonLabel/icon_phone.svg';
import icon_subway from '@src/assets/svg/carbonLabel/icon_subway.svg';
import icon_tree from '@src/assets/svg/carbonLabel/icon_tree.svg';
import I18N from '@src/lang/I18N';
import { calcTextWidth } from '@src/views/carbonFootprint3/graph/utils';
import classNames from 'classnames';
import { FC } from 'react';

import style from './index.module.less';
import { PreviewH5Props } from './type';

const equalListImg = [
  icon_tree,
  icon_dian,
  icon_car,
  icon_phone,
  icon_gas,
  icon_subway,
];

const stageColors = ['#0cbf9f', '#026961', '#026961', '#004541', '#002a23'];

export const PreviewH5: FC<PreviewH5Props> = ({
  info,
  variant = 'legacy',
  labelPreview,
}) => {
  const agentPreview = variant !== 'legacy';
  /** 初始状态 - 是否有数据 */
  const haveData = !!info;
  const productUnitName = info?.unitName || info?.account?.unitName;
  const agentEmissionUnit = info?.accountObj?.unitName
    ? `${info.accountObj.unitName}${
        productUnitName ? `/${productUnitName}` : ''
      }`
    : undefined;

  /**
   * 判断是否有数据 没有数据返回 -
   * @param val
   * @returns
   */
  const getDataValueText = (val: string | number | undefined) => {
    if (haveData) return val || '-';
    return '-';
  };

  /**
   * 获取碳排放类别
   */
  const getEqualListNode = () => {
    if (!info?.accountObj?.equalList || !info?.contrastValues)
      return (
        <div className={style.aboutContent}>
          <div className={style.every}>
            <div className={style.noDataIcon} />
            <div className={style.iconDetail}>
              <span className={style.num}>-</span>
            </div>
          </div>
          <div className={style.every}>
            <div className={style.noDataIcon} />
            <div className={style.iconDetail}>
              <span className={style.num}>-</span>
            </div>
          </div>
          <div className={style.every}>
            <div className={style.noDataIcon} />
            <div className={style.iconDetail}>
              <span className={style.num}>-</span>
            </div>
          </div>
        </div>
      );

    const contrastValuesArr = info?.contrastValues.split(',');

    return (
      <div className={style.aboutContent}>
        {info?.accountObj?.equalList.map(equalInfo =>
          contrastValuesArr.includes(String(equalInfo.code)) ? (
            <div className={style.every} key={equalInfo.code}>
              <div className={style.icon}>
                <img
                  className={style.iconImg}
                  src={equalListImg[equalInfo.code]}
                  alt={I18N.carbonFootprint3.customIcons}
                />
              </div>
              <div className={classNames(style.iconDetail)}>
                <div
                  className={style.num}
                  title={
                    agentPreview
                      ? `${equalInfo.amount || '-'} ${equalInfo.unitName || ''}`
                      : undefined
                  }
                >
                  {equalInfo.amount || '-'}
                  {agentPreview && ' '}
                  {equalInfo.unitName}
                </div>
                <div
                  className={style.numDetail}
                  title={agentPreview ? equalInfo.name : undefined}
                >
                  {equalInfo.name}
                </div>
              </div>
            </div>
          ) : undefined,
        )}
      </div>
    );
  };

  /**
   * 判断是否显示 “规格型号”
   */
  const specsShowFunc = () => {
    if (info?.specsShow === 1) {
      return true;
    }
    if (info?.specsChange || info?.specsChange === 0) {
      return true;
    }

    return false;
  };

  /**
   * 判断是否显示 "核算周期"
   */
  const accountPeriodShowFunc = () => {
    if (info?.periodShow === 1) {
      return true;
    }
    if (info?.accountPeriodChange || info?.accountPeriodChange === 0) {
      return true;
    }

    return false;
  };

  /**
   * 判断是否显示 “相当于”
   */
  const contrastShowFunc = () => {
    if (info?.contrastShow === 1) {
      return true;
    }
    if (info?.contrastChange || info?.contrastChange === 0) {
      return true;
    }

    return false;
  };

  return (
    <div
      className={classNames(style.previewH5, {
        [style.agentPreview]: agentPreview,
      })}
    >
      <div className={style.content}>
        <div className={style.main}>
          {haveData && info?.productPic ? (
            <img
              className={style.productImg}
              src={info.productPic}
              alt={I18N.carbonFootprint3.productImages}
            />
          ) : (
            <div className={style.productImg} />
          )}

          <div className={style.carbonIsoMain}>
            <span>{I18N.carbonFootprint.carbonFootprintVerification2}</span>
            <span style={agentPreview ? undefined : { marginLeft: 8 }}>
              （ISO 14067、PAS 2050）
            </span>
          </div>
          <div className={style.productInfo}>
            <div
              className={classNames(style.title, {
                [style.versionChange]: info?.productChange === 1,
              })}
            >
              {getDataValueText(info?.productName)}
            </div>
            <div className={style.brandInfo}>
              <span className={style.pinpai}>
                {I18N.carbonFootprint3.brand}
              </span>
              <span
                className={classNames(style.name, {
                  [style.versionChange]: info?.brandChange === 1,
                })}
              >
                {getDataValueText(info?.brand)}
              </span>
            </div>
            {specsShowFunc() && (
              <div
                className={classNames(style.footprintTime, {
                  [style.versionChange]:
                    info?.specsChange || info?.specsChange === 0,
                  [style.versionTextHiden]: info?.specsChange === 0,
                })}
              >
                <span className={style.pinpai}>
                  {I18N.carbonFootprint3.model}
                </span>
                <span className={style.name}>
                  {getDataValueText(info?.specs || info?.specification)}
                </span>
              </div>
            )}
          </div>

          <div className={style.carbonFootprintMain}>
            <div className={style.footprintMain}>
              <div className={style.willMain}>
                {agentPreview && labelPreview ? (
                  labelPreview
                ) : (
                  <img
                    className={style.carbonLabelWill}
                    src={carbonLabelWill}
                    alt={I18N.carbonFootprint3.carbonFootprintLabel}
                  />
                )}
              </div>
              <div className={style.footprintTitle}>
                {I18N.carbonFootprint.carbonFootprintVerification2}
              </div>
              <div className={style.emissionValue}>
                <div className={style.footprintNum}>
                  <span
                    className={classNames(style.footprintNumText, {
                      [style.versionChange]: info?.perEmissionChange === 1,
                    })}
                  >
                    {getDataValueText(info?.accountObj?.perEmission)}
                  </span>
                  {!agentPreview && (
                    <div
                      className={style.footprintNumBorder}
                      style={{
                        width:
                          calcTextWidth(
                            `${getDataValueText(
                              info?.accountObj?.perEmission,
                            )}`,
                            'normal 700 24px sans-serif',
                          ) || '100%',
                      }}
                    />
                  )}
                </div>
                <div className={style.footprintUnit}>
                  {agentPreview
                    ? getDataValueText(agentEmissionUnit)
                    : info?.accountObj?.unitName &&
                      (info?.unitName || info.account?.unitName)
                    ? getDataValueText(
                        `${info?.accountObj?.unitName}/${
                          info?.unitName || info.account?.unitName || '-'
                        }`,
                      )
                    : '-'}
                </div>
              </div>
              {accountPeriodShowFunc() && (
                <div
                  className={classNames(style.footprintTime, {
                    [style.versionChange]:
                      info?.accountPeriodChange ||
                      info?.accountPeriodChange === 0,
                    [style.versionTextHiden]: info?.accountPeriodChange === 0,
                  })}
                >
                  {getDataValueText(
                    I18N.template(I18N.carbonFootprint3.accountingCycleI, {
                      val1: info?.startTime || '-',
                      val2: info?.endTime || '-',
                    }),
                  )}
                </div>
              )}
            </div>
            {contrastShowFunc() && (
              <div className={style.footprintAboutMain}>
                <div
                  className={classNames(style.title, {
                    [style.versionChange]:
                      info?.contrastChange || info?.contrastChange === 0,
                    [style.versionTextHiden]: info?.contrastChange === 0,
                  })}
                >
                  {I18N.carbonFootprint3.equivalentTo}
                </div>
                {getEqualListNode()}
              </div>
            )}
          </div>

          <div className={style.dataMain}>
            <div
              className={classNames(style.title, {
                [style.versionChange]: info?.stageChange === 1,
              })}
            >
              {I18N.carbonFootprint3.carbonEmissionDistribution}
            </div>
            {info?.accountObj?.stageList &&
              info.accountObj.stageList?.map((stage, index) => {
                if (stage.rateAccount === 0) return undefined;
                return (
                  <div className={style.cycleMain} key={stage.stage}>
                    <div className={style.titleMain}>
                      <span>{stage.stageName}</span>
                      <span
                        className={
                          stage?.change === 1 ? style.versionChange : ''
                        }
                      >
                        {haveData ? `${stage.rateAccount}%` : '-'}
                      </span>
                    </div>
                    <div className={style.progress}>
                      <div
                        className={classNames(style.every)}
                        style={{
                          width: `${haveData ? stage.rateAccount : 0}%`,
                          backgroundColor: agentPreview
                            ? stageColors[index % stageColors.length]
                            : undefined,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          <div className={style.describeFooter}>
            {I18N.carbonFootprint3.thisProductHasCarbonFootprint}
          </div>
        </div>
      </div>
    </div>
  );
};
