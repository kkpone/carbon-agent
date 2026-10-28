/**
 * @description 数据质量及其他
 */
import { Form, FormGrid, FormItem, FormLayout, Select } from '@formily/antd-v5';
import { createForm, onFieldValueChange } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { compact } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

import { FormActions } from '@/components/FormActions';
import { InfoTitle } from '@/components/InfoTitle';
import { TextArea } from '@/components/formily/TextArea';
import { useCbamPageInfo } from '@/views/cbam/ReportForm/Info/context';
import I18N from '@/lang/I18N';
import { omitInfoFn, Toast } from '@/utils';
import { useCbamEnums } from '@/views/cbam/hook';

import { GENERAL_INFO_ENUM } from './constant';
import { schema } from './schemas';
import {
  getDataQualityDetail,
  postDataQualityAdd,
  putDataQualityEdit,
} from '../../service';
import { DataQualityResp } from '../../type';

const { EU } = GENERAL_INFO_ENUM;

const SchemaField = createSchemaField({
  components: {
    Select,
    TextArea,
    InfoTitle,
    Form,
    FormItem,
    FormGrid,
    FormLayout,
  },
});

interface DataQualityProps {
  /** 下一步方法 */
  onClickNextStep: ({ reportId }: { reportId?: number }) => void;
  /** 返回方法 */
  onClickBack: () => void;
  /** 是否是CBAM跳转 */
  isCbamInfo?: boolean;
}

const DataQuality = ({
  onClickNextStep,
  onClickBack,
  isCbamInfo,
}: DataQualityProps) => {
  const { isDetail, id: cbamId } = useCbamPageInfo();

  /** 数据质量的一般信息 */
  const generalInformationEnums = useCbamEnums('GeneralInformation');
  /** 使用默认值的理由（如相关） */
  const defaultReasonEnums = useCbamEnums('DefaultReason');
  /** 质量保证信息 */
  const qualityAssuranceEnums = useCbamEnums('QualityAssurance');

  /** 保存按钮的loading */
  const [btnLoading, setBtnLoading] = useState(false);

  const form = useMemo(
    () =>
      createForm({
        readPretty: isDetail,
        effects: currentForm => {
          onFieldValueChange('generalInformation', async field => {
            /** 当数据质量的一般信息选择“大多数默认值由欧盟委员会提供”时，置灰不可编辑且内容清空 */
            const isEU = field.value === EU;
            currentForm.setFieldState('defaultReason', {
              disabled: isEU || isDetail,
            });
            if (isEU) {
              currentForm?.setValuesIn('defaultReason', null);
            }
          });
        },
      }),
    [isDetail],
  );

  useEffect(() => {
    /** 获取详情 */
    if (cbamId) {
      getDataQualityDetail({ id: cbamId }).then(({ data }) => {
        const result = data?.data || {};
        form.setValues({
          ...result,
        });
      });
    }
  }, [cbamId]);

  /** 设置表单枚举值 */
  useEffect(() => {
    /** 设置数据质量的一般信息 */
    if (generalInformationEnums.length)
      form.setFieldState('generalInformation', {
        dataSource: generalInformationEnums?.map(item => ({
          label: item.name,
          value: item.code,
        })),
      });
    /** 设置使用默认值的理由（如相关） */
    if (defaultReasonEnums.length)
      form.setFieldState('defaultReason', {
        dataSource: defaultReasonEnums?.map(item => ({
          label: item.name,
          value: item.code,
        })),
      });
    /** 设置质量保证信息 */
    if (qualityAssuranceEnums.length)
      form.setFieldState('qualityAssurance', {
        dataSource: qualityAssuranceEnums?.map(item => ({
          label: item.name,
          value: item.code,
        })),
      });
  }, [generalInformationEnums, defaultReasonEnums, qualityAssuranceEnums]);

  return (
    <div>
      <Form form={form} previewTextPlaceholder='-'>
        <SchemaField schema={schema()} />
      </Form>
      <FormActions
        place='center'
        buttons={compact([
          !isDetail && {
            title: I18N.Factors.saveNextStep,
            type: 'primary',
            loading: btnLoading,
            onClick: async () => {
              const values = await form.submit<DataQualityResp>();
              const { id } = values || {};

              const result = omitInfoFn({ ...values, cbamId });

              /** 保存时的api接口 */
              const postApi = id ? putDataQualityEdit : postDataQualityAdd;

              try {
                setBtnLoading(true);
                await postApi(result);
                Toast('success', I18N.Factors.saveSuccessful);
                setBtnLoading(false);
                form.reset();
                onClickNextStep({ reportId: cbamId });
              } catch (e) {
                setBtnLoading(false);
                throw e;
              }
            },
          },
          (!isDetail || isCbamInfo) && {
            title: I18N.Factors.return,
            onClick: async () => {
              onClickBack();
            },
          },
        ])}
      />
    </div>
  );
};

export default DataQuality;
