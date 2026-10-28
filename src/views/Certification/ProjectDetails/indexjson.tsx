import I18N from '@src/lang/I18N';
import {
  carbon_emission_info,
  carbon_emission_info_docx,
  carbon_emission_info_excel,
  carbon_emission_info_export,
  materialsqueryByPage,
  operatingRecordqueryByPage,
  projectInspectqueryById,
} from '@src/api/authentication/verification';
import IconFont from '@src/components/iconfont';
import VerifyUtils from '@src/utils/verifty';
import { Tooltip } from 'antd';
import style from './index.module.scss';
// 详情页的公共部分
export const getbasic = type => ({
  msgurl: projectInspectqueryById, // 获取核查材料地址
  checkurl: '',
  producturl: operatingRecordqueryByPage, // 项目记录请求接口地址
  uploadUrl: type === 0 ? carbon_emission_info : carbon_emission_info_export, // 提交材料时不同【即企业碳核查和产品碳足迹】的山擦混文件的地址
  emission: materialsqueryByPage, // 获取基本信息的地址
});
// 根据路由来判断详情页访问的是企业碳核查还是产品碳足迹【0为企业碳核查，1为产品碳足迹】，以及他们各自对应的状态

export const ProjectDetailsList = [
  {
    url: '/Certification/Product/product/detail',
    type: 1,
    status: '0',
  }, // 产品碳足迹-项目-详情
  {
    url: '/Certification/Product/product/submissions',
    type: 1,
    status: '4',
  }, // 产品碳足迹-项目-提交材料

  {
    url: '/Certification/Product/product/edit',
    type: 1,
    status: '4',
  }, // 产品碳足迹-项目-提交材料
  {
    url: '/Certification/Enterprise/product/detail',
    type: 0,
    status: '0',
  }, // 企业碳核查项目-详情
  {
    url: '/Certification/Enterprise/product/submissions',
    type: 0,
    status: '4',
  }, // 企业碳核查项目-项目-提交材料
  {
    url: '/Certification/Enterprise/product/edit',
    type: 0,
    status: '5',
  },
];
// 根据type来确定访问的是0【企业碳核查】还是1【企业碳足迹】来返回核查材料以及材料报告以及项目记录对应的属性名
export const Operation_record = (type: number) => {
  if (type === 1) {
    return {
      list: {
        essential_information: {
          title: I18N.Certification.verificationMaterials,
          list: [
            {
              name: 'product_code',
              label: I18N.Certification.reportCode2,
              icon: '',
              icontext: '',
            },
            {
              name: 'product_name',
              label: I18N.Certification.reportSubjectName2,
              icon: '',
              icontext: '',
            },
            {
              name: 'specification',
              label: I18N.Certification.productSpecifications,
              icon: '',
              icontext: '',
            },
            {
              name: 'year',
              label: I18N.Certification.dataYear,
              icon: '',
              icontext: '',
            },
            {
              name: '',
              label: I18N.carbonNeutral.report,
              icon: 'icon-icon-xiazai-3',
              icontext: I18N.Certification.downloadReport,
            },
          ],
        },
        verification_materials: {
          title: I18N.carbonFootprint.basicInformation,
          list: [
            {
              name: 'projectId',
              label: I18N.Certification.projectId2,
              status: true,
              statusName: '',
              identification: '',
            },

            {
              name: 'userName',
              label: I18N.Certification.creator,
              status: false,
              statusName: '',
              identification: '',
            },

            {
              name: 'createTime',
              label: I18N.Certification.creationTime,
              status: false,
              statusName: '',
              identification: '',
            },

            {
              name: 'projectName',
              label: I18N.carbonNeutral.entryName2,
              status: false,
              statusName: '',
              identification: '',
            },

            {
              name: 'companyName',
              label: I18N.Certification.affiliatedOrganization,
              status: false,
              statusName: '',
              identification: '',
            },

            {
              name: 'industryType',
              label: I18N.Certification.industry,
              status: false,
              statusName: '',
              identification: '',
            },
            {
              name: 'organizationName',
              label: I18N.Certification.certificationBodies2,
              status: false,
              statusName: '',
              identification: '',
            },

            {
              name: 'identifyServe',
              label: I18N.Certification.certificationServices,
              status: false,
              statusName: '',
              identification: '',
            },

            {
              name: 'purpose',
              label: I18N.Certification.isItTheFirstTimeToVerify2,
              status: false,
              statusName: '',
              identification: '',
            },
            {
              name: 'emission',
              label: I18N.Certification.typesOfRawMaterials2,
              status: false,
              statusName: '',
              identification: '',
            },

            {
              name: 'employee',
              label: I18N.Certification.numberOfEmployeesInTheEnterprise2,
              status: false,
              statusName: '',
              identification: '',
            },

            {
              name: 'building',
              label: I18N.Certification.theHierarchyOfTraceability2,
              status: false,
              statusName: '',
              identification: '',
            },

            {
              name: 'method',
              label: I18N.Certification.productLifecycle2,
              status: false,
              statusName: '',
              identification: '',
            },

            {
              name: 'cycleDate',
              label: I18N.Certification.companysProducts2,
              status: false,
              statusName: '',
              identification: '',
            },

            {
              name: 'coveredArea',
              label: I18N.Certification.verifyTheOnSiteSituation,
              status: false,
              statusName: '',
              identification: '',
            },

            {
              name: 'expenses',
              label: I18N.Certification.estimatedCost,
              status: false,
              statusName: '',
              identification: '',
            },

            {
              name: 'actualExpenses',
              label: I18N.Certification.actualExpenses,
              status: false,
              statusName: '',
              identification: '',
            },
          ],
        },
        Project_record: {
          title: I18N.Certification.projectRecords,
          list: [],
        },
      },
    };
  }
  return {
    list: {
      essential_information: {
        title: I18N.Certification.verificationMaterials,
        list: [
          {
            name: 'product_code',
            label: I18N.Certification.reportCode,
            icon: '',
            icontext: '',
          },
          {
            name: 'product_name',
            label: I18N.Certification.reportTopicName,
            icon: '',
            icontext: '',
          },
          {
            name: 'specification',
            label: I18N.Certification.versionNumber,
            icon: '',
            icontext: '',
          },
          {
            name: 'year',
            label: I18N.Certification.whenTheReportCovers,
            icon: '',
            icontext: '',
          },
          {
            name: '',
            label: I18N.Certification.report,
            icon: 'icon-icon-xiazai-3',
            icontext: I18N.Certification.downloadReport,
          },
          // {
          //   name: '',
          //   label: '清册：',
          //   icon: 'icon-icon-xiazai-3',
          //   icontext: '下载清册',
          // },
        ],
      },
      verification_materials: {
        title: I18N.carbonFootprint.basicInformation,
        list: [
          {
            name: 'projectId',
            label: I18N.Certification.projectId2,
            status: true,
            statusName: '',
            identification: '',
          },

          {
            name: 'userName',
            label: I18N.Certification.creator,
            status: false,
            statusName: '',
            identification: '',
          },

          {
            name: 'createTime',
            label: I18N.Certification.creationTime,
            status: false,
            statusName: '',
            identification: '',
          },

          {
            name: 'projectName',
            label: I18N.carbonNeutral.entryName2,
            status: false,
            statusName: '',
            identification: '',
          },

          {
            name: 'companyName',
            label: I18N.Certification.affiliatedOrganization,
            status: false,
            statusName: '',
            identification: '',
          },

          {
            name: 'industryType',
            label: I18N.Certification.industry,
            status: false,
            statusName: '',
            identification: '',
          },
          {
            name: 'organizationName',
            label: I18N.Certification.certificationBodies2,
            status: false,
            statusName: '',
            identification: '',
          },

          {
            name: 'identifyServe',
            label: I18N.Certification.certificationServices,
            status: false,
            statusName: '',
            identification: '',
          },

          {
            name: 'purpose',
            label: I18N.Certification.isItTheFirstTimeToVerify2,
            status: false,
            statusName: '',
            identification: '',
          },
          {
            name: 'employee',
            label: I18N.Certification.numberOfEmployeesInTheEnterprise2,
            status: false,
            statusName: '',
            identification: '',
          },

          {
            name: 'coveredArea',
            label: I18N.Certification.verifyTheOnSiteSituation,
            status: false,
            statusName: '',
            identification: '',
          },

          {
            name: 'building',
            label: I18N.Certification.officeBuildingsAndFactories2,
            status: false,
            statusName: '',
            identification: '',
          },

          {
            name: 'emission',
            label: I18N.Certification.greenhouseGasEmissions2,
            status: false,
            statusName: '',
            identification: '',
          },

          {
            name: 'cycleDate',
            label: I18N.Certification.theCompanyUsesFuel,
            status: false,
            statusName: '',
            identification: '',
          },

          {
            name: 'method',
            label: I18N.Certification.scopeThreeIncludes2,
            status: false,
            statusName: '',
            identification: '',
          },

          {
            name: 'expenses',
            label: I18N.Certification.estimatedCost,
            status: false,
            statusName: '',
            identification: '',
          },

          {
            name: 'actualExpenses',
            label: I18N.Certification.actualExpenses,
            status: false,
            statusName: '',
            identification: '',
          },
        ],
      },
      Project_record: {
        title: I18N.Certification.projectRecords,
        list: [],
      },
    },
  };
};
// 根据该条信息有没有文件路径以及审核说明来展示不同的操作内容
const filterText = (record: any) => {
  if (record.operatingPath !== '' && record.operatingPath !== null) {
    return (
      <div>
        {record.userName}
        {record.operatingFlag}
        <Tooltip title={record.operatingMsg}>
          {I18N.Certification.viewNbs}
          <span className={style.checkRes}>
            {I18N.Certification.auditDescription}
          </span>
          {I18N.Certification.download}
          <span
            className={style.checkRes}
            onClick={() => window.open(record.operatingPath, '_blank')}
          >
            {I18N.Certification.inspectionAndDiscoveryReport}
          </span>
        </Tooltip>
      </div>
    );
  }
  if (record.operatingMsg !== '' && record.operatingMsg !== null) {
    return (
      <div>
        {record.userName}
        {record.operatingFlag}
        <Tooltip title={record.operatingMsg}>
          {I18N.Certification.check}
          <span className={style.checkRes}>
            {I18N.Certification.auditDescription}
          </span>
        </Tooltip>
      </div>
    );
  }
  return `${record.userName}${record.operatingFlag}`;
};
// 项目记录的column
export const projectTableColumns = [
  {
    title: I18N.carbonFootprint.operator,
    dataIndex: 'userName',
    key: 'userName',
    ellipsis: true,
    render: (roleName: string) => (
      <Tooltip title={roleName === null ? '--' : roleName} placement='topLeft'>
        {roleName === null ? '--' : roleName}
      </Tooltip>
    ),
  },
  {
    title: I18N.Certification.operationTime,
    dataIndex: 'createTime',
    key: 'createTime',
    ellipsis: true,
    render: (roleName: string) => (
      <Tooltip title={VerifyUtils.get_time(roleName)} placement='topLeft'>
        {VerifyUtils.get_time(roleName)}
      </Tooltip>
    ),
  },
  {
    title: I18N.Certification.operationRecords,
    dataIndex: 'operatingFlag',
    key: 'operatingFlag',
    width: '600px',
    ellipsis: true,
    render: (roleName: string, record) => <span>{filterText(record)}</span>,
  },
];
// 上传已有文件时根据type的不同来显示不同的属性名，产品碳足迹没有版本类型
export const projectTableUpload = type => {
  const list =
    type === 1
      ? [
          {
            title: I18N.Certification.choice,
            dataIndex: 'id',
            key: 'id',
            width: '75px',
            ellipsis: true,
            render: (roleName: string, record: any, index: number) => (
              <Tooltip title={index + 1} placement='topLeft'>
                {index + 1}
              </Tooltip>
            ),
          },
          {
            title: I18N.Certification.reportCode2,
            dataIndex: 'product_code',
            key: 'product_code',
            ellipsis: true,
            render: (roleName: string, record: any) => (
              <Tooltip title={roleName} placement='topLeft'>
                {roleName || record.id}
              </Tooltip>
            ),
          },
          {
            title: I18N.carbonFootprint.reportName,
            dataIndex: 'product_name',
            key: 'product_name',
            ellipsis: true,
            render: (roleName: string, record) => (
              <Tooltip title={roleName} placement='topLeft'>
                {roleName || record.organization_info_name}
              </Tooltip>
            ),
          },
          {
            title: I18N.Certification.productSpecifications,
            dataIndex: 'specification',
            key: 'specification',
            width: type === 0 ? '300px' : '',
            ellipsis: true,
            render: (roleName: string) => (
              <Tooltip title={roleName} placement='topLeft'>
                {roleName}
              </Tooltip>
            ),
          },
          {
            title: I18N.Certification.dataYear,
            dataIndex: 'year',
            key: 'year',
            width: type === 0 ? '300px' : '',
            ellipsis: true,
            render: (roleName: string) => (
              <Tooltip title={roleName} placement='topLeft'>
                {roleName}
              </Tooltip>
            ),
          },
        ]
      : [
          {
            title: I18N.Certification.choice,
            dataIndex: 'id',
            key: 'id',
            width: '75px',
            ellipsis: true,
            render: (roleName: string, record: any, index: number) => (
              <Tooltip title={index + 1} placement='topLeft'>
                {index + 1}
              </Tooltip>
            ),
          },
          {
            title: I18N.Certification.reportCode2,
            dataIndex: 'product_code',
            key: 'product_code',
            ellipsis: true,
            render: (roleName: string, record: any) => (
              <Tooltip title={roleName} placement='topLeft'>
                {roleName || record.id}
              </Tooltip>
            ),
          },
          {
            title: I18N.Certification.reportSubject,
            dataIndex: 'product_name',
            key: 'product_name',
            ellipsis: true,
            render: (roleName: string, record) => (
              <Tooltip title={roleName} placement='topLeft'>
                {roleName || record.organization_info_name}
              </Tooltip>
            ),
          },
          {
            title: I18N.Certification.versionNumber2,
            dataIndex: 'specification',
            key: 'specification',
            ellipsis: true,
            render: (roleName: string, record) => (
              <Tooltip title={roleName} placement='topLeft'>
                v{roleName || record.version_num}
              </Tooltip>
            ),
          },
          {
            title: I18N.Certification.versionType,
            dataIndex: 'edition',
            key: 'edition',
            ellipsis: true,
            render: (roleName: string) => (
              <Tooltip
                title={Number(roleName) === 2 ? 'GHG' : 'ISO'}
                placement='topLeft'
              >
                {Number(roleName) === 2 ? 'GHG' : 'ISO'}
              </Tooltip>
            ),
          },
          {
            title: I18N.Certification.whenTheReportCovers2,
            dataIndex: 'year',
            key: 'year',
            width: type === 0 ? '300px' : '',
            ellipsis: true,
            render: (roleName: string) => (
              <Tooltip title={roleName} placement='topLeft'>
                {roleName}
              </Tooltip>
            ),
          },
        ];
  return list;
};
export const projectSearchTable = (type: number | string) => [
  {
    label: I18N.carbonFootprint.reportName,
    name: type === 0 ? 'organization_info_name' : 'product_name',
  },
  {
    label: I18N.Certification.reportCode2,
    name: type === 0 ? 'id' : 'product_code',
  },
];
// 企业碳核查材料报告
export const enterprise_materials = [
  {
    name: 'id',
    label: I18N.Certification.reportCode,
    objname: 'file_url_path',
    hml: '',
  },
  {
    name: 'organization_info_name',
    label: I18N.Certification.reportSubjectName,
    objname: 'file_url_path',
    hml: '',
  },
  {
    name: 'version_num',
    label: I18N.Certification.versionNumber,
    objname: 'file_url_path',
    hml: '',
  },
  {
    name: 'year',
    label: I18N.Certification.whenTheReportCovers,
    hml: '',
    objname: 'file_url_path',
  },
  {
    name: 'edition',
    label: I18N.Certification.reportType,
    hml: '',
    objname: 'file_url_path',
  },
  {
    name: '',
    label: I18N.Certification.report,
    path: carbon_emission_info_docx,
    objname: 'file_url_path',
    hml: (
      <span className={style.materials}>
        <IconFont type='icon-icon-xiazai-4' />
        {I18N.Certification.downloadReport}
      </span>
    ),
  },
  {
    name: '',
    label: I18N.Certification.inventory,
    path: carbon_emission_info_excel,
    objname: 'file_url_path',
    hml: (
      <span className={style.materials}>
        <IconFont type='icon-icon-xiazai-4' />
        {I18N.Certification.downloadInventory}
      </span>
    ),
  },
];

