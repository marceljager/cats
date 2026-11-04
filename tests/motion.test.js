// the shared scroll listener, the parallax and the spring actions (viewport.js, parallax.js,
// springs.js), with a fake window: when they run and what they hand on, not how things look
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

let listeners;
let frames;
let reduce;
beforeEach(() => {
  vi.resetModules();
  listeners = {};
  frames = [];
  reduce = false;
  vi.stubGlobal('addEventListener', (type, fn) => (listeners[type] ??= new Set()).add(fn));
  vi.stubGlobal('removeEventListener', (type, fn) => listeners[type]?.delete(fn));
  vi.stubGlobal('requestAnimationFrame', (fn) => frames.push(fn));
  vi.stubGlobal('cancelAnimationFrame', () => {});
  vi.stubGlobal('innerHeight', 800);
  vi.stubGlobal('matchMedia', (q) => ({ matches: q.includes('reduce') ? reduce : true, addEventListener() {}, removeEventListener() {} }));
});
afterEach(() => vi.unstubAllGlobals());
const fire = (type) => listeners[type]?.forEach((fn) => fn());
const nextFrame = () => frames.splice(0).forEach((fn) => fn());

describe('viewport', () => {
  test('any number of scroll events in a frame run each subscriber once', async () => {
    const { onScrollFrame } = await import('../src/lib/motion/viewport.js');
    const seen = vi.fn();
    const stop = onScrollFrame(seen);
    fire('scroll');
    fire('scroll');
    fire('resize');
    nextFrame();
    expect(seen).toHaveBeenCalledTimes(1);
    stop();
    expect(listeners.scroll.size).toBe(0);
  });
  test('onScreen and reducedMotion ask the window', async () => {
    const { onScreen, reducedMotion } = await import('../src/lib/motion/viewport.js');
    const at = (top, bottom) => ({ getBoundingClientRect: () => ({ top, bottom }) });
    expect(onScreen(at(100, 300))).toBe(true);
    expect(onScreen(at(900, 1000))).toBe(false);
    expect(onScreen(at(900, 1000), 200)).toBe(true);
    reduce = true;
    expect(reducedMotion()).toBe(true);
  });
});

describe('parallax', () => {
  // like a real element, its box includes its own translate
  const node = (top) => {
    const el = { style: {} };
    el.getBoundingClientRect = () => {
      const shift = parseFloat((el.style.translate ?? '').split(' ')[1]) || 0;
      return { top: top + shift, bottom: top + shift + 100, height: 100 };
    };
    return el;
  };
  test('drifts by its share of the distance from the middle of the screen, however often it is placed', async () => {
    const { parallax } = await import('../src/lib/motion/parallax.js');
    const el = node(550); // centre 600, 200 below the middle
    const action = parallax(el, 0.1);
    expect(el.style.translate).toBe('0 20.0px');
    fire('scroll');
    nextFrame();
    expect(el.style.translate).toBe('0 20.0px'); // its own drift doesn't feed back
    action.update({ speed: -0.05 });
    expect(el.style.translate).toBe('0 -10.0px');
    action.destroy();
    expect(el.style.translate).toBe('');
  });
  test('stays put with reduced motion, and starts moving once it is switched off', async () => {
    reduce = true;
    const { parallax } = await import('../src/lib/motion/parallax.js');
    const el = node(550);
    const action = parallax(el, 0.1);
    expect(el.style.translate).toBe('');
    reduce = false;
    fire('scroll');
    nextFrame();
    expect(el.style.translate).toBe('0 20.0px');
    action.destroy();
  });
});

