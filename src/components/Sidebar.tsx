import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquare, Plus, Trash2, Clock, Sparkles, BarChart3, Zap, Star, AlertTriangle } from 'lucide-react';
import type { RootState } from '../store';
import { chatService, type ChatSession } from '../services/chatService';

interface SidebarProps {
  isDark: boolean;
  currentChatId: string | null;
  onChatSelected: (chatId: string | null) => void;
  onNewChatCreated: (chatId: string) => void;
  refreshKey?: number;
}

const Sidebar = ({ isDark, currentChatId, onChatSelected, onNewChatCreated, refreshKey }: SidebarProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; chatId: string | null; chatTitle: string }>({
    show: false,
    chatId: null,
    chatTitle: ''
  });
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

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

  const handleDeleteClick = (chatId: string, chatTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({ show: true, chatId, chatTitle });
  };

  const confirmDeleteChat = async () => {
    if (!deleteConfirm.chatId) return;

    try {
      await chatService.deleteChat(deleteConfirm.chatId);
      const updatedChats = chats.filter(chat => chat.id !== deleteConfirm.chatId);
      setChats(updatedChats);

      // If the deleted chat was the current one, switch to another or none
      if (currentChatId === deleteConfirm.chatId) {
        const nextChat = updatedChats.length > 0 ? updatedChats[0] : null;
        onChatSelected(nextChat?.id || null);
      }

      setNotification({ show: true, message: 'Chat deleted successfully', type: 'success' });
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
      setDeleteConfirm({ show: false, chatId: null, chatTitle: '' });
    } catch (error) {
      console.error('Failed to delete chat:', error);
      setNotification({ show: true, message: 'Failed to delete chat', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
      setDeleteConfirm({ show: false, chatId: null, chatTitle: '' });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, chatId: null, chatTitle: '' });
  };

  const handleChatSelect = (chatId: string) => {
    onChatSelected(chatId);
  };

  const handleNewChat = async () => {
    try {
      const userId = user?.id || 'anonymous';
      const newChatId = await chatService.createChatSession(
        userId,
        `Chat - ${new Date().toLocaleDateString()}`
      );
      onNewChatCreated(newChatId);
      // Refresh the chats list
      loadChats();
    } catch (error) {
      console.error('Failed to create new chat:', error);
    }
  };

  // Calculate stats
  const totalChats = chats.length;
  const totalMessages = chats.reduce((sum, chat) => sum + (chat.messageCount || 0), 0);

  return (
    <div className={`w-80 border-r flex flex-col ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gradient-to-b from-indigo-50 to-purple-50 border-indigo-200'} relative overflow-hidden`}>
      {/* Notification */}
      {notification.show && (
        <div className={`absolute top-4 left-4 right-4 z-50 p-3 rounded-lg shadow-lg ${
          notification.type === 'success'
            ? (isDark ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800')
            : (isDark ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-800')
        }`}>
          {notification.message}
        </div>
      )}

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
          onClick={handleNewChat}
          aria-label="Start a new chat conversation"
          className={`w-full flex items-center justify-center gap-2 px-6 py-4 sm:px-4 sm:py-3 rounded-xl font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
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
                role="button"
                tabIndex={0}
                onClick={() => handleChatSelect(chat.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleChatSelect(chat.id);
                  }
                }}
                aria-label={`Select chat: ${chat.title}`}
                aria-pressed={currentChatId === chat.id}
                className={`group relative w-full p-4 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.01] text-left ${
                  currentChatId === chat.id
                    ? (isDark
                        ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-2 border-blue-500/50 shadow-lg'
                        : 'bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-300 shadow-lg')
                    : (isDark
                        ? 'bg-gray-800/50 hover:bg-gray-700/70 border-2 border-transparent'
                        : 'bg-white/70 hover:bg-white border-2 border-transparent hover:border-indigo-200 shadow-sm hover:shadow-md')
                } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
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
                  onClick={(e) => handleDeleteClick(chat.id, chat.title, e)}
                  aria-label={`Delete chat: ${chat.title}`}
                  className={`absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
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

        {/* Delete Confirmation Dialog */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`max-w-md w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl border-2 ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-full ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                  <AlertTriangle className={`h-6 w-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Delete Chat</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>This action cannot be undone</p>
                </div>
              </div>

              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Are you sure you want to delete "<span className="font-medium">{deleteConfirm.chatTitle}</span>"? All messages in this chat will be permanently removed.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteChat}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
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
