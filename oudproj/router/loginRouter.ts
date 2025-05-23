import express from "express";
import { login } from "../database";
import { User } from "../types";

export default function loginRouter() {
    const router = express.Router();

    router.get("/login", (req, res) => {
        res.render("login");
    });

    router.post("/login", async(req, res) => {
        try {
            const username : string = req.body.username;
            const password : string = req.body.password;
            const user : User = await login(username, password);
            req.session.username = user.username;
            res.redirect("/");
        } catch (e : any) {
            req.session.errorMessage = e.message;
            res.redirect("/login");
        }
    });

    router.get("/logout", (req, res) => {
        delete req.session.username;
        res.redirect("/login")
    });

    return router;
}