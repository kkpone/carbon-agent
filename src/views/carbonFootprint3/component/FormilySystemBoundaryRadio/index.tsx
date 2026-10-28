/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-17 14:46:24
 * @Date: 2023-04-20 17:54:45
 * @@description:
 */
import { onFieldValueChange } from '@formily/core';
import { connect, mapProps, useForm } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Checkbox } from 'antd';
import classNames from 'classnames';
import { uniqueId } from 'lodash-es';
import { useMemo } from 'react';

import { IconAlibabaNew } from '@/components/iconfont';

import styles from './index.module.less';
import { FootprintAccountStatusType } from '../../FootprintAccount/constant';
import {
  PROCESS_ACCOUNT_LIFE_CYCLE_LABEL,
  QUICK_ACCOUNT_LIFE_CYCLE_LABEL,
} from '../../constant';

type FormilySystemBoundaryRadioProps = {
  value: number;
  readPretty?: boolean;
  disabled: boolean;
  onChange: (value: number) => void;
};

type RadioSystemsType = {
  title: string;
  details: string;
  value: number;
};

const { QUICK } = FootprintAccountStatusType;

const FormilySystemBoundaryRadio = ({
  value,
  onChange,
  disabled,
  readPretty,
}: FormilySystemBoundaryRadioProps) => {
  const notSet = readPretty || disabled;
  const form = useForm();
  const formFiedValueType: string = form.getValuesIn('type');

  form.addEffects('formAddType', () => {
    onFieldValueChange('type', () => {
      form.setFieldState('scope', {
        loading: true,
      });
      setTimeout(() => {
        form.setFieldState('scope', {
          loading: false,
        });
      });
    });
  });

  const LifeCycleArr =
    Number(formFiedValueType) === QUICK
      ? QUICK_ACCOUNT_LIFE_CYCLE_LABEL()
      : PROCESS_ACCOUNT_LIFE_CYCLE_LABEL();

  const RadioSystems: RadioSystemsType[] = useMemo(
    () => [
      {
        title: I18N.carbonFootprint3.halfLifeCycle,
        details:
          Number(formFiedValueType) === QUICK
            ? I18N.carbonFootprint3.fromResourceExtraction4
            : I18N.carbonFootprint3.fromResourceExtraction6,
        value: 0,
      },
      {
        title: I18N.carbonFootprint3.fullLifecycle,
        details:
          Number(formFiedValueType) === QUICK
            ? I18N.carbonFootprint3.fromResourceExtraction3
            : I18N.carbonFootprint3.fromResourceExtraction5,
        value: 1,
      },
      {
        title: I18N.carbonFootprint.customLife,
        details: '',
        value: 2,
      },
    ],
    [formFiedValueType],
  );

  /** 自定义生命周期的数据 */
  const customCycleData = Object.keys(LifeCycleArr);

  const scopeValueValue: string = form.getValuesIn('scopeValue');
  const checboxDefault =
    scopeValueValue && value === 2 ? scopeValueValue.split(',') : [];
  const changeRadio = (info: RadioSystemsType) => {
    if (value !== info.value) {
      onChange(info.value);
    }
  };

  const defaultNode = (info: RadioSystemsType) => (
    <div
      key={info.value}
      style={notSet ? { cursor: 'not-allowed' } : {}}
      className={classNames(styles.radioSystem, {
        [styles.radioSystemActive]: value === info.value,
      })}
      onClick={() => {
        if (!notSet) {
          changeRadio(info);
        }
      }}
    >
      <div className={styles.radioSystemTitle}>{info.title}</div>
      <div className={styles.radioSystemDetails}>{info.details}</div>
      {value === info.value && (
        <IconAlibabaNew className={styles.checkIcon} type='icon-slect' />
      )}
    </div>
  );

  const customCycleNode = (info: RadioSystemsType) => (
    <div
      key={uniqueId()}
      style={notSet ? { cursor: 'not-allowed' } : {}}
      className={classNames(styles.radioSystem, {
        [styles.radioSystemActive]: value === info.value,
      })}
      onClick={() => {
        if (!notSet) {
          changeRadio(info);
        }
      }}
    >
      <div className={styles.radioSystemTitle}>{info.title}</div>
      <div className={styles.radioSystemCustomCycle}>
        <Checkbox.Group
          disabled={notSet}
          defaultValue={checboxDefault}
          onChange={checkValue => {
            form.setValuesIn('scopeValue', checkValue.join(','));
          }}
        >
          {customCycleData.map(customKey => (
            <Checkbox value={customKey}>{LifeCycleArr[customKey]}</Checkbox>
          ))}
        </Checkbox.Group>
      </div>
      {value === info.value && (
        <IconAlibabaNew className={styles.checkIcon} type='icon-slect' />
      )}
    </div>
  );

  return (
    <div
      className={
        notSet
          ? styles.formilySystemBoundaryRadioMain
          : `${styles.formilySystemBoundaryRadioMain} ${styles.formilySystemBoundaryRadioMainHover}`
      }
    >
      {RadioSystems.map(info => {
        if (info.value !== 2) {
          return defaultNode(info);
        }
        return customCycleNode(info);
      })}
    </div>
  );
};

export default connect(
  FormilySystemBoundaryRadio,
  mapProps({ loading: false, readPretty: false }, props => ({
    ...props,
  })),
);
