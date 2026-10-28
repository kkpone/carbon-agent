/*
 * @@description:奖品详情
 * @Author: qifeng  mingyao qifeng@carbonstop.net
 * @Date: 2022-11-07 10:51:29
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-01-09 11:26:04
 */

import I18N from '@src/lang/I18N';
import { EmptyLoading } from '@src/components/EmptyLoading';
import { FormActions } from '@src/components/FormActions';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import {
  formItemInitInput,
  formItemInitType,
} from '@src/components/FormUtil/util';
import { Page } from '@src/components/Page';
import { RouteMaps } from '@src/router/route-paths';
import {
  addUsingPOST1GoodsControllerApi,
  editUsingPOST2GoodsControllerApi,
  getInfoUsingGETGoodsControllerApi,
  Goods,
} from '@src/sdks/java/carbonAccount';
import { Toast } from '@src/utils/Toast';
import {
  formNumberCheck,
  useFlattedOrganizations,
  useOrganizations,
} from '@src/views/carbonAccount/utils';
import { Card, Form, FormProps } from 'antd';
import classNames from 'classnames';
import { compact, noop } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { carbonAccountAwardListDetailItem } from './model';
import { organizationFormItems } from '../model';
import { AwardListDetailLoaction } from '../type';
import '../../../index.less';
import style from './index.module.less';

import { BraftEditorComponent } from '@src/components/BraftEditor';
import { javaFileUpload } from '@src/api/api';

