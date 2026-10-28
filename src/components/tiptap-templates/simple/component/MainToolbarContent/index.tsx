import I18N from '@src/lang/I18N';
import { Button } from '@/components/tiptap-ui-primitive/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/tiptap-ui-primitive/popover';
import { Dropdown, Tooltip } from 'antd';
import { Spacer } from '@/components/tiptap-ui-primitive/spacer';
import {
  ToolbarGroup,
  ToolbarSeparator,
} from '@/components/tiptap-ui-primitive/toolbar';
import { HeadingDropdownMenu } from '@/components/tiptap-ui/heading-dropdown-menu';
import { ListDropdownMenu } from '@/components/tiptap-ui/list-dropdown-menu';
import { NodeButton } from '@/components/tiptap-ui/node-button';
import { UndoRedoButton } from '@/components/tiptap-ui/undo-redo-button';
import React from 'react';
import TableSelector from '../../TableSelector';
import { MarkButton } from '@/components/tiptap-ui/mark-button';
import {
  HighlightContent,
  HighlighterButton,
  HighlightPopover,
} from '@/components/tiptap-ui/highlight-popover';
import {
  LinkButton,
  LinkContent,
  LinkPopover,
} from '@/components/tiptap-ui/link-popover';
import { TextAlignButton } from '@/components/tiptap-ui/text-align-button';
import { ImageUploadButton } from '@/components/tiptap-ui/image-upload-button';
import { ArrowLeftIcon } from '@/components/tiptap-icons/arrow-left-icon';
import { HighlighterIcon } from '@/components/tiptap-icons/highlighter-icon';
import { LinkIcon } from '@/components/tiptap-icons/link-icon';
import styles from './index.module.less';
import { ImagePlusIcon } from '@/components/tiptap-icons/image-plus-icon';
import { IconAlibabaNew } from '@/components/iconfont';
import classNames from 'classnames';

