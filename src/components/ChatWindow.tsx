import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Send, Bot, User, Loader2, Mic, MicOff, Smile, Download, Trash2, Edit } from 'lucide-react';
import type { RootState } from '../store';
import { voiceflowService } from '../services/voiceflowService';
import { chatService } from '../services/chatService';
import type { Message } from '../types/chat';

// Type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ChatWindowProps {
  isDark: boolean;
  chatId: string | null;
  onChatCreated?: (chatId: string) => void;
  onChatRenamed?: () => void;
}

const ChatWindow = ({ isDark, chatId, onChatCreated, onChatRenamed }: ChatWindowProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isListening, setIsListening] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameInput, setRenameInput] = useState('');
  const loadedRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'text',
            content: 'Microphone access denied. Please allow microphone access and try again.',
            sender: 'ai',
            timestamp: new Date(),
          }]);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    // Reset state immediately for new chatId
    setMessages([
      {
        id: 'welcome',
        type: 'text',
        content: "Hello! I'm your AI learning assistant. How can I help you today?",
        sender: 'ai',
        timestamp: new Date(),
      }
    ]);
    setIsTyping(false);
    setIsSending(false);
    setInputValue('');
    setConversationId(undefined);
    loadedRef.current = null;
    if (chatId) {
      loadChat(chatId);
    }
  }, [chatId, user]);

  const loadChat = async (id: string) => {
    if (loadedRef.current === id) return;
    loadedRef.current = id;
    try {
      const chatDoc = await chatService.getChatById(id);
      const chatMessages = chatDoc.messages ?? [];
      if (chatMessages.length === 0) {
        // Show welcome message for new chats
        setMessages([
          {
            id: 'welcome',
            type: 'text',
            content: 'Hello! I\'m your AI learning assistant. How can I help you today?',
            sender: 'ai',
            timestamp: new Date(),
          }
        ]);
      } else {
        setMessages(chatMessages);
      }
      setConversationId(chatDoc.conversationId);
    } catch (error) {
      console.error('Failed to load chat:', error);
      setMessages([
        {
          id: 'welcome',
          type: 'text',
          content: 'Hello! I\'m your AI learning assistant. How can I help you today?',
          sender: 'ai',
          timestamp: new Date(),
        }
      ]);
    }
  };

  // Message formatting function
  const formatMessageContent = (content: string) => {
    if (!content) return '';

    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^(\d+)\.\s+(.+)$/gm, '<div class="list-item numbered"><span class="list-number">$1.</span><span class="list-text">$2</span></div>')
      .replace(/^[-•]\s+(.+)$/gm, '<div class="list-item bulleted"><span class="list-bullet">•</span><span class="list-text">$1</span></div>')
      .replace(/\n/g, '<br>');
  };

  // Voice input handler
  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'text',
        content: 'Speech recognition is not supported in your browser. Please use text input instead.',
        sender: 'ai',
        timestamp: new Date(),
      }]);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Speech recognition start error:', error);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'text',
          content: 'Voice input failed to start. Please try again.',
          sender: 'ai',
          timestamp: new Date(),
        }]);
      }
    }
  };

  // Emoji picker handler
  const handleEmojiSelect = (emoji: string) => {
    setInputValue(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Export chat handler
  const handleExportChat = () => {
    const chatContent = messages
      .map(msg => `${msg.sender === 'user' ? 'You' : 'AI'}: ${msg.content}`)
      .join('\n\n');

    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'EduStudy-AI-chat-export.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear chat handler
  const handleClearChat = () => {
    setMessages([{
      id: 'welcome',
      type: 'text',
      content: 'Hello! I\'m your AI learning assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
    }]);
  };


  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Handle rename command
    if (content.trim().toLowerCase().startsWith('/rename ')) {
      const newName = content.trim().slice(8).trim(); // Remove '/rename '
      if (!chatId) {
        const errorMessage: Message = {
          id: Date.now().toString(),
          type: 'text',
          content: 'Cannot rename a chat that hasn\'t been created yet. Please send a message first.',
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        setInputValue('');
        return;
      }

      try {
        await chatService.renameChat(chatId, newName);
        const successMessage: Message = {
          id: Date.now().toString(),
          type: 'text',
          content: `Chat renamed to "${newName}".`,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, successMessage]);
        setInputValue('');
        onChatRenamed?.();
      } catch (error: any) {
        const errorMessage: Message = {
          id: Date.now().toString(),
          type: 'text',
          content: `Failed to rename chat: ${error.message}`,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        setInputValue('');
      }
      return;
    }

    if (!user?.id) {
      console.warn('Sending message without user authentication - using anonymous session');
    }

    let currentChatId = chatId;
    if (!currentChatId) {
      try {
        const userId = user?.id || 'anonymous';
        currentChatId = await chatService.createChatSession(
          userId,
          `Chat - ${new Date().toLocaleDateString()}`
        );
        onChatCreated?.(currentChatId);
      } catch (error) {
        console.error('Failed to create chat:', error);
        setIsTyping(false);
        setIsSending(false);
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

    // Append user message
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);
    setIsTyping(true);

    try {
      const voiceflowUserId = user?.id ? `user_${user.id.slice(0, 8)}` : `anon_${Date.now()}`;
      const response = await voiceflowService.sendMessage(content, conversationId, voiceflowUserId);
      setConversationId(response.conversationId);

      const aiMessages: Message[] = Array.isArray(response.messages) ? response.messages : [];
      let messagesToAdd: Message[] = [];
      if (aiMessages.length > 0) {
        messagesToAdd = aiMessages;
      } else {
        // Always show the error message from the response if present
        const fallback: Message = response.messages && response.messages[0]
          ? response.messages[0]
          : {
              id: (Date.now() + 1).toString(),
              type: 'text',
              content: "I didn't get a clear response. Try asking something else?",
              sender: 'ai',
              timestamp: new Date(),
            };
        messagesToAdd = [fallback];
      }
      setMessages(prev => [...prev, ...messagesToAdd]);

      // Async save all messages without blocking UI
      (async () => {
        try {
          await chatService.addMessage(currentChatId!, userMessage, response.conversationId);
        } catch (err) {
          console.error('Failed to save user message:', err);
        }
        for (const m of messagesToAdd) {
          try {
            await chatService.addMessage(currentChatId!, m, response.conversationId);
          } catch (e) {
            console.error('Failed to save AI message:', e, m);
          }
        }
      })();
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'text',
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      // Async save error message
      (async () => {
        try {
          await chatService.addMessage(currentChatId!, errorMessage, conversationId);
        } catch (e) {
          console.error('Failed to save error message:', e);
        }
      })();
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === 'ai'
                  ? (isDark ? 'bg-blue-500' : 'bg-blue-600')
                  : (isDark ? 'bg-gray-500' : 'bg-gray-600')
              }`}>
                {message.sender === 'ai'
                  ? <Bot className="h-4 w-4 text-white" />
                  : <User className="h-4 w-4 text-white" />}
              </div>

              {/* Bubble */}
              <div className={`rounded-2xl px-4 py-2 ${
                message.sender === 'user'
                  ? (isDark ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white')
                  : (isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900')
              }`}>
                  <div className="text-sm"
                    dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }} />
                <p className={`text-xs mt-1 ${
                  message.sender === 'user'
                    ? 'text-blue-100'
                    : (isDark ? 'text-gray-400' : 'text-gray-500')
                }`}>
                  {(message.timestamp instanceof Date
                    ? message.timestamp
                    : new Date(message.timestamp)
                  ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

            </div>
          </div>
        ))}

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

      {/* Input */}
      <div className={`border-t p-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {/* Action Buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={handleVoiceInput}
            disabled={!recognitionRef.current}
            className={`p-2 rounded-lg transition-colors ${
              isListening
                ? 'bg-red-500 text-white'
                : isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={recognitionRef.current ? (isListening ? 'Stop listening' : 'Voice input') : 'Speech recognition not supported'}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title="Emoji picker"
          >
            <Smile className="h-4 w-4" />
          </button>

          <button
            onClick={handleExportChat}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title="Export chat"
          >
            <Download className="h-4 w-4" />
          </button>

          <button
            onClick={() => setShowRenameModal(true)}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title="Rename chat"
          >
            <Edit className="h-4 w-4" />
          </button>

          <button
            onClick={handleClearChat}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'bg-gray-700 text-red-400 hover:bg-gray-600'
                : 'bg-gray-200 text-red-600 hover:bg-gray-300'
            }`}
            title="Clear chat"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className={`mb-3 p-3 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-300'
          }`}>
            <div className="grid grid-cols-8 gap-2">
              {['😀', '😂', '😊', '😍', '🤔', '👍', '👎', '❤️', '🔥', '⭐', '✅', '❌', '💡', '📚', '🎓', '🤖'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiSelect(emoji)}
                  className="text-2xl hover:scale-110 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Rename Modal */}
        {showRenameModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`max-w-md w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl border-2 ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6`}>
              <div className="mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Rename Chat</h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Enter a new name for this chat session</p>
              </div>

              <input
                type="text"
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                placeholder="Enter chat name..."
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-4 ${
                  isDark
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
                maxLength={50}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRenameModal(false);
                    setRenameInput('');
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!renameInput.trim()) return;
                    if (!chatId) {
                      setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        type: 'text',
                        content: 'Cannot rename a chat that hasn\'t been created yet. Please send a message first.',
                        sender: 'ai',
                        timestamp: new Date(),
                      }]);
                      setShowRenameModal(false);
                      setRenameInput('');
                      return;
                    }

                    try {
                      await chatService.renameChat(chatId, renameInput.trim());
                      setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        type: 'text',
                        content: `Chat renamed to "${renameInput.trim()}".`,
                        sender: 'ai',
                        timestamp: new Date(),
                      }]);
                      onChatRenamed?.();
                      setShowRenameModal(false);
                      setRenameInput('');
                    } catch (error: any) {
                      setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        type: 'text',
                        content: `Failed to rename chat: ${error.message}`,
                        sender: 'ai',
                        timestamp: new Date(),
                      }]);
                      setShowRenameModal(false);
                      setRenameInput('');
                    }
                  }}
                  disabled={!renameInput.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Rename
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-3">
          <textarea
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(inputValue);
              }
            }}
            placeholder="Type your message..."
            disabled={isSending}
            rows={1}
            className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50 resize-none min-h-[44px] ${
              isDark
                ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
            }`}
          />

          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={isSending || !inputValue.trim()}
            className={`px-6 py-3 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px] transition-colors ${
              isDark ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="hidden sm:inline">{isSending ? 'Sending...' : 'Send'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;