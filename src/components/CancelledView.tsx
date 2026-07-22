import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  UserX, 
  Search, 
  X, 
  RefreshCw, 
  Eye, 
  AlertTriangle,
  History,
  FileText
} from 'lucide-react';
import { Member, formatDate } from '../types';
import { Avatar } from './Avatar';

interface CancelledViewProps {
  members: Member[];
  onSelectMember: (id: string) => void;
  onRenewClick: (member: Member) => void;
}

export function CancelledView({ 
  members, 
  onSelectMember, 
  onRenewClick 
}: CancelledViewProps) {
  
  const [searchQuery, setSearchQuery] = useState('');

  // Extract only cancelled members
  const cancelledMembers = members.filter(m => m.status === 'Cancelled');

  const filteredMembers = cancelledMembers.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.phone.includes(searchQuery)
  );

  return (
    <div id="cancelled-view-container" className="space-y-6 pb-12">
      {/* Header */}
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold text-brand-text-primary tracking-tight">Cancelled Members</h1>
        <p className="text-xs text-brand-text-secondary mt-0.5">Archive list of inactive members. Review histories, exit reasons, and initiate quick re-enrolments.</p>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-4 border border-brand-border rounded-2xl shadow-2xs flex items-center justify-between">
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
          <input
            id="cancelled-search-input"
            type="text"
            className="w-full pl-9 pr-8 py-2 border border-brand-border rounded-xl text-xs text-brand-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-gray-50/10 placeholder-gray-400"
            placeholder="Search cancelled members by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              id="clear-cancelled-search"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <span className="text-xs text-brand-text-secondary font-medium">{filteredMembers.length} records</span>
      </div>

      {/* Table matching MembersView and ReminderCenterView style */}
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
                {filteredMembers.map((member, idx) => (
                  <motion.tr
                    key={member.id}
                    id={`cancelled-row-${member.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.4) }}
                    className="text-sm hover:bg-indigo-50/20 hover:scale-[1.008] hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 transform-gpu cursor-pointer group"
                    onClick={() => onSelectMember(member.id)}
                  >
                    <td className="px-5 py-3.5 flex items-center gap-3">
                      <div className="grayscale opacity-75 group-hover:grayscale-0 transition-all">
                        <Avatar photoUrl={member.profilePhoto} gender={member.gender} name={member.name} size="sm" />
                      </div>
                      <div>
                        <span className="font-semibold text-brand-text-primary group-hover:text-brand-primary transition-colors duration-200 block">{member.name}</span>
                        <span className="text-[10px] text-brand-text-secondary mt-0.5 font-medium">{member.duration} Plan</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-brand-text-secondary font-mono text-xs">{member.phone}</td>
                    <td className="px-5 py-3.5 text-brand-text-secondary text-xs">{member.gender}</td>
                    <td className="px-5 py-3.5 text-brand-text-secondary text-xs">{formatDate(member.joiningDate)}</td>
                    <td className="px-5 py-3.5 text-brand-text-secondary text-xs">{formatDate(member.expiryDate)}</td>

                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-brand-text-secondary border border-gray-200">
                        Cancelled
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          id={`cancelled-quick-view-btn-${member.id}`}
                          onClick={() => onSelectMember(member.id)}
                          className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-brand-text-primary rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          id={`cancelled-quick-re-enrol-btn-${member.id}`}
                          onClick={() => onRenewClick(member)}
                          className="text-xs font-semibold text-brand-primary hover:bg-indigo-50 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Re-Enrol
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center max-w-md mx-auto">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <UserX className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-base font-bold text-brand-text-primary">No cancelled records</p>
            <p className="text-xs text-brand-text-secondary mt-1">
              {searchQuery ? `No cancelled members matched "${searchQuery}".` : 'Excellent! Currently, there are no cancelled memberships in your archive.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
