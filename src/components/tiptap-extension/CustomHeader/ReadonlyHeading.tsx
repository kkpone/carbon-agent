// ReadonlyHeading.tsx
import { NodeViewWrapper } from '@tiptap/react';

export const ReadonlyHeading = (props: any) => {
  const level = props.node.attrs.level || 1;
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  // 去除前后可能出现的 ** 符号
  const cleanTextContent =
    props.node.textContent?.replace(/^\*\*|\*\*$/g, '') || '';

  return (
    <NodeViewWrapper
      as={Tag}
      contentEditable={false}
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
        opacity: 0.85,
      }}
    >
      {cleanTextContent}
    </NodeViewWrapper>
  );
};
