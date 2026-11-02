import loadingIcon from '../assets/login-icon.png'

/**
 * The botanical illustration, slowly turning, with "Loading" underneath.
 * Full-screen by default; `inline` is a smaller version for loading a list
 * inside a page that already has its tab bar.
 */
export function Loading({ inline = false }: { inline?: boolean }) {
  return (
    <div className={inline ? 'loading loading-inline' : 'loading loading-screen'} role="status">
      <img className="loading-icon" src={loadingIcon} alt="" />
      <span className="loading-text">Loading</span>
    </div>
  )
}
