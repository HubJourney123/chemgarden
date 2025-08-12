// src/components/Navbar.js
// ============================================
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, GraduationCap, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar({ role, userName = 'User' }) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Logged out successfully');
        router.push('/login');
      }
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <GraduationCap className="h-8 w-8 text-white" />
              <span className="ml-2 text-white text-xl font-bold">
                Utsar
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <User className="h-5 w-5" />
                <span className="font-medium">{userName}</span>
                <span className="px-2 py-1 bg-purple-500 bg-opacity-20 rounded-full text-xs">
                  {role === 'teacher' ? 'Teacher' : 'Assistant'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-purple-500 bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-purple-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <div className="flex items-center space-x-2 text-black px-3 py-2">
              <User className="h-5 w-5" />
              <span className="font-medium">{userName}</span>
              <span className="px-2 py-1 bg-white text-blackbg-opacity-20 rounded-full text-xs">
                {role === 'teacher' ? 'Teacher' : 'Assistant'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left bg-white bg-opacity-20 hover:bg-opacity-30 text-black px-3 py-2 rounded-lg font-medium transition duration-200 flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}