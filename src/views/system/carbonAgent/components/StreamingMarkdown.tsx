import {
  CloseOutlined,
  CopyOutlined,
  DownloadOutlined,
  FullscreenOutlined,
  MinusOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { message as antdMessage } from 'antd';
import saveAs from 'file-saver';
import type { MermaidConfig } from 'mermaid';
import {
  isValidElement,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Streamdown, useIsCodeFenceIncomplete } from 'streamdown';
import type { Components } from 'streamdown';
import 'streamdown/styles.css';

import style from '../index.module.less';
import {
  factorTargetFromHref,
  type CcdbFactorPreviewTarget,
} from '../ccdbFactor';
import {
  fetchAgentArtifactDownloadUrl,
  fetchAgentWorkspaceFileDownloadUrl,
} from '../service';
import I18N from '@src/lang/I18N';
import {
  linkifyCcdbFactorNames,
  type CcdbFactorCitation,
} from './ccdbFactorMarkdown';
import { normalizeFlattenedMarkdownTables } from './markdownNormalizer';

type StreamingMarkdownProps = {
  onFactorOpen?: (target: CcdbFactorPreviewTarget) => void;
  content?: string | null;
  factorCitations?: CcdbFactorCitation[];
  sessionId?: string;
  shareId?: string;
  streaming?: boolean;
};

type NormalizeMarkdownContentOptions = {
  linkifyFileDownloadIds?: boolean;
};

const getStreamdownTranslations = () => ({
  close: I18N.carbonAgent.mdClose,
  copied: I18N.carbonAgent.copied,
  copyCode: I18N.carbonAgent.mdCopyCode,
  copyLink: I18N.carbonAgent.mdCopyLink,
  copyTable: I18N.carbonAgent.mdCopyTable,
  copyTableAsCsv: I18N.carbonAgent.mdCopyTableAsCsv,
  copyTableAsMarkdown: I18N.carbonAgent.mdCopyTableAsMarkdown,
  copyTableAsTsv: I18N.carbonAgent.mdCopyTableAsTsv,
  downloadDiagram: I18N.carbonAgent.mdDownloadDiagram,
  downloadDiagramAsMmd: I18N.carbonAgent.mdDownloadDiagramAsMmd,
  downloadDiagramAsPng: I18N.carbonAgent.mdDownloadDiagramAsPng,
  downloadDiagramAsSvg: I18N.carbonAgent.mdDownloadDiagramAsSvg,
  downloadFile: I18N.carbonAgent.mdDownloadFile,
  downloadImage: I18N.carbonAgent.mdDownloadImage,
  downloadTable: I18N.carbonAgent.mdDownloadTable,
  downloadTableAsCsv: I18N.carbonAgent.mdDownloadTableAsCsv,
  downloadTableAsMarkdown: I18N.carbonAgent.mdDownloadTableAsMarkdown,
  exitFullscreen: I18N.carbonAgent.exitFullscreen,
  externalLinkWarning: I18N.carbonAgent.mdExternalLinkWarning,
  imageNotAvailable: I18N.carbonAgent.mdImageNotAvailable,
  mermaidFormatMmd: 'MMD',
  mermaidFormatPng: 'PNG',
  mermaidFormatSvg: 'SVG',
  openExternalLink: I18N.carbonAgent.mdOpenExternalLink,
  openLink: I18N.carbonAgent.mdOpenLink,
  tableFormatCsv: 'CSV',
  tableFormatMarkdown: 'Markdown',
  tableFormatTsv: 'TSV',
  viewFullscreen: I18N.carbonAgent.mdViewFullscreen,
});

const mermaidConfig: MermaidConfig = {
  flowchart: {
    htmlLabels: false,
    useMaxWidth: false,
  },
  securityLevel: 'strict',
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    background: '#ffffff',
    edgeLabelBackground: '#ffffff',
    fontFamily: 'PingFang SC, Microsoft YaHei, Arial, sans-serif',
    lineColor: '#6c757d',
    mainBkg: '#f7f8f9',
    nodeBorder: '#cfd8dc',
    primaryBorderColor: '#0d8f61',
    primaryColor: '#e7fff0',
    primaryTextColor: '#04252b',
    secondaryBorderColor: '#b8c2cc',
    secondaryColor: '#ffffff',
    tertiaryColor: '#f4f7f8',
    textColor: '#04252b',
  },
};

