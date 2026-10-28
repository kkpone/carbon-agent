import { FootprintAccountProductStatus } from './constants';
import { AddFileDataAndUid } from '../../type';

export type FormAccountProductDrawerProps = {
  visible: boolean;
  isEdit?: boolean;
  initValues?: InitValuesData;
  productType?: string;
  /** add, edit, detail */
  status: FootprintAccountProductStatus;
  onCancelClick: () => void;
  onSubClick: (data: SubAccountProductFormData) => Promise<any>;
  subFormAndAccount?: (data: SubAccountProductFormData) => Promise<any>;
};

/** 初始化需要的参数 */
export type InitValuesData = Omit<
  SubAccountProductFormData,
  'accountUnitCode'
> & {
  accountUnitCode: string;
  unitName?: string;
  unitCode?: string;
};

/** 提交表单返回值 */
export type SubAccountProductFormData = {
  accountUnitCode: string[];
  accountUnitName: string;
  accountName?: string;

  productCode: string;
  productName: string;
  files?: AddFileDataAndUid[];
  perUnitCode?: string;
  perUnitName?: string;
  perWeight?: string;
  productDesc?: string;
  productPic?: AddFileDataAndUid[];
  specification?: string;
  techDesc?: string;
  productType?: string;
  productTypeName?: string;
  productTypeObj?: {
    id: string;
    name: string;
    isManualInput: boolean;
  };
};
