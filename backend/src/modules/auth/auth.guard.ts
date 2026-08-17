import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { SessionGuard } from './session.guard';
import { SessionService } from './session.service';

/**
 * Guard dos endpoints protegidos: sessao valida E conta aprovada.
 *
 * Role continua vindo do banco (via SessionGuard), nunca de header — o
 * `x-user-id` deixou de existir nesta versao.
 */
@Injectable()
export class AuthGuard extends SessionGuard {
  // Construtor explicito de proposito: uma subclasse sem construtor proprio
  // nao emite `design:paramtypes`, e o Nest injetaria `undefined` no
  // SessionService — falha so em runtime, no primeiro request.
  constructor(sessionService: SessionService) {
    super(sessionService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest<Request>();

    if (request.user?.status !== 'APPROVED') {
      throw new ForbiddenException('Conta pendente de aprovacao.');
    }

    return true;
  }
}
