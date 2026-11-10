import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// En desarrollo sirve /api/predecir con el mismo handler que usa Vercel en
// produccion, para que `npm run dev` baste y no haga falta `vercel dev`.
function apiLocal(mode) {
  return {
    name: 'api-local',
    apply: 'serve',
    configureServer(server) {
      // Las variables sin prefijo VITE_ (ANTHROPIC_API_KEY) solo las lee este proceso de Node.
      const env = loadEnv(mode, process.cwd(), '')
      for (const [clave, valor] of Object.entries(env)) {
        if (clave.startsWith('ANTHROPIC_') && !(clave in process.env)) process.env[clave] = valor
      }

      server.middlewares.use('/api/predecir', async (req, res) => {
        res.status = (codigo) => {
          res.statusCode = codigo
          return res
        }
        res.json = (cuerpo) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(cuerpo))
        }

        try {
          const trozos = []
          for await (const trozo of req) trozos.push(trozo)
          try {
            req.body = JSON.parse(Buffer.concat(trozos).toString() || 'null')
          } catch {
            req.body = null
          }
          const { default: handler } = await server.ssrLoadModule('/api/predecir.js')
          await handler(req, res)
        } catch (err) {
          console.error(err)
          if (!res.headersSent) res.status(500).json({ error: 'Error interno' })
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),   // ← esto es todo lo que necesita Tailwind v4
    apiLocal(mode),
  ],
}))
