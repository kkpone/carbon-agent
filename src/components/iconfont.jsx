/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-06-07 17:44:50
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-04-27 11:53:29
 */
import { createFromIconfontCN } from '@ant-design/icons';

/**
 * @deprecated codeDesign 旧版 停止使用，原本图标还可使用
 */
const IconFont = createFromIconfontCN({
  scriptUrl: process.env.REACT_APP_ICON_FONT,
});

/**
 * @description: 新版本 iconfont图标存放
 */
export const IconAlibaba = createFromIconfontCN({
  scriptUrl: process.env.REACT_APP_ICON_FONT_ALIBABA,
});

/**
 * @description: 新版本 iconfont图标存放
 */
export const IconAlibabaNew = createFromIconfontCN({
  scriptUrl: 'https://at.alicdn.com/t/c/font_4749806_1ko14cbnd4l.js',
});

export default IconFont;
