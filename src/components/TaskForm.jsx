import { useState } from 'react'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(todayStr())
  const [time, setTime] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await onAdd({ title: title.trim(), date, time })
      setTitle('')
      setTime('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl bg-ink-800 p-4 shadow-card sm:flex-row sm:items-center"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="เพิ่มกิจกรรม เช่น ส่งรายงานประจำเดือน"
        required
        className="min-w-0 flex-1 rounded-xl border border-ink-600 bg-ink-900 px-4 py-3 font-thai text-mist-100 placeholder:text-mist-400 focus:border-ember"
      />
      <div className="flex gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="rounded-xl border border-ink-600 bg-ink-900 px-3 py-3 font-mono text-sm text-mist-100 focus:border-ember"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="rounded-xl border border-ink-600 bg-ink-900 px-3 py-3 font-mono text-sm text-mist-100 focus:border-ember"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-ember px-5 py-3 font-display text-sm font-semibold text-ink-950 transition-colors hover:bg-ember-soft disabled:opacity-50"
      >
        {submitting ? 'กำลังเพิ่ม…' : '+ เพิ่มกิจกรรม'}
      </button>
    </form>
  )
}
