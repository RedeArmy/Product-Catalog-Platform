import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axiosClient from '../../api/axiosClient'

export default function LoginModal({ onClose }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const modalRef = useRef(null)

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data } = await axiosClient.post('/auth/login', form)
      login(data.accessToken, data.role)
      onClose()
      navigate('/admin/products')
    } catch {
      setError('Credenciales invalidas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={modalRef}
      className="absolute right-0 top-full z-50 mt-1 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-none border border-[#2035A5] bg-white shadow-[0_26px_60px_rgba(15,23,42,0.24)]"
    >
      <div className="absolute right-10 top-0 h-4 w-4 -translate-y-1/2 rotate-45 border-l border-t border-[#2035A5] bg-white" />

      <div className="relative bg-[#1F2E9E] px-6 py-4 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
          Acceso
        </p>
        <h2 className="mt-1 text-2xl font-bold leading-none">Iniciar sesion</h2>
      </div>

      <div className="relative px-6 pb-6 pt-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-3 text-3xl leading-none text-white/80 transition-colors hover:text-white"
          aria-label="Cerrar"
        >
          <span className="hidden">Cerrar</span>
        </button>

        {error && (
          <div className="mb-5 rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Ej.: ejemplo@mail.com"
              required
              className="w-full rounded-none border border-slate-300 bg-white px-5 py-3.5 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#1F2E9E]"
            />
          </div>

          <div>
            <div className="flex items-center rounded-none border border-slate-300 bg-white px-5 py-3.5 focus-within:border-[#1F2E9E]">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Ingrese su contrasena"
                required
                className="flex-1 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="ml-3 text-slate-400 transition-colors hover:text-[#4B2D9E]"
                aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>

            <div className="mt-3 text-center">
              <a href="#" className="text-sm text-slate-900 hover:underline">
                Olvide mi contrasena
              </a>
            </div>
          </div>

          <div className="pt-1 text-center">
            <button
              type="submit"
              disabled={loading}
              className="min-w-44 rounded-none bg-[#1F2E9E] px-8 py-3 text-base font-medium text-white transition-colors hover:bg-[#17257D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          <p className="text-center text-base font-medium text-black">
            ¿No tienes una cuenta?{' '}
            <a href="#" className="font-semibold hover:underline">
              Regístrate
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
