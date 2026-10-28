import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import classNames from 'classnames';
import { useRef, useEffect, useState } from 'react';

import { EChatSource, useAICarbonFloating } from './AICarbonContext';
import styles from './AICarbonFloating.module.less';
import { AiDrawerContent } from './AiDrawerContent';
import defaultIcon from './image/default.svg';

const AICarbonFloating: React.FC = () => {
  const {
    isVisible,
    position,
    isDragging,
    isExpanded,
    setPosition,
    setIsDragging,
    toggleExpanded,
    setExpanded,
    needNewChat,
    setAccountId,
    setNeedNewChat,
    extra,
    setExtra,
    setChatSource,
    setTopicId,
    ReferencesText,
    setReferencesText,
    setFromId,
    setInputMenuItems,
    setExtraFunc,
  } = useAICarbonFloating();

  const floatingRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && floatingRef.current) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        // 限制在窗口范围内
        const maxX =
          window.innerWidth - (floatingRef.current.offsetWidth || 20);
        const maxY =
          window.innerHeight - (floatingRef.current.offsetHeight || 20);
        const clampedX = Math.max(0, Math.min(newX, maxX));
        const clampedY = Math.max(0, Math.min(newY, maxY));
        setPosition({ x: clampedX, y: clampedY });
      }
    };
    const handleMouseUp = async () => {
      if (isDragging) {
        // 计算拖动距离
        const dragDistance = Math.sqrt(
          (position.x - dragStartPosition.x) ** 2 +
            (position.y - dragStartPosition.y) ** 2,
        );

        setIsDragging(false);

        // 如果拖动距离小于10px，视为点击
        if (dragDistance < 10) {
          setFromId(undefined);
          setExtraFunc(undefined);
          setInputMenuItems(undefined);
          setChatSource(EChatSource.NORMAL);
          setTopicId(undefined);
          setExpanded(true);
          setAccountId(undefined);
        } else if (floatingRef.current) {
          // 松手后吸附到右侧
          const newX =
            window.innerWidth - (floatingRef.current.offsetWidth || 20);
          setPosition({ x: newX, y: position.y });
        }
      }
    };
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // 禁用文本选择
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      (document.body.style as any).mozUserSelect = 'none';
      (document.body.style as any).msUserSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // 恢复文本选择
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      (document.body.style as any).mozUserSelect = '';
      (document.body.style as any).msUserSelect = '';
    };
  }, [
    isDragging,
    dragOffset,
    setPosition,
    setIsDragging,
    position.y,
    dragStartPosition,
    toggleExpanded,
  ]);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (floatingRef.current) {
        const currentWidth = floatingRef.current.offsetWidth || 20;
        const currentHeight = floatingRef.current.offsetHeight || 100;

        // 确保悬浮窗不会超出窗口边界
        const newX = window.innerWidth - currentWidth;
        const newY = window.innerHeight - currentHeight;

        // 如果位置需要调整，则更新位置
        if (newX !== position.x || newY !== position.y) {
          setPosition({ x: newX, y: newY });
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [position.x, position.y, setPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (floatingRef.current) {
      const rect = floatingRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      // 记录拖动开始位置
      setDragStartPosition({ x: position.x, y: position.y });
      setIsDragging(true);
      // 阻止默认行为，防止文本选择
      e.preventDefault();
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <div
        ref={floatingRef}
        className={classNames(
          `ai-carbon-floating${isExpanded ? ' expanded' : ''}${
            isDragging ? ' dragging' : ''
          }`,
          styles.floating,
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          position: 'fixed',
          zIndex: 1999,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <div className={styles.floatingHeader} onMouseDown={handleMouseDown}>
          <img
            src={defaultIcon}
            alt='default'
            className={styles.floatingHeaderIcon}
          />
          <div className={styles.floatingHeaderTitle}>
            {I18N.components.aiSmallCarbon}
          </div>
        </div>
      </div>
      <Modal
        open={isExpanded}
        footer={null}
        width={490}
        closeIcon={null}
        centered={false}
        title={null}
        destroyOnClose
        mask={false}
        maskClosable={false}
        style={{
          position: 'fixed',
          top: 'auto',
          bottom: 16,
          right: 16,
          zIndex: 19999,
        }}
        classNames={{
          wrapper: styles.wrapper,
        }}
        styles={{
          content: {
            padding: 0,
          },
          body: {
            padding: 0,
          },
          wrapper: {
            width: 0,
            height: 0,
          },
        }}
      >
        <AiDrawerContent
          selectText=''
          ReferencesText={ReferencesText}
          setReferencesText={setReferencesText}
          needNewChat={needNewChat}
          setNeedNewChat={setNeedNewChat}
          selected={false}
          setSelectNone={() => {}}
          extra={extra}
          setExtra={setExtra}
        />
      </Modal>
    </>
  );
};

export default AICarbonFloating;
