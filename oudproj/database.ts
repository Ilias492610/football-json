import { Collection, MongoClient, ObjectId, SortDirection } from "mongodb";
import dotenv from "dotenv";
import { User, Video } from "./types";
import bcrypt from "bcrypt";
dotenv.config();

const initialUsers: User[] = [
    {
        username: "user1",
        password: "user1",
        favorites: []
    },
    {
        username: "user2",
        password: "user2",
        favorites: []
    }
];


export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
export const client = new MongoClient(MONGODB_URI);

export const videoCollection : Collection<Video> = client.db("youtube").collection<Video>("videos");
export const userCollection : Collection<User> = client.db("youtube").collection<User>("users");


export async function exit() {
    try {
        await client.close();
        console.log("Disconnected from database");
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}

async function seedDatabase() {  
    if (await videoCollection.countDocuments() === 0 || await userCollection.countDocuments() === 0 || process.env.CLEAR_DB_ON_RESTART === "true") {
        const response = await fetch("https://raw.githubusercontent.com/similonap/json/master/videos.json");
        const videos : Video[] = (await response.json()).videos;
    
        await videoCollection.deleteMany({});
        await videoCollection.insertMany(videos);
        await userCollection.deleteMany({});
        for (const user of initialUsers) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await userCollection.insertOne({ ...user, password: hashedPassword });
        }
    }
}

export async function getVideos(q: string, sortField: string, direction: number) {
    let SortDirection : SortDirection = direction as SortDirection;
    return await videoCollection.find({title: new RegExp(q, "i")}).sort({[sortField]: SortDirection}).toArray();
}

export async function login(username: string, password: string) {
    const user : User | null = await userCollection.findOne({ username : username });
    if (!user) {
        throw new Error("Username/password not valid");
    }
    if (!await bcrypt.compare(password, user.password)) {
        throw new Error("Username/password not valid");
    }
    return user;
}

export async function getUser(username: string) {
    return await userCollection.findOne({ username : username });
}

export async function getUserByUserName(username: string) {
    return await userCollection.findOne({ username : username });
}

export async function getVideoById(id: string) {
    return await videoCollection.findOne({ _id : new ObjectId(id) });
}

export async function saveUser(user: User) {
    await userCollection.replaceOne({ _id : user._id }, user);
}

export async function createVideo(video: Video) {
    await videoCollection.insertOne(video);
}

export async function connect() {
    try {
        await client.connect();
        console.log("Connected to database");
        await seedDatabase();
        process.on("SIGINT", exit);
    } catch (error) {
        console.error(error);
    }
}