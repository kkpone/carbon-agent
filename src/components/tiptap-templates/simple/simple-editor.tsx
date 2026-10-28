import I18N from '@src/lang/I18N';
import * as React from 'react';
import {
  EditorContent,
  EditorContext,
  useEditor,
  BubbleMenu,
} from '@tiptap/react';
import aiSvg from '@src/assets/icon/esg/ai.svg';
import type { HocuspocusProvider } from '@hocuspocus/provider';
import { Collaboration } from '@tiptap/extension-collaboration';
import { Markdown } from 'tiptap-markdown';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';

// --- Tiptap Core Extensions ---
import { StarterKit } from '@tiptap/starter-kit';
// import { Image } from '@tiptap/extension-image';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Underline } from '@tiptap/extension-underline';
import { HeadingWithId } from './HeadingWithId';

// --- Custom Extensions ---
import { Link } from '@/components/tiptap-extension/link-extension';
import { Selection } from '@/components/tiptap-extension/selection-extension';
import { TrailingNode } from '@/components/tiptap-extension/trailing-node-extension';
import { NodeHoverMenu } from '@/components/tiptap-extension/node-hover-menu';
import { NodeHoverMenuView } from '@/components/tiptap-extension/node-hover-menu/node-hover-menu-view';
import { ResizableImage } from '@/components/tiptap-extension/resizable-image-extension';
import '@/components/tiptap-extension/resizable-image-extension/resizable-image-view.scss';

import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from '@/components/tiptap-ui-primitive/toolbar';
import { Button } from '@/components/tiptap-ui-primitive/button';
import { MarkButton } from '@/components/tiptap-ui/mark-button';
import { HeadingDropdownMenu } from '@/components/tiptap-ui/heading-dropdown-menu';
import { LinkPopover } from '@/components/tiptap-ui/link-popover';

// --- Tiptap Node ---
import { ImageUploadNode } from '@/components/tiptap-node/image-upload-node/image-upload-node-extension';
import '@/components/tiptap-node/code-block-node/code-block-node.scss';
import '@/components/tiptap-node/list-node/list-node.scss';
import '@/components/tiptap-node/image-node/image-node.scss';
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss';

import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';

// --- Hooks ---
import { useMobile } from '@/hooks/use-mobile';
import { useWindowSize } from '@/hooks/use-window-size';
import { useCursorVisibility } from '@/hooks/use-cursor-visibility';

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap-utils';

// --- Styles ---
import '@/components/tiptap-templates/simple/simple-editor.scss';

import { useSize, useThrottleFn } from 'ahooks';

import styles from './index.module.less';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { AiDrawerContent } from './component/AiDrawerContent';
import { Dropdown, Tooltip } from 'antd';
import expandSvg from './expand.svg';
import collapseSvg from './collapse.svg';
import infoSvg from './info.svg';
import TextWidthOverflow from '@/views/subModules/CarbonFootprintModel/components/byWidth';
import { uuid } from '@/utils';
import { checkPermissions } from '@/components/Permission/utils';
import {
  MainToolbarContent,
  MobileToolbarContent,
} from './component/MainToolbarContent';
import { CDPAiScore } from '@/components/CDPAiScore';
import { replaceHeadingSectionWithMarkdown } from '@/components/tiptap-extension/replaceContent';
import { getContentUnderHeading } from '@/components/tiptap-extension/getContentByHeader';
import { CustomHeading } from '@/components/tiptap-extension/CustomHeader/CustomHeading';
import { ListDropdownMenu } from '@/components/tiptap-ui/list-dropdown-menu';
import { LibraryDrawerContent } from './component/LibraryDrawerCotent';
import polishSvg from '@src/assets/icon/esg/polish.svg';
import extensionSvg from '@src/assets/icon/esg/extension.svg';
import summarySvg from '@src/assets/icon/esg/summary.svg';
import continuationSvg from '@src/assets/icon/esg/continuation.svg';
import { HighlightPopover } from '@/components/tiptap-ui/highlight-popover';

// 更友好的颜色列表（柔和、高对比度、适合光标高亮）
const friendlyColors = [
  '#f783ac',
  '#748ffc',
  '#63e6be',
  '#ffd43b',
  '#ff8787',
  '#a9e34b',
  '#ff922b',
  '#69db7c',
  '#9775fa',
  '#38d9a9',
  '#4dabf7',
  '#fcc419',
  '#ffa94d',
  '#ff6b6b',
  '#5c7cfa',
  '#d0bfff',
];

