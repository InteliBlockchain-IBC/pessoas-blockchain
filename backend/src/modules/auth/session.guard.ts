import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SESSION_COOKIE } from './session.cookie';
import { SessionService } from './session.service';

/**
 * Valida o cookie de sessao e injeta `req.user`.
 *
 * NAO checa `status` — e usado por `/auth/me` e `/auth/logout`, que precisam
 * funcionar para um usuario PENDING (e o que permite o frontend mandar ele
 * para /pendente em vez de mostrar um erro).
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(protected readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.[SESSION_COOKIE] as string | undefined;

    if (!token) {
      throw new UnauthorizedException('Usuario nao autenticado.');
    }

    const user = await this.sessionService.validate(token);

    if (!user) {
      throw new UnauthorizedException('Sessao invalida ou expirada.');
    }

    request.user = {
      id: user.id,
      role: user.role,
      status: user.status,
      name: user.name,
      email: user.email,
      image: user.image,
    };

    return true;
  }
}
