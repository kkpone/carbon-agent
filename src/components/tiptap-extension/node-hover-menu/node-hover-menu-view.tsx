import I18N from '@src/lang/I18N';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { Editor } from '@tiptap/react';
import { nodeHoverMenuPluginKey } from './node-hover-menu-extension';
import type { NodeHoverState } from './node-hover-menu-extension';
import './node-hover-menu.scss';
import { HeadingButton } from '@/components/tiptap-ui/heading-button';
import { Level } from '@tiptap/extension-heading';
import { ListButton } from '@/components/tiptap-ui/list-button';
import { getFilteredListOptions } from '@/components/tiptap-ui/list-dropdown-menu';
import styles from './index.module.less';
import { ImageUploadButton } from '@/components/tiptap-ui/image-upload-button';
import { Button } from '@/components/tiptap-ui-primitive/button';
import polishSvg from '@src/assets/icon/esg/polish.svg';
import extensionSvg from '@src/assets/icon/esg/extension.svg';
import summarySvg from '@src/assets/icon/esg/summary.svg';
import continuationSvg from '@src/assets/icon/esg/continuation.svg';
import { IconAlibabaNew } from '@/components/iconfont';

type SelectTextType = 'polish' | 'summary' | 'expand' | '' | 'continuation';

const commands: { key: SelectTextType; label: string; icon: string }[] = [
  {
    key: 'polish',
    label: I18N.components.polishing,
    icon: polishSvg,
  },
  {
    key: 'expand',
    label: I18N.components.elaborateOn,
    icon: extensionSvg,
  },
  {
    key: 'summary',
    label: I18N.components.abbreviation,
    icon: summarySvg,
  },
  {
    key: 'continuation',
    label: I18N.components.continuation,
    icon: continuationSvg,
  },
  {
    key: '',
    label: I18N.carbonFootprint.custom,
    icon: '',
  },
];

interface MenuOption {
  label: string;
  icon?: string;
  action: (editor: Editor, state: NodeHoverState) => void;
  divider?: boolean;
  isActive?: (editor: Editor, state: NodeHoverState) => boolean;
  showWhen?: (editor: Editor, state: NodeHoverState) => boolean; // 控制是否显示该选项
}

// 判断节点是否为空（无内容）
function isNodeEmpty(editor: Editor, state: NodeHoverState): boolean {
  if (!state.node) return true;

  const text = editor.state.doc
    .textBetween(state.nodeStart, state.nodeEnd, ' ')
    .trim();

  return text.length === 0;
}

