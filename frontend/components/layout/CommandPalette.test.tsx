import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { CommandPalette } from "./CommandPalette";
import { membersService } from "@/services/members.service";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/services/members.service", () => ({
  membersService: { getMembers: vi.fn() },
}));

describe("CommandPalette", () => {
  beforeEach(() => {
    push.mockClear();
    vi.mocked(membersService.getMembers).mockReset();
  });

  it("nao renderiza nada quando fechada", () => {
    render(<CommandPalette isOpen={false} onClose={() => {}} papel="ADMIN" />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("lista as paginas visiveis pro papel, sem secao Membros pra INTERVIEWER", () => {
    render(<CommandPalette isOpen={true} onClose={() => {}} papel="INTERVIEWER" />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /membros/i })).not.toBeInTheDocument();
  });

  it("filtra paginas pelo texto digitado", async () => {
    render(<CommandPalette isOpen={true} onClose={() => {}} papel="ADMIN" />);
    await userEvent.type(screen.getByRole("combobox"), "proc");
    expect(screen.getByText("Processo Seletivo")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("nao busca membros com menos de 2 caracteres", async () => {
    render(<CommandPalette isOpen={true} onClose={() => {}} papel="ADMIN" />);
    await userEvent.type(screen.getByRole("combobox"), "a");
    expect(membersService.getMembers).not.toHaveBeenCalled();
  });

  it("nao busca membros pra quem nao e ADMIN/PEOPLE", async () => {
    render(<CommandPalette isOpen={true} onClose={() => {}} papel="INTERVIEWER" />);
    await userEvent.type(screen.getByRole("combobox"), "messias");
    expect(membersService.getMembers).not.toHaveBeenCalled();
  });
});
