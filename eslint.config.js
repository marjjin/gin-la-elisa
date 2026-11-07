import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// Core no-unused-vars does not count JSX component names as variable references.
// Mark actual JSX usage without exempting unused capitalized imports or values.
const jsxUsage = {
  rules: {
    'uses-vars': {
      meta: { type: 'suggestion', schema: [] },
      create(context) {
        return {
          JSXOpeningElement(node) {
            let name = node.name
            while (name.type === 'JSXMemberExpression') name = name.object
            if (
              name.type === 'JSXIdentifier' &&
              (name !== node.name || /^[A-Z]/.test(name.name))
            ) {
              context.sourceCode.markVariableAsUsed(name.name, node)
            }
          },
        }
      },
    },
  },
}

export default defineConfig([
  globalIgnores(['dist', 'tmp']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['**/*.jsx'],
    plugins: { jsx: jsxUsage },
    rules: { 'jsx/uses-vars': 'error' },
  },
])
