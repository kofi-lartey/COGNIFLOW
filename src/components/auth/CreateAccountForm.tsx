/* src/components/auth/CreateAccountForm.tsx */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, User, Lock, Globe, Apple } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export function CreateAccountForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Try Supabase registration
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    // Handle rate limit errors (429) from Supabase
    if (signUpError) {
      const errorMessage = signUpError.message || '';
      setError(errorMessage || 'Registration failed. Please try again.');
      setLoading(false);
      return;
    }

    if (data.user) {
      // Registration successful
      router.push('/onboarding');
    }

    setLoading(false);
  };
      
  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-text-primary mb-3">
          Create Account
        </h1>
        <p className="text-lg text-text-secondary leading-relaxed">
          Step into the future of precision AI workflows.
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-6">
        
        {/* Full Name Input */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-text-primary uppercase tracking-wider mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full h-14 pl-12 pr-4 bg-background-dark/50 border border-border-dark rounded-soft text-text-primary text-base placeholder:text-text-secondary/50 focus:ring-1 focus:ring-cyan-accent focus:border-cyan-accent transition-all"
            />
          </div>
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full h-14 pl-12 pr-4 bg-background-dark/50 border border-border-dark rounded-soft text-text-primary text-base placeholder:text-text-secondary/50 focus:ring-1 focus:ring-cyan-accent focus:border-cyan-accent transition-all"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary uppercase tracking-wider mb-2">
            Create Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-14 pl-12 pr-4 bg-background-dark/50 border border-border-dark rounded-soft text-text-primary text-lg tracking-widest placeholder:text-text-secondary/50 focus:ring-1 focus:ring-cyan-accent focus:border-cyan-accent transition-all"
            />
          </div>
        </div>

        {/* Error Messaging (If applicable) */}
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        {/* Primary Accent Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-cyan-accent text-background-dark rounded-soft text-lg font-bold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Create Account'}
        </button>
      </form>

      {/* Social Sign Up Section */}
      <div className="relative my-10 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-dark" />
        </div>
        <span className="relative bg-card-dark px-3 text-xs text-text-secondary uppercase tracking-wider">
          Or sign up with
        </span>
      </div>

      <div className="flex gap-4">
        {/* Google Button */}
        <button className="flex-1 h-12 flex items-center justify-center gap-3 border border-border-dark bg-background-dark hover:bg-border-dark/30 rounded-soft text-text-primary text-base transition-colors">
          <Globe className="w-5 h-5 text-[#34A853]" /> {/* Google */}
          <span>Google</span>
        </button>
        
        {/* Apple Button */}
        <button className="flex-1 h-12 flex items-center justify-center gap-3 border border-border-dark bg-background-dark hover:bg-border-dark/30 rounded-soft text-text-primary text-base transition-colors">
          <Apple className="w-5 h-5 text-text-primary" />
          <span>Apple</span>
        </button>
      </div>

      {/* Footer Link */}
      <p className="text-center text-base text-text-secondary mt-12">
        Already have an account?{' '}
        <a href="/login" className="font-semibold text-cyan-accent hover:text-cyan-accent/80 transition-colors">
          Sign in
        </a>
      </p>
    </div>
  );
}