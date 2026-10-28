import { Typography } from 'antd';
import classNames from 'classnames';

import { IconFont } from '@/components/LcaIconFont';
import { getSuffix } from '@/utils';

import style from './index.module.less';
import { SupportUploadFile } from './type';

const { Text } = Typography;

interface FileListProps {
  /** 是否展示操作按钮  */
  showActionBtn: boolean;
  /** 文件列表  */
  fileList?: SupportUploadFile[];
  /** 删除方法 */
  remove: (fileId: string) => void;
}

const FileList = ({ showActionBtn, fileList, remove }: FileListProps) => (
  <div className={style.fileListWrapper}>
    {fileList &&
      fileList.length > 0 &&
      fileList.map(fileItem => {
        const { fileName = '', fileUrl, fileId } = fileItem || {};
        const nameArr = fileName.split('.');
        const suffix = nameArr[nameArr.length - 1];
        const name = fileName?.slice(0, fileName.length - suffix.length);
        return (
          <div className={style.fileItemWrapper} key={fileId}>
            <div
              className={classNames(style.fileWrapper, {
                [style.readPrettyWrapper]: !showActionBtn,
              })}
            >
              <div className={style.fileContent}>
                <a href={fileUrl} target='_blank' rel='noreferrer'>
                  <IconFont
                    className={style.fileIcon}
                    icon={getSuffix(suffix)}
                  />
                  <Text className={style.name} ellipsis={{ suffix }}>
                    {name}
                  </Text>
                </a>
              </div>
              {showActionBtn && (
                <div
                  className={style.delBtn}
                  onClick={() => {
                    if (!fileId) {
                      return;
                    }
                    remove?.(fileId);
                  }}
                >
                  <IconFont
                    className={style.delIcon}
                    icon='icon-icon-shanchu'
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
  </div>
);
export default FileList;