const menuOptions: MenuOption[] = [
  {
    label: I18N.components.paragraph,
    icon: '📝',
    action: (editor, state) => {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: state.nodeStart, to: state.nodeEnd })
        .setParagraph()
        .run();
    },
    isActive: (editor, state) => state.node?.type.name === 'paragraph',
  },
  {
    label: I18N.components.title7,
    icon: 'H1',
    action: (editor, state) => {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: state.nodeStart, to: state.nodeEnd })
        .setHeading({ level: 1 })
        .run();
    },
    isActive: (editor, state) =>
      state.node?.type.name === 'heading' && state.node?.attrs.level === 1,
  },
  {
    label: I18N.components.title6,
    icon: 'H2',
    action: (editor, state) => {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: state.nodeStart, to: state.nodeEnd })
        .setHeading({ level: 2 })
        .run();
    },
    isActive: (editor, state) =>
      state.node?.type.name === 'heading' && state.node?.attrs.level === 2,
  },
  {
    label: I18N.components.title5,
    icon: 'H3',
    action: (editor, state) => {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: state.nodeStart, to: state.nodeEnd })
        .setHeading({ level: 3 })
        .run();
    },
    isActive: (editor, state) =>
      state.node?.type.name === 'heading' && state.node?.attrs.level === 3,
  },
  {
    label: I18N.components.title4,
    icon: 'H4',
    action: (editor, state) => {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: state.nodeStart, to: state.nodeEnd })
        .setHeading({ level: 4 })
        .run();
    },
    isActive: (editor, state) =>
      state.node?.type.name === 'heading' && state.node?.attrs.level === 4,
  },
  {
    label: I18N.components.title3,
    icon: 'H5',
    action: (editor, state) => {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: state.nodeStart, to: state.nodeEnd })
        .setHeading({ level: 5 })
        .run();
    },
    isActive: (editor, state) =>
      state.node?.type.name === 'heading' && state.node?.attrs.level === 5,
  },
  {
    label: I18N.components.title2,
    icon: 'H6',
    action: (editor, state) => {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: state.nodeStart, to: state.nodeEnd })
        .setHeading({ level: 6 })
        .run();
    },
    isActive: (editor, state) =>
      state.node?.type.name === 'heading' && state.node?.attrs.level === 6,
  },
  {
    label: '',
    divider: true,
    action: () => {},
  },
  {
    label: I18N.components.bold,
    icon: '𝐁',
    showWhen: (editor, state) => !isNodeEmpty(editor, state), // 只在有内容时显示
    action: (editor, state) => {
      // 选中整个节点内容并加粗
      const from = state.nodeStart + 1;
      const to = state.nodeEnd - 1;

      if (from < to) {
        editor
          .chain()
          .focus()
          .setTextSelection({ from, to })
          .toggleBold()
          .setTextSelection(state.nodeEnd)
          .run();
      }
    },
  },
  {
    label: I18N.components.italic,
    icon: '𝐼',
    showWhen: (editor, state) => !isNodeEmpty(editor, state), // 只在有内容时显示
    action: (editor, state) => {
      const from = state.nodeStart + 1;
      const to = state.nodeEnd - 1;

      if (from < to) {
        editor
          .chain()
          .focus()
          .setTextSelection({ from, to })
          .toggleItalic()
          .setTextSelection(state.nodeEnd)
          .run();
      }
    },
  },
  {
    label: I18N.components.underline,
    icon: 'U̲',
    showWhen: (editor, state) => !isNodeEmpty(editor, state), // 只在有内容时显示
    action: (editor, state) => {
      const from = state.nodeStart + 1;
      const to = state.nodeEnd - 1;

      if (from < to) {
        editor
          .chain()
          .focus()
          .setTextSelection({ from, to })
          .toggleUnderline()
          .setTextSelection(state.nodeEnd)
          .run();
      }
    },
  },
  {
    label: '',
    divider: true,
    action: () => {},
  },
  {
    label: I18N.components.deleteNode,
    icon: '🗑️',
    action: (editor, state) => {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: state.nodeStart, to: state.nodeEnd })
        .deleteSelection()
        .run();
    },
  },
  {
    label: I18N.components.copyContent,
    icon: '📋',
    showWhen: (editor, state) => !isNodeEmpty(editor, state), // 只在有内容时显示
    action: (editor, state) => {
      const text = editor.state.doc.textBetween(
        state.nodeStart,
        state.nodeEnd,
        '\n',
      );

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
      }
    },
  },
];

interface NodeHoverMenuViewProps {
  editor: Editor;
  openLibrary?: () => void;
  command?: (text: string, type: string) => void;
}

