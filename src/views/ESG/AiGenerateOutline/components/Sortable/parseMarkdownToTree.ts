/* eslint-disable */

export function parseMarkdownToTree(markdown: string) {
  const lines = markdown.split('\n');
  const tree: any[] = [];
  const stack: { level: number; node: any }[] = [];
  const counters: number[] = [];

  let currentNode: any = null;
  let currentLevel: number = 0;

  for (const line of lines) {
    const headingMatch = line.match(/^(#+)\s+(.*)$/);

    if (headingMatch) {
      // 新标题行，先保存之前节点的描述（如果有）
      currentNode = null;

      const level = headingMatch[1].length;
      const title = headingMatch[2];

      counters[level - 1] = (counters[level - 1] || 0) + 1;
      counters.length = level;
      const id = line;

      const node: any = {
        id,
        title,
        description: '',
        children: [],
      };

      // 树形插入逻辑
      if (level === 1) {
        tree.push(node);
        stack[0] = { level, node };
      } else {
        const parent = stack[level - 2]?.node;
        if (parent) {
          parent.children.push(node);
        }
        stack[level - 1] = { level, node };
      }

      currentNode = node;
      currentLevel = level;
    } else if (currentNode && line.trim() !== '') {
      // 非标题行，视为当前标题的描述
      currentNode.description += currentNode.description
        ? '\n' + line.trim()
        : line.trim();
      currentNode.id += currentNode.description;
    }
  }

  return tree;
}
