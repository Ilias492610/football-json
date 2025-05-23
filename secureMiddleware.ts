import { NextFunction, Request, Response } from "express";

export function secureMiddleware(req: Request, res: Response, next: NextFunction) {
    const PUBLIC_ROUTES = ["/login", "/register"];
    
    if (PUBLIC_ROUTES.includes(req.path) || req.session?.isAuthenticated) {
        next();
    } else {
        res.redirect("/login");
    }
}

export function loggedIn(req: Request, res: Response, next: NextFunction) {
    if (req.session?.isAuthenticated) {
        return res.redirect("/");
    }
    
    next();
}
