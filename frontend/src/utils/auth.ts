// Database-backed authentication with localStorage session management

export interface User {
  user_id: number;
  email: string;
  name: string;
  image_url?: string;
  interests?: string;
  person_id?: number;
  created_at?: string;
}

const CURRENT_USER_KEY = 'reviewmatch_current_user';
const API_BASE_URL = 'http://localhost:5000/api';

export const auth = {
  // Register a new user (saves to database)
  register: async (email: string, password: string, name: string, image?: string, interests?: string, interestIds?: number[]): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          image_url: image,
          interests: interests || '',  // Comma-separated string for backward compatibility
          interest_ids: interestIds || [],  // Array of IDs for junction table
        }),
      });

      if (response.ok) {
        const user = await response.json();
        // Store user in session (without password)
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return user;
      } else {
        const error = await response.json();
        console.error('Registration error:', error);
        return null;
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return null;
    }
  },

  // Login (authenticates against database)
  login: async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.ok) {
        const user = await response.json();
        // Store user in session
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return user;
      } else {
        const error = await response.json();
        console.error('Login error:', error);
        return null;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  },

  // Logout
  logout: (): void => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Get current user from session
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // Update user profile (updates database)
  updateUser: async (userId: number, updates: Partial<User & { password?: string }>): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        // Update localStorage session
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
        return updatedUser;
      } else {
        const error = await response.json();
        console.error('Update user error:', error);
        return null;
      }
    } catch (error) {
      console.error('Update user failed:', error);
      return null;
    }
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

