import { theme } from 'antd';

const { getDesignToken } = theme;

const mainColor = '#002A23';

export const themeConfig = {
  components: {
    // Menu: {
    //   colorInfoBorder: 'none',
    //   itemHeight: 38,
    //   itemMarginBlock: 8,
    //   itemBg: '#002A23',
    //   itemColor: '#fff',
    //   itemHoverColor: '#fff',
    //   itemHoverBg: 'rgba(255, 255, 255, 0.10)',
    //   itemSelectedBg: 'rgba(255, 255, 255, 0.10)',
    //   itemActiveBg: 'rgba(255, 255, 255, 0.10)',
    //   itemSelectedColor: '#fff',
    //   itemBorderRadius: 0,
    //   itemMarginInline: 0,
    //   itemPaddingInline: 20,
    // },
    Layout: {
      bodyBg: '#fff',
      siderBg: mainColor,
    },
    Button: {
      controlHeight: 38,
      paddingInline: 16,
      defaultColor: 'rgb(4,37,43)',
      defaultBorderColor: 'rgb(213,215,218)',
      colorLink: '#026961',
      colorLinkHover: '#08A28B',
    },
    Input: {
      controlHeight: 38,
    },
    InputNumber: {
      controlHeight: 38,
    },
    Mentions: {
      controlHeight: 38,
    },
    Form: {
      controlHeight: 38,
    },
    DatePicker: {
      controlHeight: 38,
    },
    Radio: {
      controlHeight: 38,
      wrapperMarginInlineEnd: 16,
    },
    Select: {
      controlHeight: 38,
    },
    Drawer: {
      fontSizeLG: 24,
      paddingLG: 40,
    },
    Table: {
      borderColor: 'rgb(247,248,249)',
      colorTextHeading: 'rgb(4,37,43)',
      colorText: 'rgb(4,37,43)',
      rowHoverBg: 'rgb(247,248,249)',
      headerBg: 'rgb(247,248,249)',
      headerBorderRadius: 8,
      headerColor: 'rgb(4,37,43)',
      algorithm: true,
      rowSelectedHoverBg: 'rgb(247,248,249)',
      rowSelectedBg: 'rgb(247,248,249)',
      cellPaddingBlock: 12,
    },
    Breadcrumb: {
      colorBgTextHover: 'rgba(4,37,43,0)',
    },
    Modal: {
      titleFontSize: 20,
      titleLineHeight: 1.4,
    },
    Alert: {
      colorInfoBg: 'rgb(243,243,243)',
    },
    Segmented: {
      controlHeight: 38,
      controlPaddingHorizontal: 17,
    },
    Tabs: {
      margin: 24,
      horizontalItemGutter: 24,
    },
  },
  token: {
    colorPrimary: '#004541',
    colorInfo: '#004541',
    colorPrimaryText: '#04252b',
    colorPrimaryBg: '#f3f3f3',
    colorPrimaryBgHover: '#f9fafb',
    colorTextBase: '#04252b',
    borderRadius: 8,
    borderRadiusLG: 12,
    wireframe: false,
    colorSuccess: '#026961',
    colorSuccessBg: '#ddf4f2',
    colorSuccessActive: '#004541',
    colorSuccessTextHover: '#048677',
    colorSuccessTextActive: '#004541',
    colorWarning: '#bb6f44',
    colorWarningBg: '#fceedf',
    colorWarningActive: '#9f522b',
    colorWarningTextActive: '#9f522b',
    colorWarningTextHover: '#c08157',
    colorError: '#b0444b',
    colorErrorBg: '#ffe3e1',
    colorErrorActive: '#94343b',
    colorErrorTextActive: '#94343b',
    colorErrorTextHover: '#c05e61',
    colorTextSecondary: '#6c757d',
    colorTextTertiary: '#999ea4',
    colorTextQuaternary: '#b5b8bb',
    colorBorder: '#d5d7da',
    colorBorderSecondary: '#e5e7eb',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f9fafb',
    colorBgMask: '#0000008f',
    fontSizeHeading2: 32,
  },
};

// 通过静态方法获取
// tsr-skip
export const globalToken = getDesignToken(themeConfig);
