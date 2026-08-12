# Design System — Inteli Blockchain

Sistema de design das **plataformas internas** do clube. Deriva do *Guia de Estilos - Blockchain 2026* (Canva, autoria de Giovanna Neves), estendido com o que uma interface precisa e um guia de marketing não cobre.

> **Arquivo canônico:** `projetos/gestao_pessoas/docs/DESIGN_SYSTEM.md` (versionado no repo `pessoas-blockchain`).
> `design/DESIGN_SYSTEM.md`, na raiz do workspace, é um symlink para cá — não edite pelos dois lados.

---

## 1. Cor

A arquitetura tem três camadas. **Componente nunca referencia primitiva direto** — sempre o token semântico. Isso é o que permite ter tema claro e escuro sem reescrever componente.

```
primitiva  →  semântica  →  componente
#1b98e0       --accent      botão primário
```

### 1.1 Primitivas canônicas

As sete cores da "Paleta de Cores" do guia, mais a exclusiva da paleta Educacional.

| Token | Hex | Papel no guia |
| --- | --- | --- |
| `--ibc-navy-950` | `#081119` | Fundo principal, quase preto azulado |
| `--ibc-navy-900` | `#13293d` | Fundo secundário, superfície elevada |
| `--ibc-teal-600` | `#247ba0` | Azul petróleo, apoio |
| `--ibc-blue-700` | `#006494` | Azul profundo |
| `--ibc-blue-500` | `#1b98e0` | Azul vivo, destaque |
| `--ibc-ice-50` | `#e8f1f2` | Branco gelo, texto sobre escuro |
| `--ibc-magenta-600` | `#9f0e5d` | Magenta, contraponto da paleta |
| `--ibc-plum-900` | `#380f2e` | **Só conteúdo Educacional** — ver §1.6 |

### 1.2 Gradiente da marca (valores aproximados)

O símbolo em gradiente vai de ciano (canto inferior esquerdo) a roxo (canto superior direito), a ~135°.

```css
background: linear-gradient(135deg, #63b4c4 0%, #8c4ca9 100%);
```

Esses dois hex foram extraídos por amostragem de pixel do PDF, não lidos do arquivo-fonte. São fiéis o bastante para UI, mas para material impresso ou para o logo em si **use o SVG original** — o valor exato está no Canva, com a Giovanna. Nunca recrie o logo com esse gradiente; use o arquivo.

### 1.3 Primitivas de extensão

O guia não tem nenhum cinza, nenhum verde e nenhum amarelo. Sem eles não existe borda, texto secundário nem feedback de formulário. Estes são derivados para conviver com a paleta:

| Token | Hex | Para quê |
| --- | --- | --- |
| `--ibc-slate-400` | `#8fa3b8` | Texto secundário no escuro |
| `--ibc-slate-500` | `#6b8299` | Texto terciário / placeholder no escuro |
| `--ibc-slate-600` | `#537c98` | Borda de controle no escuro |
| `--ibc-slate-800` | `#2a4a63` | Divisória decorativa no escuro |
| `--ibc-steel-400` | `#6b8a92` | Borda de controle no claro |
| `--ibc-steel-200` | `#c3d3d6` | Divisória decorativa no claro |
| `--ibc-steel-700` | `#42586d` | Texto secundário no claro |
| `--ibc-green-400` | `#34d399` | Sucesso no escuro |
| `--ibc-green-700` | `#047857` | Sucesso no claro |
| `--ibc-amber-400` | `#fbbf24` | Aviso no escuro |
| `--ibc-amber-800` | `#92400e` | Aviso no claro |
| `--ibc-magenta-400` | `#f0559b` | Erro **como texto** no escuro — ver §1.5 |

Os neutros têm matiz azul deliberadamente (não são cinza puro), para não brigar com o `#081119`.

`--ibc-slate-600` é `#537c98`, não o `#456a85` originalmente estimado: o valor mais escuro dava 2,59:1 como borda de campo dentro de card (`--border-interactive` sobre `--surface-raised`), abaixo do mínimo de 3:1 para elemento de UI. Ver §8.

### 1.4 Tokens semânticos

