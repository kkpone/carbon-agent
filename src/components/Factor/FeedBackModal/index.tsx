/**
 * @file 反馈弹窗
 */

import { listALLByDictTypeBatch } from '@src/api/api';
import { addFactorFeedBack } from '@src/api/foot-print';
import { FactorFeedback, FileResponse } from '@src/api/foot-print/api-types';
import { BackendResponse } from '@src/api/types';
import { ModalBase } from '@src/components/UI/Modal';
import { JavaUpload } from '@src/components/Upload/JavaUpload';
import I18N from '@src/lang/I18N';
import { RootState } from '@src/store';
import { Toast } from '@src/utils/Toast';
import { Dicts } from '@src/views/emission/Show/type';
import { changeDicts2Options } from '@src/views/utils';
import { Form, Input, Select } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { UploadChangeParam } from 'antd/es/upload/interface';
import { compact } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import style from './index.module.less';
import { FeedBackType } from '../utils';

type FeedBackModalProps = {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  type: FeedBackType;
  /**
   * 基础框架 4 期增加，全局反馈时，反馈产品列表
   */
  showProductList?: boolean;
};

export const FeedBackModal = ({
  visible,
  onOk,
  type,
  showProductList,
  onCancel,
}: FeedBackModalProps) => {
  const selector = useSelector<RootState, RootState['companyUserInfo']>(
    s => s.companyUserInfo,
  );
  const products = useSelector<RootState, RootState['products']>(
    s => s.products,
  );
  const [form] = useForm<{
    content?: string;
    productType?: string;
    img?: UploadChangeParam<BackendResponse<FileResponse>>;
  }>();
  const [productList, setProductList] = useState<Dicts[]>([]);
  /** 获取意见反馈产品列表 */
  const getProducts = () =>
    listALLByDictTypeBatch<{ Carbon_Footprint: Dicts[] }>({
      dictTypes: `Carbon_Footprint`,
    }).then(({ data }) => {
      const productDicts = data?.data?.Carbon_Footprint;
      setProductList(productDicts || []);
      form.setFieldsValue({
        productType:
          productDicts.find(d =>
            d.dictLabel.includes(I18N.carbonFootprint3.carbonFootprint),
          )?.dictValue || '',
      });
    });

  useEffect(() => {
    if (showProductList && visible) {
      getProducts();
    }
    form.resetFields();
  }, [visible]);
  const [okLoading, setOkLoading] = useState(false);
  const productsOptions = changeDicts2Options(productList);
  const companyId = selector.userInfo?.companyId;
  if (!visible) return null;
  if (!companyId)
    return <h1>{I18N.components.organizationalInformationAcquisition}</h1>;
  return (
    <ModalBase
      title={I18N.components.feedback}
      width={478}
      visible={visible}
      okText={I18N.components.submit}
      okButtonProps={{ loading: okLoading }}
      onOk={async () =>
        form.validateFields().then(async values => {
          const r: FactorFeedback = {
            content: values.content || '',
            type,
            productType: values.productType || products.productId,
            companyId,
            suggestionFiles: compact(
              values?.img?.fileList?.map(f => {
                // @ts-ignore
                if (f.response?.code === 200) return { ...f.response?.data };
                return null;
              }),
            ),
          };
          setOkLoading(true);
          await addFactorFeedBack(r)
            .then(({ data }) => {
              if (data.code === 200)
                Toast('success', I18N.components.submittedThankYou);
            })
            .finally(() => {
              setOkLoading(false);
            });
          onOk();
        })
      }
      wrapClassName={style.feedbackModal}
      onCancel={onCancel}
      content={
        <Form layout='vertical' form={form} style={{ marginTop: '40px' }}>
          {!!showProductList && (
            <Form.Item
              label={I18N.components.productList}
              name='productType'
              rules={[
                {
                  required: true,
                  message: I18N.carbonFootprint3.pleaseSelectAProduct,
                },
              ]}
            >
              <Select
                placeholder={I18N.carbonFootprint.pleaseSelect}
                showSearch
                filterOption={(input, option) =>
                  !!option?.label
                    .toLocaleLowerCase()
                    .includes(input?.toLocaleLowerCase())
                }
                options={productsOptions}
              />
            </Form.Item>
          )}
          <Form.Item
            label={I18N.components.feedbackContent}
            name='content'
            rules={[
              {
                required: true,
                message: I18N.components.pleaseProvideFeedback,
              },
            ]}
          >
            <Input.TextArea
              aria-label='content'
              className={style.textArea}
              maxLength={500}
              placeholder={I18N.carbonFootprint.pleaseEnter}
            />
          </Form.Item>
          <Form.Item
            name='img'
            label={
              <div>
                {I18N.components.attachment}
                <span className={style.lightFormItemLabel}>
                  {I18N.components.singleAttachmentNot}
                </span>
              </div>
            }
          >
            <JavaUpload maxCount={5} maxSize={10 * 1024 * 1024} />
          </Form.Item>
        </Form>
      }
    />
  );
};
