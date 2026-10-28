import I18N from '@src/lang/I18N';
import en from '@src/lang/en-US/cbamMonitor';
import zh from '@src/lang/zh-CN/cbamMonitor';

/** 卡片正文是历史语言快照，配套标题和操作文案应使用相同语言。 */
export const monitorCardCopy = (lang?: string) => {
  if (/^en(?:[-_]|$)/i.test(lang || '')) return en;
  if (/^zh(?:-CN)?$/i.test(lang || '')) return zh;
  return I18N.cbamMonitor;
};

/** 已落库的产品模板按明确标签分行；旧版简短材料描述保持完整。 */
export const splitMonitorMaterial = (materials: string) => {
  const match = materials.match(
    /^(?:需要的信息：|Information needed:)\s*([\s\S]+?)\s+(?:材料名称：|Materials:)\s*([\s\S]+)$/,
  );
  return match
    ? { information: match[1].trim(), materials: match[2].trim() }
    : { information: undefined, materials };
};
