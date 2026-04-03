const js = require("@eslint/js");
const globals = require("globals");
const nextPlugin = require("@next/eslint-plugin-next");
const jestPlugin = require("eslint-plugin-jest");

module.exports = [
  // 1. Configuração base (recomendada) para todos os arquivos
  js.configs.recommended,

  // 2. Configuração global: define ambientes padrão (Node.js e ES2021)
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,      // __dirname, require, module, process, console
        ...globals.es2021,
      },
    },
  },

  // 3. Configuração específica para arquivos de teste (Jest)
  {
    files: ["**/*.test.js", "**/*.spec.js", "test/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.jest,      // describe, test, expect, beforeAll, etc.
        ...globals.node,
      },
    },
    plugins: {
      jest: jestPlugin,
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
    },
  },

  // 4. Configuração do Next.js (React, JSX, componentes)
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,          // habilita JSX
        },
      },
      globals: {
        ...globals.browser,   // window, document, fetch (se necessário)
        ...globals.node,      // para API routes (Next.js backend)
      },
    },
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },

  // 5. Desativa regras conflitantes com o Prettier
  require("eslint-config-prettier"),

  // 6. Ignora pastas desnecessárias (incluindo arquivos de configuração que não queremos lintar)
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "coverage/**",
      "eslint.config.js",    // ignora o próprio arquivo de configuração
      "commitlint.config.js",
      "jest.config.js",
    ],
  },
];