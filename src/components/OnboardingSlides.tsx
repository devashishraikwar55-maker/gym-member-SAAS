import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, 
  Users, 
  MessageCircle, 
  CreditCard, 
  ArrowRight, 
  ArrowLeft,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  Building,
  User
} from 'lucide-react';
import { signInWithGoogle, loginWithEmail, registerWithEmail, saveSettingsToFirestore, initializeUserGymData } from '../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { SystemSettings, DEFAULT_SETTINGS } from '../types';

interface Slide {
  id: number;
  icon: any;
  gradient: string;
  glowColor: string;
  title: string;
  subtitle: string;
}

const FEATURE_SLIDES: Slide[] = [
  {
    id: 1,
    icon: Users,
    gradient: 'from-blue-600 to-indigo-600',
    glowColor: 'bg-indigo-500/20',
    title: 'Manage Members',
    subtitle: 'Add and organize all your gym members in one place.'
  },
  {
    id: 2,
    icon: MessageCircle,
    gradient: 'from-emerald-500 to-teal-600',
    glowColor: 'bg-emerald-500/20',
    title: 'WhatsApp Reminders',
    subtitle: 'Send 1-click renewal alerts before memberships expire.'
  },
  {
    id: 3,
    icon: CreditCard,
    gradient: 'from-purple-600 to-indigo-600',
    glowColor: 'bg-purple-500/20',
    title: 'Plans & Pricing',
    subtitle: 'Simple monthly, quarterly, and annual membership options.'
  }
];

const TOTAL_SLIDES = 4; // 3 feature slides + 1 authentication slide

interface OnboardingSlidesProps {
  currentUser?: FirebaseUser | null;
  settings?: SystemSettings;
  onSaveProfile?: (ownerName: string, gymName: string) => Promise<void> | void;
  onLoginSuccess?: () => void;
  onComplete: () => void;
  onSkip?: () => void;
}

