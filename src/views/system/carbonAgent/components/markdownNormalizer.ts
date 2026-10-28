const FENCED_CODE_PATTERN = /^\s*(```|~~~)/;
const MERGED_BOLD_TABLE_HEADER_PATTERN =
  /^(\s*)(#{1,6}\s+)?\*\*([^*|\n]+?)\|(.+\|.+)\|\*\*\s*$/;
const MERGED_HEADING_TABLE_HEADER_PATTERN =
  /^(\s*)(#{1,6}\s+)([^*|\n]+?)\|(.+\|.+)\|\s*$/;
const TABLE_ROW_PATTERN = /^\s*\|.*\|\s*$/;
const TABLE_SEPARATOR_CELL_PATTERN = /^:?-{3,}:?$/;

const isEscapedCharacter = (text: string, index: number) => {
  let slashCount = 0;

  for (let cursor = index - 1; cursor >= 0 && text[cursor] === '\\'; cursor--) {
    slashCount += 1;
  }

  return slashCount % 2 === 1;
};

const getUnescapedPipeIndexes = (line: string) => {
  const indexes: number[] = [];

  for (let index = 0; index < line.length; index += 1) {
    if (line[index] === '|' && !isEscapedCharacter(line, index)) {
      indexes.push(index);
    }
  }

  return indexes;
};

const getPipeTableColumnCount = (line: string) => {
  const pipeIndexes = getUnescapedPipeIndexes(line);

  if (
    pipeIndexes.length < 3 ||
    line.slice(0, pipeIndexes[0]).trim() ||
    line.slice(pipeIndexes[pipeIndexes.length - 1] + 1).trim()
  ) {
    return 0;
  }

  return pipeIndexes.length - 1;
};

const getLeadingSeparatorColumnCount = (line: string) => {
  const pipeIndexes = getUnescapedPipeIndexes(line);

  if (pipeIndexes.length < 3 || line.slice(0, pipeIndexes[0]).trim()) {
    return 0;
  }

  let columnCount = 0;

  for (let index = 0; index < pipeIndexes.length - 1; index += 1) {
    const cell = line
      .slice(pipeIndexes[index] + 1, pipeIndexes[index + 1])
      .trim();

    if (!TABLE_SEPARATOR_CELL_PATTERN.test(cell)) {
      break;
    }

    columnCount += 1;
  }

  return columnCount >= 2 ? columnCount : 0;
};

const splitFlattenedPipeTableRows = (line: string, columnCount: number) => {
  const pipeIndexes = getUnescapedPipeIndexes(line);
  const indent = line.slice(0, pipeIndexes[0]);
  const rows: string[] = [];
  let startPipeIndex = 0;

  if (!pipeIndexes.length || indent.trim()) {
    return [line];
  }

  while (startPipeIndex + columnCount < pipeIndexes.length) {
    const endPipeIndex = startPipeIndex + columnCount;
    const rowStart = pipeIndexes[startPipeIndex];
    const rowEnd = pipeIndexes[endPipeIndex] + 1;

    rows.push(`${indent}${line.slice(rowStart, rowEnd)}`);

    const nextPipeIndex = endPipeIndex + 1;

    if (nextPipeIndex >= pipeIndexes.length) {
      if (line.slice(rowEnd).trim()) {
        return [line];
      }

      break;
    }

    if (
      line
        .slice(pipeIndexes[endPipeIndex] + 1, pipeIndexes[nextPipeIndex])
        .trim()
    ) {
      return [line];
    }

    startPipeIndex = nextPipeIndex;
  }

  return rows.length > 1 ? rows : [line];
};

const separateMergedTableHeaders = (text: string) => {
  let insideFencedCode = false;

  return text
    .split('\n')
    .flatMap(line => {
      if (FENCED_CODE_PATTERN.test(line)) {
        insideFencedCode = !insideFencedCode;
        return [line];
      }

      if (insideFencedCode) {
        return [line];
      }

      const match = line.match(MERGED_BOLD_TABLE_HEADER_PATTERN);
      const headingMatch =
        match || line.match(MERGED_HEADING_TABLE_HEADER_PATTERN);

      if (!headingMatch) {
        return [line];
      }

      const [, indent, headingPrefix = '', title, rawHeader] = headingMatch;
      const header = `|${rawHeader.trim()}|`;

      if (getPipeTableColumnCount(header) < 2) {
        return [line];
      }

      return [
        match
          ? `${indent}${headingPrefix}**${title.trim()}**`
          : `${indent}${headingPrefix}${title.trim()}`,
        '',
        `${indent}${header}`,
      ];
    })
    .join('\n');
};

/**
 * 修复历史回答中被压平的 GFM 表格：
 * 1. Markdown 标题或粗体标题与表头被拼到同一行；
 * 2. 分隔行和多个数据行被拼接到同一个物理行。
 */
export const normalizeFlattenedMarkdownTables = (text: string) => {
  if (!text.includes('|')) {
    return text;
  }

  const lines = separateMergedTableHeaders(text).split('\n');
  const normalizedLines: string[] = [];
  let insideFencedCode = false;
  let tableColumnCount = 0;

  lines.forEach((line, index) => {
    if (FENCED_CODE_PATTERN.test(line)) {
      insideFencedCode = !insideFencedCode;
      tableColumnCount = 0;
      normalizedLines.push(line);
      return;
    }

    if (insideFencedCode) {
      normalizedLines.push(line);
      return;
    }

    const separatorColumnCount = getLeadingSeparatorColumnCount(line);

    if (separatorColumnCount) {
      tableColumnCount = separatorColumnCount;
    } else if (
      TABLE_ROW_PATTERN.test(line) &&
      getLeadingSeparatorColumnCount(lines[index + 1] || '')
    ) {
      tableColumnCount = getPipeTableColumnCount(line);
    }

    if (tableColumnCount && TABLE_ROW_PATTERN.test(line)) {
      normalizedLines.push(
        ...splitFlattenedPipeTableRows(line, tableColumnCount),
      );
      return;
    }

    tableColumnCount = 0;
    normalizedLines.push(line);
  });

  return normalizedLines.join('\n');
};
