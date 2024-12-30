import pluginJs from "@eslint/js";
import globals from "globals";

import { includeIgnoreFile } from "@eslint/compat";
import eslintConfigPrettier from "eslint-config-prettier";
import mochaPlugin from "eslint-plugin-mocha";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

/** @type {import('eslint').Linter.Config[]} */
export default [
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  mochaPlugin.configs.flat.recommended,
  includeIgnoreFile(gitignorePath),
  eslintConfigPrettier,
];
