import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { MessagesProvider } from './MessagesContext';
import { ApiKeyProvider } from './ApiKeyContext';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <MessagesProvider>
        <ApiKeyProvider>
          {children}
        </ApiKeyProvider>
      </MessagesProvider>
    </AuthProvider>
  );
};