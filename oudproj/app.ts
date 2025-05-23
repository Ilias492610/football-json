import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import rootRouter from "./router/rootRouter";
import cookieParser from "cookie-parser";
import loginRouter from "./router/loginRouter";
import { loginMiddleware } from "./middleware/loginMiddleware";
import { flashMiddleware } from "./middleware/flashMiddleware";
import session from "./session";

dotenv.config();

const app : Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(session);
app.use(cookieParser());
app.use(flashMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT ?? 3000);

app.use("/", loginRouter());
app.use("/", loginMiddleware, rootRouter());
app.get("/session", (req, res) => {
    res.status(200).json(req.session);
});

export default app;