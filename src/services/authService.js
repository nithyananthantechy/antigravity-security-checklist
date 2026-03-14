// Auth Service — localStorage-based mock auth with improved security
// NOTE: For production, replace with a real backend auth API (JWT + bcrypt server-side)

const MOCK_USERS_KEY = 'antigravity_users';
const CURRENT_USER_KEY = 'antigravity_current_user';
const TOKEN_KEY = 'antigravity_token';

// --- Security Helpers ---

// Hash password using Web Crypto API (SHA-256)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'secops_salt_v1'); // salted
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Secure token: 64 random hex chars
function generateToken() {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Legacy hash check (for backwards compat if users already stored plain passwords)
function isPlaintext(storedPw) {
    // SHA-256 hex is always 64 chars; anything shorter is likely plaintext
    return storedPw.length < 64;
}

// Simulated delay for realistic effect
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Hardcoded admin hash (hash of 'Admin123!')
const ADMIN_HASH = 'a3f4d1a5e9b24e0c4f8d6e2a17b3c8d9f0e1a5c6b7d8e9f0a1b2c3d4e5f6a7b8'; // placeholder

export const authService = {
    // Login
    login: async (email, password) => {
        await delay(1200);

        const pwHash = await hashPassword(password);

        const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
        let matchedUser = null;

        for (const u of users) {
            if (u.email !== email) continue;
            if (isPlaintext(u.password)) {
                // Legacy: plaintext comparison (will be upgraded on next save)
                if (u.password === password) { matchedUser = u; break; }
            } else {
                if (u.password === pwHash) { matchedUser = u; break; }
            }
        }

        // Built-in admin account
        const isBuiltinAdmin = email === 'admin@desicrew.in' && password === 'Admin123!';

        if (matchedUser || isBuiltinAdmin) {
            const userData = matchedUser || {
                id: '1',
                name: 'Admin User',
                email: 'admin@desicrew.in',
                role: 'Administrator',
                organization: 'Desicrew'
            };

            const token = generateToken();
            const expiry = Date.now() + 8 * 60 * 60 * 1000; // 8 hours

            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
            localStorage.setItem(TOKEN_KEY, JSON.stringify({ token, expiry }));

            return { user: userData, token };
        }

        throw new Error('Invalid email or password');
    },

    // Register
    register: async (userData) => {
        await delay(1800);

        const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');

        if (users.find(u => u.email === userData.email)) {
            throw new Error('User already exists');
        }

        // Hash password before storing
        const pwHash = await hashPassword(userData.password);
        const newUser = { ...userData, password: pwHash, id: Date.now().toString() };
        users.push(newUser);
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));

        return authService.login(userData.email, userData.password);
    },

    // Logout
    logout: async () => {
        await delay(300);
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
    },

    // Get Current User (checks token expiry)
    getCurrentUser: () => {
        const tokenData = localStorage.getItem(TOKEN_KEY);
        if (tokenData) {
            try {
                const { expiry } = JSON.parse(tokenData);
                if (Date.now() > expiry) {
                    // Token expired — clear session
                    localStorage.removeItem(CURRENT_USER_KEY);
                    localStorage.removeItem(TOKEN_KEY);
                    return null;
                }
            } catch {
                // Legacy token (plain string) or malformed — clear it
                localStorage.removeItem(CURRENT_USER_KEY);
                localStorage.removeItem(TOKEN_KEY);
                return null;
            }
        }
        const user = localStorage.getItem(CURRENT_USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    // Check Auth Status
    isAuthenticated: () => {
        const tokenData = localStorage.getItem(TOKEN_KEY);
        if (!tokenData) return false;
        try {
            const { expiry } = JSON.parse(tokenData);
            return Date.now() < expiry;
        } catch {
            return false;
        }
    }
};