const ARTIFACT_ID_PATTERN =
  /(^|[^\w/=?&#%-])(?:[`"'“”‘’]?artifact_id[`"'“”‘’]?\s*[:：]\s*)?[`"'“”‘’]?(artifact_[A-Za-z0-9_-]+)[`"'“”‘’]?/gi;

const FILE_DOWNLOAD_ID_PATTERN =
  /(^|[^\w/=?&#%-])(?:[`"'“”‘’]?(?:article_id|articleId|file_id|fileId)[`"'“”‘’]?\s*[:：=]\s*)[`"'“”‘’]?(file_[A-Za-z0-9_-]+)[`"'“”‘’]?/gi;

const ARTIFACT_ID_VALUE_PATTERN = /^artifact_[A-Za-z0-9_-]+$/;
const FILE_ID_VALUE_PATTERN = /^file_[A-Za-z0-9_-]+$/;

const ARTIFACT_ID_FIELD_NAME = 'artifact_id';
const FILE_ID_FIELD_NAMES = new Set([
  'article_id',
  'articleId',
  'file_id',
  'fileId',
]);

const isArtifactIdValue = (artifactId: string) =>
  artifactId !== ARTIFACT_ID_FIELD_NAME &&
  ARTIFACT_ID_VALUE_PATTERN.test(artifactId);

const isFileIdValue = (fileId: string) =>
  !FILE_ID_FIELD_NAMES.has(fileId) && FILE_ID_VALUE_PATTERN.test(fileId);

type DownloadLinkTarget = {
  id: string;
  type: 'artifact' | 'file';
};

const IOS_DEVICE_PATTERN = /iP(ad|hone|od)/i;
const FENCED_CODE_PATTERN = /^\s*(```|~~~)/;

const MERMAID_RENDER_PADDING = 48;
const MERMAID_MIN_ZOOM = 0.5;
const MERMAID_MAX_ZOOM = 3;
const MERMAID_ZOOM_STEP = 0.2;
const LANGUAGE_CLASS_PATTERN = /language-([^\s]+)/;

const getDownloadTargetFromHref = (
  href: string,
): DownloadLinkTarget | undefined => {
  let hash = '';

  if (href.startsWith('/#')) {
    hash = href.slice(2);
  } else if (href.startsWith('#')) {
    hash = href.slice(1);
  }

  if (!hash) {
    return undefined;
  }

  try {
    const id = decodeURIComponent(hash);

    if (isArtifactIdValue(id)) {
      return { id, type: 'artifact' };
    }

    if (isFileIdValue(id)) {
      return { id, type: 'file' };
    }

    return undefined;
  } catch {
    return undefined;
  }
};

const triggerArtifactDownload = ({
  downloadWindow,
  filename,
  url,
}: {
  downloadWindow?: Window | null;
  filename?: string;
  url: string;
}) => {
  if (downloadWindow && !downloadWindow.closed) {
    downloadWindow.location.href = url;
    return;
  }

  if (typeof window !== 'undefined' && isIOSLikeBrowser()) {
    window.location.href = url;
    return;
  }

  saveAs(url, filename);
};

const isIOSLikeBrowser = () => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return (
    IOS_DEVICE_PATTERN.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

const prepareIOSDownloadWindow = () => {
  if (typeof window === 'undefined' || !isIOSLikeBrowser()) {
    return undefined;
  }

  const downloadWindow = window.open('', '_blank');

  if (!downloadWindow) {
    return undefined;
  }

  const { document: downloadDocument } = downloadWindow;
  const messageNode = downloadDocument.createElement('p');

  downloadDocument.title = I18N.carbonAgent.mdDownloadFile;
  downloadDocument.body.style.margin = '24px';
  downloadDocument.body.style.fontFamily =
    'PingFang SC, Microsoft YaHei, Arial, sans-serif';
  messageNode.textContent = I18N.carbonAgent.fetchingDownloadLink;
  downloadDocument.body.appendChild(messageNode);

  return downloadWindow;
};

const closePreparedDownloadWindow = (downloadWindow?: Window | null) => {
  if (downloadWindow && !downloadWindow.closed) {
    downloadWindow.close();
  }
};

const handleDownloadLinkClick = (
  event: MouseEvent<HTMLAnchorElement>,
  target: DownloadLinkTarget,
  {
    sessionId,
    shareId,
  }: {
    sessionId?: string;
    shareId?: string;
  },
) => {
  event.preventDefault();

  const preparedDownloadWindow = prepareIOSDownloadWindow();
  const hideLoading = antdMessage.loading(
    I18N.carbonAgent.fetchingDownloadLink,
    0,
  );

  const fetchDownloadFile =
    shareId || target.type === 'file'
      ? fetchAgentWorkspaceFileDownloadUrl({
          fileId: target.id,
          sessionId,
          shareId,
        })
      : fetchAgentArtifactDownloadUrl(target.id);

  fetchDownloadFile
    .then(fileData => {
      const { downloadUrl } = fileData;
      const filename =
        fileData.filename || ('name' in fileData ? fileData.name : undefined);

      if (!downloadUrl) {
        throw new Error(I18N.carbonAgent.emptyDownloadLink);
      }

      triggerArtifactDownload({
        downloadWindow: preparedDownloadWindow,
        filename,
        url: downloadUrl,
      });
    })
    .catch(error => {
      closePreparedDownloadWindow(preparedDownloadWindow);

      const errorMessage =
        error instanceof Error
          ? error.message
          : I18N.carbonAgent.fileDownloadFailedRetry;

      antdMessage.error(errorMessage);
    })
    .finally(() => {
      hideLoading();
    });
};

const getReactText = (children: ReactNode): string => {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(getReactText).join('');
  }

  if (
    isValidElement<{ children?: ReactNode }>(children) &&
    children.props.children
  ) {
    return getReactText(children.props.children);
  }

  return '';
};

const getSvgDimension = (value: string | null) => {
  if (!value) {
    return undefined;
  }

  const dimension = Number.parseFloat(value.replace('px', ''));

  return Number.isFinite(dimension) && dimension > 0 ? dimension : undefined;
};

const getSvgViewBoxSize = (viewBox: string | null) => {
  if (!viewBox) {
    return undefined;
  }

  const values = viewBox
    .trim()
    .split(/\s+/)
    .map(value => Number.parseFloat(value));

  if (
    values.length !== 4 ||
    values.some(value => !Number.isFinite(value)) ||
    values[2] <= 0 ||
    values[3] <= 0
  ) {
    return undefined;
  }

  return {
    height: values[3],
    width: values[2],
  };
};

const clampMermaidZoom = (zoom: number) =>
  Math.min(Math.max(zoom, MERMAID_MIN_ZOOM), MERMAID_MAX_ZOOM);

const formatMermaidZoom = (zoom: number) => `${Math.round(zoom * 100)}%`;

const normalizeMermaidSvg = (
  svg: string,
  containerWidth: number,
  zoom: number,
) => {
  const documentSvg = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const svgElement = documentSvg.querySelector('svg');

  if (!svgElement) {
    return svg;
  }

  const viewBoxSize = getSvgViewBoxSize(svgElement.getAttribute('viewBox'));
  const naturalWidth =
    viewBoxSize?.width ||
    getSvgDimension(svgElement.getAttribute('width')) ||
    640;
  const naturalHeight =
    viewBoxSize?.height ||
    getSvgDimension(svgElement.getAttribute('height')) ||
    360;
  const availableWidth = Math.max(containerWidth - MERMAID_RENDER_PADDING, 320);
  const baseWidth = containerWidth > 0 ? availableWidth : naturalWidth;
  const displayWidth = Math.ceil(baseWidth * clampMermaidZoom(zoom));
  const displayHeight = Math.ceil(
    naturalHeight * (displayWidth / naturalWidth),
  );

  if (!viewBoxSize) {
    svgElement.setAttribute('viewBox', `0 0 ${naturalWidth} ${naturalHeight}`);
  }

  svgElement.removeAttribute('style');
  svgElement.setAttribute('width', String(displayWidth));
  svgElement.setAttribute('height', String(displayHeight));
  svgElement.setAttribute('overflow', 'visible');
  svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  return new XMLSerializer().serializeToString(svgElement);
};

type MermaidViewportProps = {
  chart: string;
  error: string;
  rawSvg: string;
  zoom: number;
  className?: string;
  onRetry: () => void;
  onZoomChange: (zoomUpdater: (zoom: number) => number) => void;
};

const getTouchDistance = (touches: TouchList) => {
  if (touches.length < 2) {
    return undefined;
  }

  const firstTouch = touches[0];
  const secondTouch = touches[1];
  const distanceX = firstTouch.clientX - secondTouch.clientX;
  const distanceY = firstTouch.clientY - secondTouch.clientY;

  return Math.hypot(distanceX, distanceY);
};

const MermaidViewport = ({
  chart,
  className,
  error,
  rawSvg,
  zoom,
  onRetry,
  onZoomChange,
}: MermaidViewportProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pinchDistanceRef = useRef<number | undefined>(undefined);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return undefined;
    }

    const updateWidth = (nextWidth: number) => {
      setContainerWidth(prevWidth => {
        const roundedWidth = Math.round(nextWidth);

        return Math.abs(prevWidth - roundedWidth) > 2
          ? roundedWidth
          : prevWidth;
      });
    };
    const measureWidth = () => {
      updateWidth(
        viewport.clientWidth || viewport.getBoundingClientRect().width,
      );
    };

    measureWidth();

    if (typeof ResizeObserver === 'undefined') {
      const handleResize = () => measureWidth();

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }

    const resizeObserver = new ResizeObserver(() => measureWidth());

    resizeObserver.observe(viewport);

    return () => resizeObserver.disconnect();
  }, []);

  const svgMarkup = useMemo(() => {
    if (!rawSvg) {
      return '';
    }

    return normalizeMermaidSvg(rawSvg, containerWidth, zoom);
  }, [containerWidth, rawSvg, zoom]);

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (!event.ctrlKey) {
        return;
      }

      event.preventDefault();
      onZoomChange(prevZoom =>
        clampMermaidZoom(prevZoom - event.deltaY * 0.002),
      );
    },
    [onZoomChange],
  );

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touchDistance = getTouchDistance(event.touches);

    if (touchDistance) {
      event.preventDefault();
    }

    pinchDistanceRef.current = touchDistance;
  }, []);

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      const nextDistance = getTouchDistance(event.touches);
      const previousDistance = pinchDistanceRef.current;

      if (!nextDistance || !previousDistance) {
        pinchDistanceRef.current = nextDistance;
        return;
      }

      event.preventDefault();
      onZoomChange(prevZoom =>
        clampMermaidZoom(prevZoom * (nextDistance / previousDistance)),
      );
      pinchDistanceRef.current = nextDistance;
    },
    [onZoomChange],
  );

  const handleTouchEnd = useCallback(() => {
    pinchDistanceRef.current = undefined;
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return undefined;
    }

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    viewport.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });
    viewport.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });
    viewport.addEventListener('touchend', handleTouchEnd);
    viewport.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      viewport.removeEventListener('wheel', handleWheel);
      viewport.removeEventListener('touchstart', handleTouchStart);
      viewport.removeEventListener('touchmove', handleTouchMove);
      viewport.removeEventListener('touchend', handleTouchEnd);
      viewport.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchEnd, handleTouchMove, handleTouchStart, handleWheel]);

  let mermaidContent = (
    <div className={style.mermaidLoading}>
      {I18N.carbonAgent.renderingDiagram}
    </div>
  );

  if (error) {
    mermaidContent = (
      <div className={style.mermaidError}>
        <div className={style.mermaidErrorHeader}>
          {I18N.carbonAgent.mermaidRenderFailed}
          <button
            className={style.mermaidRetryButton}
            type='button'
            onClick={onRetry}
          >
            {I18N.carbonAgent.retry}
          </button>
        </div>
        <div className={style.mermaidErrorMessage}>{error}</div>
        <pre className={style.mermaidErrorCode}>{chart}</pre>
      </div>
    );
  } else if (svgMarkup) {
    mermaidContent = (
      <div
        className={style.mermaidSvg}
        // Mermaid returns sanitized SVG under strict security mode.
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
    );
  }

  return (
    <div
      className={[style.mermaidCanvas, className].filter(Boolean).join(' ')}
      ref={viewportRef}
    >
      {mermaidContent}
    </div>
  );
};

const ResponsiveMermaid = ({ chart }: { chart: string }) => {
  const [rawSvg, setRawSvg] = useState('');
  const [error, setError] = useState('');
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    let cancelled = false;
    const trimmedChart = chart.trim();

    if (!trimmedChart) {
      setRawSvg('');
      setError('');
      return undefined;
    }

    import('mermaid')
      .then(async mermaidModule => {
        const mermaid = mermaidModule.default;
        const chartHash = trimmedChart
          .split('')
          .reduce(
            (sum, char, index) =>
              (sum + char.charCodeAt(0) * (index + 1)) % 1000000007,
            0,
          );
        const renderId = `carbon-agent-mermaid-${chartHash}-${Date.now()}`;

        mermaid.initialize(mermaidConfig);
        const { svg } = await mermaid.render(renderId, trimmedChart);

        if (cancelled) {
          return;
        }

        setRawSvg(svg);
        setError('');
      })
      .catch((renderError: unknown) => {
        if (cancelled) {
          return;
        }

        setRawSvg('');
        setError(
          renderError instanceof Error
            ? renderError.message
            : I18N.carbonAgent.mermaidRenderFailed,
        );
      });

    return () => {
      cancelled = true;
    };
  }, [chart, retryKey]);

  useEffect(() => {
    if (!fullscreenOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFullscreenOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fullscreenOpen]);

  const downloadSvgMarkup = useMemo(() => {
    if (!rawSvg) {
      return '';
    }

    return normalizeMermaidSvg(rawSvg, 960, 1);
  }, [rawSvg]);

  const handleCopy = useCallback(() => {
    navigator.clipboard
      ?.writeText(chart)
      .then(() => antdMessage.success(I18N.carbonAgent.copiedMermaidSource))
      .catch(() => antdMessage.error(I18N.carbonAgent.copyFailed));
  }, [chart]);

  const handleDownload = useCallback(() => {
    if (!downloadSvgMarkup) {
      return;
    }

    saveAs(
      new Blob([downloadSvgMarkup], { type: 'image/svg+xml;charset=utf-8' }),
      'mermaid.svg',
    );
  }, [downloadSvgMarkup]);

  const handleFullscreen = useCallback(() => {
    setFullscreenOpen(true);
  }, []);

  const handleCloseFullscreen = useCallback(() => {
    setFullscreenOpen(false);
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prevZoom => clampMermaidZoom(prevZoom - MERMAID_ZOOM_STEP));
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(prevZoom => clampMermaidZoom(prevZoom + MERMAID_ZOOM_STEP));
  }, []);

  const handleZoomChange = useCallback(
    (zoomUpdater: (zoom: number) => number) => {
      setZoom(prevZoom => clampMermaidZoom(zoomUpdater(prevZoom)));
    },
    [],
  );

  const handleResetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  const handleRetry = useCallback(() => {
    setRetryKey(prevKey => prevKey + 1);
  }, []);

  const handleModalBackdropMouseDown = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.currentTarget === event.target) {
        handleCloseFullscreen();
      }
    },
    [handleCloseFullscreen],
  );

  const renderHeader = (withCloseButton = false) => (
    <div className={style.mermaidPanelHeader}>
      <span className={style.mermaidPanelTitle}>Mermaid</span>
      <div className={style.mermaidPanelActions}>
        <button
          type='button'
          title={I18N.carbonAgent.zoomOut}
          onClick={handleZoomOut}
          disabled={zoom <= MERMAID_MIN_ZOOM}
        >
          <MinusOutlined />
        </button>
        <button
          className={style.mermaidZoomValue}
          type='button'
          title={I18N.carbonAgent.resetZoom}
          onClick={handleResetZoom}
        >
          {formatMermaidZoom(zoom)}
        </button>
        <button
          type='button'
          title={I18N.carbonAgent.zoomIn}
          onClick={handleZoomIn}
          disabled={zoom >= MERMAID_MAX_ZOOM}
        >
          <PlusOutlined />
        </button>
        <button
          type='button'
          title={I18N.carbonAgent.fitWidth}
          onClick={handleResetZoom}
        >
          <ReloadOutlined />
        </button>
        <button
          type='button'
          title={I18N.carbonAgent.mdDownloadDiagramAsSvg}
          onClick={handleDownload}
          disabled={!downloadSvgMarkup}
        >
          <DownloadOutlined />
        </button>
        <button
          type='button'
          title={I18N.carbonAgent.copySource}
          onClick={handleCopy}
        >
          <CopyOutlined />
        </button>
        {withCloseButton ? (
          <button
            type='button'
            title={I18N.carbonAgent.mdClose}
            onClick={handleCloseFullscreen}
          >
            <CloseOutlined />
          </button>
        ) : (
          <button
            type='button'
            title={I18N.carbonAgent.mdViewFullscreen}
            onClick={handleFullscreen}
          >
            <FullscreenOutlined />
          </button>
        )}
      </div>
    </div>
  );

  const fullscreenModal: ReactNode =
    fullscreenOpen && typeof document !== 'undefined'
      ? (createPortal(
          <div
            className={style.mermaidModal}
            role='presentation'
            onMouseDown={handleModalBackdropMouseDown}
          >
            <div
              className={style.mermaidModalPanel}
              role='dialog'
              aria-modal='true'
              aria-label={I18N.carbonAgent.mermaidFullscreenPreview}
            >
              {renderHeader(true)}
              <MermaidViewport
                chart={chart}
                className={style.mermaidModalCanvas}
                error={error}
                rawSvg={rawSvg}
                zoom={zoom}
                onRetry={handleRetry}
                onZoomChange={handleZoomChange}
              />
            </div>
          </div>,
          document.body,
        ) as unknown as ReactNode)
      : null;

  return (
    <div className={style.mermaidPanel}>
      {renderHeader()}
      <MermaidViewport
        chart={chart}
        error={error}
        rawSvg={rawSvg}
        zoom={zoom}
        onRetry={handleRetry}
        onZoomChange={handleZoomChange}
      />
      {fullscreenModal}
    </div>
  );
};

const MarkdownCode: NonNullable<Components['code']> = ({
  children,
  className,
  node: _node,
  ...props
}) => {
  const isIncomplete = useIsCodeFenceIncomplete();
  const language = className?.match(LANGUAGE_CLASS_PATTERN)?.[1] || '';
  const code = getReactText(children);
  const isBlock = Object.prototype.hasOwnProperty.call(props, 'data-block');

  if (isBlock && language === 'mermaid' && !isIncomplete) {
    return <ResponsiveMermaid chart={code} />;
  }

  if (isBlock) {
    const codeBlockClassName = [style.markdownCodeBlock, className]
      .filter(Boolean)
      .join(' ');

    return (
      <pre
        className={codeBlockClassName}
        data-incomplete={isIncomplete ? 'true' : undefined}
        data-language={language || undefined}
        data-streamdown='code-block'
        dir='ltr'
      >
        <code className={className}>{code}</code>
      </pre>
    );
  }

  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
};

const getMarkdownComponents = ({
  onFactorOpen,
  sessionId,
  shareId,
}: {
  onFactorOpen?: (target: CcdbFactorPreviewTarget) => void;
  sessionId?: string;
  shareId?: string;
}): Components => ({
  a: ({ children, node: _node, href = '', target, rel, ...props }) => {
    const factorTarget = onFactorOpen ? factorTargetFromHref(href) : undefined;
    const downloadTarget = getDownloadTargetFromHref(href);
    const isDownloadLink = Boolean(downloadTarget);
    const isInternal = /^(#|\/#)/i.test(href);

    return (
      <a
        {...props}
        aria-label={
          downloadTarget
            ? I18N.template(I18N.carbonAgent.downloadFileWithId, {
                val1: downloadTarget.id,
              })
            : props['aria-label']
        }
        className={
          downloadTarget
            ? `${style.artifactDownloadLink} ${props.className || ''}`.trim()
            : props.className
        }
        href={href}
        onClick={
          downloadTarget
            ? event =>
                handleDownloadLinkClick(event, downloadTarget, {
                  sessionId,
                  shareId,
                })
            : factorTarget && onFactorOpen
            ? event => {
                if (
                  event.ctrlKey ||
                  event.metaKey ||
                  event.shiftKey ||
                  event.altKey
                )
                  return;
                event.preventDefault();
                onFactorOpen(factorTarget);
              }
            : props.onClick
        }
        rel={rel || (isInternal ? undefined : 'noreferrer')}
        target={isInternal || isDownloadLink ? '_self' : target || '_blank'}
        title={
          downloadTarget
            ? I18N.template(I18N.carbonAgent.downloadFileWithId, {
                val1: downloadTarget.id,
              })
            : props.title
        }
      >
        {downloadTarget ? (
          <>
            <DownloadOutlined className={style.artifactDownloadIcon} />
            <span className={style.artifactDownloadText}>
              {I18N.carbonAgent.mdDownloadFile}
            </span>
          </>
        ) : (
          children
        )}
      </a>
    );
  },
  code: MarkdownCode,
  p: ({ node: _node, ...props }) => <p {...props} dir='auto' />,
});

const escapeDollarNumber = (text: string | null | undefined) => {
  if (text == null) {
    return '';
  }

  let escapedText = '';

  for (let i = 0; i < text.length; i += 1) {
    let char = text[i];
    const nextChar = text[i + 1] || ' ';

    if (char === '$' && nextChar >= '0' && nextChar <= '9') {
      char = '\\$';
    }

    escapedText += char;
  }

  return escapedText;
};

const linkifyArtifactIdsInLine = (line: string) =>
  line.replace(
    ARTIFACT_ID_PATTERN,
    (match: string, boundary: string, artifactId: string) => {
      if (!isArtifactIdValue(artifactId)) {
        return match;
      }

      const encodedArtifactId = encodeURIComponent(artifactId);

      return `${boundary}[${I18N.carbonAgent.mdDownloadFile}](#${encodedArtifactId})`;
    },
  );

const linkifyFileDownloadIdsInLine = (line: string) =>
  line.replace(
    FILE_DOWNLOAD_ID_PATTERN,
    (match: string, boundary: string, fileId: string) => {
      if (!isFileIdValue(fileId)) {
        return match;
      }

      const encodedFileId = encodeURIComponent(fileId);

      return `${boundary}[${I18N.carbonAgent.mdDownloadFile}](#${encodedFileId})`;
    },
  );

const linkifyDownloadIdsInLine = (
  line: string,
  { linkifyFileDownloadIds = true }: NormalizeMarkdownContentOptions = {},
) => {
  const nextLine = linkifyArtifactIdsInLine(line);

  return linkifyFileDownloadIds
    ? linkifyFileDownloadIdsInLine(nextLine)
    : nextLine;
};

const linkifyArtifactIds = (
  text: string,
  options: NormalizeMarkdownContentOptions = {},
) => {
  if (!text.includes('artifact_') && !text.includes('file_')) {
    return text;
  }

  let insideFencedCode = false;

  return text
    .split('\n')
    .map(line => {
      if (FENCED_CODE_PATTERN.test(line)) {
        insideFencedCode = !insideFencedCode;
        return line;
      }

      return insideFencedCode ? line : linkifyDownloadIdsInLine(line, options);
    })
    .join('\n');
};

const normalizeMarkdownContent = (
  text: string | null | undefined,
  options?: NormalizeMarkdownContentOptions,
) =>
  linkifyArtifactIds(
    normalizeFlattenedMarkdownTables(escapeDollarNumber(text)),
    options,
  );

const StreamingMarkdown = ({
  content,
  factorCitations = [],
  onFactorOpen,
  sessionId,
  shareId,
  streaming = false,
}: StreamingMarkdownProps) => {
  const normalizedContent = useMemo(
    () =>
      linkifyCcdbFactorNames(
        normalizeMarkdownContent(content, {
          linkifyFileDownloadIds: !shareId,
        }),
        factorCitations,
      ),
    [content, factorCitations, shareId],
  );
  const markdownComponents = useMemo(
    () => getMarkdownComponents({ onFactorOpen, sessionId, shareId }),
    [onFactorOpen, sessionId, shareId],
  );

  return (
    <div className={style.streamingMarkdown}>
      <Streamdown
        animated={{
          duration: 120,
          sep: 'word',
          stagger: 8,
        }}
        className={style.streamingMarkdownContent}
        components={markdownComponents}
        controls={{
          code: {
            copy: false,
            download: false,
          },
          mermaid: {
            copy: false,
            download: false,
            fullscreen: false,
            panZoom: false,
          },
          table: {
            copy: false,
            download: false,
            fullscreen: false,
          },
        }}
        dir='auto'
        isAnimating={streaming}
        mode={streaming ? 'streaming' : 'static'}
        translations={getStreamdownTranslations()}
      >
        {normalizedContent}
      </Streamdown>
    </div>
  );
};

export default memo(StreamingMarkdown);
