import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    // Máquina do Messias: 12 núcleos mas ~15GB de RAM, frequentemente com
    // pouca sobra. Sem teto, o vitest sobe 11 forks e o OOM-killer derruba a
    // máquina inteira. Não remova este limite.
    pool: "forks",
    maxWorkers: 2,
    include: ["components/**/*.test.{ts,tsx}", "lib/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
});
