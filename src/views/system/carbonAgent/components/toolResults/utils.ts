export const asRecord = (data: unknown): Record<string, unknown> =>
  data && typeof data === 'object' && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : {};

export const getOptionalString = (data: unknown) =>
  typeof data === 'string' && data.trim() ? data.trim() : undefined;

export const getOptionalScalarString = (data: unknown) => {
  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }

  if (typeof data === 'number' && Number.isFinite(data)) {
    return String(data);
  }

  if (typeof data === 'boolean') {
    return data ? 'true' : 'false';
  }

  return undefined;
};

export const getOptionalArray = (data: unknown) =>
  Array.isArray(data) ? data : [];

export const extractPythonAssignedValue = (source: string, key: string) => {
  const assignmentStart = source.indexOf(`${key}=`);

  if (assignmentStart < 0) {
    return undefined;
  }

  let start = assignmentStart + key.length + 1;

  while (source[start] === ' ') {
    start += 1;
  }

  const openingChar = source[start];

  if (openingChar === '{' || openingChar === '[') {
    const closingChar = openingChar === '{' ? '}' : ']';
    let depth = 0;
    let quote: string | undefined;
    let escaped = false;

    for (let index = start; index < source.length; index += 1) {
      const char = source[index];

      if (quote) {
        if (escaped) {
          escaped = false;
        } else if (char === '\\') {
          escaped = true;
        } else if (char === quote) {
          quote = undefined;
        }
      } else if (char === "'" || char === '"') {
        quote = char;
      } else if (char === openingChar) {
        depth += 1;
      } else if (char === closingChar) {
        depth -= 1;

        if (depth === 0) {
          return source.slice(start, index + 1);
        }
      }
    }

    return source.slice(start);
  }

  if (openingChar === "'" || openingChar === '"') {
    let escaped = false;

    for (let index = start + 1; index < source.length; index += 1) {
      const char = source[index];

      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === openingChar) {
        return source.slice(start, index + 1);
      }
    }

    return source.slice(start);
  }

  for (let index = start; index < source.length; index += 1) {
    if (source[index] === ' ') {
      const remaining = source.slice(index + 1);

      if (/^[A-Za-z_]\w*=/.test(remaining)) {
        return source.slice(start, index);
      }
    }
  }

  return source.slice(start);
};

const isPythonIdentifierChar = (char?: string) =>
  Boolean(char && /[A-Za-z0-9_]/.test(char));

const replacePythonConstantsOutsideStrings = (data: string) => {
  let replaced = '';
  let quote: string | undefined;
  let escaped = false;

  for (let index = 0; index < data.length; index += 1) {
    const char = data[index];

    if (quote) {
      replaced += char;

      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = undefined;
      }
    } else if (char === '"' || char === "'") {
      quote = char;
      replaced += char;
    } else {
      const constants: Record<string, string> = {
        False: 'false',
        None: 'null',
        True: 'true',
      };
      const matchedConstant = Object.keys(constants).find(token => {
        const endIndex = index + token.length;

        return (
          data.slice(index, endIndex) === token &&
          !isPythonIdentifierChar(data[index - 1]) &&
          !isPythonIdentifierChar(data[endIndex])
        );
      });

      if (matchedConstant) {
        replaced += constants[matchedConstant];
        index += matchedConstant.length - 1;
      } else {
        replaced += char;
      }
    }
  }

  return replaced;
};

const convertPythonLiteralToJson = (literal: string) => {
  let converted = '';

  for (let index = 0; index < literal.length; index += 1) {
    const char = literal[index];

    if (char !== "'") {
      converted += char;
    } else {
      let value = '';
      let escaped = false;
      index += 1;

      for (; index < literal.length; index += 1) {
        const nextChar = literal[index];

        if (escaped) {
          value += nextChar;
          escaped = false;
        } else if (nextChar === '\\') {
          escaped = true;
        } else if (nextChar === "'") {
          break;
        } else {
          value += nextChar;
        }
      }

      converted += JSON.stringify(value);
    }
  }

  return replacePythonConstantsOutsideStrings(converted);
};

export const parsePythonLiteral = (literal?: string) => {
  if (!literal) {
    return undefined;
  }

  try {
    return JSON.parse(convertPythonLiteralToJson(literal.trim()));
  } catch {
    return undefined;
  }
};
