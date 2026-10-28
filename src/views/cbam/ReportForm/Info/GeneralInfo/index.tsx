/**
 * @description 一般信息
 */
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import {
  Form,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Select,
  DatePicker,
  Radio,
} from '@formily/antd-v5';
import { createForm, onFieldValueChange } from '@formily/core';
import { createSchemaField, FormConsumer } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button, Descriptions, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { compact, isNumber } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

import { FormActions } from '@/components/FormActions';
import { InfoTitle } from '@/components/InfoTitle';
import { useCbamPageInfo } from '@/views/cbam/ReportForm/Info/context';
import { omitInfoFn, Toast } from '@/utils';
import { ORG_STATUS } from '@/utils/const';
import { getFactoryDetail } from '@/views/cbam/FactoryInformation/service';
import { useCbamOrgs, useFactoryList } from '@/views/cbam/hook';
import { useAllEnumsBatch } from '@/views/dashborad/Dicts/hooks';

import style from './index.module.less';
import { baseSchema, factorySchema, verificationAgencySchema } from './schemas';
import {
  getGeneralInfoDetail,
  postGeneralInfoAdd,
  putGeneralInfoEdit,
} from '../../service';

const SchemaField = createSchemaField({
  components: {
    Input,
    Select,
    DatePicker,
    Radio,
    Form,
    FormItem,
    FormGrid,
    FormLayout,
  },
});

interface GeneralInfoProps {
  /** 下一步方法 */
  onClickNextStep: ({ reportId }: { reportId?: number }) => void;
  /** 返回方法 */
  onClickBack: () => void;
  /** 是否是CBAM跳转 */
  isCbamInfo?: boolean;
}

