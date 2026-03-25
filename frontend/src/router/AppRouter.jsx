import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute        from './PrivateRoute'
import ProductsPage        from '../pages/admin/products/ProductsPage'
import ProductFormPage     from '../pages/admin/products/ProductFormPage'
import CatalogPage         from '../pages/public/CatalogPage'
import CategoriesPage      from '../pages/admin/categories/CategoriesPage'
import CategoryFormPage    from '../pages/admin/categories/CategoryFormPage'

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"                     element={<CatalogPage />} />

      {/* Admin */}
      <Route path="/admin"                element={<PrivateRoute />}>
        <Route index                      element={<Navigate to="/admin/products" replace />} />
        <Route path="products"            element={<ProductsPage />} />
        <Route path="products/new"        element={<ProductFormPage />} />
        <Route path="products/:id/edit"   element={<ProductFormPage />} />
        <Route path="categories"          element={<CategoriesPage />} />
        <Route path="categories/new"      element={<CategoryFormPage />} />
        <Route path="categories/:id/edit" element={<CategoryFormPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}