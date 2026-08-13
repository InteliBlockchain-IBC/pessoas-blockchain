import type { CookieOptions } from 'express';
import { SESSION_TTL_MS } from './session.service';

export const SESSION_COOKIE = 'session';

/**
 * Opcoes do cookie de sessao.
 *
 * `sameSite: 'lax'` basta porque front e API sao subdominios do mesmo site
 * registravel (`pessoas.` e `api-pessoas.inteliblockchain.org`) — e em dev
 * `localhost:3000` e `localhost:3001` tambem sao same-site, porque a porta
 * nao entra na definicao. `COOKIE_DOMAIN` so e setado em producao; sem ele o
 * cookie fica preso ao host que o emitiu, que e o correto em dev.
 */
export function sessionCookieOptions(): CookieOptions {
  const domain = process.env.COOKIE_DOMAIN;

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL_MS,
    path: '/',
    ...(domain ? { domain } : {}),
  };
}
