import {
  FormItem,
  FormGrid,
  Input,
  Select,
  Cascader,
  Radio,
  FormLayout,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { apiCity } from '@src/api/api';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import I18N, { serviceLangMap } from '@src/lang/I18N';
import { RootState } from '@src/store';
import { SET_COMPANY_USER_INFO } from '@src/store/actionTypes';
import { checkEmail, logout, switchCompany } from '@src/utils';
import {
  apiListALLByDictTypeData,
  apiMnumListALLByDictTypeBatch,
} from '@src/views/emission/Show/service';
import { useRequest } from 'ahooks';
import { Button } from 'antd';
import classNames from 'classnames';
import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { initFormilyCascader } from '@/components/FormilyUtil/util';
import { LocaleContext } from '@/components/LocaleProvider';
import { FormilyAreaCodeInput } from '@/components/formily/components/AreaCodeInput';
import { Dicts } from '@/hooks/useFieldUnitDictSource';
import { RouteMaps } from '@/router/route-paths';
import { getAreaCode } from '@/views/system/login/service';

import styles from './index.module.less';
import { apiAddCompany } from '../../service';

const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormGrid,
    Input,
    Select,
    Cascader,
    Radio,
    FormilyAreaCodeInput,
    FormLayout,
  },
});

type CreateTrialOrgProps = {
  /** 简化版本无姓名、手机号、邮箱 */
  simple: boolean;
  /** 取消回调 */
  onCancel: () => void;
};

const transFormCar = (data: Dicts[]) =>
  data.map(item => ({
    ...item,
    value: item.dictValue,
    label: item.dictLabel,
    children: item.enumList ? transFormCar(item.enumList) : [],
  }));

