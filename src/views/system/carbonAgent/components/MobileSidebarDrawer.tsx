import I18N from '@src/lang/I18N';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';

import Sidebar from './Sidebar';
import { bindMobileSidebarSwipe } from './mobileSidebarSwipe';
import type { AgentConversation, AgentSectionKey } from '../constants';
import style from '../index.module.less';

type MobileSidebarDrawerProps = {
  activeSection: AgentSectionKey;
  authenticated: boolean;
  createdConversation: AgentConversation | null;
  footprintAccountingSelected?: boolean;
  inviteOpenRequestKey?: number;
  mobileProfileOpenRequested?: boolean;
  open: boolean;
  projectListRefreshKey: number;
  selectedSessionId: string;
  sessionListRefreshKey: number;
  onClose: () => void;
  onConversationsChanged?: () => void;
  onHistorySelect: (conversation: AgentConversation) => void;
  onInviteOpenRequestHandled?: () => void;
  onLoginRequest: () => void;
  onMobileProfileOpenRequestHandled?: () => void;
  onNewChat: () => void;
  onOpenGuide: () => void;
  onRequireLogin: () => boolean;
  onSelectSection: (section: AgentSectionKey) => void;
  onViewAllHistory: () => void;
};

const MobileSidebarDrawer = ({
  activeSection,
  authenticated,
  createdConversation,
  footprintAccountingSelected = false,
  inviteOpenRequestKey = 0,
  mobileProfileOpenRequested = false,
  open,
  projectListRefreshKey,
  selectedSessionId,
  sessionListRefreshKey,
  onClose,
  onConversationsChanged,
  onHistorySelect,
  onInviteOpenRequestHandled,
  onLoginRequest,
  onMobileProfileOpenRequestHandled,
  onNewChat,
  onOpenGuide,
  onRequireLogin,
  onSelectSection,
  onViewAllHistory,
}: MobileSidebarDrawerProps) => {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const layerRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(open);

  useEffect(() => {
    if (open) {
      setRendered(true);
      return undefined;
    }
    if (!rendered) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRendered(false);
      return undefined;
    }
    // Keep the drawer mounted until its 200 ms exit animation finishes.
    const timer = window.setTimeout(() => setRendered(false), 200);
    return () => window.clearTimeout(timer);
  }, [open, rendered]);

  useEffect(() => {
    drawerRef.current?.toggleAttribute('inert', !open);
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    drawerRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    return () => {
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      }
    };
  }, [open]);

  useEffect(() => {
    const drawer = drawerRef.current;
    if (!open || !drawer) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
      if (event.key !== 'Tab') return;
      const controls = Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]',
        ) || [],
      ).filter(element => element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    drawer.addEventListener('keydown', handleKeyDown);
    return () => drawer.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    const drawer = drawerRef.current;
    const layer = layerRef.current;
    if (!open || !drawer || !layer) return undefined;
    return bindMobileSidebarSwipe(drawer, layer, () => onCloseRef.current());
  }, [open]);

  if (!open && !rendered) {
    return null;
  }

  return (
    <div
      ref={layerRef}
      className={classNames(style.mobileSidebarLayer, {
        [style.mobileSidebarLayerLeaving]: !open,
      })}
      role='presentation'
      aria-hidden={!open}
    >
      <button
        className={style.mobileSidebarBackdrop}
        type='button'
        disabled={!open}
        aria-label={I18N.carbonAgent.closeMenu}
        onClick={onClose}
      />
      <div
        ref={drawerRef}
        className={style.mobileSidebarDrawer}
        role='dialog'
        aria-modal='true'
        aria-label={I18N.carbonAgent.navMenuLabel}
      >
        <Sidebar
          activeSection={activeSection}
          authenticated={authenticated}
          collapsed={false}
          createdConversation={createdConversation}
          footprintAccountingSelected={footprintAccountingSelected}
          inviteOpenRequestKey={inviteOpenRequestKey}
          mobile
          mobileProfileEnabled
          mobileProfileOpenRequested={mobileProfileOpenRequested}
          projectListRefreshKey={projectListRefreshKey}
          selectedSessionId={selectedSessionId}
          sessionListRefreshKey={sessionListRefreshKey}
          onConversationsChanged={onConversationsChanged}
          onHistorySelect={conversation => {
            onHistorySelect(conversation);
            onClose();
          }}
          onInviteOpenRequestHandled={onInviteOpenRequestHandled}
          onLoginRequest={() => {
            onClose();
            onLoginRequest();
          }}
          onMobileClose={onClose}
          onMobileProfileOpenRequestHandled={onMobileProfileOpenRequestHandled}
          onNewChat={() => {
            onNewChat();
            onClose();
          }}
          onOpenGuide={onOpenGuide}
          onRequireLogin={onRequireLogin}
          onSelectSection={section => {
            onClose();
            onSelectSection(section);
          }}
          onToggleCollapsed={onClose}
          onViewAllHistory={() => {
            onViewAllHistory();
            onClose();
          }}
        />
      </div>
    </div>
  );
};

export default MobileSidebarDrawer;
