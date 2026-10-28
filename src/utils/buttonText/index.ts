import I18N from '@/lang/I18N';
import { PageTypeInfo } from '@/router/utils/enums';

/**
 * 根据页面操作类型获取相应的按钮文本。
 *
 * @param modelActionsType - 页面操作类型，决定按钮显示的文本。
 * @returns 返回对应操作类型的按钮文本。
 */
export function getButtonText(modelActionsType: PageTypeInfo): string {
  // 根据传入的页面操作类型，返回相应的按钮文本
  switch (modelActionsType) {
    case PageTypeInfo.add:
      return I18N.Factors.preserve;
    case PageTypeInfo.edit:
      return I18N.Factors.preserve;
    default:
      return I18N.carbonFootPrintLCA.close;
  }
}
