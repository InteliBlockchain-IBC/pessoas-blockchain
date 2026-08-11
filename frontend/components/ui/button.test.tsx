import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("usa o token de acento e o texto escuro no variant padrão", () => {
    render(<Button>Salvar</Button>);
    const el = screen.getByRole("button", { name: "Salvar" });
    // Branco sobre #1b98e0 dá 3,17:1 e reprova o AA. O primário leva texto
    // ESCURO — DESIGN_SYSTEM.md §1.5. Este teste existe para isso não voltar.
    expect(el.className).toContain("bg-accent");
    expect(el.className).toContain("text-accent-fg");
    expect(el.className).not.toContain("text-white");
  });

  it("usa raio de bloco, nunca um raio intermediário", () => {
    render(<Button>Salvar</Button>);
    expect(screen.getByRole("button").className).toContain("rounded-block");
  });

  it("desabilitado fica inerte e sinalizado", () => {
    render(<Button disabled>Salvar</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
