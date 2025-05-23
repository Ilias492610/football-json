import { URI } from "./database";
import session from "express-session";
import { UserRole } from "./types";
import mongoDbSession from "connect-mongodb-session";
const MongoDBStore = mongoDbSession(session);

const mongoStore = new MongoDBStore({
    uri: URI,
    collection: "sessions",
    databaseName: "football-app",
});

declare module 'express-session' {
    export interface SessionData {
        userId?: string;
        username?: string;
        role?: string;
        isAuthenticated?: boolean;
        errorMessage?: string | null;
        successMessage?: string | null;
    }
}

export default session({
    secret: process.env.SESSION_SECRET ?? "football-app-secret-key",
    store: mongoStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        secure: process.env.NODE_ENV === 'production'
    }
});
