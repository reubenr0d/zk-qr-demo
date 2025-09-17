import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

const Navigation = () => {
  const location = useLocation()

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h1>🎫 Proof of Age Demo</h1>
          <p>zk-proof based age verification</p>
        </div>
        <div className="nav-links">
          <Link 
            to="/create" 
            className={`nav-link ${location.pathname === '/create' ? 'active' : ''}`}
          >
            📝 Create Credential
          </Link>
          <Link 
            to="/verify" 
            className={`nav-link ${location.pathname === '/verify' ? 'active' : ''}`}
          >
            🔍 Verify Credential
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
