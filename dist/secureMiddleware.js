"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.secureMiddleware = secureMiddleware;
exports.loggedIn = loggedIn;
function secureMiddleware(req, res, next) {
    var _a;
    const PUBLIC_ROUTES = ["/login", "/register"];
    if (PUBLIC_ROUTES.includes(req.path) || ((_a = req.session) === null || _a === void 0 ? void 0 : _a.isAuthenticated)) {
        next();
    }
    else {
        res.redirect("/login");
    }
}
function loggedIn(req, res, next) {
    var _a;
    if ((_a = req.session) === null || _a === void 0 ? void 0 : _a.isAuthenticated) {
        return res.redirect("/");
    }
    next();
}
