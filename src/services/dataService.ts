import { Player } from '../models/Player';
import { Team } from '../models/Team';
import { Player as PlayerType, Team as TeamType } from '../interfaces/types';
import fs from 'fs';
import path from 'path';

export const loadPlayers = async (): Promise<PlayerType[]> => {
    try {
        // Check if we have data in MongoDB
        const count = await Player.countDocuments();
        
        if (count === 0) {
            try {
                // If no data, use local JSON files instead of fetching from GitHub
                const rootDir = path.resolve(__dirname, '../../../');
                const playersFilePath = path.join(rootDir, 'players.json');
                
                console.log('Loading players from local file:', playersFilePath);
                console.log('File exists:', fs.existsSync(playersFilePath));
                
                const playersData = fs.readFileSync(playersFilePath, 'utf8');
                const players: PlayerType[] = JSON.parse(playersData);
                
                console.log(`Found ${players.length} players in JSON file`);
                
                // Save to MongoDB
                await Player.insertMany(players);
                console.log('Players saved to MongoDB');
                return players;
            } catch (fileError) {
                console.error('Error reading local players file:', fileError);
                return [];
            }
        }
        
        // If data exists, return from MongoDB
        const players = await Player.find().lean();
        console.log(`Found ${players.length} players in MongoDB`);
        return players as unknown as PlayerType[];
    } catch (error) {
        console.error('Error loading players:', error);
        return [];
    }
};

export const loadTeams = async (): Promise<TeamType[]> => {
    try {
        // Check if we have data in MongoDB
        const count = await Team.countDocuments();
        
        if (count === 0) {
            try {
                // If no data, use local JSON files instead of fetching from GitHub
                const rootDir = path.resolve(__dirname, '../../../');
                const teamsFilePath = path.join(rootDir, 'teams.json');
                
                console.log('Loading teams from local file:', teamsFilePath);
                console.log('File exists:', fs.existsSync(teamsFilePath));
                
                const teamsData = fs.readFileSync(teamsFilePath, 'utf8');
                const teams: TeamType[] = JSON.parse(teamsData);
                
                console.log(`Found ${teams.length} teams in JSON file`);
                
                // Save to MongoDB
                await Team.insertMany(teams);
                console.log('Teams saved to MongoDB');
                return teams;
            } catch (fileError) {
                console.error('Error reading local teams file:', fileError);
                return [];
            }
        }
        
        // If data exists, return from MongoDB
        const teams = await Team.find().lean();
        console.log(`Found ${teams.length} teams in MongoDB`);
        return teams as unknown as TeamType[];
    } catch (error) {
        console.error('Error loading teams:', error);
        return [];
    }
};

export const updatePlayer = async (id: string, playerData: Partial<PlayerType>): Promise<PlayerType | null> => {
    try {
        const result = await Player.findOneAndUpdate(
            { id },
            { $set: playerData },
            { new: true }
        ).lean();
        return result as unknown as PlayerType;
    } catch (error) {
        console.error('Error updating player:', error);
        return null;
    }
};

export const updateTeam = async (id: string, teamData: Partial<TeamType>): Promise<TeamType | null> => {
    try {
        const result = await Team.findOneAndUpdate(
            { id },
            { $set: teamData },
            { new: true }
        ).lean();
        return result as unknown as TeamType;
    } catch (error) {
        console.error('Error updating team:', error);
        return null;
    }
}; 