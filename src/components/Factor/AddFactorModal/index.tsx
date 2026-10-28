/**
 * @file 添加排放因子modal
 */

import { listALLByDictTypeData } from '@src/api/api';
import { addFactor, editFactor } from '@src/api/factors';
import { ModalBase, ModalBaseProps } from '@src/components/UI/Modal';
import { customizeRenderEmpty } from '@src/index';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import {
  apiListALLByDictTypeData,
  apiMarkQuery,
  apiMnumListALLByDictTypeBatch,
  apiSourceList,
  ColUmsType,
} from '@src/views/emission/Show/service';
import { Dicts } from '@src/views/emission/Show/type';
import {
  useBaseFormJson,
  useNumberTypeColumn,
  useSourceFormJson,
} from '@src/views/emission/utils';
import { renderFormItems } from '@src/views/emission/utils/formItems';
import {
  EmissionFactorMenu,
  FactorInfoForms,
  FormJsonItemType,
} from '@src/views/emission/utils/index-type';
import { FactorUse } from '@src/views/utils';
import { ConfigProvider, Form, Table, Tabs } from 'antd';
import { useForm } from 'antd/es/form/Form';
import classNames from 'classnames';
import { compact } from 'lodash-es';
import moment from 'moment';
import { useEffect, useMemo, useRef, useState } from 'react';

import style from './index.module.less';

type AddFactorProps = ModalBaseProps & {
  showType?: ShowType;
};

export type ShowType =
  | {
      type: 'add';
    }
  | {
      id: string | number;
      type: 'edit' | 'show';
      factorType: FactorUse;
    };

