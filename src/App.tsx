import React from 'react';
import { AppProvider } from './contexts/AppProvider';
import { useAuth } from './contexts/AuthContext';
import { useApiKey } from './contexts/ApiKeyContext';
import SignIn from './components/SignIn';
import ApiKeyInput from './components/ApiKeyInput';
import ChatWindow from './components/ChatWindow';

function AppContent() {
  const { user, loading } = useAuth();
  const { apiKey } = useApiKey();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <SignIn />;
  }

  if (!apiKey) {
    return <ApiKeyInput />;
  }

  return <ChatWindow />;
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
