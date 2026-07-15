import { createContext, useContext, useEffect, useState } from 'react'
import { onHostMessage } from '../bridge.js'

const LaunchContext = createContext(null)

const initialState = {
  // idle      -> henüz oynanmadı, "play now" aktif
  // launching -> indiriliyor/başlatılıyor
  // running   -> Minecraft açık
  // exited    -> Minecraft kapatıldı (bu oturumda tekrar oynanamaz)
  // error     -> gerçek bir başlatma hatası oldu, tekrar denenebilir
  phase: 'idle',
  progress: 0,
  statusText: '',
  errorText: '',
}

export function LaunchProvider({ children }) {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    const off = onHostMessage((msg) => {
      if (!msg) return

      setState((prev) => {
        switch (msg.type) {
          case 'launchStarted':
            return { ...prev, phase: 'launching', errorText: '', progress: 0, statusText: 'Başlatılıyor...' }

          case 'launchProgress':
            return {
              ...prev,
              phase: 'launching',
              progress: typeof msg.percent === 'number' ? msg.percent : prev.progress,
              statusText: msg.text || prev.statusText,
            }

          case 'launchReady':
            return { ...prev, phase: 'running', progress: 100, statusText: 'Minecraft açık' }

          case 'launchError':
            // Host, oyun zaten çalışırken/kapandıktan sonra gelen ikinci bir
            // "launch" isteğini de bu mesajla reddediyor. Böyle bir durumda
            // ekrandaki sabit "çalışıyor / kapatıldı" mesajını bozmuyoruz;
            // sadece gerçek ilk deneme başarısız olduysa hata ekranına geçiyoruz.
            if (prev.phase === 'launching' || prev.phase === 'idle') {
              return {
                ...prev,
                phase: 'error',
                errorText: msg.message || 'Bilinmeyen bir hata oluştu.',
              }
            }
            return prev

          case 'gameExited':
            return { ...prev, phase: 'exited', progress: 0, statusText: '' }

          default:
            return prev
        }
      })
    })
    return off
  }, [])

  return <LaunchContext.Provider value={state}>{children}</LaunchContext.Provider>
}

export function useLaunch() {
  const ctx = useContext(LaunchContext)
  if (!ctx) {
    throw new Error('useLaunch must be used inside a <LaunchProvider>')
  }
  return ctx
}
