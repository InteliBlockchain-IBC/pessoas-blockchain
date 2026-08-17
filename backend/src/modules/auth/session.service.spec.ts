import { Test, TestingModule } from '@nestjs/testing';
import { SessionService, SESSION_TTL_MS } from './session.service';
import { PrismaService } from '../../shared/database/prisma/prisma.service';

describe('SessionService', () => {
  let service: SessionService;

  const mockPrisma = {
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const user = { id: 'user-1', role: 'PEOPLE', status: 'APPROVED' };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<SessionService>(SessionService);
  });

  it('cria uma sessao com token hex de 64 caracteres e expiracao de 7 dias', async () => {
    mockPrisma.session.create.mockResolvedValue({});
    const before = Date.now();

    const token = await service.create('user-1');

    expect(token).toMatch(/^[0-9a-f]{64}$/);
    const data = mockPrisma.session.create.mock.calls[0][0].data;
    expect(data.userId).toBe('user-1');
    expect(data.sessionToken).toBe(token);
    expect(data.expires.getTime()).toBeGreaterThanOrEqual(before + SESSION_TTL_MS - 1000);
  });

  it('devolve null quando a sessao nao existe', async () => {
    mockPrisma.session.findUnique.mockResolvedValue(null);
    expect(await service.validate('inexistente')).toBeNull();
  });

  it('deleta a linha e devolve null quando a sessao expirou', async () => {
    mockPrisma.session.findUnique.mockResolvedValue({
      sessionToken: 'tok',
      expires: new Date(Date.now() - 1000),
      user,
    });
    mockPrisma.session.delete.mockResolvedValue({});

    expect(await service.validate('tok')).toBeNull();
    expect(mockPrisma.session.delete).toHaveBeenCalledWith({
      where: { sessionToken: 'tok' },
    });
  });

  it('NAO renova quando resta mais da metade da janela', async () => {
    mockPrisma.session.findUnique.mockResolvedValue({
      sessionToken: 'tok',
      expires: new Date(Date.now() + SESSION_TTL_MS - 60_000),
      user,
    });

    expect(await service.validate('tok')).toEqual(user);
    expect(mockPrisma.session.update).not.toHaveBeenCalled();
  });

  it('renova quando resta menos da metade da janela', async () => {
    mockPrisma.session.findUnique.mockResolvedValue({
      sessionToken: 'tok',
      expires: new Date(Date.now() + 60_000),
      user,
    });
    mockPrisma.session.update.mockResolvedValue({});

    expect(await service.validate('tok')).toEqual(user);
    expect(mockPrisma.session.update).toHaveBeenCalledTimes(1);
    const arg = mockPrisma.session.update.mock.calls[0][0];
    expect(arg.where).toEqual({ sessionToken: 'tok' });
    expect(arg.data.expires.getTime()).toBeGreaterThan(Date.now() + SESSION_TTL_MS - 5000);
  });

  it('revoga sem lancar quando o token nao existe', async () => {
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });
    await expect(service.revoke('tok')).resolves.toBeUndefined();
    expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
      where: { sessionToken: 'tok' },
    });
  });
});
