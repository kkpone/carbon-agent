/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * @@description:报表表头数据
 * @Author: lixingchen qifeng@carbonstop.net
 * @Date: 2022-09-29 11:15:11
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-18 18:06:05
 */
/* eslint-disable no-case-declarations */

import {
  DownOutlined,
  QuestionCircleOutlined,
  RightOutlined,
} from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { tableMergeCellsRender } from '@src/utils/TableMerge';
import { Table, Tooltip } from 'antd';

import type {
  DisclosureGhgFactorField,
  DisclosureGhgRow,
  DisclosureOption,
} from '../../AccountingList/type';
import {
  factorType,
  GHGFirstSelect,
  ISOFirstSelect,
  ISOSecondSelect,
} from '../../listInfo/util';
import '../../style.less';
import { activityCategorys } from '../../utils';

const EMPTY_TEXT = '--';

const getCellText = (text: any) => text ?? EMPTY_TEXT;

const renderText = (text: any) => <div>{getCellText(text)}</div>;

const renderMajorGhgText = (text: any) => {
  const cellText = getCellText(text);

  return (
    <div className='major-ghg-ellipsis-text' title={`${cellText}`}>
      {cellText}
    </div>
  );
};

const renderMajorIndirectEmissionTitle = () => (
  <span className='major-ghg-title-with-tip'>
    <span className='major-ghg-title-text'>
      {I18N.enterpriseCarbonAccount2.whetherMajorIndirectEmission}
    </span>
    <Tooltip title={I18N.enterpriseCarbonAccount2.majorIndirectEmissionRuleTip}>
      <QuestionCircleOutlined className='major-ghg-title-tip-icon' />
    </Tooltip>
  </span>
);

const getDisclosureFactorLabel = (
  factorOptions:
    | Record<DisclosureGhgFactorField, DisclosureOption[]>
    | undefined,
  field: DisclosureGhgFactorField,
  value?: string,
) =>
  factorOptions?.[field]?.find(option => option.value === value)?.label ??
  EMPTY_TEXT;

const renderDisclosureScopeCell = (text: string, record: DisclosureGhgRow) => ({
  children: <div>{text ?? EMPTY_TEXT}</div>,
  props: {
    rowSpan: record.scopeRowSpan ?? 1,
  },
});

const isoClassifyColumn = (width: number) => ({
  title: I18N.enterpriseCarbonAccount2.emissionCategories,
  dataIndex: 'isoClassify',
  ellipsis: true,
  width,
  render: (text: string) => (
    <div>
      {ISOSecondSelect.find(item => item.id === String(text))?.category || '--'}
    </div>
  ),
});

