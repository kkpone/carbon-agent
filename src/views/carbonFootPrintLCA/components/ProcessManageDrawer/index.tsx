/**
 * @description 过程管理详情抽屉（产品、输入、输出）
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
  Radio,
  DatePicker,
  ArrayTable,
} from '@formily/antd-v5';
import {
  Field,
  createForm,
  onFieldValueChange,
  onFormInit,
} from '@formily/core';
import { FormConsumer, createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button, Drawer, Space } from 'antd';
import { compact, includes, isEmpty } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

import { FormilyFileUpload } from '@/components/FormilyFileUpload';
import { InfoTitle } from '@/components/InfoTitle';
import { IconFont } from '@/components/LcaIconFont';
import { TextArea } from '@/components/TextArea';
import { useAllEnumsBatch } from '@/hooks';
import { checkAuth } from '@/layout/utills';
import { PageTypeInfo } from '@/router/utils/enums';
import {
  LANG_TYPE,
  Toast,
  changeFactorM2cascaderOptions,
  formatScientific,
  handleAssessmentProposalOptions,
  handleLangFields,
  publishYear,
} from '@/utils';

import {
  defaultUnitTo,
  OUTPUT_TYPE,
  SELECT_BUTTON_OPTIONS,
  SELECT_BUTTON_OPTIONS_REF,
  SELECT_BUTTON_OPTIONS_VALUES,
  SELECT_BUTTON_TYPE,
  WEIGHT_RADIO_COUNT_UNIT,
} from './constant';
import style from './index.module.less';
import {
  schema,
  fileSchema,
  upOrDownAssociatesOutOrInSchemas,
  upOrDownstreamDataSchemas,
  databaseSchemas,
  onHandleAddOrEditData,
  onHandleDetailData,
} from './schemas';
import { getUnitConvert } from './service';
import { AssociationIo } from './type';
import {
  AssessmentDto,
  MatchDataResp,
  OptionsType,
  ProcessModelIORes,
} from '../../CarbonFootprintModel/type';
import { useDataCategoryEnums } from '../../hook';
import { SOURCE_TYPE_MAPPING } from '../../utils';
import { LcaFactor } from '../ChooseDatabaseModal/type';
import { ChooseModel } from '../ChooseModelModal/type';
import { ChooseProcessLibrary } from '../ChooseProcessModal/type';
import { ApplyRefDto } from '../ChooseSupplyModal/type';
import {
  OTHER_CONNECT_TITLE,
  PROCESS_CATEGORY_LABEL,
  RESEARCH_OBJECT_TYPE,
} from '../ProcessManageTable/constant';
import { TitleHeader } from '../TitleHeader';

/** 新增、编辑、查看 */
const { add, edit, show } = PageTypeInfo;

/** 上下游数据选择按钮类型：过程数据、模型引用、数据库数据、引用供应商结果数据、因子数据 */
const {
  PROCESS_DATA,
  MODEL_REFERENCE,
  DATABASE_DATA,
  SUPPLIER_DATA,
  FACTOR_DATA,
} = SELECT_BUTTON_TYPE;

/** 输出类型 可再生输出物 有价值的输出物*/
const { RENEWABLE_OUTPUTS, VALUABLE_OUTPUTS } = OUTPUT_TYPE;

/** 质量换算系数需要的输入输出流的单位 */
const { T, KG, G } = WEIGHT_RADIO_COUNT_UNIT;

const SchemaField = createSchemaField({
  components: {
    Input,
    Select,
    NumberPicker,
    Cascader,
    Radio,
    DatePicker,
    TextArea,
    ArrayTable,
    FormilyFileUpload,
    InfoTitle,
    Form,
    FormItem,
    FormGrid,
    FormLayout,
  },
});

