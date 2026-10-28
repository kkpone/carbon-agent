/**
 * @description 产品管理-生命周期数据-导入
 */
import { useParams } from 'react-router-dom';

import ImportFile from '@/components/ImportFile';
import {
  IMPORT_RECORD_TYPE,
  TEMPLATE_FILE_TYPE,
} from '@/components/ImportFile/constants';
import { LCARouteMaps } from '@/router/utils/lcaEnumsnew';
import { useNavigate } from '@/utils/polyfill';
import { FileType } from '@/views/components/utils/types';

import { TAB_TYPE } from '../../constant';
import { postLifeCycleDataImport } from '../service';

const { LIFECYCLE_DATA } = TAB_TYPE;

const { LIFE_CYCLE_DATA } = IMPORT_RECORD_TYPE;
const { LCA_LIFE_CYCLE } = TEMPLATE_FILE_TYPE;

export default function LifeCycleDataImport() {
  const navigate = useNavigate();

  /** 产品id */
  const { productId } = useParams<{ productId: string }>();

  return (
    <ImportFile
      importType={LIFE_CYCLE_DATA}
      templateType={LCA_LIFE_CYCLE}
      dataId={Number(productId)}
      onImportFile={async (
        { name, url }: FileType,
        successCallBack: () => void,
        failCallBack: () => void,
      ) => {
        if (!productId) return;
        try {
          await postLifeCycleDataImport({
            fileName: name,
            fileUrl: url,
            productId: Number(productId),
          });
          successCallBack();
        } catch (error) {
          failCallBack();
        }
      }}
      onBack={() => {
        navigate({
          pathname: LCARouteMaps.lcaProductionManage.replace(
            ':productId',
            `${productId}`,
          ),
          search: `?currentStep=${LIFECYCLE_DATA}`,
        });
      }}
    />
  );
}
