import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import type { RootState } from '../store';
import { voiceflowService } from '../services/voiceflowService';
import { chatService } from '../services/chatService';
import type { Message } from '../types/chat';

interface ChatWindowProps {
  isDark: boolean;
  chatId: string | null;
  onChatCreated?: (chatId: string) => void;
}

const ChatWindow = ({ isDark, chatId, onChatCreated }: ChatWindowProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (chatId) {
      loadChat(chatId);
    } else {
      // Start with welcome message but don't save to Firebase yet
      setMessages([{
        id: 'welcome',
        type: 'text',
        content: 'Hello! I\'m your AI learning assistant. How can I help you today?',
        sender: 'ai',
        timestamp: new Date(),
      }]);
    }
  }, [chatId, user]);

  const loadChat = async (id: string) => {
    try {
      const chatDoc = await chatService.getChatById(id);
      setMessages(chatDoc.messages);
      setConversationId(chatDoc.conversationId);
    } catch (error) {
      console.error('Failed to load chat:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    if (!user?.id) {
      console.error('No user ID available, cannot send message');
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        type: 'text',
        content: 'You must be logged in to send messages.',
        sender: 'ai',
        timestamp: new Date(),
      }]);
      return;
    }

    let currentChatId = chatId;

    // If no chat selected, create a new one
    if (!currentChatId) {
      try {
        currentChatId = await chatService.createChatSession(user.id, `Chat - ${new Date().toLocaleDateString()}`);
        onChatCreated?.(currentChatId);
      } catch (error) {
        console.error('Failed to create chat session:', error);
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'text',
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);
    setIsTyping(true);

    try {
      // Send user message to Voiceflow
      const response = await voiceflowService.sendMessage(content, conversationId);

      // Update conversation ID
      setConversationId(response.conversationId);

      // Save user message to Firebase
      await chatService.addMessage(currentChatId, userMessage, response.conversationId);

      // Add AI responses
      for (const aiMessage of response.messages) {
        setMessages((prev) => [...prev, aiMessage]);
        await chatService.addMessage(currentChatId, aiMessage, response.conversationId);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'text',
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      // Still save the user message even if AI fails
      try {
        await chatService.addMessage(currentChatId, userMessage, conversationId);
      } catch (saveError) {
        console.error('Failed to save user message:', saveError);
      }
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === 'ai' ? (isDark ? 'bg-blue-500' : 'bg-blue-600') : (isDark ? 'bg-gray-500' : 'bg-gray-600')
              }`}>
                {message.sender === 'ai' ? (
                  <Bot className="h-4 w-4 text-white" />
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`rounded-2xl px-4 py-2 ${
                message.sender === 'user'
                  ? (isDark ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white')
                  : (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900')
              }`}>
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-100' : (isDark ? 'text-gray-400' : 'text-gray-500')
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className={`w-8 h-8 ${isDark ? 'bg-blue-500' : 'bg-blue-600'} rounded-full flex items-center justify-center`}>
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className={`rounded-2xl px-4 py-2 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex gap-1">
                  <span className={`w-2 h-2 ${isDark ? 'bg-gray-500' : 'bg-gray-400'} rounded-full animate-bounce`}></span>
                  <span className={`w-2 h-2 ${isDark ? 'bg-gray-500' : 'bg-gray-400'} rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></span>
                  <span className={`w-2 h-2 ${isDark ? 'bg-gray-500' : 'bg-gray-400'} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`border-t p-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(inputValue);
              }
            }}
            placeholder="Type your message..."
            disabled={isSending}
            className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50 ${
              isDark
                ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
            }`}
          />
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={isSending || !inputValue.trim()}
            className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
              isDark ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;