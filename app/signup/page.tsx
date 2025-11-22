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

export default function SignupPage() {
  const router = useRouter();
  
  const [signupLoginId, setSignupLoginId] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupError, setSignupError] = useState('');

  const validatePassword = (pwd: string): boolean => {
    const hasLowercase = /[a-z]/.test(pwd);
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const isLongEnough = pwd.length > 8;
    
    return hasLowercase && hasUppercase && hasSpecialChar && isLongEnough;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    
    // Validation: Login ID length
    if (signupLoginId.length < 6 || signupLoginId.length > 12) {
      setSignupError('Login ID must be between 6-12 characters');
      return;
    }
    
    // Validation: Password complexity
    if (!validatePassword(signupPassword)) {
      setSignupError('Password must contain lowercase, uppercase, special character and be more than 8 characters');
      return;
    }
    
    // Validation: Password match
    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }
    
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
      });

      if (authError) {
        setSignupError(authError.message);
        return;
      }

      if (authData.user) {
        // Upsert user details into users table
        const { error: insertError } = await supabase
          .from('users')
          .upsert([
            {
              id: authData.user.id,
              email: signupEmail.toLowerCase(),
              name: signupLoginId,
              auth_method: 'manual',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ], {
            onConflict: 'id'
          });

        if (insertError) {
          setSignupError('Account created but failed to save user details');
          return;
        }

        // Store auth token in cookie
        const token = authData.session?.access_token;
        if (token) {
          document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        }

        router.push('/dashboard');
      }
    } catch (err: any) {
      setSignupError(err.message || 'An error occurred during signup');
    }
  };

  const handleGoogleSignIn = async () => {
    setSignupError('');
    
    try {
      await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: true,
      });
    } catch (err: any) {
      setSignupError(err.message || 'An error occurred during Google sign in');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500">
      <div className="border-b bg-white/10 backdrop-blur-sm py-5">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Sign Up</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <Card className="shadow-2xl border-t-4 border-t-orange-400 backdrop-blur-sm bg-white/95">
              <CardHeader className="text-center space-y-4">
                <div className="mb-2 flex justify-center">
                  <h1 className="text-5xl font-black bg-gradient-to-r from-rose-500 via-orange-500 to-amber-600 bg-clip-text text-transparent tracking-tight">
                    StockMaster
                  </h1>
                </div>
                <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signupLoginId">Enter Login Id</Label>
                    <Input
                      id="signupLoginId"
                      type="text"
                      placeholder="6-12 characters"
                      value={signupLoginId}
                      onChange={(e) => setSignupLoginId(e.target.value)}
                      required
                      minLength={6}
                      maxLength={12}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">Enter Email Id</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder="Enter Email Id"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">Enter Password</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      placeholder="Must contain a-z, A-Z, special char, 8+ length"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signupConfirmPassword">Re-Enter Password</Label>
                    <Input
                      id="signupConfirmPassword"
                      type="password"
                      placeholder="Re-Enter Password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  {signupError && (
                    <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                      {signupError}
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 shadow-lg transform hover:scale-105 transition-all">
                    SIGN UP
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
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
                    Sign up with Google
                  </Button>

                  <div className="text-center text-sm pt-2">
                    <span className="text-gray-700 font-medium">Already have an account? </span>
                    <Link href="/" className="text-orange-600 hover:text-orange-800 hover:underline font-semibold transition-colors">
                      Login
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
