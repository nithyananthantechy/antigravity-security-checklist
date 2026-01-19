// Simulated delay for realistic effect
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_USERS_KEY = 'antigravity_users';
const CURRENT_USER_KEY = 'antigravity_current_user';
const TOKEN_KEY = 'antigravity_token';

export const authService = {
    // Login
    login: async (email, password) => {
        await delay(1500); // Simulate network request

        // Check against mock database
        const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user || (email === 'admin@desicrew.in' && password === 'Admin123!')) {
            const userData = user || {
                id: '1',
                name: 'Admin User',
                email: 'admin@desicrew.in',
                role: 'Administrator',
                organization: 'Desicrew'
            };

            const token = `fake-jwt-token-${Math.random().toString(36).substr(2)}`;

            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
            localStorage.setItem(TOKEN_KEY, token);

            return { user: userData, token };
        }

        throw new Error('Invalid email or password');
    },

    // Register
    register: async (userData) => {
        await delay(2000);

        const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');

        if (users.find(u => u.email === userData.email)) {
            throw new Error('User already exists');
        }

        const newUser = { ...userData, id: Date.now().toString() };
        users.push(newUser);
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));

        return authService.login(userData.email, userData.password);
    },

    // Logout
    logout: async () => {
        await delay(500);
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
    },

    // Get Current User
    getCurrentUser: () => {
        const user = localStorage.getItem(CURRENT_USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    // Check Auth Status
    isAuthenticated: () => {
        return !!localStorage.getItem(TOKEN_KEY);
    }
};
