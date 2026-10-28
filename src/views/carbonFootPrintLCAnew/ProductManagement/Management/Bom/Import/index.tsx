/**
 * @description 导入BOM
 */
import I18N, { LocaleType } from '@src/lang/I18N';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';

import ImportFile from '@/components/ImportFile';
import {
  IMPORT_RECORD_TYPE,
  TEMPLATE_FILE_TYPE,
} from '@/components/ImportFile/constants';
import { LocaleContext } from '@/components/LocaleProvider';
import { LCARouteMaps } from '@/router/utils/lcaEnumsnew';
import { useNavigate } from '@/utils/polyfill';
import { FileType } from '@/views/components/utils/types';

import { TAB_TYPE } from '../../constant';
import { postImportBom } from '../service';

const { PRODUCT_BOM } = TAB_TYPE;

const { BOM } = IMPORT_RECORD_TYPE;

const { BOM_ZH } = TEMPLATE_FILE_TYPE;
function Import() {
  const navigate = useNavigate();
  const { locale } = useContext(LocaleContext);

  /** 模版文件类型 */
  const templateType = locale === LocaleType.enUS ? BOM_ZH : BOM_ZH;

  /** 产品id */
  const { productId } = useParams<{ productId: string }>();

  return (
    <ImportFile
      importType={BOM}
      templateType={templateType}
      dataId={Number(productId)}
      downloadTemplateTips={I18N.carbonFootPrintLCA.downloadBom}
      onImportFile={async (
        { name, url }: FileType,
        successCallBack: () => void,
        failCallBack: () => void,
      ) => {
        if (!productId) return;
        try {
          await postImportBom({
            fileName: name,
            fileUrl: url,
            productId,
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
          search: `?currentStep=${PRODUCT_BOM}`,
        });
      }}
    />
  );
}
export default Import;