describe('springs', () => {
  const element = () => {
    const on = {};
    return { on, style: {}, offsetWidth: 100, addEventListener: (t, fn) => (on[t] = fn), removeEventListener: (t) => delete on[t], querySelector: () => null, matches: () => false };
  };
  test('swing pushes on pointing and takes new options at once', async () => {
    const animate = vi.fn();
    vi.doMock('motion', () => ({ animate, hover: () => () => {}, press: () => () => {}, scroll: () => () => {}, motionValue: () => ({}) }));
    const { swing } = await import('../src/lib/motion/springs.js');
    const el = element();
    const action = swing(el, { stiffness: 190, cooldown: 0 });
    el.on.pointerenter({ movementX: 4 });
    expect(animate.mock.calls[0][2]).toMatchObject({ type: 'spring', stiffness: 190, velocity: 150 + 4 * 14 });
    action.update({ stiffness: 90, base: 50, cooldown: 0 });
    el.on.pointerenter({ movementX: -2 });
    expect(animate.mock.calls[1][2]).toMatchObject({ stiffness: 90, velocity: -(50 + 2 * 14) });
    action.destroy();
    expect(el.on.pointerenter).toBeUndefined();
    vi.doUnmock('motion');
  });
  test('nothing swings with reduced motion', async () => {
    reduce = true;
    const animate = vi.fn();
    vi.doMock('motion', () => ({ animate, hover: () => () => {}, press: () => () => {}, scroll: () => () => {}, motionValue: () => ({}) }));
    const { swing, pop } = await import('../src/lib/motion/springs.js');
    const el = element();
    swing(el, { cooldown: 0 });
    el.on.pointerenter({ movementX: 4 });
    pop(el, { scale: [1, 1.2, 1] });
    expect(animate).not.toHaveBeenCalled();
    vi.doUnmock('motion');
  });
  const motion = (extra = {}) => {
    const animate = vi.fn(() => Promise.resolve());
    const scroll = vi.fn(() => () => {});
    vi.doMock('motion', () => ({ animate, hover: () => () => {}, press: () => () => {}, scroll, motionValue: () => ({}), ...extra }));
    return { animate, scroll };
  };
  test('springTo lands the first target at once, ignores a repeat and springs to a new one', async () => {
    const { animate } = motion();
    const { springTo } = await import('../src/lib/motion/springs.js');
    const el = element();
    const action = springTo(el, { to: { y: 0 } });
    expect(animate.mock.calls[0][2]).toEqual({ duration: 0 });
    action.update({ to: { y: 0 } });
    expect(animate).toHaveBeenCalledTimes(1);
    action.update({ to: { y: 10 }, bounce: 0.5 });
    // as one transform, so Motion can run the spring on the compositor
    expect(animate.mock.calls[1][1]).toEqual({ transform: 'translateX(0px) translateY(10px) scale(1) rotate(0deg)' });
    expect(animate.mock.calls[1][2]).toMatchObject({ type: 'spring', bounce: 0.5 });
    vi.doUnmock('motion');
  });
  test('asTransform folds x / y / scale / rotate into one transform, keyframes too, and leaves SVG and other keys alone', async () => {
    const { asTransform } = await import('../src/lib/motion/springs.js');
    expect(asTransform({ opacity: [0, 1], scale: [0.5, 1] })).toEqual({ opacity: [0, 1], transform: ['translateX(0px) translateY(0px) scale(0.5) rotate(0deg)', 'translateX(0px) translateY(0px) scale(1) rotate(0deg)'] });
    expect(asTransform({ y: [0, 5, 0], scaleX: [1, 1.06, 1] })).toEqual({ y: [0, 5, 0], scaleX: [1, 1.06, 1] });
    expect(asTransform({ x: [0, 1], y: [0, 1, 2] })).toEqual({ x: [0, 1], y: [0, 1, 2] });
    expect(asTransform({ opacity: 0 })).toEqual({ opacity: 0 });
    class SVGElement {}
    vi.stubGlobal('SVGElement', SVGElement);
    expect(asTransform({ y: 4 }, /** @type {any} */ (new SVGElement()))).toEqual({ y: 4 });
    vi.unstubAllGlobals();
  });
  test('scrollLinked follows the scroll only where its media query matches, and rests elsewhere', async () => {
    const { animate, scroll } = motion();
    const { scrollLinked } = await import('../src/lib/motion/springs.js');
    const opts = { keyframes: { y: [10, -10] }, rest: { y: 0 } };
    scrollLinked(element(), { ...opts, media: '(min-width: 760px)' }); // matchMedia matches here
    expect(scroll).toHaveBeenCalledOnce();
    // as transforms, so the scroll-linked animation can run on the browser's own scroll timeline
    expect(animate.mock.calls[0][1]).toEqual({ transform: ['translateX(0px) translateY(10px) scale(1) rotate(0deg)', 'translateX(0px) translateY(-10px) scale(1) rotate(0deg)'] });
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
    scrollLinked(element(), { ...opts, media: '(min-width: 760px)' });
    expect(scroll).toHaveBeenCalledOnce();
    expect(animate).toHaveBeenLastCalledWith(expect.anything(), { transform: 'translateX(0px) translateY(0px) scale(1) rotate(0deg)' }, { duration: 0 });
    vi.doUnmock('motion');
  });
  test('rub pushes on a tap, but not further once it leans past its limit', async () => {
    let angle = 0;
    const rot = { get: () => angle, getVelocity: () => 0, on: () => () => {}, stop() {} };
    const { animate } = motion({ motionValue: () => rot });
    const { rub } = await import('../src/lib/motion/springs.js');
    const el = element();
    el.getBoundingClientRect = () => ({ left: 0, width: 100 });
    rub(el, { lean: 20, base: 150 });
    el.on.pointerdown({ pointerType: 'touch', clientX: 20 }); // left half: pushes to the right
    expect(animate).toHaveBeenCalledOnce();
    expect(animate.mock.calls[0][2]).toMatchObject({ velocity: 150 });
    angle = 25; // already leaning that way past 20
    el.on.pointerdown({ pointerType: 'touch', clientX: 20 });
    expect(animate).toHaveBeenCalledOnce();
    vi.doUnmock('motion');
  });
});

