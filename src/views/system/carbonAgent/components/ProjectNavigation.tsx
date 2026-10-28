import { useDroppable } from '@dnd-kit/core';
import I18N from '@src/lang/I18N';
import { Tooltip } from 'antd';
import classNames from 'classnames';
import { useEffect, useState } from 'react';

import ConversationItem from './ConversationItem';
import Icon from './Icon';
import {
  AgentConversation,
  AgentProject,
  AgentSectionKey,
  getProjectDropId,
  getProjectSectionKey,
  getProjectTasksSectionKey,
  icons,
} from '../constants';
import style from '../index.module.less';

type ProjectNavigationProps = {
  activeSection: AgentSectionKey;
  canCreateProject: boolean;
  collapsed: boolean;
  conversationDragEnabled: boolean;
  conversationsByProject: Map<string, AgentConversation[]>;
  error?: string;
  expandedProjectId: string;
  loading?: boolean;
  menuConversationId: string;
  projects: AgentProject[];
  selectedConversationId: string;
  tooltipEnabled?: boolean;
  onCloseMenu: () => void;
  onCreateProject: () => void;
  onDeleteConversation: (conversationId: string) => void;
  onMenuToggle: (conversationId: string) => void;
  onRenameConversation: (conversationId: string) => void;
  onRetry: () => void;
  onSelectConversation: (conversation: AgentConversation) => void;
  onSelectSection: (section: AgentSectionKey) => void;
  onToggleProject: (projectId: string) => void;
};

const EMPTY_CONVERSATIONS: AgentConversation[] = [];
const PROJECT_CONVERSATION_PREVIEW_LIMIT = 5;

const getProjectTypeTag = (businessType?: string) => {
  if (businessType === 'product_carbon') {
    return {
      className: style.projectTypeTagProduct,
      label: I18N.carbonAgent.projectTypeProduct,
    };
  }

  if (businessType === 'enterprise_carbon') {
    return {
      className: style.projectTypeTagOrganization,
      label: I18N.carbonAgent.projectTypeOrganization,
    };
  }

  return undefined;
};

const ProjectNavigation = ({
  activeSection,
  canCreateProject,
  collapsed,
  conversationDragEnabled,
  conversationsByProject,
  error = '',
  expandedProjectId,
  loading = false,
  menuConversationId,
  projects,
  selectedConversationId,
  tooltipEnabled = true,
  onCloseMenu,
  onCreateProject,
  onDeleteConversation,
  onMenuToggle,
  onRenameConversation,
  onRetry,
  onSelectConversation,
  onSelectSection,
  onToggleProject,
}: ProjectNavigationProps) => (
  <section
    className={classNames(style.navSection, style.projectNavigation)}
    data-agent-login-entry='project_entry'
    aria-labelledby='carbon-agent-project-section-title'
  >
    <div
      className={classNames(style.sectionTitle, style.projectSectionHeader)}
      id='carbon-agent-project-section-title'
    >
      <span>{I18N.carbonAgent.projectSection}</span>
      {projects.length && canCreateProject ? (
        <button
          className={style.projectAddButton}
          type='button'
          aria-label={I18N.carbonAgent.newProject}
          title={I18N.carbonAgent.newProject}
          onClick={onCreateProject}
        >
          <Icon
            className={style.projectSectionAddIcon}
            src={icons.newProjectMutedIcon}
          />
        </button>
      ) : null}
    </div>

    {loading ? (
      <div className={style.projectNavigationState}>
        {I18N.carbonAgent.projectListLoading}
      </div>
    ) : error ? (
      <div className={style.projectNavigationState}>
        <span>{error}</span>
        <button type='button' onClick={onRetry}>
          {I18N.carbonAgent.retry}
        </button>
      </div>
    ) : projects.length ? (
      projects.map(project => (
        <ProjectNavigationItem
          activeSection={activeSection}
          collapsed={collapsed}
          conversationDragEnabled={conversationDragEnabled}
          conversations={
            conversationsByProject.get(project.id) || EMPTY_CONVERSATIONS
          }
          expanded={expandedProjectId === project.id}
          key={project.id}
          menuConversationId={menuConversationId}
          project={project}
          selectedConversationId={selectedConversationId}
          tooltipEnabled={tooltipEnabled}
          onCloseMenu={onCloseMenu}
          onDeleteConversation={onDeleteConversation}
          onMenuToggle={onMenuToggle}
          onRenameConversation={onRenameConversation}
          onSelectConversation={onSelectConversation}
          onSelectSection={onSelectSection}
          onToggleProject={onToggleProject}
        />
      ))
    ) : canCreateProject ? (
      <button
        className={classNames(style.navItem, style.projectEmptyCreateButton)}
        type='button'
        aria-label={collapsed ? I18N.carbonAgent.newProject : undefined}
        title={collapsed ? I18N.carbonAgent.newProject : undefined}
        onClick={onCreateProject}
      >
        <Icon src={icons.newProjectIcon} />
        <span className={style.navText}>{I18N.carbonAgent.newProject}</span>
      </button>
    ) : (
      <div className={style.projectNavigationState}>
        {I18N.carbonAgent.projectListEmpty}
      </div>
    )}
  </section>
);

type ProjectNavigationItemProps = {
  activeSection: AgentSectionKey;
  collapsed: boolean;
  conversationDragEnabled: boolean;
  conversations: AgentConversation[];
  expanded: boolean;
  menuConversationId: string;
  project: AgentProject;
  selectedConversationId: string;
  tooltipEnabled: boolean;
  onCloseMenu: () => void;
  onDeleteConversation: (conversationId: string) => void;
  onMenuToggle: (conversationId: string) => void;
  onRenameConversation: (conversationId: string) => void;
  onSelectConversation: (conversation: AgentConversation) => void;
  onSelectSection: (section: AgentSectionKey) => void;
  onToggleProject: (projectId: string) => void;
};

