/**
 * Deadline To-Do — Google Apps Script backend
 *
 * SETUP:
 * 1. Create a Google Sheet. Add two tabs named exactly "Tasks" and "Subscriptions".
 *    Tasks header row (row 1):          id | title | date | time | status | notified
 *    Subscriptions header row (row 1):  id | endpoint | p256dh | auth
 * 2. Extensions > Apps Script, paste this file in as Code.gs.
 * 3. Deploy > New deployment > type "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the deployed Web App URL into your frontend .env (VITE_SHEET_API_URL)
 *    and into the GitHub Actions secret SHEET_API_URL.
 */

const TASKS_SHEET = 'Tasks'
const SUBS_SHEET = 'Subscriptions'

function doGet(e) {
  return handle(e)
}

function doPost(e) {
  return handle(e)
}

function handle(e) {
  try {
    const body = e.postData ? JSON.parse(e.postData.contents) : {}
    const action = body.action || (e.parameter && e.parameter.action)
    let result

    switch (action) {
      case 'listTasks':
        result = { tasks: listTasks() }
        break
      case 'addTask':
        result = { task: addTask(body.task) }
        break
      case 'updateTaskStatus':
        updateTaskStatus(body.id, body.status)
        result = { ok: true }
        break
      case 'deleteTask':
        deleteTask(body.id)
        result = { ok: true }
        break
      case 'saveSubscription':
        saveSubscription(body.subscription)
        result = { ok: true }
        break
      case 'listSubscriptions':
        result = { subscriptions: listSubscriptions() }
        break
      case 'markNotified':
        markNotified(body.id)
        result = { ok: true }
        break
      default:
        result = { error: 'Unknown action: ' + action }
    }

    return jsonResponse(result)
  } catch (err) {
    return jsonResponse({ error: err.message })
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  )
}

function getSheet(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name)
  if (!sheet) throw new Error(`Sheet "${name}" not found`)
  return sheet
}

function sheetToObjects(sheet) {
  const values = sheet.getDataRange().getValues()
  const [header, ...rows] = values
  return rows
    .filter((row) => row.some((cell) => cell !== ''))
    .map((row) => {
      const obj = {}
      header.forEach((key, i) => (obj[key] = row[i]))
      return obj
    })
}

// ---------- Tasks ----------

function listTasks() {
  const sheet = getSheet(TASKS_SHEET)
  return sheetToObjects(sheet).map((t) => ({
    id: String(t.id),
    title: t.title,
    date: formatDate(t.date),
    time: t.time || '',
    status: t.status || 'pending',
    notified: t.notified === true || t.notified === 'true',
  }))
}

function addTask(task) {
  const sheet = getSheet(TASKS_SHEET)
  const id = Utilities.getUuid()
  sheet.appendRow([id, task.title, task.date, task.time || '', 'pending', false])
  return { id, title: task.title, date: task.date, time: task.time || '', status: 'pending', notified: false }
}

function updateTaskStatus(id, status) {
  const sheet = getSheet(TASKS_SHEET)
  const row = findRowById(sheet, id)
  if (row === -1) throw new Error('Task not found')
  const statusCol = headerIndex(sheet, 'status') + 1
  sheet.getRange(row, statusCol).setValue(status)
}

function deleteTask(id) {
  const sheet = getSheet(TASKS_SHEET)
  const row = findRowById(sheet, id)
  if (row === -1) return
  sheet.deleteRow(row)
}

// ---------- Subscriptions (push) ----------

function saveSubscription(subscription) {
  const sheet = getSheet(SUBS_SHEET)
  const existing = sheetToObjects(sheet)
  const already = existing.some((s) => s.endpoint === subscription.endpoint)
  if (already) return
  sheet.appendRow([
    Utilities.getUuid(),
    subscription.endpoint,
    subscription.keys.p256dh,
    subscription.keys.auth,
  ])
}

function listSubscriptions() {
  const sheet = getSheet(SUBS_SHEET)
  return sheetToObjects(sheet).map((s) => ({
    endpoint: s.endpoint,
    p256dh: s.p256dh,
    auth: s.auth,
  }))
}

function markNotified(id) {
  const sheet = getSheet(TASKS_SHEET)
  const row = findRowById(sheet, id)
  if (row === -1) throw new Error('Task not found')
  const notifiedCol = headerIndex(sheet, 'notified') + 1
  sheet.getRange(row, notifiedCol).setValue(true)
}

// ---------- helpers ----------

function findRowById(sheet, id) {
  const values = sheet.getDataRange().getValues()
  const idCol = headerIndex(sheet, 'id')
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(id)) return i + 1 // 1-indexed row
  }
  return -1
}

function headerIndex(sheet, name) {
  const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  return header.indexOf(name)
}

function formatDate(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd')
  }
  return value
}
