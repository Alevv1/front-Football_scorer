# Persistencia de datos y seguridad de la sesión

Este documento explica qué datos guarda el front en el navegador, qué solución elegimos para
que la sesión sobreviva a un F5, por qué, y cómo mitigamos los ataques de cada opción.

## 1. Qué se guarda y dónde

| Dato | Slice de Redux | Storage | Clave | Cuánto dura |
|---|---|---|---|---|
| Tema claro/oscuro | `preferencias` | `localStorage` | `persist:preferencias` | Hasta que la persona lo cambie, aunque cierre el navegador |
| Sesión: `token`, `tipo`, `expiraEn` y datos básicos del usuario (`id`, `nombre`, `apellido`, `email`, `rol`) | `auth` | `sessionStorage` | `persist:auth` | Hasta cerrar la pestaña, apretar "Salir" o que venza el token |

No se guarda nada más. La contraseña nunca se guarda, y el carrito, los productos y las órdenes
se vuelven a pedir al back en cada carga.

**Por qué el tema va en localStorage:** no es un dato sensible. Si alguien lo lee o lo modifica,
lo peor que puede pasar es que la página se vea clara en vez de oscura. Tiene sentido que dure
entre visitas.

## 2. Opciones analizadas para el token

| | Fácil: localStorage | Intermedio: redux-persist | Avanzado: cookie HTTP-Only |
|---|---|---|---|
| Cómo funciona | Se escribe el token a mano con `localStorage.setItem` en cada cambio | Se declara qué slices persistir y en qué storage; la librería guarda y recupera sola | El back manda el token en una cookie `HttpOnly`; el navegador la adjunta en cada request |
| ¿JavaScript puede leer el token? | Sí | Sí: redux-persist usa por debajo localStorage o sessionStorage | **No** |
| Ataque principal | XSS: un script inyectado lee el token y lo manda a otro servidor | XSS, igual que el storage que use | CSRF: otro sitio provoca una request y el navegador adjunta la cookie solo |
| Cambios en el back | Ninguno | Ninguno | Login con `Set-Cookie`, filtro JWT que lea la cookie, endpoint de logout, CORS con credenciales y protección CSRF |
| Lo que aporta | Simple | Persistencia por slice con `whitelist`, versionado, `transforms` para validar lo que se recupera y `PersistGate` | La mejor protección del token frente a XSS |

Antes de este cambio el proyecto usaba la opción fácil: `store/index.js` escribía la sesión
completa en `localStorage` en cada cambio y ahí quedaba indefinidamente.

## 3. Decisión: redux-persist con sessionStorage

Elegimos **redux-persist**, guardando la sesión en **sessionStorage** y las preferencias en
**localStorage**. Los motivos:

1. **El back ya usa `Authorization: Bearer <token>`.** Con el token en el storage, el navegador
   no lo adjunta solo a ninguna request: lo agrega nuestro código. Un sitio ajeno no puede leer
   nuestro storage (política del mismo origen), así que **CSRF no aplica a este esquema**. Por
   eso el `csrf.disable()` de `SecurityConfig` en el back es correcto para este diseño. Con cookies
   HTTP-Only habría que volver a habilitar CSRF y agregar tokens anti-CSRF.
2. **No requiere cambiar el back**, que está en otro repositorio. La opción de cookies obliga a
   modificar el login, el filtro JWT, CORS y la configuración de CSRF a la vez.
3. **sessionStorage acota la exposición del token.** Se borra al cerrar la pestaña, no se
   comparte con otras pestañas y no queda guardado en el disco por tiempo indefinido. El costo es
   que abrir el sitio en otra pestaña pide login de nuevo; lo consideramos aceptable.
4. **redux-persist hace la persistencia declarativa y controlable:**
   - `whitelist: ['sesion']`: se guarda solo lo indicado.
   - Un `transform` valida la sesión al recuperarla y descarta las vencidas o alteradas.
   - `PersistGate` espera a recuperar los datos antes de dibujar la app. Así `PrivateRoute` no
     manda al login por error durante el primer instante después de un F5, y el tema no parpadea.

**Riesgo que aceptamos:** si un ataque XSS lograra ejecutarse, podría leer el token mientras la
pestaña está abierta. Por eso sumamos las mitigaciones de la sección 4: el objetivo es que el XSS
no pueda ejecutarse y, si se ejecutara, que no pueda sacar el token ni usarlo por mucho tiempo.

## 4. Ataques y mitigaciones

### XSS: robo del token

