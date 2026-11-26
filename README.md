# front-Football_scorer

Front en React del TPO de **Aplicaciones Interactivas (UADE, 2C 2026)**: e-commerce de
productos de clubes de fútbol.

Back: [back-Football_scorer](https://github.com/nicofacen/back-Football_scorer)

## Diseño

- Figma (style guide, mockup de las 14 pantallas en desktop y mobile, wireflow con los
  componentes clave por pantalla y el contrato de datos JSON):
  https://www.figma.com/design/LzEKsANieKnxv9MujFBzt9
- Export en [`docs/mockup-y-wireflow.pdf`](docs/mockup-y-wireflow.pdf) y una imagen por pantalla en
  [`docs/mockup/`](docs/mockup/)

## Cómo levantarlo

Requiere Node 20 o superior.

```bash
npm install
npm run dev
```

La app queda en http://localhost:5173.

## Tecnologías

- React + Vite
- React Router
- Redux Toolkit + redux-persist
- CSS

## Persistencia y seguridad

- El tema claro/oscuro se guarda en `localStorage`.
- La sesión (token) se guarda en `sessionStorage` con redux-persist: sobrevive a un F5 y se
  borra al cerrar la pestaña o cuando vence el token.
- El build incluye una Content-Security-Policy contra XSS. Para probarla: `npm run build` y
  `npm run preview`.

El análisis de las opciones, la decisión y las mitigaciones están en
[`docs/persistencia-y-seguridad.md`](docs/persistencia-y-seguridad.md).

## Datos

Por ahora las pantallas leen archivos JSON de `public/data/`, con el mismo formato que
devuelve el back. Más adelante se reemplazan por llamadas a la API.

Para probar las pantallas de cliente y de admin sin login, usar el selector **"Ver como"**
del footer.

## Estructura

```
public/data/     JSON con los datos de prueba
src/
  components/    Componentes reutilizables
  context/       Sesión del usuario
  pages/         Una página por pantalla
  routes/        Rutas protegidas
  services/      Acceso a los datos
  store/         Redux: slices y persistencia
  styles/        Estilos globales
  utils/         Funciones de formato
```