export const NodeHoverMenuView = ({
  editor,
  openLibrary,
  command,
}: NodeHoverMenuViewProps) => {
  const [menuState, setMenuState] = React.useState<NodeHoverState>({
    pos: null,
    node: null,
    nodeStart: 0,
    nodeEnd: 0,
    rect: null,
    shouldHighlight: false,
  });
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isHoveringMenu, setIsHoveringMenu] = React.useState(false);
  const [isHoveringButton, setIsHoveringButton] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const updateMenuState = () => {
      const state = nodeHoverMenuPluginKey.getState(editor.state);
      if (state) {
        // 如果有新状态（鼠标重新进入节点），清除隐藏定时器
        if (state.pos !== null && hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }

        // 如果鼠标在菜单/按钮上，保持高亮状态
        if (isHoveringMenu && state.pos !== null) {
          setMenuState({
            ...state,
            shouldHighlight: true, // 强制保持高亮
          });
        } else {
          setMenuState(state);
        }

        // 如果节点改变，关闭菜单
        if (state.pos === null) {
          setIsMenuOpen(false);
        }
      }
    };

    // 监听编辑器更新
    editor.on('transaction', updateMenuState);

    return () => {
      editor.off('transaction', updateMenuState);
    };
  }, [editor, isHoveringMenu]);

  // 点击外部关闭菜单
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // 清理定时器
  React.useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // 监听全局鼠标移动，当鼠标不在节点/按钮/菜单上时自动隐藏
  React.useEffect(() => {
    if (!menuState.rect || menuState.pos === null) {
      return;
    }

    const handleGlobalMouseMove = (event: MouseEvent) => {
      // 如果鼠标在按钮或菜单上，不处理
      if (
        (buttonRef.current &&
          buttonRef.current.contains(event.target as Node)) ||
        (menuRef.current && menuRef.current.contains(event.target as Node))
      ) {
        return;
      }

      // 检查鼠标是否在节点区域内
      const rect = menuState.rect;
      if (!rect) return;

      const isInNodeArea =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      // 如果鼠标不在节点区域且不在按钮/菜单上，延迟清空
      if (!isInNodeArea && !isHoveringMenu) {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }

        hideTimeoutRef.current = setTimeout(() => {
          setMenuState({
            pos: null,
            node: null,
            nodeStart: 0,
            nodeEnd: 0,
            rect: null,
            shouldHighlight: false,
          });
          setIsMenuOpen(false);
        }, 150);
      } else if (isInNodeArea && hideTimeoutRef.current) {
        // 如果鼠标重新进入节点区域，取消隐藏
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [menuState.rect, menuState.pos, isHoveringMenu]);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleOptionClick = (option: MenuOption) => {
    if (option.divider) return;

    option.action(editor, menuState);
    setIsMenuOpen(false);
  };

  const handleMouseEnter = () => {
    // 清除隐藏定时器
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    // 鼠标进入按钮/菜单时，启用高亮
    if (menuState.pos !== null) {
      const newState = {
        ...menuState,
        shouldHighlight: true,
      };

      const tr = editor.state.tr.setMeta(nodeHoverMenuPluginKey, newState);
      editor.view.dispatch(tr);

      // 立即更新本地状态
      setMenuState(newState);
    }

    // 设置 hover 状态
    setIsHoveringMenu(true);
    setIsHoveringButton(true);
  };

  const handleMouseLeave = () => {
    // 先设置 hover 状态为 false
    setIsHoveringMenu(false);
    setIsHoveringButton(false);

    // 鼠标离开按钮/菜单时，取消高亮
    if (menuState.pos !== null) {
      const newState = {
        ...menuState,
        shouldHighlight: false,
      };

      const tr = editor.state.tr.setMeta(nodeHoverMenuPluginKey, newState);
      editor.view.dispatch(tr);

      // 立即更新本地状态
      setMenuState(newState);
    }

    // 注意：延迟隐藏由全局 mousemove 监听器处理
  };

  if (!menuState.rect || menuState.pos === null) {
    return null;
  }

  const buttonStyle: React.CSSProperties = {
    position: 'fixed',
    top: menuState.rect.top,
    left: menuState.rect.left - 40,
    zIndex: 1100,
  };

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: menuState.rect.top + 26,
    left: menuState.rect.left - 40,
    zIndex: 1101,
  };

  const isEmpty = isNodeEmpty(editor, menuState);

  return createPortal(
    <>
      <button
        ref={buttonRef}
        className={`node-hover-menu-button ${
          isHoveringButton && !isEmpty ? 'hovering' : ''
        }`}
        style={buttonStyle}
        onClick={handleMenuToggle}
        onMouseDown={e => e.preventDefault()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {!isEmpty && (
          <>
            <div style={{ width: '14px', height: '14px', marginLeft: '3px' }}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='14'
                height='14'
                viewBox='0 0 14 14'
                fill='none'
              >
                <path
                  d='M5.4925 2.06C5.6125 1.63333 6.22584 1.63333 6.34584 2.06L6.9325 4.16667C7.26584 5.35333 8.19917 6.28667 9.39917 6.62L11.5058 7.22C11.9325 7.34 11.9325 7.95333 11.5058 8.07333L9.39917 8.66C8.19917 9.00667 7.26584 9.92667 6.9325 11.1267L6.34584 13.2333C6.22584 13.66 5.6125 13.66 5.4925 13.2333L4.8925 11.1267C4.55917 9.94 3.62584 9.00667 2.43917 8.66L0.332503 8.07333C0.237484 8.04939 0.153175 7.99442 0.092942 7.91713C0.0327093 7.83984 0 7.74466 0 7.64667C0 7.54868 0.0327093 7.45349 0.092942 7.3762C0.153175 7.29891 0.237484 7.24394 0.332503 7.22L2.43917 6.62C3.62584 6.28667 4.55917 5.35333 4.8925 4.16667L5.4925 2.06ZM11.1192 0.1C11.1592 -0.0333333 11.3325 -0.0333333 11.3725 0.1L11.6125 0.926667C11.7458 1.42 12.1325 1.80667 12.6258 1.94L13.4525 2.18C13.5858 2.22 13.5858 2.39333 13.4525 2.43333L12.6258 2.67333C12.1325 2.80667 11.7458 3.19333 11.6125 3.68667L11.3725 4.51333C11.3325 4.64667 11.1592 4.64667 11.1192 4.51333L10.8792 3.68667C10.7458 3.19333 10.3592 2.80667 9.86584 2.67333L9.03917 2.43333C8.90584 2.39333 8.90584 2.22 9.03917 2.18L9.86584 1.94C10.3592 1.80667 10.7458 1.42 10.8792 0.926667L11.1192 0.1Z'
                  fill='#026961'
                />
              </svg>
            </div>
            <span className='node-hover-menu-button-text'>
              {I18N.components.aiRewriting}
            </span>
          </>
        )}
        {isEmpty && (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='12'
            height='12'
            viewBox='0 0 12 12'
            fill='none'
          >
            <path
              d='M5.75 0.75V10.75'
              stroke='#04252B'
              stroke-width='1.5'
              stroke-linecap='round'
              stroke-linejoin='round'
            />
            <path
              d='M0.75 5.75H10.75'
              stroke='#04252B'
              stroke-width='1.5'
              stroke-linecap='round'
              stroke-linejoin='round'
            />
          </svg>
        )}
      </button>

      {isMenuOpen && isEmpty && (
        <div
          ref={menuRef}
          className='node-hover-menu-dropdown'
          style={menuStyle}
          onMouseDown={e => e.preventDefault()}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className={styles.menuBox}>
            {[1, 2, 3, 4].map(level => (
              <HeadingButton
                editor={editor}
                level={level as Level}
                tooltip={''}
              />
            ))}
            {getFilteredListOptions(['bulletList', 'orderedList']).map(
              option => (
                <ListButton editor={editor} type={option.type} tooltip={''} />
              ),
            )}
          </div>
          <div>
            <ImageUploadButton text={I18N.components.localImage} />
          </div>
          <Button
            type='button'
            data-style='ghost'
            role='button'
            tabIndex={-1}
            aria-label='Add image'
            tooltip='Add image'
            onClick={() => openLibrary?.()}
          >
            <>
              <IconAlibabaNew type='icon-ziliaokutupian' />
              <span className='tiptap-button-text'>
                {I18N.components.databaseImages}
              </span>
            </>
          </Button>
        </div>
      )}
      {isMenuOpen && !isEmpty && (
        <div
          ref={menuRef}
          className='node-hover-menu-dropdown'
          style={menuStyle}
          onMouseDown={e => e.preventDefault()}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className={styles.menuList}>
            {commands.map(({ key, label, icon }) => (
              <div
                className={styles.menuItem}
                onClick={() => {
                  command?.(
                    menuState.node?.textContent || '',
                    key as SelectTextType,
                  );
                }}
              >
                <img src={icon} alt='' />
                {label}
              </div>
            ))}
          </div>
        </div>
      )}
    </>,
    document.body,
  );
};
