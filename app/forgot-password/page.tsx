'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setMessage('Password reset instructions have been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-t-4 border-t-fuchsia-400 backdrop-blur-sm bg-white/95">
          <CardHeader className="text-center space-y-4">
            <div className="mb-2 flex justify-center">
              <h1 className="text-5xl font-black bg-gradient-to-r from-violet-500 via-purple-600 to-fuchsia-700 bg-clip-text text-transparent tracking-tight">
                StockMaster
              </h1>
            </div>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <p className="text-sm text-gray-600">Enter your email to reset your password</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Id</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {message && (
                <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                  {message}
                </div>
              )}

              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 shadow-lg transform hover:scale-105 transition-all" disabled={loading}>
                {loading ? 'Sending...' : 'Reset Password'}
              </Button>

              <div className="text-center text-sm">
                <Link href="/" className="text-fuchsia-600 hover:text-fuchsia-800 hover:underline font-semibold transition-colors">
                  Back to Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
