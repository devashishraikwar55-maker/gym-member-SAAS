import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Plus, 
  ArrowUpDown, 
  Filter, 
  RefreshCw, 
  Eye, 
  MoreVertical,
  X,
  Phone,
  UserCheck,
  AlertTriangle,
  UserPlus
} from 'lucide-react';
import { Member, formatDate } from '../types';
import { Avatar } from './Avatar';

interface MembersViewProps {
  members: Member[];
  onNavigate: (view: string) => void;
  onSelectMember: (id: string) => void;
  onRenewClick: (member: Member) => void;
  initialFilter?: 'All' | 'Active' | 'Expiring' | 'Expired';
  onFilterChange?: (filter: FilterStatus) => void;
}

type FilterStatus = 'All' | 'Active' | 'Expiring';
type SortKey = 'name' | 'joiningDate' | 'expiryDate';
type SortOrder = 'asc' | 'desc';

export function MembersView({ 
  members, 
  onNavigate, 
  onSelectMember, 
  onRenewClick,
  initialFilter,
  onFilterChange
}: MembersViewProps) {
  
  const getSafeFilter = (filter?: 'All' | 'Active' | 'Expiring' | 'Expired'): FilterStatus => {
    if (!filter || filter === 'Expired') return 'All';
    return filter;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>(getSafeFilter(initialFilter));
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    if (initialFilter) {
      setStatusFilter(getSafeFilter(initialFilter));
    }
  }, [initialFilter]);

  const handleFilterChange = (filter: FilterStatus) => {
    setStatusFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  // Filter out Cancelled and Expired members from this view because they have their own dedicated sections as requested!
  const activeAndExpiringMembers = members.filter(m => m.status !== 'Cancelled' && m.status !== 'Expired');

  // Handle live filtering
  const filteredMembers = activeAndExpiringMembers.filter((member) => {
    // 1. Search Query Match
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      member.phone.includes(searchQuery);

    // 2. Status Filter Match
    const matchesStatus = 
      statusFilter === 'All' || 
      member.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle sorting
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    let aVal = a[sortKey];
    let bVal = b[sortKey];

    if (sortKey === 'name') {
      aVal = a.name.toLowerCase();
      bVal = b.name.toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div id="members-view-container" className="space-y-6 pb-12">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="hidden md:block">
          <h1 className="text-2xl font-bold text-brand-text-primary tracking-tight">Active Member</h1>
          <p className="text-xs text-brand-text-secondary mt-0.5">Manage details, statuses, and extensions for all gym members.</p>
        </div>
        
        <button
          id="members-add-new-btn"
          onClick={() => onNavigate('add-member')}
          className="bg-brand-primary hover:bg-brand-primary-hover active:scale-[0.98] text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          <UserPlus className="w-4.5 h-4.5 stroke-[2.5]" />
          Add New Member
        </button>
      </div>

      {/* Search and Filters panel */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-2xs flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Bar with animated focus ring */}
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
          <input
            id="members-search-input"
            type="text"
            className="w-full pl-9 pr-8 py-2 border border-brand-border rounded-xl text-xs text-brand-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-gray-50/10 placeholder-gray-400 transition-all"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              id="clear-members-search"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab filters */}
        <div className="flex items-center gap-1.5 self-start md:self-auto overflow-x-auto w-full md:w-auto pb-1 md:pb-0 custom-scrollbar">
          {(['All', 'Active', 'Expiring'] as FilterStatus[]).map((tab) => {
            const count = tab === 'All' 
              ? activeAndExpiringMembers.length 
              : activeAndExpiringMembers.filter(m => m.status === tab).length;

            return (
              <button
                key={tab}
                id={`filter-tab-${tab}`}
                onClick={() => handleFilterChange(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  statusFilter === tab
                    ? 'bg-brand-primary text-white shadow-2xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-brand-text-secondary'
                }`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Sorting labels for desktop / Table layout */}
      <div className="bg-white border border-brand-border rounded-2xl shadow-2xs overflow-hidden">
        {sortedMembers.length > 0 ? (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-brand-border text-brand-text-secondary text-[11px] uppercase font-bold tracking-wider">
                  <th className="px-5 py-3 cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => toggleSort('name')}>
                    <div className="flex items-center gap-1.5">
                      Member Name
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Gender</th>
                  <th className="px-5 py-3 cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => toggleSort('joiningDate')}>
                    <div className="flex items-center gap-1.5">
                      Joining Date
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </th>
                  <th className="px-5 py-3 cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => toggleSort('expiryDate')}>
                    <div className="flex items-center gap-1.5">
                      Expiry Date
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {sortedMembers.map((member, idx) => {
                  const statusStyles = {
                    Active: 'bg-green-50 text-brand-success border border-green-100',
                    Expiring: 'bg-amber-50 text-brand-warning border border-amber-100',
                    Expired: 'bg-red-50 text-brand-danger border border-red-100',
                    Cancelled: 'bg-gray-100 text-brand-text-secondary border border-gray-200'
                  }[member.status];

                  return (
                    <motion.tr
                      key={member.id}
                      id={`member-row-${member.id}`}
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
                      <td className="px-5 py-3.5 text-brand-text-secondary text-xs">{formatDate(member.expiryDate)}</td>
                      
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles}`}>
                          {member.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            id={`quick-view-btn-${member.id}`}
                            onClick={() => onSelectMember(member.id)}
                            className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-brand-text-primary rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            id={`quick-renew-btn-${member.id}`}
                            onClick={() => onRenewClick(member)}
                            className="text-xs font-semibold text-brand-primary hover:bg-indigo-50 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
                          >
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
              <Search className="w-6 h-6" />
            </div>
            <p className="text-base font-bold text-brand-text-primary">No members found</p>
            <p className="text-xs text-brand-text-secondary mt-1">
              {searchQuery ? `We couldn't find any member matching "${searchQuery}".` : 'No members fit the current status filter.'}
            </p>
            <button
              id="empty-members-reset-btn"
              onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}
              className="mt-4 bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
