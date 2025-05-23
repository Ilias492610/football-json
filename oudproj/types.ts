import { ObjectId } from "mongodb";

export interface User {
    _id?: ObjectId;
    username: string;
    password: string;
    favorites: Video[];
}

export interface Video {
    _id?: ObjectId;
    title: string;
    url: string;
    description: string;
    rating: number;
}