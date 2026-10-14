import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <Navbar />
      <main className="layout__principal">
        <div className="contenedor">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
