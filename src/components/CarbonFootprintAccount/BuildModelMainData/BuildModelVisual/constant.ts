/** 搭建模型 - 可视化 - 切换原视图，按分类 */
import I18N from '@src/lang/I18N';

export enum BuildModelVisualChangeType {
  DEFAULT = 0,
  CLASS = 1,
}

export const BUILD_MODEL_VISUAL_CHANGE_TYPE = () =>
  ({
    [BuildModelVisualChangeType.DEFAULT]: I18N.components.originalView,
    [BuildModelVisualChangeType.CLASS]: I18N.components.byClassification,
  } as const);
