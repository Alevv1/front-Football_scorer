import { Route, Routes } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import Layout from './components/layout/Layout';
import CarritoPage from './pages/CarritoPage';
import CatalogoPage from './pages/CatalogoPage';
import ClubDetallePage from './pages/ClubDetallePage';
import ClubesPage from './pages/ClubesPage';
import CuentaPage from './pages/CuentaPage';
import FavoritosPage from './pages/FavoritosPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import OrdenDetallePage from './pages/OrdenDetallePage';
import OrdenesPage from './pages/OrdenesPage';
import ProductoDetallePage from './pages/ProductoDetallePage';
import RegistroPage from './pages/RegistroPage';
import AdminCategoriasPage from './pages/admin/AdminCategoriasPage';
import AdminClubesPage from './pages/admin/AdminClubesPage';
import AdminProductosPage from './pages/admin/AdminProductosPage';
import AdminRoute from './routes/AdminRoute';
import PrivateRoute from './routes/PrivateRoute';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<CatalogoPage />} />
        <Route path="productos/:id" element={<ProductoDetallePage />} />
        <Route path="clubes" element={<ClubesPage />} />
        <Route path="clubes/:id" element={<ClubDetallePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="registro" element={<RegistroPage />} />

        <Route element={<PrivateRoute />}>
          <Route path="cuenta" element={<CuentaPage />} />
          <Route path="carrito" element={<CarritoPage />} />
          <Route path="ordenes" element={<OrdenesPage />} />
          <Route path="ordenes/:id" element={<OrdenDetallePage />} />
          <Route path="favoritos" element={<FavoritosPage />} />
        </Route>

        <Route path="admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="productos" element={<AdminProductosPage />} />
            <Route path="clubes" element={<AdminClubesPage />} />
            <Route path="categorias" element={<AdminCategoriasPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
