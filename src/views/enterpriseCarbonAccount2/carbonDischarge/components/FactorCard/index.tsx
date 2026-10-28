/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * @@description: 排放源因子卡片
 */
import { SerachCarbonFactorResult } from '@src/components/SearchFactor/type';
import { IconAlibaba } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { PageInfoType, PathParamsType } from '@src/router/type';
import { shouldHideEcoinventValue } from '@src/utils/ecoinvent';
import { ECOINVENT_TEXT } from '@src/views/carbonFootprint3/constant';
import { apiUnitExchange } from '@src/views/enterpriseCarbonAccount2/service';
import { titleTip } from '@src/views/enterpriseCarbonAccount2/utils';
import { Button, InputNumber, Tooltip } from 'antd';
import BigNumber from 'bignumber.js';
import '../style.less';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import style from './index.module.less';
import { ManualFactorData } from '../AddEmission/types';

import { InfoCircleOutlined } from '@ant-design/icons';

interface PropsType {
  activityUnit: string;
  factorUseType: number;
  factorData?: SerachCarbonFactorResult | ManualFactorData;
  showModel?: (type: 'detail' | 'reSelect' | 'fill') => void;
  onConversionRatioChange?: (num: BigNumber) => any;
  conversionRatio?: string | number;
  readonly?: boolean;
  freezeCalcUnit?: boolean;
  pageInfoTypeName?: PageInfoType;
}

