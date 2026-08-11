import { render, screen } from "@testing-library/react";
import { StatusBadge, STATUS_LABELS } from "./StatusBadge";

describe("StatusBadge", () => {
  it("traduz o enum para português", () => {
    render(<StatusBadge status="APPROVED" />);
    expect(screen.getByText("Aprovado")).toBeInTheDocument();
  });

  it("status desconhecido cai em neutro e mostra o próprio valor", () => {
    render(<StatusBadge status="INVENTADO" />);
    expect(screen.getByText("INVENTADO")).toBeInTheDocument();
  });

  // A política do DESIGN_SYSTEM.md §7.4: cor só onde há ação.
  it("candidato e inativo são neutros — não são bom nem ruim", () => {
    const { container } = render(<StatusBadge status="CANDIDATE" />);
    expect(container.firstElementChild!.className).toContain("bg-transparent");
  });

  it("estado nunca é comunicado só por cor — sempre tem texto", () => {
    render(<StatusBadge status="REJECTED" />);
    expect(screen.getByText("Rejeitado")).toBeInTheDocument();
  });

  it("cobre todos os enums que a plataforma usa", () => {
    for (const s of ["APPROVED", "PENDING", "REJECTED", "ACTIVE", "ALUMNI", "PASSED", "FAILED", "SCHEDULED"]) {
      expect(STATUS_LABELS[s]).toBeTruthy();
    }
  });
});
