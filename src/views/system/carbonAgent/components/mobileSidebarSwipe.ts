// Touch scrolling and drawer dragging must choose one owner for the gesture.
export const bindMobileSidebarSwipe = (
  drawer: HTMLDivElement,
  layer: HTMLDivElement,
  onClose: () => void,
) => {
  delete layer.dataset.gesture;
  layer.style.removeProperty('--mobile-sidebar-offset');
  layer.style.removeProperty('--mobile-sidebar-opacity');
  let gesture: {
    source: 'pointer' | 'touch';
    pointerId: number;
    x: number;
    y: number;
    horizontal: boolean;
    initialOffset: number;
  } | null = null;
  let suppressClick = false;

  const moveDrawer = (offset: number) => {
    const { width } = drawer.getBoundingClientRect();
    const nextOffset = Math.max(-width, Math.min(0, offset));
    layer.style.setProperty('--mobile-sidebar-offset', `${nextOffset}px`);
    layer.style.setProperty(
      '--mobile-sidebar-opacity',
      `${1 + nextOffset / width}`,
    );
    return nextOffset;
  };
  const settleDrawer = () => {
    if (!layer.dataset.gesture) return;
    layer.dataset.gesture = 'settling';
    moveDrawer(0);
  };
  const resetGesture = () => {
    const pointerId =
      gesture?.source === 'pointer' ? gesture.pointerId : undefined;
    gesture = null;
    if (pointerId !== undefined && drawer.hasPointerCapture(pointerId)) {
      drawer.releasePointerCapture(pointerId);
    }
  };
  const cancelGesture = () => {
    if (!gesture) return;
    resetGesture();
    settleDrawer();
  };
  const handlePointerCancel = (event: PointerEvent) => {
    if (gesture?.source === 'pointer' && event.pointerId === gesture.pointerId)
      cancelGesture();
  };
  const handleLostPointerCapture = (event: PointerEvent) => {
    // A child's bubbling capture loss during transfer to the drawer is not
    // a cancellation of the drawer's pointer gesture.
    if (
      event.target !== drawer ||
      gesture?.source !== 'pointer' ||
      event.pointerId !== gesture.pointerId ||
      drawer.hasPointerCapture(event.pointerId)
    )
      return;
    cancelGesture();
  };
  const handlePointerDown = (event: PointerEvent) => {
    // Touch has its own non-passive move listener. Pointer cancellation from
    // native history scrolling must not reset that touch gesture.
    if (event.pointerType === 'touch') return;
    cancelGesture();
    suppressClick = false;
    if (!event.isPrimary || event.button !== 0) return;
    if (
      event.target instanceof Element &&
      event.target.closest(
        'input, textarea, select, [contenteditable="true"], [role="slider"]',
      )
    )
      return;
    gesture = {
      source: 'pointer',
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      horizontal: false,
      initialOffset: 0,
    };
  };
  const moveGesture = (clientX: number, clientY: number) => {
    if (!gesture) return false;
    const deltaX = clientX - gesture.x;
    const deltaY = clientY - gesture.y;
    if (!gesture.horizontal) {
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 10) return false;
      // Lock the direction early so scrolling the history cannot close the drawer.
      if (deltaX >= 0 || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) {
        resetGesture();
        return false;
      }
      const { transform } = window.getComputedStyle(drawer);
      gesture.initialOffset =
        transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m41;
      gesture.horizontal = true;
      layer.dataset.gesture = 'dragging';
      if (gesture.source === 'pointer') {
        drawer.setPointerCapture(gesture.pointerId);
      }
    }
    suppressClick = true;
    moveDrawer(gesture.initialOffset + deltaX);
    return true;
  };
  const finishGesture = (clientX: number) => {
    if (!gesture) return;
    const offset = gesture.horizontal
      ? moveDrawer(gesture.initialOffset + clientX - gesture.x)
      : 0;
    const shouldClose = -offset >= drawer.getBoundingClientRect().width * 0.3;
    resetGesture();
    if (shouldClose) {
      layer.dataset.gesture = 'settling';
      onClose();
    } else {
      settleDrawer();
    }
  };
  const handlePointerMove = (event: PointerEvent) => {
    if (gesture?.source !== 'pointer' || event.pointerId !== gesture.pointerId)
      return;
    if (moveGesture(event.clientX, event.clientY)) event.preventDefault();
  };
  const handlePointerUp = (event: PointerEvent) => {
    if (gesture?.source === 'pointer' && event.pointerId === gesture.pointerId)
      finishGesture(event.clientX);
  };
  const handleTouchStart = (event: TouchEvent) => {
    cancelGesture();
    suppressClick = false;
    if (event.touches.length !== 1) return;
    if (
      event.target instanceof Element &&
      event.target.closest(
        'input, textarea, select, [contenteditable="true"], [role="slider"]',
      )
    )
      return;
    const touch = event.touches[0];
    gesture = {
      source: 'touch',
      pointerId: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      horizontal: false,
      initialOffset: 0,
    };
  };
  const handleTouchMove = (event: TouchEvent) => {
    if (gesture?.source !== 'touch') return;
    const touch = Array.from(event.touches).find(
      item => item.identifier === gesture?.pointerId,
    );
    // Once native scrolling has started, leave the entire gesture to it.
    if (!touch || event.touches.length !== 1 || !event.cancelable) {
      cancelGesture();
      return;
    }
    if (moveGesture(touch.clientX, touch.clientY)) {
      // Unlike pointermove, cancelling touchmove prevents the browser from
      // taking over a horizontal drag when the history list can scroll.
      event.preventDefault();
    }
  };
  const handleTouchEnd = (event: TouchEvent) => {
    if (gesture?.source !== 'touch') return;
    const touch = Array.from(event.changedTouches).find(
      item => item.identifier === gesture?.pointerId,
    );
    if (touch) finishGesture(touch.clientX);
  };
  const handleTouchCancel = (event: TouchEvent) => {
    if (
      gesture?.source === 'touch' &&
      Array.from(event.changedTouches).some(
        item => item.identifier === gesture?.pointerId,
      )
    )
      cancelGesture();
  };
  const handleClick = (event: MouseEvent) => {
    if (!suppressClick || event.detail === 0) return;
    suppressClick = false;
    event.preventDefault();
    event.stopPropagation();
  };
  drawer.addEventListener('pointerdown', handlePointerDown);
  drawer.addEventListener('pointermove', handlePointerMove);
  drawer.addEventListener('pointerup', handlePointerUp);
  drawer.addEventListener('pointercancel', handlePointerCancel);
  drawer.addEventListener('lostpointercapture', handleLostPointerCapture);
  drawer.addEventListener('touchstart', handleTouchStart, { passive: true });
  drawer.addEventListener('touchmove', handleTouchMove, { passive: false });
  drawer.addEventListener('touchend', handleTouchEnd);
  drawer.addEventListener('touchcancel', handleTouchCancel);
  drawer.addEventListener('click', handleClick, true);
  return () => {
    drawer.removeEventListener('pointerdown', handlePointerDown);
    drawer.removeEventListener('pointermove', handlePointerMove);
    drawer.removeEventListener('pointerup', handlePointerUp);
    drawer.removeEventListener('pointercancel', handlePointerCancel);
    drawer.removeEventListener('lostpointercapture', handleLostPointerCapture);
    drawer.removeEventListener('touchstart', handleTouchStart);
    drawer.removeEventListener('touchmove', handleTouchMove);
    drawer.removeEventListener('touchend', handleTouchEnd);
    drawer.removeEventListener('touchcancel', handleTouchCancel);
    drawer.removeEventListener('click', handleClick, true);
    resetGesture();
  };
};
