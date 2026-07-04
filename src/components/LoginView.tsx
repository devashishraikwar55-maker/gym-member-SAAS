import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Dumbbell, Lock, Mail, ArrowRight, CheckCircle } from 'lucide-react';

interface LoginViewProps {
  onLogin: () => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('owner@apexfitness.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    // Simulate premium delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div 
      id="login-view-wrapper"
      className="min-h-screen w-full flex bg-brand-bg relative overflow-hidden"
    >
      {/* Decorative blurred background shapes */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[120px] -z-10 animate-pulse duration-[8s]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-200/20 rounded-full blur-[100px] -z-10 animate-pulse duration-[12s]" />

      {/* Brand Side Panel (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-sidebar p-16 flex-col justify-between relative overflow-hidden">
        {/* Subtle grid pattern backdrop */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center shadow-md">
            <Dumbbell className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight">GymReminders</span>
        </div>

        <div className="space-y-6 relative z-10 max-w-md">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-white tracking-tight leading-tight"
          >
            Never miss a membership renewal again.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-brand-text-secondary text-base leading-relaxed"
          >
            A powerful, clean membership management dashboard designed for gym owners. Automate reminders, track active and expired plans, and optimize member retention effortlessly.
          </motion.p>

          <div className="space-y-4 pt-4">
            {[
              'Direct SMS & WhatsApp templates ready to copy',
              'Categorized reminder timelines (Today, 3 Days, 7 Days)',
              'Detailed membership logs & transaction histories',
              'Quick-access command palette for super-fast navigation'
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
                className="flex items-center gap-3 text-sm text-gray-300"
              >
                <CheckCircle className="w-5 h-5 text-brand-success flex-shrink-0" />
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-500 relative z-10">
          © 2026 Apex Fitness Club • Powered by GymReminders SaaS.
        </div>
      </div>

      {/* Login Card Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16">
        <motion.div 
          id="login-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-brand-border"
        >
          {/* Logo on Mobile */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center shadow-xs">
              <Dumbbell className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
            <span className="font-bold text-lg text-brand-text-primary tracking-tight">GymReminders</span>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-2xl font-bold text-brand-text-primary">Welcome back, Partner</h2>
            <p className="text-sm text-brand-text-secondary mt-1">Please enter your credentials to manage your gym.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-semibold text-brand-text-primary uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4.5 h-4.5 text-gray-400" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gym.com"
                  className="w-full pl-11 pr-4 py-2.5 border border-brand-border rounded-xl text-sm text-brand-text-primary placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-gray-50/30"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-xs font-semibold text-brand-text-primary uppercase tracking-wider block">
                  Password
                </label>
                <a href="#" className="text-xs text-brand-primary hover:underline font-medium">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4.5 h-4.5 text-gray-400" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 border border-brand-border rounded-xl text-sm text-brand-text-primary placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-gray-50/30"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-brand-primary text-white font-medium rounded-xl text-sm hover:bg-brand-primary-hover active:scale-[0.99] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Access Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Instructions Box */}
          <div className="mt-8 p-4 bg-indigo-50/40 rounded-xl border border-indigo-100 text-xs text-brand-text-secondary leading-relaxed">
            <span className="font-semibold text-brand-primary block mb-0.5">Demo Mode Active:</span>
            Credentials have been pre-filled for a streamlined tour. Simply click <strong className="text-brand-text-primary">"Access Dashboard"</strong> to begin managing members.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
