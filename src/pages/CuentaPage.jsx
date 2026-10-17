import { useEffect, useState } from 'react';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import ErrorMessage from '../components/ui/ErrorMessage';
import FormField from '../components/ui/FormField';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../context/useAuth';
import { actualizarUsuario, obtenerUsuario } from '../services/usuariosService';
import { sinErrores, validarEmail } from '../utils/validaciones';
import './CuentaPage.css';

const ROLES = { CLIENTE: 'Cliente', ADMIN: 'Administrador' };

function aValores({ nombre, apellido, email }) {
  return { nombre, apellido, email };
}

// Mismas reglas que ActualizarUsuarioRequest del back.
function validar({ nombre, apellido, email }) {
  return {
    nombre: nombre.trim() === '' ? 'Ingresá tu nombre' : undefined,
    apellido: apellido.trim() === '' ? 'Ingresá tu apellido' : undefined,
    email: validarEmail(email),
  };
}

export default function CuentaPage() {
  // PrivateRoute garantiza que hay usuario logueado.
  const { usuario, token, iniciarSesion } = useAuth();
  const { id, rol } = usuario;

  const [datos, setDatos] = useState(null);
  const [errorCarga, setErrorCarga] = useState(null);
  const [intento, setIntento] = useState(0);

  const [valores, setValores] = useState(null);
  const [errores, setErrores] = useState({});
  const [errorGuardado, setErrorGuardado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  // Depende solo de id y rol: si dependiera de `usuario`, guardar (que actualiza la sesión)
  // volvería a disparar la carga.
  useEffect(() => {
    let vigente = true;
    setErrorCarga(null);

    obtenerUsuario(id, { id, rol })
      .then((respuesta) => {
        if (!vigente) return;
        setDatos(respuesta);
        setValores(aValores(respuesta));
      })
      .catch((error) => vigente && setErrorCarga(error));

    return () => {
      vigente = false;
    };
  }, [id, rol, intento]);

  if (errorCarga) {
    return (
      <section className="cuenta">
        <h1>Mi cuenta</h1>
        <ErrorMessage error={errorCarga} onReintentar={() => setIntento((n) => n + 1)} />
      </section>
    );
  }

  if (!datos) return <Spinner texto="Cargando tus datos..." />;

  const hayCambios = Object.keys(valores).some((clave) => valores[clave].trim() !== datos[clave]);

  const cambiar = (evento) => {
    const { name, value } = evento.target;
    setValores((actuales) => ({ ...actuales, [name]: value }));
    setGuardado(false);
    if (errores[name]) setErrores((actuales) => ({ ...actuales, [name]: undefined }));
  };

  const descartar = () => {
    setValores(aValores(datos));
    setErrores({});
    setErrorGuardado(null);
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const nuevosErrores = validar(valores);
    setErrores(nuevosErrores);
    if (!sinErrores(nuevosErrores)) return;

    setGuardando(true);
    setErrorGuardado(null);
    try {
      const actualizado = await actualizarUsuario(
        id,
        { nombre: valores.nombre.trim(), apellido: valores.apellido.trim(), email: valores.email.trim() },
        { id, rol },
      );
      setDatos(actualizado);
      setValores(aValores(actualizado));
      setGuardado(true);
      // Mismo token, usuario nuevo: así el "Hola, ..." del navbar se actualiza.
      // OJO con el back real: el JWT tiene el email adentro, así que si cambia el email el token
      // deja de servir y hay que volver a loguearse.
      iniciarSesion({ token, tipo: 'Bearer' }, actualizado);
    } catch (error) {
      setErrorGuardado(error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="cuenta">
      <h1>Mi cuenta</h1>

      <div className="cuenta__tarjeta">
        <div className="cuenta__resumen">
          <span className="cuenta__avatar" aria-hidden="true">
            {datos.nombre.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="cuenta__nombre">
              {datos.nombre} {datos.apellido}
            </p>
            <p className="cuenta__rol">Cuenta de {ROLES[datos.rol]?.toLowerCase() ?? datos.rol}</p>
          </div>
        </div>

        {guardado && (
          <Alert tipo="exito" titulo="Guardamos tus cambios" onCerrar={() => setGuardado(false)} />
        )}
        <ErrorMessage error={errorGuardado} />

        <form onSubmit={enviar} noValidate>
          <div className="cuenta__fila">
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

          <div className="cuenta__acciones">
            <Button variante="secundario" onClick={descartar} disabled={!hayCambios || guardando}>
              Descartar
            </Button>
            <Button type="submit" cargando={guardando} disabled={!hayCambios}>
              Guardar cambios
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
