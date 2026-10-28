import I18N from '@src/lang/I18N';
import { UploadFile } from 'antd/lib/upload';
import { useEffect, useState } from 'react';

import { InfoTitle } from '@/components/InfoTitle';
import { SupportFilesUpload } from '@/components/SupportFilesUpload';

import FileList from './FileList';
import { OBJECT_TYPE } from './constant';
import style from './index.module.less';
import { SupportUploadFile } from './type';
import { getGeneralInfoDetail, putGeneralInfoEdit } from '../../../service';
import { GeneralInfoProps } from '../../../type';

const { PROCESS_SUPPORT, PRODUCT_SUPPORT } = OBJECT_TYPE;

interface SupportFilesProps {
  /** 是否展示操作按钮 */
  showActionBtn: boolean;
  /** 支撑材料的模块类型 */
  objectType: number;
  /** 当前cbamId */
  cbamId?: number;
}
interface UploadFileProps {
  name?: string;
  url?: string;
  uid?: string;
}

const SupportFiles = ({
  showActionBtn,
  objectType,
  cbamId,
}: SupportFilesProps) => {
  /** 支撑材料的列表 */
  const [supportFilesList, setSupportFilesList] =
    useState<SupportUploadFile[]>();

  /** 列表刷新标识 */
  const [refreshFlag, setRefreshFlag] = useState(false);

  /** 获取支撑材料上传的列表 */
  useEffect(() => {
    if (cbamId && objectType) {
      getGeneralInfoDetail({ id: cbamId }).then(({ data }) => {
        const { processSupport, productSupport } = data?.data || {};
        // 工业过程
        if (objectType === PROCESS_SUPPORT) {
          if (processSupport && typeof processSupport === 'string') {
            try {
              const parsedFileData = JSON.parse(processSupport) || [];
              setSupportFilesList(parsedFileData);
            } catch (error) {
              setSupportFilesList([]);
            }
          } else {
            setSupportFilesList([]);
          }
        }

        // 产品数据
        if (objectType === PRODUCT_SUPPORT) {
          if (productSupport && typeof productSupport === 'string') {
            try {
              const parsedFileData = JSON.parse(productSupport) || [];
              setSupportFilesList(parsedFileData);
            } catch (error) {
              setSupportFilesList([]);
            }
          } else {
            setSupportFilesList([]);
          }
        }
      });
    }
  }, [cbamId, objectType, refreshFlag]);

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
      <InfoTitle title={I18N.supplyChainCarbonManagement.evidenceMaterials} />
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
                objectId: cbamId,
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

          let result: GeneralInfoProps = { id: Number(cbamId) };
          // 工业过程
          if (objectType === PROCESS_SUPPORT) {
            result = {
              ...result,
              processSupport: JSON.stringify(fileLists),
            };
          }
          // 产品数据
          if (objectType === PRODUCT_SUPPORT) {
            result = {
              ...result,
              productSupport: JSON.stringify(fileLists),
            };
          }
          await putGeneralInfoEdit(result);

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

          let result: GeneralInfoProps = { id: Number(cbamId) };
          // 工业过程
          if (objectType === PROCESS_SUPPORT) {
            result = {
              ...result,
              processSupport: JSON.stringify(removedFileList),
            };
          }
          // 产品数据
          if (objectType === PRODUCT_SUPPORT) {
            result = {
              ...result,
              productSupport: JSON.stringify(removedFileList),
            };
          }
          await putGeneralInfoEdit(result);

          setRefreshFlag(!refreshFlag);
        }}
      />
    </div>
  );
};
export default SupportFiles;
