import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from 'uuid';

interface AuthenticatedRequest extends Request {
  user?: { id?: string };
}

@Injectable()
export class GuestIdMiddleware implements NestMiddleware {

    use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const hasUser = req.user?.id;  
        const hasGuestId = req.cookies?.guestId;
        if (!hasUser && !hasGuestId) {
            const guestId = uuidv4()
            res.cookie('guestId', guestId, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days
            })
            
            // update req.cookies with new guestId
            req.cookies = { ...(req.cookies || {}), guestId }
        }
        next()
    }
}