Estes são os únicos que o código deve usar. O tema escuro é o padrão — o guia inteiro é escuro.

| Token | Escuro | Claro | Uso |
| --- | --- | --- | --- |
| `--surface` | `#081119` | `#e8f1f2` | Fundo da página |
| `--surface-raised` | `#13293d` | `#ffffff` | Card, modal, dropdown, cabeçalho de tabela |
| `--surface-sunken` | `#050b11` | `#dbe7e9` | Poço: fundo de input, code block |
| `--text` | `#e8f1f2` | `#081119` | Texto principal |
| `--text-muted` | `#8fa3b8` | `#42586d` | Legenda, label, texto de apoio |
| `--text-subtle` | `#6b8299` | `#5c7d86` | Placeholder, texto desabilitado |
| `--border` | `#2a4a63` | `#c3d3d6` | Divisória, borda de card |
| `--border-interactive` | `#537c98` | `#6b8a92` | Borda de input, checkbox, radio, badge neutro |
| `--accent` | `#1b98e0` | `#006494` | Ação primária, link, seleção |
| `--accent-hover` | `#247ba0` | `#13293d` | Estado hover do accent |
| `--accent-fg` | `#081119` | `#ffffff` | Texto **sobre** fundo accent — ver §1.5 |
| `--focus-ring` | `#1b98e0` | `#006494` | Anel de foco de teclado |
| `--success` | `#34d399` | `#047857` | Confirmação |
| `--warning` | `#fbbf24` | `#92400e` | Aviso |
| `--danger` | `#f0559b` | `#9f0e5d` | Erro, ação destrutiva |
| `--danger-surface` | `#9f0e5d` | `#9f0e5d` | Fundo sólido de erro |
| `--educational` | `#380f2e` | `#380f2e` | Conteúdo da área Educacional — ver §1.6 |
| `--fg-on-bright` | `#081119` | — | Texto sobre `--success`/`--warning` (fundo claro/vivo) |
| `--fg-on-deep` | `#e8f1f2` | — | Texto sobre `--danger-surface`/`--educational` (fundo escuro saturado) |

`--fg-on-bright` e `--fg-on-deep` existem para não escrever hex cru dentro de componente (`Badge.tsx`) — são a mesma decisão de `--accent-fg`, generalizada para os outros fundos sólidos que levam texto por cima.

Note que `--accent` **inverte** entre os temas. `#1b98e0` sobre fundo claro dá 2,77:1 e reprova; `#006494` sobre fundo escuro dá 2,94:1 e reprova. Não existe um azul único que sirva aos dois.

### 1.5 As três armadilhas de contraste

Estas custaram uma auditoria. Não as reintroduza.

**1. Magenta `#9f0e5d` não pode ser texto no escuro.**
Contraste de **2,44:1** sobre `#081119` e **1,91:1** sobre `#13293d`. Reprova não só o mínimo de texto (4,5:1) como o mínimo de elemento de UI (3:1). O magenta canônico no tema escuro serve **apenas como fundo sólido**, e aí com `--fg-on-deep` por cima (6,79:1 ✓). Para *texto* de erro no escuro, use `--danger` = `#f0559b` (5,86:1 ✓), que é o mesmo magenta clareado.

**2. Texto branco sobre o azul `#1b98e0` reprova.**
`#ffffff` sobre `#1b98e0` dá **3,17:1**. Botão primário no tema escuro leva texto **escuro** (`--accent-fg` = `#081119`, 5,99:1 ✓). É contraintuitivo e é por isso que existe o token `--accent-fg`.

**3. `#006494` e `#247ba0` não são cores de texto no escuro.**
2,94:1 e 4,00:1 respectivamente. `#247ba0` passa só para texto grande (≥24px, ou ≥19px em negrito) e para borda. `#006494` no escuro é exclusivamente superfície.

### 1.6 Cor de área

`#380f2e` (plum) aparece no guia apenas na *Paleta de Cores Educacional*. Aqui ele é a **cor de conteúdo educacional**: usada para marcar material de aula, trilha e dicionário dentro da plataforma — badge, faixa de card, fundo de destaque.

