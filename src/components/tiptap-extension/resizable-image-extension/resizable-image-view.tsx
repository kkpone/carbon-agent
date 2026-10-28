import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import './resizable-image-view.scss';

export const ResizableImageView: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  selected,
}) => {
  const {
    src,
    alt,
    title,
    width: initialWidth,
    height: initialHeight,
  } = node.attrs;
  const [isResizing, setIsResizing] = useState(false);
  const [dimensions, setDimensions] = useState<{
    width: number | null;
    height: number | null;
  }>({
    width: initialWidth || null,
    height: initialHeight || null,
  });
  const imageRef = useRef<HTMLImageElement>(null);
  const startPosRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const aspectRatioRef = useRef(1);
  const [imageLoaded, setImageLoaded] = useState(false);

  // 图片加载完成后，如果没有设置尺寸，则使用原始尺寸
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;

      aspectRatioRef.current = naturalWidth / naturalHeight;

      if (!initialWidth || !initialHeight) {
        // 设置最大宽高限制
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;

        let targetWidth = naturalWidth;
        let targetHeight = naturalHeight;

        // 如果超出上限，等比例缩放
        if (targetWidth > MAX_WIDTH || targetHeight > MAX_HEIGHT) {
          const widthRatio = MAX_WIDTH / targetWidth;
          const heightRatio = MAX_HEIGHT / targetHeight;
          const ratio = Math.min(widthRatio, heightRatio);

          targetWidth = Math.round(targetWidth * ratio);
          targetHeight = Math.round(targetHeight * ratio);
        }

        setDimensions({
          width: targetWidth,
          height: targetHeight,
        });

        updateAttributes({
          width: targetWidth,
          height: targetHeight,
        });
      } else {
        aspectRatioRef.current = initialWidth / initialHeight;
      }

      setImageLoaded(true);
    }
  }, [initialWidth, initialHeight, updateAttributes]);

  useEffect(() => {
    if (initialWidth && initialHeight) {
      setDimensions({
        width: initialWidth,
        height: initialHeight,
      });
      aspectRatioRef.current = initialWidth / initialHeight;
    }
  }, [initialWidth, initialHeight]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!dimensions.width || !dimensions.height) {
        return;
      }

      setIsResizing(true);

      startPosRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: dimensions.width,
        height: dimensions.height,
      };

      let currentDimensions = { ...dimensions };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startPosRef.current.x;
        const deltaY = moveEvent.clientY - startPosRef.current.y;

        // 计算对角线距离作为缩放依据
        const delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const direction = deltaX + deltaY > 0 ? 1 : -1;

        const newWidth = Math.max(
          50,
          startPosRef.current.width + delta * direction,
        );
        const newHeight = newWidth / aspectRatioRef.current;

        currentDimensions = {
          width: Math.round(newWidth),
          height: Math.round(newHeight),
        };

        setDimensions(currentDimensions);
      };

      const handleMouseUp = () => {
        setIsResizing(false);

        // 更新节点属性
        updateAttributes({
          width: currentDimensions.width,
          height: currentDimensions.height,
        });

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [dimensions, updateAttributes],
  );

  return (
    <NodeViewWrapper
      className={`resizable-image-wrapper ${selected ? 'selected' : ''} ${
        isResizing ? 'resizing' : ''
      }`}
      data-drag-handle
    >
      <div className='resizable-image-container'>
        <img
          ref={imageRef}
          src={src}
          alt={alt || ''}
          title={title || ''}
          width={dimensions.width ?? undefined}
          height={dimensions.height ?? undefined}
          onLoad={handleImageLoad}
          className='resizable-image'
          style={{
            width: dimensions.width ? `${dimensions.width}px` : 'auto',
            height: dimensions.height ? `${dimensions.height}px` : 'auto',
          }}
        />
        {selected && imageLoaded && dimensions.width && dimensions.height && (
          <div
            className='resize-handle resize-handle-bottom-right'
            onMouseDown={handleMouseDown}
          >
            <div className='resize-handle-dot' />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};
