// Simple bridge between the React UI and the C# WinForms host (WebView2).
// The host listens for messages via CoreWebView2.WebMessageReceived and
// replies with CoreWebView2.PostWebMessageAsJson, which raises the
// 'message' event on window.chrome.webview here.

const listeners = new Set()

function hasHost() {
  return typeof window !== 'undefined' && !!window.chrome && !!window.chrome.webview
}

export function sendToHost(type, payload = {}) {
  const message = { type, ...payload }
  if (hasHost()) {
    window.chrome.webview.postMessage(message)
  } else {
    // Running in a normal browser (e.g. `npm run dev`) without the C# host.
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
