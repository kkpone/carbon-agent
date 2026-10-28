/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-11-14 17:58:12
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-02 11:35:36
 */
/**
 * @file 主题详情页
 * @author qifeng
 */

import { PlusOutlined } from '@ant-design/icons';
import { Upload } from '@components/Upload';
import { ApiIploadOSS } from '@src/api/api';
import carbonCoin from '@src/assets/images/carbon-coin.png';
import leaf from '@src/assets/images/leaf.png';
import { Button } from '@src/components/Button';
import { FormActions } from '@src/components/FormActions';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { formItemInputSchema } from '@src/components/FormUtil/util';
import { Page } from '@src/components/Page';
import I18N from '@src/lang/I18N';
import { RouteMaps, virtualLinkTransform } from '@src/router/route-paths';
import {
  addUsingPOST3DefaultApi,
  editUsingPOST5DefaultApi,
  infoUsingGET3DefaultApi,
  previewUsingGETDefaultApi,
} from '@src/sdks/java/carbonAccount';
import { Toast } from '@src/utils/Toast';
import { PageShowType } from '@src/utils/types';
import { Card, Divider, Form, Radio, Switch } from 'antd';
import { useForm } from 'antd/es/form/Form';
import classNames from 'classnames';
import { compact, defaultsDeep } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { ModalBase } from '@src/components/UI/Modal';

import styles from './index.module.less';
import { ModalData } from '../../utils/types';

