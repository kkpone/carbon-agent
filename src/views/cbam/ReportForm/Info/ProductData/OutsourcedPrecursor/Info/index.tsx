/**
 * @description 前驱体详情抽屉
 */
import {
  ArrayTable,
  Form,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  NumberPicker,
  Select,
  PreviewText,
  Radio,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button, Drawer } from 'antd';
import { isArray, omit } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

import { UploadFile } from '@/api/type';
import { IconFont } from '@/components/LcaIconFont';
import { InfoTitle } from '@/components/InfoTitle';
import { FormilyFileUpload } from '@/components/formily/FormilyFileUpload';
import { PageTypeInfo } from '@/router/utils/enums';
import { omitInfoFn, Toast } from '@/utils/index';
import {
  getProductOutsourcedPrecursorDetail,
  postProductOutsourcedPrecursorEdit,
} from '@/views/cbam/ReportForm/service';
import {
  PrecursorResp,
  ProductAttribution,
} from '@/views/cbam/ReportForm/type';

import { FormilyPrecursorEmissionTable } from './components/PrecursorEmissionTable';
import { FACTORY_LEVEL_ENUM, SOURCE_ENUM, USE_DEFAULT_ENUM } from './constant';
import style from './index.module.less';
import { schema } from './schemas';
import { FILL_WAY_ENUM } from '../../../constant';
import { DEFAULT_ENUM } from '../../constant';

const { YES, NOT } = DEFAULT_ENUM;

const { NOT_USE, USE_DEFAULT } = USE_DEFAULT_ENUM;

const { DEFAULT } = SOURCE_ENUM;

const { SUPPLY_FILL } = FILL_WAY_ENUM;

