import I18N from '@src/lang/I18N';
import { saveAs } from 'file-saver';

import { Toast } from '@/utils';

/** 下载文件 */
export const downloadFile = (url: string, name?: string) => {
  Toast('success', I18N.carbonFootprint.startDownloading);
  saveAs(url, name);
};
