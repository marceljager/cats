// @ts-check
// how far the car has come: along the route as the page scrolls, and in kilometres from the forest
// how far along the route the reading line at y is: piecewise between keypoints ([{ y, len }],
// the route's length where it reaches each), and the whole length past the last one
export function lengthAt(keys, y, total) {
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (y <= b.y) {
      const f = b.y === a.y ? 1 : Math.max(0, (y - a.y) / (b.y - a.y));
      return a.len + (b.len - a.len) * f;
    }
  }
  return total;
}

// kilometres from the forest at length L along the route, interpolated between the stops' pins
// (pinLens: the route's length at each pin)
export function kmAt(pinLens, stops, L) {
  if (!pinLens.length || L <= pinLens[0]) return stops[0].km;
  for (let i = 1; i < pinLens.length; i++) {
    if (L <= pinLens[i]) {
      const f = (L - pinLens[i - 1]) / (pinLens[i] - pinLens[i - 1] || 1);
      return Math.round(stops[i - 1].km + (stops[i].km - stops[i - 1].km) * f);
    }
  }
  return stops[stops.length - 1].km;
}
