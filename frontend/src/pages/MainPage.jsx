import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import VersionSelect from '../components/VersionSelect.jsx'
import { useUser } from '../context/UserContext.jsx'
import { useLaunch } from '../context/LaunchContext.jsx'
import { sendToHost } from '../bridge.js'
import mailIcon from '../assets/posta.png'
import './MainPage.css'

export default function MainPage() {
  const [version, setVersion] = useState('1.21.4')
  const { phase, progress, statusText, errorText } = useLaunch()
  const { username, setUsername } = useUser()
  const navigate = useNavigate()

  // Oyun bu oturumda sadece bir kez başlatılabilir; ikinci kez basılsa da
  // C# tarafı zaten reddediyor, burada da butonu kalıcı olarak kilitliyoruz.
  // Bu durum artık LaunchContext'te tutulduğu için sayfa değiştirip geri
  // gelince (Patch Notes / Announce) sıfırlanmıyor.
  const playDisabled = phase !== 'idle' && phase !== 'error'
  // Play now'a basıldıktan sonra (indirirken, oynarken ya da kapandıktan
  // sonra) hesap değiştirilemesin.
  const switchAccountDisabled = phase === 'launching' || phase === 'running' || phase === 'exited'

  const handlePlay = () => {
    if (playDisabled) return
    sendToHost('launch', { username: username || 'Steve', version })
  }

  const handleSwitchAccount = () => {
    if (switchAccountDisabled) return
    setUsername('')
    navigate('/')
  }

  const playLabel =
    phase === 'launching' ? 'launching...' :
    phase === 'running' ? 'in game' :
    phase === 'exited' ? 'already launched' :
    'play now'

  const showPanel = phase === 'launching' || phase === 'running' || phase === 'exited' || phase === 'error'

  return (
    <div className="main-page">
      <div className="buttons-menu">
        <Link to="/announce" className="unstyled-link">
          <button className="pixel-btn pixel-btn--icon">
            <img src={mailIcon} alt="Announcements" width="25" />
          </button>
        </Link>
      </div>

      <Navbar />

      <div className="player-card pixel-panel">
        <div className="player-avatar" />
        <div>
          <p className="text-body">{username || 'Steve'}</p>
          <button
            className="switch-account-btn"
            onClick={handleSwitchAccount}
            disabled={switchAccountDisabled}
          >
            <span className="text-small">Switch Account</span>
          </button>
        </div>
      </div>

      <div className="play-menu-wrapper">
        {showPanel && (
          <div className="launch-status pixel-panel">
            {phase === 'error' && <p className="text-small launch-error">{errorText}</p>}

            {phase === 'launching' && (
              <>
                <p className="text-small launch-status-text">{statusText}</p>
                <div className="launch-progress-track">
                  <div
                    className="launch-progress-fill"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  />
                </div>
              </>
            )}

            {phase === 'running' && (
              <p className="text-small launch-status-text">Minecraft açık</p>
            )}

            {phase === 'exited' && (
              <p className="text-small launch-status-text">
                Oyun kapatıldı. Tekrar oynamak için launcher'ı yeniden açın.
              </p>
            )}
          </div>
        )}

        <div className="play-menu">
          <VersionSelect value={version} onChange={setVersion} />
          <button
            className="pixel-btn pixel-btn--green play-button"
            onClick={handlePlay}
            disabled={playDisabled}
          >
            <span>{playLabel}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