Não é uma cor de estado e não tem par claro/escuro: é a mesma nos dois temas, sempre como fundo sólido com `--fg-on-deep` por cima (14,34:1 ✓). Nunca como texto.

As outras três áreas (Projetos, Marketing, Pessoas) **não têm cor definida**. Não invente uma. Se a plataforma precisar diferenciá-las visualmente, isso é conversa com a Marketing antes de virar código.

---

## 2. Tipografia

### 2.1 Famílias

| Papel | Fonte | Pesos usados |
| --- | --- | --- |
| Títulos, botões, rótulos | **Montserrat** | 300 Light, 400 Regular, 700 Bold, 900 Black |
| Corpo, parágrafo, dados | **Open Sans** | 400 Regular, 600 SemiBold, 700 Bold |

O guia mostra Montserrat em quatro pesos e Open Sans em dois — a divisão título/corpo é a leitura natural do material.

### 2.2 Escala

Razão 1,25 a partir de 16px. `rem` sempre, nunca `px` em texto.

| Token | Tamanho | Entrelinha | Uso |
| --- | --- | --- | --- |
| `--text-xs` | 0.75rem / 12px | 1.5 | Metadado, timestamp |
| `--text-sm` | 0.875rem / 14px | 1.5 | Label, legenda, célula de tabela |
| `--text-base` | 1rem / 16px | 1.6 | Corpo — **nunca menor que isto em parágrafo** |
| `--text-lg` | 1.25rem / 20px | 1.5 | Subtítulo, texto de destaque, h3 |
| `--text-xl` | 1.5rem / 24px | 1.35 | h2 |
| `--text-2xl` | 2rem / 32px | 1.25 | h1 |

`--text-3xl` (2.5rem / 40px) e `--text-4xl` (3.5rem / 56px) existem no guia mas ficam **fora da escala de plataforma** — material de marketing, não usar em produto. Interface densa de dados não tem espaço editorial para display type; o maior heading em tela é o h1 de 32px.

### 2.3 Regras de aplicação

O guia é explícito: *"brinque com cores e negritos que ajudem a entender o objetivo"*. Na prática, dentro de uma plataforma:

- **Hierarquia por peso e cor, não por tamanho a mais.** Um título em Montserrat 900 com `--text` sobre um subtítulo em Montserrat 400 com `--text-muted` resolve quase todo caso.
- Títulos de página em Montserrat **700**; display e chamadas em **900**.
- Restrição: Montserrat **300 Light** só acima de 24px. Em corpo de texto ele fica fino demais para o contraste do tema escuro.
- Destaque de palavra dentro de frase: `--accent`, como no guia. Um destaque por frase, no máximo.
- Restrição: caixa alta só em rótulo curto (badge, botão). Nunca em frase, e não em cabeçalho de tabela (ver §7.5) — o guia usa caixa alta em títulos de slide, o que não transporta para leitura de tela em tabela de 40 linhas.

> **Rótulo de calha:** Montserrat 700, `0.6875rem`, tracking `.28em`, caixa alta. Por ser texto pequeno, o mínimo é 4,5:1 e não 3:1. Medido em 11/08/2026: `--text-subtle` sobre `--surface` dá 4,78:1 e passa; sobre `--surface-raised` dá **3,74:1 e reprova**. Por isso existem duas classes: `.rotulo` na página e `.rotulo-em-card` (que usa `--text-muted`, 5,73:1) dentro de card.

---

## 3. Espaçamento e layout

Base de **4px** — a escala padrão do Tailwind já é essa, sem necessidade de token próprio.

Regras de uso: padding interno de card `p-6` (24px); distância entre campos de formulário `gap-4` (16px); entre seções `gap-12` (48px); largura máxima de coluna de texto **72 caracteres**.

`--space-6` e `p-6` eram o mesmo 24px sob dois nomes — essa duplicação de vocabulário foi como o `globals.css` original chegou ao estado que este documento corrige. Espaçamento vira regra de uso, não token.

---

## 4. Forma: raio, borda e elevação

### 4.1 Raio

O guia diz, na página de Molduras: **"Arredondamento 0 ou 20"** — mas essa é uma regra sobre moldura de imagem, não uma regra global. Campo de formulário não existe no guia; a divisão abaixo é decisão de plataforma:

