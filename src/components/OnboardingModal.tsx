import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Dumbbell, ArrowRight, CheckCircle2, ChevronLeft, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  initialOwnerName?: string;
  initialGymName?: string;
  onComplete: (ownerName: string, gymName: string) => void;
}

export function OnboardingModal({
  isOpen,
  initialOwnerName = '',
  initialGymName = '',
  onComplete,
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
          {/* Top Graphic Banner - Stepping Athletic Feet Illustration */}
          <div className="relative w-full h-52 sm:h-60 bg-[#00B5B0] overflow-hidden flex items-center justify-center pt-2">
            {/* Background Geometric Shadow Steps */}
            <svg className="absolute inset-0 w-full h-full text-[#009692]" fill="currentColor" viewBox="0 0 400 240">
              <path d="M 180,0 L 220,0 L 220,60 L 260,60 L 260,120 L 300,120 L 300,180 L 340,180 L 340,240 L 180,240 Z" opacity="0.45" />
              <path d="M 220,0 L 270,0 L 270,80 L 320,80 L 320,160 L 370,160 L 370,240 L 220,240 Z" opacity="0.3" />
            </svg>

            {/* Main Vector Art - Legs with striped crew socks & running sneakers */}
            <svg className="w-56 h-56 sm:w-64 sm:h-64 relative z-10 drop-shadow-md" viewBox="0 0 200 200" fill="none">
              {/* Back Leg Shadow */}
              <path d="M 115,10 L 132,10 L 118,85 L 102,85 Z" fill="#00726F" />
              
              {/* Right Leg (Stepping Higher) */}
              <path d="M 110,10 C 110,10 118,50 120,70 C 122,90 108,120 105,130 L 90,128 C 93,115 106,88 103,70 C 100,50 94,10 94,10 Z" fill="#1C2126" />
              {/* Right Sock */}
              <path d="M 105,130 C 103,138 98,150 92,158 L 80,154 C 85,145 90,135 90,128 Z" fill="#FFFFFF" />
              <path d="M 102,135 L 88,131 M 100,140 L 86,136 M 98,145 L 84,141" stroke="#1C2126" strokeWidth="2" strokeLinecap="round" />
              {/* Right Sneaker */}
              <path d="M 92,158 C 90,162 82,172 68,172 C 60,172 58,168 62,160 C 66,152 75,150 80,154 Z" fill="#FFFFFF" />
              <path d="M 68,172 C 60,172 58,168 62,160" stroke="#00B5B0" strokeWidth="3" strokeLinecap="round" />
              <path d="M 64,172 L 90,163" stroke="#1C2126" strokeWidth="3.5" strokeLinecap="round" />

              {/* Left Leg (Lower Step) */}
              <path d="M 65,10 C 65,10 70,45 68,65 C 66,85 52,105 48,115 L 35,110 C 39,100 52,80 54,65 C 56,45 50,10 50,10 Z" fill="#1C2126" />
              {/* Left Sock */}
              <path d="M 48,115 C 46,122 42,132 38,138 L 26,132 C 30,125 34,116 35,110 Z" fill="#FFFFFF" />
              <path d="M 46,120 L 33,114 M 44,125 L 31,119 M 42,130 L 29,124" stroke="#1C2126" strokeWidth="2" strokeLinecap="round" />
              {/* Left Sneaker */}
              <path d="M 38,138 C 36,143 28,150 18,148 C 12,147 12,141 16,135 C 20,128 27,128 26,132 Z" fill="#FFFFFF" />
              <path d="M 18,148 L 36,140" stroke="#1C2126" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 18,148 C 12,147 12,141 16,135" stroke="#00B5B0" strokeWidth="3" strokeLinecap="round" />
            </svg>

            {/* Subtle Step Dots */}
            <div className="absolute top-4 right-5 flex items-center gap-1.5 bg-black/10 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-bold text-slate-900 tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#12171A]" />
              <span>Step {step} / 2</span>
            </div>
          </div>

          {/* Main Content & Form Area */}
          <div className="px-6 pb-7 pt-1 flex flex-col items-center text-center space-y-5">
            {/* Logo Emblem */}
            <div className="flex items-center justify-center gap-1.5 text-[#12171A]">
              <div className="p-2 bg-[#12171A] text-[#00B5B0] rounded-xl shadow-xs">
                <Dumbbell className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-extrabold tracking-tight text-sm uppercase">Apex Gym</span>
            </div>

            {/* Header Text */}
            <div className="space-y-1.5 max-w-xs">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#12171A] leading-snug">
                {step === 1 ? 'Take the next step' : 'Complete your gym profile'}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-[#12171A]/80 leading-relaxed">
                {step === 1 
                  ? 'Toward a organized, effortless, and member-focused gym management experience.' 
                  : 'Specify your gym or fitness center title to finish setting up.'}
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
