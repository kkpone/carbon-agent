import { CloseOutlined } from '@ant-design/icons';
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
import { FormActions } from '@src/components/FormActions';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import { FormilyUploadCrop } from '@src/components/FormilyUtil/FormilyUploadCrop';
import { checkPermissions } from '@src/components/Permission/utils';
import I18N from '@src/lang/I18N';
import { ApicarbonSceneManagementListGet } from '@src/views/carbonAccount/sceneManagement/srvice';
import FormilyImgUpload from '@src/views/carbonFootprint3/component/FormilyImgUpload';
import { Drawer } from 'antd';
import { pick } from 'lodash-es';
import { useState, useMemo, useEffect } from 'react';

import styles from './index.module.less';
import { baseSchema } from './schema';
import { addCertificate, certificateUpdate } from '../../service';

const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormGrid,
    Input,
    Select,
    Cascader,
    FormilyImgUpload,
    FormilyUploadCrop,
    DatePicker,
    ArrayItems,
    NumberPicker,
    Radio,
  },
});

type CertificateDrawerProps = {
  drawerVisible: boolean;
  setDrawerVisible: (visible: boolean) => void;
  initialValues?: any;
  refresh: () => void;
};

export const CertificateDrawer = (props: CertificateDrawerProps) => {
  // const [drawerVisible, setDrawerVisible] = useState(false);
  const { drawerVisible, setDrawerVisible, initialValues, refresh } = props;

  const isEdit = useMemo(() => !!initialValues, [initialValues]);

  const hasEditPermissions = checkPermissions(
    true,
    'carbonAccount:certificate:edit',
  );

  const hasAddPermissions = checkPermissions(
    true,
    'carbonAccount:certificate:add',
  );

  const formProduct = useMemo(
    () =>
      createForm({
        readPretty:
          (isEdit && !hasEditPermissions) || (!isEdit && !hasAddPermissions),
        initialValues: initialValues || {
          customType: 1,
          limitType: '2',
          sceneName: '',
          orderNum: '',
          sceneClassify: undefined,
          sceneIcon: undefined,
          showType: 1,
        },
      }),
    [drawerVisible],
  );
  const submit = async () => {
    const data = (await formProduct.submit()) as any;
    if (isEdit) {
      await certificateUpdate({
        ...data,
        unlockPic: data.unlockPic[0].url,
        stylePic: data.stylePic[0].url,
        id: initialValues.id,
        conditionList: data.conditionList.map(item =>
          pick(item, ['sceneId', 'conditionValue']),
        ),
      });
    } else {
      await addCertificate({
        ...data,
        unlockPic: data.unlockPic[0].url,
        stylePic: data.stylePic[0].url,
      });
    }
    setDrawerVisible(false);
    refresh();
  };

  const [managementList, setManagementList] = useState<any[]>([]);

  useEffect(() => {
    const getList = async () => {
      const data = (await ApicarbonSceneManagementListGet({
        page: 1,
        size: 10000,
      })) as any;
      setManagementList(data.data.data.rows);
      formProduct.setFieldState('conditionList.*.sceneId', state => {
        state.dataSource = data.data.data.rows.map(item => ({
          label: item.sceneName,
          value: item.id,
        }));
      });
    };
    getList();
  }, [formProduct]);

  const useGetState = e =>
    managementList.find(item => item.id === e)?.sceneUnitName;
  return (
    <div>
      <Drawer
        width={580}
        closable={false}
        bodyStyle={{ paddingBottom: 60 }}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        <div className={styles.title}>
          <h3>{I18N.carbonAccount.addCertificate}</h3>
          <div className={styles.close} onClick={() => setDrawerVisible(false)}>
            <CloseOutlined />
          </div>
        </div>
        <FormilyCommon form={formProduct}>
          <div>
            <SchemaField schema={baseSchema()} scope={{ useGetState }} />
          </div>
        </FormilyCommon>
        <FormActions
          width={580}
          place='center'
          buttons={
            (isEdit && hasEditPermissions) || hasAddPermissions
              ? [
                  {
                    title: I18N.components.submit,
                    type: 'primary',
                    onClick: async () => submit(),
                  },
                  {
                    title: I18N.carbonFootprint.return,
                    onClick: async () => setDrawerVisible(false),
                  },
                ]
              : [
                  {
                    title: I18N.carbonFootprint.return,
                    onClick: async () => setDrawerVisible(false),
                  },
                ]
          }
        />
      </Drawer>
    </div>
  );
};
