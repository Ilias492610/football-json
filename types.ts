import { ObjectId } from "mongodb";

/**
 * Interface for Player data
 */
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

/**
 * Interface for Team data
 */
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

/**
 * Interface for CurrentTeam data within Player
 */
export interface CurrentTeam {
    id: string;
    name: string;
    league: string;
    teamLogoUrl: string;
    foundedYear: number;
    stadium: string;
}

/**
 * Interface for User data
 */
export interface User {
    _id?: ObjectId;
    username: string;
    password: string;
    role: string;
    createdAt?: Date;
}

/**
 * Enum for user roles
 */
export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER'
}
