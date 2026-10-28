/**
 * @description 非过程类型页面 自建因子详情/数据库数据/供应商结果数据
 */

import I18N from '@src/lang/I18N';
import { Descriptions, Table } from 'antd';

import { changeTableColumnsNoText, formatScientific } from '@/utils';

import { indicatorColumn } from './column';
import style from './index.module.less';
import { FactorDataResp } from './type';
import { SELECT_BUTTON_TYPE } from '../ProcessManageDrawer/constant';

const { DATABASE_DATA, SUPPLIER_DATA } = SELECT_BUTTON_TYPE;

const OtherData = ({
  baseInfo,
}: {
  /** 基本信息 */
  baseInfo?: FactorDataResp;
}) => {
  const {
    ioName,
    dataValue,
    unitName,
    linkType,
    linkType_name,
    dataType_name,
    ioData,
    factorList,
    supplierRef,
  } = baseInfo || {};

  /** 是否展示评价指标数据 */
  const isShowIndicatorData = linkType !== DATABASE_DATA;

  /** 处理评价指标表格数据值为科学记数法-引用供应商结果数据 */
  const newSupplierResultList = supplierRef?.resultList?.map(list => ({
    ...list,
    dataValue: formatScientific(list?.dataValue),
  }));

  /** 处理评价指标表格数据值为科学记数法-自建因子 */
  const newFactorListResultList = factorList?.map(list => ({
    ...list,
    dataValue: formatScientific(list?.dataValue),
  }));

  /** 评价指标数据 */
  const targetDataSource =
    linkType === SUPPLIER_DATA
      ? newSupplierResultList
      : newFactorListResultList;

  /** 数量 */
  const num = dataValue && unitName ? dataValue + unitName : '-';

  /** 自建因子/数据库数据 */
  const {
    factorName = '-',
    productName = '-',
    timeRepresentStart,
    timeRepresentEnd,
    areaRepresentName,
    areaRepresentDetail,
    dbName = '-',
  } = ioData || {};

  /** 时间代表性 */
  const timeRepresent =
    timeRepresentStart && timeRepresentEnd
      ? I18N.template(I18N.carbonFootPrintLCA.timeR, {
          val1: timeRepresentStart,
          val2: timeRepresentEnd,
        })
      : '-';

  /** 地理代表性 */
  const areaRepresent = `${areaRepresentName || ''}${
    areaRepresentDetail ? `-${areaRepresentDetail}` : ''
  }`;

  /** 基本数据信息 */
  const getBaseDataInfo = (type?: number) => {
    switch (type) {
      case DATABASE_DATA:
        return [
          {
            label: I18N.carbonFootPrintLCA.databaseName,
            value: dbName,
          },
          {
            label: I18N.carbonFootPrintLCA.activityName,
            value: factorName,
          },
          {
            label: I18N.carbonFootPrintLCA.relatedProductNames,
            value: productName,
          },
          {
            label: I18N.carbonFootPrintLCA.timeRepresentativeness,
            value: timeRepresent,
          },
          {
            label: I18N.Factors.geographicalRepresentativeness,
            value: areaRepresent,
          },
        ];
      case SUPPLIER_DATA:
        return [
          {
            label: I18N.supplyChainCarbonManagement.supplierData,
            value: supplierRef?.dataCode,
          },
          {
            label: I18N.carbonFootprint.supplierName,
            value: supplierRef?.supplierName,
          },
          {
            label: I18N.supplyChainCarbonManagement.purchaseProductName,
            value: supplierRef?.productName,
          },
          {
            label: I18N.carbonFootPrintLCA.functionalUnits,
            value: supplierRef?.funcUnit,
          },
        ];
      default:
        // 自建因子
        return [
          {
            label: I18N.carbonFootPrintLCA.dataName,
            value: factorName,
          },
          {
            label: I18N.Factors.productName,
            value: productName,
          },
          {
            label: I18N.carbonFootPrintLCA.timeRepresentativeness,
            value: timeRepresent,
          },
          {
            label: I18N.Factors.geographicalRepresentativeness,
            value: areaRepresent,
          },
        ];
    }
  };

  return (
    <div className={style.wrap}>
      <div className={style.baseInfo}>
        <Descriptions title={ioName || '-'}>
          <Descriptions.Item label={I18N.carbonFootPrintLCA.dataType}>
            {linkType_name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={I18N.carbonFootPrintLCA.flowType}>
            {dataType_name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={I18N.carbonFootPrintLCA.quantity}>
            {num}
          </Descriptions.Item>
        </Descriptions>
      </div>
      <div className={style.baseDataInfo}>
        <div className={style.headerWrapper}>
          {I18N.carbonFootPrintLCA.basicDataInformation}
        </div>
        <Descriptions bordered column={1} labelStyle={{ width: '200px' }}>
          {getBaseDataInfo(linkType)?.map(({ label, value }) => (
            <Descriptions.Item label={label || '-'}>
              {value || '-'}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </div>
      {isShowIndicatorData && (
        <div className={style.evaluationIndicatorData}>
          <div className={style.headerWrapper}>
            {I18N.carbonFootPrintLCA.numberOfEvaluationIndicators}
          </div>
          <Table
            columns={changeTableColumnsNoText(indicatorColumn(), '-')}
            dataSource={targetDataSource || []}
            pagination={false}
            bordered
          />
        </div>
      )}
    </div>
  );
};
export default OtherData;
