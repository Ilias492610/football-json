import { ObjectId } from "mongodb";

export interface Player {
    id: string;
    name: string;
    description: string;
    age: number;
    isActive: boolean;
    birthDate: string;
    imageUrl: string;
    position: string;
    skills: string[];
    nationality: string;
    currentTeam: CurrentTeam;
}

export interface Team {
    id: string;
    name: string;
    league: string;
    foundedYear: number;
    stadium: string;
    manager: string;
    country: string;
    imageUrl: string;
}

export interface CurrentTeam {
    id: string;
    name: string;
    league: string;
    teamLogoUrl: string;
    foundedYear: number;
    stadium: string;
}

export interface User {
    _id?: ObjectId;
    username: string;
    password: string;
    role: string;
    createdAt?: Date;
}

export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER'
}
