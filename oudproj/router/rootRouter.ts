import express from "express";
import { getVideos, getUser, getVideoById, saveUser, createVideo } from "../database";
import { User, Video } from "../types";

export default function rootRouter() {
    const router = express.Router();

    router.get("/", async(req, res) => {
        let username : string = req.session.username!
        const q : string = typeof req.query.q === "string" ? req.query.q : "";
        const sortField: string = typeof req.query.sortField === "string" ? req.query.sortField : "title";
        const direction: number = typeof req.query.direction === "string" ? parseInt(req.query.direction) : 1;

        const videos : Video[] = await getVideos(q, sortField, direction);
        let user : User | null = await getUser(username);
        if (user) {
            res.render("index", {
                videos: videos,
                q: q,
                direction: direction,
                user: user
            });
        } else {
            res.redirect("/login");
        }
    });

    router.get("/create", (req, res) => {
        res.render("create");
    });


    router.post("/create", async(req, res) => {
        const title: string = req.body.title;
        const url: string = req.body.url;
        const description: string = req.body.description;
        const rating: number = parseFloat(req.body.rating);

        await createVideo({
            title: title,
            url: url,
            description: description,
            rating: rating
        });

        res.redirect("/");
    });

    router.post("/favorite/:id", async(req, res) => {   
        const id : string = req.params.id;
        let username : string = req.session.username!

        let user : User | null = await getUser(username);
        let video : Video | null = await getVideoById(id);
        
        if (user && video) {
            user.favorites.push(video);
            await saveUser(user);
        }

        res.redirect("back");
    });

    router.post("/unfavorite/:id", async(req, res) => {
        const id : string = req.params.id;
        let username : string = req.session.username!

        let user : User | null = await getUser(username);
        let video : Video | null = await getVideoById(id);
        
        if (user && video) {
            user.favorites = user.favorites.filter(fav => fav.title != video.title);
            await saveUser(user);
        }

        res.redirect("back");
    });

    return router;
}