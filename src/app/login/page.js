// ============================================
// src/app/login/page.js (FIXED VERSION)
// ============================================
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { User, Lock, Loader2, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // ============================================
// UPDATED LOGIN PAGE WITH DIRECT NAVIGATION
// src/app/login/page.js (UPDATE THE HANDLESUBMIT FUNCTION)
// ============================================
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include',
    });

    const data = await response.json();

    if (response.ok) {
      toast.success('Login successful! Redirecting...');
      
      // Direct navigation without middleware
      if (data.role === 'teacher') {
        window.location.href = '/teacher/dashboard';
      } else {
        window.location.href = '/assistant/dashboard';
      }
    } else {
      toast.error(data.error || 'Login failed');
      setIsLoading(false);
    }
  } catch (error) {
    console.error('Login error:', error);
    toast.error('Something went wrong. Please try again.');
    setIsLoading(false);
  }
};

  const fillDemoCredentials = (role) => {
    if (role === 'teacher') {
      setFormData({
        email: 'teacher@demo.com',
        password: 'teacher123'
      });
    } else {
      setFormData({
        email: 'assistant@demo.com',
        password: 'assistant123'
      });
    }
    toast.success('Demo credentials filled!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Coaching Center Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="teacher@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="mt-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Quick Demo Access</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => fillDemoCredentials('teacher')}
              disabled={isLoading}
              className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Teacher Login
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('assistant')}
              disabled={isLoading}
              className="px-4 py-2 border border-pink-300 text-pink-700 rounded-lg hover:bg-pink-50 transition duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Assistant Login
            </button>
          </div>

          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>Teacher: teacher@demo.com / teacher123</p>
            <p>Assistant: assistant@demo.com / assistant123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
