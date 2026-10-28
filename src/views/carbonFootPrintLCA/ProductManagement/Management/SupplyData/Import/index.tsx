/**
 * @description 导入
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
import { LCARouteMaps } from '@/router/utils/lcaEnums';
import { useNavigate } from '@/utils/polyfill';
import { FileType } from '@/views/components/utils/types';

import { TAB_TYPE } from '../../constant';
import { postImportSupplyData } from '../service';

const { SUPPLY_DATA } = TAB_TYPE;

const { SUPPLIER_DATA } = IMPORT_RECORD_TYPE;

const { LCA_SUPPLY_ZH } = TEMPLATE_FILE_TYPE;
function Import() {
  const navigate = useNavigate();
  const { locale } = useContext(LocaleContext);

  /** 模版文件类型 */
  const templateType =
    locale === LocaleType.enUS ? LCA_SUPPLY_ZH : LCA_SUPPLY_ZH;

  /** 产品id */
  const { productId } = useParams<{ productId: string }>();

  return (
    <ImportFile
      importType={SUPPLIER_DATA}
      templateType={templateType}
      dataId={Number(productId)}
      downloadTemplateTips={I18N.carbonFootPrintLCA.downloadSuppliers}
      onImportFile={async (
        { name, url }: FileType,
        successCallBack: () => void,
        failCallBack: () => void,
      ) => {
        if (!productId) return;
        try {
          await postImportSupplyData({
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
          search: `?currentStep=${SUPPLY_DATA}`,
        });
      }}
    />
  );
}
export default Import;
