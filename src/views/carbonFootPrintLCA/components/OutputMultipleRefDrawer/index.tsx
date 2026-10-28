/**
 * @description 过程管理-输出列表-多重引用的主输出详情抽屉
 */
import {
  Form,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Select,
  NumberPicker,
  Cascader,
  ArrayTable,
} from '@formily/antd-v5';
import { createForm, onFieldValueChange, onFormInit } from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button, Drawer } from 'antd';
import { isEmpty } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

import { InfoTitle } from '@/components/InfoTitle';
import { IconFont } from '@/components/LcaIconFont';
import { useAllEnumsBatch } from '@/hooks';
import { PageTypeInfo } from '@/router/utils/enums';
import {
  LANG_TYPE,
  Toast,
  changeFactorM2cascaderOptions,
  handleLangFields,
} from '@/utils';

import style from './index.module.less';
import { schema, onHandleAddOrEditData, onHandleDetailData } from './schemas';
import { ProcessModelIORes } from '../../CarbonFootprintModel/type';
import { SOURCE_TYPE_MAPPING } from '../../utils';
import {
  defaultUnitTo,
  WEIGHT_RADIO_COUNT_UNIT,
} from '../ProcessManageDrawer/constant';
import { getUnitConvert } from '../ProcessManageDrawer/service';
import {
  PROCESS_CATEGORY_LABEL,
  RESEARCH_OBJECT_TYPE,
} from '../ProcessManageTable/constant';

/** 新增、编辑、查看 */
const { add, edit, show } = PageTypeInfo;

/** 质量换算系数需要的输入输出流的单位 */
const { T, KG, G } = WEIGHT_RADIO_COUNT_UNIT;

const SchemaField = createSchemaField({
  components: {
    Input,
    Select,
    NumberPicker,
    Cascader,
    ArrayTable,
    InfoTitle,
    Form,
    FormItem,
    FormGrid,
    FormLayout,
  },
});

interface OutputMultipleRefDrawerProps {
  /** 是否展示基准流 */
  showBaseLine?: boolean;
  /** 列表操作按钮的类型 */
  actionBtnType?: string;
  /** 类别:1 输入; 2 输出; 3 产品 */
  categoryType?: number;
  /** 控制抽屉的显隐 */
  open: boolean;
  /** 过程管理详情 */
  processManageDataSource?: ProcessModelIORes;
  /** 列表数据ID */
  processColumnId?: number;
  /** 当前模型id */
  modelId?: number;
  /** 当前过程code */
  processCode?: string;
  /** 保存方法 */
  onSave: (
    /** 保存的数据 */
    values: ProcessModelIORes,
    /** 成功回调 */
    successCallBack: () => void,
    /** 失败回调 */
    failCallBack: () => void,
  ) => void;
  /** 关闭抽屉的方法 */
  onClose: () => void;
}

