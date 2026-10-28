/* eslint-disable */
//@ts-nocheck
import I18N from '@src/lang/I18N';
import React, { useEffect, useMemo } from 'react';
import classNames from 'classnames';
import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import type { Transform } from '@dnd-kit/utilities';

import { Handle } from './components';

import styles from './Item.module.css';
import { IconAlibabaNew } from '@/components/iconfont';
import { Tooltip } from 'antd';

interface Props {
  dragOverlay?: boolean;
  color?: string;
  disabled?: boolean;
  dragging?: boolean;
  handle?: boolean;
  handleProps?: any;
  height?: number;
  index?: number;
  fadeIn?: boolean;
  transform?: Transform | null;
  listeners?: DraggableSyntheticListeners;
  sorting?: boolean;
  style?: React.CSSProperties;
  transition?: string | null;
  wrapperStyle?: React.CSSProperties;
  value: React.ReactNode;
  allData?: any[];
  type?: 'selected' | 'unselected';
  onRemove?(): void;
  onToggle?(): void;
  renderItem?(args: {
    dragOverlay: boolean;
    dragging: boolean;
    sorting: boolean;
    index: number | undefined;
    fadeIn: boolean;
    listeners: DraggableSyntheticListeners;
    ref: React.Ref<HTMLElement>;
    style: React.CSSProperties | undefined;
    transform: Props['transform'];
    transition: Props['transition'];
    value: Props['value'];
  }): React.ReactElement;
}

export const Item = React.memo(
  React.forwardRef<HTMLLIElement, Props>(
    (
      {
        color,
        dragOverlay,
        dragging,
        disabled,
        fadeIn,
        handle,
        handleProps,
        height,
        index,
        listeners,
        onRemove,
        renderItem,
        sorting,
        style,
        transition,
        transform,
        value,
        allData,
        wrapperStyle,
        onToggle,
        type,
        ...props
      },
      ref,
    ) => {
      const label = useMemo(() => {
        return allData?.find(item => item.productSubId === value)?.functionName;
      }, [allData, value]);

      const iconUrl = useMemo(() => {
        return allData?.find(item => item.productSubId === value)?.iconUrl;
      }, [allData, value]);
      useEffect(() => {
        if (!dragOverlay) {
          return;
        }

        document.body.style.cursor = 'grabbing';

        return () => {
          document.body.style.cursor = '';
        };
      }, [dragOverlay]);

      return renderItem ? (
        renderItem({
          dragOverlay: Boolean(dragOverlay),
          dragging: Boolean(dragging),
          sorting: Boolean(sorting),
          index,
          fadeIn: Boolean(fadeIn),
          listeners,
          ref,
          style,
          transform,
          transition,
          value,
        })
      ) : (
        <li
          className={classNames(
            styles.Wrapper,
            fadeIn && styles.fadeIn,
            sorting && styles.sorting,
            dragOverlay && styles.dragOverlay,
          )}
          style={
            {
              ...wrapperStyle,
              transition: [transition, wrapperStyle?.transition]
                .filter(Boolean)
                .join(', '),
              '--translate-x': transform
                ? `${Math.round(transform.x)}px`
                : undefined,
              '--translate-y': transform
                ? `${Math.round(transform.y)}px`
                : undefined,
              '--scale-x': transform?.scaleX
                ? `${transform.scaleX}`
                : undefined,
              '--scale-y': transform?.scaleY
                ? `${transform.scaleY}`
                : undefined,
              '--index': index,
              '--color': color,
            } as React.CSSProperties
          }
          ref={ref}
        >
          <Tooltip
            title={disabled ? I18N.workbench.defaultFunctionNotAvailable : ''}
          >
            <div
              className={classNames(
                styles.Item,
                dragging && styles.dragging,
                handle && styles.withHandle,
                dragOverlay && styles.dragOverlay,
                disabled && styles.disabled,
                color && styles.color,
              )}
              style={{
                ...style,
                width: '200px',
              }}
              data-cypress='draggable-item'
              {...(!handle ? listeners : undefined)}
              {...props}
              tabIndex={!handle ? 0 : undefined}
            >
              <IconAlibabaNew type={iconUrl} className={styles.icon} />
              <div
                style={{
                  width: '160px',
                  // textWrap: 'ellipsis',
                  // overflow: 'hidden',
                  // textOverflow: 'ellipsis',
                  // textWrap: 'nowrap'
                  textWrap: 'wrap',
                }}
              >
                {label || value}
              </div>

              <span className={styles.Actions}>
                {/* {onRemove ? ( */}
                <div
                  className={styles.remove}
                  onMouseDown={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    // console.log(e)
                    // onRemove(e)
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (disabled) {
                      return;
                    }
                    onToggle(e);
                  }}
                >
                  <IconAlibabaNew
                    className={classNames(styles.icon, {
                      [styles.selected]: type === 'selected',
                    })}
                    type={
                      type === 'selected'
                        ? 'icon-icon-shanchu-saas'
                        : 'icon-icon-tianjia1-saas'
                    }
                  />
                </div>
                {handle ? <Handle {...handleProps} {...listeners} /> : null}
              </span>
            </div>
          </Tooltip>
        </li>
      );
    },
  ),
);