export const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
  editor,
  openLibrary,
  openWriting,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
  editor: any;
  openLibrary?: () => void;
  openWriting?: () => void;
}) => {
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const hoverRef = React.useRef({ trigger: false, content: false });
  const closeTimer = React.useRef<NodeJS.Timeout | null>(null);

  // 只要鼠标在按钮或内容区都保持 open，全部离开后延迟关闭
  const handleEnter = (area: 'trigger' | 'content') => {
    hoverRef.current[area] = true;
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setPopoverOpen(true);
  };
  const handleLeave = (area: 'trigger' | 'content') => {
    hoverRef.current[area] = false;
    if (!hoverRef.current.trigger && !hoverRef.current.content) {
      closeTimer.current = setTimeout(() => setPopoverOpen(false), 180);
    }
  };
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action='undo' />
        <UndoRedoButton action='redo' />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} />
        <ListDropdownMenu types={['bulletList', 'orderedList', 'taskList']} />
        <NodeButton type='codeBlock' />
        <NodeButton type='blockquote' />
        {/* 表格按钮 */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger
            asChild
            style={{
              zIndex: 1100,
            }}
          >
            <Button
              aria-label={I18N.components.insertTable}
              tooltip={I18N.components.insertTable}
              showTooltip
              data-active-state='off'
              data-style='ghost'
              // style={{ padding: 0, width: 32, height: 32 }}
              onMouseEnter={() => handleEnter('trigger')}
              onMouseLeave={() => handleLeave('trigger')}
            >
              <div
                style={{
                  width: '14px',
                  height: '14px',
                }}
              >
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 1024 1024'
                  version='1.1'
                  xmlns='http://www.w3.org/2000/svg'
                  p-id='3406'
                >
                  <path
                    d='M810.666667 917.333333H213.333333c-68.266667 0-128-55.466667-128-128v-554.666666c0-68.266667 55.466667-128 128-128h597.333334c68.266667 0 128 55.466667 128 128v554.666666c0 72.533333-55.466667 128-128 128zM213.333333 192c-21.333333 0-42.666667 17.066667-42.666666 42.666667v554.666666c0 21.333333 17.066667 42.666667 42.666666 42.666667h597.333334c21.333333 0 42.666667-17.066667 42.666666-42.666667v-554.666666c0-21.333333-17.066667-42.666667-42.666666-42.666667H213.333333z'
                    p-id='3407'
                  ></path>
                  <path
                    d='M98.133333 345.6h823.466667v85.333333H98.133333zM98.133333 580.266667h823.466667v85.333333H98.133333z'
                    p-id='3408'
                  ></path>
                  <path
                    d='M349.866667 388.266667h85.333333v469.333333h-85.333333zM597.333333 388.266667h85.333334v469.333333h-85.333334z'
                    p-id='3409'
                  ></path>
                </svg>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side='bottom'
            align='center'
            style={{
              zIndex: 1100,
            }}
            onMouseEnter={() => handleEnter('content')}
            onMouseLeave={() => handleLeave('content')}
          >
            <TableSelector
              maxRows={10}
              maxCols={10}
              onSelect={(rows, cols) => {
                setPopoverOpen(false);
                if (editor) {
                  editor
                    .chain()
                    .focus()
                    .insertTable({ rows, cols, withHeaderRow: true })
                    .run();
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type='bold' />
        <MarkButton type='italic' />
        <MarkButton type='strike' />
        <MarkButton type='code' />
        <MarkButton type='underline' />
        {!isMobile ? (
          <HighlightPopover />
        ) : (
          <HighlighterButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type='superscript' />
        <MarkButton type='subscript' />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align='left' />
        <TextAlignButton align='center' />
        <TextAlignButton align='right' />
        <TextAlignButton align='justify' />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <Dropdown
          menu={{
            items: [
              {
                key: '1',
                label: (
                  <div className={styles.btnItem}>
                    <ImageUploadButton
                      className={classNames(
                        styles.btnItem,
                        styles.localImageBtn,
                      )}
                    >
                      <IconAlibabaNew type='icon-benditupian' />
                      <span className='tiptap-button-text'>
                        {I18N.components.localImage}
                      </span>
                    </ImageUploadButton>
                  </div>
                ),
                // <ImageUploadButton text='本地图片' />,
              },
              {
                key: '2',
                label: (
                  <div
                    className={styles.btnItem}
                    onClick={() => openLibrary?.()}
                  >
                    <>
                      <IconAlibabaNew type='icon-ziliaokutupian' />
                      <span className='tiptap-button-text'>
                        {I18N.components.databaseImages}
                      </span>
                    </>
                  </div>
                ),
              },
            ],
          }}
          placement='bottom'
        >
          <ImageUploadButton text='Add' />
        </Dropdown>
      </ToolbarGroup>

      <Spacer />
      <div className={styles.toolbarGroup}>
        <Tooltip title={I18N.components.viewImageText} placement='bottom'>
          <div
            className={classNames(styles.toolbarGroupItem, styles.libraryBtn)}
            onClick={openLibrary}
          >
            <IconAlibabaNew type='icon-wenjianjia' />
            {I18N.components.database2}
          </div>
        </Tooltip>
        <div className={styles.toolbarGroupButton} onClick={openWriting}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='20'
            height='12'
            viewBox='0 0 20 12'
            fill='none'
          >
            <path
              d='M8.78027 0C9.09082 0 9.36922 0.191532 9.48047 0.481445L13.8184 11.7959C13.856 11.894 13.7837 11.9997 13.6787 12H10.0215C9.6686 12 9.36297 11.754 9.28809 11.4092L8.98242 10H5.38184L4.58398 11.5869C4.45663 11.8401 4.1975 12 3.91406 12H0.150391C0.0363006 12 -0.0364267 11.8773 0.0185547 11.7773L6.28223 0.388672C6.41398 0.149114 6.66607 0.000131474 6.93945 0H8.78027ZM19.3262 4C19.4164 4 19.4868 4.07942 19.4756 4.16895L18.5781 11.3428C18.5312 11.7181 18.2122 12 17.834 12H15.0664C14.9762 12 14.9058 11.9206 14.917 11.8311L15.8145 4.65723C15.8614 4.28191 16.1804 4 16.5586 4H19.3262ZM7.98633 5.41504C7.95633 5.27689 7.76965 5.25272 7.70605 5.37891L6.3877 8H8.54785L7.98633 5.41504ZM19.8193 0C19.912 4.70107e-05 19.982 0.0834008 19.9668 0.174805L19.6006 2.37305C19.5403 2.73457 19.2278 2.99983 18.8613 3H16.0732C15.9806 2.99991 15.9106 2.91657 15.9258 2.8252L16.292 0.626953C16.3522 0.265451 16.6648 0.000203455 17.0312 0H19.8193Z'
              fill='url(#paint0_linear_6385_13356)'
            />
            <defs>
              <linearGradient
                id='paint0_linear_6385_13356'
                x1='2.69858'
                y1='-8'
                x2='20.7093'
                y2='12.2386'
                gradientUnits='userSpaceOnUse'
              >
                <stop stop-color='#19E0BD' />
                <stop offset='1' stop-color='#0CBF9F' />
              </linearGradient>
            </defs>
          </svg>
          {I18N.components.writing}
        </div>
      </div>

      {isMobile && <ToolbarSeparator />}

      {/* <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup> */}
    </>
  );
};

export const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: 'highlighter' | 'link';
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button data-style='ghost' onClick={onBack}>
        <ArrowLeftIcon className='tiptap-button-icon' />
        {type === 'highlighter' ? (
          <HighlighterIcon className='tiptap-button-icon' />
        ) : (
          <LinkIcon className='tiptap-button-icon' />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === 'highlighter' ? <HighlightContent /> : <LinkContent />}
  </>
);
