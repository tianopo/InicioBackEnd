import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends(
    "plugin:@typescript-eslint/recommended",
), {
    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
        },

        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",

        parserOptions: {
            project: "./tsconfig.json",
        },
    },

    settings: {
        react: {
            version: "detect",
        },
    },

    rules: {
        "max-lines": ["error", {
            max: 200,
        }],

        "no-duplicate-imports": "error",
        "no-duplicate-case": "error",
        "no-empty-pattern": "error",
        "no-undef": 0,
        "no-use-before-define": "off",
        "no-useless-constructor": "off",
        "@typescript-eslint/no-empty-function": 1,
        "@typescript-eslint/no-explicit-any": 2,
        "@typescript-eslint/prefer-nullish-coalescing": 0,
        "@typescript-eslint/strict-boolean-expressions": 0,
        "@typescript-eslint/restrict-template-expressions": 0,
        "no-unexpected-multiline": 0,
        "@typescript-eslint/consistent-type-definitions": 0,
        "react/prop-types": 0,
        "react/no-unescaped-entities": 0,
        "@typescript-eslint/no-confusing-void-expression": 0,
        "no-unused-vars": 1,

        "@typescript-eslint/no-unused-vars": [1, {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            ignoreRestSiblings: true,
        }],
    },
}, {
    files: ["**/err/**"],

    rules: {
        "no-console": "off",
        "no-restricted-syntax": "off",
    },
},
{
    files: ["**/*.service.ts"],
    rules: {
        "max-lines": ["error", {
            max: 400,
        }],
        "@typescript-eslint/no-explicit-any": "off",
    },
},
{
    // Override for specific files or directories
    files: ["src/modules/user/user.service.ts"],
    rules: {
        "@typescript-eslint/no-explicit-any": "off",
    },
},
];