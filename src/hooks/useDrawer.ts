import { useCallback, useState } from 'react';

/**
 * @returns 控制抽屉组件的展示和隐藏
 */
export const useDrawer = () => {
  const [visible, setVisible] = useState(false);

  const showDrawer = useCallback(() => {
    setVisible(true);
  }, []);

  const onClose = useCallback(() => {
    setVisible(false);
  }, []);

  return { visible, showDrawer, onClose };
};
