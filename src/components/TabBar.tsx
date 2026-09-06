import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import logoutIcon from '../assets/figma/logout-icon.svg'

export function TabBar({ active }: { active: 'quiz' | 'plants' | 'study' }) {
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="tab-bar">
      <div className="tab-bar-top">
        <span className="tab-bar-title">Fall/Winter Plant ID</span>
        <button
          type="button"
          className="tab-bar-logout"
          aria-label="Sign out"
          onClick={handleSignOut}
        >
          <img src={logoutIcon} alt="" />
        </button>
      </div>
      <div className="tab-bar-pills">
        <Link to="/study" className={`tab-pill ${active === 'study' ? 'active' : ''}`}>
          Study
        </Link>
        <Link to="/quiz" className={`tab-pill ${active === 'quiz' ? 'active' : ''}`}>
          Quiz
        </Link>
        <Link to="/plants" className={`tab-pill ${active === 'plants' ? 'active' : ''}`}>
          + New Plants
        </Link>
      </div>
    </div>
  )
}
