function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function computeNextDate(
  frequency: 'daily' | 'weekly' | 'monthly',
  dayOfWeek: number | null,
  dayOfMonth: number | null,
  hours: number,
  minutes: number,
): string | null {
  const now = new Date();

  if (frequency === 'daily') {
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return toLocalDateString(next);
  }

  if (frequency === 'weekly') {
    if (!dayOfWeek || dayOfWeek === 0) return null;
    const selectedDays: number[] = [];
    for (let i = 0; i < 7; i++) {
      if ((dayOfWeek >> i) & 1) selectedDays.push(i);
    }
    if (selectedDays.length === 0) return null;
    const today = now.getDay();
    const sorted = [...selectedDays].sort((a, b) => a - b);
    for (const d of sorted) {
      let diff = d - today;
      if (diff < 0) diff += 7;
      const next = new Date(now);
      next.setDate(next.getDate() + diff);
      next.setHours(hours, minutes, 0, 0);
      if (next > now) return toLocalDateString(next);
    }
    const next = new Date(now);
    next.setDate(next.getDate() + (7 - today + sorted[0]));
    next.setHours(hours, minutes, 0, 0);
    return toLocalDateString(next);
  }

  if (frequency === 'monthly') {
    const day = Math.min(dayOfMonth || 1, 28);
    const next = new Date(now.getFullYear(), now.getMonth(), day, hours, minutes, 0, 0);
    if (next <= now) next.setMonth(next.getMonth() + 1);
    return toLocalDateString(next);
  }

  return null;
}
