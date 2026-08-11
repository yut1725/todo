// A task's "temperature" — how close it is to its deadline.
// Drives both the grouping headers and the left-edge color bar on each card.

export function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function daysUntil(dateStr) {
  const today = startOfDay(new Date())
  const target = startOfDay(new Date(dateStr))
  return Math.round((target - today) / 86400000)
}

// returns: 'overdue' | 'today' | 'tomorrow' | 'week' | 'later' | 'done'
export function urgencyLevel(task) {
  if (task.status === 'done') return 'done'
  const diff = daysUntil(task.date)
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'today'
  if (diff === 1) return 'tomorrow'
  if (diff <= 7) return 'week'
  return 'later'
}

export const URGENCY_META = {
  overdue: { label: 'เลยกำหนดแล้ว', bar: 'bg-alert', text: 'text-alert-soft' },
  today: { label: 'วันนี้', bar: 'bg-alert', text: 'text-alert-soft' },
  tomorrow: { label: 'พรุ่งนี้', bar: 'bg-ember', text: 'text-ember-soft' },
  week: { label: 'สัปดาห์นี้', bar: 'bg-calm', text: 'text-calm-soft' },
  later: { label: 'ยังอีกไกล', bar: 'bg-mist-400', text: 'text-mist-300' },
  done: { label: 'เสร็จแล้ว', bar: 'bg-done', text: 'text-done-soft' },
}

export function formatThaiDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('th-TH', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
