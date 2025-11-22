'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoginError(error.message);
        return;
      }

      if (data.user) {
        // Store auth token in cookie
        const token = data.session?.access_token;
        if (token) {
          document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        }
        router.push('/dashboard');
      }
    } catch (err: any) {
      setLoginError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoginError('');
    setLoading(true);
    
    try {
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: true,
      });

      if (result?.error) {
        setLoginError('Failed to sign in with Google');
        setLoading(false);
      }
    } catch (err: any) {
      setLoginError(err.message || 'An error occurred during Google sign in');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600">
      <div className="border-b bg-white/10 backdrop-blur-sm py-5">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Login</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <Card className="shadow-2xl border-t-4 border-t-cyan-400 backdrop-blur-sm bg-white/95">
              <CardHeader className="text-center space-y-4">
                <div className="mb-2 flex justify-center">
                  <h1 className="text-5xl font-black bg-gradient-to-r from-blue-500 via-cyan-600 to-teal-700 bg-clip-text text-transparent tracking-tight">
                    StockMaster
                  </h1>
                </div>
                <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Id</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter Email Id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Link 
                      href="/forgot-password" 
                      className="text-sm text-cyan-600 hover:text-cyan-800 hover:underline font-medium transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  {loginError && (
                    <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                      {loginError}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg transform hover:scale-105 transition-all"
                    disabled={loading}
                  >
                    {loading ? 'LOGGING IN...' : 'LOGIN'}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 shadow-sm transform hover:scale-105 transition-all flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </Button>

                  <Button
                    type="button"
                    onClick={() => router.push('/otp-login')}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-sm transform hover:scale-105 transition-all"
                  >
                    Login with OTP
                  </Button>

                  <div className="text-center text-sm pt-2">
                    <span className="text-gray-700 font-medium">Don't have an account? </span>
                    <Link href="/signup" className="text-cyan-600 hover:text-cyan-800 hover:underline font-semibold transition-colors">
                      Sign Up
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
