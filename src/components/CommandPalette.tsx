import { useState, useEffect, useRef } from 'react';
import { Search, User, Plus, Settings, CreditCard, Bell, Users, X } from 'lucide-react';
import { Member } from '../types';
import { Avatar } from './Avatar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onSelectMember: (id: string) => void;
  onNavigate: (view: string) => void;
}

export function CommandPalette({ isOpen, onClose, members, onSelectMember, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Monitor keys for Ctrl+K
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // Filter members based on name or phone
  const filteredMembers = query.trim() === '' 
    ? [] 
    : members.filter(m => 
        m.name.toLowerCase().includes(query.toLowerCase()) || 
        m.phone.includes(query)
      ).slice(0, 5);

  const quickActions = [
    { id: 'act-add', name: 'Add New Member', icon: Plus, view: 'add-member' },
    { id: 'act-plans', name: 'View Membership Plans', icon: CreditCard, view: 'plans' },
    { id: 'act-reminders', name: 'Open Expiring Membership', icon: Bell, view: 'reminders' },
    { id: 'act-settings', name: 'Open Settings', icon: Settings, view: 'settings' },
  ].filter(action => 
    query.trim() === '' || action.name.toLowerCase().includes(query.toLowerCase())
  );

  const totalItems = filteredMembers.length + quickActions.length;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % totalItems);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (totalItems === 0) return;

        if (selectedIndex < filteredMembers.length) {
          const member = filteredMembers[selectedIndex];
          onSelectMember(member.id);
          onClose();
        } else {
          const actionIndex = selectedIndex - filteredMembers.length;
          const action = quickActions[actionIndex];
          onNavigate(action.view);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, totalItems, filteredMembers, quickActions, onClose, onSelectMember, onNavigate]);

  if (!isOpen) return null;

  return (
    <div 
      id="command-palette-overlay"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
    >
      <div 
        ref={containerRef}
        id="command-palette-container"
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-brand-border overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center px-4 border-b border-brand-border">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            id="command-palette-input"
            type="text"
            className="w-full py-4 text-brand-text-primary placeholder-gray-400 focus:outline-none text-base"
            placeholder="Search members by name, phone or type quick actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button 
              id="clear-palette-search"
              onClick={() => setQuery('')}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md ml-3 font-mono">
            ESC
          </span>
        </div>

        <div id="command-palette-results" className="max-h-[350px] overflow-y-auto p-2 custom-scrollbar">
          {/* Members list */}
          {filteredMembers.length > 0 && (
            <div className="mb-2">
              <div className="text-xs font-semibold text-brand-text-secondary px-3 py-2 uppercase tracking-wider">
                Active Member
              </div>
              <div className="space-y-0.5">
                {filteredMembers.map((member, idx) => {
                  const isSelected = idx === selectedIndex;
                  const statusColors = {
                    Active: 'bg-green-50 text-brand-success border border-green-100',
                    Expiring: 'bg-amber-50 text-brand-warning border border-amber-100',
                    Expired: 'bg-red-50 text-brand-danger border border-red-100',
                    Cancelled: 'bg-gray-100 text-brand-text-secondary border border-gray-200'
                  }[member.status];

                  return (
                    <button
                      key={member.id}
                      id={`palette-member-${member.id}`}
                      onClick={() => {
                        onSelectMember(member.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-indigo-50 text-brand-primary' 
                          : 'hover:bg-gray-50 text-brand-text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar photoUrl={member.profilePhoto} gender={member.gender} name={member.name} size="sm" />
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-brand-text-secondary">{member.phone}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors}`}>
                        {member.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-brand-text-secondary px-3 py-2 uppercase tracking-wider">
                Quick Actions
              </div>
              <div className="space-y-0.5">
                {quickActions.map((action, idx) => {
                  const actualIdx = filteredMembers.length + idx;
                  const isSelected = actualIdx === selectedIndex;
                  const Icon = action.icon;

                  return (
                    <button
                      key={action.id}
                      id={`palette-action-${action.id}`}
                      onClick={() => {
                        onNavigate(action.view);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-indigo-50 text-brand-primary' 
                          : 'hover:bg-gray-50 text-brand-text-primary'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                        <Icon className="w-4 h-4 text-gray-500 group-hover:text-brand-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{action.name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {totalItems === 0 && (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Users className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm font-medium text-brand-text-primary">No results found</p>
              <p className="text-xs text-brand-text-secondary mt-1">
                {query ? `We couldn't find anything matching "${query}"` : 'Type something to search'}
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-4 py-2.5 border-t border-brand-border flex items-center justify-between text-xs text-brand-text-secondary">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded shadow-2xs font-mono">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded shadow-2xs font-mono">Enter</kbd>
              Select
            </span>
          </div>
          <div>
            Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded shadow-2xs font-mono">Esc</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
}
