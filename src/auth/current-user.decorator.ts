import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from './jwt.types';

export const CurrentUser = createParamDecorator(
  (_, ctx: ExecutionContext): JwtPayload => {
    return ctx.switchToHttp().getRequest<{ user: JwtPayload }>().user;
  },
);