const GeneralInfo = ({
  onClickNextStep,
  onClickBack,
  isCbamInfo,
}: GeneralInfoProps) => {
  const { isDetail, id } = useCbamPageInfo();

  /** 所属组织枚举 */
  const orgList = useCbamOrgs();

  const enumOptions = useAllEnumsBatch('CBAMcountryinfo');
  /** 国家名称枚举 */
  const countryCodeList = enumOptions?.CBAMcountryinfo;

  /** 工厂枚举 */
  const factoryList = useFactoryList();

  const form = useMemo(
    () =>
      createForm({
        readPretty: isDetail,
        effects: () => {
          /** 切换工厂 设置工厂信息 */
          onFieldValueChange('factoryId', field => {
            if (field?.selfModified) {
              const currentFactoryId = field?.value || 0;

              if (currentFactoryId) {
                getFactoryDetail({ id: currentFactoryId }).then(({ data }) => {
                  const result = data?.data || {};
                  /** 工厂信息 */
                  form.setValuesIn('factory', { ...result });
                });
              }
            }
          });
        },
      }),
    [isDetail],
  );

  /** 展开/收起 验证机构 */
  const [expandOther, setExpandOther] = useState(false);

  /** 保存按钮的loading */
  const [saveBtnLoading, setSaveBtnLoading] = useState(false);

  /** 保存的接口 */
  const saveApi = id ? putGeneralInfoEdit : postGeneralInfoAdd;

  /** 设置枚举值 */
  useEffect(() => {
    if (orgList) {
      /** 所属组织 */
      form.setFieldState('orgId', {
        dataSource: orgList.map(item => ({
          label: item.orgName,
          value: item.id,
          disabled: item.orgStatus === ORG_STATUS.DISABLE,
        })),
      });
    }

    /** 选择工厂 */
    if (factoryList) {
      form.setFieldState('factoryId', {
        dataSource: factoryList?.map(factory => ({
          ...factory,
          label: factory.factorName,
          value: factory.id,
        })),
      });
    }
    /** 国家 */
    if (countryCodeList) {
      form.setFieldState('verification.country', {
        dataSource: countryCodeList?.map(item => ({
          ...item,
          label: item.dictLabel,
          value: item.dictValue,
        })),
      });
    }
  }, [orgList, factoryList, countryCodeList]);

  /** 获取详情 */
  useEffect(() => {
    if (id) {
      getGeneralInfoDetail({ id }).then(({ data }) => {
        const result = data?.data || {};

        form.setValues({
          ...result,
        });

        if (isDetail) {
          const { startDate, endDate } = result;
          /** 修复详情显示错误 */
          form.setValues({
            ...result,
            startDate: dayjs(startDate, 'DD.MM.YYYY'),
            endDate: dayjs(endDate, 'DD.MM.YYYY'),
          });
        }
      });
    }
  }, [id, isDetail]);

  return (
    <div className={style.infoWrapper}>
      <Form form={form} previewTextPlaceholder='-'>
        <SchemaField schema={baseSchema()} />

        <InfoTitle title={I18N.cbam.factoryInformation} />
        <SchemaField schema={factorySchema()} />
        <FormConsumer>
          {currentForm => {
            /** 选择的工厂信息 */
            const selectedFactoryInfo = currentForm.getValuesIn('factory');

            const {
              factorName,
              factoryNameEn,
              detailedAddress,
              economicActivity,
              postalCode,
              postOfficeBox,
              city,
              countryName,
              locationCode,
              longitude,
              latitude,
              authorizedRepresentative,
              email,
              mobile,
            } = selectedFactoryInfo || {};

            /** 展示信息列表 */
            const showInfoList = [
              {
                label: I18N.cbam.factoryName,
                value: factorName,
              },
              {
                label: I18N.cbam.factoryNameInEnglish,
                value: factoryNameEn,
              },
              {
                label: I18N.carbonFootPrintLCA.detailedAddress,
                value: detailedAddress,
              },
              {
                label: I18N.cbam.economicActivity,
                value: economicActivity,
              },
              {
                label: I18N.cbam.postalCode,
                value: postalCode,
              },
              {
                label: I18N.cbam.postOfficeBox,
                value: postOfficeBox,
              },
              {
                label: I18N.cbam.city,
                value: city,
              },
              {
                label: I18N.cbam.country,
                value: countryName,
              },
              {
                label: I18N.cbam.locationCode,
                value: locationCode,
              },
              {
                label: I18N.cbam.longitude,
                value: longitude,
              },
              {
                label: I18N.cbam.latitude,
                value: latitude,
              },
              {
                label: I18N.cbam.authorizedRepresentativeSurname,
                value: authorizedRepresentative,
              },
              {
                label: I18N.cbam.eMail,
                value: email,
              },
              {
                label: I18N.cbam.telephone,
                value: mobile,
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

        <div className={style.aHeader}>
          <InfoTitle title={I18N.cbam.verificationAgency} />
          <Button
            type='link'
            onClick={() => {
              setExpandOther(!expandOther);
            }}
          >
            {expandOther ? (
              <div className={style.expandBtn}>
                {I18N.cbam.putItAway}
                <UpOutlined />
              </div>
            ) : (
              <div className={style.expandBtn}>
                {I18N.cbam.open}
                <DownOutlined />
              </div>
            )}
          </Button>
        </div>
        <div hidden={!expandOther}>
          <SchemaField schema={verificationAgencySchema()} />
        </div>
      </Form>

      <FormActions
        place='center'
        buttons={compact([
          !isDetail && {
            title: I18N.Factors.saveNextStep,
            type: 'primary',
            loading: saveBtnLoading,
            onClick: async () => {
              const values = await form.submit<GeneralInfoProps>();

              setSaveBtnLoading(true);

              try {
                const result = omitInfoFn(values);

                const { data } = await saveApi(result);
                Toast('success', I18N.Factors.saveSuccessful);
                onClickNextStep({
                  reportId: isNumber(data?.data) ? data?.data : id,
                });
              } finally {
                setSaveBtnLoading(false);
              }
            },
          },
          (!isDetail || isCbamInfo) && {
            title: I18N.Factors.return,
            onClick: async () => {
              onClickBack();
            },
          },
        ])}
      />
    </div>
  );
};

export default GeneralInfo;
