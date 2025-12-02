import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

interface MessagesContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};

interface MessagesProviderProps {
  children: ReactNode;
}

export const MessagesProvider: React.FC<MessagesProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const storedMessages = localStorage.getItem('messages');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

  const addMessage = (message: Message) => {
    setMessages((prev) => {
      const newMessages = [...prev, message];
      localStorage.setItem('messages', JSON.stringify(newMessages));
      return newMessages;
    });
  };

  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem('messages');
  };

  return (
    <MessagesContext.Provider value={{ messages, addMessage, clearMessages }}>
      {children}
    </MessagesContext.Provider>
  );
};