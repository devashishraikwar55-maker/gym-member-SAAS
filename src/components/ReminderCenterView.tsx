import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  RefreshCw, 
  Clock, 
  Eye, 
  Search, 
  X,
  MessageCircle
} from 'lucide-react';
import { Member, SystemSettings, CURRENT_DATE_STR, getDaysDiff, formatDate } from '../types';
import { Avatar } from './Avatar';
import { getWhatsAppRenewUrl } from '../utils/whatsapp';

interface ReminderCenterViewProps {
  members: Member[];
  settings: SystemSettings;
  onSelectMember: (id: string) => void;
  onRenewClick: (member: Member) => void;
  onCopySuccess?: (msg: string) => void;
  initialCategory?: string;
  onCategoryChange?: (cat: any) => void;
}

export function ReminderCenterView({ 
  members, 
  settings,
  onSelectMember, 
  onRenewClick
}: ReminderCenterViewProps) {

  const [searchQuery, setSearchQuery] = useState('');

  // Exclude Cancelled members
  const activeReminderMembers = members.filter(m => m.status !== 'Cancelled');

  // Filter members expiring soon or already expired, sorted by nearest expiry
  const expiringMembers = activeReminderMembers
    .map(m => ({
      member: m,
      daysDiff: getDaysDiff(CURRENT_DATE_STR, m.expiryDate)
    }))
    .filter(item => item.daysDiff <= 30) // expiring within 30 days or expired
    .sort((a, b) => a.daysDiff - b.daysDiff);

  const filteredMembers = expiringMembers.filter(({ member }) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.phone.includes(searchQuery)
  );

  return (
    <div id="reminder-center-container" className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-text-primary tracking-tight">Expiring Membership</h1>
        <p className="text-xs text-brand-text-secondary mt-0.5">Manage and track members with upcoming or past membership expiries.</p>
      </div>

      {/* Search and Records Header */}
      <div className="bg-white p-4 border border-brand-border rounded-2xl shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
          <input
            id="expiring-search-input"
            type="text"
            className="w-full pl-9 pr-8 py-2 border border-brand-border rounded-xl text-xs text-brand-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-gray-50/10 placeholder-gray-400"
            placeholder="Search expiring members by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              id="clear-expiring-search"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <span className="text-xs text-brand-text-secondary font-medium">{filteredMembers.length} records</span>
      </div>

      {/* Table matching MembersView and CancelledView style */}
      <div className="bg-white border border-brand-border rounded-2xl shadow-2xs overflow-hidden">
        {filteredMembers.length > 0 ? (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-brand-border text-brand-text-secondary text-[11px] uppercase font-bold tracking-wider">
                  <th className="px-5 py-3">Member Name</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Gender</th>
                  <th className="px-5 py-3">Joining Date</th>
                  <th className="px-5 py-3">Expiry Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filteredMembers.map(({ member, daysDiff }, idx) => {
                  const statusStyles = {
                    Active: 'bg-green-50 text-brand-success border border-green-100',
                    Expiring: 'bg-amber-50 text-brand-warning border border-amber-100',
                    Expired: 'bg-red-50 text-brand-danger border border-red-100',
                    Cancelled: 'bg-gray-100 text-brand-text-secondary border border-gray-200'
                  }[member.status];

                  return (
                    <motion.tr
                      key={member.id}
                      id={`expiring-row-${member.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.4) }}
                      className="text-sm hover:bg-indigo-50/20 hover:scale-[1.008] hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 transform-gpu cursor-pointer group"
                      onClick={() => onSelectMember(member.id)}
                    >
                      <td className="px-5 py-3.5 flex items-center gap-3">
                        <Avatar photoUrl={member.profilePhoto} gender={member.gender} name={member.name} size="sm" />
                        <div>
                          <span className="font-semibold text-brand-text-primary group-hover:text-brand-primary transition-colors duration-200 block">{member.name}</span>
                          <span className="text-[10px] text-brand-text-secondary mt-0.5 font-medium">{member.duration} Plan</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-brand-text-secondary font-mono text-xs">{member.phone}</td>
                      <td className="px-5 py-3.5 text-brand-text-secondary text-xs">{member.gender}</td>
                      <td className="px-5 py-3.5 text-brand-text-secondary text-xs">{formatDate(member.joiningDate)}</td>
                      <td className="px-5 py-3.5 text-brand-text-secondary text-xs">
                        <span className="font-medium text-slate-900 block">{formatDate(member.expiryDate)}</span>
                        {daysDiff < 0 ? (
                          <span className="text-[10px] text-rose-600 font-bold">{Math.abs(daysDiff)}d overdue</span>
                        ) : daysDiff === 0 ? (
                          <span className="text-[10px] text-red-600 font-bold">Expires today</span>
                        ) : (
                          <span className="text-[10px] text-amber-600 font-bold">{daysDiff}d remaining</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles}`}>
                          {member.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                          {/* Send WhatsApp Renewal Button */}
                          <a
                            id={`expiring-whatsapp-send-${member.id}`}
                            href={getWhatsAppRenewUrl(member.phone, member.name, settings?.gymName, member.expiryDate, member.duration)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 border border-emerald-200/80 transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                            title="Send WhatsApp message to renew plan"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                            <span>Send</span>
                          </a>

                          <button
                            id={`expiring-quick-view-btn-${member.id}`}
                            onClick={() => onSelectMember(member.id)}
                            className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-brand-text-primary rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            id={`expiring-quick-renew-btn-${member.id}`}
                            onClick={() => onRenewClick(member)}
                            className="text-xs font-semibold text-brand-primary hover:bg-indigo-50 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Renew
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center max-w-md mx-auto">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-base font-bold text-brand-text-primary">No expiring members found</p>
            <p className="text-xs text-brand-text-secondary mt-1">
              {searchQuery ? `No expiring members match "${searchQuery}".` : 'All active members have plenty of time remaining.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
