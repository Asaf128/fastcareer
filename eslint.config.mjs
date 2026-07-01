import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'src/types/database.ts']),
  {
    rules: {
      // 300-Zeilen-Regel
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],

      // Kein `any`
      '@typescript-eslint/no-explicit-any': 'error',

      // Kein console.log (nur .error / .warn erlaubt)
      'no-console': ['warn', { allow: ['error', 'warn'] }],

      // Konsistente Type-Imports
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },
  {
    // Ausnahme für Next.js-Dateien die default export brauchen
    files: [
      'src/app/**/page.tsx',
      'src/app/**/layout.tsx',
      'src/app/**/error.tsx',
      'src/app/**/loading.tsx',
      'src/app/**/not-found.tsx',
      'src/app/**/template.tsx',
      'src/app/sitemap.ts',
      'src/app/robots.ts',
      'next.config.ts',
    ],
    rules: {
      'import/no-default-export': 'off',
    },
  },
])

export default eslintConfig
