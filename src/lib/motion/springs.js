// @ts-check
// Spring-physics helpers on Motion, shared by every interactive animation on the page,
// so everything that moves when you touch it moves the same, natural way.
import { animate, hover, press, scroll, motionValue } from 'motion';
import { onScrollFrame, reducedMotion } from './viewport.js';

// how a pendulum swings back to hanging straight; stiffness and damping can be tuned per use
/** @returns {import('motion').ValueAnimationTransition} */
const pendulum = (opts) => ({ type: 'spring', stiffness: opts.stiffness ?? 160, damping: opts.damping ?? 4.5, mass: 0.9 });

// Scroll sway: while the page scrolls, everything that opted in and is on screen leans with the
// scroll's speed (as if dragged through the air); when scrolling stops it swings back to rest.
const swayers = new Map(); // node -> { lean, rest, visible, leaning, k }
let io = null;
let stopSway = null;
let lastY = 0;
let lastT = 0;
let still = 0;

function sway() {
  if (reducedMotion()) return;
  const now = performance.now();
  const y = scrollY;
  const v = (y - lastY) / Math.max(now - lastT, 8); // px per ms
  lastY = y;
  lastT = now;
  const angle = Math.max(-9, Math.min(9, v * 4));
  for (const it of swayers.values()) {
    if (!it.visible) continue;
    it.lean(angle * it.k);
    it.leaning = true;
  }
  clearTimeout(still);
  // let go of everything that was leaning, even if it has just scrolled out of view
  still = setTimeout(() => {
    for (const it of swayers.values()) {
      if (!it.leaning) continue;
      it.rest();
      it.leaning = false;
    }
  }, 90);
}
function joinSway(node, lean, rest) {
  io ??= new IntersectionObserver((entries) => {
    for (const e of entries) {
      const it = swayers.get(e.target);
      if (it) it.visible = e.isIntersecting;
    }
  });
  // each one hangs a little differently, so they never move in lockstep
  swayers.set(node, { lean, rest, visible: false, leaning: false, k: 0.75 + Math.random() * 0.5 });
  io.observe(node);
  if (swayers.size === 1) {
    lastY = scrollY;
    lastT = performance.now();
    stopSway = onScrollFrame(sway);
  }
  return () => {
    io.unobserve(node);
    swayers.delete(node);
    if (swayers.size === 0) stopSway();
  };
}

// Pendulum: pointing at the element gives it a push in the direction the pointer was moving;
// it swings on its pivot (set transform-origin in CSS) and settles back to rest.
//   use:swing                       swings the node itself
//   use:swing={{ target: '.x' }}    listens on the node, swings a child
//   use:swing={{ scroll: true }}    also leans while the page scrolls, and swings back when it stops
// Options are read at every push, so changing them takes effect at once.
export function swing(node, opts = {}) {
  const target = () => (opts.target && node.querySelector(opts.target)) || node;
  // a swinging element can slide out from under the pointer and back, re-triggering itself;
  // so a new push only lands once the last one has had time to swing
  let lastPush = 0;
  const enter = (e) => {
    if (reducedMotion()) return;
    const now = performance.now();
    if (now - lastPush < (opts.cooldown ?? 900)) return;
    lastPush = now;
    const dir = e.movementX ? Math.sign(e.movementX) : e.offsetX < node.offsetWidth / 2 ? 1 : -1;
    const push = dir * Math.min(opts.max ?? 360, (opts.base ?? 150) + Math.abs(e.movementX || 0) * 14);
    animate(target(), { rotate: 0 }, { ...pendulum(opts), velocity: push });
  };
  node.addEventListener('pointerenter', enter);
  let leaveSway = null;
  const syncSway = () => {
    if (opts.scroll && !leaveSway) {
      leaveSway = joinSway(
        node,
        // follow the scroll: a soft spring towards the lean, keeping whatever swing it already has
        (angle) => animate(target(), { rotate: angle * (opts.scrollScale ?? 1) }, { type: 'spring', stiffness: 120, damping: 14 }),
        // scrolling stopped: let go, and it swings back to hang straight
        () => animate(target(), { rotate: 0 }, pendulum(opts)),
      );
    } else if (!opts.scroll && leaveSway) {
      leaveSway();
      leaveSway = null;
    }
  };
  syncSway();
  return {
    update(o) {
      opts = o ?? {};
      syncSway();
    },
    destroy() {
      node.removeEventListener('pointerenter', enter);
      leaveSway?.();
    },
  };
}

