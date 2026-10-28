/**
 * 文件上传
 * @returns
 */
import apiPath from '@src/api/config';
import { UploadImgResponse } from '@src/api/types';
import { UploadCard } from '@src/components/Factor/Upload';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { getToken } from '@src/utils/cookie';
import { FormInstance, Modal, Upload } from 'antd';
import { UploadChangeParam } from 'antd/es/upload/interface';
import { UploadFile } from 'antd/lib/upload/interface';
import { useEffect, useState } from 'react';

interface UploadProsp {
  form: FormInstance<any>;
  fileList?: Array<UploadFile<any>>;
}
const AwardListDetailUpload = (props: UploadProsp) => {
  const { form, fileList } = props;
  /** 图片的弹框 */
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  /** 预览图片的地址 */
  const [previewUrl, setpreviewUrl] = useState<string>();
  /** 图片名称 */
  const [previewTitle, setPreviewTitle] = useState<string>(
    I18N.carbonFootprint3.preview,
  );
  /** 编辑的图片 */
  const [fileListBack, setFileListBack] = useState<Array<UploadFile<any>>>();
  /** 文件change事件 */
  const imgChange = (info: UploadChangeParam<UploadFile<any>>) => {
    if (info.file.status === 'removed') {
      form.setFieldsValue({
        imgPath: null,
      });
      setFileListBack(undefined);
    }
    if (info.file.status === 'done') {
      form.setFieldsValue({
        imgPath: info.file.response.data.url,
      });
    }
  };
  useEffect(() => {
    if (fileList && fileList?.length > 0) {
      setFileListBack(fileList);
      setpreviewUrl(fileList[0].url);
    }
  }, [fileList?.length]);
  return (
    <div>
      <UploadCard<UploadImgResponse>
        fileList={fileListBack}
        onChange={imgChange}
        aria-label='upload-img'
        maxCount={1}
        action={`${
          process.env.REACT_APP_API_URL || ''
        }${apiPath()}/system/file/uploadImg`}
        headers={{
          Authorization: getToken(),
        }}
        accept='.jpg,.png'
        onPreview={file => {
          const { response } = file;
          if (response?.data?.url) {
            setpreviewUrl(response?.data?.url);
          } else if (fileList && fileList?.length > 0) {
            setpreviewUrl(fileList[0].url);
          }

          setPreviewTitle(file.name);
          setPreviewVisible(true);
        }}
        beforeUpload={file => {
          if (file.size > 5 * 1024 * 1024) {
            Toast('error', I18N.carbonFootprint.theFileIsTooLarge);
            return Upload.LIST_IGNORE;
          }

          return new Promise(resolve => {
            const url = window.URL.createObjectURL(file);
            const img = document.createElement('img');
            img.src = url;
            img.onload = function () {
              if (img.naturalHeight === 750 && img.naturalWidth === 750)
                resolve(true);

              Toast('info', I18N.carbonAccount.suggestedSizeX);
              resolve(Upload.LIST_IGNORE);
            };
          });
        }}
      />
      <Modal
        open={previewVisible}
        title={previewTitle || I18N.carbonFootprint3.preview}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt='example' style={{ width: '100%' }} src={previewUrl} />
      </Modal>
    </div>
  );
};

export default AwardListDetailUpload;
