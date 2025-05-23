import { Request, Response, NextFunction } from "express";

export function flashMiddleware(req: Request, res: Response, next: NextFunction) {
    res.locals.errorMessage = req.session.errorMessage;
    req.session.errorMessage = undefined;
    next();
}