export function OnboardingSlides({ 
  currentUser,
  settings,
  onSaveProfile,
  onLoginSuccess, 
  onComplete, 
  onSkip 
}: OnboardingSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0); // 0, 1, 2 = feature slides, 3 = auth slide
  const [direction, setDirection] = useState(1);

  // Auth Form State
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Post-Signup Gym Setup Slide State
  const [isProfileSetupStep, setIsProfileSetupStep] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<FirebaseUser | null>(null);
  const [newOwnerName, setNewOwnerName] = useState(settings?.ownerName || '');
  const [newGymName, setNewGymName] = useState(settings?.gymName || 'GYM-member');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleNext = () => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      setDirection(1);
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (isProfileSetupStep) {
      setIsProfileSetupStep(false);
      return;
    }
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleEmailAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setErrorMessage(null);

    if (authMode === 'signin') {
      const { user, error } = await loginWithEmail(email, password);
      setIsLoading(false);
      if (error) {
        if (error.includes('user-not-found') || error.includes('invalid-credential') || error.includes('wrong-password')) {
          setErrorMessage('Invalid email or password. If you are new, click "Sign Up" above.');
        } else {
          setErrorMessage(error);
        }
      } else {
        if (onLoginSuccess) onLoginSuccess();
        else onComplete();
      }
    } else {
      if (password.length < 6) {
        setIsLoading(false);
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      const { user, error } = await registerWithEmail(email, password);
      setIsLoading(false);
      if (error) {
        if (error.includes('email-already-in-use')) {
          setErrorMessage('This email is already registered. Please sign in instead.');
        } else {
          setErrorMessage(error);
        }
      } else if (user) {
        // Account created successfully: Transition to Profile Setup Slide!
        setAuthenticatedUser(user);
        setNewOwnerName(user.displayName || email.split('@')[0] || 'Gym Owner');
        setNewGymName(settings?.gymName || 'GYM-member');
        setIsProfileSetupStep(true);
      }
    }
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    const { user, error } = await signInWithGoogle();
    setIsGoogleLoading(false);
    if (error) {
      setErrorMessage(error);
    } else if (user) {
      if (authMode === 'signup') {
        // In signup mode with Google, show the gym setup slide
        setAuthenticatedUser(user);
        setNewOwnerName(user.displayName || user.email?.split('@')[0] || 'Gym Owner');
        setNewGymName(settings?.gymName || 'GYM-member');
        setIsProfileSetupStep(true);
      } else {
        if (onLoginSuccess) onLoginSuccess();
        else onComplete();
      }
    }
  };

  const handleSaveProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const finalOwner = newOwnerName.trim() || 'Gym Owner';
    const finalGym = newGymName.trim() || 'GYM-member';

    setIsSavingProfile(true);
    try {
      const activeUser = authenticatedUser || currentUser;
      if (activeUser) {
        await initializeUserGymData(activeUser.uid, finalOwner, finalGym);
        await saveSettingsToFirestore(activeUser.uid, {
          ...(settings || DEFAULT_SETTINGS),
          ownerName: finalOwner,
          gymName: finalGym,
        });
      }
      if (onSaveProfile) {
        await onSaveProfile(finalOwner, finalGym);
      }
      if (onLoginSuccess) onLoginSuccess();
      else onComplete();
    } catch (err) {
      console.error('Error saving gym setup profile:', err);
      if (onLoginSuccess) onLoginSuccess();
      else onComplete();
    } finally {
      setIsSavingProfile(false);
    }
  };

  const isAuthSlide = currentSlide === 3;
  const currentFeatureSlide = !isAuthSlide ? FEATURE_SLIDES[currentSlide] : null;

  return (
    <div 
      id="onboarding-slides-card"
      className="w-full max-w-md bg-white p-7 sm:p-8 rounded-3xl shadow-2xl border border-brand-border flex flex-col justify-between min-h-[490px] relative overflow-hidden transition-all duration-300"
    >
      {/* Subtle ambient background glow */}
      <div 
        className={`absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 ${
          isProfileSetupStep 
            ? 'bg-emerald-500/15' 
            : isAuthSlide 
            ? 'bg-indigo-500/15' 
            : currentFeatureSlide?.glowColor
        } rounded-full blur-3xl -z-0 pointer-events-none transition-all duration-500`} 
      />

      {/* Top Header: App Branding, Slide Indicator & Skip Button */}
      <div className="flex items-center justify-between w-full relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-brand-primary flex items-center justify-center shadow-xs">
            <Dumbbell className="w-3.5 h-3.5 text-white stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-xs tracking-tight text-brand-text-primary">GYM-member</span>
        </div>

        <div className="flex items-center gap-2">
          {!isProfileSetupStep && (
            <span className="text-[11px] font-semibold text-gray-400">
              {currentSlide + 1} / {TOTAL_SLIDES}
            </span>
          )}
          {(!currentUser && onSkip && !isProfileSetupStep) ? (
            <button
              type="button"
              id="onboarding-skip-btn"
              onClick={onSkip}
              className="text-xs font-semibold text-gray-400 hover:text-brand-primary transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-gray-100"
            >
              Skip
            </button>
          ) : (
            <button
              type="button"
              onClick={onComplete}
              className="text-xs font-semibold text-gray-400 hover:text-brand-primary transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-gray-100"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Middle Animated Slide Content */}
      <div className="my-auto py-2 text-center flex flex-col items-center relative z-10 w-full">
        <AnimatePresence mode="wait" custom={direction}>
          {/* SLIDE: PROFILE SETUP (Shown immediately after creating a new account) */}
          {isProfileSetupStep ? (
            <motion.div
              key="gym-profile-setup-slide"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full text-left space-y-4 pt-1"
            >
              {/* Header */}
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mx-auto mb-2 shadow-xs">
                  <Building className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-brand-text-primary tracking-tight">
                  Setup Your Gym
                </h3>
                <p className="text-xs text-brand-text-secondary">
                  Please enter your name and gym details to get started.
                </p>
              </div>

              {/* Profile Setup Form in Single Slide */}
              <form onSubmit={handleSaveProfileSubmit} className="space-y-3.5 max-w-sm mx-auto">
                <div className="space-y-1">
                  <label htmlFor="setup-owner-name" className="text-xs font-bold text-gray-700 block">
                    Owner Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      id="setup-owner-name"
                      type="text"
                      value={newOwnerName}
                      onChange={(e) => setNewOwnerName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full pl-9 pr-3 py-2.5 border border-brand-border rounded-xl text-xs sm:text-sm text-brand-text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-gray-50/50 transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="setup-gym-name" className="text-xs font-bold text-gray-700 block">
                    Gym Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      id="setup-gym-name"
                      type="text"
                      value={newGymName}
                      onChange={(e) => setNewGymName(e.target.value)}
                      placeholder="e.g. Iron Fitness Club"
                      className="w-full pl-9 pr-3 py-2.5 border border-brand-border rounded-xl text-xs sm:text-sm text-brand-text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-gray-50/50 transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <button
                  id="setup-profile-submit-btn"
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full mt-2 py-3 bg-brand-primary text-white font-bold rounded-xl text-xs sm:text-sm hover:bg-brand-primary-hover active:scale-[0.99] transition-all cursor-pointer shadow-md shadow-brand-primary/25 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSavingProfile ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Complete & Enter Gym</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            /* SLIDES 1 - 3: FEATURE OVERVIEWS */
            !isAuthSlide && currentFeatureSlide ? (
              <motion.div
                key={`slide-${currentFeatureSlide.id}`}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: direction * -40, scale: 0.98 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
                className="flex flex-col items-center w-full space-y-4 py-4"
              >
                {/* Clean Icon with Soft Gradient */}
                <div className="relative mb-2">
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${currentFeatureSlide.gradient} flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white relative z-10`}>
                    <currentFeatureSlide.icon className="w-10 h-10 stroke-[2.2]" />
                  </div>
                  <div className={`absolute inset-0 rounded-3xl ${currentFeatureSlide.glowColor} blur-md -z-0 scale-110`} />
                </div>

                {/* Title & Subtitle */}
                <div className="space-y-2 px-2">
                  <h2 className="text-2xl font-extrabold text-brand-text-primary tracking-tight">
                    {currentFeatureSlide.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed max-w-xs mx-auto">
                    {currentFeatureSlide.subtitle}
                  </p>
                </div>
              </motion.div>
            ) : (
              /* SLIDE 4: AUTHENTICATION SLIDE */
              <motion.div
                key="auth-slide"
                custom={direction}
                initial={{ opacity: 0, x: direction * 40, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: direction * -40, scale: 0.98 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
                className="w-full text-left space-y-4 pt-1"
              >
                {/* Slide Heading */}
                <div className="text-center space-y-1">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-brand-text-primary tracking-tight">
                    {currentUser ? 'Ready to Go!' : authMode === 'signin' ? 'Sign In to GYM-member' : 'Create Gym Account'}
                  </h3>
                  <p className="text-xs text-brand-text-secondary">
                    {currentUser 
                      ? `Logged in as ${currentUser.email || 'Gym Admin'}` 
                      : authMode === 'signin' 
                      ? 'Sync your members and settings to the cloud.' 
                      : 'Get started with cloud-synced gym management.'}
                  </p>
                </div>

                {currentUser ? (
                  /* Already Signed In View */
                  <div className="space-y-4 py-3 max-w-sm mx-auto text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-800">{currentUser.displayName || currentUser.email}</p>
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full inline-block">
                        Account Active & Synced
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={onComplete}
                      className="w-full py-3 bg-brand-primary text-white font-bold rounded-xl text-xs sm:text-sm hover:bg-brand-primary-hover active:scale-[0.99] transition-all cursor-pointer shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
                    >
                      <span>Enter Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* Unauthenticated Sign In / Sign Up Form */
                  <div className="space-y-3.5">
                    {/* Mode Tabs */}
                    <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100/90 rounded-xl text-xs font-bold">
                      <button
                        type="button"
                        id="onboarding-tab-signin"
                        onClick={() => { setAuthMode('signin'); setErrorMessage(null); }}
                        className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                          authMode === 'signin' 
                            ? 'bg-white text-brand-primary shadow-xs' 
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        id="onboarding-tab-signup"
                        onClick={() => { setAuthMode('signup'); setErrorMessage(null); }}
                        className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                          authMode === 'signup' 
                            ? 'bg-white text-brand-primary shadow-xs' 
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        Sign Up
                      </button>
                    </div>

                    {/* Error message alert */}
                    {errorMessage && (
                      <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Google Sign-in Button */}
                    <button
                      type="button"
                      id="onboarding-google-signin-btn"
                      onClick={handleGoogleAuth}
                      disabled={isGoogleLoading || isLoading}
                      className="w-full py-2.5 px-4 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 rounded-xl text-xs sm:text-sm font-bold text-gray-700 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60 shadow-2xs"
                    >
                      {isGoogleLoading ? (
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin" />
                      ) : (
                        <>
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                          </svg>
                          <span>Continue with Google</span>
                        </>
                      )}
                    </button>

                    <div className="relative my-2 flex items-center justify-center">
                      <div className="border-t border-gray-200 w-full" />
                      <span className="bg-white px-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 absolute">or email</span>
                    </div>

                    {/* Email & Password Form */}
                    <form onSubmit={handleEmailAuthSubmit} className="space-y-2.5">
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                          id="onboarding-auth-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="owner@yourgym.com"
                          className="w-full pl-9 pr-3 py-2 border border-brand-border rounded-xl text-xs text-brand-text-primary placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-primary bg-gray-50/50"
                          required
                        />
                      </div>

                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                          id="onboarding-auth-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3 py-2 border border-brand-border rounded-xl text-xs text-brand-text-primary placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-primary bg-gray-50/50"
                          required
                        />
                      </div>

                      <button
                        id="onboarding-auth-submit-btn"
                        type="submit"
                        disabled={isLoading || isGoogleLoading}
                        className="w-full py-2.5 bg-brand-primary text-white font-bold rounded-xl text-xs sm:text-sm hover:bg-brand-primary-hover active:scale-[0.99] transition-all cursor-pointer shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Guest mode option */}
                    {onSkip && (
                      <div className="text-center pt-1">
                        <button
                          type="button"
                          id="onboarding-auth-guest-btn"
                          onClick={onSkip}
                          className="text-xs font-semibold text-gray-500 hover:text-brand-primary transition-colors cursor-pointer py-1 px-3 rounded-lg hover:bg-gray-100"
                        >
                          Skip for now (Guest Mode)
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Area: Step Dots & Navigation Buttons (Shown for feature slides & auth slide) */}
      {!isProfileSetupStep && (
        <div className="space-y-4 pt-3 relative z-10 border-t border-gray-100">
          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-1.5">
            {Array.from({ length: TOTAL_SLIDES }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentSlide ? 1 : -1);
                  setCurrentSlide(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentSlide
                    ? 'w-7 bg-brand-primary'
                    : 'w-2 bg-gray-200 hover:bg-gray-300'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons: Next / Back */}
          <div className="flex items-center gap-2.5">
            {currentSlide > 0 && (
              <button
                type="button"
                id="onboarding-back-btn"
                onClick={handlePrev}
                className="py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            {!isAuthSlide ? (
              <button
                type="button"
                id="onboarding-next-btn"
                onClick={handleNext}
                className="flex-1 py-2.5 px-5 bg-brand-primary text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-brand-primary-hover active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-brand-primary/20 flex items-center justify-center gap-2"
              >
                <span>{currentSlide === 2 ? 'Get Started' : 'Next'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
