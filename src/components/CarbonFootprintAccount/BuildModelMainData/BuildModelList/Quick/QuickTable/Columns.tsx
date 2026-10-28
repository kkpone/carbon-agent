import excelImg from '@src/assets/svg/carbonFootprint/excel.svg';
import warnImg from '@src/assets/svg/warn.svg';
import I18N from '@src/lang/I18N';
import { shouldHideEcoinventValue } from '@src/utils/ecoinvent';
import {
  MODEL_EMISSION_MATCH_WAY,
  MODEL_EMISSION_REQUEST_STATE,
} from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import TextWidthOverflow from '@src/views/carbonFootprint3/component/TextOverflowTable/byWidth';
import { ALL_EMISSION_LABEL } from '@src/views/carbonFootprint3/constant';
import { Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';

import { AmountUnit } from './AmountUnit';
import { QuickAccountModelEmissionData } from './type';

/**
 * 快速核算 - 表格的表头
 */
export const QuickBusinessAccountTableCol = (
  accountId: number,
  isDetail: boolean,
  refresh: () => void,
  isInSupplyChain?: boolean,
  onOpenDetailDrawer?: (item: QuickAccountModelEmissionData) => void,
): ColumnsType<QuickAccountModelEmissionData> => [
  {
    title: I18N.carbonFootprint.number,
    width: 90,
    fixed: 'left',
    dataIndex: 'index',
  },
  {
    title: I18N.carbonFootprint.name,
    width: 230,
    fixed: 'left',
    dataIndex: 'name',
    ellipsis: true,
    render: (text: string, item) => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {item?.aiFlag ? (
          <div
            style={{
              width: 80,
              height: 20,
              background: '#FFFBF0',
              borderRadius: 4,
              border: '1px  dashed #D2D6DA',
              color: '#FBA93E',
              fontSize: 12,
              marginRight: 10,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {I18N.carbonFootprint3.aiTemporary}
          </div>
        ) : undefined}
        {(!item.emissionTotal ||
          (!!item.needTrans && item.transTotal === '')) && (
          <Tooltip title={I18N.carbonFootprint3.thisEmissionSourceInformation}>
            <div
              style={{
                width: 16,
                height: 16,
                marginRight: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img style={{ width: 16, height: 16 }} src={warnImg} alt='warn' />
            </div>
          </Tooltip>
        )}
        <TextWidthOverflow
          width={item?.aiFlag ? 130 : onOpenDetailDrawer ? 150 : 180}
          value={text}
        />
        {onOpenDetailDrawer && (
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              marginLeft: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              background: '#F7F8F9',
            }}
            onClick={e => {
              e.stopPropagation();
              onOpenDetailDrawer(item);
            }}
          >
            <img src={excelImg} alt='excel' style={{ width: 12, height: 12 }} />
          </div>
        )}
      </div>
    ),
  },
  {
    title: I18N.carbonFootprint.type,
    width: 120,
    dataIndex: 'type',
    render: (VAL: number) => (
      <TextWidthOverflow width={120} value={ALL_EMISSION_LABEL()[VAL]} />
    ),
  },
  {
    title: I18N.carbonFootprint3.consumptionQuantity,
    dataIndex: 'unitStr',
    width: 300,
    render: (unitStr, item) => {
      if (isDetail || isInSupplyChain) {
        return <TextWidthOverflow width={300} value={unitStr} />;
      }
      return (
        <AmountUnit
          amount={item.amount?.toString()}
          unitCode={item.unitCode}
          disabled={
            Number(item.matchWay) === MODEL_EMISSION_MATCH_WAY.SUPPLIER &&
            item.requestState !== MODEL_EMISSION_REQUEST_STATE.NOT_SUBMIT
          }
          accountId={accountId?.toString()}
          aiFlag={item.aiFlag}
          id={item.id}
          unitName={item.unitName}
          refresh={refresh}
        />
      );
    },
  },
  {
    title: I18N.carbonFootprint.emissionFactors1,
    width: 200,
    dataIndex: 'matchObject',
    render: (val, item) => {
      const factorText = `${item.factor || '-'}${item.factorUnit || '-'}`;
      return (
        <TextWidthOverflow
          width={200}
          value={
            shouldHideEcoinventValue({
              factorPattern: val?.factorPattern,
              ecoinventValueVisible:
                val?.ecoinventValueVisible ?? item.ecoinventValueVisible,
            })
              ? I18N.carbonFootprint3.notDisplayedTemporarily
              : factorText || '-'
          }
          fontSize={16}
        />
      );
    },
  },
  {
    title: I18N.carbonFootprint.emissionKg,
    width: 200,
    dataIndex: 'emissionTotal',
    ellipsis: true,
    render: (text, item) => {
      if (
        Number(item.matchWay) === MODEL_EMISSION_MATCH_WAY.SUPPLIER &&
        item.requestState === MODEL_EMISSION_REQUEST_STATE.WAITING &&
        !item.matchObject?.id
      ) {
        return I18N.carbonFootprint3.waitingForSuppliers;
      }
      return <TextWidthOverflow width={200} value={text} />;
    },
  },
  {
    title: I18N.carbonFootprint3.transportationEmissionsK,
    dataIndex: 'transTotal',
    width: 250,
    render: text => {
      if (text === '0') {
        return '-';
      }
      return <TextWidthOverflow width={200} value={text} />;
    },
  },
  {
    title: I18N.carbonFootprint3.emissionProportion,
    width: 200,
    dataIndex: 'emissionRate',
    render: text => (text ? `${text}%` : '0.00%'),
  },
];