export const AddFactorModal = ({
  className,
  onOk,
  showType,
  ...props
}: AddFactorProps) => {
  const [form] = useForm();
  const [formSelects, setFormSelects] = useState<EmissionFactorMenu>({});
  const [activeTab, setActiveTab] = useState(
    I18N.carbonFootprint.basicInformation,
  );
  // 数据是否可以更改
  const isDisabled = showType?.type === 'show';
  const baseFormItem = useBaseFormJson().map(t => {
    if (t.name) {
      if (t.name === I18N.components.firstLevelClassificationBrief) {
        return { ...t, name: I18N.components.firstLevelClassification };
      }
      if (t.name === I18N.components.secondaryClassificationBrief) {
        return { ...t, name: I18N.carbonFootprint.secondaryClassification };
      }
      if (
        [
          I18N.carbonFootprint.scenarioDescription,
          I18N.components.nameInSimplifiedChinese,
        ].includes(t.name as string)
      )
        return t;
      return null;
    }
    return null;
  });
  // 来源信息
  const sourceItem = useSourceFormJson({
    fileList: [],
    menuList: formSelects,
    isOwner: false,
  }).filter(
    t =>
      t.name &&
      [
        I18N.carbonFootprint.yearOfPublication,
        I18N.components.literatureType,
        I18N.components.sourceCategory,
        I18N.components.publishingInstitutionOr,
        I18N.carbonFootprint.publishingCountryGroups,
      ].includes(t.name as string),
  );
  // 排序输入框
  const formItemBase = useMemo(() => {
    const baseItems = compact([...baseFormItem, ...sourceItem]);
    const sortedItems = compact([
      ...[
        I18N.components.nameInSimplifiedChinese,
        I18N.components.firstLevelClassification,
        I18N.carbonFootprint.secondaryClassification,
        I18N.carbonFootprint.yearOfPublication,
        I18N.components.literatureType,
        I18N.components.sourceCategory,
        I18N.components.publishingInstitutionOr,
        I18N.carbonFootprint.publishingCountryGroups,
        // '场景描述', // 这个字段改为最后显示
      ].map(name => {
        const target = baseItems.find(t => t.name === name);
        return {
          ...target,
          require:
            name === I18N.components.nameInSimplifiedChinese
              ? target?.require
              : false,
        } as FormJsonItemType;
      }),

      { name: 'empty' },
      baseItems.find(t => t.name === I18N.carbonFootprint.scenarioDescription),
    ]);

    return sortedItems?.map(t => ({ ...t, disabled: isDisabled }));
  }, [baseFormItem, sourceItem, isDisabled]);
  // 获取数值类型、计算类型table数据
  const getTableFactorDatas = async () =>
    apiSourceList().then(async ({ data }) => {
      if (Number(data.code) === 200) {
        const result = data.data?.gasData || [];
        const co2e = result.slice(result.length - 1);
        // 数值类
        setNumberFactorDatas([...co2e, ...result.slice(0, result.length - 1)]);
      }
    });
  const cancelRequest = useRef<AbortController>();
  // 获取下拉框字典项
  const apiMnumListALLByDictTypeBatchFn = async () => {
    cancelRequest.current = new AbortController();
    await apiMnumListALLByDictTypeBatch({
      dictTypes: `sourceLanguage,factorDataType,reportArea,sourceLevel,factorUnitM,factorUnitZ,PFCseNUM,HFCsEnum,business,factorLabel,reportCountries,methaneUnitZ,nitrousUnitZ,hydrofluorocarbonUnitZ,perfluorocarbonUnitZ,sulfurUnitZ,nitrogenUnitZ,cequivalentUnitZ,firstClassify,placeOfPublication,formulaChance,documentType,carrierTypes,formulaUnitZ,formulaUnitM,forestryUnitZ,forestryUnitM,co2eFormulaUnitZ,co2eForestryUnitZ`,
      signal: cancelRequest.current?.signal,
    }).then(({ data }) => {
      setFormSelects({ ...data.data });
    });
  };
  // 单位字典项
  const [cascaderOptions, getCascaderOptions] = useState<Dicts[]>([]);
  const apiListALLByDictTypeDataFn = async () =>
    apiListALLByDictTypeData({ dictType: 'factorUnitM' }).then(({ data }) => {
      getCascaderOptions(data?.data || []);
    });
  // 获取二级分类
  const getSecondDicts = (params: {
    dictType: string | number;
    labelValue: string | number;
  }) =>
    listALLByDictTypeData(params).then(({ data }) => {
      const d = data?.data;
      setFormSelects({ ...formSelects, secondClassify: d });
    });

  // 数值类
  const [numberFactorDatas, setNumberFactorDatas] = useState<ColUmsType[]>([]);
  // 数值类型表头
  const columns = useNumberTypeColumn<ColUmsType>({
    isDisabled,
    menuList: formSelects,
    setValues: setNumberFactorDatas,
    cascaderOptions,
  });

  const renderFormItem = renderFormItems({
    onSelectChange(e, item) {
      if (item.title === 'secondClassify') {
        form.setFieldsValue({
          esecondClassify: formSelects?.secondClassify?.find(
            l => l.dictValue === e,
          )?.relatedValue,
        });
      }
      // 一级分类 -> 一级分类英文 二级分类
      if (item.title === 'firstClassify') {
        form.setFieldsValue({
          secondClassify: undefined,
          esecondClassify: undefined,
          efirstClassify: formSelects?.firstClassify?.find(
            l => l.dictValue === e,
          )?.relatedValue,
        });
        getSecondDicts({
          dictType: 'secondClassify',
          labelValue: e as unknown as string,
        });
      }
    },
    renderCaculateTable: () => (
      // 数值类
      <Table
        bordered
        rowKey='id'
        dataSource={numberFactorDatas}
        columns={columns}
        pagination={false}
      />
    ),
    isDisabled,
    yearPickerValue: moment(form.getFieldValue('year')),
    datePickerValue: moment(form.getFieldValue('date')),
  });

  useEffect(() => {
    apiMnumListALLByDictTypeBatchFn();
    apiListALLByDictTypeDataFn();

    if (!showType) {
      getTableFactorDatas();
    }
    return () => {
      cancelRequest.current?.abort();
    };
  }, []);
  useEffect(() => {
    setActiveTab(I18N.carbonFootprint.basicInformation);
  }, [props.visible]);
  useEffect(() => {
    if (showType?.type === 'show' || showType?.type === 'edit') {
      apiMarkQuery({ id: showType.id, factorUse: 1 }, showType.factorType).then(
        ({ data }) => {
          form.setFieldsValue({
            ...data?.data,
            year: moment(data?.data?.year).isValid()
              ? moment(data?.data?.year)
              : undefined,
          });
          if (data?.data?.firstClassify) {
            getSecondDicts({
              dictType: 'secondClassify',
              labelValue: data.data.firstClassify,
            });
          }
          const result = data?.data?.gasData;
          const co2e = result.slice(result.length - 1);
          // 数值类
          setNumberFactorDatas([
            ...co2e,
            ...result.slice(0, result.length - 1),
          ]);
        },
      );
    }
  }, [showType?.type]);
  const resetData = () => {
    form.resetFields();
    getTableFactorDatas();
  };
  const title =
    showType?.type === 'edit'
      ? I18N.carbonFootprint.edit
      : showType?.type === 'add'
      ? I18N.carbonFootprint.add
      : I18N.carbonFootprint.check;

  const type =
    showType?.type === 'add' || showType?.factorType === FactorUse.organization
      ? I18N.components.organization
      : I18N.components.carbonHindrance;
  return (
    <ModalBase
      title={I18N.template(I18N.components.title, { val1: title, val2: type })}
      width={978}
      {...props}
      onCancel={e => {
        resetData();
        props?.onCancel?.(e);
      }}
      okButtonProps={{
        style: showType?.type === 'show' ? { display: 'none' } : {},
      }}
      wrapClassName={classNames(className, style.wrapper)}
      // eslint-disable-next-line consistent-return
      onOk={async e => {
        if (showType?.type === 'show') {
          return onOk?.(e);
        }
        form
          .validateFields()
          // eslint-disable-next-line consistent-return
          .then(values => {
            const obj: FactorInfoForms = {
              ...values,
              year: values.year ? moment(values.year).format('YYYY') : '',
              publishDate: values?.publishDate
                ? moment(values.publishDate).format('YYYY-MM-DD')
                : '',
            };
            // 数值
            const [co2e, ...newGas] = numberFactorDatas;
            // 恢复正常的数据格式，不然后端会存储错误
            obj.carbonFactorGas = [...newGas, co2e];
            const mustChooseCarbonFactorGas = co2e;
            if (
              mustChooseCarbonFactorGas &&
              (!mustChooseCarbonFactorGas?.activeUnit ||
                !mustChooseCarbonFactorGas?.factorUnit ||
                !mustChooseCarbonFactorGas.factorUnitM ||
                !mustChooseCarbonFactorGas.factorValue)
            ) {
              Toast('error', I18N.components.carbonDioxideWhen);
              return false;
            }

            if (showType?.type === 'edit') {
              editFactor({ ...obj, id: `${showType.id}` }).then(({ data }) => {
                if (data.code === 200) {
                  resetData();
                  onOk?.(e);
                }
              });
            } else if (showType?.type === 'add') {
              // 新增
              addFactor(obj).then(({ data }) => {
                if (data?.code === 200) {
                  Toast('success', I18N.carbonFootprint3.createdSuccessfully);
                  resetData();
                  onOk?.(e);
                }
              });
            } else {
              resetData();
              // 查看
              onOk?.(e);
            }
          })
          .catch(e => {
            if (
              e?.errorFields?.length &&
              activeTab !== I18N.carbonFootprint.basicInformation
            ) {
              Toast('error', e.errorFields[0]?.errors?.[0]);
            }
          });
      }}
      content={
        <ConfigProvider renderEmpty={customizeRenderEmpty}>
          <Form form={form} layout='vertical' preserve>
            <Tabs activeKey={activeTab} onChange={tab => setActiveTab(tab)}>
              <Tabs.TabPane
                tab={I18N.carbonFootprint.basicInformation}
                key={I18N.carbonFootprint.basicInformation}
              >
                {renderFormItem(formItemBase, 'basicMsg', style.formItem)}
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={I18N.components.factorData}
                key={I18N.components.factorData}
              >
                {renderFormItem(
                  [
                    {
                      type: 'oneTable',
                      title: 'result',
                    },
                  ],
                  'factor',
                  'two',
                )}
              </Tabs.TabPane>
            </Tabs>
          </Form>
        </ConfigProvider>
      }
    />
  );
};