const OutputMultipleRefDrawer = ({
  showBaseLine,
  actionBtnType,
  categoryType,
  open,
  processManageDataSource,
  processColumnId,
  modelId,
  processCode,
  onSave,
  onClose,
}: OutputMultipleRefDrawerProps) => {
  const isAdd = actionBtnType === add;
  const isDetail = actionBtnType === show;

  const unitPath = 'unit';

  /** 抽屉名称 */
  const categoryName =
    PROCESS_CATEGORY_LABEL[categoryType as keyof typeof PROCESS_CATEGORY_LABEL];

  /** 抽屉标题 */
  const drawerTitle = {
    [add]: I18N.template(I18N.carbonFootPrintLCA.addTit, {
      val1: categoryName,
    }),
    [edit]: I18N.template(I18N.carbonFootPrintLCA.editTit, {
      val1: categoryName,
    }),
    [show]: I18N.template(I18N.carbonFootPrintLCA.title, {
      val1: categoryName,
    }),
  };

  const enumOptions = useAllEnumsBatch('factorUnitM');

  /** 单位枚举 */
  const unitOptions = enumOptions?.factorUnitM;

  /** 保存按钮的loading */
  const [btnLoading, setBtnLoading] = useState(false);

  /** 数量单位 */
  const [countUnit, setCountUnit] = useState<string>();

  /** 详情返回的质量换算系数 */
  const [weightRatio, setWeightRatio] = useState<number>();

  const form = useMemo(
    () =>
      createForm({
        readPretty: isDetail,
        effects() {
          onFormInit(current => {
            current.setFieldState(`*(${unitPath})`, async state => {
              state.componentType = isDetail ? 'Input' : 'Cascader';
            });
          });
        },
      }),
    [categoryType, actionBtnType, open],
  );

  /** 表单监听 */
  const onAddFormListenerFn = () => {
    form.removeEffects('*');
    form.addEffects('*', () => {
      /** 最上面的数量单位 */
      onFieldValueChange(`*(${unitPath})`, field => {
        setCountUnit(field?.value?.[1]);
        setWeightRatio(undefined);
      });
    });
  };

  /** 设置质量单位换算系数 */
  useEffect(() => {
    if (!countUnit) {
      form.setFieldState(`*(weightRatio)`, {
        value: undefined,
      });
    }
    /** 详情返回了单位换算比例，不需要调用接口 */
    if (weightRatio !== undefined) {
      form.setFieldState(`*(weightRatio)`, {
        value: weightRatio,
      });
      return;
    }
    if (countUnit && unitOptions) {
      /** 获取在单位枚举中质量为kg、g、t的枚举标识的集合 */
      const dictValueArr = unitOptions
        .filter(item => [T, KG, G].includes(item.dictLabel))
        .map(item => item.dictValue);
      /** 获取质量单位为kg的枚举值 */
      const unitTo =
        unitOptions.find(v => v.dictLabel === KG)?.dictValue || defaultUnitTo;
      getUnitConvert({
        unitOne: countUnit,
        unitTwo: unitTo,
      }).then(({ data }) => {
        form.setFieldState(`*(weightRatio)`, {
          /** 数量单位为t、kg、g时，自动转换，其他时为0 */
          value: dictValueArr.includes(countUnit) ? data?.data?.unitValue : 0,
        });
      });
    }
  }, [countUnit, weightRatio, unitOptions]);

  useEffect(() => {
    if (!categoryType && !actionBtnType) {
      return;
    }
    /** 新增时，监听表单变化 */
    if (isAdd && !processManageDataSource) {
      onAddFormListenerFn();
      return;
    }

    /** 获取详情 */
    if (!isAdd && processManageDataSource && !isEmpty(unitOptions)) {
      const {
        unit,
        weightRatio: weightRatioBack,
        researchObject,
      } = processManageDataSource;
      /** 是否是主要研究对象 */
      const isMainResearchObject =
        researchObject === RESEARCH_OBJECT_TYPE.MAIN_RESEARCH_OBJECT;

      if (isMainResearchObject) {
        /** 主要研究对象禁用单位 */
        form.setFieldState(`*(unit)`, {
          disabled: true,
          required: false,
        });
      }

      /** 数量单位处理 */
      const unitBack = unit ? unit.split(',') : undefined;

      form.setValues({
        ...onHandleDetailData({
          showBaseLine,
          processManageDataSource,
          unitOptions,
          isDetail,
        }),
      });

      /** 数量单位 */
      setCountUnit(unitBack?.[1]);

      /** 质量换算系数 */
      setWeightRatio(weightRatioBack);

      /** 监听表单变化 */
      onAddFormListenerFn();
    }
  }, [
    isAdd,
    processManageDataSource,
    categoryType,
    actionBtnType,
    unitOptions,
  ]);

  /** 表单的枚举值设置 */
  useEffect(() => {
    if (!actionBtnType) {
      return;
    }

    /** 单位的枚举 */
    if (unitOptions) {
      form.setFieldState(`*(${unitPath})`, {
        dataSource: changeFactorM2cascaderOptions(unitOptions),
      });
    }
  }, [unitOptions, actionBtnType]);

  const onDrawerInit = () => {
    form.reset();
  };

  return (
    <Drawer
      key={processColumnId}
      className={style.wrapper}
      title={drawerTitle[actionBtnType as keyof typeof actionBtnType]}
      open={open}
      closeIcon={false}
      maskClosable={false}
      destroyOnClose
      placement='right'
      size='large'
      width='55%'
      extra={
        <div
          className={style.closeIcon}
          onClick={() => {
            onDrawerInit();
            onClose();
          }}
        >
          <IconFont icon='icon-icon-guanbi' />
        </div>
      }
      onClose={() => {
        onDrawerInit();
        onClose();
      }}
      footer={[
        <Button
          onClick={() => {
            onDrawerInit();
            onClose();
          }}
        >
          {isDetail ? I18N.carbonFootPrintLCA.close : I18N.Factors.cancel}
        </Button>,
        !isDetail && (
          <Button
            type='primary'
            loading={btnLoading}
            onClick={async () => {
              const values = await form.submit<ProcessModelIORes>();

              /** 表单处理后数据 */
              const formInfo = onHandleAddOrEditData({
                formValues: values,
              });

              /** 当前输入输出相关的信息 */
              const iOInfo = {
                /** 输入输出类型 */
                ioType: categoryType,
                /** 当前所处的模型 */
                modelId,
                /** 当前过程code */
                processCode,
                /** 列表id */
                id: processColumnId,
              };

              /** 处理多语言 */
              const languageSourceList = handleLangFields({
                rawData: formInfo,
                langType: LANG_TYPE.EN,
                sourceTypeMapping: SOURCE_TYPE_MAPPING,
                apiLanguageSourceList:
                  processManageDataSource?.languageSourceList,
              });

              const result = {
                ...formInfo,
                ...iOInfo,
                languageSourceList,
                // 随便写死就行
                dataType: 1,
              };

              setBtnLoading(true);
              onSave(
                result,
                () => {
                  Toast('success', I18N.Factors.saveSuccessful);
                  setBtnLoading(false);
                  onDrawerInit();
                },
                () => {
                  setBtnLoading(false);
                },
              );
            }}
          >
            {I18N.Factors.preserve}
          </Button>
        ),
      ]}
    >
      <Form form={form} previewTextPlaceholder='-'>
        <SchemaField schema={schema()} />
      </Form>
    </Drawer>
  );
};
export default OutputMultipleRefDrawer;
