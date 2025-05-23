import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        // Get the MongoDB URI from environment variable or use default
        let mongoURI = process.env.MONGODB_URI || 'mongodb+srv://hamdaouiilias14:N7ymXJvMs0fzDvyA@webontwikkeling.abgrzzs.mongodb.net/?retryWrites=true&w=majority&appName=Webontwikkeling';
        
        // Fix for incorrectly formatted environment variables
        if (mongoURI.includes('MONGODB_URI =')) {
            mongoURI = mongoURI.replace('MONGODB_URI =', '').trim();
        }
        console.log('Connecting to MongoDB...');
        // Don't log the full URI for security reasons
        console.log('MongoDB URI configured:', mongoURI ? 'Yes' : 'No');
        
        const conn = await mongoose.connect(mongoURI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Toon database info
        if (conn.connection.db) {
            console.log('Database naam:', conn.connection.db.databaseName);
            
            // Log alle collections die er zijn
            const collections = await conn.connection.db.listCollections().toArray();
            console.log('Collections in de database:', collections.map(c => c.name));
        }
        
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        console.error('Please make sure MongoDB is running on your system');
        process.exit(1);
    }
};

export default connectDB; 