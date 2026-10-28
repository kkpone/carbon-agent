import I18N from '@src/lang/I18N';
import { InputNumber, Modal, Table } from 'antd';
import { isNil, omit, pick } from 'lodash-es';
import { FC, useEffect, useState } from 'react';

import styles from './index.module.less';
import { SCOPE_VAL, SCOPE_BG_COLOR } from '../../constant';
import { Ghg } from '../../type';

type ScopeVal = Record<string, any>;

type ScopeInputProps = {
  ghgCategoryList: Ghg[];
  value?: ScopeVal;
  onChange?: (val: ScopeVal) => void;
};

const ClassifyModal: FC<{
  classifyList: Ghg[];
  open: boolean;
  defaultValue?: Record<string, any>;
  onCancel: () => void;
  onConfirm: (val: Record<string, any>) => void;
}> = props => {
  const { classifyList, open, defaultValue, onCancel, onConfirm } = props;

  const [value, setValue] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!open) {
      setValue({});
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setValue(
        classifyList.reduce(
          (prev, classify) => ({
            ...prev,
            [classify.value]: defaultValue?.[classify.value] || null,
          }),
          {},
        ),
      );
    }
  }, [open, classifyList, defaultValue]);

  return (
    <Modal
      title={I18N.enterpriseCarbonAccount2.scopeThreeCategories2}
      open={open}
      width={712}
      destroyOnClose
      onCancel={onCancel}
      onClose={onCancel}
      onOk={() => onConfirm(value)}
    >
      <Table
        rowKey='value'
        dataSource={classifyList}
        pagination={false}
        scroll={{ y: 400 }}
        columns={[
          {
            title: I18N.carbonFootprint3.category,
            width: 232,
            ellipsis: true,
            dataIndex: 'name',
          },
          {
            title: I18N.enterpriseCarbonAccount2.emissionReductionRatio,
            width: 232,
            dataIndex: 'value',
            render: (classifyKey: string) => (
              <InputNumber
                value={value[classifyKey]}
                placeholder={I18N.carbonFootprint.pleaseEnter}
                precision={2}
                controls={false}
                max={100}
                min={0}
                addonAfter='%'
                onChange={val => {
                  setValue({ ...value, [classifyKey]: val });
                }}
              />
            ),
          },
        ]}
      />
    </Modal>
  );
};

const ScopeInput: FC<ScopeInputProps> = props => {
  const { ghgCategoryList, value, onChange } = props;

  const [classifyModalOpen, setClassifyModalOpen] = useState(false);

  const scopeThree = ghgCategoryList.find(ghg => ghg.value === SCOPE_VAL.THREE);

  const scopeThreeClassifyKeys = (scopeThree?.classifyList || []).map(
    classify => classify.value,
  );

  const filledScopeThreeClassifyKeys = Object.keys(
    omit(value, [SCOPE_VAL.ONE, SCOPE_VAL.TWO, SCOPE_VAL.THREE]),
  );
  const onScopeValChange = (scopeKey: string, val: number | null) => {
    if (scopeKey === SCOPE_VAL.THREE) {
      onChange?.(
        isNil(val)
          ? pick(value, [SCOPE_VAL.ONE, SCOPE_VAL.TWO])
          : {
              ...pick(value, [SCOPE_VAL.ONE, SCOPE_VAL.TWO]),
              [scopeKey]: val,
              ...scopeThreeClassifyKeys.reduce(
                (prev, classifyKey) => ({ ...prev, [classifyKey]: val }),
                {},
              ),
            },
      );
    } else {
      onChange?.(
        !isNil(val) ? { ...value, [scopeKey]: val } : omit(value, [scopeKey]),
      );
    }
  };

  const onClassifyValChange = (val: Record<string, any>) => {
    const classifyKeys = Object.keys(val);

    const hasValueClassifyKeys = classifyKeys.filter(
      classifyKey => !isNil(val[classifyKey]),
    );

    if (classifyKeys.length === 0) {
      return;
    }

    const firstClassifyVal = val[classifyKeys[0]];

    if (
      classifyKeys.every(classifyKey => !isNil(val[classifyKey])) &&
      (classifyKeys.length === 1 ||
        classifyKeys
          .slice(1)
          .every(classifyKey => val[classifyKey] === firstClassifyVal))
    ) {
      onChange?.({
        ...pick(value, [SCOPE_VAL.ONE, SCOPE_VAL.TWO]),
        [SCOPE_VAL.THREE]: firstClassifyVal,
        ...val,
      });
    } else {
      onChange?.({
        ...pick(value, [SCOPE_VAL.ONE, SCOPE_VAL.TWO]),
        ...hasValueClassifyKeys.reduce(
          (prev, classifyKey) => ({ ...prev, [classifyKey]: val[classifyKey] }),
          {},
        ),
      });
    }

    setClassifyModalOpen(false);
  };

  return (
    <>
      <div className={styles.scopeInputContent}>
        {ghgCategoryList.map(ghg => {
          const { value: scopeKey, name } = ghg;
          return (
            <div className={styles.scopeInputItem} key={scopeKey}>
              <div
                className={styles.scopeInputItemLeft}
                style={{ backgroundColor: SCOPE_BG_COLOR[scopeKey] }}
              >
                {name}
              </div>
              <div className={styles.scopeInputItemRight}>
                <div className={styles['body-m']}>
                  {I18N.enterpriseCarbonAccount2.totalEmissionReduction2}
                </div>
                <InputNumber
                  className={styles.scopeInput}
                  value={value?.[scopeKey]}
                  precision={2}
                  placeholder={I18N.carbonFootprint.pleaseEnter}
                  controls={false}
                  max={100}
                  min={0}
                  addonAfter='%'
                  onChange={val => onScopeValChange(scopeKey, val)}
                />
              </div>
            </div>
          );
        })}
      </div>
      {scopeThree && (
        <div
          className={styles.scopeThreeClassifyCount}
          onClick={() => {
            setClassifyModalOpen(true);
          }}
        >
          {I18N.enterpriseCarbonAccount2.scopeThreeCategories}
          {filledScopeThreeClassifyKeys.length}/{scopeThreeClassifyKeys.length}
          ）
        </div>
      )}
      <ClassifyModal
        open={classifyModalOpen}
        defaultValue={omit(value, [
          SCOPE_VAL.ONE,
          SCOPE_VAL.TWO,
          SCOPE_VAL.THREE,
        ])}
        classifyList={scopeThree?.classifyList || []}
        onCancel={() => setClassifyModalOpen(false)}
        onConfirm={onClassifyValChange}
      />
    </>
  );
};

export default ScopeInput;
