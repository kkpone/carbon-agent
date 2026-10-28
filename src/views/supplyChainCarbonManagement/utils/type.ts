import { ProductionMaterials } from '@/sdks/footprintV2ApiDocs';
import {
  ApplyInfoResp,
  ComputationResult,
  ComputationProcess,
  FootprintResult,
  FootprintProcess,
  FootprintBase,
  ProcessModel,
  ProductionMaterialsDto,
  ProductionBusinessDto,
} from '@/sdks_v2/new/supplychainV2ApiDocs';
import { FileListType, SearchParamses } from '@/views/components/utils/types';

import { AuditLog, AuditNode } from '../CarbonDataApproval/type';

export type TypeApplyInfoResp = ApplyInfoResp & {
  applyType_name?: string;
  periodType_name?: string;
  systemBoundaryType?: number;
  supportFile?: any;
};
/** 产品碳足迹过程 */
export type TypeFootprintProcess =
  | FootprintProcess
  | ProductionMaterialsDto
  | ProductionMaterials;

/** 产品碳足迹基本信息 */
export type TypeFootprintBase = FootprintBase | ProductionBusinessDto;

/** 产品碳足迹结果 */
export type TypeFootprintResult = FootprintResult & {
  report?: string;
};

/** 供应链碳数据、碳数据审核、填报等模块组件用到的数据 */
export interface CarbonDataPropsType {
  /** 表单是否可以编辑 */
  disabled?: boolean;
  /** 是否有底部的操作按钮 */
  hasAction?: boolean;
  /** 数据id */
  id?: string;
  /** 模块类型 */
  currentModalType?: string;
  /** 数据类型。1 企业碳核算 2 产品碳足迹 3 低碳问卷*/
  dataType?: CarbonDataType;
  /** 数据请求类型 1:核算结果 2:核算过程 */
  applyType?: number;
  /** 数据详情 */
  cathRecord?: TypeApplyInfoResp;
  /** 企业碳核算结果 */
  computationResult?: ComputationResult;
  /** 企业碳核算过程 */
  computationProcess?: ComputationProcess[];
  /** 产品碳足迹结果 */
  footprintResult?: FootprintResult;
  /** 产品碳足迹过程 */
  footprinProcess?: TypeFootprintProcess[];
  /** 产品碳足迹-系统边界要求：1半生命周期2全生命周期 */
  periodType?: '1' | '2';
  /** 页面头部展示的基本信息 */
  basicInfo?: { label: string; value: string | number | undefined }[];
  /** 产品碳足迹过程-基本信息数据 */
  basicCathRecord?: TypeFootprintBase;
  /** 表格loading */
  loading?: boolean;
  /** 表格总数 */
  total?: number;
  /** 页码配置参数 */
  searchParams?: SearchParamses;
  /** 审核记录列表 */
  approvalRecord?: AuditLog[];
  /** 审批流程列表 */
  approvalProcess?: AuditNode[];
  /** 上传的文件 */
  fileList?: FileListType[];
  /** 切换页码的方法 */
  onchange?: (current: number, pageSize: number) => void;
  /** 切换产品碳足迹过程的左侧菜单 */
  onChangeMenu?: (data?: ProcessModel) => void;
  /** 企业碳核算过程查看的方法 */
  onDetailClick?: (data?: ComputationProcess) => void;
  /** 产品碳足迹过程查看的方法 */
  onDetailFactorClick?: (data?: TypeFootprintProcess) => void;
}

/** 碳数据类型 */
export enum CarbonDataType {
  /** 企业碳核算 */
  carbonAccounting = '1',
  /** 产品碳足迹 */
  carbonFootPrint = '2',
  /** 低碳问卷 */
  questionnaire = '3',
}

export interface QuestionnaireQuestionOptionDtos {
  allowFillBlanks?: boolean;

  blankRequired?: boolean;

  content?: string;

  description?: string;

  optionId?: number;

  ext?: string;
}

export interface QuestionOpts {
  answer?: any;

  answerExt?: string;

  companyId?: number;
  createBy?: number;
  createTime?: Date;

  id?: number;

  optionList?: QuestionnaireQuestionOptionDtos[];

  orderNum?: number;

  orgId?: number;

  questionType?: '1' | '2' | '3' | '4';

  questionnaireId?: number;

  required?: boolean;

  supplierId?: number;

  tips?: string;

  title?: string;
  updateBy?: number;
  updateTime?: Date;
}

/** 审核列表 */
export type AuditListType = {
  /** 审核意见 */
  auditComment?: string;
  /** 审核数据id */
  auditDataId?: number;
  /** 审核状态  */
  auditStatus?: 0 | 1 | 2 | 3 | 4;
};

/**
 * 支撑材料
 */
export interface UploadFile {
  /**
   * 公司id
   */
  companyId?: number;
  /**
   * 创建者
   */
  createBy?: number;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 标记删除。0 未删除 1 已删除
   */
  deleted?: boolean;
  /**
   * 文件uuid
   */
  fileId?: string;
  /**
   * 文件名
   */
  fileName?: string;
  /**
   * 文件外网url
   */
  fileUrl?: string;
  /**
   * id
   */
  id?: number;
  /**
   * 过程or输入/输出id
   */
  objectId?: number;
  /**
   * 模块类型: 1 过程; 2 输入/输出(1:过程; 2:输入/输出; 3:过程库; 4:输入/输出库)
   */
  objectType?: number;
  /**
   * 组织id
   */
  orgId?: number;
  /**
   * 更新者
   */
  updateBy?: number;
  /**
   * 更新时间
   */
  updateTime?: Date;
  [property: string]: any;
}