function Detail() {
  const params = useParams<{ id?: string }>();
  const history = useHistory();
  const id = params?.id;
  const [form] = useForm();
  const [modalData, setModalData] = useState<ModalData>();
  const [codeStatus, setCodeStatus] = useState(false);
  // 记录编辑时的初始化数据
  const [defaultFormData, setDefaultFormData] = useState({});
  let type: PageShowType = history.location.pathname.includes(
    virtualLinkTransform(
      RouteMaps.CarbonAccountBaseSettingThemeEdit,
      [':id'],
      [id],
    ),
  )
    ? PageShowType.edit
    : PageShowType.show;
  const [shareMessage, setShareMessage] = useState('');
  const [mobileImages, setMobileImages] = useState({
    backUrl:
      'https://oss-saas.carbonstop.net/carbonAccount/home-bg-top-1.4@2x.png?a=2',
    ornamentUrl: 'https://oss-saas.carbonstop.net/carbonAccount/toys.png?a=2',
  });
  useEffect(() => {
    if (id) {
      previewUsingGETDefaultApi().then(({ data }) => {
        // @ts-ignore
        setShareMessage(data?.data?.codeUrl || '');
      });
      infoUsingGET3DefaultApi(+id).then(({ data }) => {
        const result = data?.data;
        let checkedCode;
        if (result?.companyInclude) {
          checkedCode = 'companyInclude';
        } else if (result?.orgInclude) {
          checkedCode = 'orgInclude';
        }
        form.setFieldsValue({
          ...result,
          checkedCode,
        });
        setDefaultFormData({ ...result });
        setMobileImages(s => defaultsDeep({ ...result }, s));
        setCodeStatus(!!result?.codeStatus);
      });
    } else {
      form.setFieldsValue({
        ...form.getFieldsValue(true),
        checkedCode: 'companyInclude',
      });
    }
  }, [id]);

  if (!id) type = PageShowType.add;
  const isReadOnly = type === PageShowType.show;
  const imgSize = {
    backUrl: [1500, 3248],
    ornamentUrl: [1500, 1200],
  };
  const homeSettingItems = [
    {
      label: I18N.carbonAccount.homepageBackgroundImage,
      key: 'backUrl',
      class: styles.uploadBackUrl,
    },
    {
      label: I18N.carbonAccount.homeDecorationI,
      key: 'ornamentUrl',
      class: styles.uploadOrnamentUrl,
    },
  ];

  return (
    <Page
      wrapperClassName={styles.themesDetail}
      breadCrumbs={[
        {
          title: I18N.carbonAccount.themeSettings,
          key: I18N.carbonAccount.themeSettings,
          href: RouteMaps.CarbonAccountBaseSettingTheme,
        },
        {
          title: id
            ? type === PageShowType.edit
              ? I18N.carbonAccount.editThemeLetter
              : I18N.carbonAccount.viewThemeLetter
            : I18N.carbonAccount.topicInformation,
          key: I18N.carbonAccount.editThemeLetter,
        },
      ]}
    >
      <div className={styles.main}>
        <Card className={styles.top}>
          <h3>{I18N.carbonAccount.topicInformation}</h3>
          <FormItemUtil
            antdFormProps={{
              form,
              layout: 'vertical',
              readonly: isReadOnly,
            }}
            formItems={[
              formItemInputSchema({
                label: I18N.carbonAccount.topicName,
                name: 'themeTitle',
                rules: true,
              }),
            ]}
          />
        </Card>
        <Card className={styles.bottom}>
          <h3>{I18N.carbonAccount.sharingImageSettings}</h3>
          <Form
            layout='vertical'
            form={form}
            disabled={isReadOnly}
            onValuesChange={changed => {
              const file = changed.themeUrl;
              if (file && typeof file !== 'string') {
                const f = file as File;

                const { size } = f;
                if (size > 5 * 1024 * 1024) {
                  Toast('info', I18N.carbonAccount.theImageCannotBeLarge);
                  form.setFieldsValue({
                    // @ts-ignore
                    themeUrl: defaultFormData.themeUrl || '',
                  });
                  return;
                }

                const url = window.URL.createObjectURL(f);
                let img = document.createElement('img');
                img.src = url;
                img.onload = () => {
                  if (img.width !== 650 || img.height !== 320) {
                    Toast('info', I18N.carbonAccount.imageSizeIsNotAppropriate);
                    form.setFieldsValue({ themeUrl: '' });
                  } else {
                    setDefaultFormData(s => ({ ...s, themeUrl: f }));
                  }
                  // @ts-ignore
                  img = null;
                };
              }
            }}
          >
            <Form.Item
              label={
                <div>
                  {I18N.carbonAccount.backgroundImage}
                  <span className={styles.imgTip}>
                    {I18N.carbonAccount.sizePxp}
                  </span>
                </div>
              }
              name='themeUrl'
              rules={[
                {
                  required: true,
                  message: I18N.carbonAccount.pleaseUploadTheBackground,
                },
              ]}
            >
              <Upload
                className={styles.upload}
                disabled={isReadOnly}
                accept='.png,.jpg'
              >
                <div className={styles.uploadEmptyContainer}>
                  <PlusOutlined />
                  <div>{I18N.carbonFootprint.uploadImages}</div>
                </div>
              </Upload>
            </Form.Item>
            <Form.Item name='codeStatus'>
              <div className={styles.codeSwitch}>
                {I18N.carbonAccount.qrCodeSettings}
                <Switch
                  checked={codeStatus}
                  onChange={ev => {
                    // "codeStatus": 0, //是否开启二维码 0 否 1 是
                    setCodeStatus(ev);
                  }}
                />
                <span className={styles.imgTip}>
                  {I18N.carbonAccount.afterActivationUsers}
                </span>
              </div>
            </Form.Item>
            <Form.Item
              name='checkedCode'
              rules={[
                {
                  required: codeStatus,
                  message: I18N.carbonAccount.pleaseSelect2D,
                },
              ]}
            >
              <Radio.Group
                className={styles.checkboxGroup}
                disabled={isReadOnly || !codeStatus}
                options={[
                  {
                    label: (
                      <div>
                        {I18N.carbonAccount.qrCodePackage2}
                        <span className={styles.imgTip}>
                          {I18N.carbonAccount.afterCheckingTheUser2}
                        </span>
                      </div>
                    ),
                    value: 'companyInclude',
                  },
                  {
                    label: (
                      <div>
                        {I18N.carbonAccount.qrCodePackage}
                        <span className={styles.imgTip}>
                          {I18N.carbonAccount.afterCheckingTheUser}
                        </span>
                      </div>
                    ),
                    value: 'orgInclude',
                  },
                ]}
              />
            </Form.Item>
          </Form>
          <div>
            {I18N.carbonAccount.sharePreview}
            <Button
              type='link'
              onClick={async () => {
                const values = form.getFieldsValue();
                if (values.themeTitle && values.themeUrl) {
                  // todo add miniapp path
                  setModalData({
                    title: values.themeTitle,
                    thumbUrl:
                      typeof values.themeUrl === 'string'
                        ? values.themeUrl
                        : window.URL.createObjectURL(values.themeUrl),
                  });
                } else {
                  Toast('info', I18N.carbonAccount.topicNameAnd);
                }
              }}
            >
              {I18N.carbonAccount.clickToPreview}
            </Button>
          </div>
        </Card>
        <Card className={styles.homeSetting}>
          <h3>{I18N.carbonAccount.homePageSettings}</h3>
          <div className={styles.homeSettingMain}>
            <Form
              layout='vertical'
              className={styles.homeSettingForm}
              form={form}
              disabled={isReadOnly}
              onValuesChange={changed => {
                /** 首页背景图 */
                const file = changed.backUrl || changed.ornamentUrl;
                const key = changed.backUrl ? 'backUrl' : 'ornamentUrl';
                if (file && typeof file !== 'string') {
                  const f = file as File;

                  const { size } = f;
                  if (size > 5 * 1024 * 1024) {
                    Toast('info', I18N.carbonAccount.theImageCannotBeLarge);

                    form.setFieldsValue({ [key]: defaultFormData[key] || '' });
                    return;
                  }
                  const url = window.URL.createObjectURL(f);
                  let img = document.createElement('img');
                  img.src = url;
                  img.onload = () => {
                    if (
                      img.width !== imgSize[key][0] ||
                      img.height !== imgSize[key][1]
                    ) {
                      Toast(
                        'info',
                        I18N.carbonAccount.imageSizeIsNotAppropriate,
                      );
                      form.setFieldsValue({
                        // @ts-ignore
                        [key]: defaultFormData[key] || '',
                      });

                      // 图片尺寸合适，替换模拟器背景或装饰图
                    } else {
                      setDefaultFormData(s => ({ ...s, [key]: file }));
                      setMobileImages(s => ({ ...s, [key]: url }));
                    }
                    // @ts-ignore
                    img = null;
                  };
                }
              }}
            >
              {homeSettingItems.map(item => (
                <Form.Item
                  label={
                    <div>
                      {item.label}
                      <span className={styles.imgTip}>
                        {I18N.carbonAccount.size}
                        {imgSize[item.key][0]}px*
                        {imgSize[item.key][1]}
                        {I18N.carbonAccount.pxSupportsSmall}
                      </span>
                    </div>
                  }
                  name={item.key}
                  rules={[
                    {
                      required: true,
                      message: I18N.template(
                        I18N.carbonAccount.pleaseUploadIt,
                        { val1: item.label },
                      ),
                    },
                  ]}
                >
                  <Upload
                    className={classNames(styles.upload, item.class)}
                    disabled={isReadOnly}
                    accept='.png,.jpg'
                  >
                    <div className={styles.uploadEmptyContainer}>
                      <PlusOutlined />
                      <div>{I18N.carbonFootprint.uploadImages}</div>
                    </div>
                  </Upload>
                </Form.Item>
              ))}
            </Form>
            <div className={styles.homeSettingMobileWrapper}>
              <img
                className={styles.mobile}
                src='https://oss-saas.carbonstop.net/carbonAccount/mobile-device-wrapper.png'
                alt=''
              />
              <img className={styles.bg} src={mobileImages.backUrl} alt='' />
              <img
                className={styles.toy}
                src={mobileImages.ornamentUrl}
                alt=''
              />
            </div>
          </div>
        </Card>
      </div>
      <FormActions
        place='center'
        buttons={compact([
          type !== PageShowType.show && {
            title: I18N.carbonFootprint.confirm2,
            type: 'primary',
            onClick: async () =>
              // @ts-ignore
              form
                .validateFields()
                .then(values => {
                  const subValues = {
                    ...values,
                    codeStatus: +codeStatus,
                    // themeUrl,
                    companyInclude:
                      Number(
                        +codeStatus &&
                          values.checkedCode?.includes('companyInclude'),
                      ) || 0,
                    orgInclude:
                      Number(
                        +codeStatus &&
                          values.checkedCode?.includes('orgInclude'),
                      ) || 0,
                    checkStatus: 0,
                  };
                  // 没有修改 直接保存
                  if (
                    typeof values.themeUrl === 'string' &&
                    typeof values.backUrl === 'string' &&
                    typeof values.ornamentUrl === 'string'
                  ) {
                    if (id) {
                      return editUsingPOST5DefaultApi({ ...subValues, id });
                    }

                    return addUsingPOST3DefaultApi(subValues);
                  }

                  const files = compact([
                    typeof values.themeUrl !== 'string' && {
                      themeUrl: values.themeUrl,
                      key: 'themeUrl',
                    },
                    typeof values.backUrl !== 'string' && {
                      backUrl: values.backUrl,
                      key: 'backUrl',
                    },
                    typeof values.ornamentUrl !== 'string' && {
                      ornamentUrl: values.ornamentUrl,
                      key: 'ornamentUrl',
                    },
                  ]);

                  return Promise.all(
                    files.map(item => {
                      const fd = new FormData();
                      fd.append('file', item[item.key]);
                      fd.append('ossPath', 'account/saas');
                      fd.append('fileName', item[item.key].name || '');
                      return ApiIploadOSS(fd).then(({ data }) => ({
                        key: item.key,
                        // @ts-ignore
                        url: data?.data?.url,
                      }));
                    }),
                  ).then(files => {
                    files.forEach(img => {
                      subValues[img.key] = img.url;
                    });
                    if (id) {
                      return editUsingPOST5DefaultApi({
                        ...subValues,
                        id,
                      });
                    }

                    return addUsingPOST3DefaultApi({ ...subValues });
                  });
                })
                .then(({ data }) => {
                  if (data?.code === 200) {
                    Toast('success', I18N.carbonFootprint.saveSuccessful);
                    history.go(-1);
                  }
                }),
          },
          {
            title: I18N.carbonFootprint.cancel,
            onClick: async () => {
              history.go(-1);
            },
          },
        ])}
      />
      <ModalBase
        visible={!!modalData}
        maskClosable={false}
        wrapClassName={styles.shareContainer}
        onCancel={() => {
          setModalData(undefined);
        }}
        closable
        width={404}
        footer={null}
        content={
          <div className={styles.shareMain}>
            <div className={styles.header}>
              <img
                src={modalData?.thumbUrl}
                className={styles.thumbBg}
                alt=''
              />
              <div className={styles.headerData}>
                <img
                  src={`${process.env.REACT_APP_API_URL_OSS}/saas-product/saas-assets/head.png`}
                  alt=''
                />
                <span>{I18N.carbonAccount.xxXsLow}</span>
              </div>
            </div>

            <footer className={styles.footer}>
              <div className={styles.fs18}>
                {I18N.carbonAccount.iWorkInXxCompany}
              </div>
              <div className={classNames(styles.fs18, styles.primaryColor)}>
                {I18N.carbonAccount.currentlyAccumulated}
              </div>
              <div className={styles.tagWrapper}>
                <div>
                  <div className={styles.tag}>
                    <img className={styles.icon} src={leaf} alt='' />
                    <span>{I18N.carbonAccount.kgCarbonReduction}</span>
                  </div>
                </div>
              </div>
              <div className={styles.tagWrapper}>
                <div>
                  <div className={styles.tag}>
                    <img
                      className={styles.icon}
                      src={carbonCoin}
                      alt={I18N.carbonAccount.carbonCoin}
                    />
                    <span>{I18N.carbonAccount.individualCarbonCoins}</span>
                  </div>
                </div>
              </div>
              <div className={styles.lowCarbonPropose}>
                {I18N.carbonAccount.comeAndJoinMeQuickly}
                <br />
                {I18N.carbonAccount.forTheBrightnessOfTheEarth}
              </div>
              {codeStatus && shareMessage && (
                <div className={styles.code}>
                  <div className={styles.codeImg}>
                    <img src={shareMessage} alt='' />
                  </div>
                  <div className={styles.codeText}>
                    <span>{I18N.carbonAccount.becauseOfYourPresence}</span>{' '}
                    <Divider />
                    <span className={styles.lightText}>
                      {I18N.carbonAccount.scanCodeToJoinLow}
                    </span>
                  </div>
                </div>
              )}
            </footer>
            <Button
              className={styles.closeIcon}
              type='default'
              onClick={async () => {
                setModalData(undefined);
              }}
            >
              {I18N.carbonFootprint3.close}
            </Button>
          </div>
        }
      />
    </Page>
  );
}

export default Detail;
