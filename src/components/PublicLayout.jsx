import UniversalHeader from './commons/UniversalHeader'
import { Outlet } from 'react-router-dom'

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <UniversalHeader />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default PublicLayout