const ProjectNavigationItem = ({
  activeSection,
  collapsed,
  conversationDragEnabled,
  conversations,
  expanded,
  menuConversationId,
  project,
  selectedConversationId,
  tooltipEnabled,
  onCloseMenu,
  onDeleteConversation,
  onMenuToggle,
  onRenameConversation,
  onSelectConversation,
  onSelectSection,
  onToggleProject,
}: ProjectNavigationItemProps) => {
  const [projectConversationsExpanded, setProjectConversationsExpanded] =
    useState(true);
  const [projectConversationsShowAll, setProjectConversationsShowAll] =
    useState(false);

  useEffect(() => {
    if (!expanded) {
      setProjectConversationsExpanded(true);
      setProjectConversationsShowAll(false);
    }
  }, [expanded]);

  const { isOver, setNodeRef } = useDroppable({
    disabled: !conversationDragEnabled,
    id: getProjectDropId(project.id),
  });
  const homeSection = getProjectSectionKey(project.id);
  const tasksSection = getProjectTasksSectionKey(project.id);
  const projectContentId = `carbon-agent-project-${project.id}`;
  const visibleConversations = projectConversationsShowAll
    ? conversations
    : conversations.slice(0, PROJECT_CONVERSATION_PREVIEW_LIMIT);
  const hasMoreConversations =
    conversations.length > PROJECT_CONVERSATION_PREVIEW_LIMIT;
  const projectTypeTag = getProjectTypeTag(project.businessType);

  return (
    <div
      className={classNames(style.projectDropZone, {
        [style.dropZoneActive]: conversationDragEnabled && isOver,
      })}
      ref={setNodeRef}
    >
      <button
        className={classNames(style.navItem, style.projectNavItem)}
        type='button'
        aria-controls={projectContentId}
        aria-expanded={!collapsed && expanded}
        aria-label={collapsed ? project.name : undefined}
        title={collapsed ? project.name : undefined}
        onClick={() => onToggleProject(project.id)}
      >
        <Icon src={icons.folderIcon} />
        <Tooltip
          mouseEnterDelay={0.2}
          placement='right'
          title={!collapsed && tooltipEnabled ? project.name : undefined}
        >
          <span className={style.navText}>{project.name}</span>
        </Tooltip>
        {!collapsed && projectTypeTag ? (
          <span
            className={classNames(
              style.projectTypeTag,
              projectTypeTag.className,
            )}
          >
            {projectTypeTag.label}
          </span>
        ) : null}
      </button>

      {!collapsed && expanded ? (
        <div className={style.projectContent} id={projectContentId}>
          <button
            className={classNames(style.projectChildNavItem, {
              [style.projectChildNavItemActive]: activeSection === homeSection,
            })}
            type='button'
            onClick={() => onSelectSection(homeSection)}
          >
            <Icon
              className={style.projectChildNavIcon}
              src={icons.projectHomeIcon}
            />
            <span>{I18N.carbonAgent.projectHome}</span>
          </button>
          <button
            className={classNames(style.projectChildNavItem, {
              [style.projectChildNavItemActive]: activeSection === tasksSection,
            })}
            type='button'
            onClick={() => onSelectSection(tasksSection)}
          >
            <Icon
              className={style.projectChildNavIcon}
              src={icons.projectTaskIcon}
            />
            <span>{I18N.carbonAgent.projectTasks}</span>
          </button>

          {conversations.length ? (
            <div className={style.projectConversationGroup}>
              <button
                className={classNames(
                  style.projectChildNavItem,
                  style.projectConversationToggle,
                )}
                type='button'
                aria-expanded={projectConversationsExpanded}
                onClick={() =>
                  setProjectConversationsExpanded(currentValue => !currentValue)
                }
              >
                <Icon
                  className={style.projectChildNavIcon}
                  src={icons.projectConversationIcon}
                />
                <span>{I18N.carbonAgent.projectConversations}</span>
                <Icon
                  className={classNames(
                    style.expandIcon,
                    style.projectConversationExpandIcon,
                    {
                      [style.expandIconCollapsed]:
                        !projectConversationsExpanded,
                    },
                  )}
                  src={icons.chevronIcon}
                />
              </button>
              {projectConversationsExpanded ? (
                <div className={style.projectConversationList}>
                  {visibleConversations.map(conversation => (
                    <ConversationItem
                      conversation={conversation}
                      draggable={
                        conversationDragEnabled &&
                        conversation.canWrite === true
                      }
                      key={conversation.id}
                      menuOpen={menuConversationId === conversation.id}
                      selected={
                        selectedConversationId ===
                        (conversation.sessionId || conversation.id)
                      }
                      tooltipEnabled={tooltipEnabled}
                      onCloseMenu={onCloseMenu}
                      onDelete={onDeleteConversation}
                      onMenuToggle={onMenuToggle}
                      onRename={onRenameConversation}
                      onSelect={onSelectConversation}
                    />
                  ))}
                  {hasMoreConversations && !projectConversationsShowAll ? (
                    <button
                      className={style.projectConversationMoreButton}
                      type='button'
                      onClick={() => setProjectConversationsShowAll(true)}
                    >
                      {I18N.carbonAgent.projectConversationsShowMore}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default ProjectNavigation;
