import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { GoogleOAuthService } from './google-oauth.service';
import { SessionGuard } from './session.guard';
import { SessionService } from './session.service';
import { SESSION_COOKIE } from './session.cookie';

describe('AuthController', () => {
  let controller: AuthController;

  const mockGoogleOAuthService = { handleCallback: jest.fn() };
  const mockSessionService = { create: jest.fn(), revoke: jest.fn() };

  const requestFor = (user: unknown) => ({ user, cookies: {} }) as unknown as Request;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: GoogleOAuthService, useValue: mockGoogleOAuthService },
        { provide: SessionService, useValue: mockSessionService },
      ],
    })
      // getMe/logout tem @UseGuards(SessionGuard), que depende do PrismaService
      // via SessionService. O teste chama o método do controller direto (sem
      // pipeline HTTP), então o guard nunca roda — só precisa existir pra o
      // Nest compilar o módulo.
      .overrideGuard(SessionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('getMe', () => {
    it('devolve req.user direto — o SessionGuard ja injeta id, name, email, image, role e status', () => {
      const user = {
        id: 'user-1',
        name: 'Messias Olivindo',
        email: 'messias@sou.inteli.edu.br',
        image: 'https://lh3.googleusercontent.com/foto',
        role: 'ADMIN',
        status: 'APPROVED',
      };

      const result = controller.getMe(requestFor(user));

      expect(result).toEqual(user);
    });

    it('devolve objeto vazio quando req.user nao foi injetado', () => {
      expect(controller.getMe(requestFor(undefined))).toEqual({});
    });
  });

  describe('logout', () => {
    it('revoga a sessao e limpa o cookie quando ha token', async () => {
      const clearCookie = jest.fn();
      const send = jest.fn();
      const res = { clearCookie, send } as unknown as Response;
      const req = { cookies: { [SESSION_COOKIE]: 'tok' } } as unknown as Request;

      await controller.logout(req, res);

      expect(mockSessionService.revoke).toHaveBeenCalledWith('tok');
      expect(clearCookie).toHaveBeenCalledWith(SESSION_COOKIE, expect.any(Object));
      expect(send).toHaveBeenCalled();
    });

    it('nao chama revoke quando nao ha cookie, mas ainda limpa e responde', async () => {
      const clearCookie = jest.fn();
      const send = jest.fn();
      const res = { clearCookie, send } as unknown as Response;
      const req = { cookies: {} } as unknown as Request;

      await controller.logout(req, res);

      expect(mockSessionService.revoke).not.toHaveBeenCalled();
      expect(clearCookie).toHaveBeenCalled();
      expect(send).toHaveBeenCalled();
    });
  });
});
