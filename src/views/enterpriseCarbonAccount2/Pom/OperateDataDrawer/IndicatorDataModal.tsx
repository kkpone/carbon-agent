import I18N from '@src/lang/I18N';
import { Button, InputNumber, Modal } from 'antd';
import classNames from 'classnames';
import { cloneDeep } from 'lodash-es';
import React, { FC, ReactElement, useState } from 'react';

import styles from './indicatorDataModal.module.less';
import { ORG_INDICATOR_TYPE, ORG_INDICATOR_TYPE_LABEL } from '../constant';

type IndicatorDataModalProps = {
  children: React.ReactElement;
  value?: {
    type: number | string;
    values: (number | null)[];
  };
  onConfirm: (val: {
    type: number | string;
    values: (number | null)[];
  }) => void | Promise<void>;
};

const IndicatorData: FC<
  Omit<IndicatorDataModalProps, 'children'> & { onCancel: () => void }
> = ({ value, onCancel, onConfirm }) => {
  const [innerValue, setInnerValue] = useState(() =>
    cloneDeep(
      value || {
        type: ORG_INDICATOR_TYPE.YEAR,
        values: [null],
      },
    ),
  );

  const [loading, setLoading] = useState(false);

  const onInputChange = (val: number | null, index: number) => {
    innerValue.values[index] = val;
    setInnerValue({ ...innerValue });
  };

  return (
    <div>
      <div className={styles.indicatorTypeContent}>
        {Object.values(ORG_INDICATOR_TYPE).map(type => (
          <div
            className={classNames(styles.indicatorType, {
              [styles.currIndicatorType]: type === innerValue.type,
            })}
            key={type}
            onClick={() => {
              let valuesCount = 1;

              if (type === ORG_INDICATOR_TYPE.QUARTER) {
                valuesCount = 4;
              } else if (type === ORG_INDICATOR_TYPE.MONTH) {
                valuesCount = 12;
              }
              setInnerValue({
                type,
                values: new Array(valuesCount).fill(null),
              });
            }}
          >
            {ORG_INDICATOR_TYPE_LABEL[type]}
          </div>
        ))}
      </div>
      <div
        className={classNames({
          [styles.quarterContent]:
            innerValue.type === ORG_INDICATOR_TYPE.QUARTER,
          [styles.monthContent]: innerValue.type === ORG_INDICATOR_TYPE.MONTH,
        })}
      >
        {innerValue.values.map((indicatorValue, index) => {
          let indicatorLabel =
            I18N.enterpriseCarbonAccount2.annualIndicatorValue;

          if (innerValue.type === ORG_INDICATOR_TYPE.QUARTER) {
            indicatorLabel = I18N.template(I18N.enterpriseCarbonAccount2.inde, {
              val1: index + 1,
            });
          } else if (innerValue.type === ORG_INDICATOR_TYPE.MONTH) {
            indicatorLabel = I18N.template(
              I18N.enterpriseCarbonAccount2.index,
              { val1: index + 1 },
            );
          }
          return (
            <div>
              <div className={styles.indicatorLabel}>{indicatorLabel}</div>
              <InputNumber
                className={styles.input}
                value={indicatorValue}
                precision={2}
                controls={false}
                placeholder={
                  I18N.enterpriseCarbonAccount2.pleaseEnterTheIndicators
                }
                onChange={val => {
                  onInputChange(val, index);
                }}
              />
            </div>
          );
        })}
      </div>
      <div className={styles.footer}>
        <Button onClick={onCancel}>{I18N.carbonFootprint.cancel}</Button>
        <Button
          type='primary'
          loading={loading}
          onClick={async () => {
            try {
              setLoading(true);
              await onConfirm(innerValue);
              onCancel();
            } finally {
              setLoading(false);
            }
          }}
        >
          {I18N.carbonFootprint.confirm2}
        </Button>
      </div>
    </div>
  );
};
const IndicatorDataModal: FC<
  IndicatorDataModalProps & { title: ReactElement }
> = ({ children, value, title, onConfirm }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Modal
        title={title}
        width={512}
        open={open}
        destroyOnClose
        footer={null}
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      >
        <IndicatorData
          value={value}
          onConfirm={onConfirm}
          onCancel={() => setOpen(false)}
        />
      </Modal>
      {React.cloneElement(children, {
        onClick: () => {
          setOpen(!open);
        },
      })}
    </>
  );
};

export default IndicatorDataModal;
