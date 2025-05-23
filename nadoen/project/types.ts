import { ObjectId } from "mongodb";

export interface Character {
    _id: string;
    name: string;
    wikiUrl: string;
    race: string;
    birth: string;
    gender: string;
    death: string;
    hair: string;
    spouse: string;
    quotes: Quote[];
}

export interface PlayerInfo {
    _id?: ObjectId
    username: string,
    name: string,
    password: string,
    email: string,
    level: number,
    imageUrl: string,
    exp: number,
    requiredExp: number,
    favoritedQuotes: Quote[],
    blacklistedQuotes: Quote[],
    highscores: Score[]
}

export interface Score {
    name: "tenRounds" | "suddenDeath" | "timedQuiz";
    score: number
}

export interface Quote {
    _id: string;
    dialog: string;
    movie: string;
    character: string;
    id: string;
    reason?: string;
}

export interface Movie {
    name: string;
    id: string;
}

export interface FavoritedQuote {
    character: Character;
    dialog: string[];
}

export interface BlackListedQuote {
    character: Character;
    dialog: BlackListedQuoteTemplate[]
}

export interface BlackListedQuoteTemplate {
    quoteText: string;
    blackListReason: string;
}