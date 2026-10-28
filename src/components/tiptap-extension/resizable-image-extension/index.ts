import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Image } from '@tiptap/extension-image';
import { ResizableImageView } from './resizable-image-view';

export interface ResizableImageOptions {
  /**
   * Controls if the image node should be inline or not.
   * @default false
   */
  inline: boolean;

  /**
   * Controls if base64 images are allowed.
   * @default false
   */
  allowBase64: boolean;

  /**
   * HTML attributes to add to the image element.
   * @default {}
   */
  HTMLAttributes: Record<string, any>;

  /**
   * Default width for images
   * @default null
   */
  defaultWidth?: number | null;

  /**
   * Default height for images
   * @default null
   */
  defaultHeight?: number | null;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImage: {
      /**
       * Add a resizable image
       */
      setResizableImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        width?: number;
        height?: number;
      }) => ReturnType;
    };
  }
}

/**
 * 可调整大小的图片扩展
 * 继承自 @tiptap/extension-image，添加了拖拽左下角调整大小的功能
 */
export const ResizableImage = Image.extend<ResizableImageOptions>({
  name: 'image',

  addOptions() {
    return {
      ...this.parent?.(),
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
      defaultWidth: null,
      defaultHeight: null,
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: this.options.defaultWidth,
        parseHTML: element => {
          const width = element.getAttribute('width');
          return width ? parseInt(width, 10) : null;
        },
        renderHTML: attributes => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
          };
        },
      },
      height: {
        default: this.options.defaultHeight,
        parseHTML: element => {
          const height = element.getAttribute('height');
          return height ? parseInt(height, 10) : null;
        },
        renderHTML: attributes => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: this.options.allowBase64
          ? 'img[src]'
          : 'img[src]:not([src^="data:"])',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },

  addCommands() {
    return {
      setResizableImage:
        options =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

export default ResizableImage;
