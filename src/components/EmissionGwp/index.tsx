import { FormItem, PreviewText } from '@formily/antd-v5';
import { Button, Cascader, Input, InputNumber, Popover, Tooltip } from 'antd';
import { useId, useRef, useState } from 'react';

import chevronIcon from './assets/chevron-down.svg';
import styles from './index.module.less';
import {
  EmissionGwpValue,
  GreenhouseGasGroup,
  GreenhouseGasOption,
  isValidGwpValue,
} from './types';

type GwpOption = Partial<Pick<GreenhouseGasOption, 'aliases' | 'gwpValue'>> & {
  value: string;
  label: string;
  children?: GreenhouseGasOption[];
};

export interface EmissionGwpProps {
  value: EmissionGwpValue;
  onChange: (value: EmissionGwpValue) => void;
  readOnly?: boolean;
  disabled?: boolean;
  options: GreenhouseGasGroup[];
}

export default function EmissionGwp({
  value,
  onChange,
  readOnly,
  disabled,
  options,
}: EmissionGwpProps) {
  const inputId = useId();
  const numericRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const isCo2 = value.greenhouseGas.trim() === 'CO2';
  const selectedGroup = options.find(group =>
    group.children.some(option => option.value === value.greenhouseGas),
  );
  const confirm = () => {
    if (isCo2 || readOnly || disabled || !isValidGwpValue(draft)) return;
    onChange({ ...value, gwpValue: draft });
    setEditing(false);
  };

  return (
    <FormItem.BaseItem className={styles.field} colon={false}>
      <div className={styles.heading}>
        <span id={`${inputId}-label`}>温室气体类型</span>
        <span className={styles.value}>
          <span className={styles.valueText}>
            {!readOnly && !isCo2 && (
              <span className={styles.required} aria-hidden='true'>
                *
              </span>
            )}
            GWP100数值：{value.gwpValue}
          </span>
          {!readOnly && !isCo2 && (
            <Popover
              trigger='click'
              placement='bottomRight'
              arrow={false}
              open={editing && !disabled}
              onOpenChange={next => {
                setEditing(next);
                if (next) {
                  setDraft(value.gwpValue);
                  setOpen(false);
                }
              }}
              afterOpenChange={next => {
                if (next) numericRef.current?.focus();
              }}
              overlayClassName={styles.popover}
              content={
                <div className={styles.editor}>
                  <span>
                    <span className={styles.required} aria-hidden='true'>
                      *
                    </span>
                    GWP数值
                  </span>
                  <div className={styles.editorRow}>
                    <InputNumber<string>
                      stringMode
                      ref={numericRef}
                      className={styles.numeric}
                      id={`${inputId}-gwp`}
                      aria-label='GWP数值'
                      aria-required='true'
                      value={draft}
                      precision={2}
                      status={!isValidGwpValue(draft) ? 'error' : undefined}
                      step={0.01}
                      controls={{
                        upIcon: (
                          <img
                            className={styles.stepUp}
                            src={chevronIcon}
                            alt=''
                          />
                        ),
                        downIcon: (
                          <img
                            className={styles.icon}
                            src={chevronIcon}
                            alt=''
                          />
                        ),
                      }}
                      onChange={setDraft}
                      onPressEnter={confirm}
                      onKeyDown={event => {
                        if (event.key === 'Escape') setEditing(false);
                      }}
                    />
                    <Button
                      className={styles.save}
                      type='link'
                      aria-label='确认GWP数值'
                      disabled={!isValidGwpValue(draft)}
                      onClick={confirm}
                    >
                      保存
                    </Button>
                    <Button
                      className={styles.cancel}
                      type='link'
                      aria-label='取消GWP修改'
                      onClick={() => setEditing(false)}
                    >
                      取消
                    </Button>
                  </div>
                  {!isValidGwpValue(draft) && (
                    <span role='alert' className={styles.error}>
                      {draft === null || draft === ''
                        ? '请输入GWP数值'
                        : 'GWP数值必须大于0，且最多两位小数'}
                    </span>
                  )}
                </div>
              }
            >
              <Tooltip
                title='编辑GWP数值'
                placement='topRight'
                open={editing ? false : undefined}
              >
                <Button
                  className={styles.edit}
                  type='text'
                  disabled={disabled}
                  aria-label='编辑GWP数值'
                  icon={<span className={styles.editIcon} aria-hidden='true' />}
                />
              </Tooltip>
            </Popover>
          )}
        </span>
      </div>
      {readOnly ? (
        <PreviewText.Input
          className={styles.readOnly}
          value={value.greenhouseGas}
        />
      ) : (
        <Cascader<GwpOption>
          options={options.map(group => ({
            value: group.groupCode,
            label: group.groupName,
            children: group.children,
          }))}
          value={
            selectedGroup ? [selectedGroup.groupCode, value.greenhouseGas] : []
          }
          open={open && !disabled}
          onDropdownVisibleChange={next => {
            setOpen(next);
            if (!next) setSearch('');
          }}
          searchValue={search}
          showSearch={{
            filter: (input, path) =>
              path.some(option =>
                [option.value, option.label, ...(option.aliases ?? [])].some(
                  text => text.toLowerCase().includes(input.toLowerCase()),
                ),
              ),
          }}
          onChange={(_, path) => {
            const option = path[path.length - 1];
            if (!option || option.children || option.gwpValue === undefined)
              return;
            onChange({
              greenhouseGas: option.value,
              gwpValue: option.gwpValue,
            });
            setOpen(false);
            setSearch('');
            setEditing(false);
          }}
        >
          <Input
            id={inputId}
            aria-label='温室气体类型'
            aria-labelledby={`${inputId}-label`}
            aria-expanded={open && !disabled}
            autoComplete='off'
            value={value.greenhouseGas}
            maxLength={100}
            disabled={disabled}
            suffix={<img className={styles.icon} src={chevronIcon} alt='' />}
            onChange={event => {
              const greenhouseGas = event.target.value;
              const co2 = options
                .flatMap(group => group.children)
                .find(option => option.value === 'CO2');
              onChange({
                greenhouseGas,
                gwpValue:
                  greenhouseGas.trim() === 'CO2'
                    ? co2?.gwpValue ?? '1'
                    : value.gwpValue,
              });
              setEditing(false);
              setSearch(greenhouseGas);
              setOpen(true);
            }}
            onBlur={() => {
              if (!value.greenhouseGas.trim())
                onChange({ greenhouseGas: 'CO2', gwpValue: '1' });
            }}
            onKeyDown={event => {
              if (event.key === 'Escape') setOpen(false);
              if (event.key === 'ArrowDown') setOpen(true);
            }}
          />
        </Cascader>
      )}
    </FormItem.BaseItem>
  );
}
