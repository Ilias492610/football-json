import { Collection, MongoClient, ObjectId } from "mongodb";
import { Player, Team, User, UserRole } from "./types";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const PLAYERS_JSON_URL = 'https://raw.githubusercontent.com/Ilias492610/football-json/main/players.json';
const TEAMS_JSON_URL = 'https://raw.githubusercontent.com/Ilias492610/football-json/main/teams.json';

export const URI = process.env.MONGODB_URI || 'mongodb+srv://hamdaouiilias14:N7ymXJvMs0fzDvyA@webontwikkeling.abgrzzs.mongodb.net/?retryWrites=true&w=majority&appName=Webontwikkeling';

const CLIENT = new MongoClient(URI, {
    serverSelectionTimeoutMS: 5000, 
    connectTimeoutMS: 10000,       
    socketTimeoutMS: 45000,        
});
export const playersCollection: Collection = CLIENT.db("football-app").collection("players");
export const teamsCollection: Collection = CLIENT.db("football-app").collection("teams");
export const usersCollection: Collection = CLIENT.db("football-app").collection("users");

async function fetchDataFromUrl<T>(url: string): Promise<T[]> {
    try {
        const fetchModule = await import('node-fetch');
        const fetch = fetchModule.default;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Fout bij het ophalen van data van ${url}: ${response.statusText} (status: ${response.status})`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            console.warn(`Data opgehaald van ${url} is geen array. Ontvangen type:`, typeof data);
            
            if (typeof data === 'object' && data !== null) {
                const keys = Object.keys(data as object);
                if (keys.length === 1 && Array.isArray((data as any)[keys[0]])) {
                    console.log(`Array gevonden onder sleutel '${keys[0]}' in data van ${url}`);
                    return (data as any)[keys[0]] as T[];
                }
            }
            
            return []; 
        }
        
        return data as T[];
    } catch (error) {
        console.error(`Fout bij het ophalen of verwerken van data van ${url}:`, error);
        return [];
    }
}

export const loadPlayers = async (): Promise<Player[]> => {
    try {
        const count = await playersCollection.countDocuments();
        
        if (count === 0) {
            console.log('Geen spelers in MongoDB. Ophalen van URL:', PLAYERS_JSON_URL);
            
            const players: Player[] = await fetchDataFromUrl<Player>(PLAYERS_JSON_URL);
            
            if (players.length > 0) {
                await playersCollection.insertMany(players);
                console.log(`${players.length} spelers opgehaald van URL en opgeslagen in MongoDB`);
                return players;
            } else {
                console.log('Geen spelers opgehaald van URL of URL is incorrect/leeg.');
                return [];
            }
        }
        
        const playersFromDB = await playersCollection.find().toArray();
        console.log(`${playersFromDB.length} spelers gevonden in MongoDB`);
        return playersFromDB as unknown as Player[];
    } catch (error) {
        console.error('Fout bij het laden van spelers:', error);
        return [];
    }
};

export const loadTeams = async (): Promise<Team[]> => {
    try {
        const count = await teamsCollection.countDocuments();
        
        if (count === 0) {
            console.log('Geen teams in MongoDB. Ophalen van URL:', TEAMS_JSON_URL);
            
            const teams: Team[] = await fetchDataFromUrl<Team>(TEAMS_JSON_URL);
            
            if (teams.length > 0) {
                await teamsCollection.insertMany(teams);
                console.log(`${teams.length} teams opgehaald van URL en opgeslagen in MongoDB`);
                return teams;
            } else {
                console.log('Geen teams opgehaald van URL of URL is incorrect/leeg.');
                return [];
            }
        }
        
        const teamsFromDB = await teamsCollection.find().toArray();
        console.log(`${teamsFromDB.length} teams gevonden in MongoDB`);
        return teamsFromDB as unknown as Team[];
    } catch (error) {
        console.error('Fout bij het laden van teams:', error);
        return [];
    }
};

export const getPlayerById = async (id: string): Promise<Player | null> => {
    try {
        const player = await playersCollection.findOne({ id });
        return player as unknown as Player;
    } catch (error) {
        console.error('Error getting player by ID:', error);
        return null;
    }
};

export const getTeamById = async (id: string): Promise<Team | null> => {
    try {
        const team = await teamsCollection.findOne({ id });
        return team as unknown as Team;
    } catch (error) {
        console.error('Error getting team by ID:', error);
        return null;
    }
};

export const updatePlayer = async (id: string, playerData: Partial<Player>): Promise<Player | null> => {
    try {
        const result = await playersCollection.findOneAndUpdate(
            { id },
            { $set: playerData },
            { returnDocument: 'after' }
        );
        return result?.value as unknown as Player || null;
    } catch (error) {
        console.error('Error updating player:', error);
        return null;
    }
};

export const updateTeam = async (id: string, teamData: Partial<Team>): Promise<Team | null> => {
    try {
        const result = await teamsCollection.findOneAndUpdate(
            { id },
            { $set: teamData },
            { returnDocument: 'after' }
        );
        return result?.value as unknown as Team || null;
    } catch (error) {
        console.error('Error updating team:', error);
        return null;
    }
};

export const findUserByUsername = async (username: string): Promise<User | null> => {
    try {
        const user = await usersCollection.findOne({ username });
        return user as unknown as User;
    } catch (error) {
        console.error('Error finding user by username:', error);
        return null;
    }
};

export const comparePassword = async (candidatePassword: string, hashedPassword: string): Promise<boolean> => {
    try {
        return await bcrypt.compare(candidatePassword, hashedPassword);
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
};

export const initializeUsers = async (): Promise<void> => {
    try {
        const adminExists = await usersCollection.findOne({ username: 'admin' });
        if (!adminExists) {
            const adminPassword = await bcrypt.hash('admin123', 10);
            await usersCollection.insertOne({
                username: 'admin',
                password: adminPassword,
                role: UserRole.ADMIN
            });
            console.log('Admin-gebruiker aangemaakt');
        } else {
            console.log('Admin-gebruiker bestaat al');
        }

        const userExists = await usersCollection.findOne({ username: 'user' });
        if (!userExists) {
            const userPassword = await bcrypt.hash('user123', 10);
            await usersCollection.insertOne({
                username: 'user',
                password: userPassword,
                role: UserRole.USER
            });
            console.log('Gewone gebruiker aangemaakt');
        } else {
            console.log('Gewone gebruiker bestaat al');
        }
        console.log('User initialization complete');
    } catch (error) {
        console.error('Error initializing users:', error);
    }
};

export const connect = async (): Promise<void> => {
    try {
        await CLIENT.connect();
        console.log('Connected to the database.');
        await initializeUsers();
    } catch (error) {
        console.error('Error connecting to the database:', error);
        
        console.log('Attempting to continue without exiting...');
        
    }
};

export const close = async (): Promise<void> => {
    try {
        await CLIENT.close();
        console.log('Closing database connection.');
    } catch (error) {
        console.error('Error closing database connection:', error);
    }
};
