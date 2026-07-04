import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { User, Phone, MapPin, Calendar, CreditCard, DollarSign, Clock, FileText, ChevronLeft, Save, Sparkles } from 'lucide-react';
import { Member, MembershipPlan, CURRENT_DATE_STR, formatDate } from '../types';

import { Avatar, MALE_AVATAR, FEMALE_AVATAR, COUPLE_AVATAR } from './Avatar';

interface MemberFormProps {
  member?: Member | null; // If editing, pass the existing member
  plans: MembershipPlan[];
  onSubmit: (formData: Omit<Member, 'id' | 'status' | 'history'>) => void;
  onCancel: () => void;
}

export function MemberForm({ member, plans, onSubmit, onCancel }: MemberFormProps) {
  const isEditMode = !!member;

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Couple'>('Male');
  const [age, setAge] = useState<number | ''>(25);
  const [address, setAddress] = useState('');
  const [membershipPlanId, setMembershipPlanId] = useState('');
  const [membershipFee, setMembershipFee] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid' | 'Pending'>('Paid');
  const [joiningDate, setJoiningDate] = useState(CURRENT_DATE_STR);
  const [profilePhoto, setProfilePhoto] = useState('');

  // Field focus states for floating labels
  const [focusFields, setFocusFields] = useState<Record<string, boolean>>({});

  // Initialize form with member details if editing
  useEffect(() => {
    if (member) {
      setName(member.name);
      setPhone(member.phone);
      setGender(member.gender);
      setAge(member.age);
      setAddress(member.address);
      setMembershipPlanId(member.membershipPlanId);
      setMembershipFee(member.membershipFee);
      setPaymentStatus(member.paymentStatus);
      setJoiningDate(member.joiningDate);
      setProfilePhoto(member.profilePhoto || '');
    } else {
      // Default plan
      if (plans.length > 0) {
        setMembershipPlanId(plans[0].id);
        setMembershipFee(plans[0].fee);
      }
    }
  }, [member, plans]);

  // Set default avatar based on gender selection
  useEffect(() => {
    if (!isEditMode || !profilePhoto || profilePhoto.includes('dicebear.com') || profilePhoto.includes('unsplash.com')) {
      if (gender === 'Male') {
        setProfilePhoto(MALE_AVATAR);
      } else if (gender === 'Female') {
        setProfilePhoto(FEMALE_AVATAR);
      } else if (gender === 'Couple') {
        setProfilePhoto(COUPLE_AVATAR);
      }
    }
  }, [gender, isEditMode]);

  // Handle plan selection change
  const handlePlanChange = (planId: string) => {
    setMembershipPlanId(planId);
    const selectedPlan = plans.find(p => p.id === planId);
    if (selectedPlan) {
      setMembershipFee(selectedPlan.fee);
    }
  };

  // Calculate Expiry Date automatically
  const calculateExpiry = (): string => {
    if (!membershipPlanId || !joiningDate) return '';
    const selectedPlan = plans.find(p => p.id === membershipPlanId);
    if (!selectedPlan) return '';
    const date = new Date(joiningDate);
    date.setMonth(date.getMonth() + selectedPlan.durationMonths);
    return date.toISOString().split('T')[0];
  };

  const calculatedExpiryDate = calculateExpiry();

  // Handle focus
  const handleFocus = (field: string) => {
    setFocusFields(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: string, value: string) => {
    setFocusFields(prev => ({ ...prev, [field]: value !== '' }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !membershipPlanId || !joiningDate) return;

    const selectedPlan = plans.find(p => p.id === membershipPlanId);

    onSubmit({
      name,
      phone,
      gender,
      age: Number(age) || 25,
      address,
      membershipPlanId,
      membershipFee,
      paymentStatus: 'Paid',
      joiningDate,
      expiryDate: calculatedExpiryDate,
      duration: selectedPlan ? selectedPlan.duration : '1 Month',
      profilePhoto: profilePhoto || undefined,
      notes: '',
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto pb-12"
    >
      {/* Header */}
      <div className="hidden md:flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            id="form-back-btn"
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-xl text-brand-text-secondary hover:text-brand-text-primary transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-brand-text-primary">
              {isEditMode ? 'Edit Member Profile' : 'Register New Member'}
            </h2>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              {isEditMode ? `Update records for ${member.name}` : 'Create a fresh membership account'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Info Card */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-6">
          <h3 className="text-xs font-semibold text-brand-primary uppercase tracking-wider mb-2">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Floating Label - Name */}
            <div className="relative group">
              <User className="absolute left-3 top-3.5 w-4.5 h-4.5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
              <input
                id="form-member-name"
                type="text"
                value={name}
                onFocus={() => handleFocus('name')}
                onBlur={(e) => handleBlur('name', e.target.value)}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-brand-border rounded-xl text-sm text-brand-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-all bg-gray-50/20"
                placeholder="Full Name"
                required
              />
            </div>

            {/* Floating Label - Phone */}
            <div className="relative group">
              <Phone className="absolute left-3 top-3.5 w-4.5 h-4.5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
              <input
                id="form-member-phone"
                type="tel"
                value={phone}
                onFocus={() => handleFocus('phone')}
                onBlur={(e) => handleBlur('phone', e.target.value)}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-brand-border rounded-xl text-sm text-brand-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-all bg-gray-50/20"
                placeholder="Phone Number (e.g., 9876543210)"
                required
              />
            </div>

            {/* Gender Selection */}
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="form-member-gender" className="text-xs font-semibold text-brand-text-primary uppercase tracking-wider block">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Male', 'Female', 'Couple'] as const).map((g) => (
                  <button
                    key={g}
                    id={`gender-opt-${g}`}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                      gender === g
                        ? 'border-brand-primary bg-indigo-50/40 text-brand-primary font-semibold'
                        : 'border-brand-border bg-white text-brand-text-secondary hover:bg-gray-50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Membership Plan Details */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-6">
          <h3 className="text-xs font-semibold text-brand-primary uppercase tracking-wider mb-2">
            Membership Plan & Dates
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Membership Plan Selection */}
            <div className="space-y-1.5">
              <label htmlFor="form-member-plan" className="text-xs font-semibold text-brand-text-primary uppercase tracking-wider block">
                Membership Plan
              </label>
              <select
                id="form-member-plan"
                value={membershipPlanId}
                onChange={(e) => handlePlanChange(e.target.value)}
                className="w-full px-4 py-3 border border-brand-border rounded-xl text-sm text-brand-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-white cursor-pointer"
                required
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.duration})
                  </option>
                ))}
              </select>
            </div>

            {/* Custom membership fee (default from plan) */}
            <div className="space-y-1.5">
              <label htmlFor="form-member-fee" className="text-xs font-semibold text-brand-text-primary uppercase tracking-wider block">
                Membership Fee (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400 text-sm font-semibold">₹</span>
                <input
                  id="form-member-fee"
                  type="number"
                  value={membershipFee}
                  className="w-full pl-7 pr-4 py-3 border border-brand-border rounded-xl text-sm text-gray-500 bg-gray-50 focus:outline-none cursor-not-allowed"
                  disabled
                  required
                />
              </div>
            </div>

            {/* Joining Date */}
            <div className="space-y-1.5">
              <label htmlFor="form-member-joining" className="text-xs font-semibold text-brand-text-primary uppercase tracking-wider block">
                Joining/Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  id="form-member-joining"
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-brand-border rounded-xl text-sm text-brand-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-white"
                  required
                />
              </div>
            </div>

            {/* Auto-Calculated Expiry Date (Disabled visually) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-text-primary uppercase tracking-wider block">
                Membership Expiry Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  id="form-member-expiry"
                  type="text"
                  value={calculatedExpiryDate ? formatDate(calculatedExpiryDate) : ''}
                  className="w-full pl-10 pr-4 py-3 border border-brand-border rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Profile Photo selection */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
          <h3 className="text-xs font-semibold text-brand-primary uppercase tracking-wider">
            Profile Photo
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-50 flex-shrink-0 flex items-center justify-center">
              <Avatar photoUrl={profilePhoto} gender={gender} name={name || 'New Member'} size="xl" />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                id="avatar-male"
                type="button"
                onClick={() => setProfilePhoto(MALE_AVATAR)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  profilePhoto === MALE_AVATAR
                    ? 'border-brand-primary bg-indigo-50/40 text-brand-primary font-semibold'
                    : 'border-brand-border bg-white text-brand-text-secondary hover:bg-gray-50'
                }`}
              >
                <img src={MALE_AVATAR} className="w-6 h-6 rounded-full object-cover" alt="Male" referrerPolicy="no-referrer" />
                Male
              </button>

              <button
                id="avatar-female"
                type="button"
                onClick={() => setProfilePhoto(FEMALE_AVATAR)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  profilePhoto === FEMALE_AVATAR
                    ? 'border-brand-primary bg-indigo-50/40 text-brand-primary font-semibold'
                    : 'border-brand-border bg-white text-brand-text-secondary hover:bg-gray-50'
                }`}
              >
                <img src={FEMALE_AVATAR} className="w-6 h-6 rounded-full object-cover" alt="Female" referrerPolicy="no-referrer" />
                Female
              </button>

              <button
                id="avatar-couple"
                type="button"
                onClick={() => setProfilePhoto(COUPLE_AVATAR)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  profilePhoto === COUPLE_AVATAR
                    ? 'border-brand-primary bg-indigo-50/40 text-brand-primary font-semibold'
                    : 'border-brand-border bg-white text-brand-text-secondary hover:bg-gray-50'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center scale-75">
                  <Avatar photoUrl={COUPLE_AVATAR} gender="Couple" name="Couple" size="sm" />
                </div>
                Couple
              </button>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex gap-4">
          <button
            id="form-cancel-btn"
            type="button"
            onClick={onCancel}
            className="w-1/3 py-3 border border-brand-border bg-white rounded-xl text-sm font-semibold text-brand-text-secondary hover:bg-gray-50 cursor-pointer text-center"
          >
            Discard Changes
          </button>
          
          <button
            id="form-submit-btn"
            type="submit"
            className="w-2/3 py-3 bg-brand-primary hover:bg-brand-primary-hover active:scale-[0.99] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            {isEditMode ? 'Update Member Profile' : 'Save and Register Member'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
