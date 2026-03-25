import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import axiosClient from '../../../api/axiosClient'
import { useAuth } from '../../../context/AuthContext'

const categoriesPerPage = 15

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { role } = useAuth()
  const navigate = useNavigate()
  const isAdmin = role === 'Administrator'
  const canCreateCategory = role !== 'Collaborator'

  const fetchCategories = async () => {
    try {
      const { data } = await axiosClient.get('/categories')
      setCategories(Array.isArray(data) ? data : [])
    } catch {
      setError('No pudimos cargar las categorias.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [categories.length])

  const handleToggleStatus = async () => {
    const category = categories.find((item) => item.id === deleteId)
    if (!category) return

    try {
      await axiosClient.put(`/categories/${deleteId}`, {
        name: category.name,
        description: category.description || '',
        isActive: !category.isActive,
      })
      setDeleteId(null)
      fetchCategories()
    } catch {
      setError('No pudimos actualizar el estado de la categoria.')
    }
  }

  const pageStartIndex = (currentPage - 1) * categoriesPerPage
  const totalPages = Math.max(1, Math.ceil(categories.length / categoriesPerPage))
  const paginatedCategories = useMemo(() => {
    return categories.slice(pageStartIndex, pageStartIndex + categoriesPerPage)
  }, [categories, pageStartIndex])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const selectedCategory = categories.find((item) => item.id === deleteId)

  return (
    <AdminLayout>
      {error && (
        <section className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </section>
      )}

      <section className={`${error ? 'mt-8' : ''} border border-slate-200 bg-white p-6 shadow-sm`}>
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-600">
              CATALOGO INTERNO
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Listado de categorias</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-slate-500">
              {loading ? 'Cargando categorias...' : `${categories.length} categoria${categories.length === 1 ? '' : 's'} registradas`}
            </p>
            {!loading && categories.length > 0 && (
              <p className="text-sm text-slate-500">
                Pagina {currentPage} de {totalPages}
              </p>
            )}
            {!loading && categories.length > 0 && canCreateCategory && (
              <button
                type="button"
                onClick={() => navigate('/admin/categories/new')}
                className="bg-[#1F2E9E] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#17308E]"
              >
                Crear categoria
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-44 animate-pulse border border-slate-100 bg-slate-50" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="mt-6 flex flex-col items-center border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
              Estado vacio
            </p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              Aun no hay categorias registradas
            </h3>
            <p className="mt-3 max-w-xl text-center text-sm leading-6 text-slate-500">
              Crea tu primera categoria para organizar mejor el catalogo y facilitar la gestion de productos.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {canCreateCategory && (
                <button
                  type="button"
                  onClick={() => navigate('/admin/categories/new')}
                  className="bg-[#1F2E9E] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#17308E]"
                >
                  Crear categoria
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="bg-[#1F2E9E] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#17308E]"
              >
                Ver productos
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr className="border-b border-slate-200">
                    <th className="w-20 px-5 py-4 text-center font-semibold">No.</th>
                    <th className="px-5 py-4 text-left font-semibold">Categoria</th>
                    <th className="px-5 py-4 text-center font-semibold">Descripcion</th>
                    <th className="px-5 py-4 text-left font-semibold">Estado</th>
                    <th className="px-5 py-4 text-center font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedCategories.map((category, index) => (
                    <tr key={category.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-5 py-4 text-center font-semibold text-slate-500">
                        {pageStartIndex + index + 1}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">{category.name}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-500">{category.description || 'Sin descripcion'}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                            category.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {category.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/categories/${category.id}/edit`)}
                            className="text-sm font-semibold text-[#1F2E9E] transition-opacity hover:opacity-80"
                          >
                            Editar
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => setDeleteId(category.id)}
                              className={`text-sm font-semibold transition-opacity hover:opacity-80 ${
                                category.isActive ? 'text-red-600' : 'text-emerald-600'
                              }`}
                            >
                              {category.isActive ? 'Eliminar' : 'Reactivar'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {categories.length > categoriesPerPage && (
              <div className="flex items-center justify-center gap-3 border-t border-slate-100 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="text-sm text-slate-500">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {deleteId && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md border border-slate-200 bg-white p-6 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-600">
              Confirmacion
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {selectedCategory.isActive ? 'Eliminar categoria' : 'Reactivar categoria'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {selectedCategory.isActive
                ? 'La categoria dejara de ser visible en el catalogo publico.'
                : 'La categoria volvera a ser visible en el catalogo publico.'}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                className={`px-4 py-2.5 text-sm font-semibold transition-colors ${
                  selectedCategory.isActive
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {selectedCategory.isActive ? 'Eliminar' : 'Reactivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
