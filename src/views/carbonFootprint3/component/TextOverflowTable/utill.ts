const calcTextWidth = (value, font = 'normal 500 14px sans-serif') => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.font = font;
  const { width } = context.measureText(value);
  return width;
};
/** 根据字号获取文字的宽度 默认fontsize：14、fontweight：500、fontfamily：sans-serif  */
export const calcTextWidthUseFontSize = (
  str: string,
  opts: { fontSize?: number; font?: string },
) => {
  if (!str) return 0;
  const fonts = opts.font || `normal 500 ${opts.fontSize || 14}px sans-serif`;
  return calcTextWidth(str, fonts);
};
