import { User, UserRole, IUser } from './models/User';

/**
 * Initialize default users (admin and regular user)
 */
export const initializeUsers = async (): Promise<void> => {
    try {
        // Check if admin user exists
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            console.log('Creating default admin user...');
            const admin = new User({
                username: 'admin',
                password: 'admin123', // Will be hashed by the pre-save hook
                role: UserRole.ADMIN
            });
            await admin.save();
            console.log('Admin user created successfully');
        } else {
            console.log('Admin user already exists');
        }

        // Check if regular user exists
        const userExists = await User.findOne({ username: 'user' });
        if (!userExists) {
            console.log('Creating default regular user...');
            const user = new User({
                username: 'user',
                password: 'user123', // Will be hashed by the pre-save hook
                role: UserRole.USER
            });
            await user.save();
            console.log('Regular user created successfully');
        } else {
            console.log('Regular user already exists');
        }

        console.log('User initialization complete');
    } catch (error) {
        console.error('Error initializing users:', error);
    }
};
