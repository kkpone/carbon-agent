/*
 * @@description: 配置目录
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-11-29 15:33:24
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-02 10:11:31
 * @LastEditTime: 2023-03-26 17:47:06
 */
/**
 * @usage
 * 1. pnpm install swaggie-beta ts-node lodash --save-dev
 * 2. package.json add script
 */
const path = require('path');

const basePath = path.join(__dirname, '../src/sdks_v2/');
const javaServerHost = 'https://gateway-dev.carbonstop.net';
const javaServers = [
  // 已经完成的项目，需要时再加
  // '/footprint/v2/api-docs',
  // '/management/v2/api-docs',
  // '/file/v2/api-docs',
  // // fixme 这个接口文档有问题，但因这个项目已下线，暂时不处理
  // // '/reprocessedplastic/v2/api-docs',
  // '/answerClick/v2/api-docs',
  // '/meeting/v2/api-docs',
  // '/architectureComputation/v2/api-docs',
  // '/authentication/v2/api-docs',
  // '/neutral/v2/api-docs',
  // '/data/v2/api-docs',
  // '/carbonAccount/v2/api-docs',
  // '/supply/v2/api-docs',
  // 企业碳核算
  // '/enterprise/v2/api-docs',
  // 碳足迹3.0/factor/matchFactor
  '/footprint3/v2/api-docs',
  // 供应链
  // '/chain/v2/api-docs',
];
export default {
  /** api 生成的文件夹根目录 */
  basePath,
  /** 模版文件目录 */
  templatePath: path.join(__dirname, './'),
  /** swagger json 文件的位置 */
  swaggerJsonUrls: javaServers.map(path => `${javaServerHost}${path}`),
  /** 需要替换的接口文件地址，eg.  baseURL: `${process.env.REACT_APP_API_URL}`,  */
  baseUrlReplaceString: 'baseURL: `${process.env.REACT_APP_API_URL}`,',
  /** 不要动 */
  matchFile: '.ts',
};
