import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Content-Security-Policy: primera barrera contra XSS. Si alguien logra inyectar un <script>
// o un handler inline, el navegador no lo ejecuta, y aunque lo ejecutara solo podría mandar
// datos a nuestro propio origen y a la API (connect-src), no a un servidor del atacante.
// Solo se aplica al build: en desarrollo Vite necesita scripts inline para la recarga en caliente.
function politicaDeSeguridad(origenApi) {
  const directivas = {
    'default-src': ["'self'"],
    'script-src': ["'self'"],
    'style-src': ["'self'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'", ...(origenApi ? [origenApi] : [])],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  }
  const contenido = Object.entries(directivas)
    .map(([directiva, valores]) => `${directiva} ${valores.join(' ')}`)
    .join('; ')

  return {
    name: 'content-security-policy',
    apply: 'build',
    transformIndexHtml: () => [
      { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: contenido }, injectTo: 'head-prepend' },
    ],
  }
}

// El front llama a /api en su propio origen y Vite lo reenvía al back. Así el navegador nunca
// hace una request a otro origen y no hace falta configurar CORS en el back.
const proxyApi = {
  '/api': { target: 'http://localhost:8080', changeOrigin: true },
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  // Solo si se configura una API en otro origen (VITE_API_URL absoluta) hay que permitirla en la CSP.
  const origenApi = /^https?:\/\//.test(env.VITE_API_URL ?? '') ? new URL(env.VITE_API_URL).origin : null

  return {
    plugins: [react(), politicaDeSeguridad(origenApi)],
    server: { proxy: proxyApi },
    preview: { proxy: proxyApi },
  }
})
