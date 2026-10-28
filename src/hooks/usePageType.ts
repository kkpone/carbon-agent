import { useState } from 'react';

import { PageTypeInfo } from '@/router/utils/enums';

/** 设置抽屉的新增编辑查看 */
const usePageType = (initialType: PageTypeInfo) => {
  const [pageType, setPageType] = useState<PageTypeInfo>(initialType);

  // 设置页面类型的方法
  const setModelAction = (type: PageTypeInfo) => {
    setPageType(type);
  };

  return { pageType, setModelAction };
};

export default usePageType;
