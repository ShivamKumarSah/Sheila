import React, { createContext, useContext, useEffect, useState } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

type User = {
  id: string;
  email?: string;
  kitNumber?: string;
  name?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (data: { email?: string; password?: string; kitNumber?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  signIn: async () => { },
  signOut: async () => { },
  isAuthenticated: false,
});

// Demo users for testing
const DEMO_USERS = [
  { id: '1', email: 'shivam@gmail.com', password: '123456', name: 'Shivam' },
  { id: '2', kitNumber: 'SHEILA001', name: 'Kit User' },
];

// Helper functions for storage
const storage = {
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const loadUser = async () => {
      try {
        const userJson = await storage.getItem('user');
        if (userJson) {
          const userData = JSON.parse(userJson);
          setUser(userData);
          router.replace('/(app)');
        } else {
          router.replace('/(auth)');
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (data: { email?: string; password?: string; kitNumber?: string }) => {
    setIsLoading(true);
    try {
      // Mock authentication
      let foundUser = null;

      if (data.email && data.password) {
        foundUser = DEMO_USERS.find(
          u => u.email === data.email && u.password === data.password
        );
      } else if (data.kitNumber) {
        foundUser = DEMO_USERS.find(u => u.kitNumber === data.kitNumber);
      }

      if (foundUser) {
        // Remove password from user object
        const { password, ...userWithoutPassword } = foundUser as any;
        await storage.setItem('user', JSON.stringify(userWithoutPassword));
        setUser(userWithoutPassword);
        router.replace('/(app)');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await storage.removeItem('user');
      setUser(null);
      router.replace('/(auth)');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signOut,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);