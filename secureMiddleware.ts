import { NextFunction, Request, Response } from "express";

/**
 * Middleware to secure routes that require authentication
 * Redirects to login page if user is not authenticated
 */
export function secureMiddleware(req: Request, res: Response, next: NextFunction) {
    const PUBLIC_ROUTES = ["/login", "/register"];
    if (PUBLIC_ROUTES.includes(req.path) || req.session.isAuthenticated) {
        next();
    } else {
        res.redirect("/login");
    }
}

/**
 * Middleware to prevent logged-in users from accessing login/register pages
 * Redirects to home page if user is already authenticated
 */
export function loggedIn(req: Request, res: Response, next: NextFunction) {
    if (req.session.isAuthenticated) {
        return res.redirect("/");
    }
    next();
}
