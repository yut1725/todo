import { urgencyLevel, URGENCY_META } from '../lib/urgency'
import TaskCard from './TaskCard'

const ORDER = ['overdue', 'today', 'tomorrow', 'week', 'later', 'done']

export default function TaskList({ tasks, onToggle, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-600 px-6 py-14 text-center">
        <p className="font-thai text-mist-300">ยังไม่มีกิจกรรม — เพิ่มรายการแรกด้านบนได้เลย</p>
      </div>
    )
  }

  const groups = ORDER.map((level) => ({
    level,
    items: tasks.filter((t) => urgencyLevel(t) === level),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.level}>
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-mist-300">
            {URGENCY_META[group.level].label}
            <span className="ml-2 font-mono text-xs font-normal text-mist-400">
              {group.items.length}
            </span>
          </h2>
          <ul className="space-y-2.5">
            {group.items.map((task) => (
              <TaskCard key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