| Mitigación | Cómo funciona | Dónde |
|---|---|---|
| Content-Security-Policy | `script-src 'self'`: el navegador no ejecuta scripts inline ni inyectados, solo los archivos de nuestro propio origen. `connect-src 'self' <API>`: aunque un script corriera, no podría mandar el token a un servidor del atacante. También `object-src 'none'` y `base-uri 'self'`. | `vite.config.js` (se agrega al `index.html` del build) |
| React escapa el contenido | Todo texto que se muestra (nombres de productos, mensajes del back) se inserta como texto, nunca como HTML. No usamos `dangerouslySetInnerHTML`, `innerHTML` ni `eval` (verificado con búsqueda en `src/`). | Toda la app |
| Token con vencimiento | Se guarda `expiraEn`, que manda el back en el login (24 h). Al recargar se descarta la sesión vencida, y si vence con la pestaña abierta se cierra la sesión en ese momento. | `authSlice.js` (`sesionVigente`), `store/index.js` (transform), `CerrarSesionVencida.jsx` |
| sessionStorage | El token no sobrevive a cerrar la pestaña ni se comparte entre pestañas. | `store/index.js` |
| Datos mínimos | Solo se guarda lo necesario para la interfaz. Nada de contraseñas ni datos de pago. | `authSlice.js` |
| Limpieza del esquema anterior | Al iniciar se borra la clave `sesion` que la versión anterior dejaba en localStorage. | `store/index.js` |

### Manipulación del storage

Cualquiera puede abrir las herramientas del navegador y editar su propio storage, por ejemplo
para cambiar su `rol` a `ADMIN`.

- En el front, una sesión incompleta o alterada (sin `expiraEn`, sin token o sin usuario) se
  descarta al recargar.
- **La protección real está en el back:** el rol que vale es el que está firmado adentro del JWT, y
  `SecurityConfig` exige `hasRole('ADMIN')` en las rutas de administración. Editar el storage solo
  cambia lo que muestra el front; la API responde 401 o 403.

### CSRF

No aplica con el esquema elegido: el token viaja en una cabecera que agrega nuestro código, no en
una cookie que el navegador manda solo. Si en el futuro se pasara a cookies HTTP-Only, habría que:

- Configurar la cookie con `SameSite=Strict` (o `Lax`), `Secure` y `HttpOnly`.
- Habilitar la protección CSRF de Spring Security con un token anti-CSRF (patrón *double submit*).
- Configurar CORS con `allowCredentials(true)` y el origen exacto del front, nunca `*`.

### Límites conocidos

- **CSP solo en el build:** en desarrollo (`npm run dev`) no se aplica, porque Vite necesita
  scripts inline para la recarga en caliente. Para probarla hay que usar `npm run build` y
  `npm run preview`.
- **`frame-ancestors`:** una CSP en `<meta>` no admite esa directiva, que protege contra
  *clickjacking*. En producción la CSP debería enviarse como cabecera HTTP desde el servidor, junto
  con `X-Frame-Options: DENY`.
- **Duración del token:** 24 h es largo. Lo recomendable es un token de pocos minutos más un
  *refresh token*, pero eso requiere cambios en el back y queda fuera del alcance de esta entrega.

## 5. Archivos

| Archivo | Qué hace |
|---|---|
| `src/store/index.js` | Configura redux-persist: `preferencias` en localStorage, `auth` en sessionStorage con el transform que descarta sesiones vencidas |
| `src/store/slices/preferenciasSlice.js` | Guarda el tema elegido |
| `src/store/slices/authSlice.js` | Sesión con `expiraEn`; `sesionVigente()` decide si una sesión se puede usar |
| `src/store/AplicarTema.jsx`, `src/hooks/useTema.js` | Aplican el tema y respetan el del sistema operativo si la persona no eligió |
| `src/store/CerrarSesionVencida.jsx` | Cierra la sesión cuando vence el token |
| `src/services/sesionActual.js` | Los services simulados consultan el usuario logueado acá, en vez de leer el storage por su cuenta |
| `src/main.jsx` | `PersistGate` |
| `vite.config.js` | Content-Security-Policy del build |

## 6. Cómo se probó

Pruebas hechas en Chrome sobre el build (`npm run build` + `npm run preview`), salvo las del tema,
que se hicieron con `npm run dev`:

| Prueba | Resultado |
|---|---|
| Elegir tema oscuro, apretar F5 y abrir otra pestaña | Se mantiene en las dos |
| Sin elegir tema, con el sistema operativo en oscuro | La app arranca en oscuro |
| Iniciar sesión, ir a Mi cuenta y apretar F5 | Sigue logueado en Mi cuenta |
| Revisar el storage después del login | Token solo en sessionStorage; en localStorage queda únicamente `persist:preferencias` |
| Abrir `/cuenta` en una pestaña nueva | Pide login |
| "Salir" y F5 | La sesión queda en `null` y no vuelve |
| Editar `expiraEn` a una fecha pasada y recargar | La sesión se descarta |
| Cargar a mano una sesión con `rol: ADMIN` y sin `expiraEn` | Se descarta |
| Sesión que vence a los 2 segundos | Se cierra sola al vencer |
| Inyectar un `<script>` en la página | El navegador lo bloquea y lo informa como violación de la CSP |
| Navegar la app con la CSP activa | Ninguna violación de la política |
| Tests automatizados (`tests/favoritos-admin.test.mjs`) | 5 de 5 pasan |

Para verlo a mano: herramientas del navegador (F12) → **Application** → **Local Storage** y
**Session Storage** → `http://localhost:5173`.
