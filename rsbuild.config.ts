import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'path';

import AntdMomentWebpackPlugin from '@ant-design/moment-webpack-plugin';
import { plugin } from '@i18n-flow/rsbuild-plugin';
import { globalToken } from './src/components/AntProvider/theme';
const { codeInspectorPlugin } = require('code-inspector-plugin');
import { createKiwiRsbuildPlugin } from '@i18nflow/kiwi/plugin-rsbuild';

// translation 模式下，按 development 环境方式加载 REACT_APP_* 变
const envMode =
  process.env.NODE_ENV === 'translation' ? 'development' : process.env.NODE_ENV;
const { publicVars } = loadEnv({ prefixes: ['REACT_APP_'], mode: envMode });
const localGatewayProxyTarget =
  process.env.LOCAL_AGENT_GATEWAY_PROXY_TARGET?.trim();
// 本地联调用同源代理访问现有 WPS 服务，避免 localhost 不在预览服务 CORS 白名单内。
const localWpsProxyTarget = process.env.LOCAL_AGENT_WPS_PROXY_TARGET?.trim();

function formatDate() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const formattedDate = `${year}${month}${day}-${hours}:${minutes}:${seconds}`;
  return formattedDate;
}
/**
 * 统一使用生成的releaseVer
 * source.define只用来定义和替换前端代码中的变量，并不会修改process.env变量
 */
const releaseVer = `ccloud@${formatDate()}`;

const isProd = process.env.NODE_ENV === 'production';
const isTranslation = process.env.NODE_ENV === 'translation';
const publicUrl = process.env.PUBLIC_URL?.replace(/\/+$/, '') || '';

export default defineConfig({
  plugins: [
    pluginReact(),
    plugin(),
    isTranslation && createKiwiRsbuildPlugin({}),
  ].filter(Boolean),
  source: {
    define: {
      ...publicVars,
      ...(localWpsProxyTarget
        ? {
            'process.env.REACT_APP_WPS_API_URL': JSON.stringify('/local-wps'),
            'import.meta.env.REACT_APP_WPS_API_URL':
              JSON.stringify('/local-wps'),
          }
        : {}),
      ...(localGatewayProxyTarget
        ? {
            'process.env.REACT_APP_API_URL': JSON.stringify('/api'),
          }
        : {}),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.PUBLIC_URL': JSON.stringify(publicUrl),
      'process.env.REACT_APP_RELEASE': JSON.stringify(releaseVer),
      'process.env.SENTRY_DSN': JSON.stringify(process.env.SENTRY_DSN),
    },
    alias: {
      '@formily/antd': '@formily/antd-v5',
      '@components': './src/components',
      '@styles': './src/styles',
      '@src': './src',
      '@Variable': './src/styles/variable.module.less',
      'antd/es/time-picker/style': './src/styles/variable.module.less',
      '@web-office-sdk': './public/web-office-sdk-solution-v2.0.7.es.js',
    },
  },
  server: {
    proxy:
      localGatewayProxyTarget || localWpsProxyTarget
        ? {
            ...(localGatewayProxyTarget
              ? {
                  '/api': {
                    target: localGatewayProxyTarget,
                    changeOrigin: true,
                    pathRewrite: { '^/api': '' },
                  },
                }
              : {}),
            ...(localWpsProxyTarget
              ? {
                  '/local-wps': {
                    target: localWpsProxyTarget,
                    changeOrigin: true,
                    pathRewrite: { '^/local-wps': '' },
                  },
                }
              : {}),
          }
        : undefined,
  },
  tools: {
    less: {
      lessOptions: {
        modifyVars: {
          hack: `true; @import "${path.resolve(
            __dirname,
            './src/styles/var.less',
          )}";`,
          ...globalToken,
          green7: globalToken.colorPrimary,
        },
        javascriptEnabled: true,
      },
    },
    rspack: {
      plugins: isProd
        ? [
            codeInspectorPlugin({
              bundler: 'rspack',
              editor: 'code',
            }),
            new AntdMomentWebpackPlugin(),
          ]
        : [
            new AntdMomentWebpackPlugin(),
            codeInspectorPlugin({
              bundler: 'rspack',
            }),
          ],
    },
  },
  output: {
    assetPrefix: publicUrl ? `${publicUrl}/` : '/',
    distPath: {
      root: 'build',
    },
  },
  html: {
    title: 'Carbon Agent',
    favicon: './public/favicon.png',
  },
});
