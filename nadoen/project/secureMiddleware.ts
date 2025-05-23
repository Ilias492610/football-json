import { NextFunction, Request, Response } from "express";
import { ReturnDocument } from "mongodb";

export function secureMiddleware(req: Request, res: Response, next: NextFunction) {
    const PUBLIC_ROUTES = ["/login", "/register"];
    if (PUBLIC_ROUTES.includes(req.path) || req.session.user) { //heb dit even geadd omdat het een perma loop cycle creërde. Dit zorgt er gewoon voor dat mensen die geen local session hebben, dat ze alleen naar login/register kunnen gaan
        res.locals.user = req.session.user;
        next();
    } else {
        res.redirect("/login");
    }
};

export function loggedIn(req: Request, res: Response, next: NextFunction) {
    if (req.session.user) {
        return res.redirect("/quiz");
    }
    next();
}