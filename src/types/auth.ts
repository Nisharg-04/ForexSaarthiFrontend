// ============================================
// Authentication Types - Based on OpenAPI 3.0 Spec
// ============================================

// Request Types
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleSignInRequest {
  idToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  name?: string | null;
  email?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Response Types
export interface UserInfo {
  id: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface UserProfileResponse {
  id: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number;
  user: UserInfo | null;
}

// API Response Wrappers
export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
  errors: string[] | null;
}

export type AuthResponseApiResponse = ApiResponse<AuthResponse>;
export type UserProfileResponseApiResponse = ApiResponse<UserProfileResponse>;
export type ObjectApiResponse = ApiResponse<object>;

// Form Validation Types
export interface FormErrors {
  [key: string]: string | undefined;
}

// Auth State
export interface AuthState {
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
