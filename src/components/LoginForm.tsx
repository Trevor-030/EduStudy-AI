import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { loginStart, loginSuccess, loginFailure, clearError } from '../store/authSlice';
import { authService } from '../services/authService';
import type { LoginCredentials } from '../types/auth';
import { Mail, Lock, Eye, EyeOff, BookOpen, Sparkles, Loader2, GraduationCap, Star, Zap } from 'lucide-react';

const LoginForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat');
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    dispatch(loginStart());
    try {
      const response = await authService.login(data);
      dispatch(loginSuccess(response));
      navigate('/chat');
    } catch (error) {
      dispatch(loginFailure(error instanceof Error ? error.message : 'Login failed'));
    }
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Animated Background Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <BookOpen className="absolute top-20 left-10 h-16 w-16 text-indigo-200 opacity-40 animate-pulse" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <GraduationCap className="absolute top-40 right-20 h-20 w-20 text-purple-200 opacity-30 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4s' }} />
        <Star className="absolute bottom-32 left-20 h-12 w-12 text-pink-200 opacity-40 animate-pulse" style={{ animationDelay: '1s', animationDuration: '3.5s' }} />
        <Sparkles className="absolute top-60 left-1/4 h-10 w-10 text-indigo-300 opacity-30 animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '3s' }} />
        <Zap className="absolute bottom-20 right-32 h-14 w-14 text-purple-200 opacity-35 animate-pulse" style={{ animationDelay: '0.7s', animationDuration: '4s' }} />
        <BookOpen className="absolute bottom-40 left-1/3 h-12 w-12 text-pink-200 opacity-30 animate-bounce" style={{ animationDelay: '1.2s', animationDuration: '3.5s' }} />
        <Star className="absolute top-1/3 right-10 h-16 w-16 text-indigo-200 opacity-25 animate-pulse" style={{ animationDelay: '0.9s', animationDuration: '4s' }} />
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-indigo-100 p-8 sm:p-10 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 shadow-lg">
                  <BookOpen className="h-12 w-12 text-white" />
                  <Sparkles className="h-5 w-5 text-yellow-300 absolute -top-1 -right-1 animate-bounce" style={{ animationDuration: '2s' }} />
                </div>
              </div>
            </div>
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-sm">Sign in to continue your learning journey</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Input */}
            <div className="relative group">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-pulse">
                  <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="relative group">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-indigo-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-pulse">
                  <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4 animate-pulse">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-5 w-5 rounded-full bg-red-400 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-semibold text-red-800">Authentication Error</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                    <button
                      type="button"
                      onClick={handleClearError}
                      className="mt-3 text-sm font-medium text-red-800 hover:text-red-900 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center justify-center gap-2">
                {loading && <Loader2 className="animate-spin h-5 w-5" />}
                {loading ? 'Signing in...' : 'Sign In'}
              </span>
            </button>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <Link
                to="/signup"
                className="text-sm font-medium text-indigo-600 hover:text-purple-600 transition-colors"
              >
                Don't have an account? <span className="underline">Sign up</span>
              </Link>
            </div>
          </form>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full opacity-20 blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20 blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
};

export default LoginForm;