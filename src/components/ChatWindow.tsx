import React, { useState } from 'react';
import type { Message } from '../types/chat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { voiceflowService } from '../services/voiceflowService';

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'text',
      content: 'Hello! How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
      avatar: '/ai-avatar.png',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'text',
      content,
      sender: 'user',
      timestamp: new Date(),
      avatar: '/user-avatar.png',
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const { messages: aiMessages, conversationId: newConversationId } = await voiceflowService.sendMessage(content, conversationId);

      // Update conversation ID if it's a new conversation
      if (newConversationId && newConversationId !== conversationId) {
        setConversationId(newConversationId);
      }

      setMessages((prev) => [...prev, ...aiMessages]);
    } catch (error) {
      console.error('Error sending message to Voiceflow:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'text',
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
        avatar: '/ai-avatar.png',
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto card overflow-hidden">
      <div className="gradient-bg px-4 py-3 sm:px-6 sm:py-4 text-white">
        <h2 className="text-lg sm:text-xl font-bold">Chat with AI Assistant</h2>
        <p className="text-xs sm:text-sm opacity-90">Learn and interact with our intelligent educational AI</p>
      </div>
      <MessageList messages={messages} onSendMessage={handleSendMessage} />
      <TypingIndicator isTyping={isTyping} />
      <MessageInput onSendMessage={handleSendMessage} disabled={isTyping} />
    </div>
  );
};

export default ChatWindow;