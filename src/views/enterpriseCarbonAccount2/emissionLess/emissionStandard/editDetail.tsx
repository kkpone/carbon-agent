/**
 * @file 标准 编辑 详情页
 * @author lixingchen
 * */

import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { Form, FormProps, Input, InputNumber, Table } from 'antd';
import '../../style.less';
import { FormActions } from '@src/components/FormActions';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { formPropsInit } from '@src/components/FormUtil/util';
import { Page } from '@src/components/Page';
import { Toast } from '@src/utils/Toast';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import {
  apiStandardInfo,
  apiStandardEdit,
  apiStandardAdd,
  apiComputationEmissionList,
} from '../../service';

const EmissionLessForm = () => {
  const history = useHistory();
  const [form] = Form.useForm();
  const id = new URLSearchParams(window.location.search).get('id');
  const isEidt = new URLSearchParams(window.location.search).get('isEidt');
  const standard = Number(
    new URLSearchParams(window.location.search).get('standardType'),
  );
  const [tmpIds, setTmpIds] = useState<
    { standardEmissionDataId: number; standardEmissionId: number }[]
  >([]);

  const [pageType, setPageType] = useState<'add' | 'edit' | 'detail'>();
  const [settingType, setSettingType] = useState<number>(0);
  const [standardType, setStandardType] = useState<number>(0);
  const [canSelectYear, setCanSelectYear] = useState<number>(0);
  const [selectTag, setSelectTag] = useState<'end' | 'start' | ''>('start');
  const [tableData, setTableData] = useState<any>([]);
  const [formItems, setFormItems] = useState<any>([]);
  const basicsFormProps: FormProps = {
    ...formPropsInit(),
    form,
    layout: 'vertical',
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };
  const computTotal = record => {
    let value = 0;

    if (record.scopeOne || record.scopeTwo || record.scopeThree) {
      value = record.scopeOne + record.scopeTwo + record.scopeThree;
    } else if (
      record.direct ||
      record.energy ||
      record.transport ||
      record.outsourcing ||
      record.supplyChain ||
      record.rests
    ) {
      value =
        record.direct +
        record.energy +
        record.transport +
        record.outsourcing +
        record.supplyChain +
        record.rests;
    }
    record.total = value;

    setTableData([...tableData]);
  };
  const columns: any = [
    {
      title: I18N.enterpriseCarbonAccount2.timeInterval,
      dataIndex: 'CO₂e',
      width: 140,
      fixed: 'left',
      render: (text: number, record) => (
        <div>
          {record.standardEmissionYear}
          {I18N.enterpriseCarbonAccount2.year8}
          {standardType === 1
            ? I18N.template(I18N.enterpriseCarbonAccount2.reco, {
                val1: record.standardEmissionQuarter,
              })
            : standardType === 2
            ? I18N.template(I18N.enterpriseCarbonAccount2.recor, {
                val1: record.standardEmissionMonth,
              })
            : ''}
        </div>
      ),
    },
    {
      title: I18N.enterpriseCarbonAccount2.totalEmissions,
      dataIndex: 'total',
      width: 120,
      render: (text: string) => <Input value={text || 0} disabled />,
    },
    {
      title: I18N.enterpriseCarbonAccount2.ghgStandard,
      dataIndex: 'CO₂e',
      children: [
        {
          title: I18N.enterpriseCarbonAccount2.scopeOne,
          dataIndex: `scopeOne`,
          width: 120,
          render: (text: string, record: any) =>
            pageType === 'detail' ? (
              text ?? '-'
            ) : (
              <InputNumber
                value={text}
                onChange={value => {
                  record.scopeOne = value;
                  computTotal(record);
                }}
              />
            ),
        },
        {
          title: I18N.enterpriseCarbonAccount2.scope2,
          dataIndex: `scopeTwo`,
          width: 120,
          render: (text: string, record: any) =>
            pageType === 'detail' ? (
              text || '-'
            ) : (
              <InputNumber
                value={text}
                onChange={value => {
                  record.scopeTwo = value;
                  computTotal(record);
                }}
              />
            ),
        },
        {
          title: I18N.enterpriseCarbonAccount2.fanWeisan,
          dataIndex: `scopeThree`,
          width: 120,
          render: (text: string, record: any) =>
            pageType === 'detail' ? (
              text ?? '-'
            ) : (
              <InputNumber
                defaultValue={text}
                onChange={value => {
                  record.scopeThree = value;
                  computTotal(record);
                }}
              />
            ),
        },
      ],
    },
    {
      title: I18N.enterpriseCarbonAccount2.isoStandard2,
      dataIndex: 'CO₂e',
      children: [
        {
          title: I18N.enterpriseCarbonAccount2.directDischargeOr,
          dataIndex: `direct`,
          width: 140,
          render: (text: string, record: any) =>
            pageType === 'detail' ? (
              text ?? '-'
            ) : (
              <InputNumber
                defaultValue={text}
                onChange={value => {
                  record.direct = value;
                  computTotal(record);
                }}
              />
            ),
        },
        {
          title: I18N.enterpriseCarbonAccount2.indirectEnergyEmissions,
          dataIndex: `energy`,
          width: 130,
          render: (text: string, record: any) =>
            pageType === 'detail' ? (
              text ?? '-'
            ) : (
              <InputNumber
                defaultValue={text}
                onChange={value => {
                  record.energy = value;
                  computTotal(record);
                }}
              />
            ),
        },
        {
          title: I18N.enterpriseCarbonAccount2.transportationIndirectDischarge,
          dataIndex: `transport`,
          width: 130,
          render: (text: string, record: any) =>
            pageType === 'detail' ? (
              text ?? '-'
            ) : (
              <InputNumber
                defaultValue={text}
                onChange={value => {
                  record.transport = value;
                  computTotal(record);
                }}
              />
            ),
        },
        {
          title: I18N.enterpriseCarbonAccount2.outsourcedProductsOr,
          dataIndex: `outsourcing`,
          width: 190,
          render: (text: string, record: any) =>
            pageType === 'detail' ? (
              text ?? '-'
            ) : (
              <InputNumber
                defaultValue={text}
                onChange={value => {
                  record.outsourcing = value;
                  computTotal(record);
                }}
              />
            ),
        },
        {
          title: I18N.enterpriseCarbonAccount2.downstreamOfSupplyChain3,
          dataIndex: `supplyChain`,
          width: 140,
          render: (text: string, record: any) =>
            pageType === 'detail' ? (
              text ?? '-'
            ) : (
              <InputNumber
                defaultValue={text}
                onChange={value => {
                  record.supplyChain = value;
                  computTotal(record);
                }}
              />
            ),
        },

        {
          title: I18N.enterpriseCarbonAccount2.otherIndirectEmissions,
          dataIndex: `rests`,
          width: 120,
          render: (text: string, record: any) =>
            pageType === 'detail' ? (
              text ?? '-'
            ) : (
              <InputNumber
                defaultValue={text}
                onChange={value => {
                  record.rests = value;
                  computTotal(record);
                }}
              />
            ),
        },
      ],
    },
  ];
  useEffect(() => {
    const settingTypeList = [
      { value: 0, label: I18N.enterpriseCarbonAccount2.singleYear },
    ];
    if (standardType === 0) {
      settingTypeList.push({
        value: 1,
        label: I18N.enterpriseCarbonAccount2.annualAverage,
      });
    }
    const formItems = [
      {
        label: I18N.enterpriseCarbonAccount2.benchmarkClassification,
        name: 'standardType',
        type: 'select',
        rules: false,
        placeholder: I18N.carbonFootprint.pleaseEnter,
        props: {
          disabled: true,
          options: [
            { value: 0, label: I18N.enterpriseCarbonAccount2.annualBenchmark },
            {
              value: 1,
              label: I18N.enterpriseCarbonAccount2.quarterlyBenchmark,
            },
            { value: 2, label: I18N.enterpriseCarbonAccount2.monthlyBenchmark },
          ],
        },
      },

      {
        label: I18N.enterpriseCarbonAccount2.setType,
        name: 'settingType',
        type: 'radio',
        rules: pageType !== 'detail',
        placeholder: I18N.carbonFootprint.pleaseEnter,
        props: {
          disabled: pageType === 'detail',
          options: settingTypeList,
          onChange(e) {
            const { value } = e.target;
            setSettingType(value);
            const soleTime = moment();
            const soleTimes = [moment(), moment()];
            form.setFieldsValue({
              ...form.getFieldsValue(true),
              settingType: value,
              soleTime,
              soleTimes,
            });
            let beginTime;
            let endTime;
            if (value === 1) {
              [beginTime, endTime] = form.getFieldValue('soleTimes');
            } else {
              beginTime = form.getFieldValue('soleTime');
            }
            getListData(beginTime, endTime);
          },
        },
      },
      settingType === 1
        ? {
            label: I18N.enterpriseCarbonAccount2.baseYear2,
            name: 'soleTimes',
            type: 'dateRange',
            padding: '0',
            rules: pageType !== 'detail',
            placeholder: I18N.carbonFootprint.pleaseEnter,
            props: {
              disabled: pageType === 'detail',
              picker: 'year',
              onCalendarChange(_, time, target) {
                setSelectTag(target.range);
                if (target.range === 'end') {
                  const endYear = Number(time[1]);
                  setCanSelectYear(endYear);
                } else {
                  const startYear = Number(time[0]);
                  setCanSelectYear(startYear + 10);
                }
              },
              onOpenChange(isOpen) {
                if (isOpen) {
                  form.setFieldsValue({
                    ...form.getFieldsValue(true),
                    soleTimes: [],
                  });
                  setCanSelectYear(0);
                } else {
                  setSelectTag('');
                  const [beginTime, endTime] = form.getFieldValue('soleTimes');
                  getListData(beginTime, endTime);
                }
              },
              disabledDate(curentTime) {
                // console.log('disabledDate', curentTime);
                const year = Number(moment(curentTime).format('YYYY'));
                if (!canSelectYear) {
                  return false;
                }
                if (selectTag === 'start') {
                  if (
                    year > canSelectYear &&
                    year < canSelectYear + Number.POSITIVE_INFINITY
                  ) {
                    return true;
                  }
                } else if (selectTag === 'end') {
                  if (year < canSelectYear && year < canSelectYear - 10) {
                    return true;
                  }
                }
                return false;
              },
            },
          }
        : {
            label: I18N.enterpriseCarbonAccount2.baseYear2,
            name: 'soleTime',
            type: 'date',
            padding: '0',
            rules: pageType !== 'detail',
            placeholder: I18N.carbonFootprint.pleaseEnter,
            props: {
              disabled: pageType === 'detail',
              picker: 'year',
              onChange(momentTime) {
                getListData(momentTime, '');
              },
            },
          },
      {
        label: I18N.enterpriseCarbonAccount2.baselineEmissions,
        name: 'policy',
        type: 'textArea',
        rules: pageType !== 'detail',
        placeholder: I18N.carbonFootprint.pleaseEnter,
        padding: '0',
        col: 24,
        props: {
          disabled: pageType === 'detail',
          rows: 4,
          maxLength: '500',
          showCount: true,
        },
      },
      {
        label: I18N.enterpriseCarbonAccount2.selectBaseline,
        name: 'reason',
        type: 'textArea',
        rules: pageType !== 'detail',
        placeholder: I18N.carbonFootprint.pleaseEnter,
        padding: '0',
        col: 24,
        props: {
          disabled: pageType === 'detail',
          rows: 4,
          maxLength: '500',
          showCount: true,
        },
      },
      {
        label: I18N.enterpriseCarbonAccount2.benchmarkEmissions2,
        name: 'tableData',
        type: 'render',
        rules: false,
        placeholder: I18N.carbonFootprint.pleaseEnter,
        padding: '0',
        col: 24,
        render() {
          return (
            <div>
              <span className='tip'>
                {I18N.enterpriseCarbonAccount2.unitTCo5}
              </span>
              <Table
                pagination={false}
                scroll={{ y: '40vh' }}
                columns={columns}
                bordered
                dataSource={tableData}
              />
            </div>
          );
        },
      },
    ];
    setFormItems(formItems);
  }, [settingType, canSelectYear, tableData]);

  const getDeatil = id => {
    apiStandardInfo(id).then((res: any) => {
      const { data } = res.data;
      let soleTime = moment();
      let soleTimes = [moment(), moment()];
      if (data.settingType === 1) {
        const soleTimeArr = data.soleTime.split('、');

        if (soleTimeArr.length > 1) {
          soleTimes = [
            moment(soleTimeArr[0] || 0),
            moment(soleTimeArr[1] || 0),
          ];
        }
      } else {
        soleTime = moment(data.soleTime || 0);
      }
      setSettingType(data.settingType);
      setTableData(data.standardEmissionDataList);
      setTmpIds(
        data.standardEmissionDataList?.map(item => ({
          standardEmissionDataId: item.standardEmissionDataId,
          standardEmissionId: item.standardEmissionId,
        })),
      );
      form.setFieldsValue({
        ...data,
        soleTime,
        soleTimes,
      });
      // setoutLessEmissionList([...res.data.data.lessenEmissionIdListInfo]);
    });
  };
  const getListData = (beginTime, endTime) => {
    if (beginTime) {
      beginTime = moment(beginTime).format('YYYY');
    }
    if (endTime) {
      endTime = moment(endTime).format('YYYY');
    }
    apiComputationEmissionList({
      type: standard + 1,
      beginTime,
      endTime,
    }).then((res: any) => {
      setTableData([]);
      setTableData([...res.data.data]);
    });
  };
  useEffect(() => {
    const path = history.location.pathname;

    setStandardType(standard);
    if (path.includes('Edit')) {
      setPageType('edit');
    }
    if (path.includes('Detail')) {
      setPageType('detail');
    }

    if (id !== '0') {
      getDeatil(id);
    } else {
      form.setFieldsValue({
        standardType: standard,
        soleTime: moment(),
        settingType: 0,
      });
      getListData(moment(), '');
    }
  }, []);
  const renturnBtnArr = () => {
    const save = {
      type: 'primary',
      title: I18N.carbonFootprint.preserve,
      onClick: async () => {
        form.validateFields().then(() => {
          const { soleTime, soleTimes, policy, standardType, reason } =
            form.getFieldsValue(true);

          if (form.getFieldValue('standardType') !== 0) {
            tableData.forEach((item, index) => {
              if (isEidt === '1') {
                item.standardEmissionDataId =
                  tmpIds[index || 0].standardEmissionDataId;
                item.standardEmissionId = tmpIds[index || 0].standardEmissionId;
                // item.total = item.total || 0;
              }
            });
          }
          const data = {
            standardType,
            settingType,
            policy,
            standardEmissionDataList: tableData,
            reason,
          };
          if (settingType === 1) {
            let [beginTime, endTine] = soleTimes;
            beginTime = moment(beginTime).format('YYYY');
            endTine = moment(endTine).format('YYYY');
            Object.assign(data, {
              soleTime: `${beginTime}、${endTine}`,
            });
          } else {
            const beginTime = moment(soleTime).format('YYYY');
            Object.assign(data, {
              soleTime: `${beginTime}`,
            });
          }
          if (isEidt === '1') {
            Object.assign(data, {
              standardEmissionId: Number(id),
            });
          }
          const api = isEidt === '1' ? apiStandardEdit : apiStandardAdd;
          api(data).then((res: any) => {
            if (res.data.code === 200) {
              Toast('success', I18N.carbonFootprint.operationSuccessful);
              setTimeout(() => {
                history.goBack();
              }, 400);
            }
          });
        });
      },
    };
    const back = {
      type: 'default',
      title:
        pageType === 'detail'
          ? I18N.carbonFootprint.return
          : I18N.carbonFootprint.cancel,
      onClick: async () => {
        history.goBack();
      },
    };
    if (pageType === 'detail') {
      return [back];
    }
    return [save, back];
  };
  return (
    <div className='emission-box enterprise-carbon-account2'>
      <Page
        breadCrumbs={[
          {
            title: I18N.enterpriseCarbonAccount2.emissionBenchmark,
            key: I18N.enterpriseCarbonAccount2.emissionBenchmark,
            href: RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionStandardList,
          },
          {
            title:
              pageType === 'edit'
                ? I18N.enterpriseCarbonAccount2.editEmissionBasis
                : I18N.enterpriseCarbonAccount2.emissionStandardsDetailed,
            key:
              pageType === 'edit'
                ? I18N.enterpriseCarbonAccount2.editEmissionBasis
                : I18N.enterpriseCarbonAccount2.emissionStandardsDetailed,
          },
        ]}
      >
        <div className='bg-box'>
          <div className='form-box' style={{ border: 0 }}>
            <FormItemUtil
              antdFormProps={basicsFormProps}
              formItems={formItems}
              paddRight={30}
            />
          </div>
        </div>
        {/* @ts-ignore */}
        <FormActions place='center' buttons={renturnBtnArr()} />
      </Page>
    </div>
  );
};
export default EmissionLessForm;
