/**
 * @description 供应商收数弹窗
 */
import {
  DatePicker,
  Form,
  FormGrid,
  FormItem,
  FormLayout,
  Select,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField, FormConsumer } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Modal, Button, Descriptions, Tooltip } from 'antd';
import { omit } from 'lodash-es';
import { FC, useMemo } from 'react';

import { InfoTitle } from '@/components/InfoTitle';
import { FormilyFileUpload } from '@/components/formily/FormilyFileUpload';
import { TextArea } from '@/components/formily/TextArea';
import { modelFooterBtnStyle } from '@/utils';
// import { useSupplyList } from '@/views/cbam/hook';

import style from './index.module.less';
import { supplySchema, otherSchema } from './schemas';
import {
  OutsourcedPrecursorResp,
  SupplyCollectionRequest,
} from '../../../type';

const SchemaField = createSchemaField({
  components: {
    Select,
    TextArea,
    InfoTitle,
    FormilyFileUpload,
    DatePicker,
    Form,
    FormItem,
    FormGrid,
    FormLayout,
  },
});

interface SupplyCollectionModalProps {
  /** 弹窗显隐 */
  open: boolean;
  /** 前体信息 */
  precursorInfo?: OutsourcedPrecursorResp;
  /** 确认按钮的loading */
  confirmLoading?: boolean;
  /** 点击取消按钮的方法 */
  handleCancel: () => void;
  /** 点击确定按钮的方法 */
  handleOk: (values: SupplyCollectionRequest) => void;
}

const SupplyCollectionModal: FC<SupplyCollectionModalProps> = ({
  open,
  precursorInfo,
  confirmLoading = false,
  handleCancel,
  handleOk,
}) => {
  const form = useMemo(() => createForm(), [open]);

  /** 当前用户所在商户的启用状态下的供应商（商户类别为供应商） */
  // const supplyList = useSupplyList();

  /** 设置枚举值 */
  // useEffect(() => {
  //   if (!open) return;

  //   /** 选择供应商 */
  //   if (supplyList) {
  //     form.setFieldState('supplyOrgId', {
  //       dataSource: supplyList.map(item => ({
  //         label: item.supplierName,
  //         value: item.id,
  //       })),
  //     });
  //   }
  // }, [supplyList, open]);

  return (
    <Modal
      wrapClassName={style.wrapper}
      centered
      title={I18N.cbam.supplierReceipts}
      open={open}
      width='50%'
      confirmLoading={confirmLoading}
      maskClosable={false}
      destroyOnClose
      onCancel={() => {
        handleCancel();
      }}
      footer={[
        <Button
          onClick={() => {
            handleCancel();
          }}
        >
          {I18N.Factors.cancel}
        </Button>,
        <Button
          onClick={async () => {
            const values = await form.submit<SupplyCollectionRequest>();

            const { supportFile, deadline, supplyOrgId } = values || {};

            /** 选择的供应商信息 */
            const selectedSupplyInfo = supplyList?.filter(
              supply => supply.id === supplyOrgId,
            )?.[0];

            const { supplierName, uniqueCode } = selectedSupplyInfo;

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

            const result = {
              ...values,
              uniqueCode,
              supportFile: supportFiles,
              deadline: `${deadline} 23:59:59`,
              productPrecursorId: precursorInfo?.id,
              precursorName: precursorInfo?.preName,
            };

            Modal.confirm({
              title: I18N.Factors.prompt,
              icon: '',
              content: (
                <div>
                  {I18N.cbam.confirmTo}
                  <span className='primaryColor'>{supplierName || '-'}</span>
                  {I18N.cbam.release}
                  <span className='primaryColor'>
                    {precursorInfo?.preName || '-'}
                  </span>
                  {I18N.cbam.supplierReceipts2}
                </div>
              ),
              ...modelFooterBtnStyle,
              okText: I18N.base.confirm,
              cancelText: I18N.Factors.cancel,
              onOk: async () => {
                handleOk?.(result);
              },
              okButtonProps: {
                loading: confirmLoading,
              },
            });
          }}
          type='primary'
        >
          {I18N.supplyChainCarbonManagement.submitApplication}
        </Button>,
      ]}
    >
      <div className={style.modalWrapper}>
        <div className={style.confirmModalTip}>
          {I18N.cbam.initiateSupplyNote}
        </div>
        <Form form={form} previewTextPlaceholder='-'>
          <SchemaField schema={supplySchema()} />
          <FormConsumer>
            {currentForm => {
              /** 选择的供应商 */
              const selectedSupplyId = currentForm.getValuesIn('supplyOrgId');

              /** 选择的供应商信息 */
              const selectedSupplyInfo = supplyList?.filter(
                supply => supply.id === selectedSupplyId,
              );

              const { supplierName, contactName, contactEmail, supplierCode } =
                selectedSupplyInfo?.[0] || {};

              /** 展示信息列表 */
              const showInfoList = [
                {
                  label: I18N.carbonFootprint3.supplierName,
                  value: supplierName,
                },
                {
                  label: I18N.supplyChainCarbonManagement.contacts,
                  value: contactName,
                },
                {
                  label: I18N.supplyChainCarbonManagement.contactEmail,
                  value: contactEmail,
                },
                {
                  label: I18N.supplyChainCarbonManagement.merchantCode,
                  value: supplierCode,
                },
              ];

              return (
                <div className={style.factoryInfoWrapper}>
                  <Descriptions column={2}>
                    {showInfoList?.map(showInfo => (
                      <Descriptions.Item
                        label={showInfo.label}
                        key={showInfo.label}
                      >
                        <div className={style.showText}>
                          <Tooltip title={showInfo.value} placement='topLeft'>
                            {showInfo.value || '-'}
                          </Tooltip>
                        </div>
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                </div>
              );
            }}
          </FormConsumer>
          <SchemaField schema={otherSchema()} />
        </Form>
      </div>
    </Modal>
  );
};
export default SupplyCollectionModal;
