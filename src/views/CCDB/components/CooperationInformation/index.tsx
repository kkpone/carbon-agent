import {
  FormButtonGroup,
  FormGrid,
  FormItem,
  Input,
  Submit,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { FormilyAreaCodeInput } from '@src/components/formily/components/AreaCodeInput/index';
import I18N from '@src/lang/I18N';
import { useRequest } from 'ahooks';
import { Button } from 'antd';
import { FC, useContext, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import FormilyCommon from '@/components/FormilyUtil/FormilyCommon';
import { LocaleContext } from '@/components/LocaleProvider';
import { GenerateFormValueType } from '@/components/formily/components/TypeUtils';
import { serviceLangMap } from '@/lang/I18N';
import { RouteMaps } from '@/router/route-paths';
import { RootState } from '@/store';
import { Toast } from '@/utils/Toast';
import { apiQueryByCompanyId } from '@/views/dashborad/organization/services';
import { apiAddClew, getAreaCode } from '@/views/system/login/service';

import styles from './index.module.less';
import { baseInfoSchema } from './schema';

const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormilyAreaCodeInput,
    FormGrid,
    Input,
  },
});

interface ICooperationInformationProps {}

type FormType = GenerateFormValueType<typeof baseInfoSchema>;

export const CooperationInformation: FC<ICooperationInformationProps> = () => {
  // console.log(props);

  const Form = useMemo(() => createForm<FormType>({}), []);

  const { locale } = useContext(LocaleContext);

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
    Form.setFieldState('.phonenumber', {
      dataSource: options,
    });
  }, [options, Form]);

  const userInfo = useSelector<RootState, RootState['companyUserInfo']>(
    s => s.companyUserInfo,
  )?.userInfo;

  const history = useHistory();

  useEffect(() => {
    const COMPANY_ID = localStorage.getItem('COMPANY_ID');
    apiQueryByCompanyId({ id: Number(COMPANY_ID) }).then(
      ({ data }) => {
        Form.setValuesIn('.orgName', data?.data?.companyName);
        const userName = userInfo?.username;
        Form.setValuesIn('.phonenumber', {
          phone_number: userName,
        });
        Form.setValuesIn('.clientName', userInfo?.user?.nickName);
        Form.setValuesIn('.email', userInfo?.email);
      },
      () => {},
    );
  }, [Form]);

  const SubmitInfo = async () => {
    await Form.validate();
    const FormInfo: FormType = await Form.submit();
    await apiAddClew({
      ...FormInfo,
      phonenumber: (FormInfo.phonenumber as any).phone_number,
      sourceType: 'CCDB_default',
    });
    Toast('success', I18N.carbonFootprint.submittedSuccessfully);
    history.push(`${RouteMaps.CCDBHome}?type=permission_denied`);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>
        {I18N.carbonFootprint.welcomeToCooperate}
      </div>
      <div className={styles.secondTitle}>
        {I18N.ccdb.youHaveNotSubscribedYet}
      </div>
      <FormilyCommon form={Form} className={styles.form}>
        <>
          <SchemaField schema={baseInfoSchema()} />
          <FormButtonGroup align='center'>
            <Submit
              style={{
                width: '256px',
              }}
              onSubmit={SubmitInfo}
              // onSubmitFailed={console.log}
            >
              {I18N.carbonFootprint.submitNow}
            </Submit>
          </FormButtonGroup>
          <FormButtonGroup
            align='center'
            style={{
              marginTop: '20px',
            }}
          >
            <Button
              onClick={() =>
                history.push(`${RouteMaps.CCDBHome}?type=permission_denied`)
              }
              type='text'
            >
              {I18N.error.returnToHomepage}
            </Button>
          </FormButtonGroup>
        </>
      </FormilyCommon>
    </div>
  );
};
