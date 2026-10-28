/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-24 19:03:29
 * @Date: 2023-01-06 17:47:15
 * @@description:
 */
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { shouldHideEcoinventValue } from '@src/utils/ecoinvent';
import { Col, Input, Row } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useState, useEffect } from 'react';

import {
  MODEL_EMISSION_MATCH_WAY,
  MODEL_EMISSION_REQUEST_STATE,
  MODEL_EMISSION_TYPE_LABEL,
} from '../../BusinessAccountingModel/constant';
import { BusinessAccountingModelEmissionData } from '../../BusinessAccountingModel/type';
import TextOverflowTable from '../../component/TextOverflowTable';
import { ECOINVENT_TEXT } from '../../constant';
import { RegAccountValue } from '../../util';
import { CALC_WAY } from '../constant';
import { QuickBusinessAccountingSourceUpdate } from '../type';
import { checkEmissionAccessPermissions } from '../utils';

export const UnitAccount = (props: {
  item: BusinessAccountingModelEmissionData;
  updateAmount: (data: QuickBusinessAccountingSourceUpdate) => void;
  isDetail: boolean;
  outter?: boolean;
}) => {
  const { updateAmount, isDetail, outter } = props;
  const { type, typeExtra, unitName, amount, id } = props.item;

  const [amountVal, setAmountVal] = useState<string | number | undefined>(() =>
    typeExtra?.way === CALC_WAY.ENERGY_CONSUMPTION ? typeExtra?.amount : amount,
  );

  const [weightVal, setWeightVal] = useState<string | number | undefined>(
    () => typeExtra?.amount,
  );
  const [distanceVal, setDistanceVal] = useState<string | number | undefined>(
    () => typeExtra?.distance,
  );
  let disabled = isDetail || !checkEmissionAccessPermissions();

  if (outter) {
    disabled = !outter;
  }

  useEffect(() => {
    const way = typeExtra?.way;
    if (way === CALC_WAY.BEARING_RATIO || way === CALC_WAY.PRODUCT_WEIGHT) {
      setDistanceVal(typeExtra?.distance);
      setWeightVal(typeExtra?.amount);
    } else {
      setAmountVal(
        way === CALC_WAY.ENERGY_CONSUMPTION ? typeExtra?.amount : amount,
      );
    }
  }, [amount, typeExtra]);

  if (type === 7 && typeExtra.way === 2) {
    return (
      <Row>
        <Col span={8}>
          <Input
            onBlur={event => {
              const { value } = event.target;

              const errorText = RegAccountValue(value);
              if (errorText) {
                Toast('warn', errorText);
                return;
              }

              updateAmount({
                id,
                amount: value,
                typeExtra: {
                  ...typeExtra,
                  amount: value,
                },
              });
            }}
            onChange={e => setWeightVal(e.target.value)}
            disabled={disabled}
            value={weightVal}
            placeholder={I18N.carbonFootprint3.loadRatio3}
          />
        </Col>
        <Col
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          span={4}
        >
          %
        </Col>
        <Col span={8}>
          <Input
            onBlur={event => {
              const { value } = event.target;

              const errorText = RegAccountValue(value);
              if (errorText) {
                Toast('warn', errorText);
                return;
              }

              updateAmount({
                id,
                amount: value,
                typeExtra: {
                  ...typeExtra,
                  distance: value,
                },
              });
            }}
            onChange={e => setDistanceVal(e.target.value)}
            disabled={disabled}
            value={distanceVal}
            placeholder={I18N.carbonFootprint.transportationMileage}
          />
        </Col>
        <Col
          style={{ display: 'flex', alignItems: 'center' }}
          offset={1}
          span={3}
        >
          {I18N.carbonFootprint3.kilometre}
        </Col>
      </Row>
    );
  }
  if (type === 7 && typeExtra.way === 1) {
    return (
      <Row>
        <Col span={8}>
          <Input
            onBlur={event => {
              const { value } = event.target;

              const errorText = RegAccountValue(value);
              if (errorText) {
                Toast('warn', errorText);
                return;
              }

              updateAmount({
                id,
                amount: value,
                typeExtra: {
                  ...typeExtra,
                  amount: value,
                },
              });
            }}
            onChange={e => setWeightVal(e.target.value)}
            disabled={disabled}
            value={weightVal}
            placeholder={I18N.carbonFootprint.weight}
          />
        </Col>
        <Col
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          span={4}
        >
          {typeExtra.unitName}
        </Col>
        <Col span={8}>
          <Input
            onBlur={event => {
              const { value } = event.target;

              const errorText = RegAccountValue(value);
              if (errorText) {
                Toast('warn', errorText);
                return;
              }

              updateAmount({
                id,
                amount: value,
                typeExtra: {
                  ...typeExtra,
                  distance: value,
                },
              });
            }}
            onChange={e => setDistanceVal(e.target.value)}
            disabled={disabled}
            value={distanceVal}
            placeholder={I18N.carbonFootprint.transportationMileage}
          />
        </Col>
        <Col
          style={{ display: 'flex', alignItems: 'center' }}
          offset={1}
          span={3}
        >
          {I18N.carbonFootprint3.kilometre}
        </Col>
      </Row>
    );
  }
  return (
    <Row>
      <Col span={20}>
        <Input
          onBlur={event => {
            const { value } = event.target;

            const errorText = RegAccountValue(value);
            if (errorText) {
              Toast('warn', errorText);
              return;
            }

            updateAmount({
              id,
              amount: value,
              typeExtra: {
                ...typeExtra,
                amount: value,
              },
            });
          }}
          onChange={e => {
            setAmountVal(e.target.value);
          }}
          disabled={disabled}
          value={amountVal}
          placeholder={I18N.carbonFootprint.quantity}
        />
      </Col>
      <Col
        style={{ display: 'flex', alignItems: 'center' }}
        offset={1}
        span={3}
      >
        {unitName}
      </Col>
    </Row>
  );
};