interface ProcessManageDrawerProps {
  /** 是否是过程库 */
  isProcessesLibraryModule?: boolean;
  /** 是否展示基准流 */
  showBaseLine?: boolean;
  /** 生命周期枚举 */
  lifeCycleList?: OptionsType[];
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
  /** 是否展示生命周期阶段选择按钮 */
  showLifeStageSelectRadio?: boolean;
  /** 选择的输入输出 */
  selectedIO?: AssociationIo;
  /** 选择的过程 */
  selectedProcess?: ChooseProcessLibrary;
  /** 选择的引用模型 */
  selectedModel?: ChooseModel;
  /** 模型引用选择的关联输入输出 */
  selectedModelIO?: AssociationIo;
  /** 选择的供应商数据 */
  selectedSupply?: ApplyRefDto;
  /** 选择的数据库数据 */
  selectedDatabase?: LcaFactor;
  /** 当前模型id */
  modelId?: number;
  /** 当前过程code */
  processCode?: string;
  /** 当前过程管理表格所在列的信息 */
  processManageColumnInfo?: {
    /** 是否是子节点-多重引用的输出 */
    isChild: boolean;
    /** 是否是多重引用的新增关联输出 */
    isAddConnect: boolean;
    /** 多重引用主输出code */
    multiMainIoCode?: string;
    /** 新增输出单位 */
    unit?: string;
  };
  /** 上下游数据按钮切换的方法 */
  onDataTypeChange: () => void;
  /** 过程数据-选择当前模型过程的方法 20240812去掉name自动带过去的功能 直接调用不传name值了 就不改别地了*/
  onChooseModalProcessClick?: (name?: string) => void;
  /** 过程数据-选择过程库过程的方法 20240812去掉name自动带过去的功能  */
  onChooseProcessClick?: (name?: string) => void;
  /** 模型引用-选择模型的方法 */
  onChooseModelClick?: () => void;
  /** 模型引用-选择关联输入输出的方法 */
  onChooseModelIOClick?: () => void;
  /** 引用供应商结果数据-选择供应商数据结果的方法 */
  onChooseSupplierClick?: () => void;
  /** 数据库数据-手动选择数据库数据  20240812去掉name自动带过去的功能 */
  onChooseDatabaseClick?: (name?: string) => void;
  /** 数据库数据-点击数据匹配的方法 */
  onClickDataMatch?: (
    /** 匹配数据 */
    matchData: {
      /** 数据分类 */
      lcaFactorCategory?: string;
      /** 具体材质 */
      lcaMaterial?: string;
    },
    /** 成功回调 */
    successCallBack: (result?: MatchDataResp) => void,
    /** 失败回调 */
    failCallBack: () => void,
  ) => void;
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

const ProcessManageDrawer = ({
  isProcessesLibraryModule = false,
  showBaseLine,
  lifeCycleList,
  actionBtnType,
  categoryType,
  open,
  processManageDataSource,
  processColumnId,
  showLifeStageSelectRadio,
  selectedIO,
  selectedProcess,
  selectedModel,
  selectedModelIO,
  selectedSupply,
  selectedDatabase,
  modelId,
  processCode,
  processManageColumnInfo,
  onDataTypeChange,
  onChooseProcessClick,
  onChooseModalProcessClick,
  onChooseModelClick,
  onChooseModelIOClick,
  onChooseSupplierClick,
  onChooseDatabaseClick,
  onClickDataMatch,
  onSave,
  onClose,
}: ProcessManageDrawerProps) => {
  const {
    isChild = false,
    isAddConnect,
    unit: connectUnit,
    multiMainIoCode,
  } = processManageColumnInfo || {};

  const isAdd = actionBtnType === add;
  const isDetail = actionBtnType === show;

  /** 是否是输入 */
  const isInput = categoryType === 1;

  /** 上下游数据的过程path */
  const upOrDownstreamProcessPath =
    'upOrDownstreamData.lifeCycle,upOrDownstreamData.relatedProcessName,upOrDownstreamData.relatedProductName,upOrDownstreamData.relatedProductUnit,upOrDownstreamData.[timeRepresentStart, timeRepresentEnd],upOrDownstreamData.areaRepresent,upOrDownstreamData.areaRepresentDetail,upOrDownstreamData.processDesc';
  /** 上下游数据的因子path */
  const upOrDownstreamFactorPath = `${upOrDownstreamProcessPath},upOrDownstreamData.assessmentList`;
  /** 单位换算比例的path */
  const convertRatioPath =
    'upOrDownstreamData.convertRatio,upOrDownAssociates.convertRatio,databaseData.convertRatio,upOrDownSupplier.convertRatio';
  /** 单位的path */
  const unitPath =
    'unit,upOrDownstreamData.relatedProductUnit,upOrDownAssociates.relatedInputUnit,upOrDownSupplier.supplyUnit,databaseData.databaseProductUnit';

  /** 抽屉名称 */
  const categoryName =
    isChild || isAddConnect
      ? OTHER_CONNECT_TITLE
      : PROCESS_CATEGORY_LABEL[
          categoryType as keyof typeof PROCESS_CATEGORY_LABEL
        ];

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

  /** 数据分类枚举 */
  const dataCategoryOptions = useDataCategoryEnums();

  const enumOptions = useAllEnumsBatch(
    'factorUnitM,cequivalentUnitZ,productOrigin,AssessmentProposal',
  );

  /** lca评价方法 */
  const assessmentMethodOptions = enumOptions?.AssessmentProposal;

  /** 单位枚举 */
  const unitOptions = enumOptions?.factorUnitM;

  /** 最上面的数量单位 */
  const [countUnit, setCountUnit] = useState<string>();

  /** 详情返回的单位换算比例 */
  const [convertRatio, setConvertRatio] = useState<number>();

  /** 详情返回的质量换算系数 */
  const [weightRatio, setWeightRatio] = useState<number>();

  /** 上下游数据的产品单位-自建因子、核算单位-引用供应商结果 上下游关联的输出/输入单位  数据库数据的产品单位*/
  const [productUnit, setProductUnit] = useState<string>();

  /** 产品碳足迹-单位 */
  const productCarbonFootPrintUnitOptions = enumOptions?.cequivalentUnitZ;

  /** 地理代表性枚举 */
  const areaRepresentOptions = enumOptions?.productOrigin;

  /** 保存按钮的loading */
  const [btnLoading, setBtnLoading] = useState(false);

  /** 数据匹配按钮的loading */
  const [matchLoading, setMatchLoading] = useState(false);

  /** 是否未匹配到数据 展示提示 */
  const [isMatchedError, setIsMatchedError] = useState(false);

  /** 未匹配到数据的错误提示 */
  const [matchedErrorTip, setMatchedErrorTip] = useState('');

  /** 选择的输入输出ioCode */
  const [selectedIOCode, setSelectedIOCode] = useState<string>();

  /** 输入输出支撑材料权限 */
  const hasFileAuth = isProcessesLibraryModule
    ? !!checkAuth('/carbonFootprintLCA/processLibrary/ioFile', true)
    : !!checkAuth('/carbonFootprintLCA/model/ioFile', true);

  /** 手动选择权限 */
  const hasFactorAuth = isProcessesLibraryModule
    ? !!checkAuth('/carbonFootprintLCA/processLibrary/factor', true)
    : !!checkAuth('/carbonFootprintLCA/model/factor', true);

  const form = useMemo(
    () =>
      createForm({
        readPretty: isDetail,
        effects() {
          onFormInit(current => {
            setSelectedIOCode(undefined);
            current.setFieldState(`*(${unitPath})`, async state => {
              state.componentType = isDetail ? 'Input' : 'Cascader';
            });
            current.setFieldState(
              `upOrDownDatabase.lcaFactorCategory`,
              async state => {
                state.componentType = isDetail ? 'Input' : 'Cascader';
              },
            );
            current.setFieldState(`*(${upOrDownstreamProcessPath})`, {
              disabled: true,
              required: false,
            });
            current.setFieldState(`supportFile`, {
              disabled: !hasFileAuth || isDetail,
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
      /** 切换类型处理linkType */
      onFieldValueChange('dataType', (field, f) => {
        /** 如果是有价值的输出物-linkType设为数据库数据 */
        if (field.value === VALUABLE_OUTPUTS) {
          f.setValuesIn('linkType', DATABASE_DATA);
        }
      });

      /** 切换评价方法处理评价指标 */
      onFieldValueChange(
        '*(upOrDownstreamData.assessmentList.*.assessmentMethod)',
        field => {
          const { path } = field;

          /** 评价指标路径 */
          const targetPath = `upOrDownstreamData.assessmentList.${path.segments[2]}.assessmentTarget`;

          /** 切换评价方法时清空评价指标的值 */
          form.reset(targetPath);
        },
      );
      /** 切换评价方法带出单位 */
      onFieldValueChange(
        '*(upOrDownstreamData.assessmentList.*.assessmentTarget)',
        field => {
          const { value, dataSource, path } = field;

          /** 单位路径 */
          const unitRowPath = `upOrDownstreamData.assessmentList.${path.segments[2]}.unit`;
          /** 对应的单位*/
          const { unit } =
            dataSource?.filter(d => d.value === value)?.[0] || {};

          /** 赋值 */
          form.setFieldState(unitRowPath, {
            value: unit,
          });
        },
      );
      /** 切换上下游数据选择按钮，清空上下游数据，打开禁用限制 */
      onFieldValueChange('linkType', f => {
        /** 重置数据库提示 */
        setIsMatchedError(false);

        /** 清空上下游数据及其单位换算比例、清空上下游关联数据、清空数据库数据*/
        form.reset(
          `*(${upOrDownstreamFactorPath},upOrDownstreamData.convertRatio,upOrDownModel,upOrDownAssociates,upOrDownSupplier,upOrDownDatabase,databaseData`,
        );

        /** 需要打开禁用限制的按钮：自建因子 */
        const openLimit = includes([FACTOR_DATA], f.value);

        /** 打开禁用限制 */
        if (openLimit) {
          /** 自建因子默认添加一行评价指标 */
          if (f.value === FACTOR_DATA) {
            form.setValuesIn('upOrDownstreamData.assessmentList', [{}]);
          }

          form.setFieldState(`*(${upOrDownstreamFactorPath})`, {
            disabled: false,
            required: true,
          });

          /** 地理代表性详情地址不必填 */
          form.setFieldState(`*(upOrDownstreamData.areaRepresentDetail)`, {
            disabled: false,
            required: false,
          });
        } else {
          /** 其他依旧禁用 */
          form.setFieldState(`*(${upOrDownstreamFactorPath})`, {
            disabled: true,
            required: false,
          });
        }

        /** 地理代表性的必填*号 */
        form.setFieldState('*(upOrDownstreamData.area)', state => {
          state.decoratorProps = {
            ...state.decoratorProps,
            asterisk: openLimit,
          };
        });

        onDataTypeChange();
      });

      /** 最上面的数量单位 */
      onFieldValueChange('unit', field => {
        setCountUnit(field?.value?.[1]);
        setConvertRatio(undefined);
        setWeightRatio(undefined);
      });

      /** 上下游关联的单位 */
      onFieldValueChange('upOrDownAssociates.relatedInputUnit', field => {
        setProductUnit(field?.value?.[1]);
        setConvertRatio(undefined);
      });

      /** 自建因子-产品单位 */
      onFieldValueChange('upOrDownstreamData.relatedProductUnit', field => {
        setProductUnit(field?.value?.[1]);
        setConvertRatio(undefined);
      });

      /** 引用供应商结果数据-核算单位 */
      onFieldValueChange('upOrDownSupplier.supplyUnit', field => {
        setProductUnit(field?.value?.[1]);
        setConvertRatio(undefined);
      });

      /** 数据库数据-产品单位 */
      onFieldValueChange('databaseData.databaseProductUnit', field => {
        setProductUnit(field?.value?.[1]);
        setConvertRatio(undefined);
      });
    });
  };

  /** linkType的枚举-有价值的输出物没有前两个、多重引用的输出只有前两个 */
  const getLinkTypeEnum = () => async (field: Field) => {
    if (isChild || isAddConnect) {
      // 多重引用的输出只有前两个
      field.setDataSource(SELECT_BUTTON_OPTIONS_REF);
    } else {
      /** 是否是有价值的输出物 */
      const isValueOutput =
        field?.form?.getValuesIn('dataType') === VALUABLE_OUTPUTS;
      /** 链接类型枚举 */
      const currentLinkTypeEnum = isValueOutput
        ? SELECT_BUTTON_OPTIONS_VALUES
        : SELECT_BUTTON_OPTIONS;
      field.setDataSource(currentLinkTypeEnum);
    }
  };

  /** 根据评价方法值获取评价指标的option */
  const getTargetOption = (
    methodValue: string,
    selectedValues: (string | number)[],
  ) => {
    if (methodValue && assessmentMethodOptions) {
      /** 全量option */
      const allOption = handleAssessmentProposalOptions(
        assessmentMethodOptions,
      );
      /** 评价指标option */
      let targetOption =
        allOption?.filter(d => d?.value === methodValue)?.[0]?.children || [];

      /** 过滤掉已选中的评价指标值 */
      if (selectedValues.length > 0) {
        targetOption = targetOption?.filter(
          option => !selectedValues?.includes(option.value),
        );
      }

      return targetOption;
    }
    return [];
  };

  /** 获取评价指标的枚举值 */
  const matchTargetOptionFn = () => async (field: Field) => {
    const { path } = field;
    const rowIndex = path.segments[2];
    const rowMethodPath = `upOrDownstreamData.assessmentList.${path.segments[2]}.assessmentMethod`;
    const rowMethodValue = form.getValuesIn(rowMethodPath);

    /** 当前表格值 */
    const currentAssessmentList: AssessmentDto[] = form.getValuesIn(
      'upOrDownstreamData.assessmentList',
    );

    /** 获取所有已选中的评价指标值，排除当前行的值 */
    const allSelectedValues =
      compact(
        currentAssessmentList?.map((row: AssessmentDto, index: number) =>
          index !== rowIndex ? row?.assessmentTarget : undefined,
        ),
      ) || [];

    const targetOption = getTargetOption(rowMethodValue, allSelectedValues);

    field.setDataSource(targetOption);
  };

  /** 自动填充输入/输出名称及单位方法-有值不填充 无值才填充 */
  const autoFillIOFn = (selectedInfo: AssociationIo) => {
    if (!selectedInfo) return;

    const { ioNameZh, ioNameEn, unit } = selectedInfo;

    /** 数量单位处理 */
    const unitArr = unit ? unit.split(',') : undefined;

    /** 当前的输入输出名称（中文） */
    const currentIoName = form.getValuesIn('ioName');
    /** 当前的输入输出名称（英文） */
    const currentIoNameEn = form.getValuesIn('ioNameEn');
    /** 当前的数量单位 */
    const currentUnit = form.getValuesIn('unit');

    if (!currentIoName) {
      form.setValuesIn('ioName', ioNameZh);
    }

    if (!currentIoNameEn) {
      form.setValuesIn('ioNameEn', ioNameEn);
    }

    if (!currentUnit) {
      form.setValuesIn('unit', unitArr);
    }
  };

  /** 设置单位换算比例 */
  useEffect(() => {
    if (!countUnit || !productUnit) {
      form.setFieldState(`*(${convertRatioPath})`, {
        value: undefined,
      });
    }
    /** 详情返回了单位换算比例，不需要调用接口 */
    if (convertRatio) {
      form.setFieldState(`*(${convertRatioPath})`, {
        value: convertRatio,
      });
      return;
    }
    if (countUnit && productUnit) {
      getUnitConvert({
        unitOne: countUnit,
        unitTwo: productUnit,
      }).then(({ data }) => {
        form.setFieldState(`*(${convertRatioPath})`, {
          value: data?.data?.unitValue,
        });
      });
    }
  }, [countUnit, productUnit, convertRatio]);

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
        value: weightRatio ?? '',
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

    if (isDetail) {
      /** 详情反显隐藏操作列*/
      form.setFieldState('*(upOrDownstreamData.assessmentList.columns5)', {
        hidden: true,
      });
    }
    /** 新增时，监听表单变化 */
    if (isAdd && !processManageDataSource) {
      /** 新增关联输出时代入单位 */
      if (isAddConnect) {
        /** 数量单位处理 */
        const connectUnitArr = connectUnit ? connectUnit.split(',') : undefined;
        /** 数量单位 */
        setCountUnit(connectUnitArr?.[1]);
        form.setValuesIn('unit', connectUnitArr);
      }
      onAddFormListenerFn();
      return;
    }

    /** 获取详情 */
    if (!isAdd && processManageDataSource && !isEmpty(unitOptions)) {
      /** 是否是主要研究对象 */
      const isMainResearchObject =
        processManageDataSource.researchObject ===
        RESEARCH_OBJECT_TYPE.MAIN_RESEARCH_OBJECT;

      if (isMainResearchObject) {
        /** 主要研究对象禁用单位 */
        form.setFieldState(`*(unit)`, {
          disabled: true,
          required: false,
        });
      }

      /** 详情时上下游数据除单位换算比例以外的字段禁用 */
      form.setFieldState(`*(${upOrDownstreamFactorPath})`, {
        disabled: true,
        required: false,
      });

      /** 数量单位、自建因子数据、过程数据、单位换算比例、链接类型 供应商数据*/
      const {
        unit,
        ioData,
        linkIo,
        convertRatio: convertRatioBack,
        weightRatio: weightRatioBack,
        linkType,
        supplierRef,
      } = processManageDataSource;

      /** 数量单位处理 */
      const unitBack = unit ? unit.split(',') : undefined;

      /** 上下游数据的产品单位-自建因子 */
      const relatedProductUnitBack = ioData?.productUnit
        ? ioData?.productUnit?.split(',')
        : undefined;

      /** 上下游数据关联的单位-过程数据/模型引用 */
      const ioRelatedUnitBack = linkIo?.unit
        ? linkIo?.unit?.split(',')
        : undefined;

      /** 上下游数据的核算单位-供应商结果 */
      const supplyUnitBack = supplierRef?.productUnit
        ? supplierRef?.productUnit?.split(',')
        : undefined;

      /** 数据库数据的产品单位-数据库数据 */
      const databaseUnitBack = ioData?.productUnit
        ? ioData?.productUnit?.split(',')
        : undefined;

      const linkUnit = {
        [PROCESS_DATA]: ioRelatedUnitBack?.[1],
        [MODEL_REFERENCE]: ioRelatedUnitBack?.[1],
        [DATABASE_DATA]: databaseUnitBack?.[1],
        [SUPPLIER_DATA]: supplyUnitBack?.[1],
        [FACTOR_DATA]: relatedProductUnitBack?.[1],
      };

      /** 地理代表性不展示必填符号 */
      form.setFieldState('*(upOrDownstreamData.area)', state => {
        state.decoratorProps = {
          ...state.decoratorProps,
          asterisk: false,
        };
      });

      // 编辑
      if (!isDetail) {
        /** 编辑时自建因子可编辑 */
        if (linkType === FACTOR_DATA) {
          form.setFieldState(`*(${upOrDownstreamFactorPath})`, {
            disabled: false,
            required: true,
          });
          /** 地理代表性详情地址不必填 */
          form.setFieldState(`*(upOrDownstreamData.areaRepresentDetail)`, {
            disabled: false,
            required: false,
          });
          /** 地理代表性展示必填符号 */
          form.setFieldState('*(upOrDownstreamData.area)', state => {
            state.decoratorProps = {
              ...state.decoratorProps,
              asterisk: true,
            };
          });
        }
      }

      form.setValues({
        ...onHandleDetailData({
          showBaseLine,
          processManageDataSource,
          unitOptions,
          isDetail,
          dataCategoryOptions,
        }),
      });

      /** 数量单位 */
      setCountUnit(unitBack?.[1]);

      /** 上下游单位 */
      setProductUnit(
        linkType ? linkUnit[linkType as keyof typeof linkUnit] : undefined,
      );

      /** 单位换算比例 */
      setConvertRatio(convertRatioBack);

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

  /** 过程数据-选择的输入输出赋值-选择当前模型过程  可再生输出物的下游数据*/
  useEffect(() => {
    if (selectedIO) {
      const {
        processName,
        lifeCycle,
        ioName,
        dataValue,
        unit,
        ioCode,
        timeRepresentStart,
        timeRepresentEnd,
        areaRepresent,
        areaRepresentDetail,
        processDesc,
      } = selectedIO || {};
      setSelectedIOCode(ioCode);

      /** 上下游数据关联的单位-过程数据 */
      const ioRelatedUnitBack = unit ? unit?.split(',') : undefined;
      setProductUnit(ioRelatedUnitBack?.[1]);

      form.setValues({
        // 上下游数据
        upOrDownstreamData: {
          relatedProcessName: processName,
          lifeCycle,
          timeRepresentStart: timeRepresentStart || undefined,
          timeRepresentEnd: timeRepresentEnd || undefined,
          areaRepresent: areaRepresent || undefined,
          areaRepresentDetail,
          processDesc,
        },
        // 上下游关联输入输出
        upOrDownAssociates: {
          renewableProcessName: processName,
          relatedInputName: ioName,
          relatedInputNum: dataValue,
          relatedInputUnit: ioRelatedUnitBack,
          convertRatioIsEnabled: true,
        },
      });

      /** 自动填充输入/输出名称及单位 */
      autoFillIOFn(selectedIO);

      /** 监听表单变化 */
      onAddFormListenerFn();
    }
  }, [selectedIO]);

  /** 选择引用模型赋值 */
  useEffect(() => {
    if (selectedModel) {
      const {
        modelName,
        modelCode,
        funcUnit,
        orgName,
        startTime,
        endTime,
        productName,
        productCode,
        supplierName,
      } = selectedModel || {};

      form.setValues({
        // 上下游数据
        upOrDownModel: {
          modelName,
          modelCode,
          modelFuncUnit: funcUnit,
          modelOrgId: orgName,
          modelProductCycle:
            startTime && endTime ? `${startTime}~${endTime}` : '-',
          modelProductName: productName,
          modelProductCode: productCode,
          modelSupplierName: supplierName,
        },
      });

      /** 监听表单变化 */
      onAddFormListenerFn();
    }
  }, [selectedModel]);

  /** 选择引用模型-选择关联输入输出 */
  useEffect(() => {
    if (selectedModelIO) {
      const { ioName, dataValue, unit, ioCode } = selectedModelIO || {};
      setSelectedIOCode(ioCode);
      // 上下游关联的数值单位
      const ioRelatedUnitBack = unit ? unit?.split(',') : undefined;
      setProductUnit(ioRelatedUnitBack?.[1]);
      form.setValues({
        // 上下游关联
        upOrDownAssociates: {
          relatedInputName: ioName,
          relatedInputNum: dataValue,
          relatedInputUnit: ioRelatedUnitBack,
          convertRatioIsEnabled: true,
        },
      });

      /** 自动填充输入/输出名称及单位 */
      autoFillIOFn(selectedModelIO);

      /** 监听表单变化 */
      onAddFormListenerFn();
    }
  }, [selectedModelIO]);

  /** 选择的引用供应商赋值 */
  useEffect(() => {
    if (selectedSupply) {
      const {
        dataCode,
        supplierName,
        productName,
        productUnit: supplyUnit,
        assessmentMethodName,
        resultList,
      } = selectedSupply || {};

      /** 核算单位 */
      const ioRelatedUnitBack = supplyUnit ? supplyUnit?.split(',') : undefined;
      setProductUnit(ioRelatedUnitBack?.[1]);

      /** 处理评价指标表格数据值为科学记数法 */
      const newResultList = resultList?.map(list => ({
        ...list,
        dataValue: formatScientific(list?.dataValue),
      }));

      form.setValues({
        upOrDownSupplier: {
          supplyCode: dataCode,
          supplyName: supplierName,
          supplyProductName: productName,
          supplyUnit: ioRelatedUnitBack,
          supplyMethod: assessmentMethodName,
          supplyAssessmentList: newResultList,
          convertRatioIsEnabled: true,
        },
      });

      /** 监听表单变化 */
      onAddFormListenerFn();
    }
  }, [selectedSupply]);

  /** 选择的数据库数据赋值 */
  useEffect(() => {
    if (selectedDatabase) {
      const {
        factorName,
        productName,
        dbName,
        year,
        productUnit: dbUnit,
        areaRepresentDetail,
      } = selectedDatabase || {};

      /** 核算单位 */
      const ioRelatedUnitBack = dbUnit ? dbUnit?.split(',') : undefined;
      setProductUnit(ioRelatedUnitBack?.[1]);

      /** 地理代表性 */
      const areaRepresent = `${selectedDatabase?.areaRepresent || ''}${
        areaRepresentDetail ? `-${areaRepresentDetail}` : ''
      }`;

      form.setValues({
        databaseData: {
          databaseActivityName: factorName,
          databaseProductName: productName,
          databaseYear: year,
          databaseName: dbName,
          areaRepresent,
          databaseProductUnit: ioRelatedUnitBack,
          convertRatioIsEnabled: !!selectedDatabase?.id,
        },
      });

      /** 监听表单变化 */
      onAddFormListenerFn();
    }
  }, [selectedDatabase]);

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

    /** 因子数据-产品碳足迹-单位 */
    if (productCarbonFootPrintUnitOptions) {
      form.setFieldState('*(upOrDownstreamData.factorUnitZ)', {
        dataSource: productCarbonFootPrintUnitOptions?.map(v => ({
          ...v,
          label: v.dictLabel,
          value: v.dictValue,
        })),
      });
    }

    /** 时间代表性 */
    form.setFieldState('upOrDownstreamData.timeRepresent', {
      dataSource: publishYear().map(v => ({ label: v, value: v })),
    });

    /** 地理代表性 */
    if (areaRepresentOptions) {
      form.setFieldState('upOrDownstreamData.areaRepresent', {
        dataSource: areaRepresentOptions.map(item => ({
          label: item.dictLabel,
          value: item.dictValue,
        })),
      });
    }

    /** 评价方法 */
    if (assessmentMethodOptions) {
      form.setFieldState(
        `*(upOrDownstreamData.assessmentList.*.assessmentMethod)`,
        {
          dataSource: handleAssessmentProposalOptions(assessmentMethodOptions),
        },
      );
    }

    /** 数据库数据 */
    if (dataCategoryOptions) {
      form.setFieldState('upOrDownDatabase.lcaFactorCategory', {
        dataSource: dataCategoryOptions,
      });
    }
  }, [
    unitOptions,
    productCarbonFootPrintUnitOptions,
    areaRepresentOptions,
    actionBtnType,
    lifeCycleList,
    assessmentMethodOptions,
    dataCategoryOptions,
  ]);

  const onDrawerInit = () => {
    form.reset();
  };

  /** 选择的数据 linkType处理 */
  const onHandleSelectedInfo = ({
    linkType,
    submitConvertRatio,
  }: {
    linkType?: number;
    submitConvertRatio?: number | string;
  }) => {
    const selectedData = {
      /** 选择的输入输出编码 */
      selectIoCode: selectedIOCode || undefined,
      /** 选择的过程库id（过程库新增时必传） */
      selectLibId: selectedProcess?.id,
      /** 选择的模型id（模型引用新增时必传） */
      selectModelId: selectedModel?.id,
      /** 选择的LCA因子id（数据库数据时必传） */
      selectLcaFactorId: selectedDatabase?.id,
      /** 选择的供应商数据id（引用供应商结果数据时必传） */
      selectApplyInfoId: selectedSupply?.id,
    };

    /** 如果单位换算比例没有值 那么代表没有填/选上下游数据 则linkType置为空*/
    if (!submitConvertRatio) {
      return {
        linkType: undefined,
      };
    }

    return {
      ...selectedData,
      /** 上下游链接类型 */
      linkType,
    };
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

              /** 选择的数据 linkType处理 */
              const selectedInfo = onHandleSelectedInfo({
                linkType: formInfo?.linkType,
                submitConvertRatio: formInfo?.convertRatio,
              });

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
                ...selectedInfo,
                languageSourceList,
                multiMainIoCode,
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
        <SchemaField
          schema={schema({
            categoryType,
            showLifeStageSelectRadio,
            isChild,
            isAddConnect,
          })}
        />
        <div className={style.upOrDownstreamDataWrap}>
          <FormConsumer>
            {currentForm => {
              /** 上下游数据的选择按钮的类型 */
              const linkType = currentForm.getValuesIn('linkType');

              /** 上下游数据选择按钮为因子数据时 名称为数据名称 */
              form.setFieldState('upOrDownstreamData.relatedProcessName', {
                title:
                  linkType === FACTOR_DATA
                    ? I18N.carbonFootPrintLCA.dataName
                    : I18N.carbonFootPrintLCA.processName,
              });

              /** 输入输出名称 */
              // const ioName = currentForm.getValuesIn('ioName');

              const upOrDownTitle = isInput
                ? I18N.carbonFootPrintLCA.upstreamData
                : I18N.carbonFootPrintLCA.downstreamData;

              let upOrDownRightRender = null;

              switch (linkType) {
                /** 过程数据 */
                case PROCESS_DATA:
                  upOrDownRightRender = (
                    <Space>
                      <Button
                        type='primary'
                        onClick={() => {
                          onChooseModalProcessClick?.();
                        }}
                      >
                        {I18N.carbonFootPrintLCA.selectTheCurrentMode}
                      </Button>
                      <Button
                        type='primary'
                        onClick={() => {
                          onChooseProcessClick?.();
                        }}
                      >
                        {I18N.carbonFootPrintLCA.selectProcessLibrary}
                      </Button>
                    </Space>
                  );
                  break;
                /** 模型引用 */
                case MODEL_REFERENCE:
                  upOrDownRightRender = (
                    <Button
                      type='primary'
                      onClick={() => {
                        onChooseModelClick?.();
                      }}
                    >
                      {I18N.carbonFootPrintLCA.selectModel}
                    </Button>
                  );
                  break;
                /** 引用供应商结果数据 */
                case SUPPLIER_DATA:
                  upOrDownRightRender = (
                    <Button
                      type='primary'
                      onClick={() => {
                        onChooseSupplierClick?.();
                      }}
                    >
                      {I18N.carbonFootPrintLCA.selectSupplier}
                    </Button>
                  );
                  break;
                default:
                  upOrDownRightRender = null;
              }

              /** 类型 */
              const ioType = currentForm.getValuesIn('dataType');

              /** 可再生输出物时展示-选择输入（过程数据-选择当前模型过程） */
              if (ioType === RENEWABLE_OUTPUTS) {
                upOrDownRightRender = (
                  <Button
                    type='primary'
                    onClick={() => {
                      onChooseModalProcessClick?.();
                    }}
                  >
                    {I18N.carbonFootPrintLCA.selectInput}
                  </Button>
                );
              }

              /** 查看详情时不展示选择按钮 */
              if (isDetail) {
                upOrDownRightRender = null;
              }

              return (
                <TitleHeader
                  title={upOrDownTitle}
                  rightRender={upOrDownRightRender}
                />
              );
            }}
          </FormConsumer>
          <SchemaField
            schema={upOrDownstreamDataSchemas({ categoryType })}
            scope={{
              matchTargetOptionFn,
              getLinkTypeEnum,
            }}
          />
        </div>
        <div className={style.upOrDownAssociatesOutOrInWrap}>
          <FormConsumer>
            {currentForm => {
              /** 上下游数据的选择按钮的类型 */
              const linkType = currentForm.getValuesIn('linkType');

              const isEnabled = currentForm.getValuesIn(
                'upOrDownAssociates.convertRatioIsEnabled',
              );

              if (
                !includes([PROCESS_DATA, MODEL_REFERENCE], linkType) ||
                isDetail
              ) {
                return '';
              }

              /** 标题 */
              const associatesTitle = isInput
                ? I18N.carbonFootPrintLCA.upstreamRelatedTransmission
                : I18N.carbonFootPrintLCA.downstreamRelatedTransmission;

              /** 右侧按钮 */
              let associatesRightRender = null;

              if (linkType === MODEL_REFERENCE) {
                associatesRightRender = (
                  <Button
                    type='primary'
                    disabled={!isEnabled}
                    onClick={() => {
                      onChooseModelIOClick?.();
                    }}
                  >
                    {I18N.carbonFootPrintLCA.selectUpstreamTransmission}
                  </Button>
                );
              }

              return (
                <TitleHeader
                  title={associatesTitle}
                  rightRender={associatesRightRender}
                />
              );
            }}
          </FormConsumer>
          <SchemaField
            schema={upOrDownAssociatesOutOrInSchemas({ categoryType })}
          />
        </div>
        <div className={style.databaseWrap}>
          <FormConsumer>
            {currentForm => {
              /** 上下游数据的选择按钮的类型 */
              const linkType = currentForm.getValuesIn('linkType');

              if (!includes([DATABASE_DATA], linkType) || isDetail) {
                return '';
              }

              /** 数据分类 */
              const lcaFactorCategory = currentForm.getValuesIn(
                'upOrDownDatabase.lcaFactorCategory',
              );

              /** 具体材质 */
              const lcaMaterial = currentForm.getValuesIn(
                'upOrDownDatabase.lcaMaterial',
              );

              /** 输入输出名称 */
              // const ioName = currentForm.getValuesIn('ioName');

              return (
                <div className={style.btnWrapper}>
                  <TitleHeader
                    title={I18N.carbonFootPrintLCA.databaseData}
                    rightRender={
                      <Space>
                        <Button
                          loading={matchLoading}
                          type='primary'
                          onClick={() => {
                            setIsMatchedError(false);
                            if (!lcaFactorCategory && !lcaMaterial) {
                              Toast(
                                'warn',
                                I18N.carbonFootPrintLCA
                                  .pleaseFillInTheSpecificInformation,
                              );
                              return;
                            }
                            setMatchLoading(true);
                            onClickDataMatch?.(
                              {
                                lcaFactorCategory: lcaFactorCategory
                                  ? String(lcaFactorCategory)
                                  : undefined,
                                lcaMaterial,
                              },
                              result => {
                                if (result) {
                                  /** 有值则取消错误提醒 */
                                  setIsMatchedError(false);
                                } else {
                                  /** 无值则展示错误提醒 */
                                  setIsMatchedError(true);
                                  /** 文案 */
                                  const tip = lcaMaterial
                                    ? I18N.carbonFootPrintLCA.noMatchFound2
                                    : I18N.carbonFootPrintLCA.noMatchFound;
                                  setMatchedErrorTip(tip);
                                }
                                setMatchLoading(false);
                              },
                              () => {
                                setIsMatchedError(true);
                                setMatchLoading(false);
                              },
                            );
                          }}
                        >
                          {I18N.carbonFootPrintLCA.dataMatching}
                        </Button>
                        {hasFactorAuth && (
                          <Button
                            type='primary'
                            onClick={() => {
                              setIsMatchedError(false);
                              onChooseDatabaseClick?.();
                            }}
                          >
                            {I18N.carbonFootPrintLCA.manualSelectionOfNumbers}
                          </Button>
                        )}
                      </Space>
                    }
                  />
                  {isMatchedError && (
                    <span className='warnRed'>{matchedErrorTip}</span>
                  )}
                </div>
              );
            }}
          </FormConsumer>
          <SchemaField schema={databaseSchemas()} />
        </div>
        <div>
          <TitleHeader title={I18N.carbonFootPrintLCA.supportingMaterials} />
          <SchemaField schema={fileSchema()} />
        </div>
      </Form>
    </Drawer>
  );
};
export default ProcessManageDrawer;
