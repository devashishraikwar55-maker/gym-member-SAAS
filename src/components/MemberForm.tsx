import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Phone, 
  Calendar, 
  CreditCard, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Member, MembershipPlan, CURRENT_DATE_STR, formatDate } from '../types';
import { Avatar, MALE_AVATAR, FEMALE_AVATAR, COUPLE_AVATAR } from './Avatar';

interface MemberFormProps {
  member?: Member | null;
  plans: MembershipPlan[];
  onSubmit: (formData: Omit<Member, 'id' | 'status' | 'history'>) => void;
  onCancel: () => void;
}

export function MemberForm({ member, plans, onSubmit, onCancel }: MemberFormProps) {
  const isEditMode = !!member;

  // Multi-step state: 0 = Name & Gender, 1 = Phone Number, 2 = Plan & Start Date, 3 = Review & Confirm
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Couple'>('Male');
  const [age] = useState<number>(25);
  const [address] = useState('');
  const [membershipPlanId, setMembershipPlanId] = useState('');
  const [membershipFee, setMembershipFee] = useState<number>(0);
  const [joiningDate, setJoiningDate] = useState(CURRENT_DATE_STR);
  const [profilePhoto, setProfilePhoto] = useState(MALE_AVATAR);
  const [phoneError, setPhoneError] = useState('');

  // Initialize form
  useEffect(() => {
    if (member) {
      setName(member.name);
      setPhone(member.phone);
      setGender(member.gender);
      setMembershipPlanId(member.membershipPlanId);
      setMembershipFee(member.membershipFee);
      setJoiningDate(member.joiningDate);
      setProfilePhoto(member.profilePhoto || MALE_AVATAR);
    } else if (plans.length > 0) {
      setMembershipPlanId(plans[0].id);
      setMembershipFee(plans[0].fee);
    }
  }, [member, plans]);

  // Update default avatar based on gender
  useEffect(() => {
    if (!isEditMode) {
      if (gender === 'Male') setProfilePhoto(MALE_AVATAR);
      else if (gender === 'Female') setProfilePhoto(FEMALE_AVATAR);
      else if (gender === 'Couple') setProfilePhoto(COUPLE_AVATAR);
    }
  }, [gender, isEditMode]);

  const selectedPlan = plans.find(p => p.id === membershipPlanId) || plans[0];

  const handlePlanChange = (planId: string) => {
    setMembershipPlanId(planId);
    const p = plans.find(plan => plan.id === planId);
    if (p) setMembershipFee(p.fee);
  };

  // Calculate Expiry Date
  const calculateExpiry = (): string => {
    if (!selectedPlan || !joiningDate) return '';
    const date = new Date(joiningDate);
    date.setMonth(date.getMonth() + selectedPlan.durationMonths);
    return date.toISOString().split('T')[0];
  };

  const calculatedExpiryDate = calculateExpiry();

  // Navigation handlers
  const canProceedStep = () => {
    if (currentStep === 0) return name.trim().length > 0;
    if (currentStep === 1) return phone.trim().length >= 6;
    if (currentStep === 2) return Boolean(membershipPlanId && joiningDate);
    return true;
  };

  const handleNext = () => {
    if (!canProceedStep()) return;
    if (currentStep === 1 && phone.trim().length < 6) {
      setPhoneError('Please enter a valid phone number (at least 6 digits)');
      return;
    }
    setPhoneError('');
    if (currentStep < 3) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinalSubmit = () => {
    if (!name || !phone || !selectedPlan || !joiningDate) return;

    onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      gender,
      age: age || 25,
      address,
      membershipPlanId: selectedPlan.id,
      membershipFee: selectedPlan.fee,
      paymentStatus: 'Paid',
      joiningDate,
      expiryDate: calculatedExpiryDate,
      duration: selectedPlan.duration,
      profilePhoto: profilePhoto || undefined,
      notes: '',
    });
  };

  const STEPS = [
    { title: 'Member Name', subtitle: 'Enter the full name and profile avatar' },
    { title: 'Phone Number', subtitle: 'For membership alerts & WhatsApp' },
    { title: 'Membership Plan', subtitle: 'Select duration and starting date' },
    { title: 'Review & Register', subtitle: 'Confirm and save membership' },
  ];

  return (
    <div 
      id="member-form-container"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <motion.div
        id="member-form-card"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden flex flex-col justify-between min-h-[480px] relative"
      >
        {/* Top Progress & Header */}
        <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs">
              {currentStep + 1}
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-text-primary">
                {isEditMode ? 'Edit Member' : 'Register New Member'}
              </h2>
              <p className="text-[11px] text-brand-text-secondary">
                Step {currentStep + 1} of {STEPS.length} • {STEPS[currentStep].title}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-member-form-btn"
            onClick={onCancel}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-gray-100 h-1">
          <motion.div 
            className="bg-brand-primary h-1 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Interactive Step Content Slide */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            {/* STEP 0: NAME & GENDER */}
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.22 }}
                className="space-y-6"
              >
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    Step 1
                  </span>
                  <h3 className="text-2xl font-bold text-brand-text-primary">What is the member's name?</h3>
                  <p className="text-xs text-brand-text-secondary">
                    Enter full legal or gym display name.
                  </p>
                </div>

                <div className="space-y-4 max-w-sm mx-auto">
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      id="step-name-input"
                      type="text"
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && canProceedStep()) handleNext(); }}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-brand-border focus:border-brand-primary rounded-2xl text-base text-brand-text-primary placeholder-gray-400 focus:outline-none bg-gray-50/50"
                      required
                    />
                  </div>

                  {/* Gender / Avatar Selection */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider block text-center">
                      Select Gender / Category
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Male', 'Female', 'Couple'] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          id={`step-gender-${g}`}
                          onClick={() => setGender(g)}
                          className={`py-2.5 px-3 rounded-xl border-2 text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            gender === g
                              ? 'border-brand-primary bg-indigo-50/60 text-brand-primary shadow-xs'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Avatar 
                            photoUrl={g === 'Male' ? MALE_AVATAR : g === 'Female' ? FEMALE_AVATAR : COUPLE_AVATAR} 
                            gender={g} 
                            name={name || g} 
                            size="sm" 
                          />
                          <span>{g}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 1: PHONE NUMBER */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.22 }}
                className="space-y-6"
              >
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Step 2
                  </span>
                  <h3 className="text-2xl font-bold text-brand-text-primary">What is their phone number?</h3>
                  <p className="text-xs text-brand-text-secondary">
                    Used for expiry reminders and WhatsApp messages.
                  </p>
                </div>

                <div className="space-y-3 max-w-sm mx-auto">
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      id="step-phone-input"
                      type="tel"
                      autoFocus
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (phoneError) setPhoneError('');
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter' && canProceedStep()) handleNext(); }}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-brand-border focus:border-brand-primary rounded-2xl text-base text-brand-text-primary placeholder-gray-400 focus:outline-none bg-gray-50/50"
                      required
                    />
                  </div>

                  {phoneError && (
                    <p className="text-xs text-red-500 font-medium text-center">{phoneError}</p>
                  )}

                  <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/60 text-emerald-800 text-[11px] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>WhatsApp reminders will be prepared automatically with this number.</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: MEMBERSHIP PLAN & DATES */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.22 }}
                className="space-y-5"
              >
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
                    Step 3
                  </span>
                  <h3 className="text-2xl font-bold text-brand-text-primary">Choose Plan & Start Date</h3>
                  <p className="text-xs text-brand-text-secondary">
                    Select plan duration and when the membership begins.
                  </p>
                </div>

                <div className="space-y-4 max-w-md mx-auto">
                  {/* Quick Plan Grid */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider block">
                      Select Plan
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                      {plans.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          id={`step-plan-opt-${p.id}`}
                          onClick={() => handlePlanChange(p.id)}
                          className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                            membershipPlanId === p.id
                              ? 'border-brand-primary bg-indigo-50/80 text-brand-primary shadow-xs'
                              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-xs font-bold truncate">{p.name}</div>
                          <div className="text-sm font-black text-brand-text-primary mt-0.5">₹{p.fee}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Pickers */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider block mb-1">
                        Start Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                          id="step-joining-date"
                          type="date"
                          value={joiningDate}
                          onChange={(e) => setJoiningDate(e.target.value)}
                          className="w-full pl-9 pr-2 py-2 border-2 border-brand-border focus:border-brand-primary rounded-xl text-xs text-brand-text-primary font-medium focus:outline-none bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider block mb-1">
                        Expires On
                      </label>
                      <div className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-700 font-bold bg-gray-50 flex items-center h-[38px]">
                        {calculatedExpiryDate ? formatDate(calculatedExpiryDate) : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: REVIEW & CONFIRM */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.22 }}
                className="space-y-5"
              >
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Step 4
                  </span>
                  <h3 className="text-2xl font-bold text-brand-text-primary">Ready to Register!</h3>
                  <p className="text-xs text-brand-text-secondary">
                    Review member details and confirm.
                  </p>
                </div>

                {/* Review Card */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-3.5 max-w-sm mx-auto">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                    <Avatar photoUrl={profilePhoto} gender={gender} name={name} size="lg" />
                    <div>
                      <h4 className="font-bold text-base text-brand-text-primary">{name}</h4>
                      <p className="text-xs text-gray-500 font-mono">{phone}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 font-medium block">Plan & Duration</span>
                      <span className="font-bold text-gray-800">{selectedPlan?.name} ({selectedPlan?.duration})</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Fee</span>
                      <span className="font-bold text-brand-primary text-sm">₹{membershipFee}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Start Date</span>
                      <span className="font-semibold text-gray-700">{formatDate(joiningDate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Expiry Date</span>
                      <span className="font-bold text-emerald-700">{formatDate(calculatedExpiryDate)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Slide Navigation Bar */}
        <div className="p-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50/50">
          {currentStep > 0 ? (
            <button
              type="button"
              id="form-step-back-btn"
              onClick={handleBack}
              className="py-3 px-5 border border-gray-300 hover:bg-white text-xs font-bold text-gray-700 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              id="form-cancel-btn"
              onClick={onCancel}
              className="py-3 px-5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? 'w-6 bg-brand-primary'
                    : idx < currentStep
                    ? 'w-2 bg-emerald-500'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            id="form-step-next-btn"
            onClick={handleNext}
            disabled={!canProceedStep()}
            className={`py-3 px-6 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center gap-2 shadow-md transition-all cursor-pointer ${
              !canProceedStep()
                ? 'bg-gray-300 cursor-not-allowed shadow-none'
                : currentStep === 3
                ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-emerald-500/25'
                : 'bg-brand-primary hover:bg-brand-primary-hover active:scale-95 shadow-indigo-500/25'
            }`}
          >
            <span>{currentStep === 3 ? (isEditMode ? 'Save Changes' : 'Confirm & Register') : 'Next'}</span>
            {currentStep === 3 ? <Check className="w-4 h-4 stroke-[3]" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
