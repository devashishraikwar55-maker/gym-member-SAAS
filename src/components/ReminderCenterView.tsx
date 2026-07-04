import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Bell, 
  Copy, 
  Check, 
  MessageSquare, 
  RefreshCw, 
  Calendar, 
  User, 
  Clock, 
  AlertTriangle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Member, SystemSettings, CURRENT_DATE_STR, getDaysDiff, formatDate } from '../types';
import { Avatar } from './Avatar';

interface ReminderCenterViewProps {
  members: Member[];
  settings: SystemSettings;
  onSelectMember: (id: string) => void;
  onRenewClick: (member: Member) => void;
  onCopySuccess: (msg: string) => void;
  initialCategory?: ReminderCategory;
  onCategoryChange?: (category: ReminderCategory) => void;
}

type ReminderCategory = 'today' | '3days' | '7days' | 'expired';

export function ReminderCenterView({ 
  members, 
  settings, 
  onSelectMember, 
  onRenewClick,
  onCopySuccess,
  initialCategory,
  onCategoryChange
}: ReminderCenterViewProps) {
  
  const [activeCategory, setActiveCategory] = useState<ReminderCategory>(initialCategory || 'today');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync activeCategory with initialCategory when it changes
  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  const handleCategoryChange = (category: ReminderCategory) => {
    setActiveCategory(category);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  // Exclude Cancelled members from active reminders
  const activeReminderMembers = members.filter(m => m.status !== 'Cancelled');

  // Categorize members based on day diff relative to July 4, 2026
  const getCategorizedMembers = () => {
    const today: Member[] = [];
    const in3Days: Member[] = [];
    const in7Days: Member[] = [];
    const expired: Member[] = [];

    activeReminderMembers.forEach((m) => {
      const diff = getDaysDiff(CURRENT_DATE_STR, m.expiryDate);
      
      if (diff < 0) {
        expired.push(m);
      } else if (diff === 0) {
        today.push(m);
      } else if (diff > 0 && diff <= 3) {
        in3Days.push(m);
      } else if (diff > 3 && diff <= 7) {
        in7Days.push(m);
      }
    });

    return { today, '3days': in3Days, '7days': in7Days, expired };
  };

  const categories = getCategorizedMembers();
  const currentCategoryMembers = categories[activeCategory];

  // Message generation helper
  const getReminderMessage = (member: Member, category: ReminderCategory) => {
    let template = '';
    switch (category) {
      case 'today':
        template = settings.reminderTemplates.expiringToday;
        break;
      case '3days':
        template = settings.reminderTemplates.expiring3Days;
        break;
      case '7days':
        template = settings.reminderTemplates.expiring7Days;
        break;
      case 'expired':
        template = `Hi {name}, your Apex Fitness Club membership expired on {date}. We miss seeing you around! Renew today to continue your fitness journey.`;
        break;
    }

    return template
      .replace('{name}', member.name)
      .replace('{date}', formatDate(member.expiryDate));
  };

  const handleCopyMessage = (member: Member, category: ReminderCategory) => {
    const text = getReminderMessage(member, category);
    navigator.clipboard.writeText(text);
    setCopiedId(member.id);
    onCopySuccess(`Reminder message for ${member.name} copied to clipboard!`);
    
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  // Open direct WhatsApp web if desired
  const handleOpenWhatsApp = (member: Member, category: ReminderCategory) => {
    const text = encodeURIComponent(getReminderMessage(member, category));
    // Clean phone number (removing any spaces/dashes)
    const cleanPhone = member.phone.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${text}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div id="reminder-center-container" className="space-y-6 pb-12">
      {/* View Header */}
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold text-brand-text-primary tracking-tight">Expiring Membership</h1>
        <p className="text-xs text-brand-text-secondary mt-0.5">Automate member follow-ups. Select lists, copy messages, and manage renewals.</p>
      </div>

      {/* Grid Categories Selector (Custom modern tabs) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-2 border border-brand-border rounded-2xl shadow-2xs">
        {[
          { id: 'today', label: 'Expiring Today', count: categories.today.length, badge: 'bg-red-100 text-brand-danger' },
          { id: '3days', label: 'Expiring in 3 Days', count: categories['3days'].length, badge: 'bg-amber-100 text-brand-warning' },
          { id: '7days', label: 'Expiring in 7 Days', count: categories['7days'].length, badge: 'bg-indigo-50 text-brand-primary' },
          { id: 'expired', label: 'Expired Members', count: categories.expired.length, badge: 'bg-rose-100 text-brand-danger' },
        ].map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`reminder-tab-${cat.id}`}
              onClick={() => handleCategoryChange(cat.id as ReminderCategory)}
              className={`p-3 rounded-xl transition-all text-left flex flex-col justify-between h-[80px] cursor-pointer ${
                isActive 
                  ? 'bg-brand-sidebar text-white shadow-md font-semibold' 
                  : 'bg-gray-50 hover:bg-gray-100 text-brand-text-primary'
              }`}
            >
              <span className={`text-[10px] uppercase tracking-wider font-semibold ${isActive ? 'text-slate-400' : 'text-brand-text-secondary'}`}>
                {cat.label}
              </span>
              <div className="flex items-center justify-between w-full mt-2">
                <span className="text-xl font-bold tracking-tight">{cat.count}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-indigo-500/30 text-indigo-200' : cat.badge}`}>
                  Members
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Reminder Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-brand-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-brand-primary" />
            Reminders for {
              {
                today: 'Members Expiring Today',
                '3days': 'Members Expiring in 3 Days',
                '7days': 'Members Expiring in 7 Days',
                expired: 'Members Currently Expired'
              }[activeCategory]
            }
          </h3>
          <span className="text-xs text-brand-text-secondary font-medium">{currentCategoryMembers.length} records</span>
        </div>

        {currentCategoryMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentCategoryMembers.map((member) => {
              const diff = getDaysDiff(CURRENT_DATE_STR, member.expiryDate);
              const isCopied = copiedId === member.id;

              return (
                <motion.div
                  key={member.id}
                  id={`reminder-card-${member.id}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  whileHover={{ y: -2, boxShadow: '0 10px 20px -10px rgba(0,0,0,0.08)' }}
                  className="bg-white p-5 rounded-2xl border border-brand-border shadow-2xs flex flex-col justify-between gap-4 transition-all"
                >
                  {/* Top: Identity */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar photoUrl={member.profilePhoto} gender={member.gender} name={member.name} size="md" />
                      <div>
                        <button 
                          id={`reminder-name-btn-${member.id}`}
                          onClick={() => onSelectMember(member.id)}
                          className="font-bold text-brand-text-primary hover:text-brand-primary hover:underline text-left text-sm"
                        >
                          {member.name}
                        </button>
                        <p className="text-xs text-brand-text-secondary mt-0.5 font-mono">{member.phone}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      {diff === 0 ? (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-red-100 text-brand-danger rounded-full">
                          Expires Today
                        </span>
                      ) : diff < 0 ? (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-red-50 text-brand-danger rounded-full">
                          {Math.abs(diff)} Days Overdue
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-amber-100 text-brand-warning rounded-full">
                          {diff} Days Left
                        </span>
                      )}
                      <p className="text-[10px] text-brand-text-secondary mt-1 font-medium">{member.duration} Plan</p>
                    </div>
                  </div>

                  {/* Middle: Preview Reminder Text */}
                  <div className="bg-gray-50/70 p-3 rounded-xl border border-brand-border text-xs text-brand-text-secondary leading-relaxed">
                    <span className="font-semibold text-brand-text-primary text-[10px] block uppercase tracking-wider mb-1">
                      Reminder Message Preview:
                    </span>
                    "{getReminderMessage(member, activeCategory)}"
                  </div>

                  {/* Bottom: Action Grid */}
                  <div className="flex items-center justify-between gap-2.5 pt-1">
                    <div className="flex items-center gap-1.5">
                      {/* Copy action */}
                      <button
                        id={`copy-rem-btn-${member.id}`}
                        onClick={() => handleCopyMessage(member, activeCategory)}
                        className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                          isCopied 
                            ? 'bg-green-50 border-green-200 text-brand-success' 
                            : 'bg-white border-brand-border text-brand-text-secondary hover:bg-gray-50'
                        }`}
                        title="Copy text message"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {isCopied ? 'Copied' : 'Copy'}
                      </button>

                      {/* WhatsApp action */}
                      <button
                        id={`whatsapp-rem-btn-${member.id}`}
                        onClick={() => handleOpenWhatsApp(member, activeCategory)}
                        className="p-2 bg-green-50/50 hover:bg-green-50 border border-green-100 rounded-xl text-xs font-semibold text-green-600 flex items-center gap-1 transition-all cursor-pointer"
                        title="Send via WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        WhatsApp
                      </button>
                    </div>

                    <button
                      id={`renew-rem-btn-${member.id}`}
                      onClick={() => onRenewClick(member)}
                      className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Renew Membership
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-brand-border p-12 rounded-2xl shadow-2xs text-center max-w-md mx-auto">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
              <Check className="w-6 h-6 text-brand-success stroke-[2.5]" />
            </div>
            <p className="text-base font-bold text-brand-text-primary">All caught up! 🎉</p>
            <p className="text-xs text-brand-text-secondary mt-1">
              No members require follow-ups in this specific category. Well done keeping track!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
