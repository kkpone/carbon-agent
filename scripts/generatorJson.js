const { exec } = require('child_process');

// 文档地址 https://gateway-test.carbonstop.net/swagger-ui/index.html?urls.primaryName=carbonstop-supply-chain
const javaServerHost = 'https://gateway-test.carbonstop.net';
const javaServers = [
  '/footprint/v2/api-docs',
  '/management/v2/api-docs',
  '/file/v2/api-docs',
  '/reprocessedplastic/v2/api-docs',
  '/answerClick/v2/api-docs',
  '/meeting/v2/api-docs',
  '/architectureComputation/v2/api-docs',
  '/authentication/v2/api-docs',
  '/neutral/v2/api-docs',
  '/data/v2/api-docs',
  '/carbonAccount/v2/api-docs',
  '/supply/v2/api-docs',
  '/enterprise/v2/api-docs',
];

console.log(
  '===================sdk building ... =============================',
);
console.log('||');
console.log(`|| server using  ${javaServerHost}  ||`);
console.log('||');
console.log(
  '===================sdk building ... =============================',
);

javaServers.forEach(api => {
  const serverName = api.split('/')[1];
  console.log(
    `=================${serverName} server start======================`,
  );
  console.log('||');
  console.log(`|| server using  ${javaServerHost}  ||`);
  console.log('||');
  console.log('|| ', serverName, 'is building ...');
  exec(
    `java -jar ./openapi-generator-cli.jar generate -g typescript-axios  -i ${
      javaServerHost + api
    } -o ./src/sdks/java/${serverName}  -t ./typescript-axios  --skip-validate-spec  --additional-properties supportsES6=true,nullSafeAdditionalProps=true
    #,withSeparateModelsAndApi=true,modelPackage=models,apiPackage=apis`,
    {},
    error => {
      console.log(serverName, 'build finish with error: --', error); // 一个 AbortError

      console.log('||');
      console.log(
        `=================${serverName} server end======================`,
      );
    },
  );
});
