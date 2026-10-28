/*
 * @@description:列表table表头
 * @Author: lxc qifeng@carbonstop.net
 * @Date: 2022-10-20 14:34:59
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-10 17:08:43
 */

import I18N from '@src/lang/I18N';
import Permission from '@src/components/Permission';
import { checkPermissions } from '@src/components/Permission/utils';
import { TableActions } from '@src/components/Table/components/TableActions';
import { RouteMaps } from '@src/router/route-paths';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { Toast } from '@src/utils/Toast';
import { Button } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { compact } from 'lodash-es';
import '../style.less';

import { lessUnit } from './util';

export const getTableColumns = (
  history,
  controlPlan,
  carbonDischarge,
  accountReport,
  acountModel,
  emissionDic,
  emissionScene,
  donwload,
  unitM,
): ColumnsType => {
  const path = history.location.pathname;

  switch (path) {
    case RouteMaps.enterpriseCarbonAccountingDataQualityControlPlanList:
      // 控制计划列表
      return [
        {
          title: I18N.Certification.versionNumber2,
          dataIndex: 'versionCode',
          ellipsis: true,
          width: 90,
          render: (text: number) => text || '-',
        },
        {
          title: I18N.enterpriseCarbonAccount2.withinTheFormulationAndRevision,
          dataIndex: 'enactContent',
          ellipsis: true,
          width: 160,
          render: (text: number) => text || '-',
        },
        {
          title: I18N.enterpriseCarbonAccount2.whenFormulatingRevisions,
          dataIndex: 'enactTime',
          ellipsis: true,
          width: 160,
          render: (text: number) => text || '-',
        },
        {
          title: I18N.carbonFootprint.remarks,
          dataIndex: 'remark',
          ellipsis: true,
          width: 250,
          render: (text: number) => text || '-',
        },
        {
          title: I18N.carbonFootprint.updatedBy,
          dataIndex: 'updateBy',
          ellipsis: true,
          width: 90,
          render: (text: number) => text || '-',
        },
        {
          title: I18N.carbonFootprint.updateTime,
          dataIndex: 'updateTime',
          ellipsis: true,
          width: 190,
          render: (text: number) => text || '-',
        },
        {
          title: I18N.carbonFootprint.operation,
          dataIndex: 'supplyQuantity',
          fixed: 'right',
          width: 200,
          render: (text, record: any) => (
            <TableActions
              menus={compact([
                checkPermissions(
                  {
                    label: I18N.carbonFootprint.edit,
                    key: I18N.carbonFootprint.edit,
                    onClick: async () => {
                      history.push(
                        `${RouteMaps.enterpriseCarbonAccountingDataQualityControlPlanEdit}?id=${record.controlPlanId}`,
                      );
                    },
                  },
                  'enterprise:controlPlan:edit',
                ),
                checkPermissions(
                  {
                    label: I18N.carbonFootprint.copy,
                    key: I18N.carbonFootprint.copy,
                    onClick: async () => {
                      history.push(
                        `${RouteMaps.enterpriseCarbonAccountingDataQualityControlPlanCopy}?id=${record.controlPlanId}`,
                      );
                    },
                  },
                  'enterprise:controlPlan:copy',
                ),
                checkPermissions(
                  {
                    label: I18N.carbonFootprint.delete,
                    key: I18N.carbonFootprint.delete,
                    onClick: async () => {
                      controlPlan?.('delete', record.controlPlanId);
                    },
                  },
                  'enterprise:controlPlan:delete',
                ),
                checkPermissions(
                  {
                    label: I18N.carbonFootprint.check,
                    key: I18N.carbonFootprint.check,
                    onClick: async () => {
                      history.push(
                        `${RouteMaps.enterpriseCarbonAccountingDataQualityControlPlanDetail}?id=${record.controlPlanId}`,
                      );
                    },
                  },
                  'enterprise:controlPlan:info',
                ),
              ])}
            />
          ),
        },
      ];

    case RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionStandardList:
      // 排放基准列表
      const standardTypeArr = [I18N.enterpriseCarbonAccount2.baseYear, I18N.enterpriseCarbonAccount2.quarterlyBenchmark, I18N.enterpriseCarbonAccount2.monthlyBenchmark];
      return [
        {
          title: I18N.enterpriseCarbonAccount2.benchmarkClassification,
          dataIndex: 'standardType',
          ellipsis: true,
          width: 160,
          render: (text: number) => standardTypeArr[text] || '-',
        },
        {
          title: I18N.enterpriseCarbonAccount2.setType,
          dataIndex: 'settingType',
          ellipsis: true,
          width: 160,
          render: (text: number) => (
            <div>
              {(typeof text === 'number' &&
                (text === 0 ? I18N.enterpriseCarbonAccount2.singleYear : I18N.enterpriseCarbonAccount2.annualAverage)) ||
                '-'}
            </div>
          ),
        },
        {
          title: I18N.enterpriseCarbonAccount2.benchmarkEmissions,
          dataIndex: 'standardEmissions',
          ellipsis: true,
          width: 200,
          render: (text: number, record: any, index: number) => {
            // return <div>{text || '-'}</div>;
            const detail = (
              <Permission flag='enterprise:standardEmission:info'>
                {record.standardEmissionId ? (
                  <Button
                    type='link'
                    onClick={() => {
                      history.push(
                        `${RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionStandardDetail}?id=${record.standardEmissionId}&standardType=${record.standardType}`,
                      );
                    }}
                  >
                    {I18N.carbonFootprint3.details}</Button>
                ) : (
                  '-'
                )}
              </Permission>
            );
            const total = <div>{text || '-'}</div>;
            let show = detail;
            if (index === 0) {
              show = total;
            }
            return show;
          },
        },
        {
          title: I18N.carbonFootprint.updatedBy,
          dataIndex: 'updateBy',
          ellipsis: true,
          width: 90,
          render: (text: number) => text || '-',
        },
        {
          title: I18N.carbonFootprint.updateTime,
          dataIndex: 'updateTime',
          ellipsis: true,
          width: 190,
          render: (text: number) => text || '-',
        },
        {
          title: I18N.carbonFootprint.operation,
          fixed: 'right',
          width: 150,
          dataIndex: 'supplyQuantity',
          render: (_, record: any) => (
            <>
              <Permission flag='enterprise:standardEmission:edit'>
                <Button
                  type='link'
                  onClick={() => {
                    history.push(
                      `${
                        RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionStandardEdit
                      }?id=${record.standardEmissionId || 0}&isEidt=${
                        record.soleTime ? '1' : '0'
                      }&standardType=${record.standardType}`,
                    );
                  }}
                >
                  {I18N.carbonFootprint.edit}</Button>
              </Permission>
              <Permission flag='enterprise:standardEmission:info'>
                {record.standardEmissionId ? (
                  <Button
                    type='link'
                    onClick={() => {
                      history.push(
                        `${RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionStandardDetail}?id=${record.standardEmissionId}&standardType=${record.standardType}`,
                      );
                    }}
                  >
                    {I18N.carbonFootprint.check}</Button>
                ) : (
                  ''
                )}
              </Permission>
            </>
          ),
        },
      ];
    case RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionLessSceneList:
      // 减排场景列表
      return [
        {
          title: I18N.enterpriseCarbonAccount2.emissionReductionScenarioName,
          dataIndex: 'sceneName',
          ellipsis: true,
          width: 160,
          render: (text: number) => text || '-',
        },
        {
          title: I18N.enterpriseCarbonAccount2.totalEmissionReduction,
          dataIndex: 'totalQuantity',
          ellipsis: true,
          width: 200,
          render: (text: number, record: any) => {
            let totalLessenType1;
            let totalLessenType2;
            if (record.totalUnit) {
              totalLessenType1 = `${record.totalDesc}：${
                record.totalInitValue
              }-${record.totalEndValue}${lessUnit[record.totalUnit].label}`;
              totalLessenType2 = `${record.totalDesc}：${record.totalQuantity}${
                lessUnit[record.totalUnit].label
              }`;
            }
            return (
              <div>
                {(record.totalUnit &&
                  (record.totalLessenType && record.totalLessenType === 1
                    ? `${totalLessenType1}`
                    : totalLessenType2)) ||
                  '-'}
              </div>
            );
          },
        },
        {
          title: I18N.enterpriseCarbonAccount2.unitEmissionReduction,
          dataIndex: 'unitQuantity',
          ellipsis: true,
          width: 250,
          render: (text: number, record: any) => {
            // console.log('record', record);

            let dictLabel = '';
            if (record?.unitUnitType) {
              const arrUnitUnitType = record?.unitUnitType?.split(',');
              if (arrUnitUnitType.length) {
                dictLabel = unitM?.find(
                  item => item.dictValue === arrUnitUnitType[1],
                )?.dictLabel;
              }
            }

            const unitLessenType1 = `${record?.unitDesc}：${
              record?.unitInitValue
            }-${record?.unitEndValue}${
              record?.unitUnit && lessUnit[record?.unitUnit || 0].label
            }/${dictLabel}`;
            const unitLessenType2 = `${record?.unitDesc}：${
              record?.unitQuantity
            }${
              record?.unitUnit && lessUnit[record?.unitUnit || 0].label
            }/${dictLabel}`;

            return (
              <div>
                {(record?.unitDesc &&
                  record?.unitUnit &&
                  (record?.unitLessenType && record?.unitLessenType === 1
                    ? `${unitLessenType1}`
                    : unitLessenType2)) ||
                  '-'}
              </div>
            );
          },
        },
        {
          title: I18N.carbonFootprint.updatedBy,
          dataIndex: 'updateBy',
          ellipsis: true,
          width: 90,
          render: (text: number) => text || '-',
        },
        {
          title: I18N.carbonFootprint.updateTime,
          dataIndex: 'updateTime',
          ellipsis: true,
          width: 190,
          render: (text: number) => text || '-',
        },
        {
          title: I18N.carbonFootprint.operation,
          fixed: 'right',
          width: 200,
          dataIndex: 'supplyQuantity',
          render: (_, record: any) => (
            <TableActions
              menus={compact([
                checkPermissions(
                  {
                    label: I18N.carbonFootprint.edit,
                    key: I18N.carbonFootprint.edit,
                    onClick: async () => {
                      history.push(
                        `${RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionLessSceneEdit}?id=${record.lessenEmissionId}`,
                      );
                    },
                  },
                  'enterprise:lessenEmission:edit',
                ),
                checkPermissions(
                  {
                    label: I18N.carbonFootprint.delete,
                    key: I18N.carbonFootprint.delete,
                    onClick: async () => emissionScene?.('delete', record),
                  },
                  'enterprise:lessenEmission:delete',
                ),
                checkPermissions(
                  {
                    label: I18N.carbonFootprint.check,
                    key: I18N.carbonFootprint.check,
                    onClick: async () =>
                      history.push(
                        `${RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionLessSceneDetail}?id=${record.lessenEmissionId}`,
                      ),
                  },
                  'enterprise:lessenEmission:info',
                ),
              ])}
            />
          ),
        },
      ];
    case RouteMaps.enterpriseCarbonAccountingDownloadList:
    case RouteMapsCorbonFootprint3.carbonFootprint3Download:
      // 下载管理列表
      return [
        {
          title: I18N.carbonFootprint.fileName,
          dataIndex: 'fileName',
          ellipsis: true,
          width: 400,
          render: (text: number) => text || '-',
        },
        {
          title: I18N.carbonFootprint.fileStatus,
          dataIndex: 'status',
          ellipsis: true,
          width: 100,
          render: (text: string) => {
            const classArr = ['generatoring', 'generatored'];
            return (
              <div className={classArr[text || 0]}>
                {/*  eslint-disable-next-line no-nested-ternary */}
                {text === '0'
                  ? I18N.carbonFootprint.generating
                  : // eslint-disable-next-line no-nested-ternary
                  text === '1'
                  ? I18N.carbonFootprint.generated
                  : text === '2'
                  ? I18N.enterpriseCarbonAccount2.generationFailed
                  : '-'}
              </div>
            );
          },
        },
        {
          title: I18N.carbonFootprint.operator2,
          dataIndex: 'createBy',
          ellipsis: true,
          width: 100,
          render: (text: number) => text || '-',
        },
        {
          title: I18N.carbonFootprint.creationTime,
          dataIndex: 'createTime',
          ellipsis: true,
          width: 190,
          render: (text: number) => text || '-',
        },
        {
          title: I18N.carbonFootprint.operation,
          fixed: 'right',
          dataIndex: 'supplyQuantity',
          width: 80,
          render: (text, record: any) => (
            <>
              {/* <Permission flag='meeting:activity:edit'> */}
              {record.status === '1' ? (
                <Button
                  type='link'
                  style={{ paddingLeft: 0 }}
                  onClick={() => {
                    if (record.path) {
                      donwload?.('donwload', record);
                    } else {
                      Toast('warn', I18N.enterpriseCarbonAccount2.currentlyUnavailableForDownload);
                    }
                  }}
                >
                  {I18N.carbonFootprint.download}</Button>
              ) : (
                ''
              )}
              {/* </Permission> */}
            </>
          ),
        },
      ];
    default:
      return [];
  }
};
