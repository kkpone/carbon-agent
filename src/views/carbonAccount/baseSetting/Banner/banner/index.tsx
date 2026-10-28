/**
 * 添加、编辑、查看banner
 */
import I18N from '@src/lang/I18N';
import { BraftEditorComponent } from '@src/components/BraftEditor';
import { Toast } from '@src/utils/Toast';
import { Button, Form, Input, InputNumber, Radio, Upload } from 'antd';
import { useState, useEffect } from 'react';
import { RcFile } from 'antd/lib/upload';
import {
  LoadingOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import '../../../index.less';
import { ApiIploadOSS, javaFileUpload } from '@src/api/api';
import { FormActions } from '@src/components/FormActions';
import { compact } from 'lodash-es';
import { ApiBannerDetail, ApiBannerEdit, ApiBannerAdd } from '../../service';

const AboutEidtBanner = () => {
  const [form] = Form.useForm();
  const [type, setType] = useState(1);
  const [avatar, setAvatar] = useState('');
  const [video, setVideo] = useState('');
  const [bannerContent, setBannerContent] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [isDetail, setIsDetail] = useState<boolean>(false);
  const id = new URLSearchParams(window.location.search).get('id') || '';
  useEffect(() => {
    form.setFieldsValue({ ...form.getFieldsValue(true), bannerType: type });
  }, [type]);
  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      Toast('error', I18N.carbonFootprint.fileFormatIsIncorrect);
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      Toast('error', I18N.carbonAccount.theFileCannotBeLarge2);
    }
    return isJpgOrPng && isLt5M;
  };

  const formArr = [
    {
      label: I18N.carbonFootprint.type,
      name: 'bannerType',
      type: 'both',
      rules: [{ required: true }],
      className: 'row1',
      render() {
        return (
          <Radio.Group
            disabled={isDetail}
            defaultValue={1}
            onChange={e => {
              setType(e.target.value);
            }}
          >
            <Radio value={1}> {I18N.carbonAccount.imageAndText}</Radio>
            <Radio value={2}> {I18N.carbonAccount.video}</Radio>
          </Radio.Group>
        );
      },
    },
    {
      label: I18N.carbonAccount.banne,
      name: 'imgUrl',
      type: 'img',
      className: 'row2',
      rules: [{ required: true, message: I18N.carbonAccount.pleaseAddBa }],
      render() {
        return (
          <>
            <span className='tip-word'>
              {I18N.carbonAccount.suggestedSizeRatio}</span>
            {isDetail ? (
              <img src={avatar} width={100} alt='' />
            ) : (
              <Upload
                // disabled={isDetail}
                listType='picture-card'
                showUploadList={false}
                customRequest={({ onError, file }) => {
                  setLoading(true);
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('ossPath', 'account/saas');
                  ApiIploadOSS(formData)
                    .then((res: any) => {
                      setAvatar(res.data.data.url);
                      form.setFieldsValue({
                        ...form.getFieldsValue(true),
                        imgUrl: res.data.data.url,
                      });
                    })
                    .catch(() => {
                      onError?.({
                        name: 'error',
                        message: 'error',
                        status: 500,
                      });
                    })
                    .finally(() => {
                      setLoading(false);
                    });
                }}
                beforeUpload={beforeUpload}
              >
                {avatar ? (
                  <img src={avatar} style={{ width: '100%' }} alt='' />
                ) : (
                  <div>
                    {loading ? <LoadingOutlined /> : <PlusOutlined />}
                    <div className='upload-word'>{I18N.carbonFootprint.uploadImages}</div>
                  </div>
                )}
              </Upload>
            )}
          </>
        );
      },
    },
    {
      label: I18N.carbonAccount.video,
      name: 'videoUrl',
      type: 'video',
      className: 'row2',
      rules: [{ required: true, message: I18N.carbonAccount.pleaseAddAVideo }],
      render() {
        return (
          <div>
            {isDetail ? (
              <video src={video} style={{ height: '300px' }}>
                <track default kind='captions' srcLang='en' src={video} />
              </video>
            ) : (
              <Upload
                showUploadList={false}
                beforeUpload={(file: RcFile) => {
                  const idVideo =
                    file.type === 'video/mp4' || file.type === 'video/3gp';
                  if (!idVideo) {
                    Toast('error', I18N.carbonFootprint.fileFormatIsIncorrect);
                  }
                  const isLt200M = file.size / 1024 / 1024 < 200;
                  if (!isLt200M) {
                    Toast('error', I18N.carbonAccount.theFileCannotBeLarge);
                  }
                  return idVideo && isLt200M;
                }}
                customRequest={({ onError, file }) => {
                  setLoading(true);
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('ossPath', 'account/saas');
                  ApiIploadOSS(formData)
                    .then((res: any) => {
                      setVideo(res.data.data.url);
                      form.setFieldsValue({
                        ...form.getFieldsValue(true),
                        videoUrl: res.data.data.url,
                      });
                    })
                    .catch(() => {
                      onError?.({
                        name: 'error',
                        message: 'error',
                        status: 500,
                      });
                    })
                    .finally(() => {
                      setLoading(false);
                    });
                }}
              >
                {video ? (
                  <video src={video} style={{ height: '300px' }}>
                    <track default kind='captions' srcLang='en' src={video} />
                  </video>
                ) : (
                  <div>
                    <Button icon={<UploadOutlined />}>{I18N.carbonAccount.uploadVideo}</Button>
                  </div>
                )}
              </Upload>
            )}
          </div>
        );
      },
    },
    {
      label: I18N.carbonAccount.title,
      name: 'bannerTitle',
      className: 'row3',
      type: 'img',
      rules: [{ required: true }],
      render() {
        return <Input disabled={isDetail} />;
      },
    },
    {
      label: I18N.carbonFootprint3.sort,
      name: 'orderNum',
      type: 'both',
      className: type === 1 ? 'row4' : 'row3',
      rules: [{ required: true }],
      render() {
        return <InputNumber disabled={isDetail} />;
      },
    },
    {
      label: I18N.carbonAccount.content,
      name: 'bannerContent',
      className: 'row5',
      type: 'img',
      rules: [{ required: true }],
      render() {
        return (
          <div className='Editor'>
            <BraftEditorComponent
              max={500}
              // @ts-ignore
              readOnly={isDetail}
              media={{
                uploadFn(params) {
                  javaFileUpload(params.file).then(({ data }) => {
                    const result = data?.data;
                    if (data?.code === 200 && result) {
                      params.success({
                        ...result,
                        meta: {
                          // @ts-ignore
                          id: params.id,
                          title: result.name,
                          alt: result.name,
                          loop: false,
                          autoPlay: false,
                          controls: false,
                          poster: '',
                        },
                      });
                    }
                  });
                },
              }}
              changeControls={defaultControls => [...defaultControls, 'media']}
              defaultValue={bannerContent}
              placeholder={I18N.carbonFootprint.pleaseEnter}
              onChange={(val?: string) => {
                form.setFieldsValue({
                  bannerContent: val,
                });
              }}
            />
          </div>
        );
      },
    },
  ];
  const getData = id => {
    ApiBannerDetail({ id }).then(({ data }) => {
      form.setFieldsValue(data.data);
      setType(data.data.bannerType);
      const bannerDesc = decodeURIComponent(data.data.bannerContent);
      if (data.data.bannerType === 1) {
        form.setFieldsValue({
          ...data.data,
          bannerContent: bannerDesc,
          imgUrl: data.data.bannerUrl,
        });
        setAvatar(data.data.bannerUrl);
      } else {
        form.setFieldsValue({
          ...data.data,
          bannerContent: bannerDesc,
          videoUrl: data.data.bannerUrl,
        });
        setVideo(data.data.bannerUrl);
      }

      setBannerContent(bannerDesc);
    });
  };
  useEffect(() => {
    id && getData(id);
    if (window.location.href.includes('checkBanner')) {
      setIsDetail(true);
    }
  }, []);
  return (
    <div className=' banner'>
      <Form form={form} className='col' layout='vertical'>
        {formArr.map((item: any) => {
          if (type === 1) {
            if (item.type === 'img') {
              return <Form.Item {...item}>{item.render()}</Form.Item>;
            }
          } else if (type === 2 && item.type === 'video') {
            return <Form.Item {...item}>{item.render()}</Form.Item>;
          }
          if (item.type === 'both') {
            return <Form.Item {...item}>{item.render()}</Form.Item>;
          }
          return true;
        })}
      </Form>

      <FormActions
        place='center'
        buttons={compact([
          !isDetail && {
            type: 'primary',
            onClick: async () => {
              form
                .validateFields()
                .then(values => {
                  // 由于后端接口不能处理源数据，需要做一次转码
                  if (bannerContent !== values.bannerContent) {
                    values.bannerContent = encodeURIComponent(
                      values.bannerContent,
                    );
                  }
                  values.bannerUrl = values.bannerType === 1 ? avatar : video;
                  const api = id ? ApiBannerEdit : ApiBannerAdd;
                  id && (values.id = id);
                  api(values).then(res => {
                    if (res.data.code === 200) {
                      Toast('success', I18N.carbonFootprint.operationSuccessful);
                      setTimeout(() => {
                        history.go(-1);
                      }, 800);
                    }
                  });
                })
                .catch(e => {
                  // eslint-disable-next-line no-console
                  console.log(e);
                });
            },
            title: I18N.carbonFootprint.preserve,
          },
          {
            title: I18N.carbonFootprint.return,
            className: 'mr20',
            onClick: async () => {
              history.go(-1);
            },
          },
        ])}
      />
    </div>
  );
};
export default AboutEidtBanner;