// Rub: a pendulum you can keep going. Every move of the mouse across the element adds a push in
// the direction it moves, on top of the swing it already has (a push against the swing slows it
// down), so you can keep a bobblehead going by stroking it. A pointer standing still sends no
// moves, so the element swinging under it can't set itself off; touch gets one push per tap.
//   use:rub={{ base, max, lean, stiffness, damping }}
export function rub(node, opts = {}) {
  const rot = motionValue(0);
  const off = rot.on('change', (v) => (node.style.rotate = `${v}deg`));
  const push = (v) => {
    // already leaning far that way: don't wind it up any further
    if (Math.sign(v) === Math.sign(rot.get()) && Math.abs(rot.get()) > (opts.lean ?? 28)) return;
    const max = opts.max ?? 360;
    const velocity = Math.max(-max, Math.min(max, rot.getVelocity() + v));
    animate(rot, 0, { ...pendulum(opts), velocity });
  };
  // how far the pointer went since the last push (movementX is unreliable across browsers)
  let last = 0;
  let fromX = null;
  const move = (e) => {
    if (reducedMotion() || e.pointerType !== 'mouse') return;
    fromX ??= e.clientX;
    const dx = e.clientX - fromX;
    const now = performance.now();
    if (Math.abs(dx) < 2 || now - last < 60) return;
    last = now;
    fromX = e.clientX;
    push(Math.sign(dx) * Math.min((opts.max ?? 360) * 0.6, (opts.base ?? 150) * 0.4 + Math.abs(dx) * 9));
  };
  const tap = (e) => {
    if (reducedMotion() || e.pointerType === 'mouse') return;
    push((e.offsetX < node.getBBox?.().width / 2 ? 1 : -1) * (opts.base ?? 150));
  };
  const enter = (e) => (fromX = e.clientX);
  node.addEventListener('pointerenter', enter);
  node.addEventListener('pointermove', move);
  node.addEventListener('pointerdown', tap);
  return {
    update(o) {
      opts = o ?? {};
    },
    destroy() {
      node.removeEventListener('pointerenter', enter);
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerdown', tap);
      off();
      rot.stop();
    },
  };
}

// Bouncy control: springs up on hover and squashes on press.
//   rest / over / down are Motion value maps, e.g. { rotate: -2 }, { rotate: -4, x: 6 }, { scale: 0.95 }
export function bouncy(node, opts = {}) {
  let rest, over, down;
  const configure = (o) => {
    rest = { scale: 1, rotate: 0, x: 0, y: 0, ...o.rest };
    over = { ...rest, scale: 1.04, rotate: (rest.rotate ?? 0) - 1.5, y: -2, ...o.over };
    down = { ...over, scale: 0.95, y: 1, ...o.down };
  };
  /** @type {import('motion').AnimationOptions} */
  const sp = { type: 'spring', stiffness: 520, damping: 18 };
  configure(opts);
  animate(node, rest, { duration: 0 });
  if (reducedMotion()) return {};
  const offHover = hover(node, () => {
    animate(node, over, sp);
    return () => animate(node, rest, sp);
  });
  const offPress = press(node, () => {
    animate(node, down, { type: 'spring', stiffness: 700, damping: 22 });
    return () => animate(node, node.matches(':hover') ? over : rest, sp);
  });
  return {
    update(o) {
      configure(o ?? {});
      animate(node, node.matches(':hover') ? over : rest, sp);
    },
    destroy() {
      offHover();
      offPress();
    },
  };
}

// Spring to a state: whenever `to` changes the node springs there. The first value is applied
// instantly, so the page renders in place without a jump.
//   use:springTo={{ to: { y: 0, scale: 1 }, bounce: 0.4, duration: 0.5 }}
export function springTo(node, params) {
  let first = true;
  let last = '';
  function run(p) {
    const { to, bounce = 0.35, duration = 0.5, ...extra } = p;
    // the same target arrives on every scroll frame; restarting the spring each time would
    // keep it crawling, so only a real change of target starts a new spring
    const key = JSON.stringify(to);
    if (key === last) return;
    last = key;
    if (first || reducedMotion()) {
      animate(node, to, { duration: 0 });
      first = false;
      return;
    }
    animate(node, to, { type: 'spring', bounce, visualDuration: duration, ...extra });
  }
  run(params);
  return { update: run };
}

// One quick spring "pop" on demand, e.g. a spin or a bounce, then back to rest.
export function pop(el, keyframes, opts = {}) {
  if (!el || reducedMotion()) return;
  return animate(el, keyframes, { type: 'spring', bounce: 0.35, visualDuration: 0.5, ...opts });
}

// Scroll-linked: the node moves through `keyframes` as it travels up through the viewport,
// from entering at the bottom to leaving at the top, following the scroll both ways.
//   use:scrollLinked={{ keyframes: { y: [20, -20] }, offset: ['start end', 'end start'] }}
// `media` limits it to screens that match (e.g. '(min-width: 760px)'); elsewhere, and with reduced
// motion, the node just sits in its `rest` pose
export function scrollLinked(node, opts) {
  let mq = null;
  let stop;
  const sync = () => {
    stop?.();
    stop = undefined;
    const { keyframes, offset = ['start end', 'end start'], rest } = opts;
    if (!mq || mq.matches) stop = scroll(animate(node, keyframes, { ease: 'linear' }), { target: node, offset });
    else animate(node, rest ?? {}, { duration: 0 });
  };
  const configure = () => {
    mq?.removeEventListener('change', sync);
    mq = opts.media ? matchMedia(opts.media) : null;
    mq?.addEventListener('change', sync);
    sync();
  };
  if (reducedMotion()) {
    if (opts.rest) animate(node, opts.rest, { duration: 0 });
    return {};
  }
  configure();
  return {
    update(o) {
      opts = o;
      configure();
    },
    destroy() {
      mq?.removeEventListener('change', sync);
      stop?.();
    },
  };
}
