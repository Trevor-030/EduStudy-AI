import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from './store';
import { loginSuccess, logout } from './store/authSlice';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import ProtectedRoute from './components/ProtectedRoute';
import Chat from './pages/Chat';

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        const refreshToken = user.refreshToken;
        dispatch(loginSuccess({
          user: {
            id: user.uid,
            email: user.email || '',
            name: user.displayName || '',
          },
          token,
          refreshToken,
        }));
      } else {
        dispatch(logout());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route
          path="/signin"
          element={isAuthenticated ? <Navigate to="/chat" replace /> : <LoginForm />}
        />
        <Route
          path="/login"
          element={<Navigate to="/signin" replace />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/chat" replace /> : <SignupForm />}
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/chat" : "/signin"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
