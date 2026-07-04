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

      {/* Grid of Cancelled Members */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMembers.map((member, idx) => (
            <motion.div
              key={member.id}
              id={`cancelled-card-${member.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              whileHover={{ y: -2, boxShadow: '0 10px 20px -10px rgba(0,0,0,0.08)' }}
              className="bg-white p-5 border border-brand-border rounded-2xl shadow-2xs flex flex-col justify-between gap-4 transition-all"
            >
              {/* Profile identity and history trigger */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grayscale">
                    <Avatar photoUrl={member.profilePhoto} gender={member.gender} name={member.name} size="md" />
                  </div>
                  <div>
                    <button 
                      id={`cancelled-member-name-${member.id}`}
                      onClick={() => onSelectMember(member.id)}
                      className="font-bold text-brand-text-primary hover:text-brand-primary hover:underline text-left text-sm"
                    >
                      {member.name}
                    </button>
                    <p className="text-xs text-brand-text-secondary mt-0.5 font-mono">{member.phone}</p>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold text-slate-400 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                  Inactive
                </span>
              </div>

              {/* History stats info */}
              <div className="flex items-center justify-between text-xs text-brand-text-secondary pt-1 border-t border-gray-50">
                <div className="flex items-center gap-1">
                  <History className="w-3.5 h-3.5 text-gray-400" />
                  <span>{member.history ? member.history.length : 0} past renewal cycles</span>
                </div>
                <span>Joined {formatDate(member.joiningDate)}</span>
              </div>

              {/* Renew triggers */}
              <div className="flex items-center justify-between gap-2.5 pt-2">
                <button
                  id={`cancelled-view-details-${member.id}`}
                  onClick={() => onSelectMember(member.id)}
                  className="px-3.5 py-2 border border-brand-border text-brand-text-secondary hover:text-brand-text-primary hover:bg-gray-50 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  View Details & History
                </button>

                <button
                  id={`cancelled-re-enrol-${member.id}`}
                  onClick={() => onRenewClick(member)}
                  className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer hover:shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Re-Enrol Member
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-brand-border p-12 rounded-2xl shadow-2xs text-center max-w-md mx-auto">
          <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <UserX className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-base font-bold text-brand-text-primary">No cancelled records</p>
          <p className="text-xs text-brand-text-secondary mt-1">
            {searchQuery ? `No cancelled members matched "${searchQuery}".` : 'Excellent! Currently, there are no cancelled memberships in your archive.'}
          </p>
        </div>
      )}
    </div>
  );
}
