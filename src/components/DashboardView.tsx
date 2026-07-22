import { motion } from 'motion/react';
import { 
  Users, 
  UserCheck, 
  BellRing, 
  UserMinus, 
  AlertTriangle, 
  Activity, 
  Plus, 
  RefreshCw, 
  Calendar, 
  CreditCard, 
  ChevronRight, 
  HelpCircle,
  Clock,
  Search,
  Sparkles
} from 'lucide-react';
import { Member, ActivityLog, CURRENT_DATE_STR, formatDate } from '../types';
import { Avatar } from './Avatar';
import { ChildlikeCalendar } from './ChildlikeCalendar';

interface DashboardViewProps {
  members: Member[];
  activityLogs: ActivityLog[];
  ownerName?: string;
  onNavigate: (view: string) => void;
  onSelectMember: (id: string) => void;
  onRenewClick: (member: Member) => void;
  onStatClick?: (statId: string) => void;
  onSearchClick?: () => void;
  onOpenOnboarding?: () => void;
}

export function DashboardView({ 
  members, 
  activityLogs, 
  ownerName = 'Admin',
  onNavigate, 
  onSelectMember,
  onRenewClick,
  onStatClick,
  onSearchClick,
  onOpenOnboarding
}: DashboardViewProps) {
  
  // Statistics Calculations
  const totalCount = members.length;
  const activeCount = members.filter(m => m.status === 'Active').length;
  const expiringCount = members.filter(m => m.status === 'Expiring').length;
  const expiredCount = members.filter(m => m.status === 'Expired').length;
  const cancelledCount = members.filter(m => m.status === 'Cancelled').length;

  // Real dynamic Monthly Revenue calculation (summing paid fees for active & expiring plans)
  const monthlyRevenue = members
    .filter(m => (m.status === 'Active' || m.status === 'Expiring') && m.paymentStatus === 'Paid')
    .reduce((sum, m) => sum + m.membershipFee, 0);

  // Active Members & Expiring Lists
  const recentMembers = [...members]
    .sort((a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime())
    .slice(0, 5);

  const expiringSoon = members
    .filter(m => m.status === 'Expiring')
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  // Calculations for quick activity logging formatting
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'joined':
        return <Plus className="w-3.5 h-3.5 text-[#22C55E]" />;
      case 'renewed':
        return <RefreshCw className="w-3.5 h-3.5 text-[#6C63FF] animate-spin-slow" />;
      case 'cancelled':
        return <UserMinus className="w-3.5 h-3.5 text-[#EF4444]" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-[#6C63FF]" />;
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case 'joined':
        return 'bg-green-50 border border-green-100/50';
      case 'renewed':
        return 'bg-[#6C63FF]/10 border border-[#6C63FF]/20';
      case 'cancelled':
        return 'bg-red-50 border border-red-100/50';
      default:
        return 'bg-gray-50 border border-gray-100';
    }
  };

  return (
    <div id="dashboard-view-container" className="space-y-8 pb-12">
      {/* 1. Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#1F2937] tracking-tight">Welcome back, {ownerName} 👋</h1>
          <p className="text-sm text-[#6B7280]">
            You have {expiringSoon.length} memberships expiring in the next 7 days.
          </p>
        </div>
        
        {/* Header Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSearchClick}
            id="dashboard-search-trigger-btn"
            className="flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-50 border border-[#ECEEF3] rounded-2xl shadow-xs text-[#6B7280] hover:text-brand-primary active:scale-95 transition-all cursor-pointer"
            title="Search Members (Ctrl+K)"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Statistics Grid (Geometric Balance Style - exactly like reference images) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { id: 'stat-active', label: 'Active', count: activeCount.toString(), icon: UserCheck, color: 'text-blue-500 bg-blue-50 border border-blue-100/30' },
          { id: 'stat-expiring', label: 'Expiring Soon', count: expiringCount.toString(), icon: Clock, color: 'text-teal-600 bg-teal-50 border border-teal-100/30' },
          { id: 'stat-expired', label: 'Expired', count: expiredCount.toString(), icon: AlertTriangle, color: 'text-red-500 bg-red-50 border border-red-100/30' },
          { id: 'stat-total', label: 'Total Members', count: totalCount.toString(), icon: Users, color: 'text-indigo-600 bg-indigo-50 border border-indigo-100/30' },
          { id: 'stat-revenue', label: 'Monthly Revenue', count: `₹${monthlyRevenue.toLocaleString()}`, icon: CreditCard, color: 'text-purple-600 bg-purple-50 border border-purple-100/30' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.id}
              id={stat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileHover={{ 
                y: -5, 
                scale: 1.02,
                boxShadow: '0 12px 24px -8px rgba(108, 99, 255, 0.18), 0 4px 12px -2px rgba(0, 0, 0, 0.04)'
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStatClick?.(stat.id)}
              role="button"
              className="bg-white p-6 rounded-[20px] border border-[#ECEEF3] hover:border-[#6C63FF]/50 shadow-xs flex flex-col justify-between transform-gpu cursor-pointer group"
            >
              <div className="space-y-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-3xl font-black text-[#1F2937] tracking-tight group-hover:text-brand-primary transition-colors duration-200">{stat.count}</p>
                  <p className="mt-1 text-xs font-semibold text-[#8C94A0] tracking-wide">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>



      {/* 4. Dashboard Core Bento-Grid Layout (Bespoke Geometric Balancing) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: List Views (Col-span 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Expiring Soon Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                Expiring Soon (Next 7 Days)
              </h3>
              <button
                id="view-all-expiring-btn"
                onClick={() => onNavigate('reminders')}
                className="text-xs text-[#6C63FF] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
              >
                Expiring Membership
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white border border-[#ECEEF3] rounded-[24px] shadow-sm divide-y divide-[#ECEEF3] overflow-hidden">
              {expiringSoon.length > 0 ? (
                expiringSoon.slice(0, 4).map((member) => (
                  <div 
                    key={member.id}
                    id={`expiring-row-${member.id}`}
                    className="p-5 flex items-center justify-between text-sm hover:bg-indigo-50/20 hover:scale-[1.008] hover:-translate-y-0.5 hover:shadow-2xs transition-all duration-200 transform-gpu cursor-pointer group"
                    onClick={() => onSelectMember(member.id)}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar photoUrl={member.profilePhoto} gender={member.gender} name={member.name} size="md" />
                      <div>
                        <button 
                          id={`expiring-member-link-${member.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectMember(member.id);
                          }}
                          className="font-bold text-[#1F2937] group-hover:text-[#6C63FF] hover:underline text-left transition-colors duration-200"
                        >
                          {member.name}
                        </button>
                        <p className="text-xs text-[#6B7280] mt-0.5">{member.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <span className="text-[11px] text-[#6B7280] block uppercase tracking-wide font-medium">Expires On</span>
                        <span className="font-semibold text-[#1F2937] text-xs mt-0.5 block">{formatDate(member.expiryDate)}</span>
                      </div>
                      
                      <div className="text-right flex items-center gap-3">
                        <span className="text-[10px] uppercase font-bold text-[#F59E0B] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                          {member.expiryDate === CURRENT_DATE_STR ? 'Today' : 'Soon'}
                        </span>
                        <button
                          id={`renew-expiring-row-btn-${member.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRenewClick(member);
                          }}
                          className="text-xs font-bold text-[#6C63FF] hover:text-white bg-[#6C63FF]/10 hover:bg-[#6C63FF] px-3.5 py-2 rounded-xl transition-all active:scale-95 cursor-pointer shadow-2xs"
                        >
                          Renew
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center">
                  <p className="text-sm font-bold text-[#1F2937]">All memberships clear! 👍</p>
                  <p className="text-xs text-[#6B7280] mt-1">No memberships are expiring in the next 7 days.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Members Table Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                Recently Registered Members
              </h3>
              <button
                id="view-all-members-btn"
                onClick={() => onNavigate('members')}
                className="text-xs text-[#6C63FF] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
              >
                Manage All
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white border border-[#ECEEF3] rounded-[24px] shadow-sm overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFC] border-b border-[#ECEEF3] text-[#6B7280] text-[11px] uppercase font-bold tracking-wider">
                      <th className="px-6 py-4">Member Name</th>
                      <th className="px-6 py-4">Phone</th>
                      <th className="px-6 py-4">Plan</th>
                      <th className="px-6 py-4">Start Date</th>
                      <th className="px-6 py-4">Expiry Date</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECEEF3]">
                    {recentMembers.map((member) => {
                      const statusStyles = {
                        Active: 'bg-green-50 text-[#22C55E] border border-green-100',
                        Expiring: 'bg-amber-50 text-[#F59E0B] border border-amber-100',
                        Expired: 'bg-red-50 text-[#EF4444] border border-red-100',
                        Cancelled: 'bg-gray-100 text-[#6B7280] border border-gray-200'
                      }[member.status];

                      return (
                        <tr 
                          key={member.id} 
                          id={`recent-member-row-${member.id}`}
                          className="text-sm hover:bg-indigo-50/20 hover:scale-[1.005] transition-all duration-200 transform-gpu cursor-pointer group"
                          onClick={() => onSelectMember(member.id)}
                        >
                          <td className="px-6 py-4.5 flex items-center gap-3">
                            <Avatar photoUrl={member.profilePhoto} gender={member.gender} name={member.name} size="sm" />
                            <span className="font-bold text-[#1F2937] group-hover:text-[#6C63FF] transition-colors duration-200">{member.name}</span>
                          </td>
                          <td className="px-6 py-4.5 text-[#6B7280] font-mono text-xs">{member.phone}</td>
                          <td className="px-6 py-4.5 text-[#1F2937] font-semibold">{member.duration}</td>
                          <td className="px-6 py-4.5 text-[#6B7280] text-xs">{formatDate(member.joiningDate)}</td>
                          <td className="px-6 py-4.5 text-[#6B7280] text-xs">{formatDate(member.expiryDate)}</td>
                          <td className="px-6 py-4.5 text-right">
                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${statusStyles}`}>
                              {member.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Childlike Gym Tracker Calendar */}
        <div className="space-y-4">
          <ChildlikeCalendar 
            members={members}
            onSelectMember={onSelectMember}
          />
        </div>

      </div>
    </div>
  );
}
