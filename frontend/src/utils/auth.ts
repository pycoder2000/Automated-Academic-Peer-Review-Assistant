// Simple localStorage-based authentication

export interface User {
  id: string;
  email: string;
  name: string;
  password: string; // In production, this should be hashed
  image?: string;
  interests?: string;
}

const STORAGE_KEY = 'reviewmatch_users';
const CURRENT_USER_KEY = 'reviewmatch_current_user';

export const auth = {
  // Register a new user
  register: (email: string, password: string, name: string): User | null => {
    const users = auth.getAllUsers();

    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return null; // User already exists
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      password, // In production, hash this
      name,
      interests: '',
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    return newUser;
  },

  // Login
  login: (email: string, password: string): User | null => {
    const users = auth.getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      // Don't store password in current user session
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      return user;
    }

    return null;
  },

  // Logout
  logout: (): void => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Get current user
  getCurrentUser: (): Omit<User, 'password'> | null => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // Update user profile
  updateUser: (userId: string, updates: Partial<User>): User | null => {
    const users = auth.getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) return null;

    const updatedUser = { ...users[userIndex], ...updates };
    users[userIndex] = updatedUser;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

    // Update current session if this is the logged-in user
    const currentUser = auth.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const { password: _, ...userWithoutPassword } = updatedUser;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    }

    return updatedUser;
  },

  // Get all users (for debugging/admin)
  getAllUsers: (): User[] => {
    const usersStr = localStorage.getItem(STORAGE_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  },

  // Get user initials
  getInitials: (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  },
};

