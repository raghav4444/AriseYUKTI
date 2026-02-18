import React, { useState } from 'react';
import { BookOpen, Users, Shield } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-[#0d1117] flex">
      {/* Left Side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12">
        <div className="max-w-lg">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Studex</h1>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            The Student-Only Network
          </h2>
          
          <p className="text-xl text-gray-400 mb-8 leading-relaxed">
            Verified. Trusted. Built for students to connect, learn & grow.
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-gray-300">Verified college students only</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-gray-300">Connect with peers and mentors</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-gray-300">Share notes and resources</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-12">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Studex</h1>
          </div>

          {isLogin ? (
            <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
          ) : (
            <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;