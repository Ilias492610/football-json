import { userCollection, videoCollection } from "./database";
import request from "supertest";
import app from "./app";
import bcrypt from "bcrypt";
import { parse } from "node-html-parser";
import { Video } from "./types";

describe("loginRouter tests", () => {
    test("that a user can see the login page", async () => {
        const response = await request(app).get("/login");

        const root = parse(response.text);

        const form = root.querySelector("form");
        expect(form).toBeTruthy();

        expect(response.status).toBe(200);
    });

    test("that the user can login with username and password", async () => {
        const findMock = jest.spyOn(userCollection, 'findOne').mockImplementation(() => ({
            username: "test",
            password: bcrypt.hashSync("test", 10),
            favorites: []
        }) as any);

        const agent = request.agent(app);

        const response = await agent.post("/login").send({ username: "test", password: "test" });
        expect(response.status).toBe(302);
        expect(response.header.location).toBe("/");
        expect(findMock).toHaveBeenCalledWith({ username: "test" });

        const sessionResponse = await agent.get("/session");
        expect(sessionResponse.body).toHaveProperty("username", "test");

    });

    test("that the user cannot login with a wrong password", async () => {
        const findMock = jest.spyOn(userCollection, 'findOne').mockImplementation(() => ({
            username: "test",
            password: bcrypt.hashSync("test", 10),
            favorites: []
        }) as any);

        const agent = request.agent(app);

        const response = await agent.post("/login").redirects(1).send({ username: "test", password: "wrong" });
        expect(findMock).toHaveBeenCalledWith({ username: "test" });

        const root = parse(response.text);

        const errorMessage = root.querySelector(".error-message")?.innerText;

        expect(errorMessage).toBe("Username/password not valid");

        const sessionResponse = await agent.get("/session");
        expect(sessionResponse.body).not.toHaveProperty("username");
    });

    test("that the user cannot login with a wrong username", async () => {
        const findMock = jest.spyOn(userCollection, 'findOne').mockImplementation(() => null as any);

        const agent = request.agent(app);

        const response = await agent.post("/login").redirects(1).send({ username: "wrong", password: "test" });
        expect(findMock).toHaveBeenCalledWith({ username: "wrong" });

        const root = parse(response.text);

        const errorMessage = root.querySelector(".error-message")?.innerText;

        expect(errorMessage).toBe("Username/password not valid");

        const sessionResponse = await agent.get("/session");
        expect(sessionResponse.body).not.toHaveProperty("username");
    });

    test("that the user cannot reach root page without logging in", async () => {
        const agent = request.agent(app);

        const response = await agent.get("/");
        expect(response.status).toBe(302);
        expect(response.header.location).toBe("/login");
    });

    test("that the user cannot reach create page without logging in", async () => {
        const agent = request.agent(app);

        const response = await agent.get("/create");
        expect(response.status).toBe(302);
        expect(response.header.location).toBe("/login");
    });

    test("that the user can logout", async () => {
        const findMock = jest.spyOn(userCollection, 'findOne').mockImplementation(() => ({
            username: "test",
            password: bcrypt.hashSync("test", 10),
            favorites: []
        }) as any);

        const agent = request.agent(app);
        await agent.post("/login").send({ username: "test", password: "test" });

        let sessionResponse = await agent.get("/session");
        expect(sessionResponse.body).toHaveProperty("username");

        const response = await agent.get("/logout");
        expect(response.status).toBe(302);
        expect(response.header.location).toBe("/login");

        sessionResponse = await agent.get("/session");
        expect(sessionResponse.body).not.toHaveProperty("username");
    });

    afterEach(() => {
        jest.clearAllMocks();
    })
});


describe("rootRouter tests", () => {
    let agent: any;
    let mockVideos: Video[] = [
        { title: "test", url: "test", description: "test", rating: 5 },
        { title: "test2", url: "test2", description: "test2", rating: 4 }
    ];

    beforeEach(async () => {
        jest.spyOn(userCollection, 'findOne').mockImplementation(() => ({
            username: "test",
            password: bcrypt.hashSync("test", 10),
            favorites: []
        }) as any);

        jest.spyOn(videoCollection, 'find',).mockImplementation(() => ({
            sort: jest.fn().mockImplementation(() => ({
                toArray: jest.fn().mockResolvedValue(mockVideos)
            }))
        }) as any);

        agent = request.agent(app);
        await agent.post("/login").send({ username: "test", password: "test" });
        expect((await agent.get("/session")).body).toHaveProperty("username", "test");

    });


    test("that a authenticated user can see the root page and videos are visible", async () => {
        const response = await agent.get("/");
        const root = parse(response.text);
        const trs = root.querySelectorAll("tbody tr");
        for (let i = 0; i<trs.length; i++) {
            const tds = trs[i].querySelectorAll("td");
            expect(tds[0].innerText).toBe(mockVideos[i].title);
            expect(tds[1].innerText).toBe(mockVideos[i].url);
            expect(tds[2].innerText).toBe(mockVideos[i].description);
            expect(tds[3].innerText).toBe(mockVideos[i].rating.toString());
        }
        expect(response.status).toBe(200);
    });

    test("that an authenticated user can search for videos", async () => {
        let findMock = jest.spyOn(videoCollection, 'find',).mockImplementation(() => ({
            sort: jest.fn().mockImplementation(() => ({
                toArray: jest.fn().mockResolvedValue(mockVideos.filter(video => video.title.includes("test2")))
            }))
        }) as any);
        const response = await agent.get("/?q=test2");
        
        expect(response.status).toBe(200);
        expect(findMock).toHaveBeenCalledWith({ title: /test2/i });
    });


    let fields: string[] = ["title", "description", "rating"];
    for (let field of fields) {
        for (let direction of [1, -1]) {
            test(`that an authenticated user can sort videos on ${field} (${direction === 1 ? "ASC" : "DESC"})`, async () => {
                let sortMock = jest.fn().mockImplementation(() => ({
                    toArray: jest.fn().mockResolvedValue(mockVideos)
                }));
                jest.spyOn(videoCollection, 'find',).mockImplementation(() => ({
                    sort: sortMock
                }) as any);

        
                const response = await agent.get(`/?sortField=${field}&direction=${direction}`);
                
                expect(response.status).toBe(200);
                expect(sortMock).toHaveBeenCalledWith({ [field]: direction });
            
            });
        }
    }

    afterEach(() => {
        jest.clearAllMocks();
    });
});