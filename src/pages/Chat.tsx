import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store';
import { logout } from '../store/authSlice';
import { authService } from '../services/authService';
import ChatWindow from '../components/ChatWindow';

const Chat = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    authService.logout();
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      <header className="glass-effect shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 space-y-2 sm:space-y-0">
            <div className="flex items-center">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Educational Chat AI
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="btn-primary text-sm px-3 py-2 sm:px-4 sm:py-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 px-4 sm:py-8 sm:px-6 lg:px-8">
        <div className="py-4 sm:py-6">
          <div className="h-[500px] sm:h-[600px] lg:h-[650px]">
            <ChatWindow />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;