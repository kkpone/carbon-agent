/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-03-30 16:38:19
 * @Date: 2023-01-08 14:59:30
 * @@description: 产品碳足迹3.0的文件上传
 */
// import apiPath from '@src/api/config';
import I18N from '@src/lang/I18N';
import IconFont from '@src/components/iconfont';
import { Toast } from '@src/utils/Toast';
import { getToken } from '@src/utils/cookie';
import { filterIcon } from '@src/views/Certification/ProjectDetails/indexjson';
import { Button, Col, Row, Upload, UploadProps } from 'antd';
import { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import saveAs from 'file-saver';
import { cloneDeep } from 'lodash-es';
import { useEffect, useImperativeHandle, useRef, useState } from 'react';

import style from './index.module.less';
import { UploadFileProps } from './type';
import { AddFileData } from '../../type';
import TextOverflowTable from '../TextOverflowTable';

const CarbonFootprint3UploadFile = (propsUploadFile: UploadFileProps) => {
  const divRef = useRef<HTMLDivElement>(null);

  const { isDetail, maxWidth, onChange, col = 8 } = propsUploadFile;

  /** 上传的文件列表 */
  const [fileListBack, setFileListBack] = useState<AddFileData[]>(
    propsUploadFile.value || propsUploadFile.fileListBack || [],
  );
  const [active, setActive] = useState<number>();
  /** 文件change事件 */
  const imgChange = (info: UploadChangeParam<UploadFile<any>>) => {
    if (info.file.status === 'done') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const url = info.file.response.data;
      const nameArr = info.file.name.split('.');
      const data = {
        uid: info.file.uid,
        suffix: nameArr[nameArr.length - 1],
        name: info.file.name,
        url,
      };
      setFileListBack([...fileListBack, data]);
      if (typeof onChange === 'function') {
        onChange([...fileListBack, data]);
      }
    }
  };
  /** 删除文件 */
  const removeFile = (item: AddFileData) => {
    const oldFile = cloneDeep(fileListBack).filter(res => res.url !== item.url);
    setFileListBack(oldFile);
    if (typeof onChange === 'function') {
      onChange(oldFile);
    }
  };
  /** 下载文件 */
  const downloadFile = (item: AddFileData) => {
    saveAs(item.url, item.name);
  };
  /** 鼠标移入附件中 */
  const onMouseFile = (index?: number) => {
    setActive(index);
  };
  /** 上传文件的参数 */
  const props: UploadProps = {
    showUploadList: false,
    name: 'file',
    disabled: fileListBack.length >= 10,
    accept:
      '.png, .PNG, .jpg, .JPG, .JPEG, .jpeg, .xls, .xlsx, .XLS, .XLSX, .doc, .DOC, .docx, .DOCX, .pdf, .PDF, .rar, .RAR, .zip, .ZIP',
    onChange: imgChange,
    // action: `${
    //   process.env.REACT_APP_API_URL || ''
    // }${apiPath()}/system/file/uploadImg`,
    action: `${process.env.REACT_APP_API_URL || ''}/file/file/uploadImg`,
    headers: {
      Authorization: getToken(),
    },
    beforeUpload: file => {
      const { name } = file;
      const typeFile = name.split('.');
      const fileType = [
        'png',
        'PNG',
        'jpg',
        'JPG',
        'JPEG',
        'jpeg',
        'xlsx',
        'XLSX',
        'XLS',
        'xls',
        'doc',
        'DOC',
        'docx',
        'DOCX',
        'pdf',
        'PDF',
        'rar',
        'RAR',
        'zip',
        'ZIP',
      ];
      // toUpperCase
      if (fileListBack.find(list => list.name === name)) {
        Toast('error', I18N.carbonFootprint3.alreadyUploaded);
        return false;
      }
      if (!fileType.includes(typeFile[typeFile.length - 1])) {
        Toast(
          'error',
          I18N.template(I18N.carbonFootprint3.onlySupportsFi5, {
            val1: fileType.join(','),
          }),
        );
        return false;
      }
      if (fileListBack.length >= 10) {
        Toast('error', I18N.carbonFootprint3.maximumNumberOfFiles);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        Toast('error', I18N.carbonFootprint3.fileMaximumNot);
        return Upload.LIST_IGNORE;
      }
      return true;
    },
  };

  /**
   * 主动触发子组件 - 获取文件
   */
  useImperativeHandle(propsUploadFile.cRef, () => ({
    subFilesData: () => fileListBack,
  }));

  useEffect(() => {
    if (
      propsUploadFile.fileListBack &&
      propsUploadFile.fileListBack.length > 0
    ) {
      setFileListBack(propsUploadFile.fileListBack);
    } else {
      setFileListBack([]);
    }
  }, [propsUploadFile.fileListBack]);

  return (
    <div
      ref={divRef}
      className={style.carbonFootprintAdd}
      style={maxWidth || col ? { marginBottom: 0 } : {}}
    >
      {!isDetail && (
        <Upload {...props}>
          <Button
            icon={
              <IconFont
                type='icon-icon-shangzhuan-3'
                style={{ fontSize: '16px' }}
              />
            }
          >
            {I18N.carbonFootprint.uploadFiles}
          </Button>
        </Upload>
      )}

      <div className={`${style.uploadMain} m-t-10`}>
        <Row>
          {fileListBack.map((item, _item) => (
            <Col span={col} key={item.uid}>
              <div
                onMouseEnter={() => onMouseFile(_item)}
                onMouseLeave={() => onMouseFile()}
                className={`${style.fileInfo} ${
                  active === _item ? style.fileInfoActive : ''
                }`}
              >
                <div>
                  <div
                    className={`${style.fileName} ${style.fileNameMain} ${
                      active === _item ? style.primaryColorFont : ''
                    } `}
                  >
                    <IconFont
                      className={`${
                        active === _item ? style.primaryColorFont : ''
                      } m-r-10 m-l-10`}
                      style={{ fontSize: '16px' }}
                      type={filterIcon(item.suffix)}
                    />
                    <TextOverflowTable
                      maxWidth={
                        maxWidth ||
                        (divRef.current?.offsetWidth &&
                          (divRef.current?.offsetWidth as number) - 200)
                      }
                      value={item.name}
                      maxLength={col === 24 ? 50 : 10}
                    />
                  </div>
                </div>
                {active === _item && (
                  <div>
                    <IconFont
                      className='m-r-10'
                      onClick={() => downloadFile(item)}
                      type='icon-icon-xiazai-4'
                    />
                    {!isDetail && (
                      <IconFont
                        onClick={() => removeFile(item)}
                        className={`${style.primaryColorFont} ${
                          maxWidth ? 'm-l-10 m-r-10' : 'm-l-20 m-r-10'
                        }`}
                        type='icon-icon-shanshu-2'
                      />
                    )}
                  </div>
                )}
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default CarbonFootprint3UploadFile;
