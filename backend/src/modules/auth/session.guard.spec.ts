import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { SessionGuard } from './session.guard';
import { AuthGuard } from './auth.guard';
import { SessionService } from './session.service';

describe('SessionGuard / AuthGuard', () => {
  const mockSessionService = { validate: jest.fn() } as unknown as SessionService;

  const contextWith = (cookies: Record<string, string>) => {
    const request: any = { cookies };
    return {
      switchToHttp: () => ({ getRequest: () => request }),
      request,
    } as unknown as ExecutionContext & { request: any };
  };

  const approved = {
    id: 'u1', role: 'PEOPLE', status: 'APPROVED',
    name: 'Membro', email: 'membro@sou.inteli.edu.br', image: null,
  };

  beforeEach(() => jest.clearAllMocks());

  it('401 quando nao ha cookie', async () => {
    const guard = new SessionGuard(mockSessionService);
    await expect(guard.canActivate(contextWith({}))).rejects.toThrow(UnauthorizedException);
  });

  it('401 quando o token e desconhecido ou expirado', async () => {
    (mockSessionService.validate as jest.Mock).mockResolvedValue(null);
    const guard = new SessionGuard(mockSessionService);
    await expect(guard.canActivate(contextWith({ session: 'tok' }))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('injeta req.user com a role vinda do banco', async () => {
    (mockSessionService.validate as jest.Mock).mockResolvedValue(approved);
    const guard = new SessionGuard(mockSessionService);
    const ctx = contextWith({ session: 'tok' });

    expect(await guard.canActivate(ctx)).toBe(true);
    expect(ctx.request.user).toEqual(approved);
  });

  it('SessionGuard deixa passar usuario PENDING', async () => {
    (mockSessionService.validate as jest.Mock).mockResolvedValue({ ...approved, status: 'PENDING' });
    const guard = new SessionGuard(mockSessionService);
    expect(await guard.canActivate(contextWith({ session: 'tok' }))).toBe(true);
  });

  it('AuthGuard devolve 403 para usuario PENDING', async () => {
    (mockSessionService.validate as jest.Mock).mockResolvedValue({ ...approved, status: 'PENDING' });
    const guard = new AuthGuard(mockSessionService);
    await expect(guard.canActivate(contextWith({ session: 'tok' }))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('AuthGuard devolve 403 para usuario REJECTED', async () => {
    (mockSessionService.validate as jest.Mock).mockResolvedValue({ ...approved, status: 'REJECTED' });
    const guard = new AuthGuard(mockSessionService);
    await expect(guard.canActivate(contextWith({ session: 'tok' }))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('AuthGuard deixa passar usuario APPROVED', async () => {
    (mockSessionService.validate as jest.Mock).mockResolvedValue(approved);
    const guard = new AuthGuard(mockSessionService);
    expect(await guard.canActivate(contextWith({ session: 'tok' }))).toBe(true);
  });
});
