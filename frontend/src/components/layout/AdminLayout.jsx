import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminLayout({ children }) {
  const { role, logout } = useAuth()
  const navigate = useNavigate()
  const isCollaborator = role === 'Collaborator'

  const roleLabel = role === 'Administrator' ? 'Administrador' : role || 'Usuario'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#F7F7FB]">
      <nav className="border-b border-white/10 bg-[#1F2E9E] text-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-[#B7F000] text-lg font-black text-[#17308E]">
                C
              </div>
              <div>
                <p className="text-lg font-black tracking-wide">{isCollaborator ? 'ECOMMERCE - Collab' : 'ECOMMERCE - Admin'}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-white/65">Panel de gestion</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-white/10 px-3 py-1.5 text-sm text-white/85">{roleLabel}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-white px-4 py-2 text-sm font-semibold text-[#17308E] transition-colors hover:bg-slate-100"
              >
                Cerrar sesion
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-white/15 pt-3 text-sm font-semibold text-white/95">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="transition-opacity hover:opacity-80"
            >
              Producto
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/categories')}
              className="transition-opacity hover:opacity-80"
            >
              Categorias
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="transition-opacity hover:opacity-80"
            >
              Ir a la tienda
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  )
}
