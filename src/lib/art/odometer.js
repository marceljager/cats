// @ts-check
// how far the car has come: along the route as the page scrolls, and in kilometres from the forest
// Both take what is asked about first, then what it is looked up in.

// how far along the route the reading line at y is: piecewise between keypoints (the route's
// length where it reaches each y), and the whole length (total) past the last one
/** @param {number} y @param {{ y: number, len: number }[]} keypoints @param {number} total */
export function lengthAt(y, keypoints, total) {
  for (let i = 1; i < keypoints.length; i++) {
    const a = keypoints[i - 1];
    const b = keypoints[i];
    if (y <= b.y) {
      const f = b.y === a.y ? 1 : Math.max(0, (y - a.y) / (b.y - a.y));
      return a.len + (b.len - a.len) * f;
    }
  }
  return total;
}

// kilometres from the forest at length `along` the route, interpolated between the stops' pins
// (pinLens: the route's length at each pin); 0 with no stops
/** @param {number} along @param {number[]} pinLens @param {{ km: number }[]} stops */
export function kmAt(along, pinLens, stops) {
  if (!stops.length) return 0;
  if (!pinLens.length || along <= pinLens[0]) return stops[0].km;
  for (let i = 1; i < pinLens.length; i++) {
    if (along <= pinLens[i]) {
      const f = (along - pinLens[i - 1]) / (pinLens[i] - pinLens[i - 1] || 1);
      return Math.round(stops[i - 1].km + (stops[i].km - stops[i - 1].km) * f);
    }
  }
  return stops[stops.length - 1].km;
}
