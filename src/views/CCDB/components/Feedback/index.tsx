import {
  FormGrid,
  FormItem,
  Input,
  Select,
  Cascader,
  DatePicker,
  ArrayItems,
  NumberPicker,
  Radio,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { useRequest } from 'ahooks';
import { Modal } from 'antd';
import {
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSelector } from 'react-redux';

import FormilyCommon from '@/components/FormilyUtil/FormilyCommon';
import { LocaleContext } from '@/components/LocaleProvider';
import { FormilyAreaCodeInput } from '@/components/formily/components/AreaCodeInput';
import { serviceLangMap } from '@/lang/I18N';
import { RootState } from '@/store';
import { Toast } from '@/utils/Toast';
import { apiQueryByCompanyId } from '@/views/dashborad/organization/services';
import { getAreaCode } from '@/views/system/login/service';

import styles from './index.module.less';
import { baseSchema } from './schema';

export type TFormType = {
  orgName: string;
  phonenumber: {
    phone_number: string;
  };
  clientName: string;
  email: string;
  remark: string;
};

interface IFeedbackProps {
  title?: string;
  onSubmit?: (value: TFormType) => Promise<void>;
  des?: string;
  type?: 'feedback' | 'mark';
}

const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormGrid,
    Input,
    Select,
    Cascader,
    DatePicker,
    ArrayItems,
    NumberPicker,
    Radio,
    FormilyAreaCodeInput,
  },
});

export const Feedback: FC<PropsWithChildren<IFeedbackProps>> = props => {
  const { children, title, des, type, onSubmit } = props;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { locale } = useContext(LocaleContext);

  const Form = useMemo(() => createForm<TFormType>(), [open]);

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

  const submit = async () => {
    const formData = await Form.submit<TFormType>();
    setLoading(true);
    if (formData) {
      await onSubmit?.(formData)
        .then(() => {
          Toast('success', I18N.carbonFootprint.submittedSuccessfully);
          setLoading(false);
          setOpen(false);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };
  return (
    <span
      onClick={e => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <Modal
        title={title}
        open={open}
        width={740}
        onOk={submit}
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
        confirmLoading={loading}
      >
        <div className={styles.des}>{des}</div>
        <FormilyCommon form={Form}>
          <div>
            <SchemaField schema={baseSchema(type)} />
          </div>
        </FormilyCommon>
      </Modal>
      <span
        onClick={e => {
          setOpen(true);
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        {children}
      </span>
    </span>
  );
};
