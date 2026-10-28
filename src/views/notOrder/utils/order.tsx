/** @author wangjiahui */
import { HomePage } from '@src/components/Homepage';
import { ProductIdentification } from '@src/utils/consts';
import IntroPage from '@src/views/Certification/carbonFootprintCertification/IntroPage';
import PurchasPage from '@src/views/becomeSupplierOrPurchasing/purchasingManagement';
import SupplierPage from '@src/views/becomeSupplierOrPurchasing/supplierManagement';
import CarbonAccountHome from '@src/views/carbonAccount/home';
import CarbonDatatHome from '@src/views/carbonDataManagemen/home';
import CarbonFootprintFlag from '@src/views/carbonFootprint/xhome';
import { CarbonFootprint3HomeConfig } from '@src/views/carbonFootprint3/index/config';
import EnterpriseCarbonAccounting from '@src/views/enterpriseCarbonAccount2/home';
import SupplyChain2 from '@src/views/supplyChain2/home';

/** 存放控制无订单的产品项 */
export const noOrderPageData = [
  {
    typeName: ProductIdentification.CARBON_ACCOUNT,
    components: <CarbonAccountHome noOrder />,
  },
  {
    typeName: ProductIdentification.PURCHASER,
    components: <PurchasPage noOrder />,
  },
  {
    typeName: ProductIdentification.SUPPLIER,
    components: <SupplierPage noOrder />,
  },
  {
    typeName: ProductIdentification.CARBON_DATA_MANAGE,
    components: <CarbonDatatHome noOrder />,
  },
  {
    typeName: `${ProductIdentification.Enterprise_Carbon_Accounting}?`,
    components: <EnterpriseCarbonAccounting noOrder />,
  },
  {
    // 产品碳足迹-旗舰版本
    typeName: ProductIdentification.CarbonFootprint_Flag,
    components: <CarbonFootprintFlag noOrder />,
  },
  {
    // 产品碳足迹-旗舰版本
    typeName: ProductIdentification.SupplyChain2,
    components: <SupplyChain2 noOrder />,
  },
  {
    // 产品碳足迹-旗舰版本
    typeName: ProductIdentification.CarbonFootprint_3,
    components: <HomePage {...CarbonFootprint3HomeConfig} />,
  },

  {
    typeName: ProductIdentification.Certification_Intro,
    components: <IntroPage />,
  },
];
