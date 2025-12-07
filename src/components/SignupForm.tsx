import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { signupStart, signupSuccess, signupFailure, clearError } from '../store/authSlice';
import { authService } from '../services/authService';
import type { SignupCredentials } from '../types/auth';
import { Mail, Lock, Eye, EyeOff, User, BookOpen, Sparkles, Loader2, GraduationCap, Star, Zap, Award, Lightbulb } from 'lucide-react';

const SignupForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat');
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupCredentials>();

  const password = watch('password');

  const onSubmit = async (data: SignupCredentials) => {
    dispatch(signupStart());
    try {
      const response = await authService.signup(data);
      dispatch(signupSuccess(response));
      navigate('/chat');
    } catch (error) {
      dispatch(signupFailure(error instanceof Error ? error.message : 'Signup failed'));
    }
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Animated Background Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Award className="absolute top-16 left-16 h-16 w-16 text-purple-200 opacity-40 animate-pulse" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <GraduationCap className="absolute top-32 right-24 h-20 w-20 text-pink-200 opacity-30 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4s' }} />
        <Lightbulb className="absolute bottom-28 left-24 h-14 w-14 text-indigo-200 opacity-40 animate-pulse" style={{ animationDelay: '1s', animationDuration: '3.5s' }} />
        <Star className="absolute top-64 left-1/4 h-10 w-10 text-purple-300 opacity-30 animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '3s' }} />
        <Zap className="absolute bottom-16 right-28 h-14 w-14 text-pink-200 opacity-35 animate-pulse" style={{ animationDelay: '0.7s', animationDuration: '4s' }} />
        <BookOpen className="absolute bottom-36 left-1/3 h-12 w-12 text-indigo-200 opacity-30 animate-bounce" style={{ animationDelay: '1.2s', animationDuration: '3.5s' }} />
        <Sparkles className="absolute top-1/3 right-16 h-16 w-16 text-purple-200 opacity-25 animate-pulse" style={{ animationDelay: '0.9s', animationDuration: '4s' }} />
        <Award className="absolute top-1/2 left-12 h-10 w-10 text-pink-200 opacity-30 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }} />
      </div>

      {/* Signup Card */}
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-purple-100 p-8 sm:p-10 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-4 shadow-lg">
                  <GraduationCap className="h-12 w-12 text-white" />
                  <Sparkles className="h-5 w-5 text-yellow-300 absolute -top-1 -right-1 animate-bounce" style={{ animationDuration: '2s' }} />
                </div>
              </div>
            </div>
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Create Account
            </h2>
            <p className="text-gray-600 text-sm">Join our educational AI community</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Name Input */}
            <div className="relative group">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-purple-400 group-focus-within:text-purple-600 transition-colors" />
                </div>
                <input
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-pulse">
                  <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div className="relative group">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-purple-400 group-focus-within:text-purple-600 transition-colors" />
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
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
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
                  <Lock className="h-5 w-5 text-purple-400 group-focus-within:text-purple-600 transition-colors" />
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
                  autoComplete="new-password"
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                  placeholder="Create a password"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-purple-600 focus:outline-none transition-colors"
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

            {/* Confirm Password Input */}
            <div className="relative group">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-purple-400 group-focus-within:text-purple-600 transition-colors" />
                </div>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                  placeholder="Confirm your password"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-purple-600 focus:outline-none transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-pulse">
                  <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.confirmPassword.message}
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
                    <h3 className="text-sm font-semibold text-red-800">Registration Error</h3>
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
              className="relative w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-pink-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center justify-center gap-2">
                {loading && <Loader2 className="animate-spin h-5 w-5" />}
                {loading ? 'Creating account...' : 'Sign Up'}
              </span>
            </button>

            {/* Sign In Link */}
            <div className="text-center pt-4">
              <Link
                to="/signin"
                className="text-sm font-medium text-purple-600 hover:text-pink-600 transition-colors"
              >
                Already have an account? <span className="underline">Sign in</span>
              </Link>
            </div>
          </form>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20 blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-pink-400 to-indigo-500 rounded-full opacity-20 blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
};

export default SignupForm;