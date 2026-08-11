function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือนแบบ push')
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('ไม่ได้รับอนุญาตให้แจ้งเตือน')
  }

  const registration = await navigator.serviceWorker.ready
  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (!vapidPublicKey) {
    throw new Error('ยังไม่ได้ตั้งค่า VITE_VAPID_PUBLIC_KEY')
  }

  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })
  }

  return subscription.toJSON()
}

export function getNotificationSupportStatus() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission // 'default' | 'granted' | 'denied'
}
