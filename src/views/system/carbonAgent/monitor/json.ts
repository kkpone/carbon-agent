/** JSON 进入解析器前保护 Long，字符串中的数字及普通小数不做转换。 */
export const parseMonitorJson = (source: string): unknown =>
  JSON.parse(
    source.replace(
      /"(?:\\.|[^"\\])*"|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/g,
      token =>
        token.startsWith('"') ||
        /[.eE]/.test(token) ||
        Number.isSafeInteger(Number(token))
          ? token
          : JSON.stringify(token),
    ),
  );
