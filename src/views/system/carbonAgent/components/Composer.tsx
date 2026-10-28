import { IconAlibabaNew } from '@src/components/iconfont';
import attachmentChipIcon from '@src/assets/images/carbonAgent/icons/attachment-chip.svg';
import quoteContentIcon from '@src/assets/images/carbonAgent/icons/quote-content.svg';
import quoteRemoveIcon from '@src/assets/images/carbonAgent/icons/quote-remove.svg';
import I18N from '@src/lang/I18N';
import { Cascader, Tooltip } from 'antd';
import classNames from 'classnames';
import {
  CSSProperties,
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import BrandPillSelect, {
  type BrandPillKey,
  type BrandPillOption,
} from '@/views/carbonFootprint3/FootprintAccount/component/ProductCarbonFootprintAI/BrandPillSelect';
import {
  ACCOUNT_SELECT_LIFE_CYCLE_LABEL,
  FootprintAccountLifeCycle,
} from '@/views/carbonFootprint3/FootprintAccount/constant';
import {
  QUICK_ACCOUNT_LIFE_CYCLE,
  QUICK_ACCOUNT_LIFE_CYCLE_LABEL,
} from '@/views/carbonFootprint3/constant';

import Icon from './Icon';
import ProjectConversationAttachmentPicker from './ProjectConversationAttachmentPicker';
import {
  AGENT_ATTACHMENT_ACCEPT_EXTENSIONS,
  AGENT_COMPOSER_MESSAGE_MAX_LENGTH,
  ModeKey,
  ModeOption,
  icons,
} from '../constants';
import style from '../index.module.less';
import promptStyles from './Composer.module.less';
import type { AgentComposerAttachment, AgentProjectFile } from '../service';

export type ProductFootprintScopeNode = {
  label: string;
  value: number;
};

export type ProductFootprintComposerOptions = {
  factorScope: string;
  factorScopeOptions: BrandPillOption[];
  factorScopesLoading?: boolean;
  openPill: BrandPillKey | null;
  scope: ProductFootprintScopeNode[][];
  onFactorScopeChange: (value: string) => void;
  onOpenPillChange: (key: BrandPillKey | null) => void;
  onScopeChange: (scope: ProductFootprintScopeNode[][]) => void;
};

type ComposerProps = {
  activeMode: ModeKey;
  attachments?: AgentComposerAttachment[];
  className?: string;
  disabled?: boolean;
  modeOptions: ModeOption[];
  placeholder?: string;
  inputLabel?: string;
  footerHint?: string;
  productFootprintOptions?: ProductFootprintComposerOptions;
  projectId?: string;
  quotes?: string[];
  showModeSelector?: boolean;
  showAttachmentButton?: boolean;
  submitting?: boolean;
  value: string;
  maxLength?: number;
  onChange: (value: string) => void;
  onAttachmentDownload?: (attachment: AgentComposerAttachment) => void;
  onFileRemove?: (fileId: string) => void;
  onFilesSelect?: (files: File[]) => void;
  onModeChange: (mode: ModeKey) => void;
  onProjectFileSelect?: (file: AgentProjectFile) => void;
  onQuoteRemove?: (quoteIndex: number) => void;
  onCancel?: () => void;
  onSubmit: () => void;
};

const COMPOSER_FILE_ACCEPT = AGENT_ATTACHMENT_ACCEPT_EXTENSIONS.map(
  extension => `.${extension}`,
).join(',');
const getModeComposerPlaceholderMap = (): Partial<Record<ModeKey, string>> => ({
  data_analysis: I18N.carbonAgent.composerPlaceholderDefault,
  enterpriseCarbon: I18N.carbonAgent.composerPlaceholderEnterpriseCarbon,
  generate_report: I18N.carbonAgent.composerPlaceholderReport,
  model_update: I18N.carbonAgent.composerPlaceholderUpdate,
  productFootprint: I18N.carbonAgent.composerPlaceholderProduct,
});

const isLongModeChip = (modeKey: ModeKey) =>
  modeKey === 'productFootprint' || modeKey === 'enterpriseCarbon';

const isCbamModeOption = (mode: ModeOption) =>
  mode.quickSkill?.startsWith('cbam2_') ||
  mode.scene?.toLowerCase() === 'cbam2';

const { CUSTOM, FULL, HALF } = FootprintAccountLifeCycle;

const getAttachmentStatusText = (attachment: AgentComposerAttachment) => {
  if (attachment.status === 'uploading') {
    return I18N.carbonAgent.attachmentUploading;
  }

  if (attachment.status === 'error') {
    return I18N.carbonAgent.attachmentUploadError;
  }

  return '';
};

const Composer = ({
  activeMode,
  attachments = [],
  className,
  disabled = false,
  modeOptions,
  placeholder,
  inputLabel,
  footerHint,
  productFootprintOptions,
  projectId,
  quotes = [],
  showModeSelector = true,
  showAttachmentButton = true,
  submitting = false,
  value,
  maxLength = AGENT_COMPOSER_MESSAGE_MAX_LENGTH,
  onChange,
  onAttachmentDownload,
  onFileRemove,
  onFilesSelect,
  onModeChange,
  onProjectFileSelect,
  onQuoteRemove,
  onCancel,
  onSubmit,
}: ComposerProps) => {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isComposingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const compactModeSelectorRef = useRef<HTMLDivElement>(null);
  const modeMoreButtonRef = useRef<HTMLButtonElement>(null);
  const modeMenuRef = useRef<HTMLDivElement>(null);
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const [modeMenuPosition, setModeMenuPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const hasMessage = value.trim().length > 0;
  const hasReadyAttachment = attachments.some(
    attachment => attachment.status === 'done' && attachment.fileId,
  );
  const hasQuote = quotes.some(quote => quote.trim());
  const hasUploadingAttachment = attachments.some(
    attachment => attachment.status === 'uploading',
  );
  const messageLength = value.length;
  const inputPlaceholder =
    placeholder ||
    getModeComposerPlaceholderMap()[activeMode] ||
    I18N.carbonAgent.composerPlaceholderDefault;
  const inputDescriptionId = 'carbon-agent-composer-count';
  const showCharacterCount =
    messageLength >= Math.floor(maxLength * 0.8) || messageLength === maxLength;
  const showProductFootprintOptions =
    activeMode === 'productFootprint' && productFootprintOptions;
  const productFootprintScopeLabel =
    productFootprintOptions?.scope[0]?.[0]?.label;
  const visibleModeOptions = useMemo(() => {
    if (activeMode === 'productFootprint') {
      return modeOptions.filter(
        mode =>
          mode.key !== 'enterpriseCarbon' &&
          mode.key !== 'comingSoon' &&
          !isCbamModeOption(mode),
      );
    }

    if (activeMode === 'enterpriseCarbon') {
      return modeOptions.filter(mode => mode.key !== 'productFootprint');
    }

    return modeOptions;
  }, [activeMode, modeOptions]);
  const activeModeOption = useMemo(
    () => visibleModeOptions.find(mode => mode.key === activeMode),
    [activeMode, visibleModeOptions],
  );
  const compactPrimaryMode =
    activeModeOption ||
    visibleModeOptions.find(mode => !mode.disabled) ||
    visibleModeOptions[0];
  const compactMenuOptions = compactPrimaryMode
    ? visibleModeOptions.filter(mode => mode.key !== compactPrimaryMode.key)
    : visibleModeOptions;
  const leadingModeOptions = showProductFootprintOptions
    ? visibleModeOptions.filter(mode => mode.key === 'productFootprint')
    : visibleModeOptions;
  const trailingModeOptions = showProductFootprintOptions
    ? visibleModeOptions.filter(mode => mode.key !== 'productFootprint')
    : [];
  const canSubmit =
    (hasMessage || hasReadyAttachment || hasQuote) &&
    !disabled &&
    !submitting &&
    !hasUploadingAttachment;
  const canCancel = submitting && !disabled && Boolean(onCancel);
  let submitLabel = I18N.carbonAgent.submitEnterContent;

  if (submitting) {
    submitLabel = I18N.carbonAgent.cancel;
  } else if (hasUploadingAttachment) {
    submitLabel = I18N.carbonAgent.submitWaitUpload;
  } else if (hasMessage || hasReadyAttachment || hasQuote) {
    submitLabel = I18N.carbonAgent.send;
  }

  const productFootprintOptionControls = showProductFootprintOptions ? (
    <div className={style.productFootprintOptionList}>
      <Cascader
        value={productFootprintOptions.scope.map(item =>
          item.map(i => i.value),
        )}
        maxTagCount='responsive'
        multiple
        variant='borderless'
        disabled={disabled || submitting}
        options={[
          {
            value: HALF,
            label: ACCOUNT_SELECT_LIFE_CYCLE_LABEL[HALF],
          },
          {
            value: FULL,
            label: ACCOUNT_SELECT_LIFE_CYCLE_LABEL[FULL],
          },
          {
            value: CUSTOM,
            label: ACCOUNT_SELECT_LIFE_CYCLE_LABEL[CUSTOM],
            children: Object.values(QUICK_ACCOUNT_LIFE_CYCLE).map(
              scopeValue => ({
                value: scopeValue,
                label: QUICK_ACCOUNT_LIFE_CYCLE_LABEL()[scopeValue],
              }),
            ),
          },
        ]}
        onChange={(_, opt) => {
          productFootprintOptions.onScopeChange(
            opt as unknown as ProductFootprintScopeNode[][],
          );
        }}
      >
        <div
          className={classNames(style.dropdownContent, {
            [style.dropdownContentDisabled]: disabled || submitting,
          })}
        >
          {productFootprintScopeLabel ? (
            <span>{productFootprintScopeLabel}</span>
          ) : (
            <span className={style.placeholder}>
              {I18N.carbonFootprint3.lifeCycle}
            </span>
          )}
          <IconAlibabaNew
            className={style.dropdownIcon}
            type='icon-chevron-down'
          />
        </div>
      </Cascader>
      <BrandPillSelect
        pillKey='factor'
        openPill={productFootprintOptions.openPill}
        setOpenPill={productFootprintOptions.onOpenPillChange}
        value={productFootprintOptions.factorScope}
        onChange={productFootprintOptions.onFactorScopeChange}
        options={productFootprintOptions.factorScopeOptions}
        allowEmpty
        placeholder={I18N.productCarbonFootprintAI.factorPreferencePlaceholder}
        disabled={
          disabled ||
          submitting ||
          Boolean(productFootprintOptions.factorScopesLoading)
        }
        aria-label={I18N.productCarbonFootprintAI.factorPreferencePlaceholder}
        triggerClassName={style.pillTriggerFactor}
        placement='top'
      />
    </div>
  ) : null;

  const renderModeChip = (mode: ModeOption) => {
    const modeActive = activeMode === mode.key;

    return (
      <button
        className={classNames(style.modeChip, {
          [style.activeModeChip]: modeActive,
          [style.productFootprintModeChip]: isLongModeChip(mode.key),
        })}
        key={mode.key}
        type='button'
        aria-label={
          modeActive
            ? I18N.template(I18N.carbonAgent.deselectMode, {
                val1: mode.label,
              })
            : mode.label
        }
        aria-pressed={modeActive}
        disabled={mode.disabled}
        onClick={() => onModeChange(mode.key)}
      >
        <span className={style.modeChipLabel}>{mode.label}</span>
        {modeActive ? (
          <span className={style.modeChipCloseIcon} aria-hidden='true' />
        ) : null}
      </button>
    );
  };

  const modeMoreMenuStyle: CSSProperties | undefined = modeMenuPosition
    ? {
        left: modeMenuPosition.left,
        top: modeMenuPosition.top,
      }
    : undefined;
  const modeMoreMenuContent =
    modeMenuOpen && modeMenuPosition && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={modeMenuRef}
            className={classNames(style.modeMoreMenu, style.modeMoreMenuPortal)}
            role='menu'
            style={modeMoreMenuStyle}
          >
            {compactMenuOptions.map(mode => (
              <button
                className={style.modeMoreMenuItem}
                key={mode.key}
                type='button'
                role='menuitem'
                disabled={mode.disabled}
                onClick={() => {
                  onModeChange(mode.key);
                  setModeMenuOpen(false);
                }}
              >
                {mode.label}
              </button>
            ))}
          </div>,
          document.body,
        )
      : null;

  const compactMoreMenu = compactMenuOptions.length ? (
    <div className={style.modeMoreWrap}>
      <button
        ref={modeMoreButtonRef}
        className={style.modeMoreButton}
        type='button'
        aria-label={I18N.carbonAgent.moreCapabilities}
        aria-haspopup='menu'
        aria-expanded={modeMenuOpen}
        disabled={disabled || submitting}
        onClick={() => setModeMenuOpen(open => !open)}
      >
        <span aria-hidden='true'>...</span>
      </button>
      {modeMoreMenuContent}
    </div>
  ) : null;

  useEffect(() => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    input.style.height = 'auto';
    const nextHeight = Math.min(input.scrollHeight, 132);
    input.style.height = `${nextHeight}px`;
    input.style.overflowY = input.scrollHeight > nextHeight ? 'auto' : 'hidden';
  }, [value]);

  useEffect(() => {
    if (!modeMenuOpen) {
      setModeMenuPosition(null);
      return undefined;
    }

    const updateModeMenuPosition = () => {
      const button = modeMoreButtonRef.current;

      if (!button) {
        return;
      }

      const rect = button.getBoundingClientRect();

      setModeMenuPosition({
        left: rect.left + rect.width / 2,
        top: rect.top - 8,
      });
    };
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const { target } = event;

      if (
        target instanceof Node &&
        (compactModeSelectorRef.current?.contains(target) ||
          modeMenuRef.current?.contains(target) ||
          modeMoreButtonRef.current?.contains(target))
      ) {
        return;
      }

      setModeMenuOpen(false);
    };
    const handleKeyDownEvent = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setModeMenuOpen(false);
      }
    };

    updateModeMenuPosition();
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDownEvent);
    window.addEventListener('resize', updateModeMenuPosition);
    window.addEventListener('scroll', updateModeMenuPosition, true);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDownEvent);
      window.removeEventListener('resize', updateModeMenuPosition);
      window.removeEventListener('scroll', updateModeMenuPosition, true);
    };
  }, [modeMenuOpen]);

  useEffect(() => {
    setModeMenuOpen(false);
  }, [activeMode, disabled, submitting]);

  const submitCurrentMessage = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit();
  };

  const handleSendButtonClick = () => {
    if (submitting) {
      onCancel?.();
      return;
    }

    submitCurrentMessage();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const input = event.currentTarget;

    if (files.length) {
      onFilesSelect?.(files);
    }

    input.value = '';
  };

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value.slice(0, maxLength));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      isComposingRef.current ||
      event.nativeEvent.isComposing ||
      // Safari may report isComposing=false for the Enter key that confirms IME input.
      event.nativeEvent.keyCode === 229
    ) {
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      submitCurrentMessage();
    }
  };

  return (
    <form
      className={classNames(style.composer, className, {
        [style.composerDisabled]: disabled,
        [style.composerReady]: canSubmit,
        [style.composerSending]: submitting,
        [style.composerWithContent]:
          hasMessage || hasQuote || attachments.length > 0,
      })}
      aria-busy={submitting}
      onSubmit={event => {
        event.preventDefault();
        submitCurrentMessage();
      }}
    >
      {inputLabel ? (
        <label className={promptStyles.label} htmlFor={inputId}>
          {inputLabel}
        </label>
      ) : null}
      {hasQuote ? (
        <div
          className={style.composerReferenceList}
          aria-label={I18N.carbonAgent.referenceListLabel}
        >
          {quotes.map((quote, index) => (
            <Tooltip
              key={quote}
              title={quote}
              placement='top'
              mouseEnterDelay={0.25}
            >
              <div className={style.composerQuote}>
                <span className={style.composerQuoteMain}>
                  <img
                    className={style.composerQuoteIcon}
                    src={quoteContentIcon}
                    alt=''
                  />
                  <span className={style.composerQuoteText}>
                    {I18N.template(I18N.carbonAgent.referenceContentTitle, {
                      val1: index + 1,
                    })}
                  </span>
                </span>
                <button
                  className={style.composerQuoteRemove}
                  type='button'
                  aria-label={I18N.template(I18N.carbonAgent.removeReference, {
                    val1: index + 1,
                  })}
                  onClick={() => onQuoteRemove?.(index)}
                >
                  <img src={quoteRemoveIcon} alt='' />
                </button>
              </div>
            </Tooltip>
          ))}
        </div>
      ) : null}
      {attachments.length ? (
        <div
          className={style.composerAttachmentList}
          aria-label={I18N.carbonAgent.uploadedAttachments}
        >
          {attachments.map((attachment, index) => {
            const statusText = getAttachmentStatusText(attachment);
            const attachmentTitle = statusText
              ? I18N.template(I18N.carbonAgent.attachmentTitleWithStatus, {
                  val1: attachment.name,
                  val2: statusText,
                })
              : attachment.name;
            const canDownload =
              attachment.status === 'done' &&
              Boolean(attachment.fileId || attachment.url);
            const attachmentMainContent = (
              <>
                <img
                  className={style.composerAttachmentIcon}
                  src={attachmentChipIcon}
                  alt=''
                />
                <span className={style.composerAttachmentName}>
                  {I18N.template(I18N.carbonAgent.attachmentN, {
                    val1: index + 1,
                  })}
                </span>
              </>
            );

            return (
              <Tooltip
                key={attachment.id}
                title={attachmentTitle}
                placement='top'
                mouseEnterDelay={0.25}
              >
                <div
                  className={classNames(style.composerAttachment, {
                    [style.composerAttachmentError]:
                      attachment.status === 'error',
                  })}
                >
                  {canDownload ? (
                    <button
                      className={classNames(
                        style.composerAttachmentMain,
                        style.composerAttachmentMainDownload,
                      )}
                      type='button'
                      aria-label={I18N.template(
                        I18N.carbonAgent.downloadAttachment,
                        { val1: index + 1 },
                      )}
                      onClick={() => onAttachmentDownload?.(attachment)}
                    >
                      {attachmentMainContent}
                    </button>
                  ) : (
                    <span className={style.composerAttachmentMain}>
                      {attachmentMainContent}
                    </span>
                  )}
                  <button
                    className={style.composerAttachmentRemove}
                    type='button'
                    aria-label={I18N.template(
                      I18N.carbonAgent.removeAttachment,
                      { val1: index + 1 },
                    )}
                    onClick={() => onFileRemove?.(attachment.id)}
                  >
                    <img src={quoteRemoveIcon} alt='' />
                  </button>
                </div>
              </Tooltip>
            );
          })}
        </div>
      ) : null}
      <textarea
        ref={inputRef}
        id={inputLabel ? inputId : undefined}
        className={style.input}
        data-agent-login-entry='composer_input'
        value={value}
        placeholder={inputPlaceholder}
        aria-label={inputLabel || inputPlaceholder}
        autoComplete='off'
        name='carbonAgentMessage'
        rows={1}
        disabled={disabled}
        maxLength={maxLength}
        aria-describedby={
          [
            footerHint ? hintId : undefined,
            showCharacterCount ? inputDescriptionId : undefined,
          ]
            .filter(Boolean)
            .join(' ') || undefined
        }
        onChange={handleInputChange}
        onCompositionEnd={() => {
          isComposingRef.current = false;
        }}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onKeyDown={handleKeyDown}
      />
      <div
        className={classNames(style.composerFooter, {
          [style.composerFooterProductFootprint]: showProductFootprintOptions,
          [promptStyles.withHint]: Boolean(footerHint),
        })}
      >
        {footerHint ? (
          <span className={promptStyles.hint} id={hintId}>
            {footerHint}
          </span>
        ) : null}
        {showAttachmentButton ? (
          <>
            <input
              ref={fileInputRef}
              type='file'
              multiple
              accept={COMPOSER_FILE_ACCEPT}
              aria-hidden='true'
              hidden
              tabIndex={-1}
              onChange={handleFileChange}
            />
            {projectId && onProjectFileSelect ? (
              <ProjectConversationAttachmentPicker
                className={style.addButton}
                disabled={disabled || submitting}
                iconClassName={style.addIcon}
                projectId={projectId}
                onLocalFilesSelect={() => fileInputRef.current?.click()}
                onProjectFileSelect={onProjectFileSelect}
              />
            ) : (
              <button
                className={style.addButton}
                type='button'
                data-agent-login-entry='file_upload'
                aria-label={I18N.carbonAgent.addAttachment}
                disabled={disabled || submitting}
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon className={style.addIcon} src={icons.addIcon} />
              </button>
            )}
          </>
        ) : null}
        {showModeSelector ? (
          <>
            <div className={style.divider} />
            <div
              className={classNames(style.composerModeControls, {
                [style.composerModeControlsProductFootprint]:
                  showProductFootprintOptions,
              })}
            >
              <div className={style.composerModeScrollContent}>
                <div
                  className={classNames(
                    style.modeChipList,
                    style.modeChipListExpanded,
                  )}
                >
                  {leadingModeOptions.map(renderModeChip)}
                </div>
                <div
                  className={classNames(
                    style.modeChipList,
                    style.modeChipListCompact,
                  )}
                  ref={compactModeSelectorRef}
                >
                  {compactPrimaryMode
                    ? renderModeChip(compactPrimaryMode)
                    : null}
                  {showProductFootprintOptions ? null : compactMoreMenu}
                </div>
                {productFootprintOptionControls}
                {trailingModeOptions.length ? (
                  <div
                    className={classNames(
                      style.modeChipList,
                      style.modeChipListExpanded,
                    )}
                  >
                    {trailingModeOptions.map(renderModeChip)}
                  </div>
                ) : null}
                {showProductFootprintOptions && compactMoreMenu ? (
                  <div
                    className={classNames(
                      style.modeChipList,
                      style.modeChipListCompact,
                    )}
                  >
                    {compactMoreMenu}
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          !footerHint && <span className={style.projectComposerFooterSpacer} />
        )}
        {showCharacterCount ? (
          <span
            className={classNames(style.composerCount, {
              [style.composerCountLimit]: messageLength >= maxLength,
            })}
            id={inputDescriptionId}
          >
            {messageLength}/{maxLength}
          </span>
        ) : null}
        <button
          className={classNames(style.sendButton, {
            [style.sendButtonActive]: canSubmit,
            [style.sendButtonLoading]: submitting,
          })}
          type='button'
          data-agent-login-entry='send'
          aria-busy={submitting}
          aria-label={submitLabel}
          title={submitLabel}
          disabled={submitting ? !canCancel : !canSubmit}
          onClick={handleSendButtonClick}
        >
          {submitting ? (
            <span className={style.sendLoadingIcon} aria-hidden='true' />
          ) : (
            <Icon className={style.sendIcon} src={icons.sendDisabledIcon} />
          )}
        </button>
      </div>
      <span className={style.srOnly} aria-live='polite'>
        {submitting ? I18N.carbonAgent.generatingAnswerWait : ''}
      </span>
    </form>
  );
};

export default Composer;
