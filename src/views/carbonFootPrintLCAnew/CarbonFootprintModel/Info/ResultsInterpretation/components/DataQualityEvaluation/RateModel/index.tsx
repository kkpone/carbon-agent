/**
 * @description 数据质量评价-数据质量评级弹窗
 */
import {
  Form,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Radio,
  PreviewText,
  Select,
  DatePicker,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button, Modal } from 'antd';
import { map } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

import { useAllEnumsBatch } from '@/hooks';
import {
  getDataQualityRate,
  getDataQualityRateDetail,
} from '@/views/carbonFootPrintLCAnew/CarbonFootprintModel/service';
import { AssessmentDataQualityResp } from '@/views/carbonFootPrintLCAnew/CarbonFootprintModel/type';
import { SELECT_BUTTON_TYPE } from '@/views/carbonFootPrintLCAnew/components/ProcessManageDrawer/constant';

import style from './index.module.less';
import { schema } from './schemas';
import {
  DATA_QUALITY_CLASS,
  EU_BATTERY_LAW_STANDARDS,
  EU_PEF_LAW_STANDARDS,
  RATE_TYPE,
  RATE_TYPE_LABEL,
  RATE_TYPE_SCHEMAS_VALUE,
  STANDARDS_TYPE,
} from '../constant';

const { EU_BATTERY_LAW, EU_PEF } = STANDARDS_TYPE;
const { TIME, AREA, TECH, DATA } = RATE_TYPE;
const { INPUT_OUTPUT } = DATA_QUALITY_CLASS;

const SchemaField = createSchemaField({
  components: {
    Input,
    Radio,
    Select,
    PreviewText,
    DatePicker,
    Form,
    FormItem,
    FormGrid,
    FormLayout,
  },
});

