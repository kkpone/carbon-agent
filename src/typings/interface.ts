type GetDrawerContainerFuc = () => HTMLElement;
export interface DrawerProps {
  /**
   * 抽屉是否打开
   */
  visible?: boolean;
  /**
   * 抽屉标题
   */
  title?: string;
  /**
   * 返回一个容器来装载抽屉
   * @description 默认为body内创建一个div作为容器
   */
  getContainer?: HTMLElement | GetDrawerContainerFuc;
  /**
   * 抽屉包裹内容
   */
  childrenData?: React.ReactNode;
  /**
   * 在左右方向时, 抽屉的宽度
   */
  width?: string;
  /**
   * 抽屉滑出方向
   */
  placement?: 'left' | 'top' | 'right' | 'bottom';
  /**
   * 是否显示蒙层
   */
  showMask?: boolean;
  /**
   * 蒙层是否可关闭抽屉
   */
  maskClose?: boolean;
  /**
   * 关闭抽屉
   */
  onClose?: () => void;
  /**
   * 页脚
   */
  footer?: React.ReactNode;
}
