import { Link } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  return (
    <div className="navbar-menu">
      <Link to="/main" className="unstyled-link">
        <button className="pixel-btn">
          <span>Home</span>
        </button>
      </Link>
      <Link to="/patch-notes" className="unstyled-link">
        <button className="pixel-btn">
          <span>Patch Notes</span>
        </button>
      </Link>
    </div>
  )
}
