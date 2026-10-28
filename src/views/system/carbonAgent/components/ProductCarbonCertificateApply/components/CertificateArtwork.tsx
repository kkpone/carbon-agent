import moment from 'moment';
import { forwardRef, useLayoutEffect, useRef, useState } from 'react';

import certificateBackground from '../assets/certificate-preview-background@2x.png';
import certificateDivider from '../assets/certificate-preview-divider.svg';
import carbonstopLogo from '../assets/certificate-preview-logo.svg';
import style from '../index.module.less';
import type { ProductCarbonCertificateFormValues } from '../types';

export const CERTIFICATE_CANVAS_WIDTH = 1190;
export const CERTIFICATE_CANVAS_HEIGHT = 1684;

const CERTIFICATE_CONTENT_ZH_MAX_WEIGHT = 75;
const CERTIFICATE_CONTENT_EN_MAX_WEIGHT = 101;
const CERTIFICATE_ZH_LATIN_CHAR_WEIGHT = 1.15;
const CERTIFICATE_FACT_ZH_LINE_HEIGHT = 28;
const CERTIFICATE_FACT_EN_LINE_HEIGHT = 23;
const CERTIFICATE_FACT_LANGUAGE_GAP = 30;
const CERTIFICATE_FACT_START_Y = 580;
const CERTIFICATE_FACT_ROW_GAP = 80;
// At the 408px Figma preview width, this keeps the boundary section 5px
// farther from the preceding row than the standard fact-row spacing.
const CERTIFICATE_BOUNDARY_START_Y = 1154.6;

type Props = {
  accountingBoundaryEn?: string | null;
  certificateNo?: string | null;
  issueDate?: string | null;
  unitEmissionEn?: string | null;
  validUntil?: string | null;
  values: ProductCarbonCertificateFormValues;
};

type WrappedText = {
  lines: string[];
};

type BilingualFactDefinition = {
  english?: string | null;
  label: string;
  labelEn: string;
  value?: string | null;
};

type BilingualFactLayout = BilingualFactDefinition & {
  englishLines: string[];
  y: number;
  zhLines: string[];
};

const safeText = (value?: string | null) => value?.trim() || '';

const charWeight = (char: string, latinCharWeight = 1) =>
  char.charCodeAt(0) > 255 ? 2 : latinCharWeight;

function wrapTextResult(
  value: string,
  maxWeight: number,
  latinCharWeight = 1,
): WrappedText {
  const text = safeText(value);
  const lines: string[] = [];
  let current = '';
  let weight = 0;

  Array.from(text).forEach(char => {
    const nextWeight = charWeight(char, latinCharWeight);

    if (current && weight + nextWeight > maxWeight) {
      lines.push(current);
      current = char;
      weight = nextWeight;
      return;
    }

    current += char;
    weight += nextWeight;
  });

  if (current) {
    lines.push(current);
  }

  return { lines };
}

function wrapWordsResult(value: string, maxWeight: number): WrappedText {
  const words = safeText(value).split(/\s+/);
  const lines: string[] = [];
  let current = '';

  words.forEach(word => {
    const candidate = current ? `${current} ${word}` : word;
    const weight = Array.from(candidate).reduce(
      (total, char) => total + charWeight(char),
      0,
    );

    if (current && weight > maxWeight) {
      lines.push(current);
      current = word;
      return;
    }

    current = candidate;
  });

  if (current) {
    lines.push(current);
  }

  return { lines };
}

function createBilingualFactLayouts(facts: BilingualFactDefinition[]): {
  extraHeight: number;
  layouts: BilingualFactLayout[];
} {
  let extraHeight = 0;
  const layouts = facts.map((fact, index) => {
    const zhResult = wrapTextResult(
      `${fact.label}：${safeText(fact.value)}`,
      CERTIFICATE_CONTENT_ZH_MAX_WEIGHT,
      CERTIFICATE_ZH_LATIN_CHAR_WEIGHT,
    );
    const englishResult = wrapTextResult(
      `${fact.labelEn}: ${safeText(fact.english)}`,
      CERTIFICATE_CONTENT_EN_MAX_WEIGHT,
    );
    const y =
      CERTIFICATE_FACT_START_Y + index * CERTIFICATE_FACT_ROW_GAP + extraHeight;

    extraHeight +=
      (zhResult.lines.length - 1) * CERTIFICATE_FACT_ZH_LINE_HEIGHT +
      (englishResult.lines.length - 1) * CERTIFICATE_FACT_EN_LINE_HEIGHT;

    return {
      ...fact,
      englishLines: englishResult.lines,
      y,
      zhLines: zhResult.lines,
    };
  });

  return { extraHeight, layouts };
}

function formatDateZh(value?: string | null) {
  if (!value || !moment(value).isValid()) {
    return '';
  }

  return moment(value).format('YYYY年M月D日');
}

