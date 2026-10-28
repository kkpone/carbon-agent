import downloadIcon from '@src/assets/images/carbonLabel/agent/download.svg';
import carbonLabel from '@src/assets/images/carbonLabel/carbonLabel.png';
import carbonStopQR from '@src/assets/images/carbonLabel/carbonStopQR.jpeg';
import downIcon from '@src/assets/images/carbonLabel/downIcon.svg';
import offsetLabel from '@src/assets/images/carbonLabel/offsetLabel.png';
import reduceLabel from '@src/assets/images/carbonLabel/reduceLabel.png';
import IconFont from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { Button, Spin } from 'antd';
import classNames from 'classnames';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode.react';
import { FC, useId, useRef, useState } from 'react';

import style from './index.module.less';
import { CarbonLabelModalInfo } from './type';
import { ApplyForLabelType, AuditForSource } from '../../constant';
import { CarbonLabelListData } from '../../type';

type Props = {
  info: CarbonLabelListData & CarbonLabelModalInfo;
  hiddenBtn?: boolean;
  embedded?: boolean;
  /** Agent H5 中仅复用标签图，不显示标题、二维码和操作。 */
  stampOnly?: boolean;
};

const { ACCOUNT, REDUCE, OFFSET } = ApplyForLabelType;

const { SAAS } = AuditForSource;

const labelStartOffset = ['44%', '44%', '46%'];

const labelPath = [
  'M 22 30 C 40 10 70 10 80 39',
  'M 22 27 C 40 9 70 10 80 36',
  'M 38 29 C 50 12 80 16 90 30',
];
const labelImgs = [carbonLabel, reduceLabel, offsetLabel];
const labelColor = ['#07C160', '#fff', '#07C160'];

