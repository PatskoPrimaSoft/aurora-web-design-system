// Compare calendar/wall-clock parts directly: no Date, offset or UTC conversion.
export function isRangeReversed({ from, to }) {
  if (!from || !to) return false;
  const parts = value => value.split(/[-T:]/).map(Number);
  const start = parts(from), end = parts(to);
  for (let index = 0; index < Math.max(start.length, end.length); index++) {
    const difference = (start[index] || 0) - (end[index] || 0);
    if (difference) return difference > 0;
  }
  return false;
}
