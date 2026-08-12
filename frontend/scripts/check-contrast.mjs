// Trava as razões de contraste WCAG 2.1 dos tokens semânticos do design system.
// Sem dependência: roda com `node scripts/check-contrast.mjs` a partir de frontend/.
//
// O que ele pega: token trocado por um valor que reprova.
// O que ele NÃO pega: cor escrita à mão dentro de um componente (ex.: text-white).
// Para isso, ver os greps da Task 8.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "..", "app", "globals.css"), "utf8");

// Só o tema escuro. O bloco [data-theme="light"] redefine os mesmos nomes e
// sobrescreveria o mapa; cortamos o arquivo antes dele.
const darkOnly = css.split('[data-theme="light"]')[0];

const raw = new Map();
for (const [, name, value] of darkOnly.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
  raw.set(name, value.trim());
}

function resolve(value, depth = 0) {
  if (depth > 10) throw new Error(`ciclo de var() ao resolver "${value}"`);
  const ref = value.match(/^var\((--[\w-]+)\)$/);
  if (!ref) return value;
  const next = raw.get(ref[1]);
  if (next === undefined) throw new Error(`token não definido: ${ref[1]}`);
  return resolve(next, depth + 1);
}

function hexOf(token) {
  const value = raw.get(token);
  if (value === undefined) throw new Error(`token não definido: ${token}`);
  const hex = resolve(value);
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
    throw new Error(`${token} resolveu para "${hex}", que não é hex de 6 dígitos`);
  }
  return hex;
}

const channel = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const TEXT = 4.5; // WCAG AA, texto normal
const UI = 3.0;   // WCAG AA, elemento de interface e borda

// [frente, fundo, mínimo, o que é]
const PAIRS = [
  ["--text", "--surface", TEXT, "texto principal na página"],
  ["--text", "--surface-raised", TEXT, "texto principal em card"],
  ["--text", "--surface-sunken", TEXT, "texto digitado em campo"],
  ["--text-muted", "--surface", TEXT, "texto de apoio na página"],
  ["--text-muted", "--surface-raised", TEXT, "texto de apoio em card"],
  ["--text-subtle", "--surface", TEXT, "placeholder na página"],
  ["--accent", "--surface", TEXT, "link e ação primária"],
  ["--success", "--surface", TEXT, "texto de sucesso"],
  ["--warning", "--surface", TEXT, "texto de aviso"],
  ["--danger", "--surface", TEXT, "texto de erro"],
  ["--accent-fg", "--accent", TEXT, "texto do botão primário"],
  ["--fg-on-deep", "--danger-surface", TEXT, "texto em badge de erro"],
  ["--fg-on-deep", "--educational", TEXT, "texto em superfície educacional"],
  ["--fg-on-bright", "--success", TEXT, "texto em badge de sucesso"],
  ["--fg-on-bright", "--warning", TEXT, "texto em badge de aviso"],
  ["--border-interactive", "--surface", UI, "borda de campo e de badge neutro"],
  ["--border-interactive", "--surface-raised", UI, "borda de campo em card"],
  ["--focus-ring", "--surface", UI, "anel de foco na página"],
  ["--focus-ring", "--surface-raised", UI, "anel de foco em card"],
  // Rótulo de calha — 0.6875rem é TEXTO PEQUENO, logo o mínimo é 4,5 e não 3.
  // Medido em 11/08/2026: --text-subtle sobre --surface-raised dá 3,74 e
  // reprova. Por isso existem duas classes, .rotulo e .rotulo-em-card.
  ["--text-subtle", "--surface", TEXT, "rótulo de calha solto na página"],
  ["--text-muted", "--surface-raised", TEXT, "rótulo de calha dentro de card"],
  // Moldura (spec §3.5)
  ["--text", "--surface-raised", UI, "borda 3px da moldura sobre o preenchimento"],
  ["--accent", "--surface", UI, "sombra ciano da moldura sobre a página"],
  ["--danger", "--surface", UI, "sombra magenta da moldura no login"],
];

let failures = 0;
for (const [fg, bg, min, label] of PAIRS) {
  const value = ratio(hexOf(fg), hexOf(bg));
  const ok = value >= min;
  if (!ok) failures++;
  const mark = ok ? "ok  " : "FALHA";
  console.log(
    `${mark} ${value.toFixed(2).padStart(5)}:1  (min ${min})  ${fg} sobre ${bg} — ${label}`
  );
}

if (failures > 0) {
  console.error(`\n${failures} par(es) reprovando o WCAG AA.`);
  process.exit(1);
}
console.log(`\n${PAIRS.length} pares aprovados.`);
