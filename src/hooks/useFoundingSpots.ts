export function useFoundingSpots() {
  const baseSpots = 68;
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const spotsUsed = Math.min(94, baseSpots + Math.floor(dayOfYear / 3));
  const spotsLeft = 100 - spotsUsed;
  const percentage = spotsUsed;

  return { spotsUsed, spotsLeft, percentage };
}