| Raio | Onde | Origem |
| --- | --- | --- |
| `20px` | Card, botão, modal, moldura — bloco de conteúdo | guia de estilos |
| `0` | Input, select, textarea — controle de formulário | decisão de plataforma |
| `0` | Célula de tabela, divisória | decisão de plataforma |
| `9999px` | Badge, avatar | decisão de plataforma |

> `--radius-field` era `12px` até 11/08/2026, um terceiro valor que o guia proíbe e que este documento nunca autorizou. Corrigido para `0`.

Critério: **20px em bloco, 0 em divisória, 0 em campo editável, total em pill.** Um input de 40px de altura com raio 20 vira cápsula e deixa de parecer um campo editável.

Só `12px` e `20px` viram token (`--radius-field`, `--radius-block`) — `0` e `9999px` usam os utilitários nativos do Tailwind (`rounded-none`, `rounded-full`), que já fazem exatamente isso sem precisar de um nome novo.

### 4.2 Borda

O guia especifica **borda 3**. Mas 3px como padrão de toda superfície é ruído: numa tela com seis cards, 3px em todos anula a hierarquia que o 3px deveria criar. O valor continua presente — muda a frequência.

**1px é o padrão de toda superfície.** 3px é uma lista fechada de quatro usos:

- anel de foco de teclado
- moldura com sombra deslocada
- card marcado explicitamente como destaque (`featured`)
- borda de campo em estado de erro

Fora desses quatro, borda é `--border` ou `--border-interactive` em 1px.

### 4.3 Moldura com sombra deslocada

O detalhe mais característico da marca, direto da página de Molduras: um retângulo de borda clara com um bloco sólido colorido deslocado atrás, em ciano ou magenta.

```css
.moldura {
  border: 3px solid var(--text);
  border-radius: 20px;
  box-shadow: var(--moldura-desloc) var(--moldura-desloc) 0 0 var(--accent); /* ou var(--danger) */
}
```

> A sombra usa `--accent` (ciano) ou `--danger` (magenta), nunca `--ibc-gradient-start` — aquele valor é amostrado por pixel do PDF e vale só para o logo (§1.2). Deslocamento: `--moldura-desloc`, `8px`, o mesmo nos três usos.
>
> **Os três usos permitidos:** card de login (magenta) · `EmptyState` com mascote (ciano) · card do PDI no perfil (ciano, interativo). Máximo um por tela, nunca em elemento repetido. Um quarto uso exige decisão de design.

Sem blur — é sombra sólida, deslocada. O deslocamento de 8px é interpretação; o guia mostra o efeito sem cotar. Restrita a: hero de página, estado vazio, e no máximo um card de destaque por tela. Nunca em card de listagem.

Restrição: nada de sombra difusa (`blur`) em nenhum lugar. Não existe no guia e destoa do resto.

---

## 5. Marca

### 5.1 Variantes de logo

O guia mostra quatro, cada uma com seu caso:

| Variante | Quando usar |
| --- | --- |
| **Gradiente** (símbolo ciano→roxo + texto) | Preferencial. Sobre fundo escuro da marca. |
| **Branca** (monocromática) | Fundo escuro onde o gradiente competiria — foto, fundo colorido, tamanho pequeno. |
| **Preta** (monocromática) | Restrição: exige fundo claro. O guia sempre a apresenta sobre uma placa `#e8f1f2`. Nunca sobre o fundo escuro. |
| **IBC** (monograma) | Espaço muito reduzido: favicon, avatar, selo. |

O símbolo isolado (o nó geométrico, sem texto) é válido em qualquer das três colorações quando o nome do clube já está claro pelo contexto.

### 5.2 Regras de uso

O guia não define área de proteção nem lista proibições. Estas são o mínimo padrão:

- **Área de proteção:** margem livre em volta igual à altura do símbolo ÷ 2. Nada invade.
- **Tamanho mínimo:** 24px de altura para o símbolo isolado; 120px de largura para o lockup com texto (abaixo disso o "inteli" some).
- **Não faça:** esticar sem manter proporção · recolorir fora das três variantes · aplicar sombra ou contorno · rotacionar · reconstruir o gradiente à mão em vez de usar o SVG · colocar a variante preta sobre fundo escuro.

