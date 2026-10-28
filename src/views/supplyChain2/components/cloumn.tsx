/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-03-26 12:10:36
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-30 15:04:03
 */
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { BusinessAccountingModelEmissionData } from '@src/views/carbonFootprint3/BusinessAccountingModel/type';
import { UnitAccount } from '@src/views/carbonFootprint3/QuickBusinessAccounting/management/model';
import { QuickBusinessAccountingSourceUpdate } from '@src/views/carbonFootprint3/QuickBusinessAccounting/type';
import TextOverflowTable from '@src/views/carbonFootprint3/component/TextOverflowTable';
import { QUICK_ACCOUNT_EMISSION_LABEL } from '@src/views/carbonFootprint3/constant';
import { ISOFirstSelect } from '@src/views/enterpriseCarbonAccount2/listInfo/util';
import { ColumnsType } from 'antd/lib/table';

import { getOuterFootComputeEmission } from '../Outter/service';

/**
 * 供应商管理- 供应商列表  企业碳核算过程列表
 */
export const carbonAccoutCloumn = (): ColumnsType<any> => [
  {
    title: I18N.carbonFootprint3.emissionSourceName,
    dataIndex: 'name',
    ellipsis: true,
    width: 112,
    render: (text: number) => text || '-',
  },

  // {
  //   title: '排放源ID',
  //   dataIndex: 'sourceId',
  //   ellipsis: true,
  //   width: 136,
  //   render: (text: number) => text || '-',
  // },
  {
    title: I18N.components.emissionFacilityActivity,
    dataIndex: 'facility',
    ellipsis: true,
    width: 136,
    render: (text: number) => text || '-',
  },
  {
    title: I18N.enterpriseCarbonAccount2.isoClassification2,
    dataIndex: 'isoCategory',
    ellipsis: true,
    width: 216,
    render: (text: number) => (
      <div>{ISOFirstSelect[text]?.category || '--'}</div>
    ),
  },
  {
    title: I18N.carbonFootprint3.activityData,
    dataIndex: 'activityData',
    ellipsis: true,
    width: 112,
    render: (text: number, record) =>
      text && record.activityUnit ? `${text}${record.activityUnit}` : '--',
  },
  {
    title: I18N.enterpriseCarbonAccount2.emissionsTC,
    dataIndex: 'emissionQuantity',
    ellipsis: true,
    width: 136,
    render: (text: number) => text || '-',
  },
  // {
  //   title: '操作',
  //   dataIndex: 'versionCode',
  //   ellipsis: true,
  //   fixed: 'right',
  //   width: 96,
  //   render: (text: string, record) => {
  //     let href = '';
  //     if (
  //       path ===
  //       RouteMapsSupplyChain2.supplyChainSupplierDetailCarbonAccountDetail
  //     ) {
  //       href = `${RouteMapsSupplyChain2.supplyChainSupplierDetailCarbonAccountEmissionDetail}?id=${record.id}`;
  //     } else if (
  //       path === RouteMapsSupplyChain2.supplySupplierCarbonDataDetail
  //     ) {
  //       href = `${RouteMapsSupplyChain2.supplySupplierCarbonDataCarbonAccountDetailEmissionDetail}?id=${record.id}`;
  //     } else if (
  //       path === RouteMapsSupplyChain2.supplySupplierCarbonDataAudit
  //     ) {
  //       href = `${RouteMapsSupplyChain2.supplySupplierCarbonDataCarbonAccountAuditEmissionDetail}?id=${record.id}`;
  //     }
  //     return (
  //       <TableActions
  //         menus={[
  //           {
  //             key: '1',
  //             label: '查看',
  //             onClick: async () => {
  //               history.push(href);
  //             },
  //           },
  //         ]}
  //       />
  //     );
  //   },
  // },
];

/**
 * 快速核算 - 表格的表头
 */
export const carbonFootprintQuickBusinessAccountingColumns = (
  isDetail,
  childRef?: any,
): ColumnsType<any> => [
  // {
  //   title: '序号',
  //   width: 70,
  //   fixed: 'left',
  //   dataIndex: 'index',
  // },
  {
    title: I18N.carbonFootprint.name,
    width: 200,
    fixed: 'left',
    dataIndex: 'name',
    render: (val: string) => {
      if (val) {
        return <TextOverflowTable value={val} maxLength={20} />;
      }
      return '-';
    },
  },
  {
    title: I18N.carbonFootprint.quantity,
    width: 360,
    dataIndex: 'unitName',
    render: (val, item: BusinessAccountingModelEmissionData) => (
      <UnitAccount
        item={item}
        updateAmount={(e: QuickBusinessAccountingSourceUpdate) => {
          const { id, amount, typeExtra } = e;

          getOuterFootComputeEmission({
            id,
            amount,
            typeExtra: { amount },
            distance: typeExtra?.distance,
          }).then(({ data }) => {
            if (data.code === 200) {
              Toast('success', I18N.supplyChain2.quantityChangedTo);
              childRef?.current.reset();
            }
          });
        }}
        isDetail={isDetail}
        outter={!isDetail}
      />
    ),
  },
  {
    title: I18N.carbonFootprint.type,
    width: 100,
    dataIndex: 'type',
    render: (VAL: number) => QUICK_ACCOUNT_EMISSION_LABEL[VAL],
  },
  {
    title: I18N.carbonFootprint.emissionFactors,
    width: 200,
    dataIndex: 'matchObject',
    render: (val, item: BusinessAccountingModelEmissionData) => {
      if (!val) return '';
      return `${item.matchObject.factor || ''}${item.matchObject.unit || ''}`;
    },
  },
  {
    title: I18N.carbonFootprint.emissionKg,
    width: 200,
    dataIndex: 'emissionTotal',
    render: (text, item: BusinessAccountingModelEmissionData) => {
      if (
        Number(item.matchWay) === 5 &&
        item.requestState === 1 &&
        !item.matchObject?.id
      ) {
        return I18N.carbonFootprint3.waitingForSuppliers;
      }
      return text || '-';
    },
  },
];
