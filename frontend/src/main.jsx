import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { LaunchProvider } from './context/LaunchContext.jsx'
import './styles/global.css'

// Bu bir "sayfa" değil masaüstü uygulaması gibi davransın diye:
// resim/link sürüklemeyi ve bırakmayı (drag & drop) tamamen kapatıyoruz.
// Aksi halde WebView2, butonu/resmi sürükleyince tarayıcı gibi bir
// navigasyon/arama davranışı başlatabiliyor.
document.addEventListener('dragstart', (e) => e.preventDefault())
document.addEventListener('drop', (e) => e.preventDefault())
document.addEventListener('dragover', (e) => e.preventDefault())

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <UserProvider>
        <LaunchProvider>
          <App />
        </LaunchProvider>
      </UserProvider>
    </HashRouter>
  </React.StrictMode>,
)
