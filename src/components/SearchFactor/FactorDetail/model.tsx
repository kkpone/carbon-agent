/*
 * @@description: 因子详情数据
 */
import { QuestionCircleOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { shouldHideEcoinventValue } from '@src/utils/ecoinvent';
import { ECOINVENT_TEXT } from '@src/views/carbonFootprint3/constant';
import {
  FormulaTips,
  fossilAndForestryUnits,
  selectOptionMap,
} from '@src/views/emission/utils';
import { EmissionFactorMenu } from '@src/views/emission/utils/index-type';
import { Cascader, Col, Input, Row, Select, Table, Tooltip } from 'antd';

import '@views/enterpriseCarbonAccount2/style.less';
import { concat, last, initial } from 'lodash-es';

import style from './index.module.less';

const getPageInfo = (
  tabName: string,
  form,
  menuList,
  factorType,
  cascaderOptions,
  formulaFactorDatas,
  formulaColums,
  formulaResult,
  ResultColums,
  dataValue,
) => {
  const formula = form.getFieldValue('formula');

  let co2Z = menuList[fossilAndForestryUnits[formula || 1][0]];
  let co2eZ = menuList[fossilAndForestryUnits[formula || 1][2]];
  if (factorType === 2) {
    if (+formula === 1) {
      co2Z = menuList[fossilAndForestryUnits[formula][0]];
      co2eZ = menuList[fossilAndForestryUnits[formula][2]];
    } else if (+formula === 2) {
      co2Z = menuList[fossilAndForestryUnits[formula][0]];
      co2eZ = menuList[fossilAndForestryUnits[formula][2]];
    } else if (+formula === 3) {
      co2Z = menuList[fossilAndForestryUnits[formula][0]];
      co2eZ = menuList[fossilAndForestryUnits[formula][2]];
    } else if (+formula === 4) {
      co2Z = menuList[fossilAndForestryUnits[formula][0]];
      co2eZ = menuList[fossilAndForestryUnits[formula][2]];
    }
  }
  // 气体选项框
  const selectGas = ['HFCs', 'PFCs'];
  const menuKey = Object.keys(menuList).filter(k =>
    selectGas?.some(g => k.includes(g)),
  );

  const factorComm = [
    {
      title: I18N.components.greenhouseGases,
      dataIndex: 'greenhouseGases',
      ellipsis: true,
      width: 240,
      render: (value: string, record) => {
        const matchKey = selectGas?.find(g =>
          record?.greenhouseGasesType?.includes?.(g),
        );

        if (matchKey) {
          return (
            <Select
              style={{ width: '100%' }}
              value={`${value}`?.length > 0 ? value : undefined}
              disabled
              options={menuList[
                menuKey?.find(k =>
                  k.includes(matchKey),
                ) as keyof EmissionFactorMenu
              ]?.map(d => ({ label: d.dictLabel, value: d.dictValue }))}
            />
          );
        }
        return record?.greenhouseGases;
      },
    },
    {
      title: I18N.carbonFootprint.factorValue,
      dataIndex: 'factorValue',
      ellipsis: true,
      width: 240,
      render: (text: number) => {
        // 如果是ecoinvent因子
        if (text && shouldHideEcoinventValue(dataValue))
          return (
            <Input
              value={ECOINVENT_TEXT}
              disabled
              className={style.ecoinventTips}
            />
          );
        return <Input value={text} disabled />;
      },
    },
    {
      title: I18N.components.factorUnit,
      dataIndex: 'unit',
      ellipsis: true,
      width: 250,
      render: (value, record) => {
        // debugger;
        const gasType = record?.greenhouseGasesType || record?.greenhouseGases;
        const numberTypeZ =
          menuList[
            (Object.entries(selectOptionMap).find(t =>
              gasType?.includes(t[0]),
            )?.[1] || selectOptionMap['CO₂e']) as keyof EmissionFactorMenu
          ];

        const formulaNumerator = gasType?.includes('CO₂e') ? co2eZ : co2Z;
        return (
          <Row gutter={24}>
            <Col span='12'>
              <Select
                style={{ width: '100%' }}
                disabled
                // @ts-ignore
                value={record?.factorUnit || undefined}
                options={(factorType === '1'
                  ? numberTypeZ
                  : formulaNumerator
                )?.map(t => ({
                  value: t.dictValue,
                  label: t.dictLabel,
                }))}
              />
            </Col>
            /
            <Col span='11'>
              <Cascader
                fieldNames={{
                  label: 'dictLabel',
                  value: 'dictValue',
                  children: 'enumList',
                }}
                disabled
                displayRender={label => label[label.length - 1]}
                style={{ width: '100%' }}
                // @ts-ignore
                options={cascaderOptions}
                allowClear={false}
                value={record?.factorUnitM?.split(',')}
              />
            </Col>
          </Row>
        );
      },
    },
  ];

  const gasColumns = {
    title: I18N.components.greenhouseGasCategory,
    dataIndex: 'greenhouseGasesType',
    ellipsis: true,
    width: 230,
    render: (text: number) => <div>{text || '--'}</div>,
  };

  const relevanceColum = [
    {
      title: I18N.carbonFootprint.factorName,
      dataIndex: 'name',
      ellipsis: true,
      width: 230,
      render: (text: number) => <div>{text || '--'}</div>,
    },
    {
      title: I18N.carbonFootprint.specificationAndModel,
      dataIndex: 'specification',
      ellipsis: true,
      width: 230,
      render: (text: number) => <div>{text || '--'}</div>,
    },

    {
      title: I18N.components.applicableScenarios,
      dataIndex: 'description',
      ellipsis: true,
      width: 230,
      render: (text: number) => <div>{text || '--'}</div>,
    },
    {
      title: I18N.carbonFootprint.factorValue,
      dataIndex: 'cValue',
      ellipsis: true,
      width: 230,
      render: (text: number) => <div>{text || '--'}</div>,
    },
    {
      title: I18N.carbonFootprint.yearOfPublication,
      dataIndex: 'year',
      ellipsis: true,
      width: 230,
      render: (text: number) => <div>{text || '--'}</div>,
    },
    {
      title: I18N.carbonFootprint.publishingInstitution,
      dataIndex: 'institution',
      ellipsis: true,
      width: 230,
      render: (text: number) => <div>{text || '--'}</div>,
    },
    {
      title: I18N.carbonFootprint.publishingCountryGroups,
      dataIndex: 'countries',
      ellipsis: true,
      width: 230,
      render: (text: number) => <div>{text || '--'}</div>,
    },
  ];
  const orgItem = [
    {
      label: I18N.components.sourceFileName,
      name: 'source',
      type: 'input',
      rules: false,
      props: {
        disabled: true,
      },
    },
    {
      label: I18N.components.websiteLink,
      name: 'url',
      type: 'input',
      rules: false,
      col: 16,
      props: {
        disabled: true,
      },
    },
    {
      label: I18N.carbonFootprint.sourceFile,
      name: 'multipartFileList',
      type: 'render',
      rules: false,
      col: 16,
      render() {
        return (
          <div className='source-list'>
            {dataValue.sourceFileList?.map(item => (
              <div className='item flex-a-c flex-j-b'>
                <span>{item.name}</span>
                <span
                  className='download'
                  onClick={() => {
                    const downloadElement = document.createElement('a');
                    downloadElement.style.display = 'none';
                    downloadElement.href = item;
                    downloadElement.download = item; // 下载后文件名
                    document.body.appendChild(downloadElement);
                    downloadElement.click(); // 点击下载
                    document.body.removeChild(downloadElement);
                  }}
                >
                  {I18N.carbonFootprint.download}
                </span>
              </div>
            ))}
          </div>
        );
      },
    },
  ];
  const formulaFactor = [
    [
      {
        label: I18N.components.greenhouseGasColumn,
        name: 'gasData',
        type: 'render',
        padding: '0',
        rules: false,
        col: 24,
        render() {
          const originGasData = form.getFieldValue('gasData') || [];
          return (
            <Table
              bordered
              columns={[gasColumns, ...factorComm]}
              dataSource={concat<any>(
                last(originGasData),
                initial(originGasData),
              )}
              pagination={false}
            />
          );
        },
      },
    ],
    [
      {
        label: (
          <>
            <span style={{ paddingRight: 6 }}>{I18N.components.formula}</span>
            <Tooltip
              placement='top'
              title={FormulaTips[form.getFieldValue('formula') - 1]}
            >
              <QuestionCircleOutlined style={{ color: '#0CBF9F' }} />
            </Tooltip>
          </>
        ),
        name: 'formula',
        type: 'select',
        rules: false,
        props: {
          disabled: true,
          options: menuList?.formulaChance?.map(d => ({
            label: d.dictLabel,
            value: d.dictValue,
          })),
        },
      },
      {
        label: I18N.components.calculationResults,
        name: 'linkmanName',
        type: 'render',
        rules: false,
        col: 24,
        render() {
          return (
            <Table
              bordered
              dataSource={formulaResult}
              columns={ResultColums}
              pagination={false}
            />
          );
        },
      },
      {
        label: I18N.components.calculateParameters,
        name: 'result',
        type: 'render',
        rules: false,
        col: 24,
        render() {
          return (
            <Table
              bordered
              dataSource={formulaFactorDatas}
              columns={formulaColums}
              pagination={false}
            />
          );
        },
      },
    ],
  ];
  const fromItem = {
    baseInfo: [
      {
        label: I18N.carbonFootprint.factorName,
        name: 'name',
        type: 'input',
        rules: false,
        props: {
          disabled: true,
          withTooltip: true,
        },
      },
      {
        label: I18N.carbonFootprint.specificationAndModel,
        name: 'specification',
        type: 'input',
        rules: false,
        props: {
          disabled: true,
          withTooltip: true,
        },
      },
      {
        label: I18N.components.factorNameSource,
        name: 'sourceLanguageName',
        type: 'input',
        rules: false,

        props: {
          disabled: true,
          withTooltip: true,
        },
      },
      {
        label: I18N.carbonFootprint.applicableIndustries,
        name: 'business',
        padding: '0',
        type: 'select',
        rules: false,
        col: 24,
        props: {
          disabled: true,
          options: menuList?.business,
          mode: 'tags',
          fieldNames: { label: 'dictLabel', value: 'dictValue' },
        },
      },
      {
        label: I18N.components.applicableScenarios,
        name: 'description',
        type: 'textArea',
        rules: false,
        padding: '0',
        col: 24,
        props: {
          disabled: true,
          rows: 4,
        },
      },
      {
        label: I18N.carbonFootprint.remarks,
        name: 'remake',
        type: 'textArea',
        rules: false,
        padding: '0',
        col: 24,
        props: {
          rows: 4,
          disabled: true,
        },
      },
    ],
    factorData: [
      // 1 数值类 2 公式类
      {
        label: I18N.components.valueType,
        name: 'factorType',
        type: 'select',
        rules: false,
        props: {
          disabled: true,
          options: menuList.factorDataType,
          fieldNames: { label: 'dictLabel', value: 'dictValue' },
        },
      },
      ...formulaFactor[factorType - 1],
    ],
    sourceInfo: [
      {
        label: I18N.components.literatureType,
        name: 'documentType',
        type: 'select',
        rules: false,
        props: {
          options: menuList?.documentType,
          disabled: true,
          fieldNames: {
            value: 'dictValue',
            label: 'dictLabel',
          },
        },
      },
      {
        label: I18N.components.sourceCategory,
        name: 'sourceLevel',
        type: 'select',
        rules: false,
        padding: '0',
        props: {
          options: menuList?.sourceLevel,
          disabled: true,
          fieldNames: {
            value: 'dictValue',
            label: 'dictLabel',
          },
        },
      },
      {
        label: I18N.components.publishingInstitutionOr,
        name: 'institution',
        type: 'input',
        rules: false,
        props: {
          disabled: true,
        },
      },
      {
        label: I18N.components.publishingInstitutionOr2,
        name: 'institutionShort',
        type: 'input',
        rules: false,
        props: {
          disabled: true,
        },
      },
      {
        label: I18N.carbonFootprint.yearOfPublication,
        name: 'year',
        type: 'input',
        rules: false,

        props: {
          disabled: true,
        },
      },
      {
        label: I18N.components.releaseDate,
        name: 'publishDate',
        type: 'input',
        rules: false,

        props: {
          disabled: true,
        },
      },
      {
        label: I18N.carbonFootprint.publishingCountryGroups,
        name: 'countries',
        type: 'select',
        rules: false,
        props: {
          disabled: true,
          options: menuList?.reportCountries,
          fieldNames: { label: 'dictLabel', value: 'dictValue' },
        },
      },
    ],
    relevanceFactor: [
      {
        label: '',
        name: 'versionCode',
        type: 'render',
        col: 24,
        padding: '0',
        render() {
          return (
            <Table
              scroll={{ y: 'calc(100vh - 296px)' }}
              columns={relevanceColum}
              dataSource={form.getFieldValue('relationFactorList')}
              pagination={false}
            />
          );
        },
      },
    ],
  };
  if (tabName === 'sourceInfo') {
    if (dataValue.factorUse === '1') {
      // @ts-ignore
      fromItem[tabName].push(...orgItem);
      return fromItem[tabName] || [];
    }
    return fromItem[tabName] || [];
  }
  return fromItem[tabName] || [];
};
export { getPageInfo };
