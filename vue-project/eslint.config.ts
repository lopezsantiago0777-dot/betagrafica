import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { globalIgnores } from 'eslint/config'
import { configureVueProject, defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

configureVueProject({
  rootDir: dirname(fileURLToPath(import.meta.url)),
})

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    name: 'app/absolute-tsconfig-root-dir',
    files: ['**/*.{js,mjs,cjs,ts,mts,tsx,vue}'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: dirname(fileURLToPath(import.meta.url)),
      },
    },
  },
)
