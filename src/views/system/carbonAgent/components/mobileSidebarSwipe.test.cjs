const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

class ElementStub {
  constructor() {
    this.dataset = {};
    this.properties = new Map();
    this.listeners = new Map();
    this.listenerOptions = new Map();
    this.captured = new Set();
    this.style = {
      setProperty: (key, value) => this.properties.set(key, value),
      removeProperty: key => this.properties.delete(key),
    };
  }
  closest() {
    return null;
  }
  getBoundingClientRect() {
    return { width: 300 };
  }
  hasPointerCapture(id) {
    return this.captured.has(id);
  }
  setPointerCapture(id) {
    this.captured.add(id);
  }
  releasePointerCapture(id) {
    this.captured.delete(id);
  }
  addEventListener(type, listener, options) {
    this.listeners.set(type, listener);
    this.listenerOptions.set(type, options);
  }
  removeEventListener(type, listener) {
    if (this.listeners.get(type) === listener) this.listeners.delete(type);
  }
  emit(type, values = {}) {
    const event = {
      target: this,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
      button: 0,
      clientX: 250,
      clientY: 400,
      detail: 1,
      cancelable: true,
      preventDefault() {},
      stopPropagation() {},
      ...values,
    };
    this.listeners.get(type)?.(event);
  }
}

