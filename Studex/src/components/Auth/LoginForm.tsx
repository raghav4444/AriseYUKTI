import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, X, CheckCircle, Copy, Check } from 'lucide-react';
import { useAuth } from '../AuthProvider';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const { signIn, loading, resetPassword } = useAuth();

  const copyToClipboard = async (text: string, email: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    
    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
      setResetEmail('');
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Failed to send reset email. Please try again.');
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setResetEmail('');
    setResetError('');
    setResetSuccess(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#161b22] rounded-lg p-8 border border-gray-800">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400">Sign in to your CampusLink account</p>
        </div>

        {/* Demo accounts: 5 users with different verification / access levels */}
        <div className="mb-6 rounded-lg border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            <p className="font-bold text-base text-amber-200">Demo Accounts</p>
          </div>
          <p className="text-xs text-amber-100/90 mb-3">
            Password for all: <code className="bg-black/60 px-2 py-1 rounded font-mono text-amber-200">StudexDemo123!</code>
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <span className="text-amber-200 font-medium min-w-[90px]">Full access:</span>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {['demo.full1@axiscolleges.in', 'demo.full2@axiscolleges.in'].map((email) => (
                  <button
                    key={email}
                    type="button"
                    onClick={() => {
                      setEmail(email);
                      copyToClipboard(email, email);
                    }}
                    className="group relative flex items-center gap-1 bg-black/60 hover:bg-black/80 px-2 py-1 rounded text-amber-200 hover:text-white transition-all cursor-pointer"
                  >
                    <code className="text-xs">{email}</code>
                    {copiedEmail === email ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-200 font-medium min-w-[90px]">Partial:</span>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {['demo.partial@axiscolleges.in', 'demo.pending@axiscolleges.in'].map((email) => (
                  <button
                    key={email}
                    type="button"
                    onClick={() => {
                      setEmail(email);
                      copyToClipboard(email, email);
                    }}
                    className="group relative flex items-center gap-1 bg-black/60 hover:bg-black/80 px-2 py-1 rounded text-amber-200 hover:text-white transition-all cursor-pointer"
                  >
                    <code className="text-xs">{email}</code>
                    {copiedEmail === email ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-200 font-medium min-w-[90px]">Read-only:</span>
              <div className="flex flex-wrap gap-1.5 flex-1">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('demo.readonly@axiscolleges.in');
                    copyToClipboard('demo.readonly@axiscolleges.in', 'demo.readonly@axiscolleges.in');
                  }}
                  className="group relative flex items-center gap-1 bg-black/60 hover:bg-black/80 px-2 py-1 rounded text-amber-200 hover:text-white transition-all cursor-pointer"
                >
                  <code className="text-xs">demo.readonly@axiscolleges.in</code>
                  {copiedEmail === 'demo.readonly@axiscolleges.in' ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-amber-100/80 italic border-t border-amber-500/30 pt-2">
            💡 Click any email to auto-fill. Test different access levels!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              College Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                placeholder="your.email@college.edu"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-medium rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] rounded-lg p-8 border border-gray-800 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Reset Password</h3>
              <button
                onClick={closeForgotPasswordModal}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {resetSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Email Sent!</h4>
                <p className="text-gray-400 text-sm mb-6">
                  We've sent a password reset link to your email. Check your inbox and follow the instructions to reset your password.
                </p>
                <button
                  onClick={closeForgotPasswordModal}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Got it
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                      placeholder="Enter your college email"
                      required
                    />
                  </div>
                </div>

                {resetError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{resetError}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={closeForgotPasswordModal}
                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-medium rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;