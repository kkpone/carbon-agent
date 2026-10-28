/**
 * 替换指定标题下的内容为 Markdown
 * @param headingText - 目标标题文本
 * @param markdown - 要插入的 Markdown 内容
 * @param markdownParser - 可选的 Markdown 解析器，默认为默认解析器
 */
import { MarkdownParser, defaultMarkdownParser } from 'prosemirror-markdown';
import { CommandProps } from '@tiptap/core';
import { Editor } from '@tiptap/core';
import { StarterKit } from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { HeadingWithId } from '@/components/tiptap-templates/simple/HeadingWithId';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import { Typography } from '@tiptap/extension-typography';
import { Superscript } from '@tiptap/extension-superscript';
import { Subscript } from '@tiptap/extension-subscript';
import { Link } from '@/components/tiptap-extension/link-extension';
import { Selection } from '@/components/tiptap-extension/selection-extension';
import { TrailingNode } from '@/components/tiptap-extension/trailing-node-extension';
import { ImageUploadNode } from '@/components/tiptap-node/image-upload-node/image-upload-node-extension';
import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap-utils';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import { CustomHeading } from '@/components/tiptap-extension/CustomHeader/CustomHeading';

// 解析 markdown 到 JSON 内容的函数
const parseMarkdownToJSON = (
  markdown: string,
  canEditHeader: boolean = true,
) => {
  if (!markdown) return null;

  try {
    // 创建临时编辑器实例用于解析 markdown
    const tempEditor = new Editor({
      extensions: [
        StarterKit.configure({ heading: false }),
        HeadingWithId,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Underline,
        TaskList,
        TaskItem.configure({ nested: true }),
        Highlight.configure({ multicolor: true }),
        Image,
        Typography,
        Superscript,
        Subscript,
        Markdown.configure({
          html: false,
          transformPastedText: true,
        }),
        Selection,
        ...(canEditHeader ? [] : [CustomHeading]),
        ImageUploadNode.configure({
          accept: 'image/*',
          maxSize: MAX_FILE_SIZE,
          limit: 3,
          upload: handleImageUpload,
          onError: error => console.error('Upload failed:', error),
        }),
        TrailingNode,
        Link.configure({ openOnClick: false }),
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
      ],
      content: markdown,
    });

    // 获取解析后的 JSON 内容
    const jsonContent = tempEditor.getJSON();

    // 销毁临时实例
    tempEditor.destroy();

    return jsonContent;
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return null;
  }
};

export function replaceHeadingSectionWithMarkdown(
  headingText: string,
  markdown: string,
  markdownParser: MarkdownParser = defaultMarkdownParser,
) {
  return ({ editor, state }: CommandProps) => {
    const { doc, schema } = state;
    const headingType = schema.nodes.heading;

    let targetPos: { index: number; pos: number; node: any } | null = null;

    // ✅ 优化查找：按 block node 遍历，快速定位目标 heading
    for (let i = 0; i < doc.content.childCount; i++) {
      const node = doc.content.child(i);
      if (
        node.type === headingType &&
        node.textContent.trim().includes((headingText || '').trim())
      ) {
        // 计算绝对位置
        let pos = 0;
        for (let j = 0; j < i; j++) {
          pos += doc.content.child(j).nodeSize;
        }
        targetPos = { index: i, pos, node };
        break;
      }
    }

    if (!targetPos) return false;

    // ✅ 向后查找：只遍历 heading 后的内容，直到下一个 heading 或结尾
    let endIndex = doc.content.childCount;
    for (let i = targetPos.index + 1; i < doc.content.childCount; i++) {
      const node = doc.content.child(i);
      if (node.type === headingType) {
        endIndex = i;
        break;
      }
    }

    // 计算替换范围的起止位置
    let from = targetPos.pos + targetPos.node.nodeSize;
    let to = from;
    for (let i = targetPos.index + 1; i < endIndex; i++) {
      to += doc.content.child(i).nodeSize;
    }

    // 使用新的解析方法
    const parsedContent = parseMarkdownToJSON(markdown, true);
    let content;

    if (parsedContent) {
      // 使用新的解析结果
      content = parsedContent.content;
    } else {
      // 回退到原来的解析方法
      const parsedDoc = markdownParser.parse(markdown);
      content = parsedDoc.toJSON().content;
    }

    // from/to 是两个 block 之间的位置
    editor
      .chain()
      .deleteRange({ from, to })
      .insertContentAt(from, content)
      .run();
    return true;
  };
}
