/**
 * @file 企业碳 Agent 第三方认证预览包装，复用通用 authType=2 认证表单。
 */
import { Spin } from 'antd';
import { lazy, Suspense } from 'react';
import { MemoryRouter } from 'react-router-dom';

import type { EnterpriseCarbonCertificationPreviewProps } from './types';
import { getEnterpriseCarbonCertificationUrl } from './route';
import style from './index.module.less';

const CertificationApplyPreview = lazy(
  () =>
    import(
      '@src/views/Certification/carbonFootprintCertification/certificationProject/applyPage'
    ),
);

const EnterpriseCarbonCertificationPreview = ({
  agentSessionId,
  onSubmitted,
  readonly = false,
  target,
}: EnterpriseCarbonCertificationPreviewProps) => {
  const previewUrl = getEnterpriseCarbonCertificationUrl(target, {
    agentSessionId,
    readonly,
  });

  return (
    <div className={style.preview}>
      <MemoryRouter initialEntries={[previewUrl]} key={previewUrl}>
        <Suspense
          fallback={
            <div className={style.loading}>
              <Spin />
            </div>
          }
        >
          <CertificationApplyPreview embedded onSubmitted={onSubmitted} />
        </Suspense>
      </MemoryRouter>
    </div>
  );
};

export default EnterpriseCarbonCertificationPreview;
