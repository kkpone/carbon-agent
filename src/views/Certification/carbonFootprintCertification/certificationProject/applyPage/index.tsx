import useUrlState from '@ahooksjs/use-url-state';
import { FC, memo } from 'react';

import style from './index.module.less';
import ApplayCertification from '../component/ApplayCertification';
import { PAGETAYPE } from '../const';

interface ApplayPageProps {
  /** 内嵌预览（如碳代理预览面板）时隐藏底部「返回」按钮 */
  embedded?: boolean;
  onSubmitted?: (certificationId?: number | string) => void;
}

const ApplayPage: FC<ApplayPageProps> = ({ embedded, onSubmitted }) => {
  const [{ pageType, authType }] = useUrlState<{
    pageType: PAGETAYPE;
    id?: string;
    applyNo?: string;
    authType?: string;
  }>();

  const isEdit = pageType === PAGETAYPE.EDIT;
  const isDetail = pageType === PAGETAYPE.SHOW;
  let pageClassName: string | undefined;
  if (embedded && authType === '2') {
    pageClassName = style.enterpriseEmbedded;
  }

  return (
    <div id={style.applayPage} className={pageClassName}>
      <ApplayCertification
        readonly={isDetail}
        embedded={embedded}
        onSubmitted={onSubmitted}
        // showRecord={onAuditRecordOpen}
        // initValues={applyData}
        // auditData={auditData}
        editSubmit={isEdit}
      />
    </div>
  );
};

export default memo(ApplayPage);
