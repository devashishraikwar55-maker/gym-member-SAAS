import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ArrowRight, 
  X, 
  RotateCcw,
  Calendar as CalendarIcon,
  UserCheck,
  Clock
} from 'lucide-react';
import { Member, formatDate } from '../types';
import { Avatar } from './Avatar';

interface ChildlikeCalendarProps {
  members: Member[];
  onSelectMember: (id: string) => void;
}

export function ChildlikeCalendar({ members, onSelectMember }: ChildlikeCalendarProps) {
  // Defaulting to July 2026 to match mock data
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-07-01'));
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-07-01');
  const [calendarFilter, setCalendarFilter] = useState<'registrations' | 'expiring'>('registrations');
  
  // Member stay timeline states (modal)
  const [activeTimelineMember, setActiveTimelineMember] = useState<Member | null>(null);
  const [timelineMonthOffset, setTimelineMonthOffset] = useState<number>(0);
  const [timelinePlayKey, setTimelinePlayKey] = useState<number>(0);

  // Sync initial date selection with actual joining date of first member
  useEffect(() => {
    if (members.length > 0) {
      const targetMember = members.find(m => m.joiningDate.startsWith('2026-07')) || members[0];
      setSelectedDateStr(targetMember.joiningDate);
      setCurrentDate(new Date(targetMember.joiningDate));
    }
  }, [members]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const currentYYYYMM = `${year}-${String(month + 1).padStart(2, '0')}`;

  // Helper date calculators
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => {
    const d = new Date(y, m, 1).getDay(); // 0 is Sun, 1 is Mon...
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

  // Month-filtered members
  const registrationMembersThisMonth = members.filter(m => m.joiningDate.startsWith(currentYYYYMM));
  const expiringMembersThisMonth = members.filter(m => m.expiryDate.startsWith(currentYYYYMM));

  // Date-specific activity getters
  const getRegisteredOnDate = (dateStr: string) => {
    return members.filter(m => m.joiningDate === dateStr);
  };

  const getExpiringOnDate = (dateStr: string) => {
    return members.filter(m => m.expiryDate === dateStr);
  };

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
    
    // Days of next month to complete standard 42-cell grid
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

  const selectedDateRegistered = getRegisteredOnDate(selectedDateStr);
  const selectedDateExpiring = getExpiringOnDate(selectedDateStr);

  return (
    <div className="space-y-6" id="childlike-calendar-container">
      
      {/* 1. Main Calendar Card */}
      <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all duration-300 relative">
        
        {/* Month Header and Navigation Controls */}
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

        {/* Top Interactive Cards: Registration Date & Expiring Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 pt-1">
          {/* Registration Date Card */}
          <button
            id="calendar-stat-registration-date"
            onClick={() => {
              setCalendarFilter('registrations');
              if (registrationMembersThisMonth.length > 0) {
                setSelectedDateStr(registrationMembersThisMonth[0].joiningDate);
              }
            }}
            className={`p-4 rounded-2xl border text-left transition-all duration-300 ease-out transform-gpu cursor-pointer hover:-translate-y-1 hover:scale-[1.02] hover:shadow-md ${
              calendarFilter === 'registrations'
                ? 'border-emerald-500 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                : 'border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Registration Date
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-2xs" />
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
              {registrationMembersThisMonth.length}
            </p>
          </button>

          {/* Expiring Date Card */}
          <button
            id="calendar-stat-expiring-date"
            onClick={() => {
              setCalendarFilter('expiring');
              if (expiringMembersThisMonth.length > 0) {
                setSelectedDateStr(expiringMembersThisMonth[0].expiryDate);
              }
            }}
            className={`p-4 rounded-2xl border text-left transition-all duration-300 ease-out transform-gpu cursor-pointer hover:-translate-y-1 hover:scale-[1.02] hover:shadow-md ${
              calendarFilter === 'expiring'
                ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-2 ring-amber-500/20'
                : 'border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                Expiring Date
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-2xs" />
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
              {expiringMembersThisMonth.length}
            </p>
          </button>
        </div>

        {/* Calendar Day Matrix Grid (7 columns) */}
        <div>
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
              const registeredOnCell = getRegisteredOnDate(cell.dateStr);
              const expiringOnCell = getExpiringOnDate(cell.dateStr);
              
              const hasRegistration = registeredOnCell.length > 0;
              const hasExpiring = expiringOnCell.length > 0;

              // Styling for Day Item based on user requirements:
              // Registration dates highlighted in GREEN
              const getCellClass = () => {
                if (!cell.isCurrentMonth) {
                  return 'text-slate-200 bg-transparent cursor-pointer font-medium hover:text-slate-400';
                }

                // If date is selected by user
                if (isSelected) {
                  if (hasRegistration) {
                    return 'bg-emerald-500 text-white font-extrabold ring-4 ring-emerald-500/30 scale-105 z-10 shadow-md';
                  }
                  if (hasExpiring) {
                    return 'bg-amber-500 text-white font-extrabold ring-4 ring-amber-500/30 scale-105 z-10 shadow-md';
                  }
                  return 'bg-white border-2 border-slate-900 text-slate-900 font-extrabold scale-105 z-10 shadow-xs';
                }

                // Particular date of registration HIGHLIGHTED IN GREEN!
                if (hasRegistration) {
                  return 'bg-emerald-500 text-white font-extrabold shadow-2xs hover:bg-emerald-600';
                }

                // Expiring date highlighted in amber
                if (hasExpiring) {
                  return 'bg-amber-500 text-white font-extrabold shadow-2xs hover:bg-amber-600';
                }

                // Default soft neutral circle
                return 'bg-slate-50 text-slate-700 font-bold hover:bg-slate-100';
              };

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`aspect-square rounded-full flex flex-col items-center justify-center text-xs relative transition-all active:scale-90 cursor-pointer ${getCellClass()}`}
                >
                  <span>{cell.dayNum}</span>

                  {/* Dual indicator if date has both registration and expiry */}
                  {cell.isCurrentMonth && hasRegistration && hasExpiring && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full border border-emerald-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

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
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    MEMBER STAY TRACKER
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {activeTimelineMember.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Track the registration date and membership expiry of this member.
                  </p>
                </div>

                {/* Avatar Banner Card */}
                <div className="bg-slate-50 border border-slate-100 rounded-[24px] p-4 flex items-center gap-4">
                  <Avatar photoUrl={activeTimelineMember.profilePhoto} gender={activeTimelineMember.gender} name={activeTimelineMember.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-sans">membership span</div>
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1 mt-0.5">
                      <span>{metrics.startFormatted}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{metrics.endFormatted}</span>
                    </div>
                    <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
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
                                ? 'bg-emerald-500 text-white font-extrabold ring-2 ring-emerald-300 scale-105 z-10 shadow-3xs' 
                                : isEnd 
                                  ? 'bg-amber-500 text-white font-extrabold ring-2 ring-amber-300 scale-105 z-10 shadow-3xs' 
                                  : inRange 
                                    ? 'bg-emerald-50 text-emerald-800 font-extrabold shadow-3xs border border-emerald-100'
                                    : 'text-slate-300'
                            }`}
                          >
                            <span>{dayNum}</span>

                            {/* Label flags for starts/ends */}
                            {isStart && (
                              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[6px] px-1 rounded-full uppercase font-black tracking-wider whitespace-nowrap shadow-3xs">
                                REG
                              </span>
                            )}
                            {isEnd && (
                              <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[6px] px-1 rounded-full uppercase font-black tracking-wider whitespace-nowrap shadow-3xs">
                                EXP
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
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Registration</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Expiry</span>
                  </div>
                  <button
                    onClick={() => setTimelinePlayKey(prev => prev + 1)}
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer select-none"
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