export const enterprise_materials_sub = (
  already: any,
  local: any,
  id,
  type,
) => {
  const already_new: any[] = [];
  already.forEach(item => {
    const obj =
      type === 1
        ? {
            projectId: id,
            reportNum: item.product_code,
            reportName: item.product_name,
            versions: item.specification,
            filePath: item.filePath,
            fileName: item.fileName,
            cycleDate: item.year,
            type: 0,
            edition: item.edition,
          }
        : {
            projectId: id,
            reportNum: item.id,
            reportName: item.organization_info_name,
            versions: item.version_num,
            cycleDate: item.year,
            filePath: item.filePath,
            inventoryPath: item.inventoryPath,
            type: 0,
            edition: item.edition,
          };
    already_new.push(obj);
  });
  const local_new: any = [];
  local.forEach(item => {
    const obj = {
      projectId: id,
      filePath: item.url,
      fileName: item.name,
      operatingId: item.uid,
      type: 1,
    };
    local_new.push(obj);
  });
  const list = already_new.concat(local_new);
  return list;
};
export const product_materials_sub = (already: any, local: any, id) => {
  const already_new = already.filter(item => item.type === 0);
  const already_new_list: any[] = [];
  const local_new_list: any[] = [];
  const local_new = already.filter(item => item.type === 1);
  already_new.forEach(item => {
    const obj =
      local === 1
        ? {
            projectId: id,
            product_code: item.reportNum,
            product_name: item.reportName,
            specification: item.versions,
            fileName: item.fileName,
            filePath: item.filePath,
            year: item.cycleDate,
            icontype:
              item.fileName === I18N.Certification.carbonReduction
                ? 'icon-icon-tanjianbaibaogao'
                : 'icon-icon-tanjujibaogao',
            type: 0,
          }
        : {
            projectId: id,
            id: item.reportNum,
            organization_info_name: item.reportName,
            version_num: item.versions,
            year: item.cycleDate,
            fileName: item.fileName,
            filePath: item.filePath,
            inventoryPath: item.inventoryPath,
            // reportNum: item.id,
            // reportName: item.organization_info_name,
            // versions: item.version_num,
            // cycleDate: item.year,
            type: 0,
          };
    already_new_list.push(obj);
  });
  local_new.forEach(item => {
    const obj = {
      url: item.filePath,
      name: item.fileName,
      status: 'done',
      uid: item.operatingId,
    };
    local_new_list.push(obj);
  });
  return {
    aleradyList: already_new_list,
    localList: local_new_list,
  };
};
// 上传核查材料时根据不同类型的文本显示不同的icon
export const filterIcon = (type: string) => {
  switch (type) {
    case 'doc':
    case 'DOCX':
    case 'docx':
    case 'DOC':
      return 'icon-icon-word-1';
    case 'xls':
    case 'XLS':
    case 'xlsx':
    case 'XLSX':
      return 'icon-icon-excel-1';
    case 'PDF':
    case 'pdf':
      return 'icon-icon-pdf-2';
    default:
      return 'icon-icon-tupian-3';
  }
};
