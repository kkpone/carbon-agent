import I18N from '@src/lang/I18N';
import { CarbonLabelModal } from '@src/views/carbonFootprint3/CarbonLabel/component/CarbonLabelModal';
import { PreviewH5 } from '@src/views/carbonFootprint3/CarbonLabel/component/PreviewH5';
import type { CarbonLabelListData } from '@src/views/carbonFootprint3/CarbonLabel/type';

import labelExample from '../assets/label-example.png';
import qrExample from '../assets/qr-example.png';
import type { ApplicationInfo } from '../types';
import style from '../index.module.less';

export function ApplicationPreview({
  preview,
  approved,
  canDownload,
}: {
  preview?: ApplicationInfo;
  approved: boolean;
  canDownload: boolean;
}) {
  const text = I18N.carbonAgent.labelApplication;
  return (
    <aside className={style.previewCard}>
      <div className={style.cardHeader}>
        <h3>{approved ? text.deliverables : text.preview}</h3>
        <p>{approved ? text.approvedHint : text.previewHint}</p>
      </div>
      <div className={style.previewBody}>
        <div className={style.deliverableHeader}>
          <h4>{approved ? text.official : text.example}</h4>
          {!approved && <small>{text.downloadAfterApproval}</small>}
        </div>
        {!approved ? (
          <div className={style.deliverableExamples}>
            <div className={style.exampleItem}>
              <h4>{I18N.carbonFootprint3.carbonLabel}</h4>
              <div className={style.exampleGraphic}>
                <img src={labelExample} alt='' />
                <span>{text.sampleImage}</span>
              </div>
            </div>
            <div className={style.exampleItem}>
              <h4>{I18N.carbonFootprint3.qrCode}</h4>
              <div className={`${style.exampleGraphic} ${style.exampleQr}`}>
                <img src={qrExample} alt='' />
                <span>{text.sampleImage}</span>
              </div>
            </div>
          </div>
        ) : preview ? (
          <CarbonLabelModal
            embedded
            hiddenBtn={!canDownload}
            info={preview as CarbonLabelListData}
          />
        ) : null}
        <div className={style.h5Heading}>
          <h4>{text.h5}</h4>
          <p>{text.backendCalculation}</p>
        </div>
        <div className={style.h5}>
          <PreviewH5
            info={preview}
            variant='agent'
            labelPreview={
              approved && preview ? (
                <CarbonLabelModal
                  stampOnly
                  info={preview as CarbonLabelListData}
                />
              ) : undefined
            }
          />
        </div>
      </div>
    </aside>
  );
}
