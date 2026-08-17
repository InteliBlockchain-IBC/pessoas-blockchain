import { Test, TestingModule } from '@nestjs/testing';
import { AuthRepository } from './auth.repository';
import { PrismaService } from '../../shared/database/prisma/prisma.service';

describe('AuthRepository.upsertGoogleUser', () => {
  let repository: AuthRepository;

  const tx = {
    user: { upsert: jest.fn() },
    account: { upsert: jest.fn() },
  };

  const mockPrisma = {
    $transaction: jest.fn((cb: any) => cb(tx)),
  };

  const profile = {
    email: 'novo@sou.inteli.edu.br',
    name: 'Novo Membro',
    picture: null as unknown as string | undefined,
    sub: 'google-sub-1',
  };
  const tokens = { access_token: 'at' };

  beforeEach(async () => {
    jest.clearAllMocks();
    tx.user.upsert.mockResolvedValue({ id: 'u1', status: 'PENDING' });
    tx.account.upsert.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    repository = module.get<AuthRepository>(AuthRepository);
  });

  it('nao força status no create — o default PENDING do schema vale', async () => {
    await repository.upsertGoogleUser(profile, tokens);

    const args = tx.user.upsert.mock.calls[0][0];
    expect(args.create).not.toHaveProperty('status');
  });

  it('nao toca em status no update — a rejeicao do admin nao e desfeita', async () => {
    await repository.upsertGoogleUser(profile, tokens);

    const args = tx.user.upsert.mock.calls[0][0];
    expect(args.update).not.toHaveProperty('status');
  });
});
