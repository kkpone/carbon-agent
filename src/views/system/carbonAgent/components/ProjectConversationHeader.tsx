import { BranchesOutlined, ShareAltOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';

import style from './ProjectConversationHeader.module.less';

export type ProjectConversationHeaderProps = {
  branchCreating?: boolean;
  initiatedByMe?: boolean;
  ownerName?: string;
  projectName: string;
  readonly?: boolean;
  sessionTitle: string;
  shareDisabled?: boolean;
  shareLoading?: boolean;
  onCreateBranch?: () => void;
  onProjectOpen: () => void;
  onShare?: () => void;
};

const ProjectConversationHeader = ({
  branchCreating = false,
  initiatedByMe = false,
  ownerName,
  projectName,
  readonly = false,
  sessionTitle,
  shareDisabled = false,
  shareLoading = false,
  onCreateBranch,
  onProjectOpen,
  onShare,
}: ProjectConversationHeaderProps) => (
  <header className={style.projectConversationHeader}>
    <div className={style.projectConversationHeaderMain}>
      <nav aria-label={I18N.carbonAgent.projectConversationBreadcrumb}>
        <button type='button' title={projectName} onClick={onProjectOpen}>
          {projectName}
        </button>
        <span aria-hidden='true'>/</span>
        <strong title={sessionTitle}>{sessionTitle}</strong>
      </nav>
      {readonly ? (
        <small>
          {I18N.template(I18N.carbonAgent.projectConversationReadonly, {
            val1: ownerName || I18N.carbonAgent.projectConversationOwner,
          })}
        </small>
      ) : initiatedByMe ? (
        <small>{I18N.carbonAgent.projectConversationInitiatedByMe}</small>
      ) : null}
    </div>
    <div className={style.projectConversationHeaderActions}>
      {readonly && onCreateBranch ? (
        <button
          type='button'
          aria-busy={branchCreating}
          disabled={branchCreating}
          onClick={onCreateBranch}
        >
          <BranchesOutlined />
          <span className={style.projectConversationHeaderActionLabel}>
            {branchCreating
              ? I18N.carbonAgent.projectConversationBranchCreating
              : I18N.carbonAgent.projectConversationCreateBranch}
          </span>
        </button>
      ) : null}
      {!readonly && onShare ? (
        <button
          type='button'
          aria-busy={shareLoading}
          disabled={shareDisabled}
          onClick={onShare}
        >
          <ShareAltOutlined />
          <span className={style.projectConversationHeaderActionLabel}>
            {shareLoading
              ? I18N.carbonAgent.shareCreating
              : I18N.carbonAgent.share}
          </span>
        </button>
      ) : null}
    </div>
  </header>
);

export default ProjectConversationHeader;
