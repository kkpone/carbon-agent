/** ***
 * 运营数据填写 & 基准年数据填写
 */
import I18N from '@src/lang/I18N';
import { Form, Button } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';
import '@views/carbonDataManagemen/detail/style.less';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import Breadcrumb from '@src/components/Breadcrumb';
import ReturnFrom, {
  ListArrType,
} from '@views/carbonDataManagemen/component/returnFrom';
import { PlusOutlined } from '@ant-design/icons';
import {
  ComstomInputNumber,
  ComstomInput,
  ComstomSelect,
} from '@views/carbonDataManagemen/component/Basic';
import { Toast } from '@src/utils/Toast';
import { objToArr } from '@src/utils';

import {
  ApiIndicatorList,
  ApiOperateDataAdd,
  ApiOperateInfo,
  ApiOperateList,
  ApistandardAdd,
  ApistandardEdit,
  ApistandardId,
} from '../service';
import './style.less';
// import { ApiTargetInfo } from '../service';
export const exStatusObj = {
  0: I18N.carbonDataManagemen.toBeConfirmed,
  1: I18N.components.inProgress,
  2: I18N.carbonDataManagemen.rejected,
  3: I18N.carbonDataManagemen.archived,
  4: I18N.carbonDataManagemen.reviewed,
};
export const exStatusObjColor = {
  0: 'cyan',
  1: 'orange',
  2: 'red',
  3: 'blue',
};
const getOptionYear = (startYear?) => {
  const yearArr: { label: string; value: string; disabled: boolean }[] = [];
  for (let i = +moment().subtract(1, 'year').format('YYYY'); i >= 2000; i--) {
    yearArr.push({
      label: `${i}`,
      value: `${i}`,
      disabled: startYear ? startYear >= +i : false,
    });
  }
  return yearArr;
};
/** *
// 运营数据年份选择
 * 
 * 新增运营数据选择年份时，已选用的数据置灰
  当前年份，表格数据不做必填项校验
 */
