/**
 * @description cbam数据/审批详情页面
 */
import {
  Form,
  FormGrid,
  FormItem,
  FormLayout,
  PreviewText,
  Input,
  Select,
} from '@formily/antd-v5';
import { createForm, Field } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { Tabs, TabsProps } from 'antd';
import { isArray } from 'lodash-es';
import { FC, ReactNode, useEffect, useMemo } from 'react';

import { UploadFile } from '@/api/type';
import { ButtonProps } from '@/components/Form/Button';
import { FormActions } from '@/components/FormActions';
import { InfoTitle } from '@/components/InfoTitle';
import { FormilyFileUpload } from '@/components/formily/FormilyFileUpload';
import { TextArea } from '@/components/formily/TextArea';

import style from './index.module.less';
import { PrecursorDataApprovalListProps } from '../../PrecursorDataApproval/type';
import { FormilyPrecursorEmissionTable } from '../../PrecursorDataFill/Info/components/PrecursorEmissionTable';
import { FACTORY_LEVEL_ENUM } from '../../ReportForm/Info/ProductData/OutsourcedPrecursor/Info/constant';
import { getCNList } from '../../ReportForm/service';

const {
  IMPLIED_EMISSION_DIRECT,
  EL_USAGE,
  EL_EMISSION_COEFFICIENT,
  IMPLIED_EMISSION_INDIRECT,
} = FACTORY_LEVEL_ENUM;

const SchemaField = createSchemaField({
  components: {
    Form,
    FormItem,
    FormGrid,
    FormLayout,
    PreviewText,
    Input,
    Select,
    TextArea,
    InfoTitle,
    FormilyFileUpload,
    FormilyPrecursorEmissionTable,
  },
});

interface TabPageProps {
  /** 是否为编辑页面 */
  showDetail: boolean;
  /** 当前tab值 */
  currentTab: string;
  /** tab列表 */
  tabList: TabsProps['items'];
  initialValues?: PrecursorDataApprovalListProps;
  /** 表单schema */
  schema: any;
  /** 底部按钮 */
  buttons: (ButtonProps & {
    title: string;
    promisstion?: string;
  })[];
  children?: ReactNode;
  /** 切换tab的方法 */
  onChange: (key: string) => void;
}

const TabPage: FC<TabPageProps> = ({
  showDetail,
  currentTab,
  tabList,
  initialValues,
  schema,
  buttons,
  children,
  onChange,
}) => {
  const form = useMemo(
    () =>
      createForm({
        readPretty: showDetail,
        initialValues,
      }),
    [showDetail, initialValues, currentTab],
  );

  /** 根据productCategoryId查询cnCode */
  const useAsyncCnDataSource = () => async (field: Field) => {
    /** 选中的productCategoryId */
    const selectProductCategoryId =
      field?.form?.getValuesIn('productCategoryId');

    /** 查询对应枚举值 */
    const { data } = await getCNList({
      pageNum: 1,
      pageSize: 10000,
      productCategoryId: selectProductCategoryId,
    });
    const { records = [] } = data?.data || {};
    const dataSource = records?.map(item => ({
      label: `${item.defaultCode}${item.defaultName}`,
      value: item.defaultCode,
    }));

    /** 设置枚举值 */
    field.setDataSource(dataSource);
  };

  useEffect(() => {
    if (initialValues) {
      const {
        supportFile,
        evidenceFile,
        supplyAttributionList = [],
      } = initialValues || {};
      /** 证明材料 */
      let supportMaterialsFileList = [];
      if (supportFile && typeof supportFile === 'string') {
        try {
          const parsedFileData = JSON.parse(supportFile) || [];
          supportMaterialsFileList = parsedFileData?.map((file: UploadFile) => {
            const { fileName, fileId, fileUrl } = file || {};
            return {
              ...file,
              name: fileName,
              uid: fileId,
              url: fileUrl,
            };
          });
        } catch (error) {
          // 防止脏数据导致页面空白
        }
      } else {
        supportMaterialsFileList = [];
      }

      /** 证据材料 */
      let evidenceFileList = [];
      if (evidenceFile && typeof evidenceFile === 'string') {
        try {
          const parsedFileData = JSON.parse(evidenceFile) || [];
          evidenceFileList = parsedFileData?.map((file: UploadFile) => {
            const { fileName, fileId, fileUrl } = file || {};
            return {
              ...file,
              name: fileName,
              uid: fileId,
              url: fileUrl,
            };
          });
        } catch (error) {
          // 防止脏数据导致页面空白
        }
      } else {
        evidenceFileList = [];
      }

      /** 处理之后的排放数据 */
      const handleProductAttributionList =
        isArray(supplyAttributionList) && supplyAttributionList?.length
          ? supplyAttributionList?.map(item => {
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
                default:
                  return item;
              }
            })
          : [];

      form.setValues({
        ...initialValues,
        evidenceFile: evidenceFileList,
        supportFile: supportMaterialsFileList,
        supplyAttributionList: handleProductAttributionList,
      });
    }
  }, [initialValues]);

  return (
    <div className={style.wrapper}>
      <Tabs activeKey={currentTab} items={tabList} onChange={onChange} />
      <Form form={form} previewTextPlaceholder='-'>
        <SchemaField schema={schema} scope={{ useAsyncCnDataSource }} />
      </Form>
      {children && children}
      <FormActions className='footWrapper' place='center' buttons={buttons} />
    </div>
  );
};

export default TabPage;
