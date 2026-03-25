import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import axiosClient from '../../../api/axiosClient'
import { useAuth } from '../../../context/AuthContext'

const productsPerPage = 15

function getUploadErrorMessage(error) {
  const responseData = error?.response?.data

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData
  }

  if (responseData?.message) {
    return responseData.message
  }

  if (responseData?.title) {
    return responseData.title
  }

  if (responseData?.errors && typeof responseData.errors === 'object') {
    const errorGroups = Object.values(responseData.errors).flat()
    if (errorGroups.length > 0) {
      return errorGroups.join(' ')
    }
  }

  if (error?.response?.status) {
    return `La carga masiva fallo con estado ${error.response.status}.`
  }

  if (error?.message) {
    return error.message
  }

  return 'No pudimos cargar el archivo CSV.'
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false)
  const [bulkFile, setBulkFile] = useState(null)
  const [bulkUploadError, setBulkUploadError] = useState('')
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkResult, setBulkResult] = useState(null)
  const { role } = useAuth()
  const navigate = useNavigate()
  const isAdmin = role === 'Administrator'

  const fetchProducts = async () => {
    try {
      const { data } = await axiosClient.get('/products')
      setProducts(Array.isArray(data) ? data : [])
    } catch {
      setError('No pudimos cargar los productos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [products.length])

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      setBulkUploadError('Selecciona un archivo CSV antes de continuar.')
      return
    }

    const formData = new FormData()
    formData.append('file', bulkFile)
    setBulkUploadError('')
    setBulkUploading(true)

    try {
      const { data } = await axiosClient.post('/products/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setBulkResult(data)
      setBulkFile(null)
      fetchProducts()
    } catch (err) {
      setBulkResult(null)
      setBulkUploadError(getUploadErrorMessage(err))
    } finally {
      setBulkUploading(false)
    }
  }

  const handleToggleStatus = async () => {
    const product = products.find((item) => item.id === deleteId)
    if (!product) return

    try {
      const formData = new FormData()
      formData.append('name', product.name)
      formData.append('description', product.description)
      formData.append('price', product.price)
      formData.append('sku', product.sku)
      formData.append('inventory', product.inventory)
      formData.append('isActive', !product.isActive)
      if (product.categoryId) formData.append('categoryId', product.categoryId)

      await axiosClient.put(`/products/${deleteId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setDeleteId(null)
      fetchProducts()
    } catch {
      setError('No pudimos actualizar el estado del producto.')
    }
  }

  const summary = useMemo(() => {
    const activos = products.filter((product) => product.isActive).length
    const inventarioBajo = products.filter((product) => Number(product.inventory) <= 5).length

    return {
      total: products.length,
      activos,
      inventarioBajo,
    }
  }, [products])

  const pageStartIndex = (currentPage - 1) * productsPerPage
  const totalPages = Math.max(1, Math.ceil(products.length / productsPerPage))
  const paginatedProducts = useMemo(() => {
    return products.slice(pageStartIndex, pageStartIndex + productsPerPage)
  }, [products, pageStartIndex])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const selectedProduct = products.find((product) => product.id === deleteId)

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
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Listado de productos</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-slate-500">
              {loading ? 'Cargando productos...' : `${products.length} producto${products.length === 1 ? '' : 's'} registrados`}
            </p>
            {!loading && products.length > 0 && (
              <p className="text-sm text-slate-500">
                Pagina {currentPage} de {totalPages}
              </p>
            )}
            {isAdmin && !loading && products.length > 0 && (
              <>
                <a
                  href="/api/products/bulk-upload/template"
                  className="border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-[#1F2E9E] hover:text-[#1F2E9E]"
                >
                  Descargar plantilla
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setBulkUploadOpen(true)
                    setBulkUploadError('')
                    setBulkResult(null)
                    setBulkFile(null)
                  }}
                  className="border border-[#1F2E9E] px-4 py-2.5 text-sm font-semibold text-[#1F2E9E] transition-colors hover:bg-[#1F2E9E] hover:text-white"
                >
                  Cargar CSV
                </button>
              </>
            )}
            {!loading && products.length > 0 && (
              <button
                type="button"
                onClick={() => navigate('/admin/products/new')}
                className="bg-[#1F2E9E] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#17308E]"
              >
                Crear producto
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
        ) : products.length === 0 ? (
          <div className="mt-6 flex flex-col items-center border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
              Estado vacio
            </p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              Aun no hay productos registrados
            </h3>
            <p className="mt-3 max-w-xl text-center text-sm leading-6 text-slate-500">
              Crea tu primer producto para comenzar a poblar el catalogo y habilitar la experiencia
              visual del storefront.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/products/new')}
                className="bg-[#1F2E9E] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#17308E]"
              >
                Crear producto
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/categories')}
                className="bg-[#1F2E9E] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#17308E]"
              >
                Ver categorias
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr className="border-b border-slate-200">
                    <th className="w-20 px-5 py-4 text-center font-semibold">No.</th>
                    <th className="px-5 py-4 text-center font-semibold">Producto</th>
                    <th className="px-5 py-4 text-left font-semibold">Departamento</th>
                    <th className="px-5 py-4 text-left font-semibold">SKU</th>
                    <th className="px-5 py-4 text-left font-semibold">Precio</th>
                    <th className="px-5 py-4 text-center font-semibold">Inventario</th>
                    <th className="px-5 py-4 text-left font-semibold">Estado</th>
                    <th className="px-5 py-4 text-center font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedProducts.map((product, index) => (
                    <tr key={product.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-5 py-4 text-center font-semibold text-slate-500">
                        {pageStartIndex + index + 1}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">{product.name}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {product.categoryName || 'Sin categoria'}
                      </td>
                      <td className="px-5 py-4 text-slate-500">{product.sku}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        Q{Number(product.price).toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`font-semibold ${product.inventory > 5 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {product.inventory}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                            product.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {product.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                            className="text-sm font-semibold text-[#1F2E9E] transition-opacity hover:opacity-80"
                          >
                            Editar
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => setDeleteId(product.id)}
                              className={`text-sm font-semibold transition-opacity hover:opacity-80 ${
                                product.isActive ? 'text-red-600' : 'text-emerald-600'
                              }`}
                            >
                              {product.isActive ? 'Eliminar' : 'Reactivar'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {products.length > productsPerPage && (
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

      {deleteId && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md border border-slate-200 bg-white p-6 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-600">
              Confirmacion
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {selectedProduct.isActive ? 'Eliminar producto' : 'Reactivar producto'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {selectedProduct.isActive
                ? 'El producto dejara de ser visible en el catalogo publico.'
                : 'El producto volvera a ser visible en el catalogo publico.'}
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
                  selectedProduct.isActive
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {selectedProduct.isActive ? 'Eliminar' : 'Reactivar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md border border-slate-200 bg-white p-6 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-600">
              Carga masiva de productos
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Importar archivo CSV</h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Archivo CSV
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(event) => {
                    setBulkFile(event.target.files[0] || null)
                    setBulkUploadError('')
                    setBulkResult(null)
                  }}
                  className="w-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-colors file:mr-3 file:border-0 file:bg-[#1F2E9E] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#17308E] focus:border-[#1F2E9E]"
                />
                {bulkFile && (
                  <p className="mt-2 text-xs text-slate-500">
                    Archivo seleccionado: {bulkFile.name}
                  </p>
                )}
              </div>

              {bulkUploading && (
                <div className="border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  Cargando archivo CSV, por favor espera...
                </div>
              )}

              {bulkUploadError && (
                <div className="border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {bulkUploadError}
                </div>
              )}

              {bulkResult && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="border border-slate-100 p-3 text-center">
                      <p className="text-2xl font-black text-slate-900">{bulkResult.totalRows}</p>
                      <p className="mt-1 text-xs text-slate-500">Filas totales</p>
                    </div>
                    <div className="border border-emerald-100 bg-emerald-50 p-3 text-center">
                      <p className="text-2xl font-black text-emerald-700">{bulkResult.created}</p>
                      <p className="mt-1 text-xs text-emerald-600">Creados</p>
                    </div>
                    <div className="border border-amber-100 bg-amber-50 p-3 text-center">
                      <p className="text-2xl font-black text-amber-700">{bulkResult.skipped}</p>
                      <p className="mt-1 text-xs text-amber-600">Omitidos</p>
                    </div>
                  </div>

                  {bulkResult.errors?.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border border-red-100 bg-red-50 p-3">
                      {bulkResult.errors.map((bulkError, index) => (
                        <p key={`${bulkError.row}-${bulkError.sku}-${index}`} className="mb-1 text-xs text-red-600">
                          Fila {bulkError.row} - {bulkError.sku}: {bulkError.message}
                        </p>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setBulkUploadOpen(false)
                  setBulkUploadError('')
                  setBulkResult(null)
                  setBulkFile(null)
                  setBulkUploading(false)
                }}
                className="border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleBulkUpload}
                disabled={!bulkFile || bulkUploading}
                className="bg-[#1F2E9E] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#17308E] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {bulkUploading ? 'Cargando...' : 'Cargar archivo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
