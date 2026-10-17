import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import ErrorMessage from '../components/ui/ErrorMessage';
import FormField from '../components/ui/FormField';
import { useAuth } from '../context/useAuth';
import { login, obtenerUsuarioLogueado } from '../services/usuariosService';
import { sinErrores, validarEmail } from '../utils/validaciones';
import './Acceso.css';

function validar({ email, password }) {
  return {
    email: validarEmail(email),
    password: password === '' ? 'Ingresá tu contraseña' : undefined,
  };
}

export default function LoginPage() {
  const { estaLogueado, iniciarSesion } = useAuth();
  const location = useLocation();
  // PrivateRoute y AdminRoute dejan en el state la página que se quiso abrir.
  const destino = location.state?.desde ?? '/';
  // Lo deja RegistroPage si la cuenta se creó pero no se pudo entrar automáticamente.
  const emailRegistrado = location.state?.emailRegistrado;

  const [valores, setValores] = useState({ email: emailRegistrado ?? '', password: '' });
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Cubre al que entra a /login ya logueado y también el redirect después de iniciarSesion().
  if (estaLogueado) return <Navigate to={destino} replace />;

  const cambiar = (evento) => {
    const { name, value } = evento.target;
    setValores((actuales) => ({ ...actuales, [name]: value }));
    if (errores[name]) setErrores((actuales) => ({ ...actuales, [name]: undefined }));
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const nuevosErrores = validar(valores);
    setErrores(nuevosErrores);
    if (!sinErrores(nuevosErrores)) return;

    setEnviando(true);
    setErrorServidor(null);
    try {
      const authResponse = await login({ email: valores.email.trim(), password: valores.password });
      const usuario = await obtenerUsuarioLogueado(authResponse.token);
      iniciarSesion(authResponse, usuario);
    } catch (error) {
      setErrorServidor(error);
      setEnviando(false);
    }
  };

  return (
    <section className="acceso">
      <h1 className="acceso__titulo">Ingresar</h1>
      <p className="acceso__subtitulo">Entrá con tu cuenta para comprar y ver tus órdenes.</p>

      {emailRegistrado && !errorServidor && (
        <Alert tipo="exito" titulo="¡Tu cuenta está lista!">
          Ingresá con tu email y contraseña.
        </Alert>
      )}

      {/* El 401 del login es "credenciales incorrectas", no "tenés que iniciar sesión" como en ErrorMessage. */}
      {errorServidor?.status === 401 ? (
        <Alert tipo="error" titulo="Email o contraseña incorrectos">
          Revisá los datos y probá de nuevo.
        </Alert>
      ) : (
        <ErrorMessage error={errorServidor} />
      )}

      <form onSubmit={enviar} noValidate>
        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={valores.email}
          onChange={cambiar}
          error={errores.email}
          required
        />
        <FormField
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          value={valores.password}
          onChange={cambiar}
          error={errores.password}
          required
        />
        <Button type="submit" bloque cargando={enviando}>
          Ingresar
        </Button>
      </form>

      <p className="acceso__pie">
        ¿No tenés cuenta?{' '}
        <Link to="/registro" state={location.state}>
          Creá una
        </Link>
      </p>
    </section>
  );
}
