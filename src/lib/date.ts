/** Device-local yyyy-mm-dd, used for streak bookkeeping (not UTC — a streak
 *  should follow the learner's calendar day, not the server's). */
export function todayLocalISO(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isYesterday(iso: string, today = todayLocalISO()): boolean {
  const [y, m, d] = today.split('-').map(Number);
  const yesterday = new Date(y, m - 1, d - 1);
  return iso === todayLocalISO(yesterday);
}
