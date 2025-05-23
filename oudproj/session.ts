import { MONGODB_URI } from "./database";
import session from "express-session";
import mongoDbSession from "connect-mongodb-session";
const MongoDBStore = mongoDbSession(session);

const mongoStore = new MongoDBStore({
    uri: MONGODB_URI,
    collection: "sessions",
    databaseName: "login-express",
});

declare module "express-session" {
    export interface SessionData {
        username: string;
        errorMessage: string;
    }
}

export default session({
    secret: process.env.SESSION_SECRET ?? "my-super-secret-secret",
    store: mongoStore,
    resave: true,
    saveUninitialized: true
});