### 5.3 Mascote

O clube tem um mascote — um pato de terno, boné e óculos de realidade aumentada, com o símbolo da marca na lapela. É elemento de comunicação e comunidade, não de interface: use em tela de boas-vindas, estado vazio, página de erro e material de evento. Não use como ícone funcional nem em elemento repetido.

### 5.4 Padrão geométrico de fundo

Losangos, hexágonos e triângulos em contorno fino, muito baixo contraste, tipicamente à direita da composição. Em plataforma: fundo de hero, cabeçalho de página e estado vazio.

Restrição: mantenha-o abaixo de ~8% de opacidade contra o fundo e **nunca atrás de texto corrido**. No guia ele é decorativo e distante do conteúdo — a mesma disciplina vale aqui.

---

## 6. Ícones

O guia é direto:

- **Linhas grossas** — traço de 2px em ícone de 24px.
- **Formatos arredondados** — `stroke-linecap: round`, `stroke-linejoin: round`.
- **Priorize os preenchidos** — quando houver versão sólida e versão contorno, use a sólida.

Tamanhos: 16px (inline em texto), 20px (botão, campo), 24px (navegação, padrão), 32px (destaque). Ícone herda a cor do texto ao redor (`currentColor`) — não colora ícone individualmente.

Restrição: ícone nunca é o único portador de significado. Status de PDI, resultado de processo seletivo, erro de formulário — todos precisam de texto junto. É o que torna a interface usável para quem não distingue as cores.

---

## 7. Componentes

Especificações mínimas. Tudo referencia token semântico.

### 7.1 Botão

Altura 40px, raio 20px (`--radius-block`), Montserrat 700.

| Variante | Fundo | Texto | Borda |
| --- | --- | --- | --- |
| Primário | `--accent` | `--accent-fg` | nenhuma |
| Secundário | transparente | `--accent` | 1px `--accent` |
| Fantasma | transparente | `--text-muted` | nenhuma |
| Destrutivo | `--danger-surface` | `--fg-on-deep` | nenhuma |

Estados: **hover** troca para `--accent-hover` · **ativo** reduz para 98% de escala · **foco** ganha anel `--focus-ring` de 3px com 2px de afastamento · **desabilitado** 50% de opacidade e `cursor: not-allowed` · **carregando** spinner no lugar do texto, largura preservada.

Restrição: o anel de foco nunca é removido. `outline: none` sem substituto torna a plataforma inoperável por teclado.

### 7.2 Campo de formulário

Altura 40px, raio 12px (`--radius-field`), borda 1px `--border-interactive`, fundo `--surface-sunken`, texto `--text`, placeholder `--text-subtle`.

Foco: borda passa a `--accent` e ganha o anel de foco. Erro: borda **3px** `--danger` (uma das quatro exceções de §4.2), e a mensagem aparece **abaixo** do campo em `--danger` com ícone — nunca só a borda vermelha.

Label sempre visível acima do campo, `--text-sm`, `--text-muted`. Sem placeholder-como-label.

Regra: **ícone de edição pertence a conteúdo inline editável, não a campo de formulário.** Um campo já se anuncia pela borda e pelo fundo afundado; lápis em oito campos de um formulário é ruído. Em texto clicável para editar (PDI), o lápis é o único sinal que existe de que aquele texto é editável — ali ele é necessário.

### 7.3 Card

Fundo `--surface-raised`, borda 1px `--border`, raio 20px (`--radius-block`), padding `p-6`. Card clicável ganha hover que clareia a borda para `--border-interactive`.

Variante `educational`: fundo `--educational`, texto `--fg-on-deep`.

Variante `featured`: borda **3px** + sombra sólida deslocada (§4.3), sem blur. No máximo um por tela, nunca em elemento repetido de lista.

### 7.4 Badge

Raio total (`rounded-full`), `--text-xs` em Montserrat 700, padding `px-3 py-1`.

