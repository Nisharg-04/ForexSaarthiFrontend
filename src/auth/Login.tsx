import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Ship,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  Globe,
  TrendingUp,
  Shield,
  Zap,
} from 'lucide-react';
import { Navbar } from '../components/ui/Navbar';
import { useLoginMutation, useGoogleSignInMutation } from '../services/authApi';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { setCredentials, selectIsAuthenticated } from '../app/authSlice';
import { apiSlice } from '../app/apiSlice';
import type { FormErrors } from '../types/auth';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (element: HTMLElement, config: object) => void;
        };
      };
    };
  }
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [login, { isLoading }] = useLoginMutation();
  const [googleSignIn, { isLoading: isGoogleLoading }] = useGoogleSignInMutation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Check for redirect message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
          callback: handleGoogleCallback,
        });

        const googleBtn = document.getElementById('google-signin-btn');
        if (googleBtn) {
          window.google.accounts.id.renderButton(googleBtn, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
          });
        }
      }
    };

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleCallback = async (response: { credential: string }) => {
    try {
      setServerError('');
      const result = await googleSignIn({ idToken: response.credential }).unwrap();
      
      if (result.success && result.data) {
        // Clear any cached data from previous user before setting new credentials
        dispatch(apiSlice.util.resetApiState());
        dispatch(
          setCredentials({
            user: {
                id: result.data.user?.id || '',
                name: result.data.user?.name || '',
                email: result.data.user?.email || '',
                avatarUrl: result.data.user?.avatarUrl || '',
                companies: [],
                createdAt: result.data.user?.createdAt || new Date().toISOString(),
                activeCompanyId: null,
                role: 'ADMIN'
            },
            accessToken: result.data.accessToken || '',
            refreshToken: result.data.refreshToken || '',
          })
        );
      } else {
        setServerError(result.message || 'Google sign-in failed');
      }
    } catch {
      setServerError('Google sign-in failed. Please try again.');
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validateForm()) return;

    try {
      const result = await login(formData).unwrap();

      if (result.success && result.data) {
        // Clear any cached data from previous user before setting new credentials
        dispatch(apiSlice.util.resetApiState());
        dispatch(
          setCredentials({
            user: {
                id: result.data.user?.id || '',
                name: result.data.user?.name || '',
                email: result.data.user?.email || '',
                avatarUrl: result.data.user?.avatarUrl || '',
                companies: [],
                createdAt: result.data.user?.createdAt || new Date().toISOString(),
                activeCompanyId: null,
                role: 'ADMIN'
            },
            accessToken: result.data.accessToken || '',
            refreshToken: result.data.refreshToken || '',
          })
        );
      } else {
        setServerError(result.message || 'Login failed');
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      setServerError(error.data?.message || 'Invalid email or password');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: FormErrors) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 transition-colors duration-300">
      <Navbar />
      
      <div className="flex-1 flex pt-16">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-700 dark:via-cyan-700 dark:to-teal-700">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Animated Gradient Orbs */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-cyan-400/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Animated Waves */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 320" className="w-full">
            <path
              fill="rgba(255,255,255,0.1)"
              d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-8">
                
            <img
              src="/ForexSaarthi Logo Transparent.png"
              alt="ForexSaarthi"
              className="h-40 w-auto"
            />
         
            </div>
            <h2 className="text-2xl font-semibold mb-4">
              Welcome Back
            </h2>
            <p className="text-cyan-100 text-lg max-w-md mx-auto">
              Navigate your forex journey with confidence. Your command center awaits.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 grid grid-cols-2 gap-4 w-full max-w-md"
          >
            {[
              { icon: Globe, label: 'Global Coverage', desc: '15+ Currencies' },
              { icon: TrendingUp, label: 'Real-time Rates', desc: 'Live Updates' },
              { icon: Shield, label: 'Bank-grade Security', desc: 'SOC 2 Certified' },
              { icon: Zap, label: 'Fast Settlement', desc: 'Same Day' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all"
              >
                <item.icon className="w-6 h-6 text-cyan-300 mb-2" />
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-cyan-200">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 right-1"
          >
            <div className="w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm flex items-center justify-center">
              <span className="text-2xl">$</span>
            </div>
          </motion.div>
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-1/3 left-1"
          >
            <div className="w-20 h-20 bg-white/10 rounded-full backdrop-blur-sm flex items-center justify-center">
              <span className="text-3xl">€</span>
            </div>
          </motion.div>
          <motion.div
            animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 left-[15%]"
          >
            <div className="w-12 h-12 bg-white/10 rounded-full backdrop-blur-sm flex items-center justify-center">
              <span className="text-xl">£</span>
            </div>
          </motion.div>
          <motion.div
            animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-1/4 right-[15%]"
          >
            <div className="w-14 h-14 bg-white/10 rounded-full backdrop-blur-sm flex items-center justify-center">
              <span className="text-xl">¥</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <Ship className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
            <span className="text-2xl font-bold text-gray-800 dark:text-white">
              ForexSaarthi
            </span>
          </div>

          <div className="bg-white dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-700">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Sign In
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Enter your credentials to access your account
              </p>
            </div>

            {/* Success Message */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  {successMessage}
                </p>
              </motion.div>
            )}

            {/* Server Error */}
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  {serverError}
                </p>
              </motion.div>
            )}

            {/* Google Sign-In Button */}
            <div className="mb-6">
              <div id="google-signin-btn" className="w-full flex justify-center" />
              {isGoogleLoading && (
                <div className="flex items-center justify-center gap-2 mt-4 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Signing in with Google...</span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-slate-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@company.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      errors.email
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-200 dark:border-slate-600 focus:ring-blue-500'
                    } bg-white dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                      errors.password
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-200 dark:border-slate-600 focus:ring-blue-500'
                    } bg-white dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  );
};

export default Login;
