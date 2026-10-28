import I18N from '@src/lang/I18N';

import { PageInfoType } from './type';

/** （新增、编辑、详情）页面标题自动生成
 * 目前只支持简单场景使用，复杂场景（如编辑套详情）需要自定义
 */
export const routeTypeNameRender = (
  titleMap: Record<PageInfoType, string> | string,
  href?: string,
) => {
  const pathname = href || window.location.href;
  let usedMap: Record<PageInfoType, string>;
  if (typeof titleMap === 'string') {
    usedMap = {
      [PageInfoType.add]: I18N.template(I18N.router.addTit, { val1: titleMap }),
      [PageInfoType.show]: I18N.template(I18N.router.title, { val1: titleMap }),
      [PageInfoType.edit]: I18N.template(I18N.router.editTit, {
        val1: titleMap,
      }),
      [PageInfoType.copy]: I18N.template(I18N.router.copyTit, {
        val1: titleMap,
      }),
    };
  } else usedMap = titleMap;
  return pathname.includes(`/${PageInfoType.add}/`)
    ? usedMap[PageInfoType.add]
    : pathname.includes(`/${PageInfoType.edit}/`)
    ? usedMap[PageInfoType.edit]
    : pathname.includes(`/${PageInfoType.copy}/`)
    ? usedMap[PageInfoType.copy]
    : usedMap[PageInfoType.show];
};
