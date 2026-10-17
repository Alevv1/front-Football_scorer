import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import ErrorMessage from '../components/ui/ErrorMessage';
import FormField from '../components/ui/FormField';
import { useAuth } from '../context/useAuth';
import { login, obtenerUsuarioLogueado, registrar } from '../services/usuariosService';
import { MINIMO_PASSWORD, sinErrores, validarEmail } from '../utils/validaciones';
import './Acceso.css';

const VALORES_INICIALES = { nombre: '', apellido: '', email: '', password: '', confirmacion: '' };

// Mismas reglas que RegistroRequest del back, más la confirmación que es solo del front.
function validar({ nombre, apellido, email, password, confirmacion }) {
  let errorPassword;
  if (password === '') errorPassword = 'Ingresá una contraseña';
  else if (password.length < MINIMO_PASSWORD) errorPassword = `Tiene que tener al menos ${MINIMO_PASSWORD} caracteres`;

  return {
    nombre: nombre.trim() === '' ? 'Ingresá tu nombre' : undefined,
    apellido: apellido.trim() === '' ? 'Ingresá tu apellido' : undefined,
    email: validarEmail(email),
    password: errorPassword,
    confirmacion: confirmacion !== password ? 'Las contraseñas no coinciden' : undefined,
  };
}

export default function RegistroPage() {
  const { estaLogueado, iniciarSesion } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  // Viene de LoginPage, que a su vez lo recibe de PrivateRoute/AdminRoute.
  const destino = location.state?.desde ?? '/';

  const [valores, setValores] = useState(VALORES_INICIALES);
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState(null);
  const [enviando, setEnviando] = useState(false);

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

    const datos = {
      nombre: valores.nombre.trim(),
      apellido: valores.apellido.trim(),
      email: valores.email.trim(),
      password: valores.password,
    };

    setEnviando(true);
    setErrorServidor(null);
    try {
      await registrar(datos);
    } catch (error) {
      if (error.status === 409) setErrores({ email: 'Ya hay una cuenta con este email' });
      else setErrorServidor(error);
      setEnviando(false);
      return;
    }

    // El register del back no devuelve token, así que entramos con los mismos datos.
    try {
      const authResponse = await login({ email: datos.email, password: datos.password });
      const usuario = await obtenerUsuarioLogueado(authResponse.token);
      iniciarSesion(authResponse, usuario);
    } catch {
      // La cuenta ya existe: si falla el login automático, que entre a mano.
      navigate('/login', { replace: true, state: { ...location.state, emailRegistrado: datos.email } });
    }
  };

  return (
    <section className="acceso">
      <h1 className="acceso__titulo">Crear cuenta</h1>
      <p className="acceso__subtitulo">Registrate para comprar productos de tus clubes favoritos.</p>

      <ErrorMessage error={errorServidor} />

      <form onSubmit={enviar} noValidate>
        <div className="acceso__fila">
          <FormField
            label="Nombre"
            name="nombre"
            autoComplete="given-name"
            value={valores.nombre}
            onChange={cambiar}
            error={errores.nombre}
            required
          />
          <FormField
            label="Apellido"
            name="apellido"
            autoComplete="family-name"
            value={valores.apellido}
            onChange={cambiar}
            error={errores.apellido}
            required
          />
        </div>
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
          autoComplete="new-password"
          ayuda={`Mínimo ${MINIMO_PASSWORD} caracteres`}
          value={valores.password}
          onChange={cambiar}
          error={errores.password}
          required
        />
        <FormField
          label="Repetí la contraseña"
          name="confirmacion"
          type="password"
          autoComplete="new-password"
          value={valores.confirmacion}
          onChange={cambiar}
          error={errores.confirmacion}
          required
        />
        <Button type="submit" bloque cargando={enviando}>
          Crear cuenta
        </Button>
      </form>

      <p className="acceso__pie">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" state={location.state}>
          Ingresá
        </Link>
      </p>
    </section>
  );
}
