import {
  FormLayout,
  FormGrid,
  FormItem,
  Radio,
  Input,
  Cascader,
  Select,
  DatePicker,
  TreeSelect,
  NumberPicker,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { Citys } from '@src/api/types';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import Permission from '@src/components/Permission';
import { useCityInfo } from '@src/hooks/useCityInfo';
import I18N from '@src/lang/I18N';
import { listALLByDictTypeBatchUsingGET1CDictEnumControllerApi } from '@src/sdks/java/management';
import { getUserInfo } from '@src/utils';
import { apiListALLByDictTypeData } from '@src/views/emission/Show/service';
import { Dicts } from '@src/views/emission/Show/type';
import { useRequest } from 'ahooks';
import { Spin, Button } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';

import styles from './index.module.less';
import { baseInfoSchema, contactInfoSchema } from './schema';
import {
  getUserList,
  apiQueryByCompanyId,
  editCompanyOrgCompany,
} from '../../services';
import { formatEmployInfo } from '../utils';

interface InfoFormProps {
  refresh: () => void;
}

interface FormValues {
  orgName: string;
  pid: number;
  superiorsShares: number;
  orgArea: string[];
  orgIndustry: string;
  orgClassify: string;
  linkmanUserid: string;
  area: string[];
  industry: string[];
}

const SchemaField = createSchemaField({
  // 组件列表
  components: {
    FormLayout,
    FormGrid,
    FormItem,
    Radio,
    Input,
    Cascader,
    Select,
    DatePicker,
    TreeSelect,
    NumberPicker,
  },
});

function TransformCityData(cityData: Citys[]) {
  return cityData.map(item => ({
    ...item,
    label: item.name,
    value: item.code,
    children: item.children ? TransformCityData(item.children) : [],
  }));
}

type BusinessType = {
  dictLabel: string;
  dictValue: string;
  enumList: BusinessType[];
};

function TransformBusinessData(cityData: BusinessType[]) {
  return cityData.map(item => ({
    ...item,
    label: item.dictLabel,
    value: item.dictValue,
    children: item.enumList ? TransformBusinessData(item.enumList) : [],
  }));
}

export const CompanyInfo: FC<InfoFormProps> = props => {
  const { refresh } = props;
  const [readPretty, setReadPretty] = useState(true);
  const [loading, setLoading] = useState(false);

  const userInfo = getUserInfo();
  const companyId = userInfo?.userInfo.companyId;
  const [originInfo, setOriginInfo] = useState<any>({});

  const Form = useMemo(
    () =>
      createForm<FormValues>({
        readPretty: false,
      }),
    [],
  );

  useEffect(() => {
    Form.setFormState({
      readPretty,
    });
  }, [readPretty, Form]);

  const getCompanyInfo = async () => {
    const info = await apiQueryByCompanyId({ id: companyId! });
    const values = info.data.data;

    setOriginInfo({
      ...values,
      area: JSON.parse(values?.area),
      industry: values.industry?.split(','),
    });
    Form.setValues({
      ...values,
      area: JSON.parse(values?.area),
      industry: values.industry?.split(','),
    });
  };

  const cityData = useCityInfo();

  useEffect(() => {
    getCompanyInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, Form]);

  const { data: userList } = useRequest(() => getUserList());

  useEffect(() => {
    Form.setFieldState('.area', {
      dataSource: TransformCityData(cityData),
    });
  }, [cityData, Form]);

  const { data: enumData } = useRequest(() =>
    listALLByDictTypeBatchUsingGET1CDictEnumControllerApi(
      'organizationScale,orgClassify',
    ),
  );
  const { data: business } = useRequest(() =>
    apiListALLByDictTypeData({
      dictType: 'business',
    }),
  );

  useEffect(() => {
    Form.setFieldState('.industry', {
      dataSource: TransformBusinessData(business?.data?.data || []),
    });
  }, [business, Form]);
  useEffect(() => {
    const { orgClassify, organizationScale } = (enumData?.data?.data || {}) as {
      orgClassify: Dicts[];
      organizationScale: Dicts[];
    };

    Form.setFieldState('.orgClassify', {
      dataSource: orgClassify,
    });
    Form.setFieldState('.scale', {
      dataSource: organizationScale,
    });
  }, [enumData, Form]);

  useEffect(() => {
    Form.setFieldState('.linkmanUserid', {
      dataSource: userList?.data?.map(item => ({
        ...item,
        value: item.userId,
        label: formatEmployInfo(item),
      })),
    });
  }, [userList, Form]);
  const onSubmit = async () => {
    setLoading(true);
    try {
      await Form.validate();
      const formValue = await Form.submit<FormValues>();
      await editCompanyOrgCompany({
        ...formValue,
        area: JSON.stringify(formValue.area),
        industry: formValue.industry.join(','),
      });
      getCompanyInfo();
      setReadPretty(true);
      refresh();
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={styles.infoWrapper}>
      <Spin spinning={false}>
        <FormilyCommon form={Form}>
          <div>
            <div className={styles.titleWrapper}>
              <div className={styles.title}>
                {I18N.carbonFootprint.basicInformation}
              </div>
              <div className={styles.btnWrapper}>
                {readPretty && (
                  <Permission flag='management:companyOrg:edit'>
                    <Button onClick={() => setReadPretty(false)}>
                      {I18N.carbonFootprint.edit}
                    </Button>
                  </Permission>
                )}
                {!readPretty && (
                  <>
                    <Button
                      onClick={() => onSubmit()}
                      type='primary'
                      loading={loading}
                    >
                      {I18N.carbonFootprint.preserve}
                    </Button>
                    <Button
                      onClick={() => {
                        Form.setValues(originInfo);
                        setReadPretty(true);
                      }}
                    >
                      {I18N.carbonFootprint.cancel}
                    </Button>
                  </>
                )}
              </div>
            </div>
            <SchemaField schema={baseInfoSchema()} />
            <div className={styles.title}>
              {I18N.dashborad.contactInformation}
              <span className={styles.extra}>
                {I18N.dashborad.usedForInterOrganizationalCommunication}
              </span>
            </div>
            <SchemaField schema={contactInfoSchema()} />
          </div>
        </FormilyCommon>
      </Spin>
    </div>
  );
};