const filename = path.join(__dirname, 'mobileSidebarSwipe.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});
const context = {
  exports: {},
  Element: ElementStub,
  window: { getComputedStyle: () => ({ transform: 'none' }) },
};
vm.runInNewContext(compiled.outputText, context, { filename });

function setup() {
  const drawer = new ElementStub();
  const layer = new ElementStub();
  let closes = 0;
  const dispose = context.exports.bindMobileSidebarSwipe(drawer, layer, () => {
    closes += 1;
  });
  return {
    drawer,
    layer,
    dispose,
    closes: () => closes,
    offset: () =>
      Number.parseFloat(layer.properties.get('--mobile-sidebar-offset')),
  };
}

test('capture transferred from a menu child must keep following the pointer', () => {
  const fixture = setup();
  const child = new ElementStub();
  fixture.drawer.emit('pointerdown', { target: child });
  fixture.drawer.emit('pointermove', { target: child, clientX: 230 });
  assert.equal(fixture.offset(), -20);
  // A child capture-loss event must not cancel capture on the drawer.
  fixture.drawer.emit('lostpointercapture', { target: child });
  fixture.drawer.emit('pointermove', { clientX: 130 });
  assert.equal(fixture.offset(), -120);
  assert.equal(fixture.layer.dataset.gesture, 'dragging');
  assert.equal(fixture.closes(), 0);
  fixture.drawer.emit('pointerup', { clientX: 130 });
  assert.equal(fixture.closes(), 1);
  fixture.dispose();
});

test('unrelated pointer cancellation cannot interrupt the active drag', () => {
  const fixture = setup();
  fixture.drawer.emit('pointerdown');
  fixture.drawer.emit('pointermove', { clientX: 220 });
  fixture.drawer.emit('pointercancel', { pointerId: 2 });
  fixture.drawer.emit('pointermove', { clientX: 190 });
  assert.equal(fixture.offset(), -60);
  fixture.drawer.emit('pointerup', { clientX: 190 });
  assert.equal(fixture.closes(), 0);
  assert.equal(fixture.offset(), 0);
  fixture.dispose();
});

test('genuine loss of drawer capture cancels and returns to the open position', () => {
  const fixture = setup();
  fixture.drawer.emit('pointerdown');
  fixture.drawer.emit('pointermove', { clientX: 130 });
  fixture.drawer.releasePointerCapture(1);
  fixture.drawer.emit('lostpointercapture');
  assert.equal(fixture.offset(), 0);
  fixture.drawer.emit('pointerup', { clientX: 100 });
  assert.equal(fixture.closes(), 0);
  fixture.dispose();
});

test('dragging back below the distance threshold rebounds instead of closing', () => {
  const fixture = setup();
  fixture.drawer.emit('pointerdown');
  fixture.drawer.emit('pointermove', { clientX: 100 });
  fixture.drawer.emit('pointermove', { clientX: 220 });
  assert.equal(fixture.offset(), -30);
  fixture.drawer.emit('pointerup', { clientX: 220 });
  assert.equal(fixture.offset(), 0);
  assert.equal(fixture.closes(), 0);
  fixture.dispose();
});

test('vertical scrolling does not move the drawer or capture the pointer', () => {
  const fixture = setup();
  fixture.drawer.emit('pointerdown');
  fixture.drawer.emit('pointermove', { clientX: 240, clientY: 450 });
  fixture.drawer.emit('pointermove', { clientX: 100, clientY: 460 });
  fixture.drawer.emit('pointerup', { clientX: 100, clientY: 460 });
  assert.equal(fixture.layer.dataset.gesture, undefined);
  assert.equal(fixture.drawer.hasPointerCapture(1), false);
  assert.equal(fixture.closes(), 0);
  fixture.dispose();
  assert.equal(fixture.drawer.listeners.size, 0);
});

test('normal taps and keyboard clicks keep their default behavior', () => {
  const fixture = setup();
  let prevented = 0;
  fixture.drawer.emit('pointerdown');
  fixture.drawer.emit('pointerup');
  fixture.drawer.emit('click', {
    preventDefault: () => {
      prevented += 1;
    },
  });
  fixture.drawer.emit('click', {
    detail: 0,
    preventDefault: () => {
      prevented += 1;
    },
  });
  assert.equal(prevented, 0);
  fixture.dispose();
});

test('only the click following a mouse drag is suppressed; the next tap still works', () => {
  const fixture = setup();
  let prevented = 0;
  const click = () =>
    fixture.drawer.emit('click', {
      pointerType: 'mouse',
      preventDefault: () => {
        prevented += 1;
      },
    });
  fixture.drawer.emit('pointerdown', { pointerType: 'mouse' });
  fixture.drawer.emit('pointermove', { pointerType: 'mouse', clientX: 220 });
  fixture.drawer.emit('pointerup', { pointerType: 'mouse', clientX: 220 });
  click();
  assert.equal(prevented, 1);
  fixture.drawer.emit('pointerdown', { pointerType: 'mouse' });
  fixture.drawer.emit('pointerup', { pointerType: 'mouse' });
  click();
  assert.equal(prevented, 1);
  assert.equal(fixture.closes(), 0);
  fixture.dispose();
});

function touchEvent(fixture, type, x = 250, y = 400, extra = {}) {
  let prevented = false;
  const touch = { identifier: 7, clientX: x, clientY: y };
  fixture.drawer.emit(type, {
    touches: type === 'touchend' || type === 'touchcancel' ? [] : [touch],
    changedTouches: [touch],
    preventDefault: () => { prevented = true; },
    ...extra,
  });
  return prevented;
}

test('horizontal touch prevents native scrolling and survives pointer cancellation', () => {
  const fixture = setup();
  assert.equal(fixture.drawer.listenerOptions.get('touchmove').passive, false);
  fixture.drawer.emit('pointerdown', { pointerType: 'touch' });
  touchEvent(fixture, 'touchstart');
  fixture.drawer.emit('pointermove', { pointerType: 'touch', clientX: 220 });
  assert.equal(fixture.layer.dataset.gesture, undefined);
  assert.equal(touchEvent(fixture, 'touchmove', 220, 402), true);
  assert.equal(fixture.offset(), -30);
  fixture.drawer.emit('pointercancel', { pointerType: 'touch' });
  fixture.drawer.emit('lostpointercapture', { pointerType: 'touch' });
  assert.equal(fixture.offset(), -30);
  // Once horizontal, diagonal movement must not switch back to list scrolling.
  assert.equal(touchEvent(fixture, 'touchmove', 130, 520), true);
  assert.equal(fixture.offset(), -120);
  assert.equal(fixture.closes(), 0);
  touchEvent(fixture, 'touchend', 130, 520);
  assert.equal(fixture.closes(), 1);
  fixture.dispose();
});

test('vertical touch stays with native scrolling even after moving sideways', () => {
  const fixture = setup();
  touchEvent(fixture, 'touchstart');
  assert.equal(touchEvent(fixture, 'touchmove', 248, 360), false);
  assert.equal(touchEvent(fixture, 'touchmove', 100, 350), false);
  touchEvent(fixture, 'touchend', 100, 350);
  assert.equal(fixture.layer.dataset.gesture, undefined);
  assert.equal(fixture.closes(), 0);
  // A new gesture after scrolling can still close the drawer.
  touchEvent(fixture, 'touchstart');
  assert.equal(touchEvent(fixture, 'touchmove', 120), true);
  touchEvent(fixture, 'touchend', 120);
  assert.equal(fixture.closes(), 1);
  fixture.dispose();
});

test('an already scrolling touch does not start moving the drawer', () => {
  const fixture = setup();
  touchEvent(fixture, 'touchstart');
  assert.equal(touchEvent(fixture, 'touchmove', 120, 400, { cancelable: false }), false);
  touchEvent(fixture, 'touchend', 120);
  assert.equal(fixture.layer.dataset.gesture, undefined);
  assert.equal(fixture.closes(), 0);
  fixture.dispose();
});

test('short touch drag rebounds only on release and suppresses its click', () => {
  const fixture = setup();
  touchEvent(fixture, 'touchstart');
  touchEvent(fixture, 'touchmove', 220);
  assert.equal(fixture.offset(), -30);
  assert.equal(fixture.layer.dataset.gesture, 'dragging');
  touchEvent(fixture, 'touchend', 220);
  assert.equal(fixture.offset(), 0);
  assert.equal(fixture.layer.dataset.gesture, 'settling');
  let prevented = false;
  fixture.drawer.emit('click', { preventDefault: () => { prevented = true; } });
  assert.equal(prevented, true);
  touchEvent(fixture, 'touchstart');
  touchEvent(fixture, 'touchend');
  prevented = false;
  fixture.drawer.emit('click', { preventDefault: () => { prevented = true; } });
  assert.equal(prevented, false);
  fixture.dispose();
});

test('real touch cancellation and additional fingers safely settle the drawer', () => {
  for (const cancelType of ['touchcancel', 'touchstart']) {
    const fixture = setup();
    touchEvent(fixture, 'touchstart');
    touchEvent(fixture, 'touchmove', 120);
    touchEvent(fixture, cancelType, 120, 400, cancelType === 'touchstart' ? {
      touches: [{ identifier: 7 }, { identifier: 8 }],
    } : {});
    assert.equal(fixture.offset(), 0);
    touchEvent(fixture, 'touchend', 120);
    assert.equal(fixture.closes(), 0);
    fixture.dispose();
    assert.equal(fixture.drawer.listeners.size, 0);
  }
});
