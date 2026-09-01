import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Login } from './pages/Login'
import { PlantForm } from './pages/PlantForm'
import { PlantList } from './pages/PlantList'
import { Quiz } from './pages/Quiz'
import { supabaseConfigured } from './lib/supabaseClient'
import { useSession } from './lib/useSession'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession()
  if (loading) return <div className="page">Loading…</div>
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession()
  if (loading) return <div className="page">Loading…</div>
  if (session) return <Navigate to="/quiz" replace />
  return <>{children}</>
}

function MissingConfig() {
  return (
    <div className="page">
      <div className="card">
        <h1>Setup needed</h1>
        <p>
          This app needs Supabase credentials. Copy <code>.env.example</code> to{' '}
          <code>.env.local</code> and fill in <code>VITE_SUPABASE_URL</code> and{' '}
          <code>VITE_SUPABASE_ANON_KEY</code> from your Supabase project settings, then
          restart the dev server.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  if (!supabaseConfigured) return <MissingConfig />

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <RedirectIfAuthed>
              <Login />
            </RedirectIfAuthed>
          }
        />
        <Route path="/" element={<Navigate to="/quiz" replace />} />
        <Route
          path="/plants"
          element={
            <RequireAuth>
              <PlantList />
            </RequireAuth>
          }
        />
        <Route
          path="/plants/new"
          element={
            <RequireAuth>
              <PlantForm />
            </RequireAuth>
          }
        />
        <Route
          path="/plants/:id/edit"
          element={
            <RequireAuth>
              <PlantForm />
            </RequireAuth>
          }
        />
        <Route
          path="/quiz"
          element={
            <RequireAuth>
              <Quiz />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
