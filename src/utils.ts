const round = (expr: any) => Math.round(expr);

function timeDifference(current: number, previous: number) {
  const milliSecondsPerMinute = 60 * 1000;
  const milliSecondsPerHour = milliSecondsPerMinute * 60;
  const milliSecondsPerDay = milliSecondsPerHour * 24;
  const milliSecondsPerMonth = milliSecondsPerDay * 30;
  const milliSecondsPerYear = milliSecondsPerDay * 365;

  const elapsed = current - previous;

  if (elapsed < milliSecondsPerMinute / 3) return 'just now';

  if (elapsed < milliSecondsPerMinute) {
    return `less than 1 min ago`;
  } else if (elapsed < milliSecondsPerHour) {
    return `${round(elapsed / milliSecondsPerMinute)} min ago`;
  } else if (elapsed < milliSecondsPerDay) {
    return `${round(elapsed / milliSecondsPerHour)} h ago`;
  } else if (elapsed < milliSecondsPerMonth) {
    return `${round(elapsed / milliSecondsPerDay)} days ago`;
  } else if (elapsed < milliSecondsPerYear) {
    return `${round(elapsed / milliSecondsPerMonth)} mo ago`;
  } else {
    return `${round(elapsed / milliSecondsPerYear)} years ago`;
  }
}

export function timeDifferenceForDate(date: Date) {
  const now = new Date().getTime();
  const updated = new Date(date).getTime();
  return timeDifference(now, updated);
}
