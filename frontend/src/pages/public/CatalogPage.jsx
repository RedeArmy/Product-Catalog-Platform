import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosClient from '../../api/axiosClient'
import LoginModal from '../../components/ui/LoginModal'
import { useAuth } from '../../context/AuthContext'

const utilityLinks = [
  'Productos con suscripcion',
  'Eres empresa?',
  'Tiendas',
  'Compra x Chat',
  'Compra x WhatsApp',
]

const primaryLinks = [
  'Bodas y registros',
  'Revistas',
  'Privilegio',
  'Mesa de regalos',
  'Super Club',
]

const staticCategories = [
  'Tecnologia',
  'Muebles',
  'Novedades',
  'Todo en Ferreteria',
  'Mascotas',
  'Organizacion',
]

const quickServices = ['Entrega rapida', 'Retira en tiendas']

const inspirationTiles = [
  { title: 'Cocina y mesa', description: 'Renueva tu mesa con texturas, color y piezas funcionales.' },
  { title: 'Orden y limpieza', description: 'Soluciones practicas para mantener cada espacio en armonia.' },
  { title: 'Dormitorio', description: 'Blancos, descanso y detalles que elevan la experiencia diaria.' },
  { title: 'Mascotas', description: 'Accesorios y esenciales para consentir a quienes tambien son familia.' },
]

const footerColumns = [
  { title: 'Servicios', links: ['Instalaciones', 'Blog', 'Tiendas', 'Servicio a empresas'] },
  { title: 'Nuestros valores', links: ['Sostenibilidad', 'Garantia total', 'Sistema B'] },
  { title: 'Venta en linea', links: ['Retirar en tienda', 'Metodos de pago', 'Preguntas frecuentes'] },
  { title: 'Grupo Ecommerce', links: ['Unete a nuestro equipo', 'Sobre nosotros', 'Deseas ser proveedor'] },
]

const shellClass = 'mx-auto w-full max-w-[min(1760px,calc(100vw-3rem))] px-4'
const productsPerPage = 16
const featuredVisibleItems = 4

