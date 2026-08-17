import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import type { User } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma/prisma.service';

/** Janela de vida da sessao: 7 dias. */
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Sessao opaca persistida no model `Session`.
 *
 * O token e aleatorio de 256 bits e guardado em claro: nao e derivado de
 * segredo do usuario nem reutilizavel em outro sistema, entao um hash so
 * protegeria contra leitura do banco — cenario em que o atacante ja teria os
 * dados que a sessao protege. Ver a spec para o racional completo.
 */
@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  /** Cria uma sessao e devolve o token que vai no cookie. */
  async create(userId: string): Promise<string> {
    const sessionToken = randomBytes(32).toString('hex');

    await this.prisma.session.create({
      data: {
        sessionToken,
        userId,
        expires: new Date(Date.now() + SESSION_TTL_MS),
      },
    });

    return sessionToken;
  }

  /**
   * Valida o token. Devolve o usuario dono da sessao, ou null.
   *
   * Renovacao deslizante: o `expires` so e reescrito quando resta menos da
   * metade da janela. Sem esse limiar seria um UPDATE por request; com ele,
   * no maximo uma escrita a cada 3,5 dias por usuario.
   */
  async validate(sessionToken: string): Promise<User | null> {
    const session = await this.prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session) {
      return null;
    }

    const remaining = session.expires.getTime() - Date.now();

    if (remaining <= 0) {
      // Limpeza preguicosa: sem job periodico, a linha morta sai quando aparece.
      await this.prisma.session.delete({ where: { sessionToken } });
      return null;
    }

    if (remaining < SESSION_TTL_MS / 2) {
      await this.prisma.session.update({
        where: { sessionToken },
        data: { expires: new Date(Date.now() + SESSION_TTL_MS) },
      });
    }

    return session.user;
  }

  /** Revoga uma sessao. `deleteMany` para nao lancar se ja nao existir. */
  async revoke(sessionToken: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { sessionToken } });
  }
}
