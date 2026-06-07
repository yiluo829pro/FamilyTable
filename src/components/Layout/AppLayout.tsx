import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
