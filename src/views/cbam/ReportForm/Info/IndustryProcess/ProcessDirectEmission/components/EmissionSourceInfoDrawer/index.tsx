/**
 * @description 排放源详情抽屉
 */
import {
  Form,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  NumberPicker,
  Select,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button, Drawer } from 'antd';
import { compact, includes, omit } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

import { UploadFile } from '@/api/type';
import { IconFont } from '@/components/LcaIconFont';
import { InfoTitle } from '@/components/InfoTitle';
import { FormilyFileUpload } from '@/components/formily/FormilyFileUpload';
import { PageTypeInfo } from '@/router/utils/enums';
import { omitInfoFn, Toast } from '@/utils/index';
import {
  getSourceFlowDetail,
  postSourceFlowAdd,
  putSourceFlowEdit,
} from '@/views/cbam/ReportForm/service';
import { SourceFlowResp } from '@/views/cbam/ReportForm/type';
import { useCbamEnums } from '@/views/cbam/hook';

import { METHOD_ENUM_ARR } from './constant';
import style from './index.module.less';
import { schema } from './schemas';
import { EMISSION_TYPE } from '../../constant';

const { add, edit, show } = PageTypeInfo;

const SchemaField = createSchemaField({
  components: {
    Input,
    Select,
    NumberPicker,
    InfoTitle,
    FormilyFileUpload,
    Form,
    FormItem,
    FormGrid,
    FormLayout,
  },
});
interface EmissionSourceInfoProps {
  /** 抽屉的显隐 */
  open: boolean;
  /** 列表操作按钮的类型 */
  actionBtnType?: string;
  /** 源流ID */
  emissionId?: number;
  /** 报表ID */
  cbamId?: number;
  /** 工序ID */
  productProcessId?: number;
  /** 保存方法 */
  onOk: () => void;
  /** 取消方法 */
  onClose: () => void;
}

export const EmissionSourceInfoDrawer = ({
  open,
  actionBtnType,
  emissionId,
  cbamId,
  productProcessId,
  onOk,
  onClose,
}: EmissionSourceInfoProps) => {
  const isAdd = actionBtnType === add;
  const isDetail = actionBtnType === show;

  /** 抽屉标题 */
  const titleMap = {
    [add]: I18N.cbam.addNewEmissionSources,
    [edit]: I18N.cbam.editEmissionSources,
    [show]: I18N.carbonFootprint3.emissionSourceDetails,
  };
  const title = titleMap[actionBtnType as keyof typeof titleMap];

  /** 方法枚举 */
  const processMethodOptions = useCbamEnums('ProcessMethod');

  const form = useMemo(
    () =>
      createForm({
        readPretty: isDetail,
      }),
    [actionBtnType],
  );

  /** 保存按钮的loading */
  const [btnLoading, setBtnLoading] = useState(false);

  /** 保存时的api接口 */
  const postApi = isAdd ? postSourceFlowAdd : putSourceFlowEdit;

  /** 关闭弹窗初始化 */
  const onCloseInit = () => {
    form.reset();
    onClose();
  };

  useEffect(() => {
    /** 获取详情 */
    if (!isAdd && emissionId) {
      getSourceFlowDetail({ id: emissionId }).then(({ data }) => {
        const result = data?.data || {};
        const { supportFile } = result;

        /** 支撑材料 */
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

        form.setValues({
          ...result,
          supportFile: supportMaterialsFileList,
        });
      });
    }
  }, [isAdd, emissionId]);

  /** 设置表单枚举值 */
  useEffect(() => {
    if (!actionBtnType) {
      return;
    }
    if (processMethodOptions) {
      /** 方法 */
      form.setFieldState('processMethod', {
        dataSource: compact(
          processMethodOptions?.map(method => {
            if (includes(METHOD_ENUM_ARR, method.code)) {
              return {
                label: method.name,
                value: method.code,
              };
            }
            return undefined;
          }),
        ),
      });
    }
  }, [processMethodOptions, actionBtnType]);

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
              const values = await form.submit<SourceFlowResp>();
              const { supportFile } = values || {};

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

              const result = omitInfoFn({
                ...values,
                cbamId,
                productProcessId,
                sourceType: EMISSION_TYPE.EMISSION,
                supportFile: supportFiles,
              });

              try {
                setBtnLoading(true);
                await postApi(result);
                Toast('success', I18N.Factors.saveSuccessful);
                setBtnLoading(false);
                form.reset();
                onOk();
              } catch (e) {
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
        <SchemaField schema={schema()} />
      </Form>
    </Drawer>
  );
};
