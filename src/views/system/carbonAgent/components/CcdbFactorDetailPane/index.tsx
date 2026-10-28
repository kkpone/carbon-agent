import {
  CloseOutlined,
  ReloadOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { copyToClipboard } from '@src/utils/clipboard';
import { message as antdMessage } from 'antd';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import typography from './index.module.less';
import {
  fetchCcdbFactorPreview,
  getCcdbErrorMessage,
  getCcdbFactorValue,
  type CcdbFactorDetail,
  type CcdbFactorPreviewTarget,
} from '../../ccdbFactor';
import style from '../../index.module.less';
import {
  PreviewExitFullscreenIcon,
  PreviewFullscreenIcon,
} from '../PreviewPaneIcons';

type CcdbFactorDetailPaneProps = {
  fullscreen?: boolean;
  mobile?: boolean;
  open: boolean;
  target: CcdbFactorPreviewTarget;
  onClose: () => void;
  onLoaded?: (detail: CcdbFactorDetail) => void;
  onResizeStart?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onShare?: (factorId: string) => Promise<string> | undefined;
  onToggleFullscreen?: () => void;
};

const text = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return '—';
  }

  return String(value);
};

const isHttpUrl = (value?: string | null) =>
  Boolean(value && /^https?:\/\//i.test(value.trim()));

const gasUnit = (numerator?: string | null, denominator?: string | null) => {
  const top = numerator?.trim();
  const bottom = denominator?.trim();
  if (top && bottom) return `${top}/${bottom}`;
  // 缺分子时不能将分母误显示为完整排放因子单位。
  return (
    top ||
    (bottom
      ? I18N.template(I18N.ccdb.unitIncomplete, { bottom })
      : I18N.ccdb.unitMissing)
  );
};

const DetailRow = ({ label, value }: { label: string; value: unknown }) => (
  <div className={style.ccdbFactorDetailRow}>
    <dt>{label}</dt>
    <dd>{text(value)}</dd>
  </div>
);

const CcdbFactorDetailPane = ({
  fullscreen = false,
  mobile = false,
  open,
  target,
  onClose,
  onLoaded,
  onResizeStart,
  onShare,
  onToggleFullscreen,
}: CcdbFactorDetailPaneProps) => {
  const [detail, setDetail] = useState<CcdbFactorDetail | undefined>(
    target.detail,
  );
  const [loading, setLoading] = useState(
    Boolean(target.boundSessionId) || !target.detail,
  );
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setDetail(target.boundSessionId ? undefined : target.detail);
    setError('');
    setLoading(Boolean(target.boundSessionId) || !target.detail);
  }, [
    target.detail,
    target.factorId,
    target.shareId,
    target.boundSessionId,
    target.entrySource,
  ]);

  useEffect(() => {
    if (!open || (target.detail && !target.boundSessionId)) {
      return undefined;
    }

    const abortController = new AbortController();
    setLoading(true);
    setError('');

    fetchCcdbFactorPreview(target, abortController.signal)
      .then(nextDetail => {
        if (!nextDetail) {
          throw new Error(I18N.ccdb.factorMissing);
        }

        if (abortController.signal.aborted) return;
        setDetail(nextDetail);
        onLoaded?.(nextDetail);
      })
      .catch(requestError => {
        if (!abortController.signal.aborted) {
          setError(getCcdbErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      });

    return () => abortController.abort();
  }, [onLoaded, open, reloadKey, target]);

  const factorName = detail?.name || target.name || I18N.ccdb.emissionFactor;
  const factorValue =
    getCcdbFactorValue(detail) ||
    [target.value, target.unit].filter(Boolean).join(' ') ||
    '—';
  const gasData = useMemo(() => {
    const values = detail?.gasData;
    return Array.isArray(values) ? values : [];
  }, [detail?.gasData]);
  const hasMaskedValue = [
    detail?.cValue,
    ...gasData.map(gas => gas.factorValue),
  ].some(value => typeof value === 'string' && /\*{2,}/.test(value));

  const handleShare = () => {
    const shareUrl = onShare?.(target.factorId);

    if (!shareUrl) {
      return;
    }

    copyToClipboard(shareUrl)
      .then(() => antdMessage.success(I18N.ccdb.shareCopied))
      .catch(() => antdMessage.error(I18N.ccdb.copyError));
  };

  return (
    <aside
      className={classNames(
        style.previewPane,
        style.previewPaneEnterpriseCarbon,
        style.ccdbFactorPane,
        typography.pane,
        {
          [style.ccdbFactorPaneMobile]: mobile,
          [typography.mobile]: mobile,
          [style.previewPaneClosed]: !open,
          [style.previewPaneFullscreen]: fullscreen,
        },
      )}
      aria-hidden={!open}
      aria-label={I18N.ccdb.emissionFactorDetails}
    >
      {!fullscreen && !mobile && onResizeStart ? (
        <button
          className={style.previewResizeHandle}
          type='button'
          aria-label={I18N.ccdb.resizeFactorPane}
          onPointerDown={onResizeStart}
        />
      ) : null}

      <header className={classNames(style.previewHeader, typography.header)}>
        <div className={style.previewTitleWrap}>
          <strong className={classNames(style.previewTitle, typography.title)}>
            {I18N.ccdb.factorDetails}
          </strong>
        </div>
        <div
          className={classNames(style.previewHeaderActions, typography.actions)}
        >
          {onShare ? (
            <button
              type='button'
              aria-label={I18N.ccdb.shareFactor}
              className={classNames(
                style.previewIconButton,
                typography.shareButton,
              )}
              onClick={handleShare}
            >
              <ShareAltOutlined />
              <span>{I18N.ccdb.shareFactor}</span>
            </button>
          ) : null}
          {!mobile && onToggleFullscreen ? (
            <button
              className={style.previewIconButton}
              type='button'
              aria-label={
                fullscreen ? I18N.ccdb.exitFullscreen : I18N.ccdb.fullscreen
              }
              onClick={onToggleFullscreen}
            >
              {fullscreen ? (
                <PreviewExitFullscreenIcon />
              ) : (
                <PreviewFullscreenIcon />
              )}
            </button>
          ) : null}
          <button
            type='button'
            aria-label={I18N.ccdb.closeFactorDetails}
            className={style.previewIconButton}
            onClick={onClose}
          >
            <CloseOutlined />
          </button>
        </div>
      </header>

      <div
        className={classNames(style.ccdbFactorPaneScroll, typography.scroll)}
      >
        {loading ? (
          <div className={style.ccdbFactorState} role='status'>
            <span className={style.ccdbFactorStateSpinner} />
            {I18N.ccdb.loadingFactor}
          </div>
        ) : null}

        {!loading && error ? (
          <div className={style.ccdbFactorState} role='alert'>
            <strong>{I18N.ccdb.detailsLoadFailed}</strong>
            <span>{error}</span>
            <button type='button' onClick={() => setReloadKey(key => key + 1)}>
              <ReloadOutlined /> {I18N.ccdb.retry}
            </button>
          </div>
        ) : null}

        {!loading && !error ? (
          <>
            <section className={style.ccdbFactorHero}>
              <span>{I18N.ccdb.factorInformation}</span>
              <h2 className={typography.name}>{factorName}</h2>
              <div
                className={classNames(
                  style.ccdbFactorDetailValue,
                  typography.value,
                )}
              >
                {factorValue}
              </div>
              <dl>
                <DetailRow
                  label={I18N.ccdb.specification}
                  value={detail?.specification}
                />
                <DetailRow
                  label={I18N.ccdb.application}
                  value={detail?.description}
                />
                <DetailRow
                  label={I18N.ccdb.industry}
                  value={detail?.business}
                />
              </dl>
            </section>

            <section className={style.ccdbFactorDetailSection}>
              <h3 className={typography.sectionTitle}>
                {I18N.ccdb.sourceInformation}
              </h3>
              <dl>
                <DetailRow
                  label={I18N.ccdb.sourceName}
                  value={detail?.institution}
                />
                <DetailRow label={I18N.ccdb.publishYear} value={detail?.year} />
                <DetailRow
                  label={I18N.ccdb.documentType}
                  value={detail?.documentType}
                />
                <DetailRow
                  label={I18N.ccdb.sourceType}
                  value={detail?.sourceLevel}
                />
                <DetailRow
                  label={I18N.ccdb.countryOrganization}
                  value={detail?.countries || detail?.area}
                />
                <div className={style.ccdbFactorDetailRow}>
                  <dt>{I18N.ccdb.sourceDocument}</dt>
                  <dd>
                    {isHttpUrl(detail?.source) ? (
                      <a
                        href={detail?.source || undefined}
                        rel='noreferrer noopener'
                        target='_blank'
                      >
                        {I18N.ccdb.viewSource}
                      </a>
                    ) : (
                      text(detail?.source)
                    )}
                  </dd>
                </div>
              </dl>
            </section>

            <section className={style.ccdbFactorDetailSection}>
              <h3 className={typography.sectionTitle}>
                {I18N.ccdb.dataDetails}
              </h3>
              {gasData.length ? (
                <div className={style.ccdbGasDataList}>
                  {gasData.map(gas => (
                    <div
                      className={style.ccdbGasDataItem}
                      key={[
                        text(gas.greenhouseGasesType),
                        text(gas.factorValue),
                        text(gas.factorUnitM),
                      ].join('-')}
                    >
                      <span>{text(gas.greenhouseGasesType)}</span>
                      <strong>
                        {text(gas.factorValue)}{' '}
                        {gasUnit(gas.factorUnit, gas.factorUnitM)}
                      </strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={style.ccdbFactorEmptyData}>
                  {detail?.formula || I18N.ccdb.noGasData}
                </p>
              )}
            </section>

            {hasMaskedValue ? (
              <p className={style.ccdbFactorPublicHint}>
                {I18N.ccdb.licenseHint}
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </aside>
  );
};

export default CcdbFactorDetailPane;
