import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Dumbbell, ArrowRight, CheckCircle2, ChevronLeft, X } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  initialOwnerName?: string;
  initialGymName?: string;
  onComplete: (ownerName: string, gymName: string) => void;
  onClose?: () => void;
}

export function OnboardingModal({
  isOpen,
  initialOwnerName = '',
  initialGymName = '',
  onComplete,
  onClose,
}: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [ownerName, setOwnerName] = useState(initialOwnerName);
  const [gymName, setGymName] = useState(initialGymName);

  if (!isOpen) return null;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!ownerName.trim()) return;
      setStep(2);
    } else {
      if (!gymName.trim()) return;
      onComplete(ownerName.trim(), gymName.trim());
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="onboarding-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          id="onboarding-modal-card"
          initial={{ opacity: 0, scale: 0.94, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 25 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="bg-[#00B5B0] text-[#12171A] w-full max-w-sm sm:max-w-md rounded-[36px] shadow-2xl border border-teal-400/30 overflow-hidden relative flex flex-col my-auto"
        >
          {/* Background Image Layer (high visibility, smooth fade from bottom) */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-[36px]">
            <img 
              src="https://qsvgrkeitnnjlcpxpewu.supabase.co/storage/v1/object/public/gym-icon-m-f/onboarding.png" 
              alt="Onboarding Background"
              className="w-full h-full object-cover object-center opacity-95 select-none"
              referrerPolicy="no-referrer"
            />
            {/* Clean fade from bottom to keep bottom action buttons distinct */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#00B5B0] via-[#00B5B0]/55 to-transparent pointer-events-none" />
          </div>

          {/* Header Controls (Close & Step Pill) */}
          <div className="relative z-10 w-full p-4 flex items-center justify-between">
            {onClose ? (
              <button
                type="button"
                id="onboarding-close-btn"
                onClick={onClose}
                className="p-2 rounded-full bg-black/25 hover:bg-black/40 text-white transition-colors cursor-pointer backdrop-blur-md"
                title="Skip for now"
              >
                <X className="w-4 h-4" />
              </button>
            ) : <div />}

            <div className="flex items-center gap-2 bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-full">
              <div 
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  step === 1 ? 'bg-white scale-110 shadow-xs' : 'bg-white/40'
                }`} 
              />
              <div 
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  step === 2 ? 'bg-white scale-110 shadow-xs' : 'bg-white/40'
                }`} 
              />
            </div>
          </div>

          {/* Visual Showcase Gap to highlight the zoomed graphic in middle */}
          <div className="relative z-10 w-full h-28 sm:h-36 pointer-events-none" />

          {/* Main Content & Form Area */}
          <div className="relative z-10 px-6 pb-7 pt-1 flex flex-col items-center text-center space-y-5">
            {/* Logo Emblem */}
            <div className="flex items-center justify-center gap-1.5 text-[#12171A]">
              <div className="p-2 bg-[#12171A] text-[#00B5B0] rounded-xl shadow-md">
                <Dumbbell className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-extrabold tracking-tight text-sm uppercase drop-shadow-xs">GYM-member</span>
            </div>

            {/* Header Text */}
            <div className="space-y-1.5 max-w-xs">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#12171A] leading-snug">
                {step === 1 ? 'Take the next step to organize' : 'Complete your gym profile'}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-[#12171A]/90 leading-relaxed">
                {step === 1 ? (
                  <>
                    <span className="font-extrabold text-[#12171A] text-sm sm:text-base">"kal se patka aunga"</span> bolne wale log.
                  </>
                ) : (
                  'Specify your gym or fitness center title to finish setting up.'
                )}
              </p>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleNextStep} className="w-full space-y-5 pt-1">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="onboard-step-1"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2 text-left"
                  >
                    <label 
                      htmlFor="onboarding-user-name" 
                      className="text-xs font-extrabold text-[#12171A] uppercase tracking-wider block pl-1"
                    >
                      Your Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        id="onboarding-user-name"
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        autoFocus
                        required
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-900 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#12171A] transition-all"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="onboard-step-2"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2 text-left"
                  >
                    <label 
                      htmlFor="onboarding-gym-name" 
                      className="text-xs font-extrabold text-[#12171A] uppercase tracking-wider block pl-1"
                    >
                      Gym Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <input
                        id="onboarding-gym-name"
                        type="text"
                        value={gymName}
                        onChange={(e) => setGymName(e.target.value)}
                        placeholder="e.g. Apex Fitness Club"
                        autoFocus
                        required
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-900 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#12171A] transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Pill Buttons Matching Reference Image */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  id={step === 1 ? 'onboarding-next-btn' : 'onboarding-finish-btn'}
                  disabled={step === 1 ? !ownerName.trim() : !gymName.trim()}
                  className="w-full py-3.5 px-6 bg-[#12171A] hover:bg-black text-white disabled:opacity-60 disabled:cursor-not-allowed rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-black/15 active:scale-98 transition-all cursor-pointer"
                >
                  <span>{step === 1 ? 'Continue' : 'Get Started'}</span>
                  {step === 1 ? (
                    <ArrowRight className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </button>

                {step === 2 && (
                  <button
                    type="button"
                    id="onboarding-back-btn"
                    onClick={() => setStep(1)}
                    className="w-full py-3 px-6 border-2 border-[#12171A] text-[#12171A] hover:bg-[#12171A]/10 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                )}
              </div>
            </form>

            {/* Pagination Indicators */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <div className={`h-2 rounded-full transition-all duration-300 ${step === 1 ? 'w-6 bg-[#12171A]' : 'w-2 bg-[#12171A]/30'}`} />
              <div className={`h-2 rounded-full transition-all duration-300 ${step === 2 ? 'w-6 bg-[#12171A]' : 'w-2 bg-[#12171A]/30'}`} />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
