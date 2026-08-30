import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, MapPin, Calendar, CreditCard, Clock, Trash2, Edit, RefreshCw, Slash, FileText, User, HelpCircle, History, MessageCircle } from 'lucide-react';
import { Member, MembershipPlan, formatDate } from '../types';
import { Avatar } from './Avatar';
import { getWhatsAppRenewUrl } from '../utils/whatsapp';

interface MemberDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  plans: MembershipPlan[];
  onRenewClick: (member: Member) => void;
  onCancelClick: (memberId: string) => void;
  onEditClick: (memberId: string) => void;
  onDeleteClick: (memberId: string) => void;
}

export function MemberDetailsModal({
  isOpen,
  onClose,
  member,
  plans,
  onRenewClick,
  onCancelClick,
  onEditClick,
  onDeleteClick
}: MemberDetailsModalProps) {
  if (!isOpen || !member) return null;

  const plan = plans.find(p => p.id === member.membershipPlanId);

  // Status-specific styles
  const statusColors = {
    Active: 'bg-green-50 border-green-100 text-brand-success',
    Expiring: 'bg-amber-50 border-amber-100 text-brand-warning',
    Expired: 'bg-red-50 border-red-100 text-brand-danger',
    Cancelled: 'bg-gray-100 border-gray-200 text-brand-text-secondary'
  }[member.status];

  const paymentColors = {
    Paid: 'bg-emerald-50 border-emerald-100 text-brand-success',
    Unpaid: 'bg-rose-50 border-rose-100 text-brand-danger',
    Pending: 'bg-amber-50 border-amber-100 text-brand-warning'
  }[member.paymentStatus];

  return (
    <AnimatePresence>
      <div 
        id="member-details-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
      >
        <motion.div
          id="member-details-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-brand-border overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border flex-shrink-0">
            <div>
              <h3 className="text-lg font-semibold text-brand-text-primary">Member Profile</h3>
              <p className="text-xs text-brand-text-secondary mt-0.5">ID: {member.id}</p>
            </div>
            <button
              id="close-details-modal"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 rounded-full p-1.5 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-grow">
            {/* Top Identity Block */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-border">
              <div className="flex items-center gap-4">
                <Avatar photoUrl={member.profilePhoto} gender={member.gender} name={member.name} size="xl" />
                 <div>
                  <h4 className="text-xl font-bold text-brand-text-primary">{member.name}</h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-brand-text-secondary">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {member.gender}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {member.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1.5 self-start sm:self-center">
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${statusColors}`}>
                  {member.status}
                </span>
              </div>
            </div>

            {/* General Info Card */}
            <div>
              {/* Membership details */}
              <div className="bg-gray-50/50 p-4 rounded-xl border border-brand-border space-y-3">
                <h5 className="text-xs font-semibold text-brand-text-primary uppercase tracking-wider mb-2">
                  Membership Details
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2.5 text-sm">
                  <div>
                    <span className="text-brand-text-secondary text-xs block">Current Plan</span>
                    <span className="font-semibold text-brand-text-primary mt-0.5 block">{plan?.name || member.duration}</span>
                  </div>
                  <div>
                    <span className="text-brand-text-secondary text-xs block">Fee Paid</span>
                    <span className="font-semibold text-brand-text-primary mt-0.5 block">₹{member.membershipFee}</span>
                  </div>
                  <div>
                    <span className="text-brand-text-secondary text-xs block">Joining Date</span>
                    <span className="font-medium text-brand-text-primary mt-0.5 block flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {formatDate(member.joiningDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-brand-text-secondary text-xs block">Expiry Date</span>
                    <span className="font-medium text-brand-text-primary mt-0.5 block flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {formatDate(member.expiryDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Membership History Timeline */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <History className="w-4 h-4 text-brand-primary" />
                <h5 className="text-xs font-semibold text-brand-text-primary uppercase tracking-wider">
                  Membership History
                </h5>
              </div>
              <div className="border border-brand-border rounded-xl divide-y divide-brand-border overflow-hidden">
                {member.history && member.history.length > 0 ? (
                  member.history.slice().reverse().map((hist, idx) => {
                    const statusDot = {
                      Active: 'bg-brand-success',
                      Cancelled: 'bg-brand-danger',
                      Completed: 'bg-indigo-500'
                    }[hist.status];

                    return (
                      <div key={hist.id || idx} className="p-3.5 bg-white flex items-center justify-between text-sm hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="mt-1.5 flex-shrink-0">
                            <span className={`w-2 h-2 rounded-full block ${statusDot}`} />
                          </div>
                          <div>
                            <p className="font-semibold text-brand-text-primary">{hist.planName}</p>
                            <p className="text-xs text-brand-text-secondary mt-0.5">
                              {formatDate(hist.joiningDate)} to {formatDate(hist.expiryDate)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-brand-text-primary">₹{hist.fee}</p>
                          <span className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-sm mt-1 inline-block ${
                            hist.status === 'Active' ? 'bg-green-50 text-brand-success border border-green-100' :
                            hist.status === 'Cancelled' ? 'bg-red-50 text-brand-danger border border-red-100' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {hist.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-xs text-brand-text-secondary">
                    No membership history recorded.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="px-6 py-4 bg-gray-50 border-t border-brand-border flex flex-wrap gap-2 justify-between items-center flex-shrink-0">
            <div>
              <button
                id="delete-member-btn"
                onClick={() => {
                  onDeleteClick(member.id);
                  onClose();
                }}
                className="text-xs font-semibold text-brand-danger hover:bg-red-50 border border-transparent hover:border-red-200 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Member
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* WhatsApp Send button */}
              {member.status !== 'Cancelled' && (
                <a
                  id="modal-whatsapp-send-btn"
                  href={getWhatsAppRenewUrl(member.phone, member.name, 'GYM-member', member.expiryDate, plan?.name || member.duration)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer"
                  title="Send WhatsApp message to renew plan"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>Send WhatsApp</span>
                </a>
              )}

              <button
                id="edit-member-btn"
                onClick={() => {
                  onEditClick(member.id);
                  onClose();
                }}
                className="bg-white hover:bg-gray-100 border border-brand-border text-xs font-semibold text-brand-text-primary px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Edit className="w-3.5 h-3.5 text-gray-500" />
                Edit Member
              </button>

              {member.status !== 'Cancelled' && (
                <button
                  id="cancel-membership-btn"
                  onClick={() => {
                    onCancelClick(member.id);
                    onClose();
                  }}
                  className="bg-white hover:bg-red-50 border border-brand-border hover:border-red-200 text-xs font-semibold text-brand-danger px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  Cancel Membership
                </button>
              )}

              <button
                id="renew-membership-btn"
                onClick={() => {
                  onRenewClick(member);
                }}
                className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all hover:shadow-md cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Renew Plan
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
