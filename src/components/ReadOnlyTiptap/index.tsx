import I18N from '@src/lang/I18N';
import { FC, useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { Markdown } from 'tiptap-markdown';

// --- Tiptap Core Extensions ---
import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';

// --- Custom Extensions ---

// --- Tiptap Node ---
import '@/components/tiptap-node/code-block-node/code-block-node.scss';
import '@/components/tiptap-node/list-node/list-node.scss';
import '@/components/tiptap-node/image-node/image-node.scss';
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss';

import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Underline } from '@tiptap/extension-underline';
import { StarterKit } from '@tiptap/starter-kit';

import { CustomHeading } from '@/components/tiptap-extension/CustomHeader/CustomHeading';
import { Link } from '@/components/tiptap-extension/link-extension';
import { Selection } from '@/components/tiptap-extension/selection-extension';
import { TrailingNode } from '@/components/tiptap-extension/trailing-node-extension';
import { ImageUploadNode } from '@/components/tiptap-node/image-upload-node/image-upload-node-extension';
import { HeadingWithId } from '@/components/tiptap-templates/simple/HeadingWithId';

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap-utils';

import styles from './index.module.less';

export interface ReadOnlyTiptapProps {
  /**
   * Markdown 内容
   */
  content: string;
  /**
   * 自定义样式类名
   */
  className?: string;
  /**
   * 是否显示占位符
   */
  showPlaceholder?: boolean;
  /**
   * 占位符文本
   */
  placeholder?: string;
}

export const ReadOnlyTiptap: FC<ReadOnlyTiptapProps> = ({
  content,
  className,
  showPlaceholder = false,
  placeholder = I18N.carbonFootprint3.thereIsCurrentlyNoContentAvailable,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      HeadingWithId, // 使用带 ID 的标题组件
      CustomHeading, // 使用只读的标题组件
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
        html: false, // 禁止 HTML 解析
        transformPastedText: true, // 允许粘贴转换
      }),
      Selection,
      ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
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
    content: content || (showPlaceholder ? placeholder : ''),
    editable: false, // 设置为只读
    editorProps: {
      attributes: {
        class: 'readonly-editor',
        'data-placeholder': showPlaceholder ? placeholder : '',
      },
    },
  });

  // 当内容变化时更新编辑器内容
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(
        content || (showPlaceholder ? placeholder : ''),
      );
    }
  }, [content, editor, showPlaceholder, placeholder]);

  return (
    <div className={`${styles.readOnlyTiptap} ${className || ''}`}>
      <EditorContent editor={editor} />
    </div>
  );
};