const CreateTrialOrg: FC<CreateTrialOrgProps> = props => {
  const { simple, onCancel } = props;

  const form = useMemo(() => createForm({ validateFirst: true }), []);

  const [submitLoading, setSubmitLoading] = useState(false);

  const dispatch = useDispatch();

  const history = useHistory();

  const { locale } = useContext(LocaleContext);

  const { data: businessData } = useRequest(() =>
    apiListALLByDictTypeData({
      dictType: 'business',
    }),
  );

  useEffect(() => {
    form.setFieldState('.industry', {
      dataSource: transFormCar(businessData?.data.data || []),
    });
  }, [businessData, form]);

  const { data = [] } = useRequest(
    () =>
      getAreaCode({
        lang: serviceLangMap[locale],
      }),
    {
      cacheKey: locale,
      // 30 分钟
      staleTime: 30 * 1000 * 60,
      refreshDeps: [locale],
    },
  );

  // 这里不用 areaCode 作为 key，是因为不同 option 的 areaCode 可能会相同。例如美国加拿大区号都是 1 。
  const options = useMemo(
    () =>
      data.map(item => ({
        label: item.areaContent,
        value: item.areaContent,
      })),
    [data],
  );

  useEffect(() => {
    form.setFieldState('.linkmanPhone', {
      dataSource: options,
    });
  }, [options, form]);

  const user = useSelector<RootState, RootState['companyUserInfo']>(
    s => s.companyUserInfo,
  );

  const { mobile, email, areaCode } = user.userInfo.user;

  useEffect(() => {
    form.setValues({
      linkmanPhone: {
        areaCode,
        phone_number: mobile,
      },
      linkmanEmail: email,
    });
    if (mobile) {
      form.setFieldState('linkmanPhone', {
        disabled: true,
      });
    }
    if (email) {
      form.setFieldState('linkmanEmail', {
        disabled: true,
      });
    }
  }, [mobile, form, email, areaCode]);

  useEffect(() => {
    apiCity().then(data => {
      form.query('area').take()?.setComponentProps({ options: data });
    });
    apiMnumListALLByDictTypeBatch({
      dictTypes: 'organizationIndustry,organizationScale',
    }).then(({ data }) => {
      const scaleField = form.query('scale').take();
      scaleField?.setComponentProps({
        options: (data.data.organizationScale || []).map(
          ({ dictLabel, dictValue }) => ({
            value: dictValue,
            label: dictLabel,
          }),
        ),
      });
    });
  }, [form]);

  const submit = async () => {
    try {
      setSubmitLoading(true);
      const { userId } = user.userInfo;
      const formValues = await form.submit<Record<string, any>>();
      const { data } = await apiAddCompany({
        ...formValues,
        area: JSON.stringify((formValues as { area: string[] }).area),
        industry: (formValues.industry || []).join(','),
        userId,
        linkmanPhoneCode: formValues?.linkmanPhone?.areaCode,
        linkmanPhone:
          formValues?.linkmanPhone?.phone_number?.match(/\d+/g)?.[0],
      } as unknown as Parameters<typeof apiAddCompany>[0]);

      dispatch({
        type: SET_COMPANY_USER_INFO,
        payload: {
          haveCompany: true,
        },
      });
      const { companyId } = (data as unknown as { data: { companyId: string } })
        .data;

      await switchCompany({ companyId, dispatch, history });
      history.push(RouteMaps.workIndex);
      window.location.reload();
    } finally {
      setTimeout(() => {
        setSubmitLoading(false);
      }, 500);
    }
  };

  const extraItems = {
    linkmanName: {
      type: 'string',
      title: I18N.system.name,
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        placeholder: I18N.carbonFootprint.pleaseEnter,
      },
      'x-validator': [
        {
          required: true,
          message: I18N.system.pleaseEnterYourName,
        },
      ],
    },
    linkmanPhone: {
      type: 'string',
      title: I18N.dashborad.mobilePhoneNumber,
      'x-decorator': 'FormItem',
      'x-component': 'FormilyAreaCodeInput',
      'x-component-props': {
        placeholder: I18N.carbonFootprint.pleaseEnter,
        // disabled: true,
        // addonBefore: '+86',
      },
      'x-validator': [
        {
          required: true,
          message: I18N.system.pleaseEnterYourPhoneNumber,
        },
      ],
    },
    linkmanEmail: {
      type: 'string',
      title: I18N.carbonFootprint.mailbox,
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        placeholder: I18N.carbonFootprint.pleaseEnter,
      },
      'x-validator': [
        {
          required: true,
          message: I18N.dashborad.pleaseEnterYourEmailAddress,
        },
        (val: string) =>
          checkEmail(val) ? '' : I18N.system.emailFormatIsIncorrect,
      ],
    },
  };

  const addItems = simple ? {} : extraItems;

  return (
    <div className={styles.createTrialOrg}>
      <div
        className={classNames(styles.formContent, {
          [styles.simple]: simple,
        })}
      >
        <div>
          <div className={styles.title}>{I18N.components.newEnterprise}</div>
          <div className={styles.subTitle}>
            {I18N.system.freeTrialAvailable}
            <span className={styles.highlight}>7</span> {I18N.work.day}
          </div>
        </div>
        <FormilyCommon form={form} className={styles.formilyCommon}>
          <SchemaField
            schema={{
              type: 'object',

              properties: {
                layout: {
                  type: 'void',
                  'x-component': 'FormLayout',
                  'x-component-props': {
                    layout: 'vertical',
                    colon: false,
                  },
                  properties: {
                    grid: {
                      type: 'void',
                      'x-component': 'FormGrid',
                      'x-component-props': {
                        maxColumns: 2,
                        columnGap: 24,
                      },
                      properties: {
                        ...addItems,
                        companyName: {
                          type: 'string',
                          title: I18N.dashborad.enterpriseName,
                          'x-decorator': 'FormItem',
                          'x-component': 'Input',
                          'x-component-props': {
                            placeholder: I18N.carbonFootprint.pleaseEnter,
                          },
                          'x-validator': [
                            {
                              required: true,
                              message: I18N.system.pleaseEnterTheCompany,
                            },
                            { max: 100, message: I18N.system.upToInput },
                          ],
                        },
                        industry: {
                          type: 'string',
                          ...initFormilyCascader(
                            I18N.dashborad.industry,
                            true,
                            {
                              placeholder:
                                I18N.dashborad.pleaseSelectTheAffiliation,
                              // fieldNames: { label: 'dictLabel', value: 'dictValue', children: 'enumList' },
                            },
                          ),
                        },
                        area: {
                          type: 'string',
                          title: I18N.system.location,
                          'x-decorator': 'FormItem',
                          'x-component': 'Cascader',
                          'x-component-props': {
                            placeholder: I18N.carbonFootprint.pleaseSelect,
                            fieldNames: { value: 'code', label: 'name' },
                          },
                          'x-validator': [
                            {
                              required: true,
                              message: I18N.system.pleaseSelectTheLocation,
                            },
                          ],
                        },
                        scale: {
                          type: 'string',
                          title: I18N.dashborad.enterpriseScale,
                          'x-decorator': 'FormItem',
                          'x-component': 'Select',
                          'x-component-props': {
                            className: styles.scaleRadio,
                            placeholder: I18N.carbonFootprint.pleaseSelect,
                          },
                          'x-validator': [
                            {
                              required: true,
                              message: I18N.dashborad.pleaseSelectACompany,
                            },
                          ],
                        },
                      },
                    },
                  },
                },
              },
            }}
          />
        </FormilyCommon>
        <div className={styles.formButtons}>
          <Button
            type='default'
            style={{
              minWidth: '76px',
            }}
            onClick={() => (simple ? onCancel() : logout())}
          >
            {simple
              ? I18N.carbonFootprint.cancel
              : I18N.components.logOutAndLogIn}
          </Button>
          <Button loading={submitLoading} type='primary' onClick={submit}>
            {I18N.system.createAndEnter}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateTrialOrg;