function trimMatchedBoldMarkers(str: string) {
  return str
    .replace(/^(\*\*|\\\*\\\*)/, '') // 去掉开头的 ** 或 \*\*
    .replace(/(\*\*|\\\*\\\*)$/, ''); // 去掉结尾的 ** 或 \*\*
}

export function getRandomFriendlyColor() {
  const index = Math.floor(Math.random() * friendlyColors.length);
  return friendlyColors[index];
}

let preScrollTop = 0;

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

export const SimpleEditor = React.forwardRef(function SimpleEditor(
  props: {
    slug: string;
    provider: HocuspocusProvider;
    reportContent: string;
    syncToHocuspocus: boolean;
    connectStatus: boolean;
    editReport: (str: string) => Promise<void>;
    stopAutoScroll: () => void;
    showAiWrite?: boolean;
    showToolbar?: boolean;
    canEditHeader?: boolean;
    reportVersion?: string;
    reportId: number;
  },
  ref,
) {
  const {
    syncToHocuspocus,
    connectStatus,
    editReport,
    stopAutoScroll,
    showAiWrite = true,
    showToolbar = true,
    canEditHeader = true,
    reportVersion = '1',
    reportId,
  } = props;
  const isMobile = useMobile();
  const windowSize = useWindowSize();
  const [mobileView, setMobileView] = React.useState<
    'main' | 'highlighter' | 'link'
  >('main');
  const toolbarRef = React.useRef<HTMLDivElement>(null);

  const [headings, setHeadings] = React.useState<
    { id: string; level: number; text: string }[]
  >([]);
  const userInfo = useSelector<
    RootState,
    RootState['companyUserInfo']['userInfo']
  >(s => s.companyUserInfo.userInfo);

  function parseMarkdownToTOC(markdown: string) {
    const lines = markdown.split('\n');
    const toc: { id: string; level: number; text: string }[] = [];

    const headingRegex = /^(#{1,6})\s+(.+?)\s*$/;

    for (const line of lines) {
      const match = line.match(headingRegex);
      if (match) {
        const level = match[1].length; // 标题级别
        const text = match[2].trim(); // 标题文本
        const id = uuid(); // 生成 id

        toc.push({ id, level, text });
      }
    }

    return toc;
  }

  // 👇 提取 heading 节点
  const updateHeadings = () => {
    if (!editor) return;

    try {
      const markDown = editor?.storage.markdown.getMarkdown();
      const nodes: { id: string; level: number; text: string }[] =
        parseMarkdownToTOC(markDown);
      setHeadings(nodes);
    } catch (error) {
      console.error(error);
    }
  };

  const { run } = useThrottleFn(() => updateHeadings(), { wait: 1000 });

  const [selected, setSelected] = React.useState(false);

  React.useEffect(() => {
    run();
  }, [syncToHocuspocus]);

  React.useEffect(() => {
    if (props.reportContent) {
      run();
    }
  }, [props.reportContent]);

  const selectTextRef = React.useRef<string>();
  const [selectText, setSelectText] = React.useState<string>('');
  const [selectTextType, setSelectTextType] =
    React.useState<SelectTextType>('');

  const enable = canEditHeader
    ? checkPermissions(true, 'esg:frameReport:edit')
    : checkPermissions(true, '/enterpriseCarbonAccounting/CdpAiReport/edit');

  const heading = canEditHeader ? [] : [CustomHeading];

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        'aria-label': 'Main content area, start typing to enter text.',
      },
    },
    editable: Boolean(enable),
    extensions: [
      StarterKit.configure({ heading: false }),
      HeadingWithId,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      ResizableImage.configure({
        inline: false,
        allowBase64: false,
      }),
      Typography,
      Superscript,
      Subscript,
      Collaboration.configure({
        document: props.provider?.document,
      }),
      Markdown.configure({
        html: false, // 禁止 HTML 解析
        transformPastedText: true, // 允许粘贴转换
      }),
      CollaborationCursor.configure({
        provider: props.provider,
        user: {
          name: userInfo?.user?.nickName,
          color: getRandomFriendlyColor(),
        },
      }),
      Selection,
      NodeHoverMenu.configure({
        hoverDelay: 50,
        showOnEmpty: true,
      }),
      ...heading,
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
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, ' ');
      setSelected(from !== to);
      selectTextRef.current = selectedText;
    },
    onUpdate: () => {
      run();
    },
  });

  React.useImperativeHandle(
    ref,
    () => {
      return {
        async submitReport() {
          await editReport(editor?.storage.markdown.getMarkdown());
        },
        openDraw() {
          setTargetOpen(true);
        },
      };
    },
    [props.provider, editor],
  );

  const submitReportMarkdown = React.useCallback(async () => {
    await editReport(editor?.storage.markdown.getMarkdown());
  }, [editor, editReport]);

  React.useEffect(() => {
    if (props.provider.isSynced) {
      try {
        if (
          !syncToHocuspocus &&
          props.reportContent &&
          !editor?.storage.markdown.getMarkdown()
        ) {
          editor?.commands.setContent(props.reportContent);
        }
      } catch (error) {
        console.error(error);
      }
    }

    props.provider.on('synced', function sssss() {
      if (props.provider.isSynced) {
        try {
          if (
            !syncToHocuspocus &&
            props.reportContent &&
            !editor?.storage.markdown.getMarkdown()
          ) {
            editor?.commands.setContent(props.reportContent);
          }
        } catch (error) {
          console.error(error);
        }
      }
    });
  }, [props.provider, editor]);

  React.useEffect(() => {
    if (!props.reportContent || !syncToHocuspocus) {
      return;
    }
    run();
    editor?.commands.setContent(props.reportContent);
  }, [props.reportContent, syncToHocuspocus, connectStatus]);

  const bodyRect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  React.useEffect(() => {
    if (!isMobile && mobileView !== 'main') {
      setMobileView('main');
    }
  }, [isMobile, mobileView]);

  const [targetOpen, setTargetOpen] = React.useState(false);
  const [libraryOpen, setLibraryOpen] = React.useState(false);

  const onClose = React.useCallback(() => {
    setTargetOpen(false);
  }, []);

  const insertText = React.useCallback(
    (text: string) => {
      if (!editor) return;
      editor.chain().focus().insertContent(text).run();
    },
    [editor],
  );

  const [tocExpand, setTocExpand] = React.useState(true);

  const size = useSize(document.body);

  const paddingLeft = React.useMemo(() => {
    if ((size?.width || 1440) <= 1440) {
      if (tocExpand) {
        return 300;
      } else {
        if (targetOpen || libraryOpen) {
          return 80;
        }
        return 0;
      }
    } else {
      if (tocExpand && (targetOpen || libraryOpen)) {
        return 300;
      }
    }
    return 0;
  }, [tocExpand, targetOpen, size, libraryOpen]);

  const element = document.querySelector('#your-element-id');
  const rect = element?.getBoundingClientRect();
  const distanceToRight = window.innerWidth - (rect?.right || 0);

  const [showBtn, setShowBtn] = React.useState(true);

  React.useEffect(() => {
    setShowBtn(false);

    setTimeout(() => {
      setShowBtn(true);
    }, 300);
  }, [tocExpand, targetOpen]);

  const setSelectNone = React.useCallback(() => {
    editor?.chain().focus().setTextSelection(editor?.state.selection.to).run();
  }, [editor]);

  const replaceContent = React.useCallback(
    (targetHeader: string, content: string) => {
      if (!editor) return;
      editor.commands.command(
        replaceHeadingSectionWithMarkdown(targetHeader, content),
      );
    },
    [editor],
  );

  const getContentByHeader = React.useCallback(
    (targetHeader: string) => {
      if (!editor) return '';
      try {
        return getContentUnderHeading(editor, targetHeader) || '';
      } catch (error) {
        return '';
      }
    },
    [editor],
  );

  return (
    <EditorContext.Provider value={{ editor }}>
      {editor && (
        <NodeHoverMenuView
          editor={editor}
          openLibrary={() => {
            setTargetOpen(false);
            setLibraryOpen(true);
          }}
          command={(selectText: string, command: string) => {
            selectTextRef.current = selectText;
            setTargetOpen(true);
            setLibraryOpen(false);
            setSelectText('');
            setSelectTextType(command as SelectTextType);
            setTimeout(() => {
              setSelectText(selectText || '');
            }, 0);
          }}
        />
      )}

      {editor && showToolbar && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor, from, to }) => {
            const { state } = editor;
            const { doc } = state;

            // 获取内容切片
            const slice = doc.slice(from, to);

            // 转为 ProseMirror Node
            const node = slice.content;
            if (node.content[0]?.type?.name === 'image') {
              return false;
            }
            if (node.size === 0) {
              return false;
            }
            return true;
          }}
          tippyOptions={{ duration: 100, zIndex: 99 }}
        >
          <div
            className='tiptap-toolbar'
            data-variant='floating'
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            {/* AI 改写按钮组 */}
            <ToolbarGroup>
              <Dropdown
                menu={{
                  items: commands.map(({ key, label, icon }) => ({
                    key,
                    label: (
                      <div
                        onClick={() => {
                          setTargetOpen(true);
                          setLibraryOpen(false);
                          setSelectText('');
                          setSelectTextType(key as SelectTextType);
                          setTimeout(() => {
                            setSelectText(selectTextRef.current || '');
                          }, 0);
                        }}
                      >
                        <img src={icon} alt='' />
                        {label}
                      </div>
                    ),
                  })),
                }}
              >
                <Button
                  data-style='ghost'
                  data-active-state='off'
                  aria-label={I18N.components.aiRewriting}
                  tooltip={I18N.components.aiRewriting}
                  showTooltip
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='14'
                    height='15'
                    viewBox='0 0 14 15'
                    fill='none'
                    className='tiptap-button-icon'
                  >
                    <path
                      d='M5.71614 2.82514C5.83614 2.39847 6.44947 2.39847 6.56947 2.82514L7.15614 4.9318C7.48947 6.11847 8.4228 7.0518 9.6228 7.38514L11.7295 7.98514C12.1561 8.10514 12.1561 8.71847 11.7295 8.83847L9.6228 9.42514C8.4228 9.7718 7.48947 10.6918 7.15614 11.8918L6.56947 13.9985C6.44947 14.4251 5.83614 14.4251 5.71614 13.9985L5.11614 11.8918C4.7828 10.7051 3.84947 9.7718 2.6628 9.42514L0.556136 8.83847C0.461117 8.81453 0.376808 8.75956 0.316575 8.68227C0.256342 8.60498 0.223633 8.50979 0.223633 8.4118C0.223633 8.31381 0.256342 8.21863 0.316575 8.14134C0.376808 8.06405 0.461117 8.00908 0.556136 7.98514L2.6628 7.38514C3.84947 7.0518 4.7828 6.11847 5.11614 4.9318L5.71614 2.82514ZM11.3428 0.865137C11.3828 0.731803 11.5561 0.731803 11.5961 0.865137L11.8361 1.6918C11.9695 2.18514 12.3561 2.5718 12.8495 2.70514L13.6761 2.94514C13.8095 2.98514 13.8095 3.15847 13.6761 3.19847L12.8495 3.43847C12.3561 3.5718 11.9695 3.95847 11.8361 4.4518L11.5961 5.27847C11.5561 5.4118 11.3828 5.4118 11.3428 5.27847L11.1028 4.4518C10.9695 3.95847 10.5828 3.5718 10.0895 3.43847L9.2628 3.19847C9.12947 3.15847 9.12947 2.98514 9.2628 2.94514L10.0895 2.70514C10.5828 2.5718 10.9695 2.18514 11.1028 1.6918L11.3428 0.865137Z'
                      fill='currentColor'
                    />
                  </svg>
                  <span>{I18N.components.aiRewriting}</span>
                </Button>
              </Dropdown>
            </ToolbarGroup>

            <ToolbarSeparator />

            {/* 标题下拉框 */}
            <ToolbarGroup>
              <HeadingDropdownMenu editor={editor} levels={[1, 2, 3, 4]} />
              <ListDropdownMenu
                types={['bulletList', 'orderedList', 'taskList']}
              />
            </ToolbarGroup>

            <ToolbarSeparator />

            {/* 文本格式按钮组 */}
            <ToolbarGroup>
              <MarkButton type='bold' editor={editor} />
              <MarkButton type='italic' editor={editor} />
              <MarkButton type='strike' editor={editor} />
              <MarkButton type='underline' editor={editor} />
              <HighlightPopover />
            </ToolbarGroup>

            <ToolbarSeparator />

            {/* 链接按钮 */}
            {/* <ToolbarGroup>
              <LinkPopover editor={editor} />
            </ToolbarGroup> */}
          </div>
        </BubbleMenu>
      )}

      {showToolbar && (
        <Toolbar
          ref={toolbarRef}
          style={
            isMobile
              ? {
                  bottom: `calc(100% - ${windowSize.height - bodyRect.y}px)`,
                }
              : {}
          }
        >
          {mobileView === 'main' ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView('highlighter')}
              onLinkClick={() => setMobileView('link')}
              isMobile={isMobile}
              editor={editor}
              openWriting={() => {
                if (syncToHocuspocus) {
                  return;
                }
                setLibraryOpen(false);
                setTargetOpen(pre => !pre);
                if ((size?.width || 2080) <= 1440) {
                  setTocExpand(false);
                }
              }}
              openLibrary={() => {
                if (syncToHocuspocus) {
                  return;
                }
                setTargetOpen(false);
                setLibraryOpen(true);
              }}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === 'highlighter' ? 'highlighter' : 'link'}
              onBack={() => setMobileView('main')}
            />
          )}
        </Toolbar>
      )}
      <div className={classNames(styles.editorWrapper)}>
        <div className={styles.editor}>
          <div className={styles.toc}>
            <Tooltip
              title={
                tocExpand
                  ? I18N.components.collapseDirectory
                  : I18N.components.expandDirectory
              }
            >
              <div
                className={styles.close}
                onClick={() => {
                  setTocExpand(pre => !pre);
                }}
              >
                <img src={tocExpand ? collapseSvg : expandSvg} alt='' />
              </div>
            </Tooltip>
            <div
              className={classNames(styles.tocContent, {
                [styles.expand]: tocExpand,
              })}
            >
              <ul className={styles.tocUl}>
                {headings.map(({ id, level, text }) => (
                  <li
                    key={id}
                    style={{
                      marginLeft: (level - 1) * 12,
                      cursor: 'pointer',
                      height: 'fit-content',
                    }}
                    onClick={() => {
                      console.log(text);
                      const els = document.querySelectorAll(`h${level}`);
                      let targetEl: HTMLElement | undefined = undefined;
                      editor
                        ?.chain()
                        .focus()
                        .setTextSelection(editor?.state.selection.to)
                        .run();

                      for (const el of els) {
                        if (
                          el instanceof HTMLElement &&
                          (el.innerText === text ||
                            text.includes(trimMatchedBoldMarkers(el.innerText)))
                        ) {
                          targetEl = el;
                          break; // 找到就退出
                        }
                      }
                      setTimeout(() => {
                        targetEl?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                      }, 32);
                    }}
                  >
                    <TextWidthOverflow
                      width={230 - (level - 1) * 12}
                      value={trimMatchedBoldMarkers(text)}
                    ></TextWidthOverflow>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div
            className={classNames('content-wrapper', styles.contentWrapper, {
              [styles.openWrapper]: true,
            })}
            style={{
              paddingLeft: paddingLeft,
            }}
            onScroll={e => {
              const target = e.target as HTMLElement;
              if (preScrollTop && target.scrollTop < preScrollTop) {
                stopAutoScroll?.();
              }
              preScrollTop = target.scrollTop;
            }}
          >
            {!connectStatus && (
              <div className={styles.alert}>
                <img src={infoSvg} alt='' />
                <span>
                  {I18N.components.youAreCurrentlyInAStateOfSeparation}
                </span>
              </div>
            )}
            <EditorContent
              editor={editor}
              role='presentation'
              id='your-element-id'
              className={classNames('simple-editor-content', {
                [styles.pointerEventsNone]: syncToHocuspocus,
              })}
            />
            <div id='editorContent'></div>
          </div>
          <div
            className={classNames(styles.model, {
              [styles.open]: targetOpen,
            })}
          >
            {showAiWrite && (
              <AiDrawerContent
                selected={selected}
                selectText={selectText}
                selectTextType={selectTextType}
                setSelectTextType={setSelectTextType}
                onClose={onClose}
                insertText={insertText}
                open={targetOpen}
                setSelectNone={setSelectNone}
              />
            )}
            {!showAiWrite && (
              <CDPAiScore
                submitReportMarkdown={submitReportMarkdown}
                replaceContent={replaceContent}
                reportVersion={reportVersion}
                setOpen={() => setTargetOpen(true)}
                getContentByHeader={getContentByHeader}
                close={() => setTargetOpen(false)}
              />
            )}
          </div>
          <div
            className={classNames(styles.model, {
              [styles.open]: libraryOpen,
            })}
          >
            {libraryOpen && (
              <LibraryDrawerContent
                open={libraryOpen}
                editor={editor!}
                reportId={reportId}
                onClose={() => setLibraryOpen(false)}
              />
            )}
          </div>
        </div>
      </div>
    </EditorContext.Provider>
  );
});
