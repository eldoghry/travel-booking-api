import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { first } from 'rxjs';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) return null;

    const user = request['user'];

    const structuredUser = {
      id: user?.sub,
      sid: user?.sid,
      name: user?.name,
      firstName: user?.given_name,
      lastName: user?.family_name,
      email: user?.email,
      email_verified: user?.email_verified,
      roles: [
        ...(user?.realm_access?.roles || []),
        ...(user?.resource_access?.travel_booking_client?.roles || []),
      ],
    };

    return data ? structuredUser?.[data] : structuredUser;
  },
);