const CarbonAccountAwardConversionAwardListDetail = () => {
  const location = useLocation<AwardListDetailLoaction>();
  /** 是否是编辑状态 */
  const [isEdit] = useState(location.state?.status === 'edit');
  /** 是否新增 */
  const [isAdd] = useState(location.state?.status === 'add');
  /** 当前列表详情 */
  const [listInfo, setListInfo] = useState<Goods>();
  const [AwardListForm] = Form.useForm<Partial<Goods>>();
  const [bannerContent, setBannerContent] = useState<string>();
  /** 基础信息表单 */
  const basicsFormProps: FormProps = {
    form: AwardListForm,
    layout: 'vertical',
  };
  /** 组织架构 */
  const organizations = useOrganizations();
  const flattenOrg = useFlattedOrganizations(organizations);

  /** 新增和编辑奖品 */
  const subAwardInfo = async () =>
    // eslint-disable-next-line consistent-return
    AwardListForm.validateFields()
      .then(async channelValues => {
        // @ts-ignore
        const orgIds = channelValues.orgIds.join(',') as string;

        const AwardListFormVal = {
          ...AwardListForm.getFieldsValue(),
          limitFlag: 1,
        };

        if (isEdit && listInfo?.id) {
          const res = await editUsingPOST2GoodsControllerApi({
            ...AwardListFormVal,
            orgIds,
            id: +listInfo.id,
            companyId: listInfo.companyId,
            goodsStatus: listInfo.goodsStatus,
          } as unknown as Goods);
          if (res.data.code === 200) {
            Toast('success', I18N.carbonAccount.editingPrizes);
            history.back();
          } else {
            Toast('error', res.data.msg);
          }
        } else {
          const res = await addUsingPOST1GoodsControllerApi({
            ...AwardListFormVal,
            orgIds,
          } as unknown as Goods);
          if (res.data.code === 200) {
            Toast('success', I18N.carbonAccount.newPrizesAdded);
            history.back();
          } else {
            Toast('error', res.data.msg);
          }
        }
      })
      .catch(noop);
  const init = async () => {
    AwardListForm.setFieldsValue({
      sendGoodType: 1,
      // @ts-ignore
      goodLimitType: 1,
      goodsStatus: 0,
    });
    if (!location.state?.id) return;
    const res = await getInfoUsingGETGoodsControllerApi(location.state.id);
    const goods = res.data?.data as unknown as Goods;
    setListInfo(goods);
    setBannerContent(goods.info);
    if (isEdit) {
      initEdit(goods);
    } else {
      AwardListForm.setFieldsValue({
        ...goods,
        // @ts-ignore
        orgIds: goods?.orgIds?.split(',')?.map(v => +v),
      });
    }
  };
  /** 编辑状态 */
  const initEdit = (listInfo: Goods) => {
    if (!listInfo || !flattenOrg.length) return;
    const orgIds = listInfo?.orgIds?.split(',');

    AwardListForm.setFieldsValue({
      ...listInfo,
      // 过滤删除了的组织
      // @ts-ignore
      orgIds: compact(
        orgIds?.map(o => {
          if (flattenOrg.some(org => org.id === Number(o))) {
            return +o;
          }
          return null;
        }),
      ),
    });
  };
  useEffect(() => {
    init();
  }, [flattenOrg, isEdit]);
  if (!flattenOrg.length && isEdit) return <EmptyLoading />;
  return (
    <Page
      breadCrumbs={[
        {
          title: I18N.carbonAccount.rewardRedemption,
          key: I18N.carbonAccount.rewardRedemption,
          href: RouteMaps.CarbonAccountAwardConversionAwardList,
        },
        {
          title: I18N.carbonAccount.editProduct,
          key: I18N.carbonAccount.editProduct,
        },
      ]}
      breadcrumbClass={style.breadcrumb}
      wrapperClassName={classNames(
        'border-bottom-global-actions autoHeight',
        style.awardsDetail,
      )}
    >
      <Card>
        <div className={style.cardTitle}>{I18N.carbonFootprint3.basicInformation}</div>
        <FormItemUtil
          antdFormProps={basicsFormProps}
          formItems={carbonAccountAwardListDetailItem(
            AwardListForm,
            isEdit,
            isAdd,
            listInfo?.imgPath,
          )}
        />
      </Card>
      <Card>
        <div className={style.cardTitle}>{I18N.components.productInformation}</div>
        <FormItemUtil
          antdFormProps={basicsFormProps}
          formItems={[
            // {  // 暂时不要了
            //   // todo changename
            //   ...formItemInputSchema({
            //     label: '可兑换库存/单位',
            //     name: 'count',
            //     rules: true,
            //     props: {
            //       type: 'number',
            //       step: 1,
            //       min: 0,
            //       max: 9999999,
            //     },
            //   }),
            //   col: 12,
            //   colClassName: style.colItem,

            //   rulesCustom: [
            //     () => ({
            //       validator(_: any, validatorVal: string) {
            //         return formNumberCheck(validatorVal);
            //       },
            //     }),
            //   ],
            // },
            {
              ...formItemInitInput(I18N.carbonAccount.consumptionOfCarbonCoins, 'score', true),
              col: 24,
              colClassName: style.colItem,
              rulesCustom: [
                () => ({
                  validator(_: any, validatorVal: string) {
                    return formNumberCheck({
                      labelName: I18N.carbonAccount.consumptionOfCarbonCoins,
                      validatorVal,
                    });
                  },
                }),
              ],
            },
            {
              label: I18N.components.productDetails,
              name: 'info',
              col: 24,
              type: 'render',
              rules: false,
              render: () => (
                <BraftEditorComponent
                  max={500}
                  className={style.braftEditor}
                  // @ts-ignore
                  // readOnly={isDetail}
                  media={{
                    uploadFn(params) {
                      javaFileUpload(params.file).then(({ data }) => {
                        const result = data?.data;
                        if (data?.code === 200 && result) {
                          params.success({
                            ...result,
                            meta: {
                              // @ts-ignore
                              id: params.id,
                              title: result.name,
                              alt: result.name,
                              loop: false,
                              autoPlay: false,
                              controls: false,
                              poster: '',
                            },
                          });
                        }
                      });
                    },
                  }}
                  changeControls={defaultControls => [
                    ...defaultControls,
                    'media',
                  ]}
                  defaultValue={
                    bannerContent ? decodeURIComponent(bannerContent) : ''
                  }
                  placeholder={I18N.carbonFootprint.pleaseEnter}
                  onChange={(val?: string) => {
                    AwardListForm.setFieldsValue({
                      info: encodeURIComponent(val || ''),
                    });
                    // onChange(encodeURIComponent(val || ''));
                  }}
                />
              ),
            },
          ]}
        />
      </Card>
      <Card>
        <div className={style.cardTitle}>{I18N.carbonAccount.exchangeRestrictions}</div>
        <FormItemUtil
          antdFormProps={basicsFormProps}
          formItems={[
            {
              ...formItemInitType(
                'select',
                I18N.carbonAccount.singlePersonExchangeLimit,
                'goodLimitType',
                true,
              ),
              col: 12,
              colClassName: style.colItem,
              props: {
                options: [
                  { label: I18N.carbonAccount.dailyLimitOnExchange, value: 1 },
                  { label: I18N.carbonAccount.weeklyLimitOnRedemption, value: 2 },
                  { label: I18N.carbonAccount.monthlyLimitOnExchange, value: 3 },
                  { label: I18N.carbonAccount.permanentLimitOnRedemption, value: 4 },
                ],
              },
            },
            {
              // todo
              ...formItemInitInput(I18N.carbonAccount.limitRedemptionTimes, 'countLimit', true),
              col: 12,
              colClassName: style.colItem,
              rulesCustom: [
                () => ({
                  validator(_: any, validatorVal: string) {
                    return formNumberCheck({
                      labelName: I18N.carbonAccount.limitRedemptionTimes,
                      validatorVal,
                      maxValue: 999,
                    });
                  },
                }),
              ],
            },
            {
              ...organizationFormItems({
                label: I18N.carbonAccount.effectiveChannels,
                name: 'orgIds',
                organizations,
              }),
              col: 12,
              // colClassName: style.colItem,
              rulesCustom: [{ required: true, message: I18N.carbonAccount.pleaseSelectEffective }],
            },
            {
              ...formItemInitType('radio', I18N.carbonAccount.shippingConfiguration, 'sendGoodType', true),
              col: 12,
              colClassName: style.colItem,
              props: {
                options: [
                  { label: I18N.carbonAccount.automaticShipping, value: 1 },
                  { label: I18N.carbonAccount.manualShipping, value: 2 },
                ],
              },
            },
          ]}
        />
      </Card>
      {isAdd && (
        <Card>
          <div className={style.cardTitle}>{I18N.carbonAccount.stateRestrictions}</div>
          <FormItemUtil
            antdFormProps={basicsFormProps}
            formItems={[
              {
                ...formItemInitType(
                  'radio',
                  I18N.carbonAccount.singlePersonExchangeLimit,
                  'goodsStatus',
                  true,
                ),
                col: 12,
                colClassName: style.colItem,
                props: {
                  options: [
                    { label: I18N.carbonAccount.listed, value: 1 },
                    { label: I18N.carbonAccount.delisted, value: 0 },
                  ],
                },
              },
            ]}
          />
        </Card>
      )}

      <FormActions
        place='center'
        buttons={[
          {
            title: I18N.carbonFootprint.preserve,
            type: 'primary',
            onClick: async () => subAwardInfo(),
          },
          {
            title: I18N.carbonFootprint.return,
            onClick: async () => {
              history.go(-1);
            },
          },
        ]}
      />
    </Page>
  );
};

export default CarbonAccountAwardConversionAwardListDetail;
