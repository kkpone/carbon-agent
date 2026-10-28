/*
 * @@description:分类排放源管理表头
 * @Author: lxc qifeng@carbonstop.net
 * @Date: 2022-10-20 14:34:59
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-01 18:45:43
 */

import I18N from '@src/lang/I18N';
import { Dicts } from '@src/views/emission/Show/type';
import { selectOptionMap } from '@src/views/emission/utils';
import { EmissionFactorMenu } from '@src/views/emission/utils/index-type';
import { Cascader, Col, InputNumber, Row, Select, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import BigInteger from 'bignumber.js';
import '../../../style.less';
import { RouteMaps } from '@src/router/route-paths';
import { QuestionCircleOutlined } from '@ant-design/icons';

import { apiGwpInfo } from '../../../service';

import { RouteMapsSupplyChain2 } from '@src/router/route-paths/supplyChain2';
import { Ellipsis } from '@src/components/Ellipsis';

interface FactorGasType {
  isDisabled: string;
  menuList: EmissionFactorMenu;
  cascaderOptions: Dicts[];
  setFactorDatas: (item) => any;
  changeDenominator: (item) => void;
  factorId?: number | string;
  fillType?: string;
}
const gwpInfo = {
  title: (
    <Tooltip title={I18N.enterpriseCarbonAccount2.gwpRefersTo}>
      {I18N.enterpriseCarbonAccount2.gwpValue}
      <QuestionCircleOutlined />
    </Tooltip>
  ),
  dataIndex: 'gwp',
  render(text) {
    return <span>{text || '-'}</span>;
  },
};
export const FactorGasTableColumns = ({
  isDisabled,
  menuList,
  cascaderOptions,
  setFactorDatas,
  changeDenominator,
  factorId,
  fillType,
}: FactorGasType): ColumnsType<any> => {
  const path = window.location.pathname;
  const isIncludeGwp = [
    RouteMapsSupplyChain2.supplySupplierCarbonDataCarbonAccountAuditEmissionDetail,
    RouteMapsSupplyChain2.supplySupplierCarbonDataCarbonAccountDetailEmissionDetail,
    RouteMapsSupplyChain2.supplyCarbonDataFillAcctionDetailEmessionDetail,
    RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDetail,
    RouteMaps.enterpriseCarbonAccountingcarbonDischargeCopyEmission,
    RouteMaps.enterpriseCarbonAccountingcarbonDischargeDraftEmission,
    RouteMaps.enterpriseCarbonAccountingcarbonDischargeEditEmission,
    RouteMaps.enterpriseCarbonAccountingcarbonDischargeAddEmission,
  ].some(p => p === path);

  const selectGas = ['HFCs', 'PFCs'];
  const menuKey = Object.keys(menuList).filter(k =>
    selectGas?.some(g => k.includes(g)),
  );
  const beasColumns: ColumnsType<any> = [
    {
      title: I18N.components.greenhouseGasCategory,
      dataIndex: 'greenhouseGasesType',
      ellipsis: true,
      width: 128,
      render(t: string) {
        return <Ellipsis text={t} />; // <span>{t}</span>;
      },
    },
    {
      title: I18N.components.greenhouseGases,
      dataIndex: 'greenhouseGases',
      ellipsis: true,
      width: 112,
      render: (value: string, record: any, index: number) => {
        const matchKey = selectGas?.find(g =>
          record?.greenhouseGasesType?.includes?.(g),
        );

        if (matchKey) {
          return (
            <Select
              className='add-factor-select-sub-gas'
              value={`${value}`?.length > 0 ? value : undefined}
              placeholder={isDisabled ? '' : I18N.carbonFootprint.pleaseSelect}
              // onDropdownVisibleChange={() => console.log(222)}
              onChange={(e, row: any) => {
                setFactorDatas(arr => {
                  arr[index].greenhouseGases = e;
                  return [...arr];
                });

                if (isIncludeGwp) {
                  const computationId = sessionStorage.getItem('computationId');
                  apiGwpInfo({
                    computationId,
                    greenhouseGases: row.label,
                  }).then((res: any) => {
                    const { gwp } = res.data.data;
                    setFactorDatas(arr => {
                      record.gwp = gwp;
                      return [...arr];
                    });
                  });
                }
              }}
              disabled={
                isDisabled === 'detail' ||
                !!factorId ||
                fillType === 'emissionFactor'
              }
              options={menuList[
                menuKey?.find(k =>
                  k.includes(matchKey),
                ) as keyof EmissionFactorMenu
              ]?.map(d => ({ label: d.dictLabel, value: d.dictValue }))}
            />
          );
        }
        return <Ellipsis text={record.greenhouseGases} />;
      },
    },
    {
      title: I18N.carbonFootprint.factorValue,
      ellipsis: true,
      width: 112,
      dataIndex: 'factorValue',
      render: (value: number, _, index: number) => (
        <InputNumber
          style={{ width: '100%' }}
          placeholder={isDisabled ? '' : I18N.carbonFootprint.pleaseEnter}
          value={value}
          disabled={
            isDisabled === 'detail' ||
            !!factorId ||
            fillType === 'emissionFactor'
          }
          type='number'
          min={0}
          max={99999.99999}
          onChange={e => {
            // @ts-ignore
            setFactorDatas(arr => {
              arr[index].factorValue = e
                ? new BigInteger(Number(e)).toFixed(9)
                : '';
              return [...arr];
            });
          }}
        />
      ),
    },
    {
      title: I18N.components.factorUnit,
      ellipsis: true,
      dataIndex: 'nuit',
      width: 352,
      render: (value, record: any, index: number) => {
        // debugger;
        const gasType = record?.greenhouseGasesType || record?.greenhouseGases;
        const numberTypeZ =
          menuList[
            (Object.entries(selectOptionMap).find(t =>
              gasType.includes(t[0]),
            )?.[1] || selectOptionMap['CO₂e']) as keyof EmissionFactorMenu
          ];
        return (
          <Row gutter={24}>
            <Col span='11'>
              <Select
                style={{ width: '100%' }}
                disabled={
                  isDisabled === 'detail' ||
                  !!factorId ||
                  fillType === 'emissionFactor'
                }
                placeholder={
                  isDisabled ? '' : I18N.carbonFootprint.pleaseSelect
                }
                // @ts-ignore
                value={record?.factorUnit || undefined}
                onChange={e => {
                  // @ts-ignore
                  setFactorDatas(arr => {
                    // eslint-disable-next-line no-param-reassign
                    arr[index].factorUnit = e;
                    return [...arr];
                  });
                }}
                options={numberTypeZ?.map(t => ({
                  value: t.dictValue,
                  label: t.dictLabel,
                }))}
              />
            </Col>
            <span style={{ position: 'relative', top: 5 }}>/</span>
            <Col span='11'>
              <Cascader
                style={{ width: '100%' }}
                fieldNames={{
                  label: 'dictLabel',
                  value: 'dictValue',
                  children: 'enumList',
                }}
                displayRender={label => label[label.length - 1]}
                // @ts-ignore
                options={cascaderOptions}
                placeholder={
                  isDisabled ? '' : I18N.carbonFootprint.pleaseSelect
                }
                allowClear={false}
                value={record?.factorUnitM?.split(',')}
                disabled={
                  isDisabled === 'detail' ||
                  !!factorId ||
                  fillType === 'emissionFactor'
                }
                onChange={(value: any, option: any) => {
                  changeDenominator(option);
                  // @ts-ignore
                  setFactorDatas(arr => {
                    const factorUnitMItem = option[1].dictLabel;
                    if (factorUnitMItem) {
                      // @ts-ignore
                      arr.forEach(item => {
                        // eslint-disable-next-line no-param-reassign
                        item.factorUnitM = value.join(',');
                        // eslint-disable-next-line no-param-reassign
                        item.activeUnit = factorUnitMItem;
                      });
                    }
                    return [...arr];
                  });
                }}
              />
            </Col>
          </Row>
        );
      },
    },
  ];

  if (isIncludeGwp) {
    return beasColumns.concat(gwpInfo);
  }
  return beasColumns;
};
