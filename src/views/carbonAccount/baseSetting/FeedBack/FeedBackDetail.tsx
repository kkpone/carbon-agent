/**
 * @file 反馈详情
 */

import I18N from '@src/lang/I18N';
import { FormActions } from '@src/components/FormActions';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import {
  formItemInitType,
  formItemInputSchema,
} from '@src/components/FormUtil/util';
import { Page } from '@src/components/Page';
import { RouteMaps } from '@src/router/route-paths';
import {
  editUsingPOST7DefaultApi,
  infoUsingGET4DefaultApi,
  UserFeedbackDto,
} from '@src/sdks/java/carbonAccount';
import { Toast } from '@src/utils/Toast';
import { Image } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { compact, isNumber } from 'lodash-es';
import { useEffect, useState } from 'react';
import style from './index.module.less';
import { levels, status, ShowType } from './utils';

const FeedBackDetail = () => {
  const search = new URLSearchParams(window.location.search);
  /** 用于对比变化 */
  const [defaultStatus, setDefaultStatus] = useState<UserFeedbackDto>();
  const id = search.get('id');
  const type =
    search.get('type') === ShowType.edit ? ShowType.edit : ShowType.show;
  const [detail, setDetail] = useState<UserFeedbackDto>();
  const [form] = useForm<UserFeedbackDto>();
  useEffect(() => {
    if (Number(id)) {
      infoUsingGET4DefaultApi(Number(id), {
        headers: { 'Cache-Control': 'no-cache' },
      }).then(({ data }) => {
        const result = data?.data;
        setDetail(result);
        setDefaultStatus({ ...result });
        form.setFieldsValue({
          ...result,
          // @ts-ignore
          feedbackLevel: isNumber(result?.feedbackLevel)
            ? `${result?.feedbackLevel}`
            : undefined,
          // @ts-ignore
          feedbackStatus: isNumber(result?.feedbackStatus)
            ? `${result?.feedbackStatus}`
            : undefined,
        });
      });
    }
  }, [id, type]);

  if (!id) return <h1>{I18N.carbonAccount.dataAnomalyFinding}</h1>;

  return (
    <Page
      wrapperClassName={style.detailWrapper}
      breadCrumbs={[
        {
          title: I18N.carbonAccount.feedbackList,
          key: I18N.carbonAccount.feedbackList,
          href: RouteMaps.carbonAccountFeedBacks,
        },
        {
          title: I18N.carbonAccount.viewFeedback,
          key: I18N.carbonAccount.viewFeedback,
        },
      ]}
    >
      <div className={style.main}>
        <FormItemUtil
          antdFormProps={{
            form,
            readonly: true,
            layout: 'vertical',
          }}
          formItems={[
            formItemInputSchema({ label: I18N.supplyChain2.feedbackPerson, name: 'realName' }),
            formItemInputSchema({ label: I18N.carbonAccount.feedbackTime, name: 'createTime' }),
            formItemInitType('textArea', I18N.components.feedbackContent, 'content', false),
          ].map(t => ({ ...t, col: 12 }))}
        />
        <div className={style.fileWrapper}>
          <div className={style.fileTitle}>{I18N.carbonAccount.feedbackFile}</div>
          <Image.PreviewGroup>
            {['jpg', 'png', 'gif', 'webp', 'jpeg'].some(end =>
              detail?.imgUrl?.endsWith(end),
            ) && (
              <Image
                key={detail?.imgUrl}
                wrapperClassName={style.fileItem}
                height={100}
                src={detail?.imgUrl}
              />
            )}
          </Image.PreviewGroup>
        </div>
        <FormItemUtil
          antdFormProps={{
            readonly: type === ShowType.show,
            layout: 'vertical',
            form,
            onValuesChange(val) {
              setDetail(s => ({ ...s, ...val }));
            },
          }}
          formItems={[
            formItemInitType('select', I18N.carbonAccount.priority, 'feedbackLevel', true, {
              props: {
                options: Object.keys(levels()).map(k => ({
                  value: k,
                  label: levels()[k],
                })),
              },
            }),
            formItemInitType('select', I18N.carbonFootprint.state, 'feedbackStatus', true, {
              props: {
                options: Object.keys(status()).map(k => ({
                  value: k,
                  label: status()[k],
                })),
              },
            }),
          ].map(t => ({ ...t, col: 12 }))}
        />

        <FormActions
          buttons={compact([
            type !== ShowType.show && {
              title: I18N.carbonFootprint.confirm2,
              type: 'primary',
              disabled: !(
                String(defaultStatus?.feedbackLevel) !==
                  String(detail?.feedbackLevel) ||
                String(defaultStatus?.feedbackStatus) !==
                  String(detail?.feedbackStatus)
              ),
              onClick: async () => {
                editUsingPOST7DefaultApi({
                  id: +id,
                  feedbackLevel: detail?.feedbackLevel,
                  feedbackStatus: detail?.feedbackStatus,
                }).then(({ data }) => {
                  if (data.code === 200) {
                    Toast('success', I18N.carbonFootprint.modifiedSuccessfully);
                    history.go(-1);
                  }
                });
              },
            },

            {
              title: I18N.carbonFootprint.cancel,
              onClick: async () => {
                history.go(-1);
              },
            },
          ])}
        />
      </div>
    </Page>
  );
};

export default FeedBackDetail;