const getDataOptionYear = (yeaeArr?) => {
  const yearArr: { label: string; value: string; disabled: boolean }[] = [];
  for (let i = +moment().subtract('year').format('YYYY'); i >= 2000; i--) {
    yearArr.push({
      label: `${i}`,
      value: `${i}`,
      disabled:
        yeaeArr.length > 0
          ? yeaeArr?.some(it => Number(it) === Number(i))
          : false,
    });
  }
  return yearArr;
};
export type TableDataType = {
  discharge: string | number | null;
  scopeOne: string | number | null;
  scopeTwo: string | number | null;
  scopeThree: number | string | number | null;
  fillYear: number | string | number | null;
  fillMonth?: string;
  id?: string;
};
export type IndicatorListType = {
  indicatorId: string | null; //
  indicatorName: string | null; // 指标名称
  indicatorValue: number | null; // 指标值
  unitType: string | null; // 单位选项
  unitValue: string | null; // 单位值
  isAdd: string | null; // 是否可累加:0,是;1,否
  unitLabel: string | null; // 单位标签
  orderNum: string | null; // 排序字段
  foreignId: string | null; // 指标的id
  preset: string | null; // 预置0;非预置1
  type: number | null; // 按年1 按月2
  status: number;
  indicatorMonth?: string | number;
  indicatorYear?: string | number;
  isNew?: boolean;
  index: string;
};
export type IndicatorListTypeMonth = IndicatorListType & {
  list: IndicatorListType[]; // 一月份数据 2月份数据。。。。。。
};
const AddActivity: FC = () => {
  const history = useHistory();
  const [form] = Form.useForm();
  const [formData, changeFormData] = useState({});
  // 表格数据
  const [tableData, changeTableData] = useState<TableDataType[]>([]);
  const [tableDataMonth, changeTableDataMonth] = useState<TableDataType[]>([]);
  // 用于存储 生产指标 数据
  const [productionOperationData, getproductionOperationData] = useState([]);
  // 用于数据填写的tableData数据
  const [indicatorList, getIndicatorList] = useState<
    IndicatorListTypeMonth[] | IndicatorListType[]
  >([]);
  const [indicatorListMonth, getIndicatorListMonth] = useState<
    IndicatorListTypeMonth[] | IndicatorListType[]
  >([]);
  const [isAllowSubmit, changeIsAllowSubmit] = useState(true); // 控制小数点后四位 不能提交
  const [isSubmit, changeIsSubmit] = useState(false);
  const [tableHeight, changeTableHeight] = useState(0);
  // 控制风险查看
  // 判断是否是查看
  const isShow = () => history.location.pathname.indexOf('show') >= 0;
  // 用于存储 添加过的数据
  const [saveYearArr, saveYearFn] = useState<string[]>([]);

  const fromChangeFn = obj => {
    form.setFieldsValue({
      ...form.getFieldsValue(true),
      ...obj,
    });
    changeFormData({
      ...form.getFieldsValue(true),
      ...obj,
    });
  };
  const isShowDisAble = () =>
    ['edit', 'show'].some(item => history.location.pathname.indexOf(item) >= 0);
  // 生成
  const createIndicatorListFn = () => {
    const curindicatorList: IndicatorListTypeMonth[] = [];
    // 按月填写方式
    if (Number(form.getFieldValue('fillType')) === 2) {
      if (indicatorListMonth.length > 0) return;
      productionOperationData.forEach((item: IndicatorListTypeMonth, index) => {
        if (Number(item.preset) === 0) {
          curindicatorList.push({
            indicatorId: item.indicatorId,
            indicatorName: item.indicatorName,
            indicatorValue: null,
            unitType: item.unitType,
            unitValue: item.unitValue,
            isAdd: item.isAdd,
            unitLabel: item.unitLabel,
            orderNum: item.orderNum,
            foreignId: item.indicatorId,
            preset: item.preset,
            type: 2,
            status: 1,
            list: [...returnMonthList(item)],
            index: `${item.indicatorId}-${index}`,
          });
        }
      });
      getIndicatorListMonth([...curindicatorList]);
      return;
    }
    // 按年填写方式
    if (indicatorList.length === 0) {
      productionOperationData.forEach((item: IndicatorListType, index) => {
        if (Number(item.preset) === 0) {
          curindicatorList.push({
            indicatorId: item.indicatorId,
            indicatorName: item.indicatorName,
            indicatorValue: null,
            unitType: item.unitType,
            unitValue: item.unitValue,
            isAdd: item.isAdd,
            unitLabel: item.unitLabel,
            orderNum: item.orderNum,
            foreignId: item.indicatorId,
            preset: item.preset,
            type: 1,
            status: 1,
            index: `${item.indicatorId}-${index}`,
            list: [],
          });
        }
      });
      getIndicatorList([...curindicatorList]);
    }
  };
  // 详情接口
  const getDetail = () => {
    if (history.location.pathname.indexOf('productionOperationData') >= 0) {
      ApiOperateInfo({
        id: new URLSearchParams(window.location.search).get('id') || '',
      }).then(async ({ data }) => {
        form.setFieldsValue({
          ...data.data,
          fillType: `${data.data.fillType}`,
        });
        if (data.data.indicatorList.length > 0) {
          if (Number(data.data.fillType) === 2) {
            const arr = await objToArr({
              arr: data.data.indicatorList,
              keyArr: ['indicatorName', 'foreignId'],
            });
            const newArr = arr.map((item, index) => ({
              ...item,
              index: `${item.indicatorId}-${index}-${item.indicatorName}`,
            }));
            getIndicatorListMonth([...newArr]);
          } else {
            // @ts-ignore
            const newArr = data.data.indicatorList?.map((item, index) => ({
              ...item,
              index: `${item.indicatorId}-${index}-${item.indicatorName}`,
            }));
            getIndicatorList([...newArr]);
          }
        } else {
          createIndicatorListFn();
        }
      });
      return;
    }
    ApistandardId({
      standaId: new URLSearchParams(window.location.search).get('id') || '',
    }).then(({ data }) => {
      if (data.code === 200) {
        form.setFieldsValue({
          ...data.data,
          type: `${data.data.type}`,
          yearType: `${data.data.yearType}`,
          fillType: `${data.data.fillType || 1}`,
          beginYear: data.data.beginYear ? `${data.data.beginYear}` : null,
          endYear: data.data.endYear ? `${data.data.endYear}` : null,
          fixedYear: data.data.fixedYear ? `${data.data.fixedYear}` : null,
        });
      }
      changeFormData({
        ...data.data,
      });
      if (Number(data.data.fillType) === 2) {
        changeTableDataMonth([...data.data.standardList]);
      } else {
        changeTableData([...data.data.standardList]);
      }
    });
  };
  const initObj = {
    scopeOne: null,
    scopeTwo: null,
    scopeThree: null,
    discharge: null,
  };
  const returnYearOrMonthArr = (arr, currentYear) => {
    if (form.getFieldValue('fillType') === '2') {
      for (let i = 1; i <= 12; i++) {
        arr.push({
          ...initObj,
          fillYear: `${currentYear}`,
          fillMonth: I18N.template(I18N.carbonDataManagemen.monthI, {
            val1: i,
          }),
          id: `${currentYear}-${i}`,
        });
      }
    } else {
      arr.push({
        ...initObj,
        fillYear: currentYear,
        id: `${currentYear}`,
      });
    }
  };
  const returnYear = (arr, currentYear) => {
    arr.push({
      ...initObj,
      fillYear: currentYear,
      id: `${currentYear}`,
    });
  };
  const returnMonthArr = (arr, currentYear) => {
    for (let i = 1; i <= 12; i++) {
      arr.push({
        ...initObj,
        fillYear: `${currentYear}`,
        fillMonth: I18N.template(I18N.carbonDataManagemen.monthI, { val1: i }),
        id: `${currentYear}-${i}`,
      });
    }
  };
  // 固定 多年平均 按年填写
  const returnFixedYearsArr = () => {
    const arr3: typeof tableData = [];
    if (!form.getFieldValue('endYear') || !form.getFieldValue('beginYear'))
      return [];
    for (
      let currentYear = form.getFieldValue('endYear');
      currentYear >= form.getFieldValue('beginYear');
      currentYear--
    ) {
      returnYear(arr3, currentYear);
    }
    return arr3;
  };
  // 固定 多年平均 按月填写
  const returnFixedMonthArr = () => {
    const arr3: typeof tableData = [];
    if (!form.getFieldValue('endYear') || !form.getFieldValue('beginYear'))
      return [];
    for (
      let currentYear = form.getFieldValue('endYear');
      currentYear >= form.getFieldValue('beginYear');
      currentYear--
    ) {
      returnMonthArr(arr3, currentYear);
    }
    return arr3;
  };
  // 滚动 年
  const returnTypeYearArr = () => {
    const arr: typeof tableData = [];

    const endYear =
      +moment().format('YYYY') - form.getFieldValue('fixedYear') > 3
        ? +form.getFieldValue('fixedYear') + 3
        : +moment().format('YYYY');
    for (
      let currentYear = form.getFieldValue('fixedYear');
      currentYear < +endYear;
      currentYear++
    ) {
      returnYear(arr, currentYear);
    }
    return arr;
  };
  // 滚动 月
  const returnTypeMonthArr = () => {
    const arr: typeof tableData = [];

    const endYear =
      +moment().format('YYYY') - form.getFieldValue('fixedYear') > 3
        ? +form.getFieldValue('fixedYear') + 3
        : +moment().format('YYYY');
    for (
      let currentYear = form.getFieldValue('fixedYear');
      currentYear < +endYear;
      currentYear++
    ) {
      returnMonthArr(arr, currentYear);
    }
    return arr;
  };
  // 滚动方式 类型选择单一年份时，表格中出现当前年份&后两年的年份
  const returnYearArr = () => {
    const arr: typeof tableData = [];

    const endYear =
      +moment().format('YYYY') - form.getFieldValue('fixedYear') > 3
        ? +form.getFieldValue('fixedYear') + 3
        : +moment().format('YYYY');
    for (
      let currentYear = form.getFieldValue('fixedYear');
      currentYear < +endYear;
      currentYear++
    ) {
      returnYearOrMonthArr(arr, currentYear);
    }
    return arr;
  };

  // 固定 单一年平均
  const changeTableDataFn = () => {
    if (!form.getFieldValue('beginYear') && !form.getFieldValue('fixedYear')) {
      return;
    }
    switch (true) {
      case form.getFieldValue('type') === '0' &&
        form.getFieldValue('yearType') === '0': // 固定 单一年份
        changeTableData([
          {
            ...initObj,
            fillYear: form.getFieldValue('fixedYear'),
            id: form.getFieldValue('fixedYear'),
          },
        ]);
        // eslint-disable-next-line no-case-declarations
        const arr2: typeof tableData = [];
        for (let i = 1; i <= 12; i++) {
          arr2.push({
            ...initObj,
            fillYear: form.getFieldValue('fixedYear'),
            fillMonth: I18N.template(I18N.carbonDataManagemen.monthI, {
              val1: i,
            }),
            id: `${i}-${form.getFieldValue('fixedYear')}`,
          });
        }
        // 按年填写
        changeTableDataMonth([...arr2]);
        return;
      case form.getFieldValue('type') === '0' &&
        form.getFieldValue('yearType') === '1': // 固定 多年平均
        // eslint-disable-next-line no-case-declarations
        const arr3 = returnFixedYearsArr();
        changeTableData([...arr3]);
        // eslint-disable-next-line no-case-declarations
        const arr4: typeof tableData = returnFixedMonthArr();
        changeTableDataMonth([...arr4]);
        return;
      case form.getFieldValue('type') === '1':
        // eslint-disable-next-line no-case-declarations
        const arr = returnTypeYearArr();
        changeTableData([...arr]);
        // eslint-disable-next-line no-case-declarations
        const arr1 = returnTypeMonthArr();
        changeTableDataMonth([...arr1]);
        break;
      default:
    }
  };
  const changeSaveTableDataFn = (isChange?: boolean) => {
    if (!form.getFieldValue('beginYear') && !form.getFieldValue('fixedYear'))
      return;
    switch (true) {
      case form.getFieldValue('type') === '1' &&
        form.getFieldValue('fillType') === '1' &&
        !isChange: // 滚动 按年计算
        // eslint-disable-next-line no-case-declarations
        const arr = returnYearArr();
        changeTableData([...arr]);
        return;
      case form.getFieldValue('type') === '1' &&
        form.getFieldValue('fillType') === '2' &&
        !isChange: // 滚动 按月计算
        // eslint-disable-next-line no-case-declarations
        const arr1 = returnYearArr();
        changeTableDataMonth([...arr1]);
        return;
      case form.getFieldValue('yearType') === '0' &&
        form.getFieldValue('fillType') === '1' &&
        !isChange: // 固定 按年计算
        changeTableData([
          {
            ...initObj,
            fillYear: form.getFieldValue('fixedYear'),
            id: form.getFieldValue('fixedYear'),
          },
        ]);
        return;
      case form.getFieldValue('yearType') === '0' &&
        form.getFieldValue('fillType') === '2' &&
        !isChange:
        // eslint-disable-next-line no-case-declarations
        const arr2: typeof tableData = [];
        for (let i = 1; i <= 12; i++) {
          arr2.push({
            ...initObj,
            fillYear: form.getFieldValue('fixedYear'),
            fillMonth: I18N.template(I18N.carbonDataManagemen.monthI, {
              val1: i,
            }),
            id: `${i}-${form.getFieldValue('fixedYear')}`,
          });
        }
        // 按年填写
        changeTableDataMonth([...arr2]);
        return;
      case form.getFieldValue('yearType') === '1' &&
        form.getFieldValue('fillType') === '1' &&
        !isChange:
        // eslint-disable-next-line no-case-declarations
        const arr3 = returnFixedYearsArr();
        changeTableData([...arr3]);
        return;
      case form.getFieldValue('yearType') === '1' &&
        form.getFieldValue('fillType') === '2' &&
        !isChange:
        // eslint-disable-next-line no-case-declarations
        const arr4: typeof tableData = returnFixedYearsArr();
        changeTableDataMonth([...arr4]);
        break;
      default:
    }
  };
  const culHeight = () => {
    const height = document?.getElementById('carbonDataContent')?.offsetHeight;
    const resultHeight = height && height - 260;
    changeTableHeight(resultHeight || 0);
    return resultHeight;
  };
  useEffect(() => {
    window.addEventListener('resize', culHeight);
  }, []);
  const returnMonthInput = (index, month) => {
    const monthList = indicatorListMonth?.[index] as IndicatorListTypeMonth;
    return (
      <Form.Item
        validateStatus={
          !isSubmit
            ? 'success'
            : Number(form.getFieldValue('operationYear')) ===
              +moment().format('YYYY')
            ? 'success'
            : Number(monthList.list[month - 1].indicatorValue) || undefined
            ? /^\d+(\.\d{0,4})?$/.test(
                // @ts-ignore
                monthList.list[month - 1]?.indicatorValue as string,
              )
              ? 'success'
              : 'warning'
            : 'error'
        }
      >
        <ComstomInputNumber
          placeholder={I18N.components.pleaseFillIn}
          value={Number(monthList.list[month - 1].indicatorValue) || undefined}
          onChange={e => {
            if (!/^\d+(\.\d{0,4})?$/.test(`${e}`)) {
              if (e) {
                Toast('error', I18N.carbonDataManagemen.onlySupportedHere);
              }
              if (
                Number(form.getFieldValue('operationYear')) !==
                Number(moment().format('YYYY'))
              ) {
                changeIsAllowSubmit(false);
                changeIsSubmit(true);
              }
            } else {
              changeIsAllowSubmit(true);
              changeIsSubmit(false);
            }
            const monthList = indicatorListMonth as IndicatorListTypeMonth[];
            // @ts-ignore
            monthList[index].list[month - 1].indicatorValue = e;
            getIndicatorListMonth([...monthList]);
          }}
          style={{ width: '100%' }}
          disabled={isShow()}
        />
      </Form.Item>
    );
  };
  // 计算 新增的下拉框
  const culSelectIndicatorListOption = () => {
    const arr = productionOperationData.map((item: IndicatorListType) => ({
      ...item,
      label: `${item.indicatorName}(${item.unitValue})`,
      value: item.indicatorId,
      disabled: indicatorList.some(it => it.foreignId === item.indicatorId),
    }));
    return arr;
  };
  const culIndicatorListMonthSelectOption = () => {
    const arr = productionOperationData.map((item: IndicatorListType) => ({
      ...item,
      label: `${item.indicatorName}(${item.unitValue})`,
      value: item.indicatorId,
      disabled: indicatorListMonth.some(
        it => it.foreignId === item.indicatorId,
      ),
    }));
    return arr;
  };
  // 获取填写过的运营数据
  const getDataYear = async () => {
    const { data } = await ApiOperateList({
      pageNum: '1',
      pageSize: '1000',
    });
    const arr = data.rows.map(
      (item: { operationYear: string }) => item.operationYear,
    );
    saveYearFn([...arr]);
  };
  /** 用户计算 scope 总数***/
  const scopeOnchange = (e, index, record, key) => {
    if (!/^\d+(\.\d{0,4})?$/.test(`${e}`)) {
      if (e) {
        Toast('error', I18N.carbonDataManagemen.onlySupportedHere);
      }
      if (
        Number(form.getFieldValue('operationYear')) !==
        Number(moment().format('YYYY'))
      ) {
        changeIsAllowSubmit(false);
        changeIsSubmit(true);
      }
    } else {
      changeIsAllowSubmit(true);
      changeIsSubmit(false);
    }
    if (Number(form.getFieldValue('fillType')) === 2) {
      tableDataMonth[index][key] = e;
      tableDataMonth[index].discharge = (
        Number(record.scopeTwo) +
        Number(record.scopeOne) +
        Number(record.scopeThree)
      ).toFixed(4);
      changeTableData([...tableData]);
      changeTableDataMonth([...tableDataMonth]);
      return;
    }
    tableData[index][key] = e;
    tableData[index].discharge = (
      Number(record.scopeTwo) +
      Number(record.scopeOne) +
      Number(record.scopeThree)
    ).toFixed(4);
    changeTableData([...tableData]);
  };
  const returnFromList = isFirst => {
    let arr: ListArrType[] = [];
    let arr1: ListArrType[] = [];
    if (history.location.pathname.indexOf('productionOperationData') >= 0) {
      arr = [
        {
          label: I18N.carbonDataManagemen.yearSelection,
          basetype: 'Select',
          name: 'operationYear',
          rules: [
            {
              required: true,
              message: I18N.carbonDataManagemen.yearSelectionNotAvailable,
            },
          ],
          className: 'comOperationYear',
          baseitem: {
            disabled: isShow(),
            style: { width: '366px' },
            placeholder: I18N.carbonDataManagemen.selectYear,
            options: [...getDataOptionYear(saveYearArr)],
            onChange: e => {
              createIndicatorListFn();
              changeFormData({
                ...form.getFieldsValue(true),
                operationYear: e,
              });
            },
          },
        },
        {
          label: I18N.carbonDataManagemen.dataFillingParty2,
          name: 'fillType',
          rules: [
            {
              required: true,
              message: I18N.carbonDataManagemen.dataFillingParty,
            },
          ],
          basetype: 'RadioGroup',
          baseitem: {
            disabled: isShow(),
            style: { width: '100%' },
            options: [
              {
                label: I18N.carbonDataManagemen.fillInByYear,
                value: '1',
              },
              {
                label: I18N.carbonDataManagemen.fillInOnAMonthlyBasis,
                value: '2',
              },
            ],
            onChange: e => {
              changeFormData({
                ...form.getFieldsValue(true),
                fillType: e.target.value,
              });
              createIndicatorListFn();
            },
          },
        },
        {
          label: '',
          name: '',
          basetype: 'Table',
          baseitem: {
            className: 'dataTable',
            columns:
              Number(form.getFieldValue('fillType')) === 2
                ? [
                    {
                      title: I18N.carbonDataManagemen.productionIndicators2,
                      dataIndex: 'indicatorName',
                      key: 'indicatorName',
                      width: 200,
                      render: (text, record, index) =>
                        record.isNew ? (
                          <Form.Item
                            validateStatus={text ? 'success' : 'error'}
                          >
                            <ComstomSelect
                              style={{ width: '100%' }}
                              placeholder={I18N.carbonFootprint.pleaseSelect}
                              options={[...culIndicatorListMonthSelectOption()]}
                              disabled={isShow()}
                              onChange={(e, option) => {
                                const item =
                                  option as unknown as IndicatorListTypeMonth;
                                indicatorListMonth[index] = {
                                  ...indicatorListMonth[index],
                                  indicatorId: item.indicatorId,
                                  indicatorName: item.indicatorName,
                                  indicatorValue: null,
                                  unitType: item.unitType,
                                  unitValue: item.unitValue,
                                  isAdd: item.isAdd,
                                  unitLabel: item.unitLabel,
                                  orderNum: item.orderNum,
                                  foreignId: item.indicatorId,
                                  preset: item.preset,
                                  type: 2,
                                  status: 1,
                                  isNew: true,
                                  list: [...returnMonthList(item)],
                                } as unknown as IndicatorListTypeMonth;
                                getIndicatorListMonth([...indicatorListMonth]);
                              }}
                            />
                          </Form.Item>
                        ) : text === null ? null : (
                          `${text}(${record?.unitValue})`
                        ),
                      fixed: 'left',
                    },
                    {
                      title: I18N.carbonDataManagemen.january,
                      dataIndex: 'name',
                      key: 'name',
                      width: 120,

                      render: (text, record, index) =>
                        returnMonthInput(index, 1),
                    },
                    {
                      title: I18N.carbonDataManagemen.february,
                      dataIndex: 'name',
                      key: 'name',
                      width: 120,

                      render: (text, record, index) =>
                        returnMonthInput(index, 2),
                    },
                    {
                      title: I18N.carbonDataManagemen.march,
                      dataIndex: 'name',
                      key: 'name',
                      width: 120,

                      render: (text, record, index) =>
                        returnMonthInput(index, 3),
                    },
                    {
                      title: I18N.carbonDataManagemen.april,
                      dataIndex: 'name',
                      key: 'name',
                      width: 120,

                      render: (text, record, index) =>
                        returnMonthInput(index, 4),
                    },
                    {
                      title: I18N.carbonDataManagemen.may,
                      dataIndex: 'name',
                      key: 'name',
                      width: 120,

                      render: (text, record, index) =>
                        returnMonthInput(index, 5),
                    },
                    {
                      title: I18N.carbonDataManagemen.june,
                      dataIndex: 'name',
                      key: 'name',
                      width: 120,

                      render: (text, record, index) =>
                        returnMonthInput(index, 6),
                    },
                    {
                      title: I18N.carbonDataManagemen.july,
                      dataIndex: 'name',
                      key: 'name',
                      width: 120,

                      render: (text, record, index) =>
                        returnMonthInput(index, 7),
                    },
                    {
                      title: I18N.carbonDataManagemen.august,
                      dataIndex: 'name',
                      key: 'name',
                      width: 120,

                      render: (text, record, index) =>
                        returnMonthInput(index, 8),
                    },
                    {
                      title: I18N.carbonDataManagemen.september,
                      dataIndex: 'name',
                      key: 'name',
                      width: 120,

                      render: (text, record, index) =>
                        returnMonthInput(index, 9),
                    },
                    {
                      title: I18N.carbonDataManagemen.october,
                      dataIndex: 'name',
                      key: 'name',
                      width: 120,

                      render: (text, record, index) =>
                        returnMonthInput(index, 10),
                    },
                    {
                      title: I18N.carbonDataManagemen.november,
                      dataIndex: 'name',
                      key: 'name',
                      width: 120,

                      render: (text, record, index) =>
                        returnMonthInput(index, 11),
                    },
                    {
                      title: I18N.carbonDataManagemen.december,
                      dataIndex: 'name',
                      key: 'name',
                      width: 120,

                      render: (text, record, index) =>
                        returnMonthInput(index, 12),
                    },
                    !isShow()
                      ? {
                          title: I18N.carbonFootprint.operation,
                          dataIndex: 'name',
                          key: 'name',
                          fixed: 'right',
                          width: 80,
                          render: (text, record, index) =>
                            indicatorListMonth.length > 1 ? (
                              <Button
                                type='link'
                                disabled={isShow()}
                                onClick={() => {
                                  indicatorListMonth.splice(index, 1);
                                  getIndicatorListMonth([
                                    ...indicatorListMonth,
                                  ]);
                                }}
                              >
                                {I18N.carbonFootprint.delete}
                              </Button>
                            ) : (
                              '-'
                            ),
                        }
                      : {
                          width: 10,
                        },
                  ]
                : [
                    {
                      title: I18N.carbonDataManagemen.productionIndicators2,
                      dataIndex: 'indicatorName',
                      key: 'indicatorName',
                      width: 80,
                      render: (text, record, index) =>
                        record.isNew ? (
                          <Form.Item
                            validateStatus={text ? 'success' : 'error'}
                          >
                            <ComstomSelect
                              style={{ width: '100%' }}
                              placeholder={I18N.carbonFootprint.pleaseSelect}
                              options={[...culSelectIndicatorListOption()]}
                              disabled={isShow()}
                              onChange={(e, option) => {
                                const item =
                                  option as unknown as IndicatorListType;
                                indicatorList[index] = {
                                  ...indicatorList[index],
                                  indicatorId: item.indicatorId,
                                  indicatorName: item.indicatorName,
                                  indicatorValue: null,
                                  unitType: item.unitType,
                                  unitValue: item.unitValue,
                                  isAdd: item.isAdd,
                                  unitLabel: item.unitLabel,
                                  orderNum: item.orderNum,
                                  foreignId: item.indicatorId,
                                  preset: item.preset,
                                  type: 1,
                                  status: 1,
                                } as unknown as IndicatorListType;
                                getIndicatorList([...indicatorList]);
                              }}
                            />
                          </Form.Item>
                        ) : text === null ? null : (
                          `${text}(${record?.unitValue})`
                        ),
                    },
                    {
                      title:
                        form.getFieldValue('operationYear') ||
                        I18N.carbonFootprint.year,
                      dataIndex: 'indicatorValue',
                      key: 'indicatorValue',
                      width: 200,
                      render: (text: string, record, index) => (
                        <Form.Item
                          validateStatus={
                            !isSubmit
                              ? 'success'
                              : Number(form.getFieldValue('operationYear')) ===
                                +moment().format('YYYY')
                              ? 'success'
                              : text
                              ? /^\d+(\.\d{0,4})?$/.test(text)
                                ? 'success'
                                : 'warning'
                              : 'error'
                          }
                        >
                          <ComstomInputNumber
                            style={{ width: '100%' }}
                            disabled={isShow()}
                            value={text}
                            placeholder={I18N.carbonFootprint.pleaseEnter}
                            onChange={e => {
                              if (!/^\d+(\.\d{0,4})?$/.test(`${e}`)) {
                                if (e) {
                                  Toast(
                                    'error',
                                    I18N.carbonDataManagemen.onlySupportedHere,
                                  );
                                }
                                if (
                                  Number(
                                    form.getFieldValue('operationYear'),
                                  ) !== Number(moment().format('YYYY'))
                                ) {
                                  changeIsAllowSubmit(false);
                                  changeIsSubmit(true);
                                }
                              } else {
                                changeIsAllowSubmit(true);
                                changeIsSubmit(false);
                              }
                              // @ts-ignore
                              indicatorList[index].indicatorValue = e;
                              getIndicatorList([...indicatorList]);
                            }}
                          />
                        </Form.Item>
                      ),
                    },
                    !isShow()
                      ? {
                          title: I18N.carbonFootprint.operation,
                          dataIndex: 'name',
                          key: 'name',
                          width: 80,
                          fixed: 'right',
                          render: (text, record, index) =>
                            indicatorList.length > 1 ? (
                              <Button
                                type='link'
                                disabled={isShow()}
                                onClick={() => {
                                  indicatorList.splice(index, 1);
                                  getIndicatorList([...indicatorList]);
                                }}
                              >
                                {I18N.carbonFootprint.delete}
                              </Button>
                            ) : (
                              '-'
                            ),
                        }
                      : {
                          width: 10,
                        },
                  ],
            dataSource:
              Number(form.getFieldValue('fillType')) === 2
                ? [...indicatorListMonth]
                : [...indicatorList],
            pagination: false,
            rowKey: 'index',
            scroll: { x: 900, y: 300 },
            children: history.location.pathname.indexOf('show') === -1 && (
              <div
                className='add-linkman'
                style={{ marginBottom: '30px' }}
                onClick={() => {
                  // 判断是否按年编写
                  if (Number(form.getFieldValue('fillType')) === 1) {
                    indicatorList.push({
                      isNew: true,
                      indicatorId: null,
                      indicatorName: null,
                      indicatorValue: null,
                      unitType: null,
                      unitValue: null,
                      isAdd: null,
                      unitLabel: null,
                      orderNum: null,
                      foreignId: null,
                      preset: null,
                      type: 1,
                      status: 1,
                      list: [],
                      index: `${indicatorList.length + 1}`,
                    });
                    getIndicatorList([...indicatorList]);

                    return;
                  }
                  // 判断是否按月编写
                  if (Number(form.getFieldValue('fillType')) === 2) {
                    const arr2 = indicatorListMonth as IndicatorListTypeMonth[];
                    const item = {
                      isNew: true,
                      indicatorId: null,
                      indicatorName: null,
                      indicatorValue: null,
                      unitType: null,
                      unitValue: null,
                      isAdd: null,
                      unitLabel: null,
                      orderNum: null,
                      foreignId: null,
                      preset: null,
                      type: 2,
                      status: 1,
                    };
                    arr2.push({
                      isNew: true,
                      indicatorId: null,
                      indicatorName: null,
                      indicatorValue: null,
                      unitType: null,
                      unitValue: null,
                      isAdd: null,
                      unitLabel: null,
                      orderNum: null,
                      foreignId: null,
                      preset: null,
                      type: 2,
                      status: 1,
                      indicatorYear: form.getFieldValue('operationYear'),
                      list: [...returnMonthList(item)],
                      index: `${indicatorListMonth.length + 1}`,
                    });
                    getIndicatorListMonth([...arr2]);
                  }
                }}
              >
                <Button type='link' icon={<PlusOutlined />}>
                  {I18N.carbonFootprint.newAddition}
                </Button>
              </div>
            ),
          },
        },
      ];
      return arr;
    }
    arr = [
      {
        label: I18N.carbonDataManagemen.benchmarkYearSetting3,
        name: 'type',
        rules: [
          {
            required: true,
            message: I18N.carbonDataManagemen.benchmarkYearSetting2,
          },
        ],
        basetype: 'RadioGroup',
        className: 'baseYearSet_type',
        baseitem: {
          disabled: isShow(),
          style: { width: '100%' },
          options: [
            {
              label: I18N.carbonDataManagemen.fixed,
              value: '0',
            },
            {
              label: I18N.carbonDataManagemen.rolling,
              value: '1',
            },
          ],
          onChange: e => {
            changeFormData({
              ...form.getFieldsValue(true),
              type: e.target.value,
              yearType: '0',
            });
            form.setFieldsValue({
              ...form.getFieldsValue(true),
              type: e.target.value,
              yearType: '0',
            });
            changeTableDataFn();
          },
        },
      },
      {
        label: I18N.carbonDataManagemen.baseYearType,
        name: 'yearType',
        rules: [
          { required: true, message: I18N.carbonDataManagemen.baseYearType2 },
        ],
        basetype: 'RadioGroup',
        baseitem: {
          disabled: isShow(),
          style: { width: '100%' },
          options:
            form.getFieldValue('type') === '1'
              ? [
                  {
                    label: I18N.enterpriseCarbonAccount2.singleYear,
                    value: '0',
                  },
                ]
              : [
                  {
                    label: I18N.enterpriseCarbonAccount2.singleYear,
                    value: '0',
                  },
                  {
                    label: I18N.enterpriseCarbonAccount2.annualAverage,
                    value: '1',
                  },
                ],
          onChange: e => {
            changeFormData({
              ...FormData,
              yearType: e,
            });
            changeTableDataFn();
          },
        },
      },
      {
        label: '',
        name: '',
        basetype: 'DatePicker',
        className: 'comInput',
        baseitem: {},
        childrenArr:
          form.getFieldValue('yearType') === '0'
            ? [
                {
                  label: I18N.carbonDataManagemen.yearSelection,
                  name: 'fixedYear',
                  rules: [
                    {
                      required: true,
                      message:
                        I18N.carbonDataManagemen.yearSelectionNotAvailable,
                    },
                  ],
                  basetype: 'Select',
                  className: 'baseYearSet_fixedYear',
                  baseitem: {
                    disabled: isShow(),
                    style: { width: '400px' },
                    placeholder: I18N.carbonDataManagemen.selectYear,
                    options: [...getOptionYear()],
                    onChange: () => {
                      changeTableDataFn();
                      form.setFieldsValue({
                        ...form.getFieldsValue(true),
                      });
                    },
                  },
                },
              ]
            : [
                {
                  label: I18N.carbonDataManagemen.yearSelection,
                  name: 'beginYear',
                  rules: [
                    {
                      required: true,
                      message:
                        I18N.carbonDataManagemen.yearSelectionNotAvailable,
                    },
                  ],
                  basetype: 'Select',
                  style: { display: 'block' },
                  baseitem: {
                    disabled: isShow(),

                    style: { width: '400px' },
                    placeholder: I18N.carbonDataManagemen.selectStartYear,
                    options: [...getOptionYear()],
                    onChange: () => {
                      changeTableDataFn();
                    },
                  },
                },
                {
                  label: '',
                  name: 'endYear',
                  rules: [
                    {
                      required: true,
                      message:
                        I18N.carbonDataManagemen.yearSelectionNotAvailable,
                    },
                  ],
                  basetype: 'Select',
                  baseitem: {
                    disabled: isShow(),

                    style: { width: '400px' },
                    placeholder: I18N.carbonDataManagemen.selectEndYear,
                    options: [
                      ...getOptionYear(+form.getFieldValue('beginYear')),
                    ],
                    onChange: () => {
                      changeTableDataFn();
                    },
                  },
                },
              ],
      },
    ];
    arr1 = [
      {
        label: I18N.carbonDataManagemen.dataFillingParty2,
        name: 'fillType',
        rules: [
          {
            required: true,
            message: I18N.carbonDataManagemen.dataFillingParty,
          },
        ],
        basetype: 'RadioGroup',
        baseitem: {
          disabled: isShow(),
          style: { width: '100%' },
          options: [
            {
              label: I18N.carbonDataManagemen.fillInByYear,
              value: '1',
            },
            {
              label: I18N.carbonDataManagemen.fillInOnAMonthlyBasis,
              value: '2',
            },
          ],
          onChange: e => {
            changeFormData({
              ...FormData,
              fillType: e.target.value,
            });
            const culisChange =
              Number(e.target.value) === 1
                ? tableData.length === 0
                : tableDataMonth.length === 0;
            changeSaveTableDataFn(!culisChange);
          },
        },
      },
      {
        label: '',
        name: 'fillType',
        rules: [
          { required: true, message: I18N.carbonDataManagemen.baseYearType2 },
        ],
        basetype: 'Table',
        baseitem: {
          scroll: {
            x: 1000,
            y: tableHeight || culHeight(),
          },
          style: {
            width: '100%',
          },
          className: 'carbonDataTable',
          columns: [
            {
              title: I18N.carbonFootprint.number,
              dataIndex: 'name',
              key: 'name',
              width: 90,
              render: (text, record, index: number) => index + 1,
            },
            {
              title: I18N.carbonFootprint.year,
              dataIndex: 'fillYear',
              key: 'fillYear',
              width: 90,
            },
            form.getFieldValue('fillType') === '2'
              ? {
                  title: I18N.DomesticVersion.month3,
                  dataIndex: 'fillMonth',
                  key: 'fillMonth',
                  width: 90,
                }
              : {},
            {
              title: I18N.enterpriseCarbonAccount2.emissionsTC2,
              dataIndex: 'discharge',
              key: 'discharge',
              width: form.getFieldValue('fillType') === '2' ? 180 : '22%',
              render: text => (
                <Form.Item validateStatus={text ? 'success' : 'error'}>
                  <ComstomInput
                    style={{ width: '100%' }}
                    disabled
                    placeholder={I18N.components.pleaseFillIn}
                    value={text}
                  />
                </Form.Item>
              ),
            },
            {
              title: I18N.carbonDataManagemen.scope1TC,
              dataIndex: 'scopeOne',
              key: 'scopeOne',
              width: form.getFieldValue('fillType') === '2' ? 180 : '22%',

              render: (text, record, index: number) => (
                <Form.Item
                  validateStatus={
                    !isSubmit
                      ? 'success'
                      : text
                      ? /^\d+(\.\d{0,4})?$/.test(text)
                        ? 'success'
                        : 'warning'
                      : 'error'
                  }
                >
                  <ComstomInputNumber
                    disabled={isShow()}
                    style={{ width: '100%' }}
                    onChange={e => {
                      scopeOnchange(e, index, record, 'scopeOne');
                    }}
                    placeholder={I18N.components.pleaseFillIn}
                    value={text}
                  />
                </Form.Item>
              ),
            },
            {
              title: I18N.carbonDataManagemen.scope2TC,
              dataIndex: 'scopeTwo',
              key: 'scopeTwo',
              width: form.getFieldValue('fillType') === '2' ? 180 : '22%',

              render: (text, record, index: number) => (
                <Form.Item
                  validateStatus={
                    !isSubmit
                      ? 'success'
                      : text
                      ? /^\d+(\.\d{0,4})?$/.test(text)
                        ? 'success'
                        : 'warning'
                      : 'error'
                  }
                >
                  <ComstomInputNumber
                    disabled={isShow()}
                    style={{ width: '100%' }}
                    onChange={e => {
                      scopeOnchange(e, index, record, 'scopeTwo');
                    }}
                    placeholder={I18N.components.pleaseFillIn}
                    value={text}
                  />
                </Form.Item>
              ),
            },
            {
              title: I18N.carbonDataManagemen.scopeThreeTC,
              dataIndex: 'scopeThree',
              key: 'scopeThree',
              width: form.getFieldValue('fillType') === '2' ? 180 : '22%',

              render: (text, record, index: number) => (
                <Form.Item
                  validateStatus={
                    !isSubmit
                      ? 'success'
                      : text
                      ? /^\d+(\.\d{0,4})?$/.test(text)
                        ? 'success'
                        : 'warning'
                      : 'error'
                  }
                >
                  <ComstomInputNumber
                    disabled={isShow()}
                    style={{ width: '100%' }}
                    onChange={e => {
                      scopeOnchange(e, index, record, 'scopeThree');
                    }}
                    placeholder={I18N.components.pleaseFillIn}
                    value={text}
                  />
                </Form.Item>
              ),
            },
          ],
          dataSource:
            Number(form.getFieldValue('fillType')) === 2
              ? [...tableDataMonth]
              : [...tableData],
          pagination: false,
          rowKey: 'id',
        },
      },
    ];
    return isFirst ? arr : arr1;
  };
  const returnFrom = useMemo(
    () => (
      <ReturnFrom
        form={form}
        layout='horizontal'
        key='baseYearSet'
        style={{ width: '100%', margin: '0 auto' }}
        listArr={[...returnFromList(true)]}
      />
    ),
    [
      formData,
      tableData,
      tableDataMonth,
      indicatorList,
      productionOperationData,
      indicatorListMonth,
      saveYearArr,
      isSubmit,
      tableHeight,
    ],
  );
  const returnFrom1 = useMemo(
    () => (
      <ReturnFrom
        form={form}
        layout='horizontal'
        key='baseYearSet'
        style={{ width: '100%', margin: '0 auto' }}
        listArr={[...returnFromList(false)]}
      />
    ),
    [
      formData,
      tableData,
      tableDataMonth,
      indicatorList,
      productionOperationData,
      indicatorList,
      indicatorListMonth,
      saveYearArr,
      isSubmit,
      tableHeight,
    ],
  );
  // 获取生产经营指标 列表
  const ApiIndicatorListFn = async () => {
    await ApiIndicatorList({
      pageNum: '1',
      pageSize: '10000',
      status: '0',
      delFlag: '0',
    }).then(({ data }) => {
      getproductionOperationData([...data.rows]);
      // if (isShowDisAble()) {
      //   //@ts-ignore
      //   getDetail();
      //   return;
      // }
    });
  };
  useEffect(() => {
    if (isShowDisAble()) {
      getDetail();
      return;
    }
    createIndicatorListFn();
  }, [productionOperationData]);
  // 生成12个月数组
  const returnMonthList = item => {
    const arr2: IndicatorListType[] = [];
    for (let i = 1; i <= 12; i++) {
      arr2.push({
        indicatorId: item.indicatorId,
        indicatorName: item.indicatorName,
        indicatorValue: null,
        unitType: item.unitType,
        unitValue: item.unitValue,
        isAdd: item.isAdd,
        unitLabel: item.unitLabel,
        orderNum: item.orderNum,
        foreignId: item.indicatorId,
        preset: item.preset,
        type: 2,
        status: 1,
        indicatorMonth: i,
        indicatorYear: form.getFieldValue('operationYear'),
        index: `${item.indicatorId}-i`,
      });
    }
    return arr2;
  };

  const culIsNull = (arr, key) =>
    // if(arr)
    arr.some(item => item[key] === null);
  // 如果新增
  useEffect(() => {
    ApiIndicatorListFn();
    getDataYear();
    // if (isShowDisAble()) {
    //   getDetail();
    //   return;
    // }
    // 新增时 默认状态固定 默认状态单一年扽
    fromChangeFn({
      type: '0',
      yearType: '0',
      fillType: '1',
    });
    return () => {
      getIndicatorList([]);
      getIndicatorListMonth([]);
    };
  }, []);
  return (
    <>
      <section
        style={{
          marginBottom: '10px',
        }}
      >
        <Breadcrumb />
      </section>
      <div
        className='golalDetail'
        style={{
          marginBottom: '10px',
          boxSizing: 'border-box',
          height: 172,
          overflow: 'visible',
          flex:
            history.location.pathname.indexOf('productionOperationData') >= 0
              ? '1'
              : 'none',
        }}
      >
        {/* <div className='computation_left'>{returnFrom}</div> */}
        {returnFrom}
      </div>
      {history.location.pathname.indexOf('productionOperationData') === -1 && (
        <div className='carbonData_content' id='carbonDataContent'>
          <div
            className='computation_left'
            style={{ marginBottom: '20px', overflow: 'hidden' }}
          >
            <h3>{I18N.carbonDataManagemen.baseYearData}</h3>
            {returnFrom1}
          </div>
        </div>
      )}
      <div className='bottom-box' style={{ justifyContent: 'center' }}>
        <Button
          onClick={() => {
            history.go(-1);
          }}
        >
          {I18N.carbonFootprint.cancel}
        </Button>
        {!isShow() && (
          <Button
            type='primary'
            onClick={() => {
              // eslint-disable-next-line consistent-return
              form.validateFields().then(async value => {
                changeIsSubmit(true);
                if (!isAllowSubmit)
                  return Toast('error', I18N.carbonDataManagemen.dataFilledOut);
                // 如果是编写 生产运营数据
                if (
                  history.location.pathname.indexOf(
                    'productionOperationData',
                  ) >= 0
                ) {
                  // 判断是否是按年编写还是按月编写
                  const indicatorListArr = [];
                  if (Number(form.getFieldValue('fillType')) === 2) {
                    const listArr =
                      indicatorListMonth as IndicatorListTypeMonth[];
                    listArr.forEach(item => {
                      item.list.forEach(it => {
                        // @ts-ignore
                        indicatorListArr.push(it);
                      });
                    });
                  }
                  const obj = {
                    ...value,
                    indicatorList:
                      Number(form.getFieldValue('fillType')) === 2
                        ? indicatorListArr
                        : indicatorList,
                  };
                  if (
                    culIsNull(
                      Number(form.getFieldValue('fillType')) === 2
                        ? indicatorListArr
                        : indicatorList,
                      'indicatorName',
                    )
                  ) {
                    return Toast(
                      'error',
                      I18N.carbonDataManagemen.productionIndicators,
                    );
                  }
                  if (
                    culIsNull(
                      Number(form.getFieldValue('fillType')) === 2
                        ? indicatorListArr
                        : indicatorList,
                      'indicatorValue',
                    ) &&
                    +form.getFieldValue('operationYear') !==
                      +moment().format('YYYY')
                  ) {
                    return Toast(
                      'error',
                      I18N.carbonDataManagemen.dataFilledOut,
                    );
                  }
                  const id = new URLSearchParams(window.location.search).get(
                    'id',
                  );
                  if (id) {
                    obj.operateId = new URLSearchParams(
                      window.location.search,
                    ).get('id');
                  }
                  await ApiOperateDataAdd(
                    obj,
                    new URLSearchParams(window.location.search).get('id')
                      ? 'put'
                      : 'post',
                  ).then(({ data }) => {
                    if (data.code === 200) {
                      history.go(-1);
                    }
                  });
                  // eslint-disable-next-line consistent-return
                  return;
                }
                if (
                  culIsNull(
                    Number(form.getFieldValue('fillType')) === 2
                      ? tableDataMonth
                      : tableData,
                    'discharge',
                  )
                ) {
                  return Toast('error', I18N.carbonDataManagemen.dataFilledOut);
                }
                if (
                  culIsNull(
                    Number(form.getFieldValue('fillType')) === 2
                      ? tableDataMonth
                      : tableData,
                    'scopeOne',
                  )
                ) {
                  return Toast('error', I18N.carbonDataManagemen.dataFilledOut);
                }
                if (
                  culIsNull(
                    Number(form.getFieldValue('fillType')) === 2
                      ? tableDataMonth
                      : tableData,
                    'scopeTwo',
                  )
                ) {
                  return Toast('error', I18N.carbonDataManagemen.dataFilledOut);
                }
                if (
                  culIsNull(
                    Number(form.getFieldValue('fillType')) === 2
                      ? tableDataMonth
                      : tableData,
                    'scopeThree',
                  )
                ) {
                  return Toast('error', I18N.carbonDataManagemen.dataFilledOut);
                }
                const submitObj = {
                  ...value,
                  standardList:
                    Number(form.getFieldValue('fillType')) === 2
                      ? tableDataMonth
                      : tableData,
                  beginYear:
                    form.getFieldValue('yearType') === '0'
                      ? null
                      : value.beginYear,
                  endYear:
                    form.getFieldValue('yearType') === '0'
                      ? null
                      : value.endYear,
                  fixedYear:
                    form.getFieldValue('yearType') === '1'
                      ? null
                      : value.fixedYear,
                };
                if (history.location.pathname.indexOf('edit') >= 0) {
                  await ApistandardEdit({
                    ...submitObj,
                    standaId:
                      new URLSearchParams(window.location.search).get('id') ||
                      '',
                  }).then(({ data }) => {
                    if (data.code === 200) {
                      history.go(-1);
                    }
                  });
                  // eslint-disable-next-line consistent-return
                  return;
                }
                await ApistandardAdd({
                  ...submitObj,
                }).then(({ data }) => {
                  if (data.code === 200) {
                    history.go(-1);
                  }
                });
              });
            }}
          >
            {I18N.carbonFootprint.preserve}
          </Button>
        )}
      </div>
    </>
  );
};

export default AddActivity;
