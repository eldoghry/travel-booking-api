import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GuestIdMiddleware implements NestMiddleware {

    use(req: Request, res: Response, next: NextFunction) {
        if (!req.cookies?.guestId) {
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