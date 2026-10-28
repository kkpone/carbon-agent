/*
 * @Author: 张明尧
 * @Date: 2022-08-11 14:57:21
 */
import AiIcon from '@src/assets/icon/ai.svg';
import { FromItemProps, FromItemTypeBack } from '@src/components/FormUtil/type';
import {
  formItemInitInput,
  formItemInitType,
} from '@src/components/FormUtil/util';
import I18N from '@src/lang/I18N';
import { shouldHideEcoinventValue } from '@src/utils/ecoinvent';
import TextWidthOverflow from '@src/views/carbonFootprint3/component/TextOverflowTable/byWidth';
// import { Button, Input } from 'antd';
import { LabeledValue } from 'antd/lib/select';
import { ColumnsType } from 'antd/lib/table';

import style from './index.module.less';
import { associationalFactor } from './service';
import { FilterState, SerachCarbonFactorResult, Sorts } from './type';

let currentName: string;

/**
 * 碳足迹核算-查询排放因子
 */
export const carbonFootprintSearchEmission = (
  unitArr?: LabeledValue[],
  sourceType?: string,
  transportType?: string,
  isEnterprise?: boolean,
): FromItemProps<keyof FromItemTypeBack>[] => {
  const data: FromItemProps<keyof FromItemTypeBack>[] = [
    {
      type: 'searchInput',
      name: 'name',
      label: '',
      rules: false,
      props: {
        placeholder: I18N.carbonFootprint.factorName,
        defaultActiveFirstOption: false,
        showArrow: false,
        filterOption: false,
        showSearch: true,
        notFoundContent: null,
        fetch: async (name: string, callback: Function) => {
          currentName = name;
          const result = await associationalFactor({
            name,
            sourceType,
            transportType,
            isEnterprise,
          });
          if (currentName === name) {
            const transData = result.data.data.map((item: string) => ({
              value: item,
              text: item,
            }));
            callback(transData);
          }
        },
      },
    },
    {
      ...formItemInitInput('', 'description', false),
      props: {
        placeholder: I18N.components.applicableScenarios,
      },
    },

    {
      ...formItemInitInput('', 'specification', false),
      props: {
        placeholder: I18N.carbonFootprint3.specificationAndModel,
      },
    },
    {
      ...formItemInitType('cascader', '', 'factorUnitM', false),
      placeholder: I18N.components.factorDenominatorSingle2,
      props: {
        options: unitArr,
        fieldNames: {
          label: 'dictLabel',
          value: 'dictValue',
          children: 'enumList',
        },
        showSearch: true,
      },
    },
  ];
  return data.map(item => {
    const back = item;
    back.props = {
      style: { width: '200px' },
      ...back.props,
    };
    return back;
  });
};

/**
 * 碳足迹核算-查询排放因子-表格
 */
export const carbonFootprintSearchEmissionCol = (
  countrys?: LabeledValue[],
  filterState?: FilterState,
  sorter?: Sorts,
): ColumnsType<SerachCarbonFactorResult> => [
  {
    title: I18N.carbonFootprint.factorName,
    width: '200px',
    fixed: 'left',
    dataIndex: 'name',
    key: 'name',
    render: (v, item) => (
      <div>
        <div className={style.nameBox}>
          <div className={style.name}>{v}</div>
          {!!item.recommendReason?.length && (
            <img src={AiIcon} alt='AI' className={style.aiIcon} />
          )}
          {item.useStatus === 1 && (
            <div className={style.used}>{I18N.components.used}</div>
          )}
        </div>
        {!!item.recommendReason?.length && (
          <div className={style.recommendReason}>
            <TextWidthOverflow
              value={I18N.template(I18N.components.aiRecommendationTheory, {
                val1: item.recommendReason,
              })}
              width={640}
            />
          </div>
        )}
      </div>
    ),
  },
  {
    title: I18N.carbonFootprint.factorValue,
    width: '200px',
    dataIndex: 'cValue',
    key: 'cValue',
    sorter: true,
    sortOrder: sorter?.columnKey === 'cValue' ? sorter.order : null,
    render: (v, item) => {
      if (shouldHideEcoinventValue(item))
        return (
          <div className={style.ecoinventTips}>
            {I18N.carbonFootprint3.notDisplayedTemporarily1}
          </div>
        );
      return v;
    },
  },
  {
    title: I18N.carbonFootprint.unit,
    width: 200,
    dataIndex: 'unit',
    render: (val: string) => <TextWidthOverflow value={val} width={150} />,
  },
  {
    title: I18N.components.applicableScenarios,
    width: 200,
    dataIndex: 'description',
    render: (val: string) => <TextWidthOverflow value={val} width={150} />,
  },
  {
    title: I18N.carbonFootprint3.specificationAndModel,
    width: 200,
    dataIndex: 'specification',
    render: (val: string) => <TextWidthOverflow value={val} width={150} />,
  },
  {
    title: I18N.carbonFootprint.yearOfPublication,
    width: '120px',
    dataIndex: 'year',
    key: 'year',
    sorter: true,
    sortOrder: sorter?.columnKey === 'year' ? sorter.order : null,
  },
  {
    title: I18N.carbonFootprint.publishingInstitution,
    width: 300,
    dataIndex: 'institution',
    // filteredValue: filterState?.institution || null,
    // filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
    //   <div style={{ padding: '5px 10px' }}>
    //     <Input
    //       allowClear
    //       value={selectedKeys[0]}
    //       onChange={e =>
    //         setSelectedKeys(e.target.value ? [e.target.value] : [])
    //       }
    //       onPressEnter={() => {
    //         confirm();
    //       }}
    //       placeholder={I18N.carbonFootprint.publishingInstitution}
    //     />
    //     <div style={{ textAlign: 'right', marginTop: 5 }}>
    //       <Button
    //         type='text'
    //         style={{
    //           marginLeft: 5,
    //           fontSize: 14,
    //           padding: '2px 10px',
    //           height: 28,
    //         }}
    //         onClick={() => {
    //           setSelectedKeys([]);
    //           confirm();
    //         }}
    //       >
    //         {I18N.carbonFootprint3.reset}
    //       </Button>
    //       <Button
    //         type='primary'
    //         style={{
    //           marginLeft: 5,
    //           fontSize: 14,
    //           padding: '2px 10px',
    //           height: 28,
    //         }}
    //         onClick={() => {
    //           confirm();
    //         }}
    //       >
    //         {I18N.components.search}
    //       </Button>
    //     </div>
    //   </div>
    // ),
    render: (val: string) => <TextWidthOverflow value={val} width={250} />,
  },
  {
    title: I18N.emission.publishingRegion,
    width: '150px',
    dataIndex: 'countries',
    // filteredValue: filterState?.countries || null,
    // filterSearch: true,
    // filters: countrys
    //   ? countrys.map(country => ({
    //       text: country.label,
    //       value: country.value,
    //     }))
    //   : [],
  },
  {
    title: I18N.components.database,
    width: '150px',
    dataIndex: 'factorUse',
    render: (val: string) => {
      if (val === '1') {
        return I18N.carbonFootprint.organizationalFactorLibrary;
      }
      return I18N.carbonFootprint.emissionFactorLibrary;
    },
  },
];
