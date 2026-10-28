import I18N from '@src/lang/I18N';
import { downloadFile } from '@src/utils';
import { Button, Empty, Spin } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import CertificateArtwork from './CertificateArtwork';
import certificateDownloadIcon from '../assets/certificate-download-icon.svg';
import style from '../index.module.less';
import type {
  ProductCarbonCertificateApplication,
  ProductCarbonCertificateFormValues,
} from '../types';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

function CertificatePdfPreview({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(408);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const updateWidth = () =>
      setWidth(Math.max(1, Math.floor(container.clientWidth)));
    const observer = new ResizeObserver(updateWidth);
    updateWidth();
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={style.officialCertificatePdf} ref={containerRef}>
      <Document
        error={
          <Empty
            description={I18N.carbonAgent.certificateApplication.resultMissing}
          />
        }
        file={url}
        loading={<Spin />}
      >
        <Page
          pageNumber={1}
          renderAnnotationLayer={false}
          renderTextLayer={false}
          width={width}
        />
      </Document>
    </div>
  );
}

export function CertificatePreview({
  approved,
  info,
  values,
}: {
  approved: boolean;
  info?: ProductCarbonCertificateApplication;
  values: ProductCarbonCertificateFormValues;
}) {
  const text = I18N.carbonAgent.certificateApplication;

  if (approved) {
    const resultUrl = info?.resultImageUrl || '';
    const resultIsPdf = /\.pdf(?:$|[?#])/i.test(resultUrl);
    const fileExtension = resultIsPdf ? 'pdf' : 'png';
    const fileName =
      info?.resultFileName ||
      (info?.certificateNo
        ? `${info.certificateNo}.${fileExtension}`
        : text.downloadFileName);
    let resultPreview = <Empty description={text.resultMissing} />;

    if (resultUrl && resultIsPdf) {
      resultPreview = <CertificatePdfPreview url={resultUrl} />;
    } else if (resultUrl) {
      resultPreview = (
        <img
          alt={text.officialCertificate}
          className={style.officialCertificate}
          src={resultUrl}
        />
      );
    }

    return (
      <aside className={style.previewCard}>
        <div className={style.previewCardHeader}>
          <div>
            <h3>{text.deliverable}</h3>
            <p>{text.approvedPreviewHint}</p>
          </div>
        </div>
        <div className={style.previewContent}>
          <h4>{text.certificateTypeValue}</h4>
          {resultPreview}
          <Button
            className={style.downloadButton}
            disabled={!resultUrl}
            icon={
              <img alt='' aria-hidden='true' src={certificateDownloadIcon} />
            }
            onClick={() => resultUrl && downloadFile(resultUrl, fileName)}
          >
            {text.download}
          </Button>
        </div>
      </aside>
    );
  }

  return (
    <aside className={style.previewCard}>
      <div className={style.previewCardHeader}>
        <div>
          <h3>{text.preview}</h3>
          <p>{text.previewHint}</p>
        </div>
      </div>
      <div className={style.previewContent}>
        <h4>{text.certificateTypeValue}</h4>
        <div className={style.certificateSheet}>
          <CertificateArtwork
            accountingBoundaryEn={info?.accountingBoundaryEn}
            certificateNo={info?.certificateNo}
            issueDate={info?.issueDate}
            unitEmissionEn={info?.unitEmissionEn}
            validUntil={info?.validUntil}
            values={values}
          />
        </div>
        <p className={style.previewFootnote}>{text.previewFootnote}</p>
      </div>
    </aside>
  );
}
