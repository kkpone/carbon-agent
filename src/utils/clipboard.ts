export type ClipboardText = string | Promise<string>;

export class ClipboardCopyError extends Error {
  constructor() {
    super('Clipboard copy failed');
    this.name = 'ClipboardCopyError';
  }
}

const copyTextWithHiddenTextarea = (text: string) => {
  if (typeof document === 'undefined') {
    throw new ClipboardCopyError();
  }

  const previousActiveElement = document.activeElement;
  const textarea = document.createElement('textarea');

  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.inset = '0 auto auto 0';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  try {
    if (!document.execCommand('copy')) {
      throw new ClipboardCopyError();
    }
  } catch (error) {
    throw error instanceof ClipboardCopyError
      ? error
      : new ClipboardCopyError();
  } finally {
    document.body.removeChild(textarea);

    if (previousActiveElement instanceof HTMLElement) {
      previousActiveElement.focus();
    }
  }
};

/**
 * 无弹窗复制文本，并兼容需要先异步获取复制内容的 Safari 场景。
 * 内容依赖接口请求时，应在用户点击事件内直接传入 Promise<string>，不要先 await。
 */
export const copyToClipboard = async (text: ClipboardText): Promise<void> => {
  const textPromise = Promise.resolve(text);

  if (
    typeof navigator !== 'undefined' &&
    typeof ClipboardItem !== 'undefined' &&
    navigator.clipboard?.write
  ) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': textPromise.then(
            value => new Blob([value], { type: 'text/plain' }),
          ),
        }),
      ]);
      return;
    } catch {
      // Safari 旧版本或权限受限时继续使用无弹窗兜底。
    }
  }

  const resolvedText = await textPromise;

  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard?.writeText &&
    typeof window !== 'undefined' &&
    window.isSecureContext
  ) {
    try {
      await navigator.clipboard.writeText(resolvedText);
      return;
    } catch {
      // Clipboard API 不可用时继续使用隐藏文本框复制。
    }
  }

  copyTextWithHiddenTextarea(resolvedText);
};
