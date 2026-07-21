'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CustomerLayout } from '@/components/layout/customer-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { loginAction, registerAction } from '@/lib/actions/auth';
import { User, Phone, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

function LoginForms() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/profile';
  const paramMode = searchParams.get('mode');
  const initialMode = paramMode === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);

  // Form states
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.match(/^[6-9]\d{9}$/)) {
      toast.error('Please enter a valid 10-digit Indian phone number');
      return;
    }
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setLoading(true);
    toast.loading('Signing in...', { id: 'auth' });

    try {
      const res = await loginAction({ phone, password });
      if (res.success) {
        toast.success('Welcome back!', { id: 'auth' });
        router.push(from);
      } else {
        toast.error(res.error || 'Invalid credentials', { id: 'auth' });
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed', { id: 'auth' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!phone.match(/^[6-9]\d{9}$/)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    toast.loading('Creating account...', { id: 'auth' });

    try {
      const res = await registerAction({ name, phone, email, password });
      if (res.success) {
        toast.success('Account created successfully!', { id: 'auth' });
        router.push(from);
      } else {
        toast.error(res.error || 'Registration failed', { id: 'auth' });
      }
    } catch (err: any) {
      toast.error(err.message || 'Registration failed', { id: 'auth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFD74D] to-[#FFA544] flex items-center justify-center text-black mx-auto mb-4 shadow-lg shadow-amber-500/20">
            <User className="w-8 h-8" />
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {mode === 'login' 
              ? 'Sign in to access your orders and saved addresses' 
              : 'Join Swagatam Cafe for faster checkout and exclusive offers'}
          </p>
        </div>

        <Card className="rounded-3xl border border-stone-200 bg-white/80 backdrop-blur-xl shadow-xl overflow-hidden">
          {/* Mode Toggle */}
          <div className="flex border-b border-stone-100 bg-stone-50/50">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-4 text-sm font-semibold transition-colors relative cursor-pointer ${mode === 'login' ? 'text-stone-950' : 'text-stone-400 hover:text-stone-805'}`}
            >
              Sign In
              {mode === 'login' && (
                <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-4 text-sm font-semibold transition-colors relative cursor-pointer ${mode === 'register' ? 'text-stone-950' : 'text-stone-400 hover:text-stone-805'}`}
            >
              Sign Up
              {mode === 'register' && (
                <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />
              )}
            </button>
          </div>

          <CardContent className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              
              {mode === 'login' && (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500 uppercase">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
                      <Input 
                        type="tel"
                        required
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-stone-50/50 border-stone-200 focus-visible:ring-stone-950 text-stone-850"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-500 uppercase">Password</label>
                      <button type="button" className="text-xs text-amber-700 hover:underline cursor-pointer">Forgot?</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
                      <Input 
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-stone-50/50 border-stone-200 focus-visible:ring-stone-950 text-stone-850"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-bold mt-4 shadow group cursor-pointer"
                  >
                    {loading ? 'Authenticating...' : 'Sign In'}
                    {!loading && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                </motion.form>
              )}

              {mode === 'register' && (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleRegister}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500 uppercase">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
                      <Input 
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-stone-50/50 border-stone-200 focus-visible:ring-stone-950 text-stone-850"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500 uppercase">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
                      <Input 
                        type="tel"
                        required
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-stone-50/50 border-stone-200 focus-visible:ring-stone-950 text-stone-850"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500 uppercase">Email (Optional)</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
                      <Input 
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-stone-50/50 border-stone-200 focus-visible:ring-stone-950 text-stone-850"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500 uppercase">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
                      <Input 
                        type="password"
                        required
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-stone-50/50 border-stone-200 focus-visible:ring-stone-950 text-stone-850"
                        minLength={6}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-bold mt-4 shadow group cursor-pointer"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                    {!loading && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                </motion.form>
              )}

            </AnimatePresence>
            
            <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-stone-500">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              Your data is securely encrypted.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function LoginClient() {
  return (
    <CustomerLayout>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-t-2 border-amber-500 rounded-full" /></div>}>
        <LoginForms />
      </Suspense>
    </CustomerLayout>
  );
}
