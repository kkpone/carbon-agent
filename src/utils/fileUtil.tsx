import I18N from '@src/lang/I18N';
import { Image, Modal } from 'antd';
import { AxiosResponse } from 'axios';

import { Toast } from '@/utils';

/** 状态。0 启用 1 禁用 */
export const status = {
  0: '启用',
  1: '禁用',
};

export interface ImportLog {
  createBy?: number;

  createByName?: string;

  createTime?: Date;

  doneTime?: Date;

  failedCount?: number;

  failedFileUrl?: string;

  fileName?: string;

  fileUrl?: string;

  id?: number;

  importStatus?: -1 | 0 | 1;

  importTime?: Date;

  importType?: 1 | 2;

  orgId?: number;

  orgName?: string;

  successCount?: number;

  totalCount?: number;

  updateBy?: number;

  updateTime?: Date;
}

// 下载文件方法
const downloadBlob = (blobUrl: string, fileNameValue: string) => {
  // 原有的下载逻辑
  const link = document.createElement('a'); // 创建a标签
  link.href = blobUrl; // 设置a标签的href为创建的URL
  link.setAttribute('download', `${fileNameValue}`); // 设置a标签的download属性为文件名值或解析的文件名
  document.body.appendChild(link); // 将a标签添加到文档中
  link.click(); // 模拟点击a标签进行文件下载
  document.body.removeChild(link); // 移除a标签
  // 在适当的时机调用这个函数以释放创建的URL
  URL.revokeObjectURL(blobUrl); // 撤销对象URL，释放资源
};

// 预览文件方法
const previewFile = (url: string, contentType: string) => {
  let urlValue;
  let isImage = false;
  let isPdf = false;
  // 检查环境并处理响应
  if (['development', 'test'].includes(process.env.REACT_APP_API_URL)) {
    // 在开发和测试环境中
    urlValue = url;
    // 根据URL扩展名检查文件类型
    isImage = urlValue.match(/\.(jpeg|jpg|gif|png|svg)$/i) != null;
    isPdf = urlValue.match(/\.pdf$/i) != null;
  } else {
    // 在生产环境中，处理文件流
    urlValue = url;
    // 根据contentType检查文件类型
    isImage = contentType?.includes('image/');
    isPdf = contentType?.includes('application/pdf');
  }

  if (isImage) {
    // 如果是图片，使用<img>标签显示
    Modal.info({
      width: '50%',
      title: I18N.supplyChainCarbonManagement.preview,
      okText: I18N.carbonFootPrintLCA.close,
      maskClosable: true,
      content: (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image src={urlValue} width='90%' alt='Image Preview' />,
        </div>
      ),
    });
  } else if (isPdf) {
    // 如果是PDF，使用<iframe>显示
    Modal.info({
      width: '80%',
      title: I18N.supplyChainCarbonManagement.preview,
      okText: I18N.carbonFootPrintLCA.close,
      maskClosable: true,
      content: (
        <iframe
          src={urlValue}
          style={{ width: '100%', height: '60vh', border: 'none' }}
          title='PDF Preview'
        />
      ),
    });
  }
};

/**
 * 下载文件
 * @param response 响应对象，假设为Blob类型
 * @param res AxiosResponse对象
 * @param fileNameValue 文件名值（可选）
 * @param preview 是否预览文件，默认为false
 */
export const downloadFileFactor = (
  response: unknown | Blob, // 假设response是一个Blob对象
  res: AxiosResponse,
  fileNameValue?: string,
  preview = false, // 控制是否预览文件
  // dev和测试环境文件是url字段
  devOrTestUrl?: string,
) => {
  try {
    const disposition = res.headers['content-disposition']; // 获取响应头中的content-disposition
    const contentType = res.headers['content-type'];
    const fileName = decodeURI(disposition?.split('filename=')?.[1] || ''); // 解码文件名并获取文件名
    // 当前环境变量
    const isCurrentDevOrTestMode = ['development', 'test'].includes(
      process.env.REACT_APP_API_URL,
    );
    // 创建对象URL，将响应数据转为Blob并创建URL
    const url = URL.createObjectURL(response as Blob);
    // 如果是开发、测试环境 对devOrTestUrl进行处理
    if (isCurrentDevOrTestMode) {
      const isImage = devOrTestUrl?.match(/\.(jpeg|jpg|png|gif)$/i) != null;
      const isPdf = devOrTestUrl?.match(/\.pdf$/i) != null;
      if (preview && (isImage || isPdf)) {
        previewFile(devOrTestUrl || '', '');
      } else {
        downloadBlob(url, fileNameValue || fileName);
      }
    } else if (
      preview &&
      (contentType?.includes('image/') ||
        contentType?.includes('application/pdf'))
    ) {
      // 预览
      previewFile(url, `${contentType}`);
    } else {
      // 执行下载逻辑
      downloadBlob(url, fileNameValue || fileName);
    }
  } catch (error) {
    Toast('error', I18N.carbonData.downloadFailed);
  }
};

/** 解析Content-Disposition字段以获取文件名 */
export const downloadBlobFile = (
  response: BlobPart,
  res: AxiosResponse,
  fileNameValue?: string,
) => {
  try {
    const disposition = res.headers['content-disposition'];
    const fileName = decodeURI(disposition?.split('filename=')?.[1] || '');
    if (!fileName) {
      Toast('warn', I18N.carbonData.noDataAvailableForExport);
      return;
    }
    const blob = new Blob([response], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileNameValue || fileName}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    Toast('error', I18N.carbonData.fileDownloadLoss);
  }
};