function ProductCard({ product }) {
  return (
    <article className="group overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="relative flex h-56 items-center justify-center bg-gradient-to-br from-slate-50 via-white to-violet-50 p-5">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-none border border-dashed border-slate-200 bg-white text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Sin imagen
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-none bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-700 shadow-sm">
          {product.categoryName || 'Sin categoria'}
        </span>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <h3 className="line-clamp-2 min-h-12 text-base font-semibold text-slate-900">{product.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{product.sku || 'Pendiente'}</p>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Precio</p>
            <p className="mt-1 text-2xl font-black text-slate-900">Q{Number(product.price).toFixed(2)}</p>
          </div>
          <span className="rounded-none bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Disponible</span>
        </div>
        <button type="button" className="w-full rounded-none bg-[#4B2D9E] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3B1F8C]">
          Agregar
        </button>
      </div>
    </article>
  )
}

function PlaceholderCard({ title, description }) {
  return (
    <article className="rounded-none border border-slate-200 bg-white p-5 shadow-sm">
      <div className="rounded-none bg-gradient-to-br from-slate-50 to-violet-50 p-5">
        <div className="flex h-40 items-end rounded-none bg-gradient-to-r from-[#EEE8FF] via-white to-[#F4F0FF] p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">Inspiracion</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">{title}</h3>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500">{description}</p>
      <button type="button" className="mt-5 rounded-none border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-[#4B2D9E] hover:text-[#4B2D9E]">
        Ver coleccion
      </button>
    </article>
  )
}

function EmptyState({ eyebrow, title, description }) {
  return (
    <div className="flex flex-col items-center border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">{eyebrow}</p>
      <h3 className="mt-3 text-3xl font-bold text-slate-900">{title}</h3>
      <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-6 text-slate-500">{description}</p>
    </div>
  )
}

export default function CatalogPage() {
  const [products, setProducts] = useState([])
  const [departments, setDepartments] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [showLogin, setShowLogin] = useState(false)
  const [showDepts, setShowDepts] = useState(false)
  const deptRef = useRef(null)
  const featuredHoverIntervalRef = useRef(null)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    Promise.all([
      axiosClient.get('/products/public'),
      axiosClient.get('/categories/public'),
    ])
      .then(([productsRes, categoriesRes]) => {
        if (isMounted) {
          setProducts(Array.isArray(productsRes.data) ? productsRes.data : [])
          setDepartments(Array.isArray(categoriesRes.data) ? categoriesRes.data : [])
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('No pudimos cargar el catalogo en este momento.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const handler = (event) => {
      if (deptRef.current && !deptRef.current.contains(event.target)) {
        setShowDepts(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !activeCategory || product.categoryName === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [products, search, activeCategory])

  useEffect(() => {
    setCurrentPage(1)
    setFeaturedIndex(0)
  }, [search, activeCategory, error])

  const featuredProducts = useMemo(() => filteredProducts.slice(0, 10), [filteredProducts])
  const maxFeaturedIndex = Math.max(0, featuredProducts.length - featuredVisibleItems)
  const visibleFeaturedProducts = useMemo(
    () => featuredProducts.slice(featuredIndex, featuredIndex + featuredVisibleItems),
    [featuredProducts, featuredIndex]
  )

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage))
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage
    return filteredProducts.slice(startIndex, startIndex + productsPerPage)
  }, [filteredProducts, currentPage])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    if (featuredIndex > maxFeaturedIndex) {
      setFeaturedIndex(maxFeaturedIndex)
    }
  }, [featuredIndex, maxFeaturedIndex])

  useEffect(() => {
    return () => {
      if (featuredHoverIntervalRef.current) {
        window.clearInterval(featuredHoverIntervalRef.current)
      }
    }
  }, [])

  const stopFeaturedHover = () => {
    if (featuredHoverIntervalRef.current) {
      window.clearInterval(featuredHoverIntervalRef.current)
      featuredHoverIntervalRef.current = null
    }
  }

  const startFeaturedHover = (direction) => {
    if (featuredProducts.length <= featuredVisibleItems) return

    stopFeaturedHover()

    featuredHoverIntervalRef.current = window.setInterval(() => {
      setFeaturedIndex((index) => {
        if (direction === 'left') {
          return Math.max(0, index - 1)
        }
        return Math.min(maxFeaturedIndex, index + 1)
      })
    }, 550)
  }

  return (
    <div className="min-h-screen bg-[#F7F7FB] text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className={`${shellClass} flex flex-wrap items-center justify-end gap-8 py-1.5 text-xs text-slate-600`}>
          {utilityLinks.map((link) => (
            <button key={link} type="button" className="transition-colors hover:text-[#1F2E9E]">
              {link}
            </button>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-30 bg-[#1F2E9E] text-white shadow-sm">
        <div className={`${shellClass} py-1.5`}>
          <div className="grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
            <button type="button" onClick={() => navigate('/')} className="bg-[#17308E] px-5 py-3 text-left shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-[#B7F000] text-lg font-black text-[#17308E]">C</div>
                <p className="text-[2rem] font-black leading-none tracking-tight">ECOMMERCE</p>
              </div>
            </button>

            <div className="flex items-center bg-white px-4 py-2 text-slate-700">
              <input
                type="text"
                placeholder="Buscar"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-slate-400"
              />
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </div>

            <div className="relative flex items-center justify-end gap-5">
              {isAuthenticated ? (
                <button type="button" onClick={() => navigate('/admin/products')} className="flex items-center gap-2 text-sm font-semibold text-white hover:opacity-80">
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
                    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
                    <path d="M4 20a8 8 0 0 1 16 0" />
                  </svg>
                  Ir al panel
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => setShowLogin((value) => !value)} className="flex items-center gap-2 text-sm font-semibold text-white hover:opacity-80">
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
                      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
                      <path d="M4 20a8 8 0 0 1 16 0" />
                    </svg>
                    Iniciar sesion
                  </button>
                  {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
                </>
              )}
              <button type="button" className="flex items-center gap-2 text-sm font-semibold text-white hover:opacity-80">
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
                  <circle cx="9" cy="20" r="1.5" />
                  <circle cx="18" cy="20" r="1.5" />
                  <path d="M3 4h2l2.2 10.2A2 2 0 0 0 9.2 16H18a2 2 0 0 0 2-1.6L21.5 8H7.4" />
                </svg>
                Carrito
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 border-t border-white/15 pt-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-8">
              <div className="relative" ref={deptRef}>
                <button
                  type="button"
                  onClick={() => setShowDepts((value) => !value)}
                  className="flex items-center gap-1 text-sm font-bold text-white transition-opacity hover:opacity-80"
                >
                  Departamentos
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-4 w-4 transition-transform duration-200 ${showDepts ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {showDepts && (
                  <div className="absolute left-0 top-full z-50 mt-3 min-w-[240px] overflow-hidden border border-slate-100 bg-white shadow-2xl">
                    <button
                      onClick={() => {
                        setActiveCategory(null)
                        setShowDepts(false)
                      }}
                      className={`w-full px-5 py-3 text-left text-sm transition-colors hover:bg-violet-50 hover:text-[#4B2D9E] ${!activeCategory ? 'bg-violet-50 font-semibold text-[#4B2D9E]' : 'text-slate-700'}`}
                    >
                      Todos los departamentos
                    </button>
                    <div className="h-px bg-slate-100" />
                    {departments.length === 0 ? (
                      <p className="px-5 py-4 text-xs text-slate-400">Sin departamentos disponibles</p>
                    ) : (
                      departments.map((dept) => (
                        <button
                          key={dept.id}
                          onClick={() => {
                            setActiveCategory(dept.name)
                            setShowDepts(false)
                          }}
                          className={`w-full px-5 py-3 text-left text-sm transition-colors hover:bg-violet-50 hover:text-[#4B2D9E] ${
                            activeCategory === dept.name
                              ? 'bg-violet-50 font-semibold text-[#4B2D9E]'
                              : 'text-slate-700'
                          }`}
                        >
                          {dept.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {primaryLinks.map((link) => (
                <button key={link} type="button" className="text-sm font-semibold text-white/95 hover:opacity-80">
                  {link}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-8">
              {quickServices.map((service) => (
                <span key={service} className="flex items-center gap-2 text-sm font-medium text-white/95">
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
                    {service === 'Entrega rapida' ? (
                      <>
                        <path d="M3 7h10v8H3Z" />
                        <path d="M13 10h4l3 3v2h-7Z" />
                        <circle cx="7" cy="18" r="1.5" />
                        <circle cx="18" cy="18" r="1.5" />
                      </>
                    ) : (
                      <>
                        <path d="M12 3 4 7v6c0 5 3.4 7.7 8 8 4.6-.3 8-3 8-8V7Z" />
                        <path d="M9 12h6" />
                        <path d="M12 9v6" />
                      </>
                    )}
                  </svg>
                  {service}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-t border-white/15 pt-3 text-sm text-white/95">
            {staticCategories.map((category) => (
              <a key={category} href="#" className="transition-opacity hover:opacity-80">
                {category}
              </a>
            ))}
          </div>
        </div>
      </header>

      <main className={`${shellClass} py-8`}>
        <div>
          <section className="overflow-hidden rounded-none bg-gradient-to-r from-[#32186D] via-[#4B2D9E] to-[#6B46C1] text-white shadow-xl">
            <div className="grid h-full gap-8 px-7 py-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-10 lg:py-10">
              <div className="flex flex-col justify-between">
                <div>
                  <p className="inline-flex rounded-none bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-violet-100">
                    {activeCategory ? `Departamento: ${activeCategory}` : 'Temporada hogar'}
                  </p>
                  <h1 className="mt-4 max-w-3xl text-4xl font-black leading-none tracking-tight md:text-6xl">
                    Inspiracion para cocinar, decorar y regalar mejor
                  </h1>
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-violet-100 md:text-base">
                    Descubre nuestra seleccion de productos para el hogar. Calidad y estilo en cada pieza.
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button type="button" className="rounded-none bg-white px-5 py-3 text-sm font-bold text-[#32186D] transition-transform hover:-translate-y-0.5">
                    Comprar ahora
                  </button>
                  <button type="button" className="rounded-none border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                    Ver novedades
                  </button>
                </div>
              </div>
              <div className="grid gap-3 rounded-none bg-white/10 p-5 backdrop-blur-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-violet-100">Total productos</p>
                  <p className="mt-2 text-4xl font-black">{products.length}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-violet-100">
                    {activeCategory ? `En ${activeCategory}` : 'Disponibles'}
                  </p>
                  <p className="mt-2 text-4xl font-black">{filteredProducts.length}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-none border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-600">
                {activeCategory ? `Departamento - ${activeCategory}` : 'Seleccion destacada'}
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {activeCategory || 'Destacados'}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {activeCategory && (
                <button
                  onClick={() => setActiveCategory(null)}
                  className="rounded-none border border-slate-300 px-4 py-2 text-sm text-slate-600 transition-colors hover:border-[#4B2D9E] hover:text-[#4B2D9E]"
                >
                  Limpiar filtro
                </button>
              )}
              <p className="text-sm text-slate-500">
                {loading ? 'Cargando...' : `${featuredProducts.length} producto${featuredProducts.length === 1 ? '' : 's'}`}
              </p>
            </div>
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-80 animate-pulse rounded-none border border-slate-100 bg-slate-50" />
                ))}
              </div>
            ) : error ? (
              <EmptyState
                eyebrow="Mantenimiento del sitio"
                title="Estamos realizando ajustes temporales"
                description="El catalogo no esta disponible en este momento. Intenta nuevamente mas tarde mientras restablecemos la conexion con el servicio."
              />
            ) : featuredProducts.length > 0 ? (
              <>
                <div
                  className="relative"
                  onMouseLeave={stopFeaturedHover}
                >
                  {featuredProducts.length > featuredVisibleItems && (
                    <>
                      <div
                        className={`absolute inset-y-0 left-0 z-10 hidden w-20 bg-gradient-to-r from-white via-white/90 to-transparent xl:block ${
                          featuredIndex === 0 ? 'pointer-events-none opacity-0' : 'cursor-w-resize opacity-100'
                        }`}
                        onMouseEnter={() => startFeaturedHover('left')}
                        aria-hidden="true"
                      />
                      <div
                        className={`absolute inset-y-0 right-0 z-10 hidden w-20 bg-gradient-to-l from-white via-white/90 to-transparent xl:block ${
                          featuredIndex >= maxFeaturedIndex ? 'pointer-events-none opacity-0' : 'cursor-e-resize opacity-100'
                        }`}
                        onMouseEnter={() => startFeaturedHover('right')}
                        aria-hidden="true"
                      />
                    </>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {visibleFeaturedProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                  </div>
                </div>
              </>
            ) : (
              <EmptyState
                eyebrow="Inventario disponible"
                title="Aun no hay productos destacados"
                description="Esta seccion mostrara automaticamente los ultimos productos agregados cuando el catalogo tenga inventario disponible."
              />
            )}
          </div>
        </section>

        <div className="mt-16 bg-white px-4 py-10">
          <div className="mx-auto max-w-5xl border-t-2 border-slate-300" />
        </div>

        <section className="mt-16 rounded-none border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-600">Catalogo de productos</p>
            </div>
            {!loading && !error && filteredProducts.length > 0 && (
              <p className="text-sm text-slate-500">
                Pagina {currentPage} de {totalPages}
              </p>
            )}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {!error && paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="sm:col-span-2 xl:col-span-4">
                <EmptyState
                  eyebrow={error ? 'Mantenimiento del sitio' : 'Catalogo de productos'}
                  title={error ? 'Destacados no disponibles temporalmente' : 'Aun no hay productos disponibles'}
                  description={
                    error
                      ? 'No pudimos cargar esta seccion porque el servicio del catalogo no esta respondiendo en este momento.'
                      : 'Esta seccion se llenara automaticamente cuando existan productos activos disponibles para mostrar.'
                  }
                />
              </div>
            )}
          </div>
          {!loading && !error && filteredProducts.length > productsPerPage && (
            <div className="mt-6 flex items-center justify-center gap-3 border-t border-slate-100 pt-5">
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
        </section>
      </main>

      <footer className="mt-10 border-t border-slate-200 bg-white">
        <div className="bg-[#1F2E9E] text-white">
          <div className={`${shellClass} flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-4 text-sm font-semibold`}>
            <span className="flex items-center gap-3">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 10h18" />
                <path d="M5 10V6h14v4" />
                <path d="M6 10v8" />
                <path d="M18 10v8" />
                <path d="M4 18h16" />
              </svg>
              Tiendas
            </span>
            <span className="flex items-center gap-3">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m4 7 8 6 8-6" />
              </svg>
              tusamigos@ecommerce.com
            </span>
            <span className="flex items-center gap-3">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3a8.5 8.5 0 0 0-7.4 12.7L3 21l5.5-1.4A8.5 8.5 0 1 0 12 3Z" />
                <path d="M8.5 10.5c0-.6.5-1 1-1h5c.6 0 1 .4 1 1v4c0 .6-.4 1-1 1h-2.2l-2.3 2v-2H9.5c-.5 0-1-.4-1-1Z" />
              </svg>
              Compra por WhatsApp
            </span>
            <span className="flex items-center gap-3">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2 4.1 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7l.5 3.3a2 2 0 0 1-.6 1.7l-1.4 1.4a16 16 0 0 0 6.4 6.4l1.4-1.4a2 2 0 0 1 1.7-.6l3.3.5A2 2 0 0 1 22 16.9Z" />
              </svg>
              (502) 2499-9990
            </span>
            <span className="flex items-center gap-3">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
              </svg>
              Chat en linea
            </span>
          </div>
        </div>

        <div className={`${shellClass} py-10`}>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_1.95fr]">
            <section className="bg-[#16256F] px-7 py-8 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-200">Suscribete</p>
              <h2 className="mt-3 text-4xl font-black leading-tight">Recibe novedades y promociones</h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
                Ofertas exclusivas, nuevos productos y beneficios especiales directo a tu correo.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="min-w-0 flex-1 rounded-none border border-white/10 bg-white/10 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-violet-300"
                />
                <button type="button" className="rounded-none bg-[#B6EF27] px-5 py-3 text-sm font-bold text-[#16256F] transition-transform hover:-translate-y-0.5">
                  Suscribirme
                </button>
              </div>
            </section>

            <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {footerColumns.map((column) => (
                <div key={column.title}>
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-900">{column.title}</h3>
                  <div className="mt-4 space-y-3">
                    {column.links.map((link) => (
                      <a key={link} href="#" className="block text-sm text-slate-500 transition-colors hover:text-[#4B2D9E]">{link}</a>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <a href="#" className="hover:text-[#4B2D9E]">Privacidad</a>
              <a href="#" className="hover:text-[#4B2D9E]">Terminos y condiciones</a>
              <a href="#" className="hover:text-[#4B2D9E]">Ayuda</a>
            </div>
            <span>Ecommerce {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
