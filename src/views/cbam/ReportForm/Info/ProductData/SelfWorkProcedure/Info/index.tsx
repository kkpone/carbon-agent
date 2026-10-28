/**
 * @description 工序（过程）详情抽屉
 */
import {
  ArrayTable,
  Form,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  NumberPicker,
  PreviewText,
  Select,
} from '@formily/antd-v5';
import { createForm, onFieldValueChange } from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button, Drawer } from 'antd';
import { compact, get, has, isArray, isNil, omit, sum } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

import { UploadFile } from '@/api/type';
import { IconFont } from '@/components/LcaIconFont';
import { InfoTitle } from '@/components/InfoTitle';
import { FormilyFileUpload } from '@/components/formily/FormilyFileUpload';
import { PageTypeInfo } from '@/router/utils/enums';
import { omitInfoFn, Toast } from '@/utils/index';
import { getParameterDetail } from '@/views/cbam/ParameterConfig/service';
import {
  getProductDataProcessDetail,
  postProductDataProcessEdit,
} from '@/views/cbam/ReportForm/service';
import {
  EleCalculator,
  ProductAttribution,
  ProductProcessResp,
} from '@/views/cbam/ReportForm/type';

import { FormilyProcedureEmissionTable } from './components/ProcedureEmissionTable';
import {
  initEleCalculatorList,
  initProductAttributionList,
} from './components/ProcedureEmissionTable/until';
import { EL_SOURCE_ENUM, ELEMENT_ENUM, EXISTS_ENUM } from './constant';
import style from './index.module.less';
import { schema } from './schemas';
import { DEFAULT_ENUM } from '../../constant';

const { DIRECT_EMISSION, EL_USAGE, POWER_OUTPUT } = ELEMENT_ENUM;

const { EXISTS } = EXISTS_ENUM;

const { YES, NOT } = DEFAULT_ENUM;

const { add, edit, show } = PageTypeInfo;

