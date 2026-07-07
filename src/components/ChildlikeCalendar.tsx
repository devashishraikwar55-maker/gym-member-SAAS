import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ArrowRight, 
  X, 
  RotateCcw,
  Check
} from 'lucide-react';
import { Member, formatDate } from '../types';
import { Avatar } from './Avatar';

interface ChildlikeCalendarProps {
  members: Member[];
  onSelectMember: (id: string) => void;
}

type CalendarMode = 'all' | 'active' | 'expiring' | 'expired';

export function ChildlikeCalendar({ members, onSelectMember }: ChildlikeCalendarProps) {
  // Defaulting to July 2026 to match mock data
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-07-01'));
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-07-01');
  const [mode, setMode] = useState<CalendarMode>('all');
  
  // Member stay timeline states (modal)
  const [activeTimelineMember, setActiveTimelineMember] = useState<Member | null>(null);
  const [timelineMonthOffset, setTimelineMonthOffset] = useState<number>(0);
  const [timelinePlayKey, setTimelinePlayKey] = useState<number>(0);

  // Sync initial date selection with actual joining date of first member to make it interactive
  useEffect(() => {
    if (members.length > 0) {
      const targetMember = members.find(m => m.joiningDate.startsWith('2026-07')) || members[0];
      setSelectedDateStr(targetMember.joiningDate);
      setCurrentDate(new Date(targetMember.joiningDate));
    }
  }, [members]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper date calculators
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => {
    const d = new Date(y, m, 1).getDay(); // 0 is Sun, 1 is Mon...
    // Map Sunday (0) to 6, Monday (1) to 0, Tuesday (2) to 1, etc.
    return d === 0 ? 6 : d - 1;
  };

  const totalDays = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const getYYYYMMDD = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Get lists of events for a specific date
  const getActiveStarters = (dateStr: string) => {
    return members.filter(m => m.joiningDate === dateStr && m.status !== 'Cancelled');
  };

  const getExpiredMembers = (dateStr: string) => {
    return members.filter(m => m.status === 'Expired' && m.expiryDate === dateStr);
  };

  const getExpiringSoonMembers = (dateStr: string) => {
    return members.filter(m => m.status === 'Expiring' && m.expiryDate === dateStr);
  };

  // Check if a date has activity based on selected filter
  const getDateActivity = (dateStr: string) => {
    const activeCount = getActiveStarters(dateStr).length;
    const expiredCount = getExpiredMembers(dateStr).length;
    const expiringCount = getExpiringSoonMembers(dateStr).length;

    return {
      hasActive: activeCount > 0,
      hasExpired: expiredCount > 0,
      hasExpiring: expiringCount > 0,
      activeCount,
      expiredCount,
      expiringCount
    };
  };

  // List of filtered activities on the currently selected date
  const getSelectedDateActivities = () => {
    const list: Array<{ member: Member; type: 'joined' | 'expired' | 'expiring' }> = [];
    
    if (mode === 'all' || mode === 'active') {
      getActiveStarters(selectedDateStr).forEach(m => {
        list.push({ member: m, type: 'joined' });
      });
    }
    
    if (mode === 'all' || mode === 'expired') {
      getExpiredMembers(selectedDateStr).forEach(m => {
        list.push({ member: m, type: 'expired' });
      });
    }

    if (mode === 'all' || mode === 'expiring') {
      getExpiringSoonMembers(selectedDateStr).forEach(m => {
        list.push({ member: m, type: 'expiring' });
      });
    }

    return list;
  };

  const selectedDateActivities = getSelectedDateActivities();

  // Generate grid cells to display days from previous, current, and next month
  const generateGridDays = () => {
    const grid = [];
    
    // Days from previous month
    const prevMonthDate = new Date(year, month - 1, 1);
    const prevMonthDays = getDaysInMonth(prevMonthDate.getFullYear(), prevMonthDate.getMonth());
    
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      grid.push({
        dayNum: d,
        dateStr: getYYYYMMDD(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), d),
        isCurrentMonth: false
      });
    }
    
    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      grid.push({
        dayNum: d,
        dateStr: getYYYYMMDD(year, month, d),
        isCurrentMonth: true
      });
    }
    
    // Days of next month to complete standard 42-cell calendar grid
    const nextMonthDate = new Date(year, month + 1, 1);
    const nextDaysCount = 42 - grid.length;
    for (let d = 1; d <= nextDaysCount; d++) {
      grid.push({
        dayNum: d,
        dateStr: getYYYYMMDD(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), d),
        isCurrentMonth: false
      });
    }
    
    return grid;
  };

  const gridDays = generateGridDays();

  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNamesUppercase = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  // Open stay duration modal for a member
  const openStayTimeline = (member: Member) => {
    setActiveTimelineMember(member);
    setTimelineMonthOffset(0);
    setTimelinePlayKey(prev => prev + 1);
  };

  const getStayMetrics = (member: Member) => {
    const start = new Date(member.joiningDate);
    const end = new Date(member.expiryDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let months = 0;
    if (member.duration.toLowerCase().includes('month')) {
      months = parseInt(member.duration) || 1;
    } else {
      months = Math.round(diffDays / 30.4);
    }
    
    return {
      days: diffDays,
      months: months || 1,
      startFormatted: formatDate(member.joiningDate),
      endFormatted: formatDate(member.expiryDate)
    };
  };

  // Statistics for top cards
  const totalActiveInGym = members.filter(m => m.status === 'Active' || m.status === 'Expiring').length;
  const totalGymMembers = members.length;

  return (
    <div className="space-y-6" id="childlike-calendar-container">
      
      {/* 1. Main Calendar Card matching exact June 2025 minimalist aesthetic */}
      <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all duration-300 relative">
        
        {/* Month Header and Navigation Control */}
        <div className="flex items-center justify-between pb-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {monthNamesEn[month]} {year}
            </h2>
          </div>

          {/* Minimalist Prev/Next Navigation Controls */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 p-1 rounded-2xl">
            <button 
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white active:scale-95 transition-all cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button 
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white active:scale-95 transition-all cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Dual Statistics Rows (Your Streak / Streak Activities style) */}
        <div className="flex gap-12 pb-6 pt-1">
          <div>
            <p className="text-xs font-semibold text-slate-400 tracking-tight">Active Members</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {totalActiveInGym} <span className="text-xs font-medium text-slate-500">Currently</span>
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 tracking-tight">Total Registrations</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {totalGymMembers} <span className="text-xs font-medium text-slate-500">Members</span>
            </p>
          </div>
        </div>

        {/* Dynamic Category Pill Tabs for Filter */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
          {[
            { id: 'all', label: 'All Events', color: 'bg-slate-900 text-white shadow-xs' },
            { id: 'active', label: 'Active', color: 'bg-blue-600 text-white shadow-xs' },
            { id: 'expired', label: 'Expired', color: 'bg-red-600 text-white shadow-xs' },
            { id: 'expiring', label: 'Expiring', color: 'bg-amber-500 text-white shadow-xs' }
          ].map((tab) => {
            const isActive = mode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id as CalendarMode)}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none text-center ${
                  isActive 
                    ? tab.color
                    : 'text-slate-400 hover:text-slate-700 hover:bg-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Content Layout: Side-by-side Calendar Grid and Vertical Streak Pillar */}
        <div className="flex gap-4">
          
          {/* Calendar Day Matrix Grid (7 columns) */}
          <div className="flex-1">
            {/* Weekday Initials Row */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 pb-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <span key={idx} className="uppercase">{day}</span>
              ))}
            </div>

            {/* Days Circles Grid */}
            <div className="grid grid-cols-7 gap-2">
              {gridDays.map((cell, idx) => {
                const isSelected = selectedDateStr === cell.dateStr;
                const activity = getDateActivity(cell.dateStr);

                // Styling for Day Item based on membership statuses
                const getCellClass = () => {
                  if (!cell.isCurrentMonth) {
                    return 'text-slate-200 bg-transparent cursor-pointer font-medium hover:text-slate-400';
                  }

                  // Selection Border Styling as shown on "28" in the image
                  if (isSelected) {
                    return 'bg-white border-2 border-slate-900 text-slate-900 font-extrabold scale-105 z-10';
                  }

                  // Colored status indicators (blue = active, red = expired)
                  if (mode === 'all') {
                    if (activity.hasExpired) return 'bg-red-500 text-white font-bold';
                    if (activity.hasActive) return 'bg-blue-600 text-white font-bold';
                    if (activity.hasExpiring) return 'bg-amber-500 text-white font-bold';
                  } else if (mode === 'active' && activity.hasActive) {
                    return 'bg-blue-600 text-white font-bold';
                  } else if (mode === 'expired' && activity.hasExpired) {
                    return 'bg-red-500 text-white font-bold';
                  } else if (mode === 'expiring' && activity.hasExpiring) {
                    return 'bg-amber-500 text-white font-bold';
                  }

                  // Default soft gray circle in original design
                  return 'bg-slate-50 text-slate-700 font-bold hover:bg-slate-100';
                };

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    className={`aspect-square rounded-full flex flex-col items-center justify-center text-xs relative transition-all active:scale-90 cursor-pointer ${getCellClass()}`}
                  >
                    <span>{cell.dayNum}</span>

                    {/* Cute notification indicator dot attached on top-right of the circle */}
                    {cell.isCurrentMonth && !isSelected && (activity.hasActive || activity.hasExpired || activity.hasExpiring) && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-slate-900 rounded-full border border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Pillar: Gorgeous Vertical Peach-Orange Streak Pillar from original image! */}
          <div className="w-12 bg-[#FFEDE4] rounded-3xl flex flex-col justify-between items-center py-4 px-1.5 shadow-xs border border-[#FFE2D4]">
            
            {/* Top checks in the vertical pillar */}
            <div className="flex flex-col gap-3 items-center">
              {[1, 2, 3, 4].map((item) => (
                <div 
                  key={item}
                  className="w-7 h-7 bg-[#FF5A36] text-white flex items-center justify-center rounded-full shadow-2xs border border-[#FF3C12]"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              ))}
            </div>

            {/* Glowing Orange/Red Fire Badge at the bottom of the pillar */}
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="w-9 h-9 bg-[#FF5A36] rounded-full flex flex-col items-center justify-center text-white font-extrabold relative shadow-md mt-4"
            >
              {/* Flame Icon */}
              <span className="text-sm leading-none mt-0.5">🔥</span>
              <span className="text-[10px] leading-none font-black">{totalActiveInGym}</span>
            </motion.div>

          </div>

        </div>

        {/* 2. Inline Events Details for Selected Date */}
        {selectedDateActivities.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>⚡</span> Events on this Day
              </h4>
              <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
                {selectedDateActivities.length} Event{selectedDateActivities.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
              {selectedDateActivities.map(({ member, type }) => {
                const config = {
                  joined: { bg: 'border-blue-200 bg-blue-50/40', text: 'text-blue-700', tagBg: 'bg-blue-600 text-white', label: 'JOINED' },
                  expiring: { bg: 'border-amber-200 bg-amber-50/40', text: 'text-amber-700', tagBg: 'bg-amber-500 text-white', label: 'EXPIRING' },
                  expired: { bg: 'border-rose-200 bg-rose-50/40', text: 'text-red-700', tagBg: 'bg-red-500 text-white', label: 'EXPIRED' }
                }[type];

                return (
                  <motion.div
                    key={`${member.id}-${type}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-2.5 rounded-2xl flex items-center justify-between gap-3 border border-slate-100 bg-white shadow-2xs hover:border-slate-300 transition-all`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar photoUrl={member.profilePhoto} gender={member.gender} name={member.name} size="xs" />
                      <div>
                        <button
                          onClick={() => openStayTimeline(member)}
                          className="font-bold text-slate-900 hover:underline text-left text-xs flex items-center gap-1 group/btn cursor-pointer"
                          title="View Membership Stay Timeline Highlight"
                        >
                          {member.name}
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        </button>
                        <p className="text-[10px] text-slate-500 font-medium">{member.phone}</p>
                      </div>
                    </div>

                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${config.tagBg} shadow-3xs`}>
                      {config.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* 3. Interactive Gym Stay Range Highlight Modal */}
      <AnimatePresence>
        {activeTimelineMember && (() => {
          const metrics = getStayMetrics(activeTimelineMember);
          
          const joinDateObj = new Date(activeTimelineMember.joiningDate);
          const startYear = joinDateObj.getFullYear();
          const startMonth = joinDateObj.getMonth();
          
          // Resolve shown month inside stay timeline popup
          const activeTimelineDate = new Date(startYear, startMonth + timelineMonthOffset, 1);
          const activeTYear = activeTimelineDate.getFullYear();
          const activeTMonth = activeTimelineDate.getMonth();
          const activeTMonthName = monthNamesUppercase[activeTMonth];

          const tDays = getDaysInMonth(activeTYear, activeTMonth);
          const tFirstDayIdx = getFirstDayOfMonth(activeTYear, activeTMonth);

          const isDateInRange = (d: number) => {
            const currentCellStr = getYYYYMMDD(activeTYear, activeTMonth, d);
            return currentCellStr >= activeTimelineMember.joiningDate && currentCellStr <= activeTimelineMember.expiryDate;
          };

          return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-100" id="gym-stay-modal">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white border border-slate-100 rounded-[36px] max-w-md w-full p-6 shadow-2xl relative overflow-hidden space-y-6"
              >
                {/* Close Button */}
                <button
                  onClick={() => setActiveTimelineMember(null)}
                  className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer active:scale-95 border border-slate-200"
                >
                  <X className="w-4.5 h-4.5 stroke-[2.5]" />
                </button>

                {/* Title */}
                <div className="text-center space-y-1 pt-2">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-[#FF5A36] bg-[#FFEDE4] px-3 py-1 rounded-full border border-[#FFE2D4] mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF5A36]" />
                    MEMBER STAY TRACKER
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {activeTimelineMember.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Track the activation and total stay duration of this member.
                  </p>
                </div>

                {/* Avatar Banner Card */}
                <div className="bg-slate-50 border border-slate-100 rounded-[24px] p-4 flex items-center gap-4">
                  <Avatar photoUrl={activeTimelineMember.profilePhoto} gender={activeTimelineMember.gender} name={activeTimelineMember.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-sans">membership span</div>
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1 mt-0.5">
                      <span>{metrics.startFormatted}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#FF5A36]" />
                      <span>{metrics.endFormatted}</span>
                    </div>
                    <span className="inline-block mt-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                      ⚡ {metrics.days} days ({metrics.months} Month{metrics.months !== 1 ? 's' : ''})
                    </span>
                  </div>
                </div>

                {/* Month Navigation inside Timeline Popup */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Highlight Calendar</span>
                    
                    <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-xl border border-slate-100">
                      <button
                        onClick={() => setTimelineMonthOffset(prev => prev - 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white active:scale-90 transition-all cursor-pointer"
                        title="Prev Month"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[9px] font-black text-slate-700 px-1.5 select-none min-w-[85px] text-center">
                        {activeTMonthName} {activeTYear}
                      </span>
                      <button
                        onClick={() => setTimelineMonthOffset(prev => prev + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white active:scale-90 transition-all cursor-pointer"
                        title="Next Month"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Highlight Calendar Sheet */}
                  <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-[28px] shadow-3xs" key={`${timelinePlayKey}-${timelineMonthOffset}`}>
                    <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[9px] font-bold text-slate-400">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((wd, i) => (
                        <span key={i}>{wd}</span>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {/* Empty offsets */}
                      {Array.from({ length: tFirstDayIdx }).map((_, i) => (
                        <div key={`empty-t-${i}`} className="aspect-square" />
                      ))}

                      {/* Highlighted Days circles */}
                      {Array.from({ length: tDays }).map((_, i) => {
                        const dayNum = i + 1;
                        const inRange = isDateInRange(dayNum);
                        const dayStr = getYYYYMMDD(activeTYear, activeTMonth, dayNum);
                        const isStart = dayStr === activeTimelineMember.joiningDate;
                        const isEnd = dayStr === activeTimelineMember.expiryDate;

                        return (
                          <motion.div
                            key={`t-day-${dayNum}`}
                            initial={inRange ? { scale: 0.6, opacity: 0 } : {}}
                            animate={inRange ? { scale: 1, opacity: 1 } : {}}
                            transition={{ delay: inRange ? (dayNum * 0.015) : 0, type: 'spring', stiffness: 200, damping: 15 }}
                            className={`aspect-square flex items-center justify-center text-[10px] font-bold rounded-full relative ${
                              isStart 
                                ? 'bg-blue-600 text-white font-extrabold ring-2 ring-blue-300 scale-105 z-10 shadow-3xs' 
                                : isEnd 
                                  ? 'bg-red-600 text-white font-extrabold ring-2 ring-red-300 scale-105 z-10 shadow-3xs' 
                                  : inRange 
                                    ? activeTimelineMember.status === 'Expired'
                                      ? 'bg-red-50 text-red-700 font-extrabold shadow-3xs border border-red-100'
                                      : 'bg-blue-50 text-blue-700 font-extrabold shadow-3xs border border-blue-100'
                                    : 'text-slate-300'
                            }`}
                          >
                            <span>{dayNum}</span>

                            {/* Label flags for starts/ends */}
                            {isStart && (
                              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[6px] px-1 rounded-full uppercase font-black tracking-wider whitespace-nowrap shadow-3xs">
                                JOIN
                              </span>
                            )}
                            {isEnd && (
                              <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[6px] px-1 rounded-full uppercase font-black tracking-wider whitespace-nowrap shadow-3xs">
                                {activeTimelineMember.status === 'Expired' ? 'EXP' : 'END'}
                              </span>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Replay controller */}
                <div className="flex items-center justify-between text-[11px] font-bold pt-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600" /> Start</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600" /> Expiry</span>
                  </div>
                  <button
                    onClick={() => setTimelinePlayKey(prev => prev + 1)}
                    className="flex items-center gap-1 text-[#FF5A36] hover:text-[#e04523] transition-colors cursor-pointer select-none"
                    title="Replay highlighting animation"
                  >
                    <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                    Replay Track
                  </button>
                </div>

              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
