declare module '*.module.less' {
  const value: Record<string, string>;
  export default value;
}
declare module '*.module.scss' {
  const value: Record<string, string>;
  export default value;
}

declare module '*.css';
declare module '*.less';
declare module '*.png';
declare module '*.jpg';
declare module '*.md';
declare module '*.svg' {
  const content: string;
  export default content;
}

/** env 扩展 */
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test' | 'translation';
    readonly PUBLIC_URL: string;
  }
  interface ProcessEnv {
    REACT_APP_API_URL_OSS: string;
    REACT_APP_HELP_DOCUMENT_LINK: string;
    REACT_APP_AGENT_MANUAL_URL: string;
    REACT_APP_ICON_FONT: string;
    REACT_APP_API_URL: string;
    REACT_APP_API_URL_PYTHON: string;
    REACT_APP_SAAS_URL: string;
  }
}

declare global {
  interface Window {
    TMap: any;
  }
}

declare module '@web-office-sdk' {
  const WebOfficeSDK: any;
  export default WebOfficeSDK;
}

interface ImportMeta {
  env: {
    REACT_APP_API_URL: string;
    REACT_APP_API_URL_PYTHON: string;
    REACT_APP_API_URL_OSS: string;
    REACT_APP_SAAS_URL: string;
    MODE: string;
    NODE_ENV: string;
    PUBLIC_URL: string;
    REACT_APP_WPS_API_URL: string;
    REACT_APP_WPS_APP_ID: string;
  };
}
