'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function OTPLoginPage() {
  const router = useRouter();
  
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send OTP');
        return;
      }

      // Check if in dev mode and show OTP directly
      if (data.devMode && data.otp) {
        setSuccess(`🔐 DEV MODE: Your OTP is ${data.otp} (also check server console)`);
      } else {
        setSuccess('OTP sent to your email!');
      }
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid OTP');
        return;
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to resend OTP');
        return;
      }

      setSuccess('OTP resent successfully!');
    } catch (err: any) {
      setError(err.message || 'An error occurred while resending OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600">
      <div className="border-b bg-white/10 backdrop-blur-sm py-5">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">OTP Login</h1>
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
                <CardTitle className="text-2xl font-bold">
                  {step === 'email' ? 'Login with OTP' : 'Verify OTP'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {step === 'email' ? (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
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

                    {error && (
                      <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                        {success}
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg transform hover:scale-105 transition-all"
                      disabled={loading}
                    >
                      {loading ? 'SENDING OTP...' : 'SEND OTP'}
                    </Button>

                    <div className="text-center text-sm pt-2">
                      <Link href="/login" className="text-cyan-600 hover:text-cyan-800 hover:underline font-semibold transition-colors">
                        ← Back to Login
                      </Link>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="otp">Enter 6-Digit OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        required
                        disabled={loading}
                        maxLength={6}
                        className="text-center text-2xl tracking-widest font-bold"
                      />
                    </div>

                    {error && (
                      <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                        {success}
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg transform hover:scale-105 transition-all"
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? 'VERIFYING...' : 'VERIFY OTP'}
                    </Button>

                    <div className="text-center text-sm pt-2 space-y-2">
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={loading}
                        className="text-cyan-600 hover:text-cyan-800 hover:underline font-semibold transition-colors"
                      >
                        Resend OTP
                      </button>
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            setStep('email');
                            setOtp('');
                            setError('');
                            setSuccess('');
                          }}
                          className="text-gray-600 hover:text-gray-800 hover:underline"
                        >
                          Change Email
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
