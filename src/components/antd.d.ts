import 'antd';

declare module 'antd' {
  /**
   * @deprecated antd drawer 和设计规范不一致，删除按钮在右侧等，可以使用 CustomDrawer，api 和 antd Drawer 一致。
   */
  export const Drawer: any;
}
