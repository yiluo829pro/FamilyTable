import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'
import AppLayout from './components/Layout/AppLayout'
import GuestLayout from './components/Layout/GuestLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TableDetail from './pages/tables/TableDetail'
import NewTable from './pages/tables/NewTable'
import NewDish from './pages/dishes/NewDish'
import EditDish from './pages/dishes/EditDish'
import NewEvent from './pages/events/NewEvent'
import EventAdmin from './pages/events/EventAdmin'
import EventBroadcast from './pages/events/EventBroadcast'
import VotePage from './pages/vote/VotePage'
import InvitePage from './pages/InvitePage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest"></div></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { setSession, setLoading } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [setSession, setLoading])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public guest routes */}
        <Route element={<GuestLayout />}>
          <Route path="/vote/:slug" element={<VotePage />} />
          <Route path="/invite/:token" element={<InvitePage />} />
        </Route>

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />

        {/* Protected admin routes */}
        <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tables/new" element={<NewTable />} />
          <Route path="/tables/:id" element={<TableDetail />} />
          <Route path="/tables/:id/dishes/new" element={<NewDish />} />
          <Route path="/tables/:id/dishes/:dishId/edit" element={<EditDish />} />
          <Route path="/events/new" element={<NewEvent />} />
          <Route path="/events/:id" element={<EventAdmin />} />
          <Route path="/events/:id/broadcast" element={<EventBroadcast />} />
        </Route>

        {/* Root */}
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
