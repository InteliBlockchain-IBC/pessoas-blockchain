import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { GoogleOAuthService } from './google-oauth.service';
import { SessionGuard } from './session.guard';
import { SessionService } from './session.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    SessionGuard,
    SessionService,
    GoogleOAuthService,
    AuthRepository,
  ],
  exports: [AuthGuard, SessionGuard, SessionService, AuthService, GoogleOAuthService],
})
export class AuthModule {}
