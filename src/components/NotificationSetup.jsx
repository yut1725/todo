import { useEffect, useState } from 'react'
import { subscribeToPush, getNotificationSupportStatus } from '../lib/push'
import { api } from '../lib/api'

export default function NotificationSetup() {
  const [status, setStatus] = useState('checking') // checking | default | granted | denied | unsupported
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setStatus(getNotificationSupportStatus())
  }, [])

  async function enable() {
    setBusy(true)
    setError('')
    try {
      const subscription = await subscribeToPush()
      await api.saveSubscription(subscription)
      setStatus('granted')
    } catch (err) {
      setError(err.message)
      setStatus(getNotificationSupportStatus())
    } finally {
      setBusy(false)
    }
  }

  if (status === 'granted' || status === 'checking') return null

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-ember/30 bg-ember/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-thai text-sm font-medium text-mist-100">
          {status === 'unsupported'
            ? 'เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน'
            : status === 'denied'
              ? 'คุณปิดการแจ้งเตือนไว้ — เปิดใหม่ได้ในตั้งค่าเบราว์เซอร์'
              : 'เปิดการแจ้งเตือนเพื่อรับแจ้งก่อนถึงกำหนด 1 วัน'}
        </p>
        {error && <p className="mt-1 font-thai text-xs text-alert-soft">{error}</p>}
      </div>
      {status === 'default' && (
        <button
          onClick={enable}
          disabled={busy}
          className="shrink-0 rounded-xl bg-ember px-4 py-2.5 font-display text-sm font-semibold text-ink-950 hover:bg-ember-soft disabled:opacity-50"
        >
          {busy ? 'กำลังเปิด…' : 'เปิดการแจ้งเตือน'}
        </button>
      )}
    </div>
  )
}
