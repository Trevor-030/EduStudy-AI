import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase';
import type { LoginCredentials, SignupCredentials, AuthResponse, RefreshTokenResponse } from '../types/auth';
import { jwtDecode } from 'jwt-decode';

class AuthService {
  private tokenKey = 'authToken';
  private refreshTokenKey = 'refreshToken';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      const refreshToken = user.refreshToken;

      const authResponse: AuthResponse = {
        user: {
          id: user.uid,
          email: user.email || '',
          name: user.displayName || '',
        },
        token,
        refreshToken,
      };

      this.setTokens(token, refreshToken);
      return authResponse;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      const refreshToken = user.refreshToken;

      const authResponse: AuthResponse = {
        user: {
          id: user.uid,
          email: user.email || '',
          name: user.displayName || '',
        },
        token,
        refreshToken,
      };

      this.setTokens(token, refreshToken);
      return authResponse;
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    }
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }

      const token = await user.getIdToken(true); // Force refresh
      const refreshToken = user.refreshToken;

      const refreshResponse: RefreshTokenResponse = {
        token,
      };

      this.setToken(token);
      return refreshResponse;
    } catch (error: any) {
      this.logout();
      throw new Error(error.message || 'Token refresh failed');
    }
  }

  logout(): void {
    signOut(auth).catch(console.error);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  private setTokens(token: string, refreshToken: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  async getValidToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }
}

export const authService = new AuthService();