function formatDateEn(value?: string | null) {
  if (!value || !moment(value).isValid()) {
    return '';
  }

  return moment(value).locale('en').format('MMMM D, YYYY');
}

function SvgLines({
  anchor = 'middle',
  className,
  lineHeight = 28,
  lines,
  x,
  y,
}: {
  anchor?: 'start' | 'middle' | 'end';
  className?: string;
  lineHeight?: number;
  lines: string[];
  x: number;
  y: number;
}) {
  return (
    <text className={className} textAnchor={anchor} x={x} y={y}>
      {lines.map((line, index) => (
        <tspan
          key={`${x}-${y}-${line}`}
          className={className}
          x={x}
          dy={index ? lineHeight : 0}
        >
          {line}
        </tspan>
      ))}
    </text>
  );
}

function CenteredSvgLines({
  centerX,
  className,
  lineHeight,
  lines,
  y,
}: {
  centerX: number;
  className?: string;
  lineHeight: number;
  lines: string[];
  y: number;
}) {
  const textRef = useRef<SVGTextElement>(null);
  const [startX, setStartX] = useState(centerX);

  useLayoutEffect(() => {
    const textNode = textRef.current;

    if (!textNode) {
      return;
    }

    const box = textNode.getBBox();
    setStartX(current => current + centerX - (box.x + box.width / 2));
  }, [centerX, lines]);

  return (
    <text ref={textRef} className={className} x={startX} y={y}>
      {lines.map((line, index) => (
        <tspan
          key={`${y}-${line}`}
          className={className}
          x={startX}
          dy={index ? lineHeight : 0}
        >
          {line}
        </tspan>
      ))}
    </text>
  );
}

function BilingualFact({
  englishLines,
  y,
  zhLines,
}: Pick<BilingualFactLayout, 'englishLines' | 'y' | 'zhLines'>) {
  const englishY =
    y +
    CERTIFICATE_FACT_LANGUAGE_GAP +
    (zhLines.length - 1) * CERTIFICATE_FACT_ZH_LINE_HEIGHT;

  return (
    <g>
      <SvgLines
        className={style.certificateFactZh}
        lineHeight={CERTIFICATE_FACT_ZH_LINE_HEIGHT}
        lines={zhLines}
        x={CERTIFICATE_CANVAS_WIDTH / 2}
        y={y}
      />
      <SvgLines
        className={style.certificateFactEn}
        lineHeight={CERTIFICATE_FACT_EN_LINE_HEIGHT}
        lines={englishLines}
        x={CERTIFICATE_CANVAS_WIDTH / 2}
        y={englishY}
      />
    </g>
  );
}

