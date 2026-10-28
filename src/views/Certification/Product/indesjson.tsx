import I18N from '@src/lang/I18N';
import IconFont from '@src/components/iconfont';
import Permission from '@src/components/Permission';
import VerifyUtils from '@src/utils/verifty';
import { Button, Dropdown, Input, Menu, Select, Tooltip } from 'antd';
import style from './index.module.scss';

const ossPath = process.env.REACT_APP_API_URL_OSS;

// 列表中的更多底下展示的内容
const menu = (list, handleClick, record) => (
  <Menu>
    {list.map(item => (
      <Permission flag={item.flag}>
        <Menu.Item>
          <span
            // eslint-disable-next-line consistent-return
            onClick={() => {
              if (item.label === I18N.Certification.modifyProject) {
                sessionStorageItem(record);

                return handleClick(
                  'url',
                  `${item.urlPath}?id=${record.projectId}`,
                );
              }
              if (item.url) {
                sessionStorageItem(record);
                handleClick('url', `${item.urlPath}?${record.projectId}`);
              } else {
                handleClick('handle', {
                  itemlist: item,
                  recoedList: record,
                });
              }
            }}
          >
            {item.label}
          </span>
        </Menu.Item>
      </Permission>
    ))}
  </Menu>
);
const product_Specifications = [
  {
    title: I18N.Certification.sgsGreenhouse,
    text: I18N.Certification.professionalAndAccurate,
    isfirst: I18N.Certification.nonInitialVerification,
    firsttext: I18N.Certification.seedEmissionSources3,
    url: '/Certification/Enterprise/apply',
    json: {
      productName: I18N.Certification.sgsGreenhouse,
      list: [
        {
          key: I18N.Certification.scopeThreeIncludes,
          value: I18N.Certification.class,
        },
        {
          key: I18N.Certification.certificationBodies,
          value: 'SGS',
        },
        {
          key: I18N.Certification.officeBuildingsAndFactories,
          value: I18N.Certification.building,
        },
        {
          key: I18N.Certification.industryType,
          value: I18N.Certification.anyOtherRow,
        },
        {
          key: I18N.Certification.greenhouseGasEmissions,
          value: I18N.Certification.species4,
        },

        {
          key: I18N.Certification.onSiteInvestigationSurface,
          value: I18N.Certification.belowSquareMeters,
        },
        {
          key: I18N.Certification.usedByTheCompany,
          value: I18N.Certification.species,
        },
        {
          key: I18N.Certification.numberOfEmployeesInTheEnterprise,
          value: I18N.Certification.people,
        },
        {
          key: I18N.Certification.isItTheFirstTimeToVerify,
          value: I18N.Certification.nonInitialVerification,
        },
      ],
    },
    list: [
      {
        name: (
          <span>
            {I18N.Certification.buildingAreaM}
            <sup>2</sup>
          </span>
        ),
        value: I18N.Certification.below10000Yuan,
      },
      {
        name: I18N.Certification.buildingBuilding,
        value: '1-5',
      },
      {
        name: I18N.Certification.numberOfEmployeesPerPerson,
        value: '1-2000',
      },
    ],
    price: '¥ 21000.00',
    unit: I18N.Certification.second,
  },
  {
    title: I18N.Certification.sgsGreenhouse,
    text: I18N.Certification.professionalAndAccurate,
    isfirst: I18N.Certification.nonInitialVerification,
    firsttext: I18N.Certification.seedEmissionSources2,

    json: {
      productName: I18N.Certification.sgsGreenhouse,
      list: [
        {
          key: I18N.Certification.scopeThreeIncludes,
          value: I18N.Certification.class,
        },
        {
          key: I18N.Certification.certificationBodies,
          value: 'SGS',
        },
        {
          key: I18N.Certification.officeBuildingsAndFactories,
          value: I18N.Certification.building,
        },
        {
          key: I18N.Certification.industryType,
          value: I18N.Certification.anyOtherRow,
        },
        {
          key: I18N.Certification.greenhouseGasEmissions,
          value: I18N.Certification.species3,
        },

        {
          key: I18N.Certification.onSiteInvestigationSurface,
          value: I18N.Certification.belowSquareMeters,
        },
        {
          key: I18N.Certification.usedByTheCompany,
          value: I18N.Certification.species,
        },
        {
          key: I18N.Certification.numberOfEmployeesInTheEnterprise,
          value: I18N.Certification.people,
        },
        {
          key: I18N.Certification.isItTheFirstTimeToVerify,
          value: I18N.Certification.nonInitialVerification,
        },
      ],
    },
    list: [
      {
        name: (
          <span>
            {I18N.Certification.buildingAreaM}
            <sup>2</sup>
          </span>
        ),
        value: I18N.Certification.below10000Yuan,
      },
      {
        name: I18N.Certification.buildingBuilding,
        value: '1-5',
      },
      {
        name: I18N.Certification.numberOfEmployeesPerPerson,
        value: '1-2000',
      },
    ],
    price: '¥ 22000.00',
    unit: I18N.Certification.second,
  },
  {
    title: I18N.Certification.sgsGreenhouse,
    text: I18N.Certification.professionalAndAccurate,
    isfirst: I18N.Certification.nonInitialVerification,
    firsttext: I18N.Certification.seedEmissionSources,

    json: {
      productName: I18N.Certification.sgsGreenhouse,
      list: [
        {
          key: I18N.Certification.scopeThreeIncludes,
          value: I18N.Certification.class,
        },
        {
          key: I18N.Certification.certificationBodies,
          value: 'SGS',
        },
        {
          key: I18N.Certification.officeBuildingsAndFactories,
          value: I18N.Certification.building,
        },
        {
          key: I18N.Certification.industryType,
          value: I18N.Certification.anyOtherRow,
        },
        {
          key: I18N.Certification.greenhouseGasEmissions,
          value: I18N.Certification.species2,
        },

        {
          key: I18N.Certification.onSiteInvestigationSurface,
          value: I18N.Certification.belowSquareMeters,
        },
        {
          key: I18N.Certification.usedByTheCompany,
          value: I18N.Certification.species,
        },
        {
          key: I18N.Certification.numberOfEmployeesInTheEnterprise,
          value: I18N.Certification.people,
        },
        {
          key: I18N.Certification.isItTheFirstTimeToVerify,
          value: I18N.Certification.nonInitialVerification,
        },
      ],
    },
    list: [
      {
        name: (
          <span>
            {I18N.Certification.buildingAreaM}
            <sup>2</sup>
          </span>
        ),
        value: I18N.Certification.below10000Yuan,
      },
      {
        name: I18N.Certification.buildingBuilding,
        value: '1-5',
      },
      {
        name: I18N.Certification.numberOfEmployeesPerPerson,
        value: '1-2000',
      },
    ],
    price: '¥ 23500.00',
    unit: I18N.Certification.second,
  },
];
// 点击立即申请时需要将储存的内容进行以下转换
const filterItem = (item: any) => {
  const typeItem =
    item.type === 0
      ? {
          productName: I18N.Certification.sgsGreenhouse,
          list: [
            {
              key: I18N.Certification.scopeThreeIncludes,
              value: 'method',
            },
            {
              key: I18N.Certification.certificationBodies,
              value: 'organizationName',
            },
            {
              key: I18N.Certification.officeBuildingsAndFactories,
              value: 'building',
            },
            {
              key: I18N.Certification.industryType,
              value: 'industryType',
            },
            {
              key: I18N.Certification.greenhouseGasEmissions,
              value: 'emission',
            },

            {
              key: I18N.Certification.onSiteInvestigationSurface,
              value: 'coveredArea',
            },
            {
              key: I18N.Certification.usedByTheCompany,
              value: 'cycleDate',
            },
            {
              key: I18N.Certification.numberOfEmployeesInTheEnterprise,
              value: 'employee',
            },
            {
              key: I18N.Certification.isItTheFirstTimeToVerify,
              value: 'purpose',
            },
          ],
        }
      : {
          productName: I18N.Certification.sgsGreenhouse,
          list: [
            {
              key: I18N.Certification.certificationBodies,
              value: 'organizationName',
            },
            {
              key: I18N.Certification.companysProducts,
              value: 'cycleDate',
            },
            {
              key: I18N.Certification.industryType,
              value: 'industryType',
            },
            {
              key: I18N.Certification.productLifecycle,
              value: 'method',
            },
            {
              key: I18N.Certification.onSiteInvestigationSurface,
              value: 'coveredArea',
            },

            {
              key: I18N.Certification.numberOfEmployeesInTheEnterprise,
              value: 'employee',
            },
            {
              key: I18N.Certification.isItTheFirstTimeToVerify,
              value: 'purpose',
            },
            {
              key: I18N.Certification.theHierarchyOfTraceability,
              value: 'building',
            },
            {
              key: I18N.Certification.typesOfRawMaterials,
              value: 'emission',
            },
          ],
        };
  const list: any = {
    productName: item.projectName,
    list: [],
  };
  typeItem.list.forEach((atem: { key: string; value: string }) => {
    const keyItem = {
      key: atem.key,
      value: item[atem.value],
    };
    list.list.push(keyItem);
  });
  return list;
};
export const sessionStorageItem = (item: any) => {
  localStorage.setItem('initSelect', JSON.stringify(filterItem(item)));
};
// 企业碳核查-产品规格-内容
const Enterprise_Specifications = [
  {
    title: I18N.Certification.sgsProducts,
    text: I18N.Certification.increaseProductPrices,
    isfirst: I18N.Certification.nonInitialVerification,
    firsttext: I18N.Certification.seedProducts3,
    url: '/Certification/Product/apply',
    json: {
      // 点击立即申请时要存到内存中的内容
      productName: I18N.Certification.sgsProducts,
      list: [
        {
          key: I18N.Certification.certificationBodies,
          value: 'SGS',
        },
        {
          key: I18N.Certification.companysProducts,
          value: '1-2',
        },
        {
          key: I18N.Certification.productLifecycle,
          value: '1',
        },
        {
          key: I18N.Certification.onSiteInvestigationSurface,
          value: I18N.Certification.belowSquareMeters,
        },
        {
          key: I18N.Certification.numberOfEmployeesInTheEnterprise,
          value: I18N.Certification.people,
        },
        {
          key: I18N.Certification.isItTheFirstTimeToVerify,
          value: I18N.Certification.nonInitialVerification,
        },
        {
          key: I18N.Certification.theHierarchyOfTraceability,
          value: '1',
        },
        {
          key: I18N.Certification.typesOfRawMaterials,
          value: '1-5',
        },
        {
          key: I18N.Certification.industryType,
          value: I18N.Certification.anyOtherRow,
        },
      ],
      // [
      //   {
      //     key:'',
      //     b
      //   }
      //   'SGS', // 5000
      //   '非首次核查', //0.8625
      //   '0类', // 0
      //   '其他任何行业', // 2
      //   '1-2', // 0.75
      //   '20000平方米以下', // 0.75
      //   '1-5', // 0.75
      //   '1-2000人', // 0.75
      //   '1级', // 0.75
      //   '1个', // 0.75
      // ],
    },
    list: [
      {
        name: <span>{I18N.Certification.traceabilityLevel}</span>,
        value: '1',
      },
      {
        name: I18N.Certification.rawMaterialType,
        value: '1-5',
      },
      {
        name: (
          <span>
            {I18N.Certification.onSiteAreaM}
            <sup>2</sup>
          </span>
        ),
        value: I18N.Certification.below10000Yuan,
      },
    ],
    price: '¥ 26000.00',
    unit: I18N.Certification.second,
  },
  {
    title: I18N.Certification.sgsProducts,
    text: I18N.Certification.increaseProductPrices,
    isfirst: I18N.Certification.nonInitialVerification,
    firsttext: I18N.Certification.seedProducts2,

    json: {
      productName: I18N.Certification.sgsProducts,
      list: [
        {
          key: I18N.Certification.certificationBodies,
          value: 'SGS',
        },
        {
          key: I18N.Certification.companysProducts,
          value: '3-4',
        },
        {
          key: I18N.Certification.productLifecycle,
          value: '1',
        },
        {
          key: I18N.Certification.onSiteInvestigationSurface,
          value: I18N.Certification.belowSquareMeters,
        },
        {
          key: I18N.Certification.numberOfEmployeesInTheEnterprise,
          value: I18N.Certification.people,
        },
        {
          key: I18N.Certification.isItTheFirstTimeToVerify,
          value: I18N.Certification.nonInitialVerification,
        },
        {
          key: I18N.Certification.theHierarchyOfTraceability,
          value: '1',
        },
        {
          key: I18N.Certification.typesOfRawMaterials,
          value: '1-5',
        },
        {
          key: I18N.Certification.industryType,
          value: I18N.Certification.anyOtherRow,
        },
      ],
      // [
      //   {
      //     key:'',
      //     b
      //   }
      //   'SGS', // 5000
      //   '非首次核查', //0.8625
      //   '0类', // 0
      //   '其他任何行业', // 2
      //   '1-2', // 0.75
      //   '20000平方米以下', // 0.75
      //   '1-5', // 0.75
      //   '1-2000人', // 0.75
      //   '1级', // 0.75
      //   '1个', // 0.75
      // ],
    },
    list: [
      {
        name: <span>{I18N.Certification.traceabilityLevel}</span>,
        value: '1',
      },
      {
        name: I18N.Certification.rawMaterialType,
        value: '1-5',
      },
      {
        name: (
          <span>
            {I18N.Certification.onSiteAreaM}
            <sup>2</sup>
          </span>
        ),
        value: I18N.Certification.below10000Yuan,
      },
    ],
    price: '¥ 28500.00',
    unit: I18N.Certification.second,
  },
  {
    title: I18N.Certification.sgsProducts,
    text: I18N.Certification.increaseProductPrices,
    isfirst: I18N.Certification.nonInitialVerification,
    firsttext: I18N.Certification.seedProducts,

    json: {
      productName: I18N.Certification.sgsProducts,
      list: [
        {
          key: I18N.Certification.certificationBodies,
          value: 'SGS',
        },
        {
          key: I18N.Certification.companysProducts,
          value: '5-6',
        },
        {
          key: I18N.Certification.productLifecycle,
          value: '1',
        },
        {
          key: I18N.Certification.onSiteInvestigationSurface,
          value: I18N.Certification.belowSquareMeters,
        },
        {
          key: I18N.Certification.numberOfEmployeesInTheEnterprise,
          value: I18N.Certification.people,
        },
        {
          key: I18N.Certification.isItTheFirstTimeToVerify,
          value: I18N.Certification.nonInitialVerification,
        },
        {
          key: I18N.Certification.theHierarchyOfTraceability,
          value: '1',
        },
        {
          key: I18N.Certification.typesOfRawMaterials,
          value: '1-5',
        },
        {
          key: I18N.Certification.industryType,
          value: I18N.Certification.anyOtherRow,
        },
      ],
      // [
      //   {
      //     key:'',
      //     b
      //   }
      //   'SGS', // 5000
      //   '非首次核查', //0.8625
      //   '0类', // 0
      //   '其他任何行业', // 2
      //   '1-2', // 0.75
      //   '20000平方米以下', // 0.75
      //   '1-5', // 0.75
      //   '1-2000人', // 0.75
      //   '1级', // 0.75
      //   '1个', // 0.75
      // ],
    },
    list: [
      {
        name: <span>{I18N.Certification.traceabilityLevel}</span>,
        value: '1',
      },
      {
        name: I18N.Certification.rawMaterialType,
        value: '1-5',
      },
      {
        name: (
          <span>
            {I18N.Certification.onSiteAreaM}
            <sup>2</sup>
          </span>
        ),
        value: I18N.Certification.below10000Yuan,
      },
    ],
    price: '¥ 30500.00',
    unit: I18N.Certification.second,
  },
];
// 将列表中的record传进来根据不同的value来展示不同的操作列表
export const ProductStatus = (status: string) => {
  // 【项目流程对应的status，提交文字】
  const statusList = [
    {
      value: '1', // 状态为1时代表是项目审核中
      label: I18N.Certification.projectReviewInProgress,
      style: style.watingColor, // 状态对应的背景色以及文字颜色的样式类名
      text: I18N.Certification.applicationSubmitted, // 提交时的提交文字
      btnlist: [
        // 状态为某个数值时所对应的操作
        {
          value: '12',
          label: I18N.Certification.withdraw,
          text: I18N.Certification.cancelledTheApplication,
          flag: 'Certification:Product:product:cancel', // 产品碳足迹的按钮权限
          EnterpriseFlag: 'Certification:Product:Enterprise:cancel', // 企业碳核查的按钮权限
          url: false, // 是页面跳转还是当前页面直接进行操作【true页面跳转】【false，当前页面按钮操作】
        },
      ],
    },
    {
      value: '2',
      label: I18N.Certification.projectRejected,
      text: I18N.Certification.rejectedTheApplication,
      style: style.failColor,
      btnlist: [
        {
          value: '12',
          label: I18N.Certification.withdraw,
          url: false,
          text: I18N.Certification.cancelledTheApplication,
          flag: 'Certification:Product:product:cancel',
          EnterpriseFlag: 'Certification:Product:Enterprise:cancel',
        },
        {
          value: '1',
          label: I18N.Certification.modifyProject,
          url: true,
          flag: 'Certification:Product:product:edit',
          EnterpriseFlag: 'Certification:Enterprise:EditApply',
          urlPath: '/Certification/Product/product/EditApply',
          enterprisePath: '/Certification/Enterprise/EditApply',
        },
      ],
    },
    {
      value: '3',
      label: I18N.Certification.materialsToBeSubmitted,
      text: I18N.Certification.approvedApplication,
      style: style.dattiingColor,
      btnlist: [
        {
          value: '12',
          label: I18N.Certification.withdraw,
          url: false,
          text: I18N.Certification.cancelledTheApplication,
          flag: 'Certification:Product:product:cancel',
          EnterpriseFlag: 'Certification:Product:Enterprise:cancel',
        },
        {
          value: '4',
          urlPath: '/Certification/Product/product/submissions',
          enterprisePath: '/Certification/Enterprise/product/submissions',
          flag: 'Certification:Product:product:submissions',
          EnterpriseFlag: 'Certification:Enterprise:product:submissions',
          label: I18N.Certification.submitMaterials,
          url: true,
        },
      ],
    },
    {
      value: '4',
      label: I18N.Certification.contractPaymentInProgress,
      text: I18N.Certification.submittedForVerification,
      style: style.watingColor,
      btnlist: [
        {
          value: '12',
          label: I18N.Certification.withdraw,
          url: false,
          text: I18N.Certification.cancelledTheApplication,
          flag: 'Certification:Product:product:cancel',
          EnterpriseFlag: 'Certification:Product:Enterprise:cancel',
        },
        {
          value: '3',
          label: I18N.Certification.withdrawModifications,
          text: I18N.Certification.revokedModifications,
          flag: 'Certification:Product:product:back',
          EnterpriseFlag: 'Certification:Product:Enterprise:back',
          url: false,
        },
      ],
    },
    {
      value: '5',
      label: I18N.Certification.documentReviewInProgress,
      text: I18N.Certification.submittedForVerification,
      style: style.watingColor,
      btnlist: [],
    },
    {
      value: '6',
      style: style.dattiingColor,
      label: I18N.Certification.materialsToBeModified,
      btnlist: [
        {
          value: '5',
          label: I18N.Certification.modifyMaterials,
          urlPath: '/Certification/Product/product/edit',
          enterprisePath: '/Certification/Enterprise/product/edit',
          flag: 'Certification:Product:product:edit',
          EnterpriseFlag: 'Certification:Product:Enterprise:edit',
          url: true,
        },
      ],
    },
    {
      value: '7',
      label: I18N.Certification.pendingOnSiteInvestigation,
      style: style.watingColor,
      btnlist: [],
    },
    {
      value: '8',
      label: I18N.Certification.onSiteInvestigation,
      style: style.dattiingColor,
      btnlist: [],
    },
    {
      value: '9',
      label: I18N.Certification.certificateToBeIssued,
      style: style.dattiingColor,
      btnlist: [],
    },
    {
      value: '10',
      label: I18N.Certification.certificateIssued,
      style: style.dattiingColor,
      btnlist: [
        {
          value: '11',
          label: I18N.Certification.confirmReceiptOfCertificate,
          text: I18N.Certification.confirmedReceipt,
          flag: 'Certification:Product:product:confirm',
          EnterpriseFlag: 'Certification:Product:Enterprise:confirm',
          url: false,
        },
      ],
    },
    {
      value: '11',
      label: I18N.Certification.verificationCompleted,
      style: style.dattiingColor,
      btnlist: [],
    },
    {
      value: '12',
      label: I18N.Certification.projectCancelled,
      style: style.dattiingColor,
      btnlist: [],
    },
  ];
  const statusFilter = statusList.filter(
    (item: { value: string }) => Number(item.value) === Number(status),
  );
  return statusFilter[0];
};
// 搜索列表的项目状态
export const ProductStatuslist = () => {
  const statusList = [
    {
      value: '1',
      label: I18N.Certification.projectReviewInProgress,
      style: style.watingColor,
      text: I18N.Certification.applicationSubmitted,
      btnlist: [
        {
          value: '12', // 状态数值
          label: I18N.Certification.withdraw, // 状态名称
          text: I18N.Certification.cancelledTheApplication, // 提交时对应的操作文字
          flag: 'Certification:Product:product:cancel', // 产品碳足迹按钮权限
          EnterpriseFlag: 'Certification:Product:Enterprise:cancel', // 企业碳核查按钮权限
          url: false,
        },
      ],
    },
    {
      value: '2',
      label: I18N.Certification.projectRejected,
      text: I18N.Certification.rejectedTheApplication,
      style: style.failColor,
      btnlist: [
        {
          value: '12',
          label: I18N.Certification.withdraw,
          url: false,
          text: I18N.Certification.cancelledTheApplication,
          flag: 'Certification:Product:product:cancel',
          EnterpriseFlag: 'Certification:Product:Enterprise:cancel',
        },
        {
          value: '1',
          label: I18N.Certification.modifyProject,
          url: true,
          flag: 'Certification:Product:product:edit',
          EnterpriseFlag: 'Certification:Enterprise:EditApply',
          urlPath: '/Certification/Product/product/EditApply',
          enterprisePath: '/Certification/Enterprise/EditApply',
        },
      ],
    },
    {
      value: '3',
      label: I18N.Certification.materialsToBeSubmitted,
      text: I18N.Certification.approvedApplication,
      style: style.dattiingColor,
      btnlist: [
        {
          value: '12',
          label: I18N.Certification.withdraw,
          url: false,
          text: I18N.Certification.cancelledTheApplication,
          flag: 'Certification:Product:product:cancel',
          EnterpriseFlag: 'Certification:Product:Enterprise:cancel',
        },
        {
          value: '4',
          urlPath: '/Certification/Product/product/submissions',
          enterprisePath: '/Certification/Enterprise/product/submissions',
          flag: 'Certification:Product:product:submissions',
          EnterpriseFlag: 'Certification:Enterprise:product:submissions',
          label: I18N.Certification.submitMaterials,
          url: true,
        },
      ],
    },
    {
      value: '4',
      label: I18N.Certification.contractPaymentInProgress,
      text: I18N.Certification.submittedForVerification,
      style: style.watingColor,
      btnlist: [
        {
          value: '12',
          label: I18N.Certification.withdraw,
          url: false,
          text: I18N.Certification.cancelledTheApplication,
          flag: 'Certification:Product:product:cancel',
          EnterpriseFlag: 'Certification:Product:Enterprise:cancel',
        },
        {
          value: '3',
          label: I18N.Certification.withdrawModifications,
          text: I18N.Certification.revokedModifications,
          flag: 'Certification:Product:product:back',
          EnterpriseFlag: 'Certification:Product:Enterprise:back',
          url: false,
        },
      ],
    },
    {
      value: '5',
      label: I18N.Certification.documentReviewInProgress,
      text: I18N.Certification.submittedForVerification,
      style: style.watingColor,
      btnlist: [],
    },
    {
      value: '6',
      style: style.dattiingColor,
      label: I18N.Certification.materialsToBeModified,
      btnlist: [
        {
          value: '5',
          label: I18N.Certification.modifyMaterials,
          urlPath: '/Certification/Product/product/edit',
          enterprisePath: '/Certification/Enterprise/product/edit',
          flag: 'Certification:Product:product:edit',
          EnterpriseFlag: 'Certification:Product:Enterprise:edit',
          url: true,
        },
      ],
    },
    {
      value: '7',
      label: I18N.Certification.pendingOnSiteInvestigation,
      style: style.watingColor,
      btnlist: [],
    },
    {
      value: '8',
      label: I18N.Certification.onSiteInvestigation,
      style: style.dattiingColor,
      btnlist: [],
    },
    {
      value: '9',
      label: I18N.Certification.certificateToBeIssued,
      style: style.dattiingColor,
      btnlist: [],
    },
    {
      value: '10',
      label: I18N.Certification.certificateIssued,
      style: style.dattiingColor,
      btnlist: [
        {
          value: '11',
          label: I18N.Certification.confirmReceiptOfCertificate,
          text: I18N.Certification.confirmedReceipt,
          flag: 'Certification:Product:product:confirm',
          EnterpriseFlag: 'Certification:Product:Enterprise:confirm',
          url: false,
        },
      ],
    },
    {
      value: '11',
      label: I18N.Certification.verificationCompleted,
      style: style.dattiingColor,
      btnlist: [],
    },
    {
      value: '12',
      label: I18N.Certification.projectCancelled,
      style: style.dattiingColor,
      btnlist: [],
    },
  ];
  return statusList;
};
// 列表页title，发起按钮名称，对应的按钮权限，以及搜索区域的内容
export const Productindexjson = (
  optionlist: any[],
  handleClick: (e: string, b: any) => void,
) => ({
  title: I18N.Certification.carbonFootprintVerification2,
  addBtn: {
    text: I18N.Certification.initiateVerificationApplication2,
    url: '',
    flag: 'Certification:Product:product:add',
  },
  detailUrl: '/Certification/Product/product/detail',
  searchFrom: [
    {
      label: I18N.carbonNeutral.entryName,
      name: 'projectName',
      hml: <Input placeholder={I18N.carbonFootprint.pleaseEnter} />,
    },
    {
      label: I18N.Certification.projectId,
      name: 'projectId',
      hml: <Input placeholder={I18N.carbonFootprint.pleaseEnter} />,
    },
    {
      label: I18N.carbonFootprint.state,
      name: 'status',
      hml: (
        <Select placeholder={I18N.carbonFootprint.pleaseSelect}>
          {optionlist.map((item: any) => (
            <Select.Option value={item.value}>{item.label}</Select.Option>
          ))}
        </Select>
      ),
    },
  ],
  searchTableColumns: [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
      width: 70,
      render: (roleName: string, record: any, index: number) => (
        <Tooltip title={index + 1} placement='topLeft'>
          {index + 1}
        </Tooltip>
      ),
    },
    {
      title: I18N.carbonNeutral.entryName,
      dataIndex: 'projectName',
      key: 'projectName',
      ellipsis: true,
      render: (roleName: string) => (
        <Tooltip title={roleName} placement='topLeft'>
          {roleName}
        </Tooltip>
      ),
    },
    {
      title: I18N.Certification.projectId,
      dataIndex: 'projectId',
      key: 'projectId',
      ellipsis: true,
      width: 140,
      render: (roleName: string) => (
        <Tooltip title={roleName} placement='topLeft'>
          {roleName}
        </Tooltip>
      ),
    },
    {
      title: I18N.Certification.estimatedCostInYuan,
      dataIndex: 'expenses',
      key: 'expenses',
      ellipsis: true,
      width: 140,
      render: (roleName: string) => (
        <Tooltip
          title={roleName === null ? '--' : roleName}
          placement='topLeft'
        >
          {roleName === null ? '--' : roleName}
        </Tooltip>
      ),
    },
    {
      title: I18N.Certification.actualCostInYuan,
      dataIndex: 'actualExpenses',
      key: 'actualExpenses',
      ellipsis: true,
      width: 140,
      render: (roleName: string) => (
        <Tooltip
          title={roleName === null ? '--' : roleName}
          placement='topLeft'
        >
          {roleName === null ? '--' : roleName}
        </Tooltip>
      ),
    },
    {
      title: I18N.carbonFootprint.state,
      dataIndex: 'status',
      key: 'status',
      ellipsis: true,
      width: 140,
      render: (roleName: string) => (
        <Tooltip title={ProductStatus(roleName).label} placement='topLeft'>
          <span className={ProductStatus(roleName).style}>
            {ProductStatus(roleName).label}
          </span>
        </Tooltip>
      ),
    },
    {
      title: I18N.Certification.creatorTime,
      dataIndex: 'createTime',
      key: 'createTime',
      ellipsis: true,
      width: 200,
      render: (roleName: string, record) => (
        <Tooltip
          title={`${`${record.userName}-`}${VerifyUtils.get_time(roleName)}`}
          placement='topLeft'
        >
          {`${record.userName}-`}
          {VerifyUtils.get_time(roleName)}
        </Tooltip>
      ),
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'status',
      key: 'status',
      ellipsis: true,
      width: 120,
      fixed: 'right',
      render: (roleName: string, record: { projectId: string }) => (
        <>
          {' '}
          <Permission flag='Certification:Product:product:detail'>
            <Button
              style={{ paddingLeft: '0px' }}
              type='link'
              onClick={() => {
                handleClick('detail', record.projectId);
              }}
            >
              {I18N.carbonFootprint3.details}
            </Button>
          </Permission>
          {ProductStatus(roleName).btnlist.length > 0 ? (
            <Dropdown
              overlay={menu(
                ProductStatus(roleName).btnlist,
                handleClick,
                record,
              )}
            >
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a
                className='ant-dropdown-link'
                onClick={e => e.preventDefault()}
              >
                {I18N.Certification.more}
                <IconFont type='icon-icon-zhankai' />
              </a>
            </Dropdown>
          ) : (
            ''
          )}
        </>
      ),
    },
  ],
});
// 企业碳核查、产品碳足迹介绍页的
export const Enterprise_verification_index = (url: string) => {
  const list = [
    {
      url: '/Certification/Enterprise/index',
      list: {
        // bg: `${ossPath}/saas-authentication/bg.jpeg`,
        left_icon: `${ossPath}/saas-authentication/city.png`, // 右方iccon
        url: '/Certification/Enterprise/apply',
        addul: '/Certification/Enterprise/product/apply', // 自定义规格跳转路径
        title: I18N.Certification.enterpriseCarbonVerification, // 标题
        Subtitle: I18N.Certification.authoritativeInstitutionsSpecializingIn, // 副标题
        Specifications: product_Specifications, // 产品规格
        step: [
          // 服务流程icon
          { icon: 'icon-icon-shenqingfuwu', title: '' },
          { icon: 'icon-icon-jiantou-3', title: 'row' },
          { icon: 'icon-icon-shijiaocailiao', title: '' },
          { icon: 'icon-icon-jiantou-3', title: 'row' },
          { icon: 'icon-icon-hezhajieduan', title: '' },
          { icon: 'icon-icon-jiantou-3', title: 'row' },
          { icon: 'icon-icon-hezhawancheng', title: '' },
        ],
      },
    },
    {
      url: '/Certification/Product/index',
      list: {
        // bg: `${ossPath}/saas-authentication/bg-green.png`,
        left_icon: `${ossPath}/saas-authentication/co2-green.png`,
        title: I18N.Certification.carbonFootprintVerification,
        addul: '/Certification/Product/product/apply',
        url: '/Certification/Product/index/apply',
        Subtitle: I18N.Certification.authoritativeInstitutionCarbon,
        Specifications: Enterprise_Specifications,
        step: [
          { icon: 'icon-icon-shenqingfuwu', title: '' },
          { icon: 'icon-icon-jiantou-3', title: 'row' },
          { icon: 'icon-icon-shijiaocailiao', title: '' },
          { icon: 'icon-icon-jiantou-3', title: 'row' },
          { icon: 'icon-icon-hezhajieduan', title: '' },
          { icon: 'icon-icon-jiantou-3', title: 'row' },
          { icon: 'icon-icon-hezhawancheng', title: '' },
        ],
      },
    },
  ];
  return list.filter(item => item.url === url)[0].list;
};