export const CarbonLabelModal: FC<Props> = ({
  info,
  hiddenBtn,
  embedded,
  stampOnly,
}) => {
  const carbonLabelRef = useRef(null);
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const instanceId = useId();
  const circleId = `carbon-label-circle-${instanceId.replace(/:/g, '')}`;
  const { labelType, brand, accountObj, reduceObj } = info;
  const labelUnit = accountObj?.unitName;

  const getPreviewUrl = () => {
    if (process.env.REACT_APP_API_URL.includes('test')) {
      return 'https://carbon-label-test.carbonstop.net/';
    }

    if (process.env.REACT_APP_API_URL.includes('dev')) {
      return 'https://carbon-label-dev.carbonstop.net/';
    }
    if (process.env.REACT_APP_API_URL.includes('pre')) {
      return 'https://carbon-label-test.carbonstop.net/';
    }
    return 'https://carbon-label.carbonstop.net/';
  };

  const previewSrc = `${getPreviewUrl()}?applyNum=${
    info.applyNum
  }&source=${SAAS}&version=${info?.version || ''}`;

  const accountNum =
    labelType === ACCOUNT ? accountObj?.perEmission : undefined;
  const reduceNum = labelType === REDUCE ? reduceObj?.perEmission : undefined;

  // 数值回显
  const showNum = accountNum || reduceNum;

  const [loading, setLoading] = useState(false);

  /**
   * @params containerDom: 包裹待转化的DOM，
   * 即本例中的 <div class="container" ref="containerDom">
   */
  const makePoster = async (containerDom: HTMLElement | null | undefined) => {
    let posterUrl = '';
    if (!containerDom) {
      return posterUrl;
    }
    // 设置配置项，可以在官方文档查
    const options = {
      scale: 3, // 放大倍数，消除截图锯齿
      width: containerDom?.offsetWidth, // 生成的图片宽度，单位px
      height: containerDom.offsetHeight, // 生成的图片高度，单位px
      backgroundColor: null, // 设置背景色，null表示透明。若不设置此项，默认是白色背景
      // element 是 containerDom 的后代元素
      // 这里类名包含 “button-group” 的元素将不会出现在生成的图片中
      // ignoreElements: (element: Element) => {
      //   const isButtons = element.classList.contains('examine');
      //   return isButtons;
      // },
    };
    const canvas = await html2canvas(containerDom, options);
    posterUrl = canvas.toDataURL('image/png');
    return posterUrl;
  };

  /**
   * 保存图片
   */
  const saveClick = async () => {
    Toast('success', I18N.carbonFootprint3.downloading);
    setLoading(true);
    if (carbonLabelRef.current) {
      setTimeout(async () => {
        const urlPath = await makePoster(carbonLabelRef.current);

        let a: HTMLAnchorElement | null = document.createElement('a');
        a.href = urlPath;
        a.download = I18N.carbonFootprint3.carbonLabel;
        a.click();
        a = null;
        setLoading(false);
      }, 200);
    }
  };

  /**
   * 下载二维码
   */
  const saveQR = async () => {
    Toast('success', I18N.carbonFootprint3.downloading);
    setLoading(true);
    const canvasImg = qrContainerRef.current?.querySelector('canvas');
    setTimeout(async () => {
      if (canvasImg) {
        let a: HTMLAnchorElement | null = document.createElement('a');
        a.href = canvasImg.toDataURL('image/png');
        a.download = I18N.carbonFootprint3.qrCode;
        a.click();
        a = null;
        setLoading(false);
      }
    }, 200);
  };

  const labelGraphic = (
    <div
      className={classNames(style.carbonImg, {
        [style.labelImgMainOffset]: labelType === OFFSET,
        [style.labelImgMainAccount]: labelType === ACCOUNT,
      })}
      ref={carbonLabelRef}
    >
      <div className={style.circular}>
        <svg viewBox='0 0 100 100'>
          <path d={labelPath[labelType]} id={circleId} />
          <text
            textAnchor='middle'
            style={{
              fill: labelColor[labelType],
            }}
          >
            <textPath
              xlinkHref={`#${circleId}`}
              startOffset={labelStartOffset[labelType]}
              style={{
                fontSize: embedded || stampOnly ? '4px' : '5px',
              }}
            >
              {brand}
            </textPath>
          </text>
        </svg>
      </div>
      {labelType !== OFFSET && showNum && (
        <>
          <div className={style.labelNum}>
            {labelType === REDUCE && (
              <img
                className={style.labelDownIcon}
                src={downIcon}
                alt={I18N.carbonFootprint3.descendingIco}
              />
            )}
            {showNum}
          </div>
          <div className={style.labelUnit}>{labelUnit}</div>
        </>
      )}
      <img src={labelImgs[labelType]} alt={I18N.carbonFootprint3.carbonLabel} />
    </div>
  );

  if (stampOnly)
    return (
      <div className={classNames(style.carbonLabelModalMain, style.stampOnly)}>
        <div className={style.everyMain}>{labelGraphic}</div>
      </div>
    );

  return (
    <Spin spinning={loading}>
      <div
        className={classNames(style.carbonLabelModalMain, {
          [style.embedded]: embedded,
        })}
      >
        <div
          className={style.everyMain}
          style={hiddenBtn && !embedded ? { height: 210 } : {}}
        >
          <div className={style.title}>
            {embedded && !hiddenBtn ? (
              <Button
                className={style.titleDownload}
                type='text'
                aria-label={I18N.carbonFootprint3.downloadCarbonTags}
                onClick={saveClick}
              >
                {I18N.carbonFootprint3.carbonLabel}
                <img src={downloadIcon} width={16} height={16} alt='' />
              </Button>
            ) : embedded && hiddenBtn ? (
              I18N.carbonAgent.labelApplication.labelExample
            ) : (
              I18N.carbonFootprint3.carbonLabel
            )}
          </div>
          {labelGraphic}
          {!embedded && !hiddenBtn && (
            <Button
              className={style.downLoadMain}
              type='text'
              onClick={saveClick}
            >
              <IconFont
                type='icon-icon-xiazai-3'
                style={{ fontSize: '16px' }}
              />
              {I18N.carbonFootprint3.downloadCarbonTags}
            </Button>
          )}
        </div>
        <div
          className={style.everyMain}
          style={hiddenBtn && !embedded ? { height: 210 } : {}}
        >
          <div className={style.title}>
            {embedded && !hiddenBtn ? (
              <Button
                className={style.titleDownload}
                type='text'
                aria-label={I18N.carbonFootprint3.downloadQrCode}
                onClick={saveQR}
              >
                {I18N.carbonFootprint3.qrCode}
                <img src={downloadIcon} width={16} height={16} alt='' />
              </Button>
            ) : (
              I18N.carbonFootprint3.qrCode
            )}
          </div>
          <div className={style.qrCodeMain} ref={qrContainerRef}>
            <QRCode
              level='H'
              value={previewSrc}
              size={embedded ? 330 : 110}
              fgColor='#000000' // 二维码的颜色
              style={
                embedded
                  ? { width: 110, height: 110, margin: 'auto' }
                  : { margin: 'auto' }
              }
              imageSettings={{
                // 二维码中间的logo图片
                src: carbonStopQR,
                height: embedded ? 60 : 20,
                width: embedded ? 60 : 20,
                excavate: embedded === true,
              }}
            />
          </div>
          {!embedded && !hiddenBtn && (
            <Button className={style.downLoadMain} type='text' onClick={saveQR}>
              <IconFont
                type='icon-icon-xiazai-3'
                style={{ fontSize: '16px' }}
              />
              {I18N.carbonFootprint3.downloadQrCode}
            </Button>
          )}
        </div>
      </div>
    </Spin>
  );
};
