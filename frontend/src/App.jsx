import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import MainPage from './pages/MainPage.jsx'
import AnnouncePage from './pages/AnnouncePage.jsx'
import PatchNotesPage from './pages/PatchNotesPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="/announce" element={<AnnouncePage />} />
      <Route path="/patch-notes" element={<PatchNotesPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
