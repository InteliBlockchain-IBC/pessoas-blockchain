import {
  Controller,
  ForbiddenException,
  Get,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { AuthRepository } from './auth.repository';
import { GoogleOAuthService } from './google-oauth.service';

/**
 * Authentication endpoints for the API.
 *
 * - `GET /auth/me` — returns the currently authenticated user (via headers).
 * - `GET /auth/google` — redirects to Google's OAuth consent screen.
 * - `GET /auth/google/callback` — handles the Google OAuth callback.
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly authRepository: AuthRepository,
  ) {}

  private getFrontendBaseUrl(): string {
    const frontendUrl = process.env.FRONTEND_URL;

    if (frontendUrl) {
      return frontendUrl;
    }

    if (process.env.NODE_ENV !== 'production') {
      return 'http://localhost:3000';
    }

    throw new Error('FRONTEND_URL is required in production.');
  }

  private buildFrontendUrl(
    path: string,
    params?: Record<string, string>,
  ): string {
    const url = new URL(path, this.getFrontendBaseUrl());
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  }

  /**
   * Return the authenticated user based on request headers.
   *
   * O AuthGuard só injeta { id, role } em req.user — o rodapé da sidebar
   * precisa de name/email/image, então buscamos o usuário aqui em vez de
   * alargar o select do guard, que roda em toda requisição autenticada.
   *
   * @param req - Request with user data injected by the AuthGuard.
   * @returns The current user.
   */
  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Return the authenticated user' })
  @ApiOkResponse({ description: 'Authenticated user payload.' })
  async getMe(@Req() req: Request) {
    const userId = req.user?.id;
    const user = userId ? await this.authRepository.findUserById(userId) : null;

    if (!user) {
      throw new UnauthorizedException('Usuario nao encontrado.');
    }

    // Mapeamento explícito: findUserById traz `accounts` junto, e o cliente
    // não tem nada que ver com dado de conta OAuth.
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
    };
  }

  /**
   * Redirect the user to Google's OAuth 2.0 consent screen.
   *
   * This endpoint generates the authorization URL with the required scopes
   * (openid, email, profile, calendar.events) and redirects the browser.
   *
   * No authentication guard is applied — this is the entry point for login.
   */
  @Get('google')
  @ApiOperation({
    summary: 'Redirect to Google OAuth consent screen',
    description:
      'Generates the Google authorization URL and redirects the browser. ' +
      'Scopes include openid, email, profile, and calendar.events.',
  })
  @ApiOkResponse({
    description: '302 Redirect to Google accounts login.',
  })
  googleLogin(@Res() res: Response) {
    const url = this.googleOAuthService.getAuthUrl();
    return res.redirect(url);
  }

  /**
   * Handle the Google OAuth callback.
   *
   * Google redirects here after the user grants (or denies) consent.
   * The `code` query parameter is exchanged for tokens, the user's email
   * is validated against the institutional domain, and the User + Account
   * records are upserted in the database.
   *
   * @param code - Authorization code from Google.
   * @param error - Error parameter if user denied consent.
   * @returns User data with token status.
   */
  @Get('google/callback')
  @ApiOperation({
    summary: 'Google OAuth callback',
    description:
      'Receives the authorization code from Google, exchanges it for tokens, ' +
      'validates the email domain, and upserts the user and account records.',
  })
  @ApiQuery({
    name: 'code',
    required: false,
    description: 'Google authorization code',
  })
  @ApiQuery({
    name: 'error',
    required: false,
    description: 'Error from Google (e.g. access_denied)',
  })
  @ApiOkResponse({
    description: 'Redirects to frontend dashboard on success.',
  })
  async googleCallback(
    @Query('code') code?: string,
    @Query('error') error?: string,
    @Res() res?: Response,
  ) {
    if (error) {
      if (res) {
        return res.redirect(
          this.buildFrontendUrl('/login', { error: encodeURIComponent(error) }),
        );
      }
      throw new ForbiddenException(
        `Google OAuth negado: ${error}. O usuario precisa autorizar o acesso.`,
      );
    }

    if (!code) {
      if (res) {
        return res.redirect(
          this.buildFrontendUrl('/login', { error: 'NoCode' }),
        );
      }
      throw new ForbiddenException(
        'Codigo de autorizacao nao recebido do Google.',
      );
    }

    try {
      const user = await this.googleOAuthService.handleCallback(code);

      // No MVP, redirecionamos de volta para o dashboard apos salvar no BD.
      // Futuramente aqui criariamos a sessao/cookie JWT.
      if (res) {
        return res.redirect(
          this.buildFrontendUrl('/dashboard', {
            userId: user.id,
            role: user.role,
          }),
        );
      }
      return user;
    } catch (err: any) {
      // Se for invalid_grant por duplo-request do navegador, ignoramos e mandamos pro dashboard (pois o 1o ja logou)
      if (err.message?.includes('invalid_grant') && res) {
        return res.redirect(this.buildFrontendUrl('/dashboard'));
      }
      if (res) {
        return res.redirect(
          this.buildFrontendUrl('/login', { error: 'AuthFailed' }),
        );
      }
      throw err;
    }
  }
}
