// Runs once a day via .github/workflows/notify.yml
// 1. Reads tasks + push subscriptions from the Google Sheet (via Apps Script API)
// 2. Finds pending tasks whose date is tomorrow and haven't been notified yet
// 3. Sends a Web Push notification to every saved subscription
// 4. Marks those tasks as notified so they aren't sent twice

import webpush from 'web-push'

const SHEET_API_URL = process.env.SHEET_API_URL
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:you@example.com'

if (!SHEET_API_URL || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('Missing required environment variables/secrets.')
  process.exit(1)
}

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

async function callApi(action, payload = {}) {
  const res = await fetch(SHEET_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data
}

function tomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

async function main() {
  const { tasks } = await callApi('listTasks')
  const { subscriptions } = await callApi('listSubscriptions')

  const tomorrow = tomorrowStr()
  const due = tasks.filter(
    (t) => t.status !== 'done' && !t.notified && t.date === tomorrow
  )

  if (due.length === 0) {
    console.log('No tasks due tomorrow. Nothing to send.')
    return
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.log(`${due.length} task(s) due tomorrow, but no push subscriptions saved yet.`)
    return
  }

  for (const task of due) {
    const payload = JSON.stringify({
      title: 'ใกล้ถึงกำหนดแล้ว!',
      body: `"${task.title}" ครบกำหนดพรุ่งนี้ (${task.date}${task.time ? ' ' + task.time : ''})`,
      url: './',
      tag: `task-${task.id}`,
      taskId: task.id,
    })

    for (const sub of subscriptions) {
      const subscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      }
      try {
        await webpush.sendNotification(subscription, payload)
        console.log(`Sent notification for "${task.title}" to one subscriber.`)
      } catch (err) {
        // 410/404 means the subscription is stale (browser data cleared, etc.)
        console.warn(`Push failed for a subscriber (${err.statusCode}): ${err.message}`)
      }
    }

    await callApi('markNotified', { id: task.id })
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
