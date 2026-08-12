import { notificar, DURACAO } from "./toast-helpers";

vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }));
import { toast } from "@/hooks/use-toast";

describe("notificar", () => {
  beforeEach(() => vi.mocked(toast).mockClear());

  it("sucesso some sozinho em 5s", () => {
    notificar.sucesso("Membro atualizado");
    expect(vi.mocked(toast).mock.calls[0][0]).toMatchObject({
      title: "Membro atualizado",
      duration: DURACAO.efemero,
    });
  });

  // Erro que some sozinho é erro que ninguém leu. DESIGN_SYSTEM.md §7.7.
  it("erro NÃO some sozinho", () => {
    notificar.erro("Falhou");
    expect(vi.mocked(toast).mock.calls[0][0].duration).toBe(DURACAO.persistente);
  });

  // O Radix não lê uma prop "aria-live" custom: o aria-live real do nó de
  // anúncio interno é derivado da prop `type` do Toast.Root ("foreground" →
  // assertive, "background" → polite). Ver @radix-ui/react-toast/dist/index.js:64,145.
  it("erro é anunciado como assertivo pelo leitor de tela (type=foreground)", () => {
    notificar.erro("Falhou");
    expect(vi.mocked(toast).mock.calls[0][0].type).toBe("foreground");
  });

  it("sucesso é polido, para não interromper a leitura (type=background)", () => {
    notificar.sucesso("Ok");
    expect(vi.mocked(toast).mock.calls[0][0].type).toBe("background");
  });
});
