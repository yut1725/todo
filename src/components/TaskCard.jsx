import { urgencyLevel, URGENCY_META, formatThaiDate } from '../lib/urgency'

export default function TaskCard({ task, onToggle, onDelete }) {
  const level = urgencyLevel(task)
  const meta = URGENCY_META[level]
  const isDone = task.status === 'done'

  return (
    <li
      className={`group relative flex items-stretch gap-4 overflow-hidden rounded-2xl bg-ink-800 shadow-card transition-opacity ${
        isDone ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {/* signature: vertical deadline-temperature bar */}
      <span className={`w-1.5 shrink-0 ${meta.bar}`} aria-hidden="true" />

      <div className="flex flex-1 items-center gap-4 py-4 pr-4">
        <button
          onClick={() => onToggle(task.id, isDone ? 'pending' : 'done')}
          aria-label={isDone ? 'ทำเครื่องหมายว่ายังไม่เสร็จ' : 'ทำเครื่องหมายว่าเสร็จแล้ว'}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            isDone
              ? 'border-done bg-done text-ink-900'
              : 'border-mist-400 text-transparent hover:border-mist-200'
          }`}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.6 3.6 6.7-6.7a1 1 0 011.4 0z" />
          </svg>
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={`truncate font-thai text-base font-medium text-mist-100 ${
              isDone ? 'line-through' : ''
            }`}
          >
            {task.title}
          </p>
          <p className={`mt-0.5 font-mono text-xs ${meta.text}`}>
            {formatThaiDate(task.date)}
            {task.time ? ` · ${task.time} น.` : ''}
            {' · '}
            {meta.label}
          </p>
        </div>

        <button
          onClick={() => onDelete(task.id)}
          aria-label="ลบกิจกรรม"
          className="shrink-0 rounded-lg p-2 text-mist-400 opacity-0 transition-opacity hover:bg-ink-700 hover:text-alert-soft group-hover:opacity-100 focus-visible:opacity-100"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </li>
  )
}