const SchemaField = createSchemaField({
  components: {
    Form,
    FormItem,
    FormGrid,
    FormLayout,
    Input,
    Select,
    NumberPicker,
    InfoTitle,
    FormilyFileUpload,
    PreviewText,
    ArrayTable,
    FormilyProcedureEmissionTable,
  },
});
interface ProcessInfoProps {
  /** 抽屉的显隐 */
  open: boolean;
  /** 列表操作按钮的类型 */
  actionBtnType?: string;
  /** 过程ID */
  processId?: number;
  /** 报表ID */
  cbamId?: number;
  /** 保存方法 */
  onOk: () => void;
  /** 取消方法 */
  onClose: () => void;
}
export const ProcessInfo = ({
  open,
  actionBtnType,
  processId,
  cbamId,
  onOk,
  onClose,
}: ProcessInfoProps) => {
  const isAdd = actionBtnType === add;
  const isDetail = actionBtnType === show;

  /** 抽屉标题 */
  const titleMap = {
    [add]: I18N.cbam.addInHouseWorkers,
    [edit]: I18N.cbam.configureInHouseWorkers,
    [show]: I18N.cbam.selfProducedProcessProduction,
  };
  const title = titleMap[actionBtnType as keyof typeof titleMap];

  const form = useMemo(
    () =>
      createForm({
        readPretty: isDetail,
        effects: productForm => {
          onFieldValueChange('processListIsDefault.*.emission', () => {
            const list = productForm?.getValuesIn('processListIsDefault') || [];
            const totalEmissionList = compact(
              list?.map((item: { emission: number }) => item.emission),
            );
            /** 总生产量 */
            const totalEmission = sum(totalEmissionList);
            productForm.setValuesIn('totalVolume', totalEmission);
          });
        },
      }),
    [actionBtnType],
  );

  /** 保存按钮的loading */
  const [btnLoading, setBtnLoading] = useState(false);

  /** 关闭弹窗初始化 */
  const onCloseInit = () => {
    form.reset();
    onClose();
  };

  /** 查询电力使用的是否存在 */
  const getElIsExists = (productCategoryId?: number) => {
    let isExists = EXISTS;
    if (productCategoryId) {
      getParameterDetail({
        id: productCategoryId,
      }).then(({ data }) => {
        isExists = data?.data?.isExists || 0;
      });
    }
    return isExists;
  };

  useEffect(() => {
    /** 获取详情 */
    if (!isAdd && processId) {
      getProductDataProcessDetail({ id: processId }).then(({ data }) => {
        const result = data?.data || {};
        const {
          supportFile,
          directEmission,
          productCategoryId,
          eleCalculatorList,
        } = result || {};

        /** 电力使用是否存在 */
        const elisExists = getElIsExists(productCategoryId);

        /** 证据材料 */
        let supportMaterialsFileList = [];
        if (supportFile && typeof supportFile === 'string') {
          try {
            const parsedFileData = JSON.parse(supportFile) || [];
            supportMaterialsFileList = parsedFileData?.map(
              (file: UploadFile) => {
                const { fileName, fileId, fileUrl } = file || {};
                return {
                  ...file,
                  name: fileName,
                  uid: fileId,
                  url: fileUrl,
                };
              },
            );
          } catch (error) {
            // 防止脏数据导致页面空白
          }
        } else {
          supportMaterialsFileList = [];
        }

        /** 工厂生产量 */
        const handleProcessListIsDefault = result?.processList?.filter(
          item => item.isDefault === YES,
        );

        /** 工厂其他生产工序消耗量 */
        const handleProcessListNotDefault = result?.processList?.filter(
          item => item.isDefault === NOT,
        );

        /** 赋值直接排放量和电力使用是否存在 */
        const handleEmissionAndEL = (dataSource: ProductAttribution[]) =>
          dataSource?.map(item => {
            if (item.emissionElement === DIRECT_EMISSION) {
              return {
                ...item,
                outPower: directEmission,
              };
            }
            if (item.emissionElement === EL_USAGE) {
              return {
                ...item,
                isExists: elisExists,
                eleChoose: item.eleChoose || EL_SOURCE_ENUM?.EXISTS,
              };
            }
            return item;
          });

        /** 处理之后的排放数据 */
        const handleProductAttributionList =
          isArray(result?.productAttributionList) &&
          result?.productAttributionList?.length
            ? handleEmissionAndEL(result?.productAttributionList)
            : handleEmissionAndEL(initProductAttributionList(cbamId));

        /** 处理电力计算器配置数据 */
        const handleEleCalculatorList =
          isArray(eleCalculatorList) && eleCalculatorList?.length
            ? eleCalculatorList
            : initEleCalculatorList(cbamId, processId);

        form.setValues({
          ...result,
          unit: result?.unit || I18N.Factors.unit,
          processListIsDefault: handleProcessListIsDefault,
          processListNotDefault: handleProcessListNotDefault,
          productAttributionList: handleProductAttributionList,
          supportFile: supportMaterialsFileList,
          eleCalculatorList: handleEleCalculatorList,
          productProcessId: processId,
        });
      });
    }
  }, [isAdd, processId]);

  /** 检查是否为空 */
  const checkFieldFn = ({
    item,
    filedName,
  }: {
    item: ProductAttribution;
    filedName: string;
  }) => {
    // 检查 item 是否没有指定的字段
    const fieldMissing = !has(item, filedName);
    // 检查该字段是否存在且为空（nil 或空字符串）
    const fieldIsEmpty =
      has(item, filedName) &&
      (isNil(get(item, filedName)) || get(item, filedName) === '');

    return fieldMissing || fieldIsEmpty;
  };

  /** 校验排放数据 不通过返回true，需要toast提示 */
  const onValidationEmission = (
    productAttributionList: ProductAttribution[],
    eleCalculatorList: EleCalculator[],
  ) => {
    /** 校验不通过，需要校验文案提示 */
    let isValid = true;

    isValid = productAttributionList?.some(item => {
      // 直接排放量行 不需要校验
      if (item.emissionElement === DIRECT_EMISSION) return false;
      // 其它行 是否存在选择是，需要校验
      if (item.isExists === EXISTS_ENUM.EXISTS) {
        // 电力使用行
        if (item.emissionElement === EL_USAGE) {
          // 单一电力来源
          if (item.eleChoose === EL_SOURCE_ENUM?.EXISTS) {
            return (
              checkFieldFn({ item, filedName: 'inputPower' }) ||
              checkFieldFn({ item, filedName: 'inputFactor' }) ||
              checkFieldFn({ item, filedName: 'eleSource' })
            );
          }
          // 多个电力来源-校验电力来源1
          if (item.eleChoose === EL_SOURCE_ENUM?.NOT_EXISTS) {
            const eleSource1 = eleCalculatorList?.[0];
            return (
              checkFieldFn({ item: eleSource1, filedName: 'eleValue' }) ||
              checkFieldFn({ item: eleSource1, filedName: 'coefficient' })
            );
          }
        }
        // 电力输出行
        if (item.emissionElement === POWER_OUTPUT) {
          return (
            checkFieldFn({ item, filedName: 'outPower' }) ||
            checkFieldFn({ item, filedName: 'outFactor' })
          );
        }
        return (
          checkFieldFn({ item, filedName: 'inputPower' }) ||
          checkFieldFn({ item, filedName: 'inputFactor' }) ||
          checkFieldFn({ item, filedName: 'outPower' }) ||
          checkFieldFn({ item, filedName: 'outFactor' })
        );
      }
      // 选择否 则不需要校验
      return false;
    });

    return isValid;
  };

  return (
    <Drawer
      className={style.wrapper}
      title={title}
      open={open}
      closeIcon={false}
      maskClosable={false}
      destroyOnClose
      placement='right'
      size='large'
      extra={
        <div className={style.closeIcon} onClick={() => onCloseInit()}>
          <IconFont icon='icon-icon-guanbi' />
        </div>
      }
      onClose={() => onCloseInit()}
      footer={[
        <Button onClick={() => onCloseInit()}>
          {isDetail ? I18N.carbonFootPrintLCA.close : I18N.Factors.cancel}
        </Button>,
        !isDetail && (
          <Button
            type='primary'
            loading={btnLoading}
            onClick={async () => {
              const values = await form.submit<ProductProcessResp>();
              const {
                supportFile,
                processListIsDefault = [],
                processListNotDefault = [],
                productAttributionList = [],
                eleCalculatorList = [],
              } = values || {};

              /** 校验排放数据 */
              const emissionValidation = onValidationEmission(
                productAttributionList,
                eleCalculatorList,
              );
              if (emissionValidation) {
                Toast('error', I18N.cbam.pleaseImproveEmissions);
                return;
              }
              /** 支撑材料的处理 */
              const supportMaterialsList =
                supportFile?.map((file: any) => {
                  const { name: fileName, uid, url } = file || {};
                  return omit(
                    {
                      ...file,
                      fileId: uid,
                      fileName,
                      fileUrl: url,
                    },
                    ['name', 'uid', 'url'],
                  );
                }) || [];
              /** 支撑材料 */
              const supportFiles = supportMaterialsList?.length
                ? JSON.stringify(supportMaterialsList)
                : undefined;

              const processList = [
                ...processListIsDefault,
                ...processListNotDefault,
              ];

              /** 处理后的排放数据 */
              const newProductAttributionList = productAttributionList?.map(
                item => {
                  /** 如果不存在则清空数据 */
                  if (item.isExists === EXISTS_ENUM.NOT_EXISTS) {
                    return {
                      ...item,
                      inputPower: null,
                      inputFactor: null,
                      outPower: null,
                      outFactor: null,
                      eleChoose: null,
                      eleSource: null,
                    };
                  }
                  return item;
                },
              );

              const result = omitInfoFn({
                ...values,
                cbamId,
                processList,
                productAttributionList: newProductAttributionList,
                supportFile: supportFiles,
              });

              try {
                setBtnLoading(true);
                await postProductDataProcessEdit(result);
                Toast('success', I18N.Factors.saveSuccessful);
                setBtnLoading(false);
                form.reset();
                onOk();
              } catch (e) {
                // 数据填写错误提示
                form.setFieldState('errorTips', {
                  hidden: false,
                });

                setBtnLoading(false);
                throw e;
              }
            }}
          >
            {I18N.Factors.preserve}
          </Button>
        ),
      ]}
    >
      <Form form={form} previewTextPlaceholder='-'>
        <SchemaField
          schema={schema()}
          scope={{
            textMap: {
              nonCWithinTheFactory: I18N.cbam.nonCWithinTheFactory2,
              externalSalesVolume: I18N.cbam.externalSalesVolume2,
              totalProductionVolume: I18N.cbam.totalProductionVolume,
            },
          }}
        />
      </Form>
    </Drawer>
  );
};
