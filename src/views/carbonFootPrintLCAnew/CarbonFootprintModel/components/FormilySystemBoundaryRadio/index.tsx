/**
 * @description 系统边界选择按钮
 */
import {
  connect,
  mapProps,
  mapReadPretty,
  useField,
  useForm,
} from '@formily/react';
import I18N from '@src/lang/I18N';
import { Row, Col, Checkbox } from 'antd';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import classNames from 'classnames';
import { isArray, uniq } from 'lodash-es';
import { useEffect, useState } from 'react';

import Check from './check.svg';
import style from './index.module.less';
import Warning from './warning.svg';
import { SYSTEM_BOUNDARY_TYPE } from '../../Info/ObjectivesAndScope/constant';
import { LIFE_CYCLE_TYPE } from '../../Info/constant';

const { CUSTOM_LIFE_CYCLE } = SYSTEM_BOUNDARY_TYPE;

interface RadioOptionType {
  label: string;
  value: number;
}
interface OptionsProps {
  describe?: string;
  selectedChildren?: (RadioOptionType & { checked: boolean })[];
  children?: RadioOptionType[];
  btnDisabled?: boolean;
}

type FormilySystemBoundaryRadioType = {
  value: number | string;
  options: (RadioOptionType & OptionsProps)[];
  disabled: boolean;
  onChange: (value: number | string) => void;
};

const FormilySystemBoundaryRadio = ({
  value,
  options,
  disabled,
  onChange,
}: FormilySystemBoundaryRadioType) => {
  const form = useForm();

  /** 编辑提示的标识 */
  const [editWraningTipFlag, setEditWraningTipFlag] = useState(false);

  /** 详情返回的系统边界的值 */
  const [detailValue, setDetailValue] = useState<number | string>();

  /** 详情返回的生命周期的值 */
  const [detailChildrenValue, setDetailChildrenValue] =
    useState<CheckboxValueType[]>();

  /** 当前选中的生命周期阶段 */
  const [currentCheckedChildrenValue, setCurrentCheckedChildrenValue] =
    useState<CheckboxValueType[]>();

  /** 是否为新增 */
  const isAdd = !form.getValuesIn('*')?.id;

  /** 详情反显的生命周期选中处理 */
  useEffect(() => {
    if (!isAdd) {
      /** 详情接口返回的系统边界的值 */
      const valueBack = form.getValuesIn('systemBoundaryType');

      /** 详情返回的生命周期的值，将字符串转为数组 */
      const checkedValue = form.getValuesIn('lifeCycleList')
        ? form
            .getValuesIn('lifeCycleList')
            ?.split(',')
            ?.map((v: string) => Number(v))
        : undefined;
      /** 获取详情返回的系统边界中默认选中的生命周期阶段 */
      const selectedChildrenArr = options?.find(v => v.value === value)
        ? options
            ?.find(v => v.value === value)
            ?.selectedChildren?.map(v => v.value)
        : [];
      /** 详情反显的系统边界的值 */
      setDetailValue(valueBack);
      /** 详情反显的生命周期阶段的值 */
      setDetailChildrenValue(
        uniq([...checkedValue, ...(selectedChildrenArr || [])]),
      );

      setCurrentCheckedChildrenValue(
        uniq([...checkedValue, ...(selectedChildrenArr || [])]),
      );
    }
  }, [isAdd]);

  /** 生命周期阶段表单赋值 */
  useEffect(() => {
    if (value && options && options.length) {
      /** 当系统边界为自定义生命周期且没有选择生命周期阶段时，给予提示 */
      if (
        (value === CUSTOM_LIFE_CYCLE && !currentCheckedChildrenValue) ||
        (value === CUSTOM_LIFE_CYCLE &&
          isArray(currentCheckedChildrenValue) &&
          !currentCheckedChildrenValue.length)
      ) {
        form.setFieldState('systemBoundaryType', {
          selfErrors: [I18N.carbonFootPrintLCA.pleaseSelectLife],
        });
        return;
      }

      form.setFieldState('systemBoundaryType', {
        selfErrors: undefined,
      });
      /** 获取选中的系统边界中默认选中的生命周期阶段 */
      const selectedChildrenArr = options
        .find(v => v.value === value)
        ?.selectedChildren?.map(v => v.value);

      form.setValuesIn(
        'lifeCycleList',
        selectedChildrenArr
          ? uniq([
              ...selectedChildrenArr,
              ...(currentCheckedChildrenValue || []),
            ])?.join(',')
          : currentCheckedChildrenValue?.join(','),
      );
    }
  }, [currentCheckedChildrenValue, value, options]);

  /** 编辑时：再编辑系统边界时 给予提示 （无论是系统边界值改变还是生命周期阶段值改变） */
  useEffect(() => {
    /** 获取选中的系统边界中默认选中的生命周期阶段 */
    const selectedChildrenValue = options
      ?.find(v => v.value === value)
      ?.selectedChildren?.map(v => v.value);

    /** 当前生命周期选中的值与其默认选中的数据去重，获取可以自己随意更改的值 */
    const checkedChildrenValue = uniq([
      ...(currentCheckedChildrenValue || []),
      ...(selectedChildrenValue || []),
    ]).sort((a, b) => (a as number) - (b as number));

    /** 详情时，判断系统边界和生命周期阶段的值与详情反显的值是否一致，不一致提示，一致则不提示（自定义生命周期没有默认选中的值，直接使用当前选中的生命周期阶段） */
    if (
      isAdd ||
      (value === detailValue &&
        String(
          value === CUSTOM_LIFE_CYCLE && detailValue === CUSTOM_LIFE_CYCLE
            ? currentCheckedChildrenValue
            : checkedChildrenValue,
        ) === String(detailChildrenValue))
    ) {
      setEditWraningTipFlag(false);
      return;
    }

    setEditWraningTipFlag(true);
  }, [
    value,
    currentCheckedChildrenValue,
    detailValue,
    detailChildrenValue,
    isAdd,
  ]);

  return (
    <div className={style.formilySystemBoundaryRadioWrapper}>
      {editWraningTipFlag && (
        <div className={style.wraningTip}>
          <img src={Warning} alt='' />
          <span>{I18N.carbonFootPrintLCA.changeSystemEdge2}</span>
        </div>
      )}
      <div className={style.wrapper}>
        <Row gutter={[24, 24]}>
          {options?.map(
            ({
              value: optionValue,
              label,
              describe,
              children,
              selectedChildren,
              btnDisabled = false,
            }) => (
              <Col key={optionValue} span={8}>
                <div
                  className={classNames(style.contentWrapper, {
                    [style.selected]: value === optionValue,
                  })}
                  onClick={() => {
                    if (!disabled && value !== optionValue) {
                      setCurrentCheckedChildrenValue(undefined);
                      if (optionValue === CUSTOM_LIFE_CYCLE) {
                        setCurrentCheckedChildrenValue([
                          LIFE_CYCLE_TYPE.PRODUCTION_STAGE,
                        ]);
                      }
                      onChange(optionValue);
                    }
                  }}
                >
                  <div className={style.titleWrapper}>
                    <span className={style.title}>{label}</span>
                    <span className={style.desc}>{describe}</span>
                  </div>
                  <div className={style.checkboxWrapper}>
                    {selectedChildren && (
                      <Checkbox.Group
                        options={selectedChildren}
                        disabled={btnDisabled}
                        value={
                          value === optionValue
                            ? selectedChildren
                                ?.filter(v => v.checked)
                                ?.map(v => v.value)
                            : undefined
                        }
                      />
                    )}
                    {children && (
                      <Checkbox.Group
                        name={label}
                        options={children}
                        value={
                          value === optionValue
                            ? currentCheckedChildrenValue
                            : undefined
                        }
                        onChange={checkedValue => {
                          setCurrentCheckedChildrenValue(
                            uniq([
                              ...checkedValue,
                              LIFE_CYCLE_TYPE.PRODUCTION_STAGE,
                            ]),
                          );
                        }}
                      />
                    )}
                  </div>

                  {value === optionValue && (
                    <div className={style.checkedWrap}>
                      <img src={Check} alt='' />
                    </div>
                  )}
                </div>
              </Col>
            ),
          )}
        </Row>
      </div>
    </div>
  );
};

