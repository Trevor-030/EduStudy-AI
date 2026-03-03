import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, Sun, Moon } from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { logout } from '../store/authSlice';
import { authService } from '../services/authService';
import { chatService } from '../services/chatService';
import ChatWindow from '../components/ChatWindow';
import Sidebar from '../components/Sidebar';

const Chat = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [refreshSidebar, setRefreshSidebar] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N or Cmd+N for new chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewChat();
      }
      // Ctrl+/ or Cmd+/ for theme toggle
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        toggleTheme();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (isDark) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleChatSelect = (chatId: string | null) => {
    setCurrentChatId(chatId);
  };

  const handleNewChat = async () => {
    try {
      const userId = user?.id || 'anonymous';
      const newChatId = await chatService.createChatSession(
        userId,
        `Chat - ${new Date().toLocaleDateString()}`
      );
      setCurrentChatId(newChatId);
      setRefreshSidebar(prev => prev + 1);
    } catch (error) {
      console.error('Failed to create new chat:', error);
      // Fallback to just resetting the chat
      setCurrentChatId(null);
    }
  };

  const handleNewChatCreated = (chatId: string) => {
    setCurrentChatId(chatId);
    setRefreshSidebar(prev => prev + 1);
  };

  const handleChatCreated = (chatId: string) => {
    setCurrentChatId(chatId);
    setRefreshSidebar(prev => prev + 1);
  };

  const handleChatRenamed = () => {
    setRefreshSidebar(prev => prev + 1);
  };

  const handleLogout = () => {
    authService.logout();
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className={`h-screen flex transition-colors ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <Sidebar
        isDark={isDark}
        currentChatId={currentChatId}
        onChatSelected={handleChatSelect}
        onNewChatCreated={handleNewChatCreated}
        refreshKey={refreshSidebar}
      />

      <div className="flex-1 flex flex-col">
        <header className={`border-b px-4 py-3 shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className={`h-8 w-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>EduStudy AI</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Welcome, {user?.name || user?.email}
              </span>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {currentTime.toLocaleTimeString()}
              </span>
              <button
                onClick={toggleTheme}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
                className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                onClick={handleLogout}
                aria-label="Logout from your account"
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <ChatWindow isDark={isDark} chatId={currentChatId} onChatCreated={handleChatCreated} onChatRenamed={handleChatRenamed} />
        </main>
      </div>
    </div>
  );
};

export default Chat;