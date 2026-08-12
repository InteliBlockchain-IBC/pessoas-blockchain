"use client";

import { motion } from "framer-motion";

/**
 * Fileira de KPIs. O fade-up é um dos três movimentos que sobreviveram à
 * limpeza da spec §3.4 — os outros 15 whileHover saíram. check-visual: ok — fade-up mantido por spec.
 */
export function KpiRow({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {children}
    </motion.div>
  );
}