export const getTableColumns = (
  isGroup: boolean,
  key: string,
  type,
  tarColectionFectoData,
  orgData,
  computedData,
  gasDischargeData,
  dataClassify,
  orgUncertaintyData,
  majorGhgData: DisclosureGhgRow[],
  majorGhgFactorOptions:
    | Record<DisclosureGhgFactorField, DisclosureOption[]>
    | undefined,
  indexColumn,
  commPage,
  page,
  setCommPage,
  setPage,
  syncGetCommData,
  syncGetTarColectionFectoData,
) => {
  switch (key) {
    case 'org':
      // 组织运营边界调查表
      const orgComm = {
        title: '',
        tableData: {
          dataSource: orgData[type],
          pagination: false,
          bordered: true,
          columns: [
            {
              title: I18N.enterpriseCarbonAccount2.reportBoundaries,
              dataIndex: 'type',
              render: (text: any, record: any, index: any) =>
                tableMergeCellsRender({
                  tableData: orgData[type],
                  record,
                  index,
                  objname: 'type',
                  text,
                }),
            },
            {
              title: I18N.carbonFootprint.emissionClassification,
              dataIndex: 'ghgCategory',
              render: (text: any, record: any, index: any) =>
                tableMergeCellsRender({
                  tableData: orgData[type],
                  record,
                  index,
                  objname: 'ghgCategory',
                  text,
                }),
            },
            {
              title: I18N.enterpriseCarbonAccount2.emissionCategories,
              dataIndex: 'ghgClassify',
              render: (text: any, record: any, index: any) =>
                tableMergeCellsRender({
                  tableData: orgData[type],
                  record,
                  index,
                  objname: 'ghgClassify',
                  text,
                }),
            },
            {
              title: I18N.carbonFootprint.emissionSources,
              dataIndex: 'name',
            },
            {
              title: I18N.enterpriseCarbonAccount2.facilityActivities,
              dataIndex: 'facility',
            },
          ],
        },
        pagination: false,
      };

      return [orgComm];
    case 'target':
      // 排放源识别表
      const targetComm = {
        title: '',
        tableData: {
          dataSource: tarColectionFectoData,
          columns: [
            ...indexColumn,
            {
              title: I18N.carbonFootprint.emissionSources,
              dataIndex: 'name',
              ellipsis: true,
              width: 120,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.components.emissionFacilityActivity,
              dataIndex: 'facility',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title:
                type === 'GHG'
                  ? I18N.enterpriseCarbonAccount2
                      .classificationOfEmissionSources
                  : I18N.carbonFootprint.emissionClassification,
              dataIndex: `${type === 'GHG' ? 'ghgCategory' : 'isoCategory'}`,
              ellipsis: true,
              width: 200,
              render: (text: number) => {
                const category: any[] =
                  type === 'GHG' ? GHGFirstSelect : ISOFirstSelect;
                return (
                  <div>
                    {category?.find(item => item.id === text).category || '--'}
                  </div>
                );
              },
            },
            isoClassifyColumn(200),
            ...(isGroup
              ? []
              : [
                  {
                    title: I18N.enterpriseCarbonAccount2.activityDataProtection,
                    dataIndex: 'activityDept',
                    ellipsis: true,
                    width: 200,
                    render: (text: number) => <div>{text || '--'}</div>,
                  },
                ]),
            {
              title: I18N.enterpriseCarbonAccount2.emissionsOfGreenhouseGases,
              dataIndex: 'gasDesc',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
          ],
          pagination: {
            current: commPage.current,
            pageSize: commPage.pageSize,
            total: commPage.total,
          },
          onChange(e) {
            setCommPage({
              current: e.current,
              pageSize: e.pageSize,
              total: e.total,
            });
            syncGetCommData();
          },
        },
      };
      return [targetComm];
    case 'colection':
      const actUnitArr = [
        {
          value: '6',
          label: I18N.enterpriseCarbonAccount2.automaticContinuousMeasurement,
        },
        { value: '3', label: I18N.enterpriseCarbonAccount2.regularMeasurement },
        { value: '1', label: I18N.enterpriseCarbonAccount2.selfEstimation },
      ];
      // 活动数据收集表
      const colectionComm = {
        title: '',
        tableData: {
          dataSource: tarColectionFectoData,
          columns: [
            ...indexColumn,
            {
              title: I18N.carbonFootprint.emissionSources,
              dataIndex: 'name',
              fixed: 'left',
              ellipsis: true,
              width: 120,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.components.emissionFacilityActivity,
              dataIndex: 'facility',

              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title:
                I18N.enterpriseCarbonAccount2.classificationOfEmissionSources,
              dataIndex: `${type === 'GHG' ? 'ghgCategory' : 'isoCategory'}`,
              ellipsis: true,

              width: 200,
              render: (text: number) => {
                const category: any[] =
                  type === 'GHG' ? GHGFirstSelect : ISOFirstSelect;
                return (
                  <div>
                    {category?.find(item => item.id === text).category || '--'}
                  </div>
                );
              },
            },
            isoClassifyColumn(200),
            {
              title: I18N.carbonFootprint3.activityData,
              dataIndex: 'activityData',

              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.components.activityDataSheet3,
              dataIndex: 'activityUnit',
              ellipsis: true,
              width: 200,
              render: (text: string) => text || '--',
            },
            ...(isGroup
              ? []
              : [
                  {
                    title: I18N.enterpriseCarbonAccount2.activityDataClass,
                    dataIndex: 'activityCategory',
                    ellipsis: true,

                    width: 200,
                    render: (text: string) => (
                      <div>
                        {activityCategorys.find(c => c.value === text)?.label ||
                          '--'}
                      </div>
                    ),
                  },
                  {
                    title: I18N.enterpriseCarbonAccount2.activityDataRecording,
                    dataIndex: 'activityRecordWay',
                    ellipsis: true,

                    width: 200,
                    render: (text: number) => <div>{text || '--'}</div>,
                  },
                  {
                    title: I18N.enterpriseCarbonAccount2.activityDataProtection,
                    dataIndex: 'activityDept',
                    fixed: 'right',
                    ellipsis: true,
                    width: 200,
                    render: (text: number) => <div>{text || '--'}</div>,
                  },
                ]),
            {
              title: I18N.enterpriseCarbonAccount2.emissionsOfGreenhouseGases,
              dataIndex: 'gasDesc',
              fixed: 'right',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
          ],
          pagination: {
            current: commPage.current,
            pageSize: commPage.pageSize,
            total: commPage.total,
          },
          onChange(e) {
            setCommPage({
              current: e.current,
              pageSize: e.pageSize,
              total: e.total,
            });
            syncGetCommData();
          },
        },
      };
      return [colectionComm];
    case 'fector':
      // 排放因子选择表
      const fectorComm = {
        title: '',
        tableData: {
          dataSource: tarColectionFectoData,
          columns: [
            ...indexColumn,
            {
              title: I18N.carbonFootprint.emissionSources,
              dataIndex: 'name',
              fixed: 'left',
              ellipsis: true,
              width: 120,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.components.emissionFacilityActivity,
              dataIndex: 'facility',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.emissionsOfGreenhouseGases,
              dataIndex: 'gasDesc',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.cOeEmissions2,
              dataIndex: 'g9',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.cOeEmissions,
              dataIndex: 'g9Unit',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.coEmissionsDueTo2,
              dataIndex: 'g1',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.coEmissionsDueTo,
              dataIndex: 'g1Unit',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.chEmissionsDueTo2,
              dataIndex: 'g2',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.chEmissionsDueTo,
              dataIndex: 'g2Unit',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.noEmissionsDueTo2,
              dataIndex: 'g3',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.noEmissionsDueTo,
              dataIndex: 'g3Unit',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.hfcEmissions2,
              dataIndex: 'g4',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.hfcEmissions,
              dataIndex: 'g4Unit',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.pfCsRow2,
              dataIndex: 'g5',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.pfCsRow,
              dataIndex: 'g5Unit',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.sfEmissionsDueTo2,
              dataIndex: 'g6',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.sfEmissionsDueTo,
              dataIndex: 'g6Unit',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.nfEmissionsDueTo2,
              dataIndex: 'g7',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.nfEmissionsDueTo,
              dataIndex: 'g7Unit',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.emissionFactors,
              dataIndex: 'factorType',
              fixed: 'right',
              ellipsis: true,
              width: 160,
              render: (text: number) => (
                <div>{factorType?.[text - 1]?.label || '--'}</div>
              ),
            },
            {
              title: I18N.enterpriseCarbonAccount2.emissionFactorAssessment,
              dataIndex: 'factorScore',
              fixed: 'right',
              ellipsis: true,
              width: 150,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.carbonFootprint.emissionFactors2,
              dataIndex: 'factorSource',
              fixed: 'right',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
          ],
          pagination: {
            current: commPage.current,
            pageSize: commPage.pageSize,
            total: commPage.total,
          },
          onChange(e) {
            setCommPage({
              current: e.current,
              pageSize: e.pageSize,
              total: e.total,
            });
            syncGetCommData();
          },
        },
      };
      return [fectorComm];
    case 'computed':
      const gnArr = ['g9', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'];
      const quanlityArr = [
        'CO₂',
        'CO₂',
        'CH₄',
        'N₂O',
        'HFCs',
        'PFCs',
        'SF₆',
        'NF₃',
      ];

      // 排放量计算表
      const childColunms1 = num => [
        {
          title: I18N.carbonFootprint.emissionFactors,
          dataIndex: `factorValue${gnArr[num].toUpperCase()}`,
          ellipsis: true,
          width: 100,
          render: text => <div>{text ?? '--'}</div>,
        },
        {
          title: I18N.carbonFootprint3.emissionFactorSheet,
          dataIndex: `${gnArr[num]}Unit`,
          ellipsis: true,
          width: 150,
          render: text => <div>{text ?? '--'}</div>,
        },
        {
          title: I18N.template(
            I18N.enterpriseCarbonAccount2.greenhouseGasEmissions5,
            { val1: quanlityArr[num] },
          ),
          dataIndex: `${gnArr[num]}GasQuality`,
          ellipsis: true,
          width: 200,
          render: text => <div>{text ?? '--'}</div>,
        },
        {
          title: I18N.enterpriseCarbonAccount2.gwpPotential,
          dataIndex: `${gnArr[num]}Gwp`,
          ellipsis: true,
          width: 100,
          render: text => <div>{text ?? '--'}</div>,
        },
        {
          title: I18N.enterpriseCarbonAccount2.carbonDioxideWhen2,
          dataIndex: `${gnArr[num]}Equivalent`,
          ellipsis: true,
          width: 200,
          render: (text: number) => <div>{text ?? '--'}</div>,
        },
      ];
      const childCo2e = num => [
        {
          title: I18N.carbonFootprint.emissionFactors,
          dataIndex: `factorValue${gnArr[num].toUpperCase()}`,
          ellipsis: true,
          width: 100,
          render: text => <div>{text ?? '--'}</div>,
        },
        {
          title: I18N.carbonFootprint3.emissionFactorSheet,
          dataIndex: `${gnArr[num]}Unit`,
          ellipsis: true,
          width: 150,
          render: text => <div>{text ?? '--'}</div>,
        },
        {
          title: I18N.enterpriseCarbonAccount2.carbonDioxideWhen2,
          dataIndex: `${gnArr[num]}Equivalent`,
          ellipsis: true,
          width: 200,
          render: (text: number) => <div>{text ?? '--'}</div>,
        },
      ];
      const computedComm = {
        title: '',
        tableData: {
          dataSource: computedData,
          columns: [
            {
              title: I18N.carbonFootprint.number,
              ellipsis: true,
              fixed: 'left',
              width: 70,
              render: (_, record, index) => <div>{index + 1}</div>,
            },
            {
              title: I18N.carbonFootprint.emissionSources,
              dataIndex: 'name',
              fixed: 'left',
              ellipsis: true,
              width: 120,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.components.emissionFacilityActivity,
              dataIndex: 'facility',
              ellipsis: true,
              width: 150,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.carbonFootprint.emissionClassification,
              dataIndex: `${type === 'GHG' ? 'ghgCategory' : 'isoCategory'}`,
              ellipsis: true,
              width: 150,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            isoClassifyColumn(150),
            {
              title: I18N.carbonFootprint3.activityData,
              dataIndex: 'activityData',
              ellipsis: true,
              width: 120,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.components.activityDataSheet3,
              dataIndex: 'activityUnit',
              ellipsis: true,
              width: 150,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: 'CO₂e',
              dataIndex: 'CO₂e',
              ellipsis: true,
              children: [...childCo2e(0)],
            },
            {
              title: 'CO₂',
              dataIndex: 'enactContent',
              ellipsis: true,
              width: 100,
              children: [...childColunms1(1)],
            },
            {
              title: 'CH₄',
              dataIndex: 'enactContent',
              ellipsis: true,
              width: 100,
              children: [...childColunms1(2)],
            },
            {
              title: 'N₂O',
              dataIndex: 'enactContent',
              ellipsis: true,
              width: 100,
              children: [...childColunms1(3)],
            },
            {
              title: 'HFCs',
              dataIndex: 'enactContent',
              ellipsis: true,
              width: 100,
              children: [...childColunms1(4)],
            },
            {
              title: 'PFCs',
              dataIndex: 'enactContent',
              ellipsis: true,
              width: 100,
              children: [...childColunms1(5)],
            },
            {
              title: 'SF₆',
              dataIndex: 'enactContent',
              ellipsis: true,
              width: 100,
              children: [...childColunms1(6)],
            },
            {
              title: 'NF₃',
              dataIndex: 'enactContent',
              ellipsis: true,
              width: 100,
              children: [...childColunms1(7)],
            },
            {
              title: I18N.enterpriseCarbonAccount2.totalEmissionsT4,
              dataIndex: 'signalTotal',
              fixed: 'right',
              width: 110,
              render: text => <div>{text}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.emissionProportion,
              dataIndex: 'thanTotalRatio',
              fixed: 'right',
              width: 110,
              render: text => <div>{text}</div>,
            },
          ],
          pagination: {
            current: page.current,
            pageSize: page.pageSize,
            total: page.total,
          },
          onChange(e) {
            setPage({
              current: e.current,
              pageSize: e.pageSize,
              total: e.total,
            });
            syncGetTarColectionFectoData();
          },
        },
      };
      return [computedComm];
    case 'gasDischarge':
      const gasDischargeComm = [
        {
          title: I18N.enterpriseCarbonAccount2.greenhouseGasEmissions4,
          tableData: {
            pagination: false,
            dataSource: gasDischargeData[type].scopeDischage,
            summary: pageData => {
              const totalBorrow = pageData[0]?.total;
              const totalRepayment = pageData[0]?.totalRatio;

              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>
                    {I18N.carbonFootprint.total}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <span>{totalBorrow}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <span>{totalRepayment}</span>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              );
            },
            columns: [
              {
                title: I18N.enterpriseCarbonAccount2.range,
                dataIndex: 'scope',
                fixed: 'left',
                ellipsis: true,
                width: 200,
                render: (text: number) => <div>{text ?? '--'}</div>,
              },
              {
                title: I18N.enterpriseCarbonAccount2.emissionsTC,
                dataIndex: 'direct',
                ellipsis: true,
                width: 200,
                render: (text: number) => <div>{text ?? '--'}</div>,
              },
              {
                title: I18N.carbonFootprint.emissionProportion,
                dataIndex: 'directRatio',
                ellipsis: true,
                width: 200,
                render: (text: number) => <div>{text ?? '--'}</div>,
              },
            ],
          },
        },
        {
          title: I18N.enterpriseCarbonAccount2.greenhouseGasEmissions3,
          tableData: {
            pagination: false,
            dataSource: gasDischargeData[type].classify,
            summary: pageData => {
              const totalBorrow = pageData[0]?.total;
              const totalRepayment = pageData[0]?.totalRatio;

              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>
                    {I18N.carbonFootprint.total}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <span>{totalBorrow}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <span>{totalRepayment}</span>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              );
            },
            columns: [
              {
                title: I18N.carbonFootprint.emissionClassification,
                dataIndex: 'scope',
                fixed: 'left',
                ellipsis: true,
                width: 200,
                render: (text: number) => <div>{text ?? '--'}</div>,
              },
              {
                title: I18N.enterpriseCarbonAccount2.emissionsTC,
                dataIndex: 'discharge',
                ellipsis: true,
                width: 200,
                render: (text: number) => <div>{text ?? '--'}</div>,
              },
              {
                title: I18N.carbonFootprint.emissionProportion,
                dataIndex: 'ratio',
                ellipsis: true,
                width: 200,
                render: (text: number) => <div>{text ?? '--'}</div>,
              },
            ],
          },
        },
      ];
      const ISO = {
        title: I18N.enterpriseCarbonAccount2.greenhouseGasSpecies2,
        tableData: {
          dataSource: gasDischargeData[type].kind,
          pagination: false,
          summary: pageData => {
            const oneTotal = pageData[0]?.oneTotal;
            const twoTotal = pageData[0]?.twoTotal;
            const threeTotal = pageData[0]?.threeTotal;
            const fourTotal = pageData[0]?.fourTotal;
            const fiveTotal = pageData[0]?.fiveTotal;
            const sixTotal = pageData[0]?.sixTotal;
            const allTotal = pageData[0]?.allTotal;

            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  {I18N.carbonFootprint.total}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <span>{oneTotal}</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <span>{twoTotal}</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <span>{threeTotal}</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <span>{fourTotal}</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                  <span>{fiveTotal}</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6}>
                  <span>{sixTotal}</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7}>
                  <span>{allTotal}</span>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          },
          columns: [
            {
              title: I18N.enterpriseCarbonAccount2.greenhouseGasSpecies,
              dataIndex: 'gasType',
              fixed: 'left',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.directDischargeOr2,
              dataIndex: 'one',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.indirectEnergyEmissions2,
              dataIndex: 'two',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title:
                I18N.enterpriseCarbonAccount2.transportationIndirectDischarge2,
              dataIndex: 'three',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.outsourcedProductsOr2,
              dataIndex: 'four',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.downstreamOfSupplyChain2,
              dataIndex: 'five',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.otherIndirectEmissions2,
              dataIndex: 'six',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.totalEmissionsT3,
              dataIndex: 'total',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
          ],
        },
      };

      const GHG = {
        title: I18N.enterpriseCarbonAccount2.greenhouseGasSpecies2,
        tableData: {
          pagination: false,
          dataSource: gasDischargeData[type].kind,
          summary: pageData => {
            const oneTotal = pageData[0]?.oneTotal;
            const twoTotal = pageData[0]?.twoTotal;
            const threeTotal = pageData[0]?.threeTotal;
            const allTotal = pageData[0]?.allTotal;

            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  {I18N.carbonFootprint.total}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <span>{oneTotal}</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <span>{twoTotal}</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <span>{threeTotal}</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <span>{allTotal}</span>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          },
          columns: [
            {
              title: I18N.enterpriseCarbonAccount2.greenhouseGasSpecies,
              dataIndex: 'gasType',
              fixed: 'left',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.scope1Emissions,
              dataIndex: 'one',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.scope2Emissions,
              dataIndex: 'two',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.scopeThreeEmissions,
              dataIndex: 'three',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
            {
              title: I18N.enterpriseCarbonAccount2.totalEmissionsT3,
              dataIndex: 'total',
              ellipsis: true,
              width: 200,
              render: (text: number) => <div>{text || '--'}</div>,
            },
          ],
        },
      };
      const infoObj = {
        GHG: [...gasDischargeComm, GHG],
        ISO: [...gasDischargeComm, ISO],
      };
      return infoObj[type];
    case 'majorGhg':
      const factorColumn = (
        field: DisclosureGhgFactorField,
        title: string,
        optionTitle: string,
      ) => ({
        title,
        children: [
          {
            title: optionTitle,
            dataIndex: field,
            key: `${field}Value`,
            ellipsis: true,
            width: field === 'factorD' ? 220 : 190,
            render: (_, record: DisclosureGhgRow) =>
              renderMajorGhgText(
                getDisclosureFactorLabel(
                  majorGhgFactorOptions,
                  field,
                  record[field]?.value,
                ),
              ),
          },
          {
            title: I18N.enterpriseCarbonAccount2.score,
            dataIndex: field,
            key: `${field}Score`,
            ellipsis: true,
            width: 80,
            render: (_, record: DisclosureGhgRow) =>
              renderMajorGhgText(record[field]?.score),
          },
        ],
      });
      const majorGhgComm = {
        title: '',
        tableData: {
          rowKey: 'id',
          pagination: false,
          className: 'major-ghg-report-table',
          dataSource: majorGhgData,
          scroll: { x: 1650 },
          columns: [
            {
              title: I18N.enterpriseCarbonAccount2.accountingScope,
              dataIndex: 'scope',
              key: 'scope',
              fixed: 'left',
              width: 130,
              render: renderDisclosureScopeCell,
            },
            {
              title: I18N.enterpriseCarbonAccount2.accountingCategory,
              dataIndex: 'category',
              key: 'category',
              fixed: 'left',
              ellipsis: true,
              width: 220,
              render: (text: string, record: DisclosureGhgRow) => (
                <div className='major-ghg-category-cell'>
                  <span
                    className='major-ghg-category-text'
                    title={`${getCellText(text)}`}
                  >
                    {getCellText(text)}
                  </span>
                  {record.important || record.importantLabel ? (
                    <span className='major-ghg-tag'>
                      {I18N.enterpriseCarbonAccount2.majorTag}
                    </span>
                  ) : null}
                </div>
              ),
            },
            factorColumn(
              'factorA',
              I18N.enterpriseCarbonAccount2.evaluationFactorA,
              I18N.enterpriseCarbonAccount2.expectedUse,
            ),
            factorColumn(
              'factorB',
              I18N.enterpriseCarbonAccount2.evaluationFactorB,
              I18N.enterpriseCarbonAccount2.sectorSpecificGuidance,
            ),
            factorColumn(
              'factorC',
              I18N.enterpriseCarbonAccount2.evaluationFactorC,
              I18N.enterpriseCarbonAccount2.dataAcquisitionDifficulty,
            ),
            factorColumn(
              'factorD',
              I18N.enterpriseCarbonAccount2.evaluationFactorD,
              I18N.enterpriseCarbonAccount2.impactLevel,
            ),
            {
              title: I18N.enterpriseCarbonAccount2.evaluationTotalScore,
              children: [
                {
                  title:
                    I18N.enterpriseCarbonAccount2.evaluationTotalScoreFormula,
                  dataIndex: 'totalScore',
                  key: 'totalScore',
                  ellipsis: true,
                  width: 130,
                  render: renderMajorGhgText,
                },
              ],
            },
            {
              title: renderMajorIndirectEmissionTitle(),
              dataIndex: 'majorIndirectEmission',
              key: 'majorIndirectEmission',
              width: 190,
              render: renderMajorGhgText,
            },
          ],
        },
      };
      return [majorGhgComm];
    case 'orgDataClassify':
      const orgDataClassifyComm = [
        {
          title: '',
          tableData: {
            pagination: false,
            bordered: true,
            scroll: {},
            dataSource: orgUncertaintyData[type],
            columns: [
              {
                title: I18N.carbonFootprint.emissionClassification,
                dataIndex: 'scope',
                key: 'scope',
                ellipsis: true,
                width: 200,
                render: (text: number) => <div>{text ?? '--'}</div>,
              },
              {
                title: I18N.enterpriseCarbonAccount2.weightedAverageScore,
                dataIndex: 'score',
                key: 'score',
                ellipsis: true,
                width: 200,
                render: (text: number) => <div>{text ?? '--'}</div>,
              },
              {
                title:
                  I18N.enterpriseCarbonAccount2
                    .weightedAverageScoreDataQualityLevel,
                dataIndex: 'grade',
                key: 'grade',
                ellipsis: true,
                width: 260,
                render: (text: number) => <div>{text ?? '--'}</div>,
              },
            ],
            expandable: {
              rowExpandable: record => !!record.child?.length,
              expandIcon({ expanded, onExpand, record }) {
                if (!record.child?.length) {
                  return null;
                }
                return expanded ? (
                  <DownOutlined
                    onClick={e => onExpand(record, e)}
                    style={{ color: '#999EA4' }}
                  />
                ) : (
                  <RightOutlined
                    onClick={e => onExpand(record, e)}
                    style={{ color: '#999EA4' }}
                  />
                );
              },
              expandedRowRender(data) {
                const columns: any = [
                  {
                    title: I18N.carbonFootprint.number,
                    dataIndex: 'orderNum',
                    key: 'orderNum',
                    width: 90,
                    render: (text: number, record, index) =>
                      tableMergeCellsRender({
                        tableData: data.child,
                        record,
                        index,
                        objname: 'orderNum',
                        text,
                      }),
                  },
                  {
                    title: I18N.enterpriseCarbonAccount2.subjectName,
                    dataIndex: 'siteName',
                    key: 'siteName',
                    width: 150,
                    render: (text: string, record, index) =>
                      tableMergeCellsRender({
                        tableData: data.child,
                        record,
                        index,
                        objname: 'siteName',
                        text,
                      }),
                  },
                  {
                    title: I18N.carbonFootprint.emissionClassification,
                    dataIndex: 'scope',
                    key: 'scope',
                    ellipsis: true,
                    width: 160,
                    render: (text: number) => <span>{text ?? '--'}</span>,
                  },
                  {
                    title: I18N.enterpriseCarbonAccount2.weightedAverageScore,
                    dataIndex: 'score',
                    key: 'score',
                    ellipsis: true,
                    width: 150,
                    render: (text: number) => <span>{text ?? '--'}</span>,
                  },
                  {
                    title:
                      I18N.enterpriseCarbonAccount2
                        .weightedAverageScoreDataQualityLevel,
                    dataIndex: 'grade',
                    key: 'grade',
                    ellipsis: true,
                    width: 220,
                    render: (text: number) => <span>{text ?? '--'}</span>,
                  },
                  {
                    title:
                      I18N.enterpriseCarbonAccount2
                        .shareOfTotalEmissionCategory,
                    dataIndex: 'categoryRatio',
                    key: 'categoryRatio',
                    ellipsis: true,
                    width: 200,
                    render: (text: number) => <span>{text ?? '--'}</span>,
                  },
                  {
                    title:
                      I18N.enterpriseCarbonAccount2
                        .totalEmissionCategoryWeightedAverageScore,
                    dataIndex: 'weighting',
                    key: 'weighting',
                    ellipsis: true,
                    width: 230,
                    render: (text: number) => <span>{text ?? '--'}</span>,
                  },
                ];
                return (
                  <Table
                    rowKey='key'
                    columns={columns}
                    dataSource={data.child}
                    pagination={false}
                    scroll={{ x: 1200 }}
                    bordered
                  />
                );
              },
            },
          },
        },
      ];
      return orgDataClassifyComm;
    case 'dataClassify':
      const dataClassifyComm = [
        {
          title: '',
          tableData: {
            pagination: false,
            dataSource: dataClassify[type],
            columns: [
              {
                title: I18N.carbonFootprint.emissionClassification,
                dataIndex: 'scope',
                key: 'scope',
                ellipsis: true,
                width: 200,
                render: (text: number) => <div>{text ?? '--'}</div>,
              },
              {
                title: I18N.enterpriseCarbonAccount2.weightedAverageEvaluation2,
                dataIndex: 'score',
                key: 'score',
                ellipsis: true,
                width: 200,
                render: (text: number) => <div>{text ?? '--'}</div>,
              },
              {
                title: I18N.enterpriseCarbonAccount2.weightedAverageEvaluation,
                dataIndex: 'grade',
                key: 'grade',
                ellipsis: true,
                width: 200,
                render: (text: number) => <div>{text ?? '--'}</div>,
              },
            ],
            summary: pageData => {
              const totalScore = pageData[0]?.totalScore;
              const totalGrade = pageData[0]?.totalGrade;

              return (
                <Table.Summary.Row style={{ background: '#fff' }}>
                  <Table.Summary.Cell index={3} />
                  <Table.Summary.Cell index={0}>
                    {I18N.enterpriseCarbonAccount2.overallEmissions}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <span>{totalScore}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <span>{totalGrade}</span>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              );
            },
            expandable: {
              expandIcon({ expanded, onExpand, record }) {
                return expanded ? (
                  <DownOutlined
                    onClick={e => onExpand(record, e)}
                    style={{ color: '#999EA4' }}
                  />
                ) : (
                  <RightOutlined
                    onClick={e => onExpand(record, e)}
                    style={{ color: '#999EA4' }}
                  />
                );
              },
              expandedRowRender(data) {
                const columns: any = [
                  {
                    title: I18N.carbonFootprint.number,
                    dataIndex: 'index',
                    key: 'index',
                    fixed: 'left',
                    width: 70,
                    render: (text: number, record, index) => (
                      <span>{index + 1}</span>
                    ),
                  },
                  {
                    title: I18N.carbonFootprint.emissionSources,
                    dataIndex: 'name',
                    key: 'name',
                    fixed: 'left',
                    ellipsis: true,
                    width: 100,
                    render: (text: number) => <span>{text ?? '--'}</span>,
                  },
                  {
                    title: I18N.components.emissionFacilityActivity,
                    dataIndex: 'facility',
                    key: 'facility',
                    ellipsis: true,
                    width: 140,
                    render: (text: number) => <span>{text ?? '--'}</span>,
                  },
                  {
                    title:
                      I18N.enterpriseCarbonAccount2.emissionFactorAssessment,
                    dataIndex: 'factorScore',
                    key: 'factorScore',
                    ellipsis: true,
                    width: 130,
                    render: (text: number) => <span>{text ?? '--'}</span>,
                  },
                  {
                    title: I18N.enterpriseCarbonAccount2.activityDataReview,
                    dataIndex: 'activityScore',
                    key: 'activityScore',
                    ellipsis: true,
                    width: 130,
                    render: (text: number) => <span>{text ?? '--'}</span>,
                  },
                  {
                    title: I18N.enterpriseCarbonAccount2.scoringResults,
                    dataIndex: 'scoreResult',
                    key: 'scoreResult',
                    ellipsis: true,
                    width: 100,
                    render: (text: number) => <span>{text ?? '--'}</span>,
                  },
                  {
                    title:
                      I18N.enterpriseCarbonAccount2.classificationOfEmissions,
                    key: 'categoryRatio',
                    dataIndex: 'categoryRatio',
                    ellipsis: true,
                    width: 240,
                    render: (text: number) => <span>{text ?? '--'}</span>,
                  },
                  {
                    title:
                      I18N.enterpriseCarbonAccount2.emissionClassificationPlus,
                    dataIndex: 'weighting',
                    key: 'weighting',
                    ellipsis: true,
                    width: 180,
                    render: (text: number) => <span>{text ?? '--'}</span>,
                  },
                  {
                    title: I18N.enterpriseCarbonAccount2.shareInTotalEmissions,
                    dataIndex: 'thanTotalRatio',
                    key: 'thanTotalRatio',
                    ellipsis: true,
                    width: 200,
                    render: (text: number) => <span>{text ?? '--'}</span>,
                  },
                  {
                    title: I18N.enterpriseCarbonAccount2.overallEmissionsPlus,
                    dataIndex: 'entiretyScore',
                    key: 'entiretyScore',
                    ellipsis: true,
                    width: 180,
                    render: (text: number) => <span>{text ?? '--'}</span>,
                  },
                ];
                return (
                  <Table
                    columns={columns}
                    scroll={{ y: '47vh' }}
                    dataSource={data.child}
                    pagination={false}
                  />
                );
              },
            },
          },
        },
      ];
      return dataClassifyComm;

    default:
      return [];
  }
};
export const crateArr = (ghgData, isoData) => ({
  GHG: {
    scopeDischage: [
      {
        scope: I18N.enterpriseCarbonAccount2.directGreenhouseGas,
        direct: ghgData.direct,
        directRatio: ghgData.directRatio,
        total: ghgData.total,
        totalRatio: ghgData.totalRatio,
      },
      {
        scope: I18N.enterpriseCarbonAccount2.indirectGreenhouseGas,
        direct: ghgData.indirect,
        directRatio: ghgData.indirectRatio,
        total: ghgData.total,
        totalRatio: ghgData.totalRatio,
      },
    ],
    classify: [
      {
        scope: I18N.enterpriseCarbonAccount2.scopeOne,
        discharge: ghgData.one,
        ratio: ghgData.oneRatio,
        total: ghgData.total,
        totalRatio: ghgData.totalRatio,
      },
      {
        scope: I18N.enterpriseCarbonAccount2.scope2,
        discharge: ghgData.two,
        ratio: ghgData.twoRatio,
        total: ghgData.total,
        totalRatio: ghgData.totalRatio,
      },
      {
        scope: I18N.enterpriseCarbonAccount2.fanWeisan,
        discharge: ghgData.three,
        ratio: ghgData.threeRatio,
        total: ghgData.total,
        totalRatio: ghgData.totalRatio,
      },
    ],
    kind: [
      {
        gasType: 'CO₂',
        one: ghgData.oneCO2,
        two: ghgData.twoCO2,
        three: ghgData.threeCO2,
        total: ghgData.totalCO2,
        oneTotal: ghgData.totalEmissionOne,
        twoTotal: ghgData.totalEmissionTwo,
        threeTotal: ghgData.totalEmissionThree,
        allTotal: ghgData.total,
      },
      {
        gasType: 'CH₄',
        one: ghgData.oneCH4,
        two: ghgData.twoCH4,
        three: ghgData.threeCH4,
        total: ghgData.totalCH4,
      },
      {
        gasType: 'N₂O',
        one: ghgData.oneN2O,
        two: ghgData.twoN2O,
        three: ghgData.threeN2O,
        total: ghgData.totalN2O,
      },
      {
        gasType: 'HFCs',
        one: ghgData.oneHFCs,
        two: ghgData.twoHFCs,
        three: ghgData.threeHFCs,
        total: ghgData.totalHFCs,
      },
      {
        gasType: 'PFCs',
        one: ghgData.onePFCs,
        two: ghgData.twoPFCs,
        three: ghgData.threePFCs,
        total: ghgData.totalPFCs,
      },
      {
        gasType: 'SF₆',
        one: ghgData.oneSF6,
        two: ghgData.twoSF6,
        three: ghgData.threeSF6,
        total: ghgData.totalSF6,
      },
      {
        gasType: 'NF₃',
        one: ghgData.oneNF3,
        two: ghgData.twoNF3,
        three: ghgData.threeNF3,
        total: ghgData.totalNF3,
      },
      {
        gasType: I18N.enterpriseCarbonAccount2.blend,
        one: ghgData.oneMixture,
        two: ghgData.twoMixture,
        three: ghgData.threeMixture,
        total: ghgData.totalMixture,
      },
    ],
  },
  ISO: {
    scopeDischage: [
      {
        scope: I18N.enterpriseCarbonAccount2.directGreenhouseGas,
        direct: isoData.direct,
        directRatio: isoData.directRatio,
        total: isoData.total,
        totalRatio: isoData.totalRatio,
      },
      {
        scope: I18N.enterpriseCarbonAccount2.indirectGreenhouseGas,
        direct: isoData.indirect,
        directRatio: isoData.indirectRatio,
        total: isoData.total,
        totalRatio: isoData.totalRatio,
      },
    ],
    classify: [
      {
        scope: I18N.enterpriseCarbonAccount2.directDischargeOr,
        discharge: isoData.one,
        ratio: isoData.oneRatio,
        total: isoData.total,
        totalRatio: isoData.totalRatio,
      },
      {
        scope: I18N.enterpriseCarbonAccount2.indirectEnergyEmissions,
        discharge: isoData.two,
        ratio: isoData.twoRatio,
        total: isoData.total,
        totalRatio: isoData.totalRatio,
      },
      {
        scope: I18N.enterpriseCarbonAccount2.transportationIndirectDischarge,
        discharge: isoData.three,
        ratio: isoData.threeRatio,
        total: isoData.total,
        totalRatio: isoData.totalRatio,
      },
      {
        scope: I18N.enterpriseCarbonAccount2.outsourcedProductsOr,
        discharge: isoData.four,
        ratio: isoData.fourRatio,
        total: isoData.total,
        totalRatio: isoData.totalRatio,
      },
      {
        scope: I18N.enterpriseCarbonAccount2.downstreamOfSupplyChain,
        discharge: isoData.five,
        ratio: isoData.fiveRatio,
        total: isoData.total,
        totalRatio: isoData.totalRatio,
      },
      {
        scope: I18N.enterpriseCarbonAccount2.otherIndirectEmissions,
        discharge: isoData.six,
        ratio: isoData.sixRatio,
        total: isoData.total,
        totalRatio: isoData.totalRatio,
      },
    ],
    kind: [
      {
        gasType: 'CO₂',
        one: isoData.oneCO2,
        two: isoData.twoCO2,
        three: isoData.threeCO2,
        four: isoData.fourCO2,
        five: isoData.fiveCO2,
        six: isoData.sixCO2,
        total: isoData.totalCO2,
        oneTotal: isoData.totalEmissionOne,
        twoTotal: isoData.totalEmissionTwo,
        threeTotal: isoData.totalEmissionThree,
        fourTotal: isoData.totalEmissionFour,
        fiveTotal: isoData.totalEmissionFive,
        sixTotal: isoData.totalEmissionSix,
        allTotal: isoData.total,
      },
      {
        gasType: 'CH₄',
        one: isoData.oneCH4,
        two: isoData.twoCH4,
        three: isoData.threeCH4,
        four: isoData.fourCH4,
        five: isoData.fiveCH4,
        six: isoData.sixCH4,
        total: isoData.totalCH4,
      },
      {
        gasType: 'N₂O',
        one: isoData.oneN2O,
        two: isoData.twoN2O,
        three: isoData.threeN2O,
        four: isoData.fourN2O,
        five: isoData.fiveN2O,
        six: isoData.sixN2O,
        total: isoData.totalN2O,
      },
      {
        gasType: 'HFCs',
        one: isoData.oneHFCs,
        two: isoData.twoHFCs,
        three: isoData.threeHFCs,
        four: isoData.fourHFCs,
        five: isoData.fiveHFCs,
        six: isoData.sixHFCs,
        total: isoData.totalHFCs,
      },
      {
        gasType: 'PFCs',
        one: isoData.onePFCs,
        two: isoData.twoPFCs,
        three: isoData.threePFCs,
        four: isoData.fourPFCs,
        five: isoData.fivePFCs,
        six: isoData.sixPFCs,
        total: isoData.totalPFCs,
      },
      {
        gasType: 'SF₆',
        one: isoData.oneSF6,
        two: isoData.twoSF6,
        three: isoData.threeSF6,
        four: isoData.fourSF6,
        five: isoData.fiveSF6,
        six: isoData.sixSF6,
        total: isoData.totalSF6,
      },
      {
        gasType: 'NF₃',
        one: isoData.oneNF3,
        two: isoData.twoNF3,
        three: isoData.threeNF3,
        four: isoData.fourNF3,
        five: isoData.fiveNF3,
        six: isoData.sixNF3,
        total: isoData.totalNF3,
      },
      {
        gasType: I18N.enterpriseCarbonAccount2.blend,
        one: isoData.oneMixture,
        two: isoData.twoMixture,
        three: isoData.threeMixture,
        four: isoData.fourMixture,
        five: isoData.fiveMixture,
        six: isoData.sixMixture,
        total: isoData.totalMixture,
      },
    ],
  },
});
