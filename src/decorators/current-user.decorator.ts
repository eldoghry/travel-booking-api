import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { first } from 'rxjs';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) return null;

    const user = request['user'];

    return data ? user?.[data] : user;
  },
);
