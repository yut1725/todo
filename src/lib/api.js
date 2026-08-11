// Talks to the Google Apps Script Web App deployed from /apps-script/Code.gs.
// Put the deployed web app URL in a .env file as VITE_SHEET_API_URL
// (see .env.example). Apps Script Web Apps only support GET and POST,
// so we route every action through those two verbs with an "action" field.

const API_URL = import.meta.env.VITE_SHEET_API_URL

async function call(action, payload = {}) {
  if (!API_URL) {
    throw new Error(
      'ยังไม่ได้ตั้งค่า VITE_SHEET_API_URL — ดูวิธีตั้งค่าใน README.md'
    )
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    // Apps Script web apps redirect POST bodies unless we use this
    // "simple request" content type, which avoids a CORS preflight.
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload }),
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }

  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data
}

export const api = {
  listTasks: () => call('listTasks'),

  addTask: (task) => call('addTask', { task }),

  updateTaskStatus: (id, status) => call('updateTaskStatus', { id, status }),

  deleteTask: (id) => call('deleteTask', { id }),

  saveSubscription: (subscription) => call('saveSubscription', { subscription }),
}
