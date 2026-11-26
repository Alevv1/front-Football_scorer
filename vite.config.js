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
    'connect-src': ["'self'", origenApi],
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const origenApi = new URL(env.VITE_API_URL ?? 'http://localhost:8080/api').origin

  return {
    plugins: [react(), politicaDeSeguridad(origenApi)],
  }
})
