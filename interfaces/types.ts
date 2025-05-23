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

export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER'
}

export interface User {
    username: string;
    password: string;
    role: UserRole;
}

export interface PlayerTeam {
    id: string;
    name: string;
    league: string;
    teamLogoUrl: string;
    foundedYear: number;
    stadium: string;
}

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
    currentTeam: PlayerTeam;
}