const {
  IMPLIED_EMISSION_DIRECT,
  EL_USAGE,
  EL_EMISSION_COEFFICIENT,
  IMPLIED_EMISSION_INDIRECT,
  REASON_USE_DEFAULT,
} = FACTORY_LEVEL_ENUM;

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
    ArrayTable,
    PreviewText,
    InfoTitle,
    FormilyFileUpload,
    Radio,
    FormilyPrecursorEmissionTable,
  },
});
interface PrecursorInfoProps {
  /** 抽屉的显隐 */
  open: boolean;
  /** 列表操作按钮的类型 */
  actionBtnType?: string;
  /** 前驱体ID */
  precursorId?: number;
  /** 报表ID */
  cbamId?: number;
  /** 保存方法 */
  onOk: () => void;
  /** 取消方法 */
  onClose: () => void;
}
export const PrecursorInfo = ({
  open,
  actionBtnType,
  precursorId,
  cbamId,
  onOk,
  onClose,
}: PrecursorInfoProps) => {
  const isDetail = actionBtnType === show;

  /** 抽屉标题 */
  const titleMap = {
    [add]: I18N.cbam.beforeAddingExternalPurchases,
    [edit]: I18N.cbam.beforeConfiguringExternalPurchases,
    [show]: I18N.cbam.numberOfPurchasedPrecursors,
  };
  const title = titleMap[actionBtnType as keyof typeof titleMap];

  const form = useMemo(
    () =>
      createForm({
        readPretty: isDetail,
      }),
    [actionBtnType, open],
  );

  /** 保存按钮的loading */
  const [btnLoading, setBtnLoading] = useState(false);

  /** 关闭弹窗初始化 */
  const onCloseInit = () => {
    form.reset();
    onClose();
  };

  /** 初始dataSource */
  const initProductAttributionList = [
    {
      emissionElement: IMPLIED_EMISSION_DIRECT,
      cbamId,
      isProcess: NOT,
    },
    {
      emissionElement: EL_USAGE,
      cbamId,
      isProcess: NOT,
    },
    {
      emissionElement: EL_EMISSION_COEFFICIENT,
      cbamId,
      isProcess: NOT,
    },
    {
      emissionElement: IMPLIED_EMISSION_INDIRECT,
      cbamId,
      isProcess: NOT,
    },
    {
      emissionElement: REASON_USE_DEFAULT,
      cbamId,
      isProcess: NOT,
    },
  ];

  /** 获取详情 */
  useEffect(() => {
    if (!open) return;

    if (precursorId) {
      getProductOutsourcedPrecursorDetail({ id: precursorId }).then(
        ({ data }) => {
          const result = data?.data || {};
          const { supportFile, isDefault } = result;

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

          /** 不同生产路线的消耗量 */
          const handleProcessListIsDefault = result?.processList?.filter(
            item => item.isDefault === YES,
          );

          /** 在生产工序中的消耗量 */
          const handleProcessListNotDefault = result?.processList?.filter(
            item => item.isDefault === NOT,
          );

          /** 处理之后的排放数据 */
          const handleProductAttributionList =
            isArray(result?.productAttributionList) &&
            result?.productAttributionList?.length
              ? result?.productAttributionList?.map(item => {
                  switch (item.emissionElement) {
                    case IMPLIED_EMISSION_DIRECT:
                      return {
                        ...item,
                        emission: item.outPower,
                      };
                    case EL_USAGE:
                      return {
                        ...item,
                        emission: item.inputFactor,
                      };
                    case EL_EMISSION_COEFFICIENT:
                      return {
                        ...item,
                        emission: item.outFactor,
                        emissionSource: item.eleSource,
                      };
                    case IMPLIED_EMISSION_INDIRECT:
                      return {
                        ...item,
                        emission: item.inputPower,
                      };
                    // 使用默认值的原因
                    default:
                      return {
                        ...item,
                        emissionElement: REASON_USE_DEFAULT,
                        emissionElement_name: I18N.cbam.useDefaultValues3,
                        emissionSource: result?.defaultReason,
                      };
                  }
                })
              : initProductAttributionList;

          /** 处理isDefault默认不使用 */
          const handleIsDefault =
            isDefault === USE_DEFAULT ? USE_DEFAULT : NOT_USE;

          form.setValues({
            ...result,
            isDefault: handleIsDefault,
            unit: result?.unit || I18N.Factors.unit,
            processListIsDefault: handleProcessListIsDefault,
            processListNotDefault: handleProcessListNotDefault,
            productAttributionList: handleProductAttributionList,
            supportFile: supportMaterialsFileList,
          });
        },
      );
    }
  }, [precursorId, open]);

  /** 校验排放数据 不通过返回true，需要toast提示 */
  const onValidationEmission = (
    productAttributionList: ProductAttribution[],
    isDefault: number,
  ) => {
    /** 校验不通过，需要校验文案提示 */
    let isValid = true;

    /** 检查默认值原因 通过返回true */
    const checkDefaultReason = () => {
      // 隐含排放（间接）的来源
      const directEmissionSource = productAttributionList?.filter(
        item => item.emissionElement === IMPLIED_EMISSION_DIRECT,
      )?.[0]?.emissionSource;
      // 电力使用的来源
      const elUsageSource = productAttributionList?.filter(
        item => item.emissionElement === EL_USAGE,
      )?.[0]?.emissionSource;
      // 使用默认值的原因的来源
      const defaultReasonSource = productAttributionList?.filter(
        item => item.emissionElement === REASON_USE_DEFAULT,
      )?.[0]?.emissionSource;

      if (directEmissionSource === DEFAULT || elUsageSource === DEFAULT) {
        return !!defaultReasonSource;
      }
      return true;
    };

    if (isDefault === NOT_USE) {
      // 不使用默认值计算
      isValid = productAttributionList?.some(item => {
        if (item.emissionElement === IMPLIED_EMISSION_INDIRECT) return false;
        // 使用默认值的原因 若电力使用或隐含排放（直接）中任意来源均未选择为默认值，则置灰不可编辑
        if (item.emissionElement === REASON_USE_DEFAULT) {
          return !checkDefaultReason();
        }
        return isNaN(item.emission) || !item.emissionSource;
      });
    } else {
      // 使用默认值计算
      isValid = productAttributionList?.some(item => {
        if (item.emissionElement === IMPLIED_EMISSION_DIRECT) {
          return !item.emissionSource || !item.cnCode || !item.defaultCnId;
        }
        if (item.emissionElement === IMPLIED_EMISSION_INDIRECT) return false;
        // 使用默认值的原因 若电力使用或隐含排放（直接）中任意来源均未选择为默认值，则置灰不可编辑
        if (item.emissionElement === REASON_USE_DEFAULT) {
          return !checkDefaultReason();
        }
        return isNaN(item.emission) || !item.emissionSource;
      });
    }

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
              const values = await form.submit<PrecursorResp>();
              const {
                isDefault,
                supportFile,
                processListIsDefault = [],
                processListNotDefault = [],
                productAttributionList = [],
                defaultReason,
                manual,
              } = values || {};

              /** 校验排放数据 */
              const emissionValidation = onValidationEmission(
                productAttributionList,
                isDefault,
              );
              if (emissionValidation && manual !== SUPPLY_FILL) {
                Toast('error', I18N.cbam.pleaseImproveThePrecursor);
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

              /** 使用默认值的原因 */
              let newDefaultReason = defaultReason;

              /** 处理后的排放数据 */
              const electricityUsage = productAttributionList?.find(
                item => item.emissionElement === EL_USAGE,
              )?.emission;
              const electricityEmissionCoefficient =
                productAttributionList?.find(
                  item => item.emissionElement === EL_EMISSION_COEFFICIENT,
                )?.emission;
              const calculatedIndirectEmission =
                typeof electricityUsage === 'number' &&
                typeof electricityEmissionCoefficient === 'number'
                  ? electricityUsage * electricityEmissionCoefficient
                  : undefined;

              const newProductAttributionList = productAttributionList?.map(
                item => {
                  /** `_name` 是后端返回的展示字段，提交时应由枚举值重新解析，避免残留旧名称。 */
                  const itemWithoutSourceName = omit(item, [
                    'emissionSource_name',
                  ]);
                  switch (item.emissionElement) {
                    case IMPLIED_EMISSION_DIRECT:
                      return {
                        ...itemWithoutSourceName,
                        outPower: item.emission,
                      };
                    case EL_USAGE:
                      return {
                        ...itemWithoutSourceName,
                        inputFactor: item.emission,
                      };
                    case EL_EMISSION_COEFFICIENT:
                      return {
                        ...itemWithoutSourceName,
                        outFactor: item.emission,
                        eleSource: item.emissionSource,
                      };
                    case IMPLIED_EMISSION_INDIRECT: {
                      const inputPower =
                        calculatedIndirectEmission ?? item.emission;
                      return {
                        ...itemWithoutSourceName,
                        emission: inputPower,
                        inputPower,
                      };
                    }
                    case REASON_USE_DEFAULT:
                      newDefaultReason = item.emissionSource;
                      return {
                        ...itemWithoutSourceName,
                      };
                    default:
                      return itemWithoutSourceName;
                  }
                },
              );

              const result = omitInfoFn({
                ...values,
                cbamId,
                processList,
                productAttributionList: newProductAttributionList,
                defaultReason: newDefaultReason,
                supportFile: supportFiles,
              });

              try {
                setBtnLoading(true);
                await postProductOutsourcedPrecursorEdit(result);
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
          schema={schema(cbamId)}
          scope={{
            textMap: {
              factoryTitle: I18N.cbam.nonCWithinTheFactory2,
            },
          }}
        />
      </Form>
    </Drawer>
  );
};
