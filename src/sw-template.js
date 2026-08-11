// Service Worker: runs in the background, even when no tab is open.
// Wakes up when a push message arrives, or when the user taps a
// notification — including the "ทำแล้ว" (done) action button, which
// updates Google Sheets directly without opening the app.
//
// SHEET_API_URL is injected at build time by scripts/inject-sw-config.js
// (do not edit public/sw.js directly — edit this file instead).

const SHEET_API_URL = '__SHEET_API_URL__'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let data = { title: 'มีกิจกรรมใกล้ถึงกำหนด', body: 'เปิดแอปเพื่อดูรายละเอียด', url: './', taskId: null }
  try {
    if (event.data) data = { ...data, ...event.data.json() }
  } catch (e) {
    // fall back to defaults if payload isn't JSON
  }

  // Only show the "done" quick-action when we know which task this is about.
  const actions = data.taskId
    ? [
        { action: 'done', title: '✓ ทำแล้ว' },
        { action: 'open', title: 'เปิดแอป' },
      ]
    : undefined

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      data: { url: data.url, taskId: data.taskId },
      tag: data.tag || 'deadline-reminder',
      actions,
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  const { action, notification } = event
  const { url, taskId } = notification.data || {}
  notification.close()

  if (action === 'done' && taskId) {
    event.waitUntil(markTaskDone(taskId))
    return
  }

  event.waitUntil(focusOrOpen(url || './'))
})

async function markTaskDone(taskId) {
  try {
    if (SHEET_API_URL) {
      await fetch(SHEET_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'updateTaskStatus', id: taskId, status: 'done' }),
      })
    }
    await self.registration.showNotification('ทำเครื่องหมายว่าเสร็จแล้ว ✓', {
      body: 'อัปเดตในชีตเรียบร้อยแล้ว',
      icon: 'icon-192.png',
      tag: `done-${taskId}`,
    })
    // tell any open tabs to refresh their task list
    const clientList = await self.clients.matchAll({ type: 'window' })
    clientList.forEach((c) => c.postMessage({ type: 'tasks-updated' }))
  } catch (err) {
    await self.registration.showNotification('อัปเดตไม่สำเร็จ', {
      body: 'เปิดแอปเพื่อลองติ๊กอีกครั้ง',
      icon: 'icon-192.png',
    })
  }
}

async function focusOrOpen(url) {
  const clientList = await self.clients.matchAll({ type: 'window' })
  for (const client of clientList) {
    if (client.url.includes(self.registration.scope) && 'focus' in client) {
      return client.focus()
    }
  }
  if (self.clients.openWindow) return self.clients.openWindow(url)
}
