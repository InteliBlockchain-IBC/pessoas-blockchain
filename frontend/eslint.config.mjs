import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      "no-restricted-globals": [
        "error",
        { name: "alert", message: "Use o toast (components/ui/toaster)." },
        { name: "confirm", message: "Use ui/alert-dialog." },
        { name: "prompt", message: "Use um dialog com campo." },
      ],
    },
  },
]);

export default eslintConfig;
