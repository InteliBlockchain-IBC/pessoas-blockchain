import { render, screen } from "@testing-library/react";
import { Moldura } from "./Moldura";

describe("Moldura", () => {
  it("reserva o próprio deslocamento — a sombra ocupa espaço fora da caixa", () => {
    const { container } = render(<Moldura>x</Moldura>);
    const cls = container.firstElementChild!.className;
    // Sem reserva, a sombra sobrepõe o elemento seguinte ou é cortada por um
    // ancestral com overflow-hidden. Nenhuma página compensa isso por fora.
    expect(cls).toContain("mr-[var(--moldura-desloc)]");
    expect(cls).toContain("mb-[var(--moldura-desloc)]");
  });

  it("a sombra padrão é ciano, nunca o gradiente amostrado do PDF", () => {
    const { container } = render(<Moldura>x</Moldura>);
    const cls = container.firstElementChild!.className;
    expect(cls).toContain("var(--accent)");
    expect(cls).not.toContain("ibc-gradient-start"); // check-visual: ok — verifica que o gradiente não está presente
  });

  it("aceita magenta — permitido só no login", () => {
    const { container } = render(<Moldura shadow="magenta">x</Moldura>);
    expect(container.firstElementChild!.className).toContain("var(--danger)");
  });

  it("o gesto de encaixe só existe quando interactive", () => {
    const { container: estatico } = render(<Moldura>x</Moldura>);
    const { container: vivo } = render(<Moldura interactive>x</Moldura>);
    expect(estatico.firstElementChild!.className).not.toContain("hover:translate-x");
    expect(vivo.firstElementChild!.className).toContain("hover:translate-x");
  });

  it("interativa reage ao foco de teclado do filho, não do próprio wrapper", () => {
    const { container } = render(<Moldura interactive>x</Moldura>);
    // O wrapper não tem tabIndex — quem recebe foco é o filho (ex.: <Link>).
    // `group` + `has-[:focus-visible]` é o que liga o gesto de encaixe ao
    // foco real, em vez de um `focus-visible:` que nunca casaria no wrapper.
    const cls = container.firstElementChild!.className;
    expect(cls).toContain("group");
    expect(cls).toContain("has-[:focus-visible]:translate-x-[var(--moldura-desloc)]");
    expect(cls).toContain("has-[:focus-visible]:shadow-none");
  });

  it("renderiza o conteúdo", () => {
    render(<Moldura><p>oi</p></Moldura>);
    expect(screen.getByText("oi")).toBeInTheDocument();
  });
});
