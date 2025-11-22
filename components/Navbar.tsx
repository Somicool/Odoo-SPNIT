'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user is authenticated by checking cookie
    fetch('/api/auth/me')
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error('Not authenticated');
      })
      .then((data) => {
        setUserName(data.name || data.email?.split('@')[0] || 'User');
        setUserEmail(data.email);
      })
      .catch(() => {
        // If not authenticated, redirect to login
        router.push('/login');
      });
  }, [router]);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      // Call both signout methods to ensure all sessions are cleared
      await fetch('/api/auth/signout', { method: 'POST' });
      await signOut({ redirect: false });
      
      // Clear local state
      setUserName(null);
      setUserEmail(null);
      
      // Redirect to login
      router.push('/login');
    } catch (err) {
      console.error('Signout error:', err);
      // Force redirect even if API fails
      router.push('/login');
    }
  };

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    router.push('/settings');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 px-6 shadow-xl">
      <div className="flex items-center">
        <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-lg">
          StockMaster
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 px-4 py-2 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <User className="h-5 w-5" />
            </div>
            <span className="font-semibold text-sm">{userEmail || userName || 'Loading...'}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-2xl border border-gray-200 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500 mt-1 truncate">{userEmail || 'Signed in'}</p>
              </div>
              
              <div className="py-2">
                <button
                  onClick={handleSettingsClick}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="h-4 w-4 text-gray-500" />
                  <span>Settings</span>
                </button>
                
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
