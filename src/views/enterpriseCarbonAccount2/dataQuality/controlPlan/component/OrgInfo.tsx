/*
 * @@description:组织信息
 * @Author: wangjiahui qifeng@carbonstop.net
 * @Date: 2022-11-07 10:51:29
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2022-11-29 15:12:37
 */

import I18N from '@src/lang/I18N';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { formPropsInit } from '@src/components/FormUtil/util';
import { FormProps } from 'antd/lib/form';
import { useEffect, useState } from 'react';
import { Button, Form } from 'antd';
import '../../../style.less';
// import { apiAddressTree } from '@src/views/greenMeeting/service';
import { JavaUpload } from '@src/components/Upload/JavaUpload';
import { PlusOutlined } from '@ant-design/icons';
import { FormActions } from '@src/components/FormActions';
// import { listALLByDictTypeBatchUsingGET1CDictEnumControllerApi } from '@src/sdks/java/management';
// import { Dicts } from '@src/views/emission/Show/type';
import { PropsType } from '@src/views/enterpriseCarbonAccount2/service';
import { RcFile } from 'antd/lib/upload';
import { Toast } from '@src/utils/Toast';

export const OrgInfo = (props: PropsType) => {
  const [form] = Form.useForm();
  // const [cityList, setCityList] = useState([]);
  const [canEdit, setCanEdit] = useState(false);
  const [orgImgs, setOrgImgs] = useState<any[]>([]);
  const [gasGroupImgList, setgasGroupImgList] = useState<any[]>([]);
  // const [industry, setIndustry] = useState<Dicts[]>();
  /** 基础信息表单 */
  const basicsFormProps: FormProps = {
    ...formPropsInit(),
    form,
    layout: 'vertical',
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };

  // const get
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    props?.data?.planeImgList && setOrgImgs(props?.data?.planeImgList);
    props?.data?.gasGroupImgList &&
      setgasGroupImgList(props.data?.gasGroupImgList);

    const registerCode = props?.data?.registerCode?.split(',');
    const productionCode = props?.data?.productionCode?.split(',');

    form.setFieldsValue({
      ...props.data,
      registerCode: registerCode?.map(num => Number(num)),
      productionCode: productionCode?.map(num => Number(num)),
    });
  }, [props]);

  const formItems: any = [
    {
      label: I18N.carbonFootprint3.organizationName,
      name: 'companyName',
      type: 'input',
      rules: false,
      placeholder: '\n',
      col: 8,
      props: {
        disabled: true,
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.industry,
      name: 'industry',
      placeholder: '\n',
      type: 'select',
      rules: false,
      col: 8,
      props: {
        options: props.industry?.map(item => ({
          value: item.dictValue,
          label: item.dictLabel,
        })),
        disabled: true,
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.responsibleForCarbonInventoryCheck,
      name: 'dept',
      placeholder: canEdit ? I18N.carbonFootprint.pleaseEnter : '\n',
      type: 'input',
      rules: canEdit,
      col: 8,
      props: {
        disabled: !canEdit,
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.registeredAddress,
      name: 'registerCode',
      type: 'cascader',
      rules: canEdit,
      placeholder: canEdit ? I18N.carbonFootprint.pleaseSelect : '\n',
      col: 8,
      props: {
        changeOnSelect: true,
        fieldNames: { label: 'name', value: 'code', children: 'children' },
        options: props?.cityList,
        disabled: !canEdit,
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.registeredAddressDetails,
      name: 'registerAddress',
      type: 'input',
      rules: canEdit,
      placeholder: canEdit ? I18N.carbonFootprint.pleaseEnter : '\n',
      col: 16,
      props: {
        disabled: !canEdit,
      },
    },

    {
      label: I18N.enterpriseCarbonAccount2.productionAndOperationLocation2,
      name: 'productionCode',
      placeholder: canEdit ? I18N.carbonFootprint.pleaseSelect : '\n',
      type: 'cascader',
      rules: canEdit,
      col: 8,
      props: {
        // defaultValue: [140000, 140300, 140311],
        // defaultValue: form.getFieldValue('productionCode'),
        // value: form.getFieldValue('productionCode'),
        // value: [140000, 140300, 140311],
        fieldNames: { label: 'name', value: 'code', children: 'children' },
        options: props?.cityList,
        disabled: !canEdit,
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.productionAndOperationLocation,
      name: 'productionAddress',
      type: 'input',
      rules: canEdit,
      placeholder: canEdit ? I18N.carbonFootprint.pleaseEnter : '\n',
      col: 16,
      props: {
        disabled: !canEdit,
      },
    },
    {
      label: I18N.carbonFootprint3.companyIntroduction,
      name: 'intro',
      type: 'textArea',
      rules: canEdit,
      placeholder: canEdit ? I18N.carbonFootprint.pleaseEnter : '\n',
      col: 24,
      props: {
        disabled: !canEdit,
        rows: 5,
        maxLength: 1000,
        showCount: true,
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.organizationalPlanDisplay2,
      name: 'planeImgList',
      type: 'render',
      rules: false,
      placeholder: I18N.carbonFootprint.pleaseEnter,
      col: 24,
      render() {
        const maxCount = 5;

        return (
          <>
            <span className='tip'>{I18N.enterpriseCarbonAccount2.supportsLessThanM}</span>
            {!canEdit && orgImgs.length === 0 ? (
              // <div style={{ height: 100, color: '#999999' }}>暂无图片</div>
              <div className='ant-upload ant-upload-select ant-upload-select-picture-card picture-card-disabled'>
                <span className='ant-upload'>
                  <div style={{ color: '#999EA4' }}>
                    <PlusOutlined />
                    <div style={{ marginTop: '8px' }}>{I18N.carbonFootprint.uploadImages}</div>
                  </div>
                </span>
              </div>
            ) : (
              <JavaUpload
                disabled={!canEdit}
                maxCount={maxCount}
                fileList={orgImgs}
                listType='picture-card'
                maxSize={5 * 1024 * 1024}
                onFileCountChange={(flie: RcFile) => {
                  const { type } = flie;

                  const isFormat =
                    type === 'image/jpeg' ||
                    type === 'image/png' ||
                    type === 'image/jpg' ||
                    type === 'image/gif';

                  if (!isFormat) {
                    Toast('warn', I18N.carbonFootprint.fileFormatIsIncorrect);
                    return true;
                  }

                  if (orgImgs.length >= 5) {
                    Toast('warn', I18N.carbonFootprint.maximumNumberOfFiles);
                    return true;
                  }
                  return false;
                }}
                onChange={(file: any) => {
                  const newArr = file.fileList.map((item, index) => {
                    if (item.status === 'done' && item.originFileObj) {
                      if (item.response.code === 200) {
                        return { ...item.response.data, uid: index };
                      }
                    }
                    return item;
                  });

                  setOrgImgs([...newArr]);
                }}
                onRemove={(e: any) => {
                  orgImgs.forEach((item: { uid: string }, index: number) => {
                    if (item.uid === e.uid) {
                      orgImgs.splice(index, 1);
                    }
                  });
                  setOrgImgs([...orgImgs]);
                }}
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>{I18N.carbonFootprint.uploadImages}</div>
                </div>
              </JavaUpload>
            )}
          </>
        );
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.organizationalPlanDisplay,
      name: 'planeImgDesc',
      type: 'textArea',
      rules: false,
      placeholder: canEdit ? I18N.carbonFootprint.pleaseEnter : '\n',
      col: 24,
      props: {
        disabled: !canEdit,
        rows: 5,
        maxLength: 1000,
        showCount: true,
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.greenhouseGasPipe2,
      name: 'gasGroupImgList',
      type: 'render',
      rules: false,
      col: 24,
      render() {
        const maxCount = 5;
        return (
          <>
            <span className='tip'>
              {I18N.enterpriseCarbonAccount2.imageFormatJ}</span>
            {!canEdit && gasGroupImgList.length === 0 ? (
              // <div style={{ height: 100, color: '#999999' }}>暂无图片</div>
              <div className='ant-upload ant-upload-select ant-upload-select-picture-card picture-card-disabled'>
                <span className='ant-upload'>
                  <div style={{ color: '#999EA4' }}>
                    <PlusOutlined />
                    <div style={{ marginTop: '8px' }}>{I18N.carbonFootprint.uploadImages}</div>
                  </div>
                </span>
              </div>
            ) : (
              <JavaUpload
                disabled={!canEdit}
                maxCount={maxCount}
                fileList={gasGroupImgList}
                listType='picture-card'
                maxSize={5 * 1024 * 1024}
                onFileCountChange={(flie: RcFile) => {
                  const { type } = flie;

                  const isFormat =
                    type === 'image/jpeg' ||
                    type === 'image/png' ||
                    type === 'image/jpg' ||
                    type === 'image/gif';

                  if (!isFormat) {
                    Toast('warn', I18N.carbonFootprint.fileFormatIsIncorrect);
                    return true;
                  }

                  if (gasGroupImgList.length >= 5) {
                    Toast('warn', I18N.carbonFootprint.maximumNumberOfFiles);
                    return true;
                  }
                  return false;
                }}
                onChange={(file: any) => {
                  const newArr = file.fileList.map((item, index) => {
                    if (item.status === 'done' && item.originFileObj) {
                      if (item.response.code === 200) {
                        return { ...item.response.data, uid: index };
                      }
                    }
                    return item;
                  });
                  setgasGroupImgList([...newArr]);
                }}
                onRemove={(e: any) => {
                  gasGroupImgList.forEach(
                    (item: { uid: string }, index: number) => {
                      if (item.uid === e.uid) {
                        gasGroupImgList.splice(index, 1);
                      }
                    },
                  );
                  setgasGroupImgList([...gasGroupImgList]);
                }}
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>{I18N.carbonFootprint.uploadImages}</div>
                </div>
              </JavaUpload>
            )}
          </>
        );
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.greenhouseGasPipe,
      name: 'gasGroupDesc',
      type: 'textArea',
      rules: false,
      placeholder: canEdit ? I18N.carbonFootprint.pleaseEnter : '\n',
      col: 24,
      props: {
        rows: 5,
        disabled: !canEdit,
        maxLength: 1000,
        showCount: true,
      },
    },
  ];
  // }, [form.getFieldsValue(true)]);

  return (
    <div className='info-box padd-t-16'>
      <div className='edit-box' style={{ width: 'calc(100% - 30px)' }}>
        {/* <p>功能描述：此处为一段描述</p> */}
        <p>&nbsp;</p>
        {props.pageType === 'detail' ? (
          ''
        ) : (
          <div>
            {canEdit ? (
              <Button
                style={{ marginRight: 20 }}
                type='default'
                onClick={() => {
                  setCanEdit(!canEdit);
                  props.getData();
                }}
              >
                {I18N.carbonFootprint.cancel}</Button>
            ) : (
              ''
            )}

            <Button
              ghost
              type='primary'
              onClick={() => {
                if (!canEdit) {
                  setCanEdit(!canEdit);
                } else {
                  form.validateFields().then(values => {
                    setCanEdit(!canEdit);
                    props.saveData({
                      ...values,
                      planeImgList: orgImgs,
                      gasGroupImgList,
                      productionCode: values.productionCode?.join(','),
                      registerCode: values.registerCode?.join(','),
                    });
                  });
                }
              }}
            >
              {canEdit ? I18N.carbonFootprint.preserve : I18N.carbonFootprint.edit}
            </Button>
          </div>
        )}
      </div>
      <FormItemUtil
        antdFormProps={{
          ...basicsFormProps,
        }}
        formItems={[...formItems]}
        paddRight={30}
      />
      <FormActions
        place='center'
        buttons={[
          {
            type: 'primary',
            title: I18N.carbonFootprint.preserve,
            onClick: async () => {},
          },
          {
            type: 'default',
            title: I18N.carbonFootprint.cancel,
            onClick: async () => {},
          },
        ]}
      />
    </div>
  );
};
