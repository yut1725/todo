import { useEffect, useState } from 'react'
import { api } from './lib/api'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import NotificationSetup from './components/NotificationSetup'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      setError('')
      const data = await api.listTasks()
      setTasks(data.tasks || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // When the user taps "✓ ทำแล้ว" on a notification, the service worker
  // updates Google Sheets directly and then messages any open tab so the
  // list here stays in sync without a manual refresh.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const handler = (event) => {
      if (event.data?.type === 'tasks-updated') load()
    }
    navigator.serviceWorker.addEventListener('message', handler)
    return () => navigator.serviceWorker.removeEventListener('message', handler)
  }, [])

  async function handleAdd(task) {
    const optimistic = { ...task, id: `tmp-${Date.now()}`, status: 'pending' }
    setTasks((prev) => [...prev, optimistic])
    try {
      const { task: saved } = await api.addTask(task)
      setTasks((prev) => prev.map((t) => (t.id === optimistic.id ? saved : t)))
    } catch (err) {
      setError(err.message)
      setTasks((prev) => prev.filter((t) => t.id !== optimistic.id))
    }
  }

  async function handleToggle(id, status) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
    try {
      await api.updateTaskStatus(id, status)
    } catch (err) {
      setError(err.message)
      load()
    }
  }

  async function handleDelete(id) {
    const prevTasks = tasks
    setTasks((prev) => prev.filter((t) => t.id !== id))
    try {
      await api.deleteTask(id)
    } catch (err) {
      setError(err.message)
      setTasks(prevTasks)
    }
  }

  const pendingCount = tasks.filter((t) => t.status !== 'done').length

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-10 sm:py-16">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-mist-400">
          Deadline Tracker
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold text-mist-100">
          เส้นตาย
        </h1>
        <p className="mt-2 font-thai text-mist-300">
          {loading
            ? 'กำลังโหลดกิจกรรม…'
            : `${pendingCount} กิจกรรมที่ยังไม่เสร็จ — ระบบจะแจ้งเตือนก่อนถึงกำหนด 1 วัน`}
        </p>
      </header>

      <NotificationSetup />

      {error && (
        <div className="mb-6 rounded-xl border border-alert/30 bg-alert/10 px-4 py-3 font-thai text-sm text-alert-soft">
          {error}
        </div>
      )}

      <div className="mb-8">
        <TaskForm onAdd={handleAdd} />
      </div>

      {!loading && <TaskList tasks={tasks} onToggle={handleToggle} onDelete={handleDelete} />}
    </div>
  )
}
