export function getSurgeMultiplier(date: Date): number {
  const hour = date.getHours();

  // Late night (10pm – 5am)
  if (hour >= 22 || hour < 5) {
    return 1.25;
  }

  // Morning rush (6am – 9am)
  if (hour >= 6 && hour < 9) {
    return 1.15;
  }

  // Evening rush (4pm – 7pm)
  if (hour >= 16 && hour < 19) {
    return 1.2;
  }

  return 1; // normal time
}
