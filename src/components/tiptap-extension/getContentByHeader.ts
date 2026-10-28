/**
 * 获取指定标题下的内容
 * @param editor - Tiptap 编辑器实例
 * @param headingText - 目标标题文本
 * @param level - 可选的标题级别，如果指定则只匹配该级别的标题
 */
import { Editor } from '@tiptap/core';

export function getContentUnderHeading(
  editor: Editor,
  headingText: string,
  level?: number,
) {
  const { doc, schema } = editor.state;
  const headingType = schema.nodes.heading;

  let targetPos: { index: number; pos: number; node: any } | null = null;

  // 1. 遍历 top-level block 节点，找到匹配的 heading
  let pos = 0;
  for (let i = 0; i < doc.content.childCount; i++) {
    const node = doc.content.child(i);

    if (
      node.type === headingType &&
      node.textContent.trim().includes(headingText.trim()) &&
      (level == null || node.attrs.level === level)
    ) {
      targetPos = { index: i, pos, node };
      break;
    }

    pos += node.nodeSize;
  }

  if (!targetPos) return null; // 找不到该标题

  // 2. 向后找到下一个 heading 的位置（表示内容终止）
  let endIndex = doc.content.childCount;
  for (let i = targetPos.index + 1; i < doc.content.childCount; i++) {
    const node = doc.content.child(i);
    if (node.type === headingType) {
      endIndex = i;
      break;
    }
  }

  // 3. 计算 from/to 偏移量
  const from = targetPos.pos + targetPos.node.nodeSize;
  let to = from;
  for (let i = targetPos.index + 1; i < endIndex; i++) {
    to += doc.content.child(i).nodeSize;
  }

  // 4. 提取 slice 并转 Markdown
  const fragment = editor.state.doc.slice(from, to).content;
  return editor.storage.markdown.serializer.serialize(fragment);
}
