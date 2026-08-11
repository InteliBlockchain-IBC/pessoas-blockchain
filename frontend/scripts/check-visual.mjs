// Trava as proibições visuais da spec. Roda com `node scripts/check-visual.mjs`
// a partir de frontend/. Complementa o check-contrast.mjs: aquele pega token
// trocado, este pega cor e layout escritos à mão.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["app", "components"];
// Arquivos ainda não migrados. A cada fase, itens saem daqui — nunca entram.
const ALLOWLIST = new Set([
  "app/(protected)/selection/page.tsx",
  "app/(protected)/selection/[id]/page.tsx",
  "app/(protected)/admin/users/page.tsx",
  "app/(public)/login/page.tsx",
  "app/page.tsx",
  "components/ui/LegacyButton.tsx",
  "components/ui/Card.tsx",
  "components/ui/LegacyInput.tsx",
  "components/ui/Modal.tsx",
  "components/ui/LegacyTable.tsx",
  "components/ui/Badge.tsx",
  "components/ui/MarkdownEditor.tsx",
  "components/ui/MarkdownViewer.tsx",
]);

const RULES = [
  [/\balert\s*\(/, "alert() do browser — use o toast (spec §5.11)"],
  [/\bconfirm\s*\(/, "confirm() do browser — use ui/alert-dialog"],
  [/<table\b/, "tabela artesanal — use ds/DataTable"],
  [/whileHover/, "movimento decorativo — spec §3.4"],
  [/blur-\[/, "blur proibido — DESIGN_SYSTEM.md §4.3"],
  [/text-(green|red|purple|yellow|gray|blue|pink|orange)-\d/, "cor fora do design system"],
  [/bg-(green|red|purple|yellow|gray|blue|pink|orange)-\d/, "cor fora do design system"],
  [/ibc-gradient-start/, "gradiente amostrado do PDF — use --accent (spec §3.5)"],
  [/font-heading font-bold rounded-block/, "classe do Button copiada — use <Button>"],
  [/className="[^"]*\bmax-w-(?!full\b)/, "página definindo largura — o AppShell decide (spec §5.1)"],
  [/className="[^"]*\bmin-h-screen/, "página definindo altura — o AppShell decide"],
  [/rounded-\[(?!20px|0px)/, "raio fora de 0 / 20px (spec §3.1)"],
  [/\bp-8 w-full\b/, "wrapper de página com padding e largura na mão — o AppShell decide (spec §5.1)"],
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if ([".ts", ".tsx"].includes(extname(full))) out.push(full);
  }
  return out;
}

let failures = 0;
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const rel = file.split("\\").join("/");
    if (ALLOWLIST.has(rel)) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (line.includes("check-visual: ok")) return; // escape documentado
      for (const [re, why] of RULES) {
        if (re.test(line)) {
          console.error(`FALHA ${rel}:${i + 1}  ${why}\n      ${line.trim()}`);
          failures++;
        }
      }
    });
  }
}

if (failures > 0) {
  console.error(`\n${failures} violação(ões). Se for intencional, adicione o comentário "check-visual: ok" na linha e explique o porquê.`);
  process.exit(1);
}
console.log(`check-visual: limpo (${ALLOWLIST.size} arquivo(s) ainda na allowlist de migração).`);
