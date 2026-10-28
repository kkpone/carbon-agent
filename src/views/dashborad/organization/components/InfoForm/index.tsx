import {
  FormLayout,
  FormGrid,
  Radio,
  Input,
  Cascader,
  Select,
  DatePicker,
  TreeSelect,
  NumberPicker,
  FormItem,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { FormActions } from '@src/components/FormActions';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import Permission from '@src/components/Permission';
import { useCityInfo } from '@src/hooks/useCityInfo';
import I18N from '@src/lang/I18N';
import { PageInfoType } from '@src/router/type';
import { listALLByDictTypeBatchUsingGET1CDictEnumControllerApi } from '@src/sdks/java/management';
import { Dicts } from '@src/views/emission/Show/type';
import { useRequest } from 'ahooks';
import { Spin, Button } from 'antd';
import { isUndefined } from 'lodash-es';
import { FC, useEffect, useMemo, useState } from 'react';

import { apiListALLByDictTypeData } from '@/views/emission/Show/service';

import styles from './index.module.less';
import {
  baseInfoSchema,
  additionalInfoSchema,
  contactInfoSchema,
} from './schema';
import {
  getUserList,
  AddCompanyOrg,
  OrgType,
  getCompanyOrgInfo,
  editCompanyOrg,
} from '../../services';
import { useOrgTreeData } from '../hooks';
import { formatEmployInfo } from '../utils';

interface InfoFormProps {
  pageType: PageInfoType;
  orgType: OrgType;
  orgId?: string;
  initPid?: number;
  onHide?: () => void;
  refresh: () => void;
  initOrgIndustry?: string;
}

interface FormValues {
  orgName: string;
  pid: number;
  superiorsShares: number;
  orgArea: string[];
  orgIndustry: string[];
  orgClassify: string;
  linkmanUserid: string;
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

const transFormCar = (data: Dicts[]) =>
  data.map(item => ({
    ...item,
    value: item.dictValue,
    label: item.dictLabel,
    children: item.enumList ? transFormCar(item.enumList) : [],
  }));

export const InfoForm: FC<InfoFormProps> = props => {
  const {
    pageType,
    orgType,
    orgId,
    initPid,
    onHide,
    refresh,
    initOrgIndustry,
  } = props;
  const isAdd = pageType === PageInfoType.add;

  const [treeData] = useOrgTreeData();
  const [loading, setLoading] = useState(false);
  const [readPretty, setReadPretty] = useState(!isAdd);
  const [originInfo, setOriginInfo] = useState<any>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (!isAdd) {
      setReadPretty(true);
    }
  }, [orgId, isAdd]);

  const Form = useMemo(
    () =>
      createForm<FormValues>({
        readPretty,
        initialValues: {
          superiorsShares: 100,
        },
      }),
    [],
  );

  useEffect(() => {
    Form.setFormState({
      readPretty,
    });
  }, [readPretty, Form]);

  const getInfo = async () => {
    setLoading(true);
    try {
      const info = await getCompanyOrgInfo({ id: orgId });
      const values = info.data.data;
      setOriginInfo({
        ...values,
        orgArea: JSON.parse(values.orgArea),
        orgIndustry: values.orgIndustry?.split(',') || [],
      });
      Form.setValues({
        ...values,
        orgArea: JSON.parse(values.orgArea),
        orgIndustry: values.orgIndustry?.split(',') || [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdd && !isUndefined(orgId)) {
      getInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdd, orgId, Form]);

  useEffect(() => {
    Form.setValuesIn('.pid', initPid);
  }, [initPid, Form]);

  useEffect(() => {
    Form.setValuesIn('.orgIndustry', initOrgIndustry?.split(','));
  }, [initOrgIndustry, Form]);

  const { data: userList } = useRequest(() => getUserList());

  useEffect(() => {
    Form.setFieldState('.pid', {
      dataSource: treeData,
    });
  }, [treeData, Form]);

  const cityData = useCityInfo();

  useEffect(() => {
    Form.setFieldState('.orgArea', {
      dataSource: cityData,
    });
  }, [cityData, Form]);

  const { data: enumData } = useRequest(() =>
    listALLByDictTypeBatchUsingGET1CDictEnumControllerApi(
      'organizationIndustry,orgClassify',
    ),
  );

  const { data: businessData } = useRequest(() =>
    apiListALLByDictTypeData({
      dictType: 'business',
    }),
  );

  useEffect(() => {
    Form.setFieldState('.orgIndustry', {
      dataSource: transFormCar(businessData?.data.data || []),
    });
  }, [businessData, Form]);
  useEffect(() => {
    const { orgClassify } = (enumData?.data?.data || {}) as {
      organizationIndustry: Dicts[];
      orgClassify: Dicts[];
      organizationScale: Dicts[];
    };
    Form.setFieldState('.orgClassify', {
      dataSource: orgClassify,
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
    setSubmitLoading(true);
    try {
      await Form.validate();
      const values2 = await Form.submit<FormValues>();
      if (isAdd) {
        await AddCompanyOrg({
          ...values2,
          orgType,
          orgArea: JSON.stringify(values2.orgArea),
          orgIndustry: values2.orgIndustry?.join(','),
        });
        refresh();
        onHide?.();
      } else {
        await editCompanyOrg({
          ...values2,
          orgType,
          orgArea: JSON.stringify(values2.orgArea),
          orgIndustry: values2.orgIndustry?.join(','),
        });
        setReadPretty(true);
        refresh();
      }
    } finally {
      setSubmitLoading(false);
    }
  };
  return (
    <div className={styles.infoForm}>
      <Spin spinning={loading}>
        <FormilyCommon form={Form}>
          <div>
            <div className={styles.titleWrapper}>
              <div className={styles.title}>
                {I18N.carbonFootprint.basicInformation}
              </div>
              <div className={styles.btnWrapper}>
                {!isAdd && readPretty && (
                  <Permission flag='management:companyOrg:edit'>
                    <Button onClick={() => setReadPretty(false)}>
                      {I18N.carbonFootprint.edit}
                    </Button>
                  </Permission>
                )}
                {!isAdd && !readPretty && (
                  <>
                    <Button
                      onClick={() => onSubmit()}
                      type='primary'
                      loading={submitLoading}
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
              {I18N.dashborad.supplementaryInformation}
              <span className={styles.extra}>
                {I18N.dashborad.optionalForGroup2}
              </span>
            </div>
            <SchemaField schema={additionalInfoSchema()} />
            <div className={styles.title}>
              {I18N.dashborad.contactInformation}
              <span className={styles.extra}>
                {I18N.dashborad.optionalForGroup}
              </span>
            </div>
            <SchemaField schema={contactInfoSchema()} />
          </div>
        </FormilyCommon>
        {isAdd && (
          <div>
            <FormActions
              width={708}
              place='center'
              buttons={[
                {
                  type: 'primary',
                  title: I18N.carbonFootprint.confirm2,
                  onClick: async () => onSubmit(),
                },
                {
                  title: I18N.carbonFootprint.cancel,
                  onClick: () => onHide?.(),
                },
              ]}
            />
          </div>
        )}
      </Spin>
    </div>
  );
};
