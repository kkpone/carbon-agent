import { CheckOutlined, SwapOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import style from './WorkspaceMenu.module.less';
import { teamApi } from './api';
import { reasonText } from './errors';
import { teamText } from './i18n';
import { useWorkspace } from './workspace';
import Icon from '../components/Icon';
import { icons } from '../constants';
import sidebar from '../index.module.less';

// Keep space selection outside the personal-center dialog. It shares the
// account menu's focus/hover boundary, just like the existing language submenu.
export const WorkspaceMenu = ({
  active,
  onSelect,
}: {
  active: boolean;
  onSelect: () => void;
}) => {
  const { access, key, switchSpace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const spaces = useQuery(
    [...key, 'workspaces'],
    ({ signal }) => teamApi.workspaces(signal),
    { enabled: !!access && active, retry: false },
  );
  useEffect(() => {
    if (!active) setOpen(false);
  }, [active]);
  if (!access) return null;
  const expanded = active && open;
  const rows = [...(spaces.data || [])].sort(
    (a, b) =>
      Number(b.workspaceType === 'PERSONAL') -
      Number(a.workspaceType === 'PERSONAL'),
  );
  return (
    <div
      className={style.item}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setOpen(false);
      }}
      onKeyDown={event => {
        if (event.key === 'Escape' || event.key === 'ArrowLeft') {
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        type='button'
        role='menuitem'
        className={sidebar.profileAction}
        aria-haspopup='menu'
        aria-expanded={expanded}
        aria-controls='carbon-agent-workspace-menu'
        tabIndex={active ? 0 : -1}
        onClick={() => setOpen(true)}
        onKeyDown={event => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            requestAnimationFrame(() =>
              menu.current
                ?.querySelector<HTMLButtonElement>('button:not(:disabled)')
                ?.focus(),
            );
          }
        }}
      >
        <SwapOutlined className={sidebar.profileActionIcon} />
        <span>{teamText('switchCompanyAccount')}</span>
        <Icon
          className={sidebar.profileLanguageArrow}
          src={icons.chevronIcon}
        />
      </button>
      {expanded && (
        <div
          ref={menu}
          className={style.menu}
          id='carbon-agent-workspace-menu'
          role='menu'
          tabIndex={-1}
          aria-label={teamText('chooseAWorkspace')}
          onKeyDown={event => {
            if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key))
              return;
            event.preventDefault();
            const options = Array.from(
              event.currentTarget.querySelectorAll<HTMLButtonElement>(
                'button:not(:disabled)',
              ),
            );
            const current = options.indexOf(
              document.activeElement as HTMLButtonElement,
            );
            const next =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                ? options.length - 1
                : (current +
                    (event.key === 'ArrowDown' ? 1 : -1) +
                    options.length) %
                  options.length;
            options[next]?.focus();
          }}
        >
          <div className={style.title}>{teamText('chooseAWorkspace')}</div>
          {spaces.isLoading && (
            <div className={style.hint} role='status'>
              {teamText('loadingWorkspaces')}
            </div>
          )}
          {spaces.isError && (
            <button
              type='button'
              className={style.retry}
              onClick={() => spaces.refetch()}
            >
              {teamText('failedToLoadWorkspacesRetry')}
            </button>
          )}
          {spaces.isSuccess && !rows.length && (
            <div className={style.hint}>
              {teamText('noOtherWorkspacesAvailable')}
            </div>
          )}
          <div className={style.list}>
            {rows.map(space => {
              const personal = space.workspaceType === 'PERSONAL';
              const selected =
                String(space.companyId) === String(access.companyId);
              return (
                <button
                  key={space.companyId}
                  type='button'
                  role='menuitemradio'
                  aria-checked={selected}
                  disabled={!space.canEnter}
                  className={`${style.option} ${
                    selected ? style.selected : ''
                  }`}
                  onClick={() => {
                    onSelect();
                    if (!selected) switchSpace(String(space.companyId));
                  }}
                >
                  <span className={style.avatar} aria-hidden='true'>
                    {personal ? teamText('me') : space.companyName.slice(0, 1)}
                  </span>
                  <span className={style.identity}>
                    <strong>
                      {personal
                        ? teamText('personalWorkspace')
                        : space.companyName}
                    </strong>
                    <small>
                      {!space.canEnter
                        ? reasonText(space.reasonCode)
                        : personal
                        ? teamText('myPersonalAccount')
                        : teamText('teamAccount')}
                    </small>
                  </span>
                  {selected && (
                    <CheckOutlined
                      className={style.check}
                      aria-label={teamText('currentWorkspace')}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
