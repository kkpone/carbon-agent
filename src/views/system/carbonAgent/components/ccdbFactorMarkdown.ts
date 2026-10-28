export type CcdbFactorCitation = {
  detailUrl: string;
  factorId?: string;
  name: string;
};

const MARKDOWN_LINK_PATTERN = /\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/gi;

const normalizeUrl = (value: string) => value.trim().replace(/\/$/, '');

const factorIdFromUrl = (value: string) => {
  try {
    const segments = new URL(value).pathname.split('/').filter(Boolean);
    const factorIndex = segments.lastIndexOf('factors');

    return factorIndex >= 0 ? segments[factorIndex + 1] : undefined;
  } catch {
    return undefined;
  }
};

const isMatchingCitation = (href: string, citation: CcdbFactorCitation) => {
  if (normalizeUrl(href) === normalizeUrl(citation.detailUrl)) {
    return true;
  }

  const factorId = citation.factorId || factorIdFromUrl(citation.detailUrl);

  return Boolean(factorId && factorIdFromUrl(href) === factorId);
};

const isInsideMarkdownLink = (content: string, index: number, name: string) => {
  const openingBracket = content.lastIndexOf('[', index);
  const closingLink = content.indexOf('](', index + name.length);
  const nextLine = content.indexOf('\n', index);

  return Boolean(
    openingBracket >= 0 &&
      closingLink >= 0 &&
      (nextLine < 0 || closingLink < nextLine),
  );
};

const findLastPlainName = (
  content: string,
  name: string,
  beforeIndex: number,
) => {
  let index = content.lastIndexOf(name, beforeIndex);

  while (index >= 0) {
    if (!isInsideMarkdownLink(content, index, name)) {
      return index;
    }

    index = content.lastIndexOf(name, index - 1);
  }

  return -1;
};

const escapeMarkdownLabel = (value: string) =>
  value.replace(/([\\[\]])/g, '\\$1');

/**
 * Models sometimes cite a valid CCDB detail URL on generic text such as
 * "Factor details". Move that navigation onto the nearest matching factor
 * name as a deterministic rendering fallback.
 */
export const linkifyCcdbFactorNames = (
  content: string,
  citations: CcdbFactorCitation[],
) => {
  if (!content || !citations.length) {
    return content;
  }

  let nextContent = content;

  citations.forEach(citation => {
    if (!citation.name.trim() || !citation.detailUrl.trim()) {
      return;
    }

    const matchingLink = Array.from(
      nextContent.matchAll(MARKDOWN_LINK_PATTERN),
    ).find(match => isMatchingCitation(match[2], citation));

    if (!matchingLink || matchingLink.index == null) {
      return;
    }

    if (matchingLink[1].includes(citation.name)) {
      return;
    }

    const nameIndex = findLastPlainName(
      nextContent,
      citation.name,
      matchingLink.index,
    );

    if (nameIndex < 0) {
      return;
    }

    const linkedName = `[${escapeMarkdownLabel(citation.name)}](${
      citation.detailUrl
    })`;
    nextContent = `${nextContent.slice(
      0,
      nameIndex,
    )}${linkedName}${nextContent.slice(nameIndex + citation.name.length)}`;
  });

  return nextContent;
};