| Semântica | Estados | Fundo | Texto | Borda |
| --- | --- | --- | --- | --- |
| Sucesso | `APPROVED` `ACTIVE` `PASSED` `COMPLETED` `SCHEDULED` | `--success` | `--fg-on-bright` | nenhuma |
| Aviso | `PENDING` `IN_REVIEW` | `--warning` | `--fg-on-bright` | nenhuma |
| Erro | `REJECTED` `FAILED` `CANCELED` | `--danger-surface` | `--fg-on-deep` | nenhuma |
| Neutro | `DRAFT` `SUBMITTED` `WITHDRAWN` `SKIPPED` `CANDIDATE` `INACTIVE` `ALUMNI` | transparente | `--text-muted` | 1px `--border-interactive` |

O neutro usa `--border-interactive`, não `--border`: `--border` sobre `--surface` dá 2,05:1, abaixo do mínimo de 3:1 para elemento de interface. Como divisória decorativa está ok; como única fronteira de um badge, não.

Regra: **`Department` não é badge** — é texto com ícone (ver §6). `--educational` (§1.6) permanece como cor de superfície de conteúdo educacional, não como chip de rótulo de área.

### 7.5 Tabela

Cabeçalho `--surface-raised`, Montserrat 700, `--text-sm`. Linhas separadas por hairline 1px `--border`. Sem zebra — o contraste entre `--surface` e `--surface-raised` já é suficiente e a zebra briga com o fundo escuro. Hover de linha usa `--surface-raised`.

### 7.6 Modal

Fundo `--surface-raised`, raio 20px, borda 1px `--border`, largura máxima 560px. Sobreposição `--surface` a 70-85%. Foco fica preso dentro do modal; `Esc` fecha.

### 7.7 Toast

Card de raio 20px com barra lateral de 3px na cor da semântica. Ícone + texto, sempre os dois. Permanece 5s; erro não some sozinho.

---

## 8. Acessibilidade

Alvo: **WCAG 2.1 AA**.

Contrastes verificados (calculados pela fórmula de luminância relativa da WCAG 2.1, não estimados — travados por `frontend/scripts/check-contrast.mjs`):

| Combinação | Ratio | Veredito |
| --- | --- | --- |
| `--text` sobre `--surface` (escuro) | 16,56 | AAA |
| `--text` sobre `--surface-raised` (escuro) | 12,95 | AAA |
| `--text` sobre `--surface-sunken` (escuro) | 17,22 | AAA |
| `--text-muted` sobre `--surface` (escuro) | 7,33 | AAA |
| `--text-muted` sobre `--surface-raised` (escuro) | 5,73 | AA |
| `--text-subtle` sobre `--surface` (escuro) | 4,78 | AA |
| `--accent` sobre `--surface` (escuro) | 5,99 | AA |
| `--success` sobre `--surface` (escuro) | 9,89 | AAA |
| `--warning` sobre `--surface` (escuro) | 11,39 | AAA |
| `--danger` sobre `--surface` (escuro) | 5,86 | AA |
| `--accent-fg` sobre `--accent` (botão primário) | 5,99 | AA |
| `--fg-on-deep` sobre `--danger-surface` (badge de erro) | 6,79 | AA |
| `--fg-on-deep` sobre `--educational` | 14,34 | AAA |
| `--fg-on-bright` sobre `--success` (badge de sucesso) | 9,89 | AAA |
| `--fg-on-bright` sobre `--warning` (badge de aviso) | 11,39 | AAA |
| `--border-interactive` sobre `--surface` (escuro) | 4,26 | ✓ 3:1 |
| `--border-interactive` sobre `--surface-raised` (escuro) | 3,33 | ✓ 3:1 |
| `--focus-ring` sobre `--surface` (escuro) | 5,99 | ✓ 3:1 |
| `--focus-ring` sobre `--surface-raised` (escuro) | 4,68 | ✓ 3:1 |
| `--text` sobre `--surface` (claro) | 16,56 | AAA |
| `--text-muted` sobre `--surface` (claro) | 6,42 | AA |
| `--accent` sobre `--surface` (claro) | 5,63 | AA |
| `--success` sobre `--surface` (claro) | 4,78 | AA |
| `--warning` sobre `--surface` (claro) | 6,18 | AA |
| `--danger` sobre `--surface` (claro) | 6,79 | AA |
| `--border-interactive` sobre `--surface` (claro) | 3,22 | ✓ 3:1 |

