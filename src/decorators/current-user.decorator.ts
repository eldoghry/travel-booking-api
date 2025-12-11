import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from 'src/common/interfaces/auth-user.interface';

/**
 * Custom decorator to retrieve the authenticated user object or a specific property from it.
 *
 * Usage:
 * - @CurrentUser() user: AuthenticatedUser // Gets the full user object
 * - @CurrentUser('email') email: string // Gets a specific property, e.g., email
 *
 * @param propertyOnUser The property name on the AuthenticatedUser object to retrieve.
 * @param ctx The ExecutionContext.
 */
export const CurrentUser = createParamDecorator(
  (propertyOnUser: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) return null;

    const user: AuthenticatedUser = request['user'];

    return propertyOnUser ? user?.[propertyOnUser] : user;
  },
);
