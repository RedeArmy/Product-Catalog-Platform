import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import axiosClient from '../../../api/axiosClient'
import { useAuth } from '../../../context/AuthContext'

export default function CategoryFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id
  const { role } = useAuth()
  const isCollaboratorEditing = role === 'Collaborator' && isEditing

  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditing)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditing) return

    axiosClient.get(`/categories/${id}`)
      .then(({ data }) => {
        setForm({ name: data.name, description: data.description || '' })
      })
      .catch(() => setError('No pudimos cargar la categoria.'))
      .finally(() => setFetching(false))
  }, [id, isEditing])

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isEditing) {
        await axiosClient.put(`/categories/${id}`, form)
      } else {
        await axiosClient.post('/categories', form)
      }
      navigate('/admin/categories')
    } catch (err) {
      setError(err.response?.data?.message || 'No pudimos guardar la categoria.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <AdminLayout>
        <div className="py-16 text-center text-sm text-slate-500">Cargando categoria...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <section className="mx-auto flex w-full justify-center">
        <div className="w-full max-w-3xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => navigate('/admin/categories')}
              className="border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-[#1F2E9E] hover:text-[#1F2E9E]"
            >
              Volver al listado
            </button>
          </div>

          {error && (
            <div className="mb-6 border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="border-b border-slate-100 pb-5 text-center">
              <h1 className="text-3xl font-bold text-slate-900">
                {isEditing ? 'Editar categoria' : 'Crear categoria'}
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Nombre de la categoria
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={isCollaboratorEditing}
                    required
                    placeholder="Ej.: Cocina"
                    className={`w-full border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#1F2E9E] ${
                      isCollaboratorEditing ? 'cursor-not-allowed bg-slate-50 text-slate-500' : 'bg-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Descripcion
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe brevemente el proposito de esta categoria"
                    className="w-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#1F2E9E] resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => navigate('/admin/categories')}
                  className="border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#1F2E9E] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#17308E] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}
