import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquare, Plus, Trash2, Clock, Sparkles, BarChart3, Zap, Star } from 'lucide-react';
import type { RootState } from '../store';
import { chatService, type ChatSession } from '../services/chatService';

interface SidebarProps {
  isDark: boolean;
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  refreshKey?: number;
}

const Sidebar = ({ isDark, currentChatId, onChatSelect, onNewChat, refreshKey }: SidebarProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadChats();
    }
  }, [user, refreshKey]);

  const loadChats = async () => {
    if (!user?.id) return;

    try {
      const userChats = await chatService.getUserChats(user.id);
      setChats(userChats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await chatService.deleteChat(chatId);
      setChats(chats.filter(chat => chat.id !== chatId));
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  // Calculate stats
  const totalChats = chats.length;
  const totalMessages = chats.reduce((sum, chat) => sum + (chat.messageCount || 0), 0);

  return (
    <div className={`w-80 border-r flex flex-col ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gradient-to-b from-indigo-50 to-purple-50 border-indigo-200'} relative overflow-hidden`}>
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <Sparkles className={`absolute top-10 right-8 h-6 w-6 ${isDark ? 'text-blue-400' : 'text-indigo-300'} animate-pulse`} style={{ animationDuration: '3s' }} />
        <Star className={`absolute top-32 left-6 h-4 w-4 ${isDark ? 'text-purple-400' : 'text-purple-300'} animate-bounce`} style={{ animationDelay: '0.5s', animationDuration: '4s' }} />
        <Zap className={`absolute bottom-32 right-10 h-5 w-5 ${isDark ? 'text-indigo-400' : 'text-pink-300'} animate-pulse`} style={{ animationDelay: '1s', animationDuration: '3.5s' }} />
      </div>

      {/* Header with Stats */}
      <div className={`relative p-5 border-b ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-indigo-200 bg-white/60'} backdrop-blur-sm`}>
        <div className="mb-4">
          <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <MessageSquare className="h-5 w-5" />
            Chat History
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Your learning conversations
          </p>
        </div>

        {/* Quick Stats */}
        <div className={`grid grid-cols-2 gap-2 mb-4 p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-white/70'} backdrop-blur-sm`}>
          <div className={`text-center p-2 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-indigo-50/70'}`}>
            <div className={`text-xl font-bold ${isDark ? 'text-blue-400' : 'text-indigo-600'}`}>{totalChats}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Chats</div>
          </div>
          <div className={`text-center p-2 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-purple-50/70'}`}>
            <div className={`text-xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{totalMessages}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Messages</div>
          </div>
        </div>

        <button
          onClick={onNewChat}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
            isDark
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
          }`}
        >
          <Plus className="h-5 w-5" />
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto relative">
        {loading ? (
          <div className="p-4 text-center">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading chats...</div>
          </div>
        ) : chats.length === 0 ? (
          <div className={`p-8 text-center ${isDark ? 'bg-gray-800/30' : 'bg-white/40'} m-4 rounded-2xl backdrop-blur-sm`}>
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isDark ? 'bg-gray-700' : 'bg-indigo-100'}`}>
              <MessageSquare className={`h-8 w-8 ${isDark ? 'text-gray-400' : 'text-indigo-400'}`} />
            </div>
            <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>No chats yet</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Start a new conversation to begin learning!</div>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {/* Section Label */}
            <div className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <Clock className="h-3 w-3" />
              <span>RECENT</span>
            </div>

            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.01] ${
                  currentChatId === chat.id
                    ? (isDark 
                        ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-2 border-blue-500/50 shadow-lg' 
                        : 'bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-300 shadow-lg')
                    : (isDark 
                        ? 'bg-gray-800/50 hover:bg-gray-700/70 border-2 border-transparent' 
                        : 'bg-white/70 hover:bg-white border-2 border-transparent hover:border-indigo-200 shadow-sm hover:shadow-md')
                } backdrop-blur-sm`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    currentChatId === chat.id
                      ? (isDark ? 'bg-blue-500' : 'bg-indigo-500')
                      : (isDark ? 'bg-gray-700' : 'bg-indigo-100')
                  } transition-colors`}>
                    <MessageSquare className={`h-4 w-4 ${
                      currentChatId === chat.id
                        ? 'text-white'
                        : (isDark ? 'text-gray-300' : 'text-indigo-600')
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold truncate mb-1 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {chat.title}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs">
                      <div className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Clock className="h-3 w-3" />
                        <span>{chat.updatedAt?.toDate().toLocaleDateString()}</span>
                      </div>
                      
                      {chat.messageCount && (
                        <div className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <BarChart3 className="h-3 w-3" />
                          <span>{chat.messageCount} msgs</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  className={`absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all ${
                    isDark 
                      ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300' 
                      : 'hover:bg-red-50 text-red-500 hover:text-red-600'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Active indicator */}
                {currentChatId === chat.id && (
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full ${
                    isDark ? 'bg-blue-500' : 'bg-indigo-500'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className={`relative p-4 border-t ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-indigo-200 bg-white/60'} backdrop-blur-sm`}>
        <div className={`flex items-center justify-between text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            <span>AI Powered</span>
          </div>
          <div>Version 1.0</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
