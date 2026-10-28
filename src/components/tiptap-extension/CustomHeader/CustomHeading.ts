// CustomHeading.ts
import { Heading } from '@tiptap/extension-heading';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ReadonlyHeading } from './ReadonlyHeading';

export const CustomHeading = Heading.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ReadonlyHeading);
  },
});
