// @ts-check
// a smooth hand-drawn line through waypoints, for the rivers: a centripetal Catmull-Rom
// spline, which never overshoots into a loop or a hairpin however unevenly the points are spaced
export function smooth(pts) {
  return `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}` + curve(pts).join('');
}

// the same spline as a list of pieces, piece i running from point i to point i + 1
export function curve(pts) {
  const f = (n) => n.toFixed(1);
  const dist = (a, b) => Math.max(Math.hypot(b[0] - a[0], b[1] - a[1]) ** 0.5, 1e-3);
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    // past either end, extend the line straight on
    const p0 = pts[i - 1] ?? [2 * p1[0] - p2[0], 2 * p1[1] - p2[1]];
    const p3 = pts[i + 2] ?? [2 * p2[0] - p1[0], 2 * p2[1] - p1[1]];
    const d1 = dist(p0, p1);
    const d2 = dist(p1, p2);
    const d3 = dist(p2, p3);
    const c1 = [0, 1].map((k) => (d1 * d1 * p2[k] - d2 * d2 * p0[k] + (2 * d1 * d1 + 3 * d1 * d2 + d2 * d2) * p1[k]) / (3 * d1 * (d1 + d2)));
    const c2 = [0, 1].map((k) => (d3 * d3 * p1[k] - d2 * d2 * p3[k] + (2 * d3 * d3 + 3 * d3 * d2 + d2 * d2) * p2[k]) / (3 * d3 * (d3 + d2)));
    out.push(` C ${f(c1[0])} ${f(c1[1])}, ${f(c2[0])} ${f(c2[1])}, ${f(p2[0])} ${f(p2[1])}`);
  }
  return out;
}
