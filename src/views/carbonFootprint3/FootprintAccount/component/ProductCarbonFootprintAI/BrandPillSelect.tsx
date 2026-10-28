import { DownOutlined } from '@ant-design/icons';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import style from './BrandPillSelect.module.less';

export interface BrandPillOption {
  value: string;
  label: string;
}

export type BrandPillKey = 'scope' | 'factor';

interface BrandPillSelectProps {
  pillKey: BrandPillKey;
  openPill: BrandPillKey | null;
  setOpenPill: (key: BrandPillKey | null) => void;
  value: string;
  onChange: (value: string) => void;
  options: BrandPillOption[];
  allowEmpty?: boolean;
  placeholder?: string;
  disabled?: boolean;
  'aria-label': string;
  triggerClassName?: string;
  placement?: 'bottom' | 'top';
}

export default function BrandPillSelect({
  pillKey,
  openPill,
  setOpenPill,
  value,
  onChange,
  options,
  allowEmpty = false,
  placeholder = '',
  disabled = false,
  'aria-label': ariaLabel,
  triggerClassName = '',
  placement = 'bottom',
}: BrandPillSelectProps) {
  const open = openPill === pillKey;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const panelRows = useMemo(() => {
    const rows: { value: string; label: string; muted?: boolean }[] = [];
    if (allowEmpty && placeholder) {
      rows.push({ value: '', label: placeholder, muted: true });
    }
    options.forEach(o => rows.push({ value: o.value, label: o.label }));
    return rows;
  }, [allowEmpty, placeholder, options]);

  const displayLabel = useMemo(() => {
    if (value === '' && placeholder) return placeholder;
    return options.find(o => o.value === value)?.label ?? placeholder;
  }, [value, options, placeholder]);

  const updateCoords = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = Math.max(r.width, 136);
    const maxLeft = Math.max(8, window.innerWidth - width - 8);
    setCoords({
      top: placement === 'top' ? r.top - 6 : r.bottom + 6,
      left: Math.min(Math.max(8, r.left), maxLeft),
      width,
    });
  }, [placement]);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return undefined;
    }
    updateCoords();
    const onScrollOrResize = () => updateCoords();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open, updateCoords]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onPointerDown = (e: MouseEvent | PointerEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) {
        return;
      }
      setOpenPill(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenPill(null);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, setOpenPill]);

  const toggle = () => {
    if (disabled) return;
    setOpenPill(open ? null : pillKey);
  };

  const selectValue = (v: string) => {
    onChange(v);
    setOpenPill(null);
  };

  const panel =
    open && coords && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={panelRef}
            role='listbox'
            aria-label={ariaLabel}
            className={style.panel}
            style={{
              top: coords.top,
              left: coords.left,
              minWidth: coords.width,
              transform: placement === 'top' ? 'translateY(-100%)' : undefined,
            }}
          >
            {panelRows.map(row => {
              const selected = row.value === value;
              return (
                <button
                  key={`${pillKey}-${row.value || '__empty'}`}
                  type='button'
                  role='option'
                  aria-selected={selected}
                  onClick={() => selectValue(row.value)}
                  className={[
                    style.option,
                    row.muted ? style.optionMuted : '',
                    selected ? style.optionSelected : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {row.label}
                </button>
              );
            })}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type='button'
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup='listbox'
        aria-expanded={open}
        onClick={toggle}
        className={[
          style.trigger,
          open ? style.triggerOpen : '',
          triggerClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span
          className={[
            style.label,
            value === '' && placeholder ? style.labelMuted : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {displayLabel}
        </span>
        <span className={style.chevron} aria-hidden>
          <DownOutlined />
        </span>
      </button>
      {panel}
    </>
  );
}
