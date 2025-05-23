import { Collection, MongoClient, ObjectId } from "mongodb";
import { Player, Team, User, UserRole } from "./types";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

// --- Configuration: GitHub Raw URLs ---
const PLAYERS_JSON_URL = 'https://raw.githubusercontent.com/Ilias492610/football-json/main/public/players/players.json';
const TEAMS_JSON_URL = 'https://raw.githubusercontent.com/Ilias492610/football-json/main/public/teams/teams.json';
// ------------------------------------

export const URI = process.env.MONGODB_URI || 'mongodb+srv://hamdaouiilias14:N7ymXJvMs0fzDvyA@webontwikkeling.abgrzzs.mongodb.net/?retryWrites=true&w=majority&appName=Webontwikkeling';

const CLIENT = new MongoClient(URI);
export const playersCollection: Collection = CLIENT.db("football-app").collection("players");
export const teamsCollection: Collection = CLIENT.db("football-app").collection("teams");
export const usersCollection: Collection = CLIENT.db("football-app").collection("users");

// Helper function to fetch data from a URL
async function fetchDataFromUrl<T>(url: string): Promise<T[]> {
    try {
        const fetchModule = await import('node-fetch');
        const fetch = fetchModule.default;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching data from ${url}: ${response.statusText} (status: ${response.status})`);
        }
        const data = await response.json();
        // Ensure the fetched data is an array, as our collections expect arrays of documents.
        // If your JSON files are structured with the array nested under a key, adjust here.
        if (!Array.isArray(data)) {
            console.warn(`Data fetched from ${url} is not an array. Received:`, typeof data);
            // Attempt to find an array if the data is an object with a single array value (common pattern)
            if (typeof data === 'object' && data !== null) {
                const keys = Object.keys(data as object);
                if (keys.length === 1 && Array.isArray((data as any)[keys[0]])) {
                    console.log(`Found array under key '${keys[0]}' in data from ${url}`);
                    return (data as any)[keys[0]] as T[];
                }
            }
            return []; // Return empty if not an array or simple wrapped array
        }
        return data as T[];
    } catch (error) {
        console.error(`Failed to fetch or parse data from ${url}:`, error);
        return [];
    }
}

/**
 * Load all players from the database
 * If no players exist in the database, load them from the JSON file via fetch
 */
export const loadPlayers = async (): Promise<Player[]> => {
    try {
        const count = await playersCollection.countDocuments();
        if (count === 0) {
            console.log('No players in MongoDB. Fetching from URL:', PLAYERS_JSON_URL);
            const players: Player[] = await fetchDataFromUrl<Player>(PLAYERS_JSON_URL);
            if (players.length > 0) {
                await playersCollection.insertMany(players);
                console.log(`${players.length} players fetched from URL and saved to MongoDB`);
                return players;
            } else {
                console.log('No players fetched from URL or URL is incorrect/empty.');
                return [];
            }
        }
        const playersFromDB = await playersCollection.find().toArray();
        console.log(`Found ${playersFromDB.length} players in MongoDB`);
        return playersFromDB as unknown as Player[];
    } catch (error) {
        console.error('Error loading players:', error);
        return [];
    }
};

/**
 * Load all teams from the database
 * If no teams exist in the database, load them from the JSON file via fetch
 */
export const loadTeams = async (): Promise<Team[]> => {
    try {
        const count = await teamsCollection.countDocuments();
        if (count === 0) {
            console.log('No teams in MongoDB. Fetching from URL:', TEAMS_JSON_URL);
            const teams: Team[] = await fetchDataFromUrl<Team>(TEAMS_JSON_URL);
            if (teams.length > 0) {
                await teamsCollection.insertMany(teams);
                console.log(`${teams.length} teams fetched from URL and saved to MongoDB`);
                return teams;
            } else {
                console.log('No teams fetched from URL or URL is incorrect/empty.');
                return [];
            }
        }
        const teamsFromDB = await teamsCollection.find().toArray();
        console.log(`Found ${teamsFromDB.length} teams in MongoDB`);
        return teamsFromDB as unknown as Team[];
    } catch (error) {
        console.error('Error loading teams:', error);
        return [];
    }
};

/**
 * Get a player by ID
 */
export const getPlayerById = async (id: string): Promise<Player | null> => {
    try {
        const player = await playersCollection.findOne({ id });
        return player as unknown as Player;
    } catch (error) {
        console.error('Error getting player by ID:', error);
        return null;
    }
};

/**
 * Get a team by ID
 */
export const getTeamById = async (id: string): Promise<Team | null> => {
    try {
        const team = await teamsCollection.findOne({ id });
        return team as unknown as Team;
    } catch (error) {
        console.error('Error getting team by ID:', error);
        return null;
    }
};

/**
 * Update a player in the database
 */
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

/**
 * Update a team in the database
 */
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

/**
 * User authentication functions
 */

/**
 * Find a user by username
 */
export const findUserByUsername = async (username: string): Promise<User | null> => {
    try {
        const user = await usersCollection.findOne({ username });
        return user as unknown as User;
    } catch (error) {
        console.error('Error finding user by username:', error);
        return null;
    }
};

/**
 * Compare password with hashed password
 */
export const comparePassword = async (candidatePassword: string, hashedPassword: string): Promise<boolean> => {
    try {
        return await bcrypt.compare(candidatePassword, hashedPassword);
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
};

/**
 * Initialize default users (admin and regular user)
 */
export const initializeUsers = async (): Promise<void> => {
    try {
        // Check if admin user exists
        const adminExists = await usersCollection.findOne({ username: 'admin' });
        if (!adminExists) {
            // Create admin user
            const adminPassword = await bcrypt.hash('admin123', 10);
            await usersCollection.insertOne({
                username: 'admin',
                password: adminPassword,
                role: UserRole.ADMIN
            });
            console.log('Admin user created');
        } else {
            console.log('Admin user already exists');
        }

        // Check if regular user exists
        const userExists = await usersCollection.findOne({ username: 'user' });
        if (!userExists) {
            // Create regular user
            const userPassword = await bcrypt.hash('user123', 10);
            await usersCollection.insertOne({
                username: 'user',
                password: userPassword,
                role: UserRole.USER
            });
            console.log('Regular user created');
        } else {
            console.log('Regular user already exists');
        }
        console.log('User initialization complete');
    } catch (error) {
        console.error('Error initializing users:', error);
    }
};

/**
 * Connect to the database
 */
export const connect = async (): Promise<void> => {
    try {
        await CLIENT.connect();
        console.log('Connected to the database.');
        // Initialize users after connection
        await initializeUsers();
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    }
};

/**
 * Close the database connection
 */
export const close = async (): Promise<void> => {
    try {
        await CLIENT.close();
        console.log('Closing database connection.');
    } catch (error) {
        console.error('Error closing database connection:', error);
    }
};
