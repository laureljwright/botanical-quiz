import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import logoutIcon from '../assets/figma/logout-icon.svg'

export function TabBar({ active }: { active: 'quiz' | 'plants' }) {
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
        <Link to="/quiz" className={`tab-pill ${active === 'quiz' ? 'active' : ''}`}>
          Quiz Mode
        </Link>
        <Link to="/plants" className={`tab-pill ${active === 'plants' ? 'active' : ''}`}>
          + Add New Plants
        </Link>
      </div>
    </div>
  )
}
