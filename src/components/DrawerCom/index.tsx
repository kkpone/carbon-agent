import { Drawer } from 'antd';

import { DrawerProps } from '../../typings/interface';
/**
 * 王佳慧的抽屉组件
 *
 *
 * formItemLayout formItem css 样式
 * @param props
 * */
const DrawerCom = (props: DrawerProps) => {
  const { visible, width, childrenData, title, onClose, footer } = props;
  return (
    <Drawer
      maskClosable={false}
      destroyOnClose
      getContainer={false}
      onClose={onClose}
      width={width}
      open={visible}
      title={title}
      footer={footer}
    >
      {childrenData}
    </Drawer>
  );
};
export default DrawerCom;
