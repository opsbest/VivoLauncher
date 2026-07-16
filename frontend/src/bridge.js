const listeners = new Set()

function hasHost() {
  return typeof window !== 'undefined' && !!window.chrome && !!window.chrome.webview
}

export function sendToHost(type, payload = {}) {
  const message = { type, ...payload }
  if (hasHost()) {
    window.chrome.webview.postMessage(message)
  } else {
    console.warn('[bridge] host not available, message not sent:', message)
  }
}

export function onHostMessage(handler) {
  listeners.add(handler)
  return () => listeners.delete(handler)
}

if (hasHost()) {
  window.chrome.webview.addEventListener('message', (e) => {
    for (const fn of listeners) fn(e.data)
  })
}

export { hasHost }
