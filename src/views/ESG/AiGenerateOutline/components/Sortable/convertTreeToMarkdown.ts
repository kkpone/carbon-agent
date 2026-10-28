/* eslint-disable */
export function convertTreeToMarkdown(tree: any[], level = 1): string {
  const lines: string[] = [];

  for (const node of tree) {
    // 标题行
    const prefix = '#'.repeat(level);
    lines.push(`${prefix} ${node.title}`);

    // 描述内容（如果有）
    if (node.description) {
      lines.push(...node.description.split('\n'));
    }

    // 空行分隔（可选）
    lines.push('');

    // 递归处理子节点
    if (node.children && node.children.length > 0) {
      const childMd = convertTreeToMarkdown(node.children, level + 1);
      lines.push(childMd);
    }
  }

  return lines.join('\n').trim(); // 去除末尾空行
}
