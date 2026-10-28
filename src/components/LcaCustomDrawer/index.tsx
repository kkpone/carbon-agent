/*
 * @@description: 抽屉组件
 */
import { Button, Drawer, DrawerProps } from 'antd';
import { FC, ReactNode, useState } from 'react';

import I18N from '@/lang/I18N';

import style from './index.module.less';
import { IconFont } from '../LcaIconFont';

interface CustomDrawerProps extends DrawerProps {
  title: string;
  children: ReactNode;
  visible: boolean;
  onClose: () => void;
  /** 用于区分是详情抽屉还是编辑/新增抽屉,处理是否展示取消按钮 */
  isDetail?: boolean;
  /** "保存"操作的回调 */
  onSave?: () => Promise<void> | void;
  /** 保存按钮文案 */
  saveBtnText?: string;
}

const CustomDrawer: FC<CustomDrawerProps> = ({
  title,
  children,
  visible,
  onClose,
  isDetail = false,
  onSave,
  saveBtnText = I18N.Factors.preserve,
  ...props
}) => {
  const [btnLoading, setBtnLoading] = useState(false);
  const closeText = I18N.carbonFootPrintLCA.close;
  const cancelText = I18N.Factors.cancel;

  /** 保存按钮点击事件 */
  const handleSave = async () => {
    if (onSave) {
      setBtnLoading(true);
      try {
        await onSave();
      } catch (error) {
        // console.error('Save operation failed:', error);
      } finally {
        setTimeout(() => {
          setBtnLoading(false);
        }, 2000);
      }
    }
  };

  return (
    <Drawer
      className={style.wrapper}
      title={title}
      onClose={onClose}
      open={visible}
      closeIcon={false}
      maskClosable={false}
      destroyOnClose
      placement='right'
      size='large'
      extra={
        <div
          className={style.closeIcon}
          onClick={() => {
            onClose();
          }}
        >
          <IconFont icon='icon-icon-guanbi' />
        </div>
      }
      footer={
        <>
          <Button
            onClick={() => {
              onClose();
            }}
            style={{ marginRight: 8 }}
          >
            {isDetail ? closeText : cancelText}
          </Button>
          {!isDetail && (
            <Button type='primary' loading={btnLoading} onClick={handleSave}>
              {saveBtnText}
            </Button>
          )}
        </>
      }
      {...props}
    >
      {children}
    </Drawer>
  );
};

export default CustomDrawer;