const FactorCard = (props: PropsType) => {
  /** '1'-普通因子 '2'-ecoinvent因子 */
  const [ecoinventFactor, setEcoinventFactor] = useState<boolean>(false);

  const { pageInfoTypeName = props.pageInfoTypeName } =
    useParams<PathParamsType>();

  const [isNumberError, setIsNumberError] = useState(false);
  const [isFirst, setIsFirst] = useState(
    () => pageInfoTypeName !== PageInfoType.add,
  );

  const {
    showModel,
    factorData,
    onConversionRatioChange,
    conversionRatio,
    readonly,
    activityUnit,
    factorUseType,
    freezeCalcUnit,
  } = props;

  const { name, cValue, unit, sourceLevel, year, factorType } = useMemo(() => {
    let name;
    let cValue;
    let unit;
    let sourceLevel = '';
    let year = '';
    let factorType = '';

    if (factorData && (factorUseType === 2 || factorUseType === 3)) {
      setEcoinventFactor(false);
      // 手动录入因子
      name = factorData.name;
      cValue = factorData.factorValue || factorData?.cValue;
      unit = factorData.factorUnitName || factorData?.unit;
      sourceLevel = factorData.factorSourceName || factorData.factorSource;
      year = factorData.factorPublic;
      factorType = factorData.factorType;
    } else if (factorData) {
      setEcoinventFactor(shouldHideEcoinventValue(factorData));
      // 因子库因子
      return {
        ...factorData,
        sourceLevel: factorData?.factorSource || factorData?.institution,
        unit: factorData?.factorUnitName || factorData?.unit,
        year: factorData?.factorPublic || factorData?.year,
        cValue: factorData.factorValue || factorData?.cValue,
        factorType: factorData.factorScore,
      };
    }
    return { name, cValue, unit, sourceLevel, year, factorType };
  }, [factorData]);
  // console.log(factorData);
  // console.log(activityUnit);

  const changUnitApi = (unitOne, unitTwo) => {
    if (unitOne && unitTwo) {
      apiUnitExchange({ unitOne, unitTwo }).then((res: any) => {
        onConversionRatioChange?.(BigNumber(res.data.data.unitValue));
      });
    }
  };
  useEffect(() => {
    // console.log(unit);
    // console.log(activityUnit);

    if (unit && activityUnit && isFirst) {
      setIsFirst(false);
    } else if (!freezeCalcUnit) {
      changUnitApi(activityUnit, unit?.split('/')?.[1]);
    }
  }, [unit, activityUnit]);
  useEffect(() => {
    setTimeout(() => {
      const input = document.getElementById('resizable-input');
      if (!input) {
        return;
      }
      // @ts-ignore
      input.addEventListener('input', e => {
        // 设置元素的宽度为内容的宽度
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        input.style.width = `${input.value.length + 2}ch`;
      });
    }, 1000);
  }, []);
  return (
    <div className={classNames('factor-box', style.factorCard)}>
      {factorData ? (
        <div className='factor-card-box'>
          <div className='factor-border'>
            {/* 标题 */}
            <div className='factor-top-box flex-a-c flex-j-b'>
              <div className='flex-a-c'>
                <IconAlibaba
                  type='icon-icon-wodepaifangyinziku'
                  className='change-fill'
                />
                <Tooltip
                  placement='top'
                  title={I18N.carbonFootprint3.viewDetails}
                >
                  <div
                    onClick={() => {
                      showModel?.('detail');
                    }}
                  >
                    <span className='factor-name'>{name}</span>
                    <IconAlibaba
                      type='icon-icon_chakanxiangqing'
                      className='hover-detail'
                    />
                  </div>
                </Tooltip>
              </div>
              {!readonly && (
                <div className='flex-a-c'>
                  <div
                    className='flex-a-c'
                    onClick={() => {
                      showModel?.('reSelect');
                    }}
                  >
                    <IconAlibaba
                      type='icon-icon-tongzhi-1'
                      className='change-fill'
                    />
                    <span className='change-fill'>
                      {I18N.carbonFootprint.reSelect}
                    </span>
                  </div>
                  <span className='line'>|</span>
                  <div
                    className='flex-a-c'
                    onClick={() => {
                      showModel?.('fill');
                    }}
                  >
                    <IconAlibaba
                      type='icon-icon_sdtx'
                      className='change-fill'
                    />
                    <span className='change-fill'>
                      {I18N.carbonFootprint.manualFilling}
                    </span>
                  </div>
                </div>
              )}
            </div>
            {/* 标题end */}
            {/* 因子信息 */}
            <div className='factor-info flex-a-c'>
              <div className='info-item flex-d-c'>
                <div className={classNames('flex-a-c', style.factorValue)}>
                  <span
                    className='value fector-name'
                    title={
                      ecoinventFactor
                        ? ECOINVENT_TEXT
                        : `${cValue || '-'}${unit || '-'}`
                    }
                  >
                    {ecoinventFactor ? ECOINVENT_TEXT : cValue || '-'}
                    {ecoinventFactor ? '' : unit || '-'}
                  </span>
                </div>
                <span className='key'>
                  {I18N.carbonFootprint.factorValue}
                  <Tooltip
                    title={
                      I18N.enterpriseCarbonAccount2.ifThereIsNoTemperature2
                    }
                  >
                    <InfoCircleOutlined className={style.infoIcon} />
                  </Tooltip>
                </span>
              </div>
              <div className='info-item flex-d-c'>
                <span
                  className={classNames('value', style.factorSource)}
                  title={sourceLevel || '-'}
                >
                  {sourceLevel || '-'}
                </span>
                <span className='key'>{I18N.components.factorSources}</span>
              </div>
              <div className='info-item flex-d-c'>
                <span className='value'>{year}</span>
                <span className='key'>
                  {I18N.carbonFootprint.yearOfPublication}
                </span>
              </div>
              <div className='info-item flex-d-c'>
                <span className='score'>{factorType}</span>
                <span className='key'>
                  {I18N.enterpriseCarbonAccount2.factorScore}
                </span>
              </div>
            </div>
            {/* 因子信息end */}
            {/* 单位换算比例 */}
            <div className='unit-tans'>
              <div className='flex-a-c'>
                <span className={style.riskIcon}>*</span>
                {titleTip(
                  I18N.carbonFootprint.unitConversionRatio4,
                  I18N.components.activityDataSheet2,
                )}
              </div>
              <div className={style.wrapper}>
                <div className='flex-a-e'>
                  <span className='value'>1&nbsp;{activityUnit}&nbsp;</span>

                  <span className='value font-w-400'>
                    &nbsp;{I18N.enterpriseCarbonAccount2.nbspEtc}
                  </span>
                  {readonly ? (
                    <div
                      className={classNames(style.input, {
                        [style.error]: isNumberError,
                      })}
                    >
                      {conversionRatio || ''}
                    </div>
                  ) : (
                    <InputNumber
                      id='resizable-input'
                      controls={false}
                      className={classNames(style.inputData, {
                        [style.error]: isNumberError,
                      })}
                      maxLength={22}
                      // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
                      max={99999999999}
                      value={conversionRatio || ''}
                      onInput={val => {
                        const num = BigNumber(val);
                        if (!val) {
                          onConversionRatioChange?.(BigNumber(''));
                        }
                        if (num.lte(0) || num.isNaN()) {
                          setIsNumberError(true);
                        } else {
                          setIsNumberError(false);
                          onConversionRatioChange?.(num);
                        }
                      }}
                    />
                  )}

                  <span className='value'>{unit?.split('/')?.[1]}&nbsp;</span>
                </div>
                <div className={style.tips}>
                  <span className='key'>
                    {I18N.enterpriseCarbonAccount2.activityDataSheet2}
                  </span>
                  <span className='key'>
                    {I18N.enterpriseCarbonAccount2.factorDenominatorSingle}
                  </span>
                </div>
              </div>
            </div>
            {/* 单位换算比例end */}
          </div>
        </div>
      ) : (
        <div className='factor-empty flex-a-c flex-j-c flex-d-c'>
          <IconAlibaba type='icon-icon-zanmoshuju' className='empty' />
          <span className='match-word'>{I18N.components.notMatchedDueTo2}</span>
          <div className='flex-a-c'>
            <Button
              // className='flex-a-c'
              type='link'
              onClick={() => {
                showModel?.('reSelect');
              }}
            >
              <IconAlibaba type='icon-icon_znpp' className='change-fill' />
              <span className='change-fill'>
                {I18N.components.selectionFactor}
              </span>
            </Button>
            <span className='line'>|</span>
            <div
              className='flex-a-c'
              onClick={() => {
                showModel?.('fill');
              }}
            >
              <IconAlibaba type='icon-icon_sdtx' className='change-fill' />
              <span className='change-fill'>
                {I18N.carbonFootprint.manualFilling}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FactorCard;
