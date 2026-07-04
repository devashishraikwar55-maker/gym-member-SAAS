import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, CreditCard, ChevronRight, Check } from 'lucide-react';
import { Member, MembershipPlan, CURRENT_DATE_STR, formatDate } from '../types';

interface RenewModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  plans: MembershipPlan[];
  onRenew: (memberId: string, planId: string, customStartDate: string, paymentStatus: 'Paid' | 'Unpaid' | 'Pending') => void;
}

export function RenewModal({ isOpen, onClose, member, plans, onRenew }: RenewModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [startDate, setStartDate] = useState(CURRENT_DATE_STR);
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid' | 'Pending'>('Paid');

  // Initialize with the member's current plan or the first plan
  useEffect(() => {
    if (member) {
      setSelectedPlanId(member.membershipPlanId || plans[0]?.id || '');
      // If member's current membership is already expired, default start date to today.
      // If expiring in future, default renewal to start the day after current expiry!
      const today = new Date(CURRENT_DATE_STR);
      const expiry = new Date(member.expiryDate);
      if (expiry > today) {
        // Expiration is in the future, set start date as the day after expiry
        const nextDay = new Date(expiry);
        nextDay.setDate(nextDay.getDate() + 1);
        setStartDate(nextDay.toISOString().split('T')[0]);
      } else {
        setStartDate(CURRENT_DATE_STR);
      }
      setPaymentStatus('Paid');
    }
  }, [member, plans]);

  if (!isOpen || !member) return null;

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  // Calculate new expiry date based on selected plan and start date
  const calculateNewExpiry = (): string => {
    if (!selectedPlan || !startDate) return '';
    const start = new Date(startDate);
    const months = selectedPlan.durationMonths;
    start.setMonth(start.getMonth() + months);
    return start.toISOString().split('T')[0];
  };

  const newExpiryDate = calculateNewExpiry();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId || !startDate || !newExpiryDate) return;
    onRenew(member.id, selectedPlanId, startDate, 'Paid');
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        id="renew-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
      >
        <motion.div
          id="renew-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-brand-border overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
            <div>
              <h3 className="text-lg font-semibold text-brand-text-primary">Renew Membership</h3>
              <p className="text-xs text-brand-text-secondary mt-0.5">Extend or renew membership for {member.name}</p>
            </div>
            <button
              id="close-renew-modal"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 rounded-full p-1.5 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Member Quick Summary */}
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-brand-primary uppercase tracking-wider">Member Details</p>
                <p className="font-semibold text-brand-text-primary mt-1 text-base">{member.name}</p>
                <p className="text-xs text-brand-text-secondary mt-0.5">{member.phone}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  member.status === 'Active' ? 'bg-green-100 text-brand-success' :
                  member.status === 'Expiring' ? 'bg-amber-100 text-brand-warning' :
                  member.status === 'Expired' ? 'bg-red-100 text-brand-danger' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {member.status}
                </span>
                <p className="text-[10px] text-brand-text-secondary mt-1.5">Expires: {formatDate(member.expiryDate)}</p>
              </div>
            </div>

            {/* Choose Plan */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-brand-text-primary uppercase tracking-wider block">
                Select Renewal Plan
              </label>
              <div className="grid grid-cols-1 gap-2.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                {plans.map((plan) => {
                  const isSelected = plan.id === selectedPlanId;
                  return (
                    <button
                      key={plan.id}
                      id={`renew-plan-option-${plan.id}`}
                      type="button"
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-brand-primary bg-indigo-50/40 shadow-xs' 
                          : 'border-brand-border hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-brand-primary bg-brand-primary' : 'border-gray-300'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-brand-text-primary">{plan.name}</p>
                          <p className="text-xs text-brand-text-secondary">{plan.duration} • {plan.description.slice(0, 50)}...</p>
                        </div>
                      </div>
                      <p className="font-bold text-brand-text-primary text-sm">₹{plan.fee}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start Date & New Expiry */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="renew-start-date" className="text-xs font-semibold text-brand-text-primary uppercase tracking-wider block">
                  Renewal Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    id="renew-start-date"
                    type="date"
                    className="w-full pl-9 pr-3 py-2 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-brand-text-primary bg-white"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text-primary uppercase tracking-wider block">
                  New Expiry Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    id="renew-expiry-date"
                    type="text"
                    className="w-full pl-9 pr-3 py-2 border border-brand-border rounded-xl text-sm bg-gray-50 text-gray-500 focus:outline-none cursor-not-allowed"
                    value={newExpiryDate ? formatDate(newExpiryDate) : ''}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Summary Line */}
            {selectedPlan && (
              <div className="pt-2 flex items-center justify-between text-sm text-brand-text-primary border-t border-dashed border-brand-border">
                <span className="font-medium text-brand-text-secondary">Grand Total Due:</span>
                <span className="font-bold text-lg text-brand-primary">₹{selectedPlan.fee}</span>
              </div>
            )}

            {/* Submit Actions */}
            <div className="flex gap-3 pt-3">
              <button
                id="cancel-renew-btn"
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 border border-brand-border rounded-xl text-sm font-medium text-brand-text-secondary hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-renew-btn"
                type="submit"
                className="w-1/2 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-medium hover:bg-brand-primary-hover active:scale-[0.98] transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-4 h-4" />
                Confirm Renewal
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
