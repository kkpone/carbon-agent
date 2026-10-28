import { Select, Input } from '@formily/antd-v5';
import { Field as FieldType } from '@formily/core';
import { FormConsumer, observer, useField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Tag } from 'antd';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';

import { nanoid } from '@/utils';

import styles from './index.module.less';

export const INPUT_CHAR_PREFIX = '__INPUT__';
export const PARAM_CHART_SIGN = '__PARAM__';
export const CONSTANT_CHAR_PREFIX = '__CONST__';

export const FORMULA_TOKEN_TYPE = {
  PARAM: 1,
  OPERATOR: 2,
  CONSTANT: 3,
} as const;

export type FormulaTokenItem = {
  value: string;
  label: string;
  type?: number;
};

const operatorChar = ['+', '-', '*', '/', '(', ')'];

/** 仅数字与小数点（输入过程草稿） */
const NUMERIC_DRAFT = /^\d*\.?\d*$/;

/** 回车时视为合法数字串（至少含一位数字） */
const NUMERIC_COMMIT = /^(?:\d+(?:\.\d*)?|\.\d+)$/;

const FormulaInput = observer<{
  unitText?: string;
  disabled?: boolean;
  placeholder?: string;
  options?: { id: string; name: string }[];
  optionFieldNames?: { value: string; label: string };
  enableFormulaConstants?: boolean;
}>(
  ({
    unitText,
    disabled,
    placeholder,
    options,
    optionFieldNames = { value: 'value', label: 'label' },
    enableFormulaConstants = false,
  }) => {
    const [searchValue, setSearchValue] = useState('');
    const searchValRef = useRef('');
    /** 下拉面板的「常数」候选：回车加入后即可点击插入公式 */
    const [constantPanelInput, setConstantPanelInput] = useState('');
    const [constantPaletteLabels, setConstantPaletteLabels] = useState<
      string[]
    >([]);

    const { value, dataSource, onInput } = useField() as FieldType;

    const fieldValue = (value as FormulaTokenItem[]) || [];

    /** 公式中的常数标签并入面板候选（只增不删；与从公式区删 Tag 脱钩） */
    useEffect(() => {
      if (!enableFormulaConstants) return;
      const tokens = ((value as FormulaTokenItem[]) || []).filter(
        item => item.type === FORMULA_TOKEN_TYPE.CONSTANT,
      );
      if (tokens.length === 0) return;
      setConstantPaletteLabels(prev => {
        const next = [...prev];
        let changed = false;
        tokens.forEach(({ label }) => {
          if (!next.includes(label)) {
            next.push(label);
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, [enableFormulaConstants, value]);

    const params: Record<string, string>[] = options || dataSource;

    const selectPlaceholder = placeholder ?? '';

    const onDeselect = (deselectValue: string) => {
      const filterValue = (fieldValue || []).filter(
        item => item.value !== deselectValue,
      );
      onInput(filterValue.length > 0 ? filterValue : undefined);
    };

    return (
      <div className={styles.formulaInput}>
        {!disabled ? (
          <Select
            className={classNames(styles.select, {
              [styles.noRadiusSelect]: !!unitText,
            })}
            value={fieldValue}
            options={fieldValue}
            mode='tags'
            suffixIcon={null}
            searchValue={searchValue}
            placeholder={selectPlaceholder}
            onSearch={val => {
              setSearchValue(val);
              searchValRef.current = val;
            }}
            tagRender={prop => {
              const { value: tagValue, label } = prop as {
                value: string;
                label: string;
              };
              return (
                <Tag closeIcon onClose={() => onDeselect(tagValue)}>
                  <FormConsumer>
                    {form => {
                      const paramItems =
                        params ||
                        (
                          form.values as {
                            paramItem: Record<string, string>[];
                          }
                        ).paramItem ||
                        [];

                      return (
                        <span>
                          {paramItems.find(
                            param =>
                              `${param[optionFieldNames.value]}` ===
                              tagValue.split(PARAM_CHART_SIGN)[0],
                          )?.[optionFieldNames.label] || label}
                        </span>
                      );
                    }}
                  </FormConsumer>
                </Tag>
              );
            }}
            dropdownRender={() => {
              const constantChipLabels = enableFormulaConstants
                ? Array.from(new Set(constantPaletteLabels))
                : [];

              return (
                <div className={styles.dropdownContent}>
                  <div className={styles.dropdownBlock}>
                    <div className={styles.dropdownTitle}>
                      {I18N.enterpriseCarbonAccount2.operationSymbol}
                    </div>
                    <div className={styles.operatorContent}>
                      {operatorChar.map(char => (
                        <div
                          className={styles.operator}
                          key={char}
                          onClick={() => {
                            const inputValue = searchValRef.current.trim();
                            const inputNumber = Number(inputValue);

                            if (enableFormulaConstants) {
                              onInput([
                                ...(fieldValue || []),
                                {
                                  value: `${INPUT_CHAR_PREFIX}${nanoid()}`,
                                  label: char,
                                  type: FORMULA_TOKEN_TYPE.OPERATOR,
                                },
                              ]);
                            } else if (
                              inputValue &&
                              !Number.isNaN(inputNumber)
                            ) {
                              onInput([
                                ...(fieldValue || []),
                                {
                                  value: `${INPUT_CHAR_PREFIX}${nanoid()}`,
                                  label: `${inputNumber}`,
                                  type: FORMULA_TOKEN_TYPE.OPERATOR,
                                },
                                {
                                  value: `${INPUT_CHAR_PREFIX}${nanoid()}`,
                                  label: char,
                                  type: FORMULA_TOKEN_TYPE.OPERATOR,
                                },
                              ]);
                            } else {
                              onInput([
                                ...(fieldValue || []),
                                {
                                  value: `${INPUT_CHAR_PREFIX}${nanoid()}`,
                                  label: char,
                                  type: FORMULA_TOKEN_TYPE.OPERATOR,
                                },
                              ]);
                            }
                            setSearchValue('');
                            searchValRef.current = '';
                          }}
                        >
                          {char}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.dropdownBlock}>
                    <div className={styles.dropdownTitle}>
                      {I18N.enterpriseCarbonAccount2.parameter}
                    </div>
                    <FormConsumer>
                      {form => {
                        const paramItems =
                          params ||
                          (
                            form.values as {
                              paramItem: Record<string, string>[];
                            }
                          ).paramItem ||
                          [];

                        return (
                          <div>
                            {paramItems.map(param => (
                              <div
                                className={styles.param}
                                key={param[optionFieldNames.value]}
                                onClick={() => {
                                  onInput([
                                    ...(fieldValue || []),
                                    {
                                      value: `${
                                        param[optionFieldNames.value]
                                      }${PARAM_CHART_SIGN}${nanoid()}`,
                                      label:
                                        param[optionFieldNames.label] || '-',
                                      type: FORMULA_TOKEN_TYPE.PARAM,
                                    },
                                  ]);
                                }}
                              >
                                {param[optionFieldNames.label] || '-'}
                              </div>
                            ))}
                          </div>
                        );
                      }}
                    </FormConsumer>
                  </div>
                  {enableFormulaConstants && (
                    <div className={styles.dropdownBlock}>
                      <div className={styles.dropdownTitle}>
                        {I18N.enterpriseCarbonAccount2.formulaConstant}
                      </div>
                      {constantChipLabels.length > 0 && (
                        <div className={styles.constantChipRow}>
                          {constantChipLabels.map(text => (
                            <div
                              className={styles.constantChip}
                              key={text}
                              title={text}
                              onClick={() => {
                                setConstantPaletteLabels(prev =>
                                  prev.includes(text) ? prev : [...prev, text],
                                );
                                onInput([
                                  ...(fieldValue || []),
                                  {
                                    value: `${CONSTANT_CHAR_PREFIX}${nanoid()}`,
                                    label: text,
                                    type: FORMULA_TOKEN_TYPE.CONSTANT,
                                  },
                                ]);
                              }}
                            >
                              {text}
                            </div>
                          ))}
                        </div>
                      )}
                      <div
                        className={styles.constantPanelInputWrap}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <Input
                          inputMode='decimal'
                          size='small'
                          value={constantPanelInput}
                          placeholder={
                            I18N.enterpriseCarbonAccount2
                              .formulaConstantPanelPlaceholder
                          }
                          onChange={e => {
                            const next = e.target.value;
                            if (next === '' || NUMERIC_DRAFT.test(next)) {
                              setConstantPanelInput(next);
                            }
                          }}
                          onPressEnter={() => {
                            const t = constantPanelInput.trim();
                            if (
                              !t ||
                              !NUMERIC_COMMIT.test(t) ||
                              !/\d/.test(t)
                            ) {
                              return;
                            }
                            const n = Number(t);
                            if (!Number.isFinite(n)) return;
                            const label = String(n);
                            setConstantPaletteLabels(prev =>
                              prev.includes(label) ? prev : [...prev, label],
                            );
                            setConstantPanelInput('');
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            }}
            onBlur={() => {
              setTimeout(() => {
                setSearchValue('');
                searchValRef.current = '';
              }, 100);
            }}
            onDeselect={onDeselect}
            onInputKeyDown={({ code }) => {
              if (code !== 'Enter') return;

              if (enableFormulaConstants) {
                setSearchValue('');
                searchValRef.current = '';
                return;
              }

              const inputValue = searchValRef.current.trim();
              const inputNumber = Number(inputValue);

              if (inputValue && !Number.isNaN(inputNumber)) {
                onInput([
                  ...(fieldValue || []),
                  {
                    value: `${INPUT_CHAR_PREFIX}${nanoid()}`,
                    label: `${inputNumber}`,
                  },
                ]);
              }
              setSearchValue('');
              searchValRef.current = '';
            }}
          />
        ) : (
          <Input value={(fieldValue || []).map(val => val.label).join(' ')} />
        )}
        {unitText && <div className={styles.unitText}>{unitText}</div>}
      </div>
    );
  },
);

export default FormulaInput;
