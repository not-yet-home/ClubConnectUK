import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  plugins: [
    devtools(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    // Only enable Nitro plugin in production or when explicitly enabled via env
    // This avoids the Nitro dev worker running during local Vite dev which
    // can cause the "Vite environment \"nitro\" is unavailable" error
    // when the environment or registry doesn't support the nitro worker.
    (process.env.NODE_ENV === 'production' || process.env.ENABLE_NITRO === 'true') ? nitro() : undefined,
    viteReact({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
})

export default config