**Reprovações conhecidas — não use assim:**

| Combinação | Ratio | |
| --- | --- | --- |
| `#9f0e5d` como texto sobre `#081119` | 2,44 | ✗ |
| `#006494` como texto sobre `#081119` | 2,94 | ✗ |
| `#ffffff` sobre `#1b98e0` | 3,17 | ✗ |
| `#1b98e0` como texto sobre `#e8f1f2` | 2,77 | ✗ |
| `#247ba0` como texto normal sobre `#081119` | 4,00 | ✗ (só texto grande) |
| `--border` sobre `--surface` (escuro), como fronteira de badge | 2,05 | ✗ (ok como divisória) |

**Além de cor:** todo controle acessível por teclado com foco visível · alvo de toque mínimo 44×44px · `prefers-reduced-motion` respeitado · rótulo em todo campo · estado nunca comunicado só por cor.

---

## 9. Implementação — Tailwind v4

O `gestao_pessoas` usa Tailwind v4. Implementado em `frontend/app/globals.css`:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* ---------- primitivas ---------- */
:root {
  /* do guia de estilos */
  --ibc-navy-950: #081119;
  --ibc-navy-900: #13293d;
  --ibc-teal-600: #247ba0;
  --ibc-blue-700: #006494;
  --ibc-blue-500: #1b98e0;
  --ibc-ice-50: #e8f1f2;
  --ibc-magenta-600: #9f0e5d;
  --ibc-plum-900: #380f2e;
  --ibc-gradient-start: #63b4c4; /* amostrado do PDF — ver §1.2 */
  --ibc-gradient-end: #8c4ca9;   /* amostrado do PDF — ver §1.2 */

  /* derivadas para uso em plataforma */
  --ibc-slate-400: #8fa3b8;
  --ibc-slate-500: #6b8299;
  --ibc-slate-600: #537c98;
  --ibc-slate-800: #2a4a63;
  --ibc-steel-200: #c3d3d6;
  --ibc-steel-400: #6b8a92;
  --ibc-steel-700: #42586d;
  --ibc-green-400: #34d399;
  --ibc-green-700: #047857;
  --ibc-amber-400: #fbbf24;
  --ibc-amber-800: #92400e;
  --ibc-magenta-400: #f0559b;
}

/* ---------- semântica: escuro é o padrão ---------- */
:root {
  --surface: var(--ibc-navy-950);
  --surface-raised: var(--ibc-navy-900);
  --surface-sunken: #050b11;
  --text: var(--ibc-ice-50);
  --text-muted: var(--ibc-slate-400);
  --text-subtle: var(--ibc-slate-500);
  --border: var(--ibc-slate-800);
  --border-interactive: var(--ibc-slate-600);
  --accent: var(--ibc-blue-500);
  --accent-hover: var(--ibc-teal-600);
  --accent-fg: var(--ibc-navy-950); /* escuro sobre o azul — ver §1.5 */
  --focus-ring: var(--ibc-blue-500);
  --success: var(--ibc-green-400);
  --warning: var(--ibc-amber-400);
  --danger: var(--ibc-magenta-400);
  --danger-surface: var(--ibc-magenta-600);
  --educational: var(--ibc-plum-900);
  --fg-on-bright: var(--ibc-navy-950); /* sobre success e warning */
  --fg-on-deep: var(--ibc-ice-50);     /* sobre danger-surface e educational */
}

/* ---------- semântica: claro, escrito e inerte ----------
   Nada liga data-theme="light" hoje. O bloco existe para que ligar o tema
   claro no futuro seja uma mudança de atributo, não uma refatoração. */
[data-theme="light"] {
  --surface: var(--ibc-ice-50);
  --surface-raised: #ffffff;
  --surface-sunken: #dbe7e9;
  --text: var(--ibc-navy-950);
  --text-muted: var(--ibc-steel-700);
  --text-subtle: #5c7d86;
  --border: var(--ibc-steel-200);
  --border-interactive: var(--ibc-steel-400);
  --accent: var(--ibc-blue-700);
  --accent-hover: var(--ibc-navy-900);
  --accent-fg: #ffffff;
  --focus-ring: var(--ibc-blue-700);
  --success: var(--ibc-green-700);
  --warning: var(--ibc-amber-800);
  --danger: var(--ibc-magenta-600);
}

