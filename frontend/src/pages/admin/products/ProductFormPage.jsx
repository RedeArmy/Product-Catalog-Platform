import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import axiosClient from '../../../api/axiosClient'
import { useAuth } from '../../../context/AuthContext'

export default function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id
  const { role } = useAuth()
  const isCollaboratorEditing = role === 'Collaborator' && isEditing

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    sku: '',
    inventory: '',
    categoryId: '',
  })
  const [categories, setCategories] = useState([])
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditing)
  const [error, setError] = useState('')

  useEffect(() => {
    axiosClient.get('/categories/public')
      .then(({ data }) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEditing) return

    axiosClient.get(`/products/${id}`)
      .then(({ data }) => {
        setForm({
          name: data.name,
          description: data.description,
          price: String(data.price ?? ''),
          sku: data.sku,
          inventory: String(data.inventory ?? ''),
          categoryId: data.categoryId || '',
        })
        if (data.imageUrl) {
          setPreview(data.imageUrl)
        }
      })
      .catch(() => setError('No pudimos cargar el producto.'))
      .finally(() => setFetching(false))
  }, [id, isEditing])

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleImage = (event) => {
    const file = event.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const normalizedPrice = Number.parseFloat(String(form.price))
      const normalizedInventory = Number.parseInt(String(form.inventory), 10)

      if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
        setError('Ingresa un precio valido.')
        setLoading(false)
        return
      }

      if (Number.isNaN(normalizedInventory) || normalizedInventory < 0) {
        setError('Ingresa una cantidad valida para existencias disponibles.')
        setLoading(false)
        return
      }

      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('description', form.description)
      formData.append('price', String(normalizedPrice))
      formData.append('sku', form.sku)
      formData.append('inventory', String(normalizedInventory))
      if (form.categoryId) {
        formData.append('categoryId', form.categoryId)
      }
      if (image) formData.append('image', image)

      if (isEditing) {
        await axiosClient.put(`/products/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        await axiosClient.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      navigate('/admin/products')
    } catch (err) {
      setError(err.response?.data?.message || 'No pudimos guardar el producto.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <AdminLayout>
        <div className="py-16 text-center text-sm text-slate-500">Cargando producto...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <section className="mx-auto flex w-full justify-center">
        <div className="w-full max-w-3xl">
          <div className="mb-6 flex flex-wrap items-center justify-start gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-[#1F2E9E] transition-colors hover:bg-slate-50"
            >
              Regresar a listado
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
                {isEditing ? 'Editar producto' : 'Crear producto'}
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Nombre Producto</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#1F2E9E]"
                  />
                </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Descripcion</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#1F2E9E] resize-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Precio (Q)</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  disabled={isCollaboratorEditing}
                  required
                  min="0"
                  step="0.01"
                  className={`w-full border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#1F2E9E] ${
                    isCollaboratorEditing ? 'cursor-not-allowed bg-slate-50 text-slate-500' : 'bg-white'
                  }`}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  disabled={isCollaboratorEditing}
                  required
                  className={`w-full border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#1F2E9E] ${
                    isCollaboratorEditing ? 'cursor-not-allowed bg-slate-50 text-slate-500' : 'bg-white'
                  }`}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Existencias disponibles</label>
                <input
                  type="number"
                  name="inventory"
                  value={form.inventory}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                  className="w-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#1F2E9E]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Categoria
                </label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  className="w-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#1F2E9E]"
                >
                  <option value="">- Seleccionar categoria -</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="mt-1 text-xs text-slate-400">
                    No hay categorias disponibles.{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/admin/categories/new')}
                      className="text-[#1F2E9E] hover:underline"
                    >
                      Crear una
                    </button>
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Imagen</label>
                <div className="border border-dashed border-slate-300 bg-slate-50 p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    className="w-full text-sm text-slate-500 file:mr-3 file:border-0 file:bg-[#1F2E9E] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#17308E]"
                  />
                  {preview && (
                    <div className="mt-4 flex justify-center">
                      <img
                        src={preview}
                        alt="Vista previa"
                        className="h-40 w-40 border border-slate-200 object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => navigate('/admin/products')}
                  className="border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#1F2E9E] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#17308E] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}
