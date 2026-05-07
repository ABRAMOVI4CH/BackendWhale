import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { JwtPayload } from './jwt.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<
      Request & { user?: JwtPayload }
    >();

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedException();

    try {
      const token = authHeader.slice('Bearer '.length);
      req.user = await this.jwt.verifyAsync<JwtPayload>(token);
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