interface RateModelProps {
  /** 方案id */
  assessmentId?: number;
  /** 评价指标 */
  assessmentTarget?: string;
  /** 数据质量类别。1 欧盟电池法；2 欧盟PEF */
  dataQualityCategory: number;
  /** 数据质量评价数据  */
  dataQualityEvaluationData?: AssessmentDataQualityResp;
  /** 控制弹窗显隐 */
  open: boolean;
  /** 评级类型 */
  rateType?: number;
  /** 点击确定按钮的方法 */
  handleOk: () => void;
  /** 点击取消按钮的方法 */
  handleCancel: () => void;
}
export const RateModel = ({
  assessmentId,
  assessmentTarget,
  dataQualityCategory,
  dataQualityEvaluationData,
  open,
  rateType,
  handleOk,
  handleCancel,
}: RateModelProps) => {
  /** 地理代表性枚举 */
  const areaRepresentOptions = useAllEnumsBatch('productOrigin')?.productOrigin;

  /** 弹窗标题 */
  const title = RATE_TYPE_LABEL[rateType as keyof typeof RATE_TYPE_LABEL];

  /** 确定按钮loading */
  const [loading, setLoading] = useState(false);

  const form = useMemo(() => createForm(), []);

  const { dataQualityClass, sourceCode, processDataType } =
    dataQualityEvaluationData || {};

  /** 详情返回的value值的处理 */
  const handleValue = (value?: string) =>
    value && value !== 'null' ? value : undefined;

  /** 获取评级详情 */
  useEffect(() => {
    if (
      assessmentId &&
      assessmentTarget &&
      dataQualityCategory &&
      dataQualityClass &&
      rateType &&
      sourceCode
    ) {
      getDataQualityRateDetail({
        assessmentId,
        assessmentTarget,
        dataQualityCategory,
        dataQualityClass,
        qualityTarget: rateType,
        sourceCode,
      }).then(({ data }) => {
        const {
          value1,
          value2,
          qualityLevel,
          qualityTarget: qualityTargetBack,
          linkType,
        } = data?.data || {};
        /** linkType 为 非自建因子时 时间代表性、地理代表性、技术代表性、数据准确性描述不允许更改 */

        /** 是否为列表层级 （输入输出层级） */
        const isInputOutput = dataQualityClass === INPUT_OUTPUT;
        /** 数据类型是否为自建因子 */
        const isFactorData = linkType === SELECT_BUTTON_TYPE.FACTOR_DATA;
        /** 是否允许编辑 */
        const isEditable = isInputOutput && !isFactorData;

        // 更新表单字段状态
        form.setFieldState(
          '*([timeRepresentStart, timeRepresentEnd],area,areaRepresent,areaRepresentDetail,techDescription,dataDescription)',
          async state => {
            state.readPretty = isEditable;
            state.required = !isEditable;
            state.decoratorProps = {
              asterisk: !isEditable,
            };
          },
        );
        // 地理代表性详情地址
        form.setFieldState('areaRepresentDetail', {
          required: false,
        });

        const valueOne = handleValue(value1);
        const valueTwo = handleValue(value2);
        const valuesMap = {
          /** 时间代表性 */
          [TIME]: {
            timeRepresentStart: valueOne,
            timeRepresentEnd: valueTwo,
            tir: qualityLevel,
          },
          /** 地理代表性 */
          [AREA]: {
            areaRepresent: valueOne,
            areaRepresentDetail: valueTwo,
            ger: qualityLevel,
          },
          /** 技术代表性 */
          [TECH]: {
            techDescription: valueOne,
            ter: qualityLevel,
          },
          /** 数据代表性 */
          [DATA]: {
            dataDescription: valueOne,
            p: qualityLevel,
          },
        };

        form.setValues({
          ...data?.data,
          ...valuesMap[qualityTargetBack as keyof typeof valuesMap],
        });
      });
    }
  }, [
    assessmentId,
    assessmentTarget,
    dataQualityCategory,
    dataQualityClass,
    rateType,
    sourceCode,
  ]);

  useEffect(() => {
    if (rateType && dataQualityCategory && processDataType) {
      const ratingOption = {
        [EU_BATTERY_LAW]: EU_BATTERY_LAW_STANDARDS[rateType],
        [EU_PEF]: EU_PEF_LAW_STANDARDS[processDataType][rateType],
      };
      form.setFieldState(RATE_TYPE_SCHEMAS_VALUE[rateType], {
        dataSource: map(ratingOption[dataQualityCategory], (value, key) => {
          const timeRepresentArr = value?.split('/n');
          const valueBack =
            timeRepresentArr.length > 1 ? (
              <>
                <div className={style.timeRepresentItem}>
                  {timeRepresentArr?.[0]}
                </div>
                <div className={style.timeRepresentItem}>
                  {timeRepresentArr?.[1]}
                </div>
              </>
            ) : (
              value
            );
          return { label: valueBack, value: Number(key) };
        }),
      });
    }
    /** 地理代表性 */
    if (areaRepresentOptions) {
      form.setFieldState('areaRepresent', {
        dataSource: areaRepresentOptions.map(item => ({
          label: item.dictLabel,
          value: item.dictValue,
        })),
      });
    }
  }, [areaRepresentOptions, rateType, dataQualityCategory, processDataType]);

  return (
    <Modal
      wrapClassName={`${style.wrapper}`}
      centered
      title={title}
      open={open}
      width='60%'
      maskClosable={false}
      destroyOnClose
      onCancel={() => {
        form.reset();
        handleCancel();
      }}
      footer={[
        <Button
          onClick={() => {
            form.reset();
            handleCancel();
          }}
        >
          {I18N.carbonFootPrintLCA.close}
        </Button>,
        <Button
          loading={loading}
          type='primary'
          onClick={async () => {
            const value = await form.submit<any>();

            const {
              sourceName,
              linkType,
              timeRepresentStart,
              timeRepresentEnd,
              tir,
              areaRepresent,
              areaRepresentDetail,
              ger,
              techDescription,
              ter,
              dataDescription,
              p,
            } = value || {};

            const generateValues = (
              value1?: string,
              value2?: string,
              qualityLevel?: number,
            ) => ({
              value1: value1 || '',
              value2: value2 || '',
              qualityLevel,
            });

            const valuesMap = {
              [TIME]: generateValues(timeRepresentStart, timeRepresentEnd, tir),
              [AREA]: generateValues(areaRepresent, areaRepresentDetail, ger),
              [TECH]: generateValues(techDescription, '', ter),
              [DATA]: generateValues(dataDescription, '', p),
            };

            try {
              setLoading(true);
              const result = {
                assessmentId,
                assessmentTarget,
                dataQualityCategory,
                dataQualityClass,
                linkType,
                processDataType,
                qualityTarget: rateType,
                sourceCode,
                sourceName,
                ...valuesMap[rateType as keyof typeof valuesMap],
              };
              await getDataQualityRate({
                ...result,
              });
              form.reset();
              setLoading(false);
              handleOk();
            } catch (e) {
              setLoading(false);
            }
          }}
        >
          {I18N.carbonFootPrintLCA.confirm}
        </Button>,
      ]}
    >
      <Form form={form} previewTextPlaceholder='-'>
        <SchemaField schema={schema(rateType)} />
      </Form>
    </Modal>
  );
};
