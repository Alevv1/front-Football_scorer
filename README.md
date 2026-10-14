# front-Football_scorer

Front en React del TPO de **Aplicaciones Interactivas (UADE, 2C 2026)**: e-commerce de
productos de clubes de fútbol.

Back: [back-Football_scorer](https://github.com/nicofacen/back-Football_scorer)

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
- CSS

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
  styles/        Estilos globales
  utils/         Funciones de formato
```
