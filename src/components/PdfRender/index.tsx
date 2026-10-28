import I18N from '@src/lang/I18N';
import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PdfRenderProps {
  // Add props here
  url?: string;
  scale?: number;
}

export const PdfRender: React.FC<PdfRenderProps> = props => {
  const [numPages, setNumPages] = useState<number>();

  const onDocumentLoadSuccess = ({ numPages: pageNum }) => {
    setNumPages(pageNum);
  };

  const myRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      setWidth(Math.floor(document.body.offsetWidth / 2));
    };

    updateWidth(); // 初始加载时获取一次宽度

    // 监听窗口变化或其他可能导致宽度变化的情况
    window.addEventListener('resize', updateWidth);

    // 清理函数，在组件卸载时移除事件监听器
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  return (
    <Document
      ref={myRef}
      file={props.url}
      onLoadSuccess={onDocumentLoadSuccess}
      loading={I18N.components.loading}
    >
      {Array.from(new Array(numPages), (el, index) => (
        <>
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={width}
            scale={props.scale}
          />
          <div style={{ width: '100%', height: '12px' }} />
        </>
      ))}
    </Document>
  );
};
