import I18N from '@src/lang/I18N';
import { UploadFile } from 'antd/lib/upload';
import { useEffect, useState } from 'react';

import { SupportFilesUpload } from '@/components/SupportFilesUpload';

import FileList from './FileList';
import style from './index.module.less';
import { postProcessManageSupportFilesEdit } from './service';
import { SupportUploadFile } from './type';
import { getProcessDescDetail } from '../../CarbonFootprintModel/service';

interface SupportFilesProps {
  /** 是否展示操作按钮 */
  showActionBtn: boolean;
  /** 支撑材料的模块类型 */
  objectType: number;
  /** 当前菜单的过程id */
  treeNodeId?: number;
}
interface UploadFileProps {
  name?: string;
  url?: string;
  uid?: string;
}

const SupportFiles = ({
  showActionBtn,
  objectType,
  treeNodeId,
}: SupportFilesProps) => {
  /** 支撑材料的列表 */
  const [supportFilesList, setSupportFilesList] =
    useState<SupportUploadFile[]>();

  /** 列表刷新标识 */
  const [refreshFlag, setRefreshFlag] = useState(false);

  /** 获取支撑材料上传的列表 */
  useEffect(() => {
    if (treeNodeId && objectType) {
      getProcessDescDetail({ id: treeNodeId }).then(({ data }) => {
        const { supportFile } = data?.data || {};
        if (supportFile && typeof supportFile === 'string') {
          try {
            const parsedFileData = JSON.parse(supportFile) || [];
            setSupportFilesList(parsedFileData);
          } catch (error) {
            setSupportFilesList([]);
          }
        } else {
          setSupportFilesList([]);
        }
      });
    }
  }, [treeNodeId, objectType, refreshFlag]);

  const fileListBack = supportFilesList?.map(file => {
    const { fileName, fileId, fileUrl } = file || {};
    return {
      ...file,
      name: fileName,
      uid: fileId,
      url: fileUrl,
    };
  });

  return (
    <div className={style.supportFilesWrapper}>
      <div className={style.headerWrapper}>
        {I18N.carbonFootPrintLCA.supportingMaterials}
      </div>
      {showActionBtn && (
        <div className={style.tips}>{I18N.carbonFootPrintLCA.supportPdf}</div>
      )}
      <SupportFilesUpload<SupportUploadFile & UploadFileProps>
        disabled={!showActionBtn}
        fileList={fileListBack || []}
        onChange={async (
          uploadFileList: (SupportUploadFile & UploadFileProps)[],
          selectedFileList: UploadFile[],
        ) => {
          const newArr: SupportUploadFile[] = [];
          const ids = selectedFileList.map(v => v.uid);
          const newFileListBack = uploadFileList.filter(v => v.url);
          /** 过滤出上传完成的文件 */
          newFileListBack?.forEach(file => {
            if (!file.uid) {
              return;
            }
            if (
              ids.includes(file.uid) &&
              ![...(newArr.map(v => v.fileId) || [])].includes(file.uid)
            ) {
              newArr.push({
                objectId: treeNodeId,
                objectType,
                fileId: file.uid,
                fileUrl: file.url,
                fileName: file.name,
              });
            }
          });

          /** 新上传的文件个数应与选择的个数相同 */
          if (newArr.length !== selectedFileList.length) {
            return;
          }

          let fileLists = newArr;

          if (supportFilesList && supportFilesList.length) {
            fileLists = [...supportFilesList, ...newArr];
          }
          await postProcessManageSupportFilesEdit({
            id: Number(treeNodeId),
            supportFile: JSON.stringify(fileLists),
          });
          setRefreshFlag(!refreshFlag);
        }}
      />
      <FileList
        showActionBtn={showActionBtn}
        fileList={supportFilesList}
        remove={async fileId => {
          const removedFileList = supportFilesList?.filter(
            file => file?.fileId !== fileId,
          );
          await postProcessManageSupportFilesEdit({
            id: Number(treeNodeId),
            supportFile: JSON.stringify(removedFileList),
          });
          setRefreshFlag(!refreshFlag);
        }}
      />
    </div>
  );
};
export default SupportFiles;