const CertificateArtwork = forwardRef<SVGSVGElement, Props>(
  (
    {
      accountingBoundaryEn,
      certificateNo,
      issueDate,
      unitEmissionEn,
      validUntil,
      values,
    },
    ref,
  ) => {
    const periodZh = `${formatDateZh(
      values.accountingStartDate,
    )}至${formatDateZh(values.accountingEndDate)}`;
    const periodEn = `${formatDateEn(
      values.accountingStartDate,
    )} to ${formatDateEn(values.accountingEndDate)}`;
    const boundaryZh = `核算边界：${safeText(values.accountingBoundary)}`;
    const boundaryZhResult = wrapTextResult(
      boundaryZh,
      CERTIFICATE_CONTENT_ZH_MAX_WEIGHT,
      CERTIFICATE_ZH_LATIN_CHAR_WEIGHT,
    );
    const boundaryEn = `Accounting Boundary: ${safeText(accountingBoundaryEn)}`;
    const boundaryEnResult = wrapWordsResult(
      boundaryEn,
      CERTIFICATE_CONTENT_EN_MAX_WEIGHT,
    );
    const bilingualFacts: BilingualFactDefinition[] = [
      {
        english: values.productNameEn,
        label: '产品名称',
        labelEn: 'Product Name',
        value: values.productName,
      },
      {
        english: values.specificationEn,
        label: '产品规格型号',
        labelEn: 'Product Specification',
        value: values.specification,
      },
      {
        english: values.companyNameEn,
        label: '企业名称',
        labelEn: 'Company Name',
        value: values.applicantCompanyName,
      },
      {
        english: values.companyAddressEn,
        label: '地址',
        labelEn: 'Location',
        value: values.companyAddress,
      },
      {
        english: unitEmissionEn,
        label: '产品碳足迹',
        labelEn: 'Product Carbon Footprint',
        value: values.unitEmission,
      },
      {
        english: values.accountingStandard,
        label: '核算依据标准',
        labelEn: 'Evaluation Standards',
        value: values.accountingStandard,
      },
      {
        english: periodEn,
        label: '核算周期',
        labelEn: 'Accounting Period',
        value: periodZh,
      },
    ];
    const { extraHeight, layouts: bilingualFactLayouts } =
      createBilingualFactLayouts(bilingualFacts);
    const boundaryZhY = CERTIFICATE_BOUNDARY_START_Y + extraHeight;
    const boundaryEnY =
      boundaryZhY +
      (boundaryZhResult.lines.length - 1) * CERTIFICATE_FACT_ZH_LINE_HEIGHT +
      CERTIFICATE_FACT_LANGUAGE_GAP;
    return (
      <svg
        ref={ref}
        aria-label='产品碳足迹证书预览'
        className={style.certificateCanvas}
        preserveAspectRatio='xMidYMid meet'
        role='img'
        viewBox={`0 0 ${CERTIFICATE_CANVAS_WIDTH} ${CERTIFICATE_CANVAS_HEIGHT}`}
        xmlns='http://www.w3.org/2000/svg'
      >
        <rect
          fill='#fff'
          height={CERTIFICATE_CANVAS_HEIGHT}
          width={CERTIFICATE_CANVAS_WIDTH}
        />
        <image
          className={style.certificateBackground}
          href={certificateBackground}
          height={CERTIFICATE_CANVAS_HEIGHT}
          preserveAspectRatio='none'
          width={CERTIFICATE_CANVAS_WIDTH}
          x='0'
          y='0'
        />
        <image
          href={carbonstopLogo}
          height='66.364'
          preserveAspectRatio='none'
          width='268'
          x='140'
          y='144'
        />

        <g textAnchor='end'>
          <text className={style.certificateNumberPrimary} x='1050' y='164'>
            证书编号: {safeText(certificateNo)}
          </text>
          <text className={style.certificateNumberSecondary} x='1050' y='188'>
            Certificate No.: {safeText(certificateNo)}
          </text>
        </g>

        <text
          className={style.certificateTitleZh}
          textAnchor='middle'
          x='596'
          y='338'
        >
          产品碳足迹证书
        </text>
        <text
          className={style.certificateTitleEn}
          lengthAdjust='spacing'
          textAnchor='middle'
          textLength='526'
          x='595'
          xmlSpace='preserve'
          y='386'
        >
          PRODUCTCARBON&#32;&#32;FOOTPRINTCERTIFICATE
        </text>
        <image
          href={certificateDivider}
          height='2'
          preserveAspectRatio='none'
          width='910'
          x='140'
          y='412'
        />

        <text className={style.certificateLeadZh} x='140' y='456'>
          碳阻迹根据相关核算程序发布证书，对如下内容的真实性和有效性予以证明：
        </text>
        <SvgLines
          anchor='start'
          className={style.certificateLeadEn}
          lineHeight={21}
          lines={[
            'Carbonstop has issued this certificate based on the relevant procedures to attest to the authenticity and validity ',
            'of the following:',
          ]}
          x={140}
          y={488}
        />

        {bilingualFactLayouts.map(({ englishLines, label, y, zhLines }) => (
          <BilingualFact
            key={label}
            englishLines={englishLines}
            y={y}
            zhLines={zhLines}
          />
        ))}

        <CenteredSvgLines
          centerX={CERTIFICATE_CANVAS_WIDTH / 2}
          className={style.certificateBoundaryZh}
          lineHeight={CERTIFICATE_FACT_ZH_LINE_HEIGHT}
          lines={boundaryZhResult.lines}
          y={boundaryZhY}
        />
        <CenteredSvgLines
          centerX={CERTIFICATE_CANVAS_WIDTH / 2}
          className={style.certificateBoundaryEn}
          lineHeight={CERTIFICATE_FACT_EN_LINE_HEIGHT}
          lines={boundaryEnResult.lines}
          y={boundaryEnY}
        />

        <g>
          <text className={style.certificateSignaturePrimary} x='140' y='1380'>
            授权代表（签名或签章）:
          </text>
          <text className={style.certificateSmallEn} x='140' y='1404'>
            Authorized Representative:
          </text>
        </g>
        <g textAnchor='end'>
          <text className={style.certificateDatePrimary} x='1050' y='1352'>
            发证日期：{formatDateZh(issueDate)}
          </text>
          <text className={style.certificateSmallEn} x='1050' y='1380'>
            Date of issue: {formatDateEn(issueDate)}
          </text>
          <text className={style.certificateDatePrimary} x='1050' y='1416'>
            有效期至：{formatDateZh(validUntil)}
          </text>
          <text className={style.certificateSmallEn} x='1050' y='1442'>
            Date of expiry: {formatDateEn(validUntil)}
          </text>
        </g>

        <text
          className={style.certificateDisclaimerZh}
          textAnchor='middle'
          x='595'
          y='1540'
        >
          本次碳核算为碳阻迹基于客户提供且承诺的数据进行计算的结果
        </text>
        <text
          className={style.certificateDisclaimerEn}
          textAnchor='middle'
          x='595'
          y='1560'
        >
          Aforementioned carbon emissions have been calculated by Carbonstop
          based on data provided and guaranteed by the client.
        </text>
      </svg>
    );
  },
);

CertificateArtwork.displayName = 'CertificateArtwork';

export default CertificateArtwork;