/* ---------- expõe como utilitário Tailwind ----------
   `inline` é obrigatório: sem ele o Tailwind congela o valor na compilação
   e a troca de tema deixa de funcionar. */
@theme inline {
  --color-surface: var(--surface);
  --color-surface-raised: var(--surface-raised);
  --color-surface-sunken: var(--surface-sunken);
  --color-fg: var(--text);
  --color-fg-muted: var(--text-muted);
  --color-fg-subtle: var(--text-subtle);
  --color-fg-on-bright: var(--fg-on-bright);
  --color-fg-on-deep: var(--fg-on-deep);
  --color-border: var(--border);
  --color-border-interactive: var(--border-interactive);
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --color-accent-fg: var(--accent-fg);
  --color-focus-ring: var(--focus-ring);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-danger: var(--danger);
  --color-danger-surface: var(--danger-surface);
  --color-educational: var(--educational);

  --font-sans: var(--font-open-sans), ui-sans-serif, system-ui, sans-serif;
  --font-heading: var(--font-montserrat), ui-sans-serif, system-ui, sans-serif;

  --text-xs: 0.75rem;
  --text-xs--line-height: 1.5;
  --text-sm: 0.875rem;
  --text-sm--line-height: 1.5;
  --text-base: 1rem;
  --text-base--line-height: 1.6;
  --text-lg: 1.25rem;
  --text-lg--line-height: 1.5;
  --text-xl: 1.5rem;
  --text-xl--line-height: 1.35;
  --text-2xl: 2rem;
  --text-2xl--line-height: 1.25;

  --radius-field: 12px;
  --radius-block: 20px;
}
```

`@theme inline` (e não `@theme`) é obrigatório: sem o `inline`, o Tailwind congela o valor no momento da compilação e a troca de tema deixa de funcionar.

---

## 10. Pendências

Aberto, não decidido — não resolva por conta própria:

1. **Gradiente exato.** Os hex da §1.2 são amostrados do PDF. Pegar os valores reais do Canva com a Giovanna e substituir.
2. **Arquivos de logo.** Não existe SVG versionado neste workspace — hoje o logo só está dentro do PDF e do Canva. Exportar as quatro variantes em SVG e versioná-las.
3. **Cor das outras três áreas.** A plataforma deixou de depender disso — `Department` não é mais badge (§7.4), é texto com ícone, e não precisa de cor própria para funcionar. Se a Marketing definir uma cor para Projetos, Marketing ou Pessoas no futuro, isso é acréscimo, não desbloqueio de nada pendente.
4. **Tipografia de dado numérico.** Open Sans não tem numeral tabular por padrão; tabela de dados pode precisar de `font-variant-numeric: tabular-nums` ou de uma mono. Não testado ainda.
5. **Validar a extensão com a Marketing.** Verde, âmbar e neutros foram decididos aqui, por necessidade de acessibilidade. A seção `Origem` abaixo diz o que veio do guia; ela não valida o que foi acrescentado — são coisas diferentes. Vale confirmar que a Marketing não se opõe.

---

## Origem

As regras abaixo vieram do *Guia de Estilos - Blockchain 2026* (Giovanna Neves,
Canva, 12 páginas — arquivo em `design/`). Alterá-las exige falar com a
Marketing antes:

- as 8 cores primitivas e o gradiente da marca
- Montserrat para título, Open Sans para corpo
- o valor 3 de borda e o valor 20 de raio
- a sombra sólida deslocada
- as 4 variantes de logo e o mascote
- o padrão geométrico de fundo

Todo o resto deste documento foi decidido para uso em plataforma e pode ser
revisado livremente.

O guia original foi feito para a equipe de **marketing**, não para produto.
As razões de contraste foram calculadas pela fórmula de luminância relativa
da WCAG 2.1, não estimadas.
