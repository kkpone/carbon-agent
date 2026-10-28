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
  Checkbox,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { useRequest } from 'ahooks';
import { Modal } from 'antd';
import { FC, useContext, useMemo, useState } from 'react';
import I18N, { LocaleType } from 'src/lang/I18N';

import logoPng from '@/assets/images/logo.png';
import EnLogoPng from '@/assets/images/logo_en.png';
import FormilyCommon from '@/components/FormilyUtil/FormilyCommon';
import { LocaleContext } from '@/components/LocaleProvider';
import { SelectLanguage } from '@/components/SelectLanguage';
import { IconAlibabaNew } from '@/components/iconfont';
import { Toast } from '@/utils/Toast';

import styles from './index.module.less';
import { baseInfoSchema } from './schema';
import { apiAddClew, getShowLanguageSwitch, SwitchState } from '../../service';

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
    Checkbox,
  },
});

interface ILoginPageHeaderProps {}

export const LoginPageHeader: FC<ILoginPageHeaderProps> = () => {
  const { locale } = useContext(LocaleContext);
  const [open, setOpen] = useState(false);

  const { data } = useRequest(() => getShowLanguageSwitch());

  const showSwitch = data?.data?.data?.multi_switch === SwitchState.show;

  const [confirmLoading, setConfirmLoading] = useState(false);

  const Form = useMemo(
    () =>
      createForm({
        readPretty: false,
      }),
    [locale, open],
  );

  const onOk = async () => {
    const value = await Form.submit<{}>();

    setConfirmLoading(true);
    await apiAddClew({ ...value, sourceType: 'login' }).finally(() =>
      setConfirmLoading(false),
    );
    Toast('success', I18N.carbonFootprint.submittedSuccessfully);

    setOpen(false);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.logo}>
        <img
          src={locale === LocaleType.enUS ? EnLogoPng : logoPng}
          alt=''
          className={styles.logoImg}
        />
      </div>
      <div className={styles.right}>
        {showSwitch && <SelectLanguage onlyFeSwitch compact />}
        <div className={styles.contactUs} onClick={() => setOpen(true)}>
          {/* <div className={styles.img} /> */}
          <IconAlibabaNew type='icon-icon-lianxiwomen' />
          <p>{I18N.system.contactUs}</p>
        </div>
      </div>
      <Modal
        okText={I18N.components.submit}
        confirmLoading={confirmLoading}
        width={744}
        title={I18N.system.contactUs}
        open={open}
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
        onOk={onOk}
      >
        <div className={styles.subTitle}>
          {I18N.system.leaveYourLetterBehind}
        </div>
        <FormilyCommon form={Form} className={styles.form}>
          <SchemaField
            key={`${locale}-contact-form`}
            schema={baseInfoSchema()}
          />
        </FormilyCommon>
      </Modal>
    </div>
  );
};