const FormilySystemBoundaryRadioReadPretty = ({ value }: { value: number }) => {
  const form = useForm();

  const field = useField<any>();

  const options = field.dataSource
    ? (field.dataSource as (RadioOptionType & OptionsProps)[])
    : [];

  const optionItem = options?.find(v => v.value === value);

  const { label, describe, selectedChildren, children } = optionItem || {};

  /** 当前选中的生命周期阶段 */
  const [currentCheckedChildrenValue, setCurrentCheckedChildrenValue] =
    useState<CheckboxValueType[]>();

  const checkedValueBack = form.getValuesIn('lifeCycleList')
    ? form
        .getValuesIn('lifeCycleList')
        .split(',')
        ?.map((v: string) => Number(v))
    : undefined;

  /** 反显的生命周期选中处理 */
  useEffect(() => {
    if (value && options && options.length && checkedValueBack) {
      const selectedChildrenArr = options.find(v => v.value === value)
        ? options
            .find(v => v.value === value)
            ?.selectedChildren?.map(v => v.value)
        : [];

      setCurrentCheckedChildrenValue(
        uniq([...checkedValueBack, ...(selectedChildrenArr || [])]),
      );
    }
  }, [value, options]);

  return (
    <div className={classNames(style.contentReadPrettyWrapper, style.disabled)}>
      <div className={style.titleWrapper}>
        <span className={style.title}>{label}</span>
        <span className={style.desc}>{describe}</span>
      </div>
      <div className={style.checkboxWrapper}>
        {selectedChildren && (
          <Checkbox.Group
            disabled
            options={selectedChildren}
            value={selectedChildren?.filter(v => v.checked)?.map(v => v.value)}
          />
        )}
        {children && (
          <Checkbox.Group
            name={label}
            disabled
            options={children}
            value={currentCheckedChildrenValue}
            onChange={checkedValue => {
              setCurrentCheckedChildrenValue(checkedValue);
            }}
          />
        )}
      </div>
    </div>
  );
};
export default connect(
  FormilySystemBoundaryRadio,
  mapProps({ dataSource: 'options' }, props => ({
    ...props,
  })),
  mapReadPretty(FormilySystemBoundaryRadioReadPretty),
);
