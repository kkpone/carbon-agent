/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-01-06 15:15:45
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-29 18:36:13
 */
import selectImg from '@assets/images/tabSelect.png';
import { Field } from '@formily/core';
import {
  connect,
  mapProps,
  mapReadPretty,
  useField,
  useForm,
} from '@formily/react';
import { Button } from '@src/components/Button';
import SearchModalFactor from '@src/components/SearchFactor/ModalFactor';
import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';

import styles from './index.module.less';
import { MATCH_WAY } from '../../discharge/process/constant';
import { getUnitValueByLabel } from '../../discharge/process/utils';
import ModalProcessLib from '../ProcessLibProductSelect/ModalProcessLib';
import { ProcessProduct } from '../ProcessLibProductSelect/type';

type FormilyButtonSelectProps = {
  value: number | string;
  options: { value: number | string; label: number | string }[];
  disabled: boolean;
  onChange: (value: number | string) => void;
  onFactorSelect?: () => Promise<void>;
};

const FormilyButtonSelect = ({
  value,
  options,
  disabled,
  onChange,
  onFactorSelect,
}: FormilyButtonSelectProps) => {
  const [showModalFactor, setShowModalFactor] = useState<boolean>(false);
  const [showModalProcess, setShowModalProcess] = useState<boolean>(false);

  const form = useForm<{ productName: string; processLibId: number }>();
  const field = useField<Field>();
  const parentPath = field.path.segments[0];
  const matchWay = field.value;

  const selectFactor = async data => {
    const [numeratorUnit, denominatorUnit] = (data.unit || '').split('/');
    const [parentDenominatorUnitValue, denominatorUnitValue] =
      await getUnitValueByLabel(denominatorUnit);

    const { factor } = data;

    form.setFieldState(`${parentPath}.factorObj`, {
      value: {
        ...data,
        numeratorUnit,
        denominatorUnit: [parentDenominatorUnitValue, denominatorUnitValue],
        realFactor: factor,
      },
    });

    if (typeof onFactorSelect === 'function') {
      await onFactorSelect();
    }

    setShowModalFactor(false);
    await form.validate();
  };

  /**
   * @description: 选择过程库
   * @param {ProcessProduct} product 选中的过程
   */
  const selectFactorProcess = async (product: ProcessProduct) => {
    form.setFieldState(`${parentPath}.processProduct`, {
      value: {
        processName: product.processName,
        productName: product.productName,
        accountYear: product.accountYear,
        unitName: product.unitName,
        unitCode: product.unitCode,
        type: product.type,
        id: product.id,
        processId: product.processId,
      },
    });

    form.setFieldState([parentPath, 'processProduct', 'unitCode'], {
      data: {
        value: product.unitCode,
      },
    });

    setShowModalProcess(false);
  };
  return (
    <>
      <div className={styles.buttonSelectContainerMain}>
        <div className={styles.buttonSelectContainer}>
          {options.map(({ value: optionValue, label }) => (
            <div
              className={classNames(styles.defaultBtn, {
                [styles.activeBtn]: value === optionValue,
                [styles.disabledBtn]: disabled,
              })}
              key={optionValue}
              onClick={() => {
                if (!disabled) {
                  onChange(optionValue);
                }
              }}
            >
              <span>{label}</span>
              {value === optionValue && (
                <img className={styles.selectImg} src={selectImg} alt='' />
              )}
            </div>
          ))}
        </div>
        {matchWay !== MATCH_WAY.FACTOR_CREATE && (
          <div>
            <Button
              type='primary'
              onClick={async () => {
                if (matchWay === MATCH_WAY.FACTOR) {
                  setShowModalFactor(true);
                } else {
                  setShowModalProcess(true);
                }
              }}
            >
              {matchWay === MATCH_WAY.FACTOR
                ? I18N.carbonFootprint3.chooseEmissionFactors
                : I18N.carbonFootprint3.selectProcessLibrary2}
            </Button>
          </div>
        )}
      </div>
      <Modal
        title={I18N.carbonFootprint3.chooseEmissionFactors}
        width={1200}
        maskClosable={false}
        open={showModalFactor}
        footer={null}
        style={{
          top: 50,
        }}
        bodyStyle={{
          paddingBottom: 0,
        }}
        onCancel={() => setShowModalFactor(false)}
      >
        <SearchModalFactor
          subClick={selectFactor}
          factorName={form.values.productName || form.values[parentPath].name}
          onCancel={async () => {
            setShowModalFactor(false);
          }}
        />
      </Modal>
      <Modal
        title={I18N.carbonFootprint3.selectionProcess}
        width={1200}
        maskClosable={false}
        open={showModalProcess}
        footer={null}
        style={{
          top: 50,
        }}
        bodyStyle={{
          paddingBottom: 0,
        }}
        onCancel={() => setShowModalProcess(false)}
      >
        <ModalProcessLib
          processLibId={form.values.processLibId}
          onCancel={() => {
            setShowModalProcess(false);
          }}
          processProductParams={{
            productName: form.values[parentPath].name,
          }}
          onConfirm={selectFactorProcess}
        />
      </Modal>
    </>
  );
};

const FormilyButtonSelectReadPretty = (props: { value: number }) => {
  const field = useField<Field>();
  const options = field.dataSource
    ? (field.dataSource as { label: string; value: number }[])
    : [];
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div className={styles.readPretty}>
        {options.find(option => option.value === props.value)?.label || '-'}
      </div>
    </div>
  );
};

export default connect(
  FormilyButtonSelect,
  mapProps({ value: true }, (props, field) => ({
    ...props,
    options:
      ((field as Field).dataSource as FormilyButtonSelectProps['options']) ||
      [],
  })),
  mapReadPretty(FormilyButtonSelectReadPretty),
);
