import session from "../session"
import { Request, Response, NextFunction } from "express";

export function loginMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.session.username) {
        next();
    } else {
        return res.redirect("/login");
    }
}