/**
 * 快速核算 - 表格的表头
 */
export const carbonFootprintQuickBusinessAccountingManagementTableCol = (
  updateAmount: (data: QuickBusinessAccountingSourceUpdate) => void,
  isDetail: boolean,
): ColumnsType<any> => [
  {
    title: I18N.carbonFootprint.number,
    width: 70,
    fixed: 'left',
    dataIndex: 'index',
  },
  {
    title: I18N.carbonFootprint.name,
    width: 200,
    fixed: 'left',
    dataIndex: 'name',
    ellipsis: true,
    render: (text: string) => text || '-',
  },
  {
    title: I18N.carbonFootprint.quantity,
    width: 400,
    dataIndex: 'unitName',
    render: (val, item: BusinessAccountingModelEmissionData) => (
      <UnitAccount
        item={item}
        updateAmount={updateAmount}
        isDetail={
          isDetail ||
          (Number(item.matchWay) === MODEL_EMISSION_MATCH_WAY.SUPPLIER &&
            MODEL_EMISSION_REQUEST_STATE.NOT_SUBMIT !== item.requestState &&
            !item.matchObject?.id)
        }
      />
    ),
  },
  {
    title: I18N.carbonFootprint.type,
    width: 100,
    dataIndex: 'type',
    render: (VAL: number) => MODEL_EMISSION_TYPE_LABEL[VAL],
  },
  {
    title: I18N.carbonFootprint.emissionFactors,
    width: 200,
    dataIndex: 'matchObject',
    render: (val, item: BusinessAccountingModelEmissionData) => {
      if (!val) {
        return '-';
      }
      const factorText = `${item.factor}${item.factorUnit}`;
      return (
        <TextOverflowTable
          value={
            shouldHideEcoinventValue(item) ? ECOINVENT_TEXT : factorText || '-'
          }
          maxLength={15}
        />
      );
    },
  },
  {
    title: I18N.carbonFootprint.emissionKg,
    width: 200,
    dataIndex: 'emissionTotal',
    ellipsis: true,
    render: (text, item: BusinessAccountingModelEmissionData) => {
      if (
        Number(item.matchWay) === MODEL_EMISSION_MATCH_WAY.SUPPLIER &&
        item.requestState === MODEL_EMISSION_REQUEST_STATE.WAITING &&
        !item.matchObject?.id
      ) {
        return I18N.carbonFootprint3.waitingForSuppliers;
      }
      return text || '-';
    },
  },
];
