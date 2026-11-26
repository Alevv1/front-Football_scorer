import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App';
import { persistor, store } from './store';
import AplicarTema from './store/AplicarTema';
import CerrarSesionVencida from './store/CerrarSesionVencida';
import SincronizarCarrito from './store/SincronizarCarrito';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      {/* No dibuja nada hasta recuperar lo guardado: evita el parpadeo del tema. */}
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <AplicarTema />
          <CerrarSesionVencida />
          <SincronizarCarrito />
          <App />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>,
);
