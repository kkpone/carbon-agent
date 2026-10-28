import { DataNode } from 'antd/lib/tree';

export interface SideBarNode {
  /**
   * 过程列表
   */
  processList?: ProcessNode[];
  children?: ProcessNode[];
  /**
   * 阶段id
   */
  stageId?: number;
  /**
   * 阶段名称
   */
  stageName?: string;
  [property: string]: any;
}

/**
 * ProcessNode
 */
export interface ProcessNode {
  /**
   * 质量是否平衡
   */
  balanceFlag?: boolean;
  /**
   * 输入输出列表
   */
  ioList?: IoNode[];
  /**
   * 过程编码
   */
  processCode?: string;
  /**
   * 过程id
   */
  processId?: number;
  /**
   * 过程名称
   */
  processName?: string;
  /**
   * 错误信息
   */
  errorMsg?: string;
  /**
   * 错误信息
   */
  errorMsgList?: string[];
  [property: string]: any;
}

/**
 * IoNode
 */
export interface IoNode {
  /**
   * 输入输出编码
   */
  ioCode?: string;
  /**
   * 输入输出id
   */
  ioId?: number;
  /**
   * 输入输出名称
   */
  ioName?: string;
  /**
   * 输入输出类型。1 输入；2 输出(1:输入; 2:输出)
   */
  ioType?: number;
  outputType?: number;
  /**
   * 链接类型。1 过程数据；2 模型引用；3 数据库数据；4 引用供应商结果数据；5 自建因子(1:过程数据; 2:模型引用; 3:数据库数据; 4:引用供应商结果数据;
   * 5:自建因子)
   */
  linkType?: number;
  subIoList?: IoNode[];
  isMultipleRef?: boolean;
  [property: string]: any;
}

/**
 * 处理后的节点公共props
 */
export type NodeAllProps = DataNode &
  IoNode & {
    /**
     * 节点的数据类型
     */
    nodeType?: number;
    /**
     * 是否展示过程页面
     */
    isProcessPage?: number;
    /**
     * 过程id
     */
    processId?: number;
    /**
     * 过程编码
     */
    processCode?: string;
  };
