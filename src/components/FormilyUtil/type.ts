/**
 * @description: 表单底层初始化的参数
 */
export interface InitFormilyProps {
  /** 表单名称/label */
  titleName: string;
  /** 引用的组件名称 */
  componentName: string;
  /** 组件的props */
  componentProps?: any;
  /** 是否必填校验 */
  required?: boolean;
  /** 是否显示label */
  noShowTitle?: boolean;
}
