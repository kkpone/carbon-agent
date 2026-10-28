/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-03-30 16:43:58
 * @Date: 2023-03-07 19:51:32
 * @@description: formily上传图片文件
 */
import I18N from '@src/lang/I18N';
import { Field } from '@formily/core';
import { useField } from '@formily/react';
import { useEffect, useRef, useState } from 'react';

import styles from './index.module.less';
import { AddFileDataExtends } from '../../type';
import CarbonFootprint3UploadFile from '../uploadFile';

type FormilyImgUploadProps = {
  value: AddFileDataExtends[];
  onChange: (value: AddFileDataExtends[]) => void;
};
export default ({ value, onChange }: FormilyImgUploadProps) => {
  const childRef = useRef<{ subFilesData: () => AddFileDataExtends[] }>(null);
  const field = useField<Field>();

  /** 上传的文件列表 */
  const [fileListBack, setFileListBack] = useState<AddFileDataExtends[]>([]);

  useEffect(() => {
    // 设置文件
    if (value && value.length > 0) {
      const filesBack: AddFileDataExtends[] = value.map(fileData => ({
        name: fileData.name,
        url: fileData.url,
        uid: `${fileData.uid || fileData.id}`,
        suffix: fileData.suffix,
      }));
      setFileListBack(filesBack);
    } else {
      setFileListBack([]);
    }
  }, [value]);

  return (
    <div>
      <div className={styles.uploadDetail}>
        {I18N.carbonFootprint3.supportPdf}
      </div>
      <div className='m-t-10'>
        <CarbonFootprint3UploadFile
          col={24}
          onChange={onChange}
          cRef={childRef}
          isDetail={field.readPretty}
          fileListBack={fileListBack}
        />
      </div>
    </div>
  );
};
