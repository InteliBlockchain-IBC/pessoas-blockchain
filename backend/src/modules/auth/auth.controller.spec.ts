import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthRepository } from './auth.repository';
import { GoogleOAuthService } from './google-oauth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthRepository = { findUserById: jest.fn() };
  const mockGoogleOAuthService = {};

  const requestFor = (id: string) =>
    ({ user: { id, role: 'ADMIN' } }) as unknown as Request;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: GoogleOAuthService, useValue: mockGoogleOAuthService },
        { provide: AuthRepository, useValue: mockAuthRepository },
      ],
    })
      // getMe tem @UseGuards(AuthGuard), que depende do PrismaService. O
      // teste chama o método do controller direto (sem pipeline HTTP), então
      // o guard nunca roda — só precisa existir pra o Nest compilar o módulo.
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('getMe', () => {
    const dbUser = {
      id: 'user-1',
      name: 'Messias Olivindo',
      email: 'messias@sou.inteli.edu.br',
      image: 'https://lh3.googleusercontent.com/foto',
      role: 'ADMIN',
      status: 'APPROVED',
      memberId: null,
      emailVerified: null,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      accounts: [
        { id: 'acc-1', provider: 'google', providerAccountId: '123', scope: 'openid email' },
      ],
    };

    it('devolve id, name, email, image e role do usuario autenticado', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(dbUser);

      const result = await controller.getMe(requestFor('user-1'));

      expect(mockAuthRepository.findUserById).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({
        id: 'user-1',
        name: 'Messias Olivindo',
        email: 'messias@sou.inteli.edu.br',
        image: 'https://lh3.googleusercontent.com/foto',
        role: 'ADMIN',
      });
    });

    it('nao vaza accounts nem status na resposta', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(dbUser);

      const result = await controller.getMe(requestFor('user-1'));

      expect(result).not.toHaveProperty('accounts');
      expect(result).not.toHaveProperty('status');
    });

    it('devolve name nulo quando o usuario nunca teve nome no Google', async () => {
      mockAuthRepository.findUserById.mockResolvedValue({
        ...dbUser,
        name: null,
        image: null,
      });

      const result = await controller.getMe(requestFor('user-1'));

      expect(result.name).toBeNull();
      expect(result.image).toBeNull();
    });

    it('lanca 401 quando o usuario sumiu entre o guard e a busca', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(null);

      await expect(controller.getMe(requestFor('user-1'))).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
