import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, Dumbbell } from 'lucide-react';
import { 
  INITIAL_MEMBERS, 
  INITIAL_PLANS, 
  INITIAL_ACTIVITY_LOGS, 
  DEFAULT_SETTINGS, 
  Member, 
  MembershipPlan, 
  ActivityLog, 
  SystemSettings, 
  CURRENT_DATE_STR, 
  getDaysDiff, 
  formatDate 
} from './types';

// Component Imports
import { Notifications, Toast } from './components/Notifications';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { MembersView } from './components/MembersView';
import { ReminderCenterView } from './components/ReminderCenterView';
import { CancelledView } from './components/CancelledView';
import { PlansView } from './components/PlansView';
import { SettingsView } from './components/SettingsView';
import { MemberForm } from './components/MemberForm';
import { MemberDetailsModal } from './components/MemberDetailsModal';
import { RenewModal } from './components/RenewModal';
import { OnboardingModal } from './components/OnboardingModal';

export default function App() {
  // --- Auth State ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('gym_reminders_logged_in');
    if (saved === 'false') return false;
    return true;
  });

  // --- Core Domain States ---
  const [members, setMembers] = useState<Member[]>(() => {
    const isUpgraded = localStorage.getItem('gym_reminders_v7_phone_reset');
    if (!isUpgraded) {
      localStorage.setItem('gym_reminders_v7_phone_reset', 'true');
      localStorage.setItem('gym_reminders_members', JSON.stringify(INITIAL_MEMBERS));
      localStorage.setItem('gym_reminders_plans', JSON.stringify(INITIAL_PLANS));
      return INITIAL_MEMBERS;
    }
    const saved = localStorage.getItem('gym_reminders_members');
    if (saved) {
      try {
        const parsed: Member[] = JSON.parse(saved);
        return parsed.map((m: Member) => {
          if (!m.profilePhoto || m.profilePhoto.includes('dicebear.com') || m.profilePhoto.includes('unsplash.com')) {
            const defaultPhoto = m.gender === 'Female' 
              ? 'https://qsvgrkeitnnjlcpxpewu.supabase.co/storage/v1/object/public/gym-icon-m-f/female.png'
              : m.gender === 'Couple'
                ? 'https://qsvgrkeitnnjlcpxpewu.supabase.co/storage/v1/object/public/gym-icon-m-f/couple.png'
                : 'https://qsvgrkeitnnjlcpxpewu.supabase.co/storage/v1/object/public/gym-icon-m-f/male.png';
            return { ...m, profilePhoto: defaultPhoto };
          }
          return m;
        });
      } catch (e) {
        return INITIAL_MEMBERS;
      }
    }
    return INITIAL_MEMBERS;
  });

  const [plans] = useState<MembershipPlan[]>(() => {
    const isUpgraded = localStorage.getItem('gym_reminders_v6_upgrade_gender_avatars');
    if (!isUpgraded) {
      return INITIAL_PLANS;
    }
    const saved = localStorage.getItem('gym_reminders_plans');
    if (saved) return JSON.parse(saved);
    return INITIAL_PLANS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('gym_reminders_logs');
    if (saved) return JSON.parse(saved);
    return INITIAL_ACTIVITY_LOGS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('gym_reminders_settings');
    if (saved) return JSON.parse(saved);
    return DEFAULT_SETTINGS;
  });

  // --- UI Layout & Routing ---
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [membersFilter, setMembersFilter] = useState<'All' | 'Active' | 'Expiring' | 'Expired'>('All');
  const [remindersCategory, setRemindersCategory] = useState<'today' | '3days' | '7days' | 'expired'>('today');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // --- Detailed Modal states ---
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [memberToRenew, setMemberToRenew] = useState<Member | null>(null);
  const [isRenewOpen, setIsRenewOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(true);

  const handleOnboardingComplete = (ownerName: string, gymName: string) => {
    const updatedSettings = {
      ...settings,
      ownerName,
      gymName,
    };
    setSettings(updatedSettings);
    localStorage.setItem('gym_reminders_settings', JSON.stringify(updatedSettings));
    setIsOnboardingOpen(false);
    addToast(`Welcome, ${ownerName}! Setup complete for ${gymName}.`, 'success');
  };

  // --- Toast notifications state ---
  const [toasts, setToasts] = useState<Toast[]>([]);

  // --- Persist state updates to localStorage ---
  useEffect(() => {
    localStorage.setItem('gym_reminders_logged_in', String(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('gym_reminders_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('gym_reminders_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('gym_reminders_settings', JSON.stringify(settings));
  }, [settings]);

  // Handle Ctrl+K shortcut to toggle command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toast Notification triggers
  const addToast = useCallback((message: string, type: 'success' | 'warning' | 'danger') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Helper to re-evaluate and calculate exact status for a member based on target date
  const getCalculatedStatus = (expiryDate: string, currentStatus: 'Active' | 'Expiring' | 'Expired' | 'Cancelled'): 'Active' | 'Expiring' | 'Expired' | 'Cancelled' => {
    if (currentStatus === 'Cancelled') return 'Cancelled';
    const diff = getDaysDiff(CURRENT_DATE_STR, expiryDate);
    if (diff < 0) return 'Expired';
    if (diff <= 7) return 'Expiring';
    return 'Active';
  };

  // Automated effect to ensure statuses stay in sync with the simulated timeline date (July 4th, 2026)
  useEffect(() => {
    let changed = false;
    const updatedMembers = members.map(m => {
      const calculated = getCalculatedStatus(m.expiryDate, m.status);
      if (calculated !== m.status) {
        changed = true;
        return { ...m, status: calculated };
      }
      return m;
    });

    if (changed) {
      setMembers(updatedMembers);
    }
  }, [members]);

  // Auth actions
  const handleLogin = () => {
    setIsLoggedIn(true);
    addToast('Logged in successfully. Welcome to GymReminders SaaS dashboard!', 'success');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('dashboard');
    addToast('Signed out of the management panel.', 'warning');
  };

  // Global search triggers
  const handleSelectMember = (id: string) => {
    setSelectedMemberId(id);
    setIsDetailsOpen(true);
  };

  // Reset system database trigger
  const handleResetData = () => {
    localStorage.removeItem('gym_reminders_members');
    localStorage.removeItem('gym_reminders_logs');
    localStorage.removeItem('gym_reminders_settings');
    setMembers(INITIAL_MEMBERS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setSettings(DEFAULT_SETTINGS);
    setCurrentView('dashboard');
    addToast('System database successfully reverted to factory seed records.', 'success');
  };

  // Add new member
  const handleAddMemberSubmit = (formData: Omit<Member, 'id' | 'status' | 'history'>) => {
    const newId = `mem-${Date.now()}`;
    const calculatedStatus = getCalculatedStatus(formData.expiryDate, 'Active');

    const newHistoryRecord = {
      id: `hist-${Date.now()}`,
      planName: plans.find(p => p.id === formData.membershipPlanId)?.name || 'Custom Plan',
      fee: formData.membershipFee,
      joiningDate: formData.joiningDate,
      expiryDate: formData.expiryDate,
      status: 'Active' as const,
    };

    const newMember: Member = {
      ...formData,
      id: newId,
      status: calculatedStatus,
      history: [newHistoryRecord]
    };

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      memberId: newId,
      memberName: formData.name,
      type: 'joined',
      description: `Registered new member: ${formData.name} (${formData.duration} Plan)`,
      timestamp: new Date().toISOString()
    };

    setMembers(prev => [newMember, ...prev]);
    setActivityLogs(prev => [newLog, ...prev]);
    setCurrentView('members');
    addToast(`Successfully registered ${formData.name} as a new member!`, 'success');
  };

  // Edit existing member
  const handleEditMemberSubmit = (formData: Omit<Member, 'id' | 'status' | 'history'>) => {
    if (!selectedMemberId) return;

    const existingMember = members.find(m => m.id === selectedMemberId);
    if (!existingMember) return;

    // Recalculate status (preserve Cancelled unless they chose something else, but if they edit, we update based on edited dates)
    const calculatedStatus = getCalculatedStatus(formData.expiryDate, existingMember.status);

    const updatedMember: Member = {
      ...existingMember,
      ...formData,
      status: calculatedStatus
    };

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      memberId: selectedMemberId,
      memberName: formData.name,
      type: 'edited',
      description: `Updated profile details for member: ${formData.name}`,
      timestamp: new Date().toISOString()
    };

    setMembers(prev => prev.map(m => m.id === selectedMemberId ? updatedMember : m));
    setActivityLogs(prev => [newLog, ...prev]);
    setCurrentView('members');
    setSelectedMemberId(null);
    addToast(`Record details for ${formData.name} successfully updated.`, 'success');
  };

  // Renew membership
  const handleRenewMember = (memberId: string, planId: string, customStartDate: string, paymentStatus: 'Paid' | 'Unpaid' | 'Pending') => {
    const member = members.find(m => m.id === memberId);
    const plan = plans.find(p => p.id === planId);
    if (!member || !plan) return;

    // Calculate expiry date relative to customStartDate
    const start = new Date(customStartDate);
    start.setMonth(start.getMonth() + plan.durationMonths);
    const customExpiryDate = start.toISOString().split('T')[0];

    const newHistoryRecord = {
      id: `hist-${Date.now()}`,
      planName: plan.name,
      fee: plan.fee,
      joiningDate: customStartDate,
      expiryDate: customExpiryDate,
      status: 'Active' as const,
      renewedAt: CURRENT_DATE_STR,
    };

    // Close any previous history entries
    const updatedHistory = member.history.map(hist => {
      if (hist.status === 'Active') {
        return { ...hist, status: 'Completed' as const };
      }
      return hist;
    });

    const updatedMember: Member = {
      ...member,
      membershipPlanId: planId,
      membershipFee: plan.fee,
      paymentStatus: paymentStatus,
      joiningDate: customStartDate,
      expiryDate: customExpiryDate,
      duration: plan.duration,
      status: 'Active', // Renewing restores status to Active
      history: [...updatedHistory, newHistoryRecord]
    };

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      memberId,
      memberName: member.name,
      type: 'renewed',
      description: `Renewed membership for ${member.name} (${plan.name} Plan)`,
      timestamp: new Date().toISOString()
    };

    setMembers(prev => prev.map(m => m.id === memberId ? updatedMember : m));
    setActivityLogs(prev => [newLog, ...prev]);
    addToast(`Successfully renewed membership for ${member.name}!`, 'success');
  };

  // Cancel membership
  const handleCancelMembership = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const updatedHistory = member.history.map(hist => {
      if (hist.status === 'Active') {
        return { ...hist, status: 'Cancelled' as const };
      }
      return hist;
    });

    const updatedMember: Member = {
      ...member,
      status: 'Cancelled',
      paymentStatus: 'Paid', // Clear unpaid issues on cancel
      history: updatedHistory
    };

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      memberId,
      memberName: member.name,
      type: 'cancelled',
      description: `Cancelled membership for ${member.name}`,
      timestamp: new Date().toISOString()
    };

    setMembers(prev => prev.map(m => m.id === memberId ? updatedMember : m));
    setActivityLogs(prev => [newLog, ...prev]);
    addToast(`Membership for ${member.name} has been cancelled. Records preserved in Archive.`, 'warning');
  };

  // Delete member completely
  const handleDeleteMember = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    setMembers(prev => prev.filter(m => m.id !== memberId));
    addToast(`Member ${member.name} has been deleted from the database.`, 'danger');
  };

  // Save Settings
  const handleSaveSettings = (updatedSettings: SystemSettings) => {
    setSettings(updatedSettings);
    addToast('System settings and reminder templates successfully saved.', 'success');
  };

  // --- Conditional Rendering of Sub-Views with Page Transition Containers ---
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView 
            members={members}
            activityLogs={activityLogs}
            ownerName={settings.ownerName}
            onNavigate={setCurrentView}
            onSelectMember={handleSelectMember}
            onRenewClick={(m) => { setMemberToRenew(m); setIsRenewOpen(true); }}
            onSearchClick={() => setIsCommandPaletteOpen(true)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onStatClick={(statId) => {
              if (statId === 'stat-total') {
                setMembersFilter('All');
                setCurrentView('members');
              } else if (statId === 'stat-expiring') {
                setMembersFilter('Expiring');
                setCurrentView('members');
              } else if (statId === 'stat-expired') {
                setRemindersCategory('expired');
                setCurrentView('reminders');
              } else if (statId === 'stat-active') {
                setMembersFilter('Active');
                setCurrentView('members');
              } else if (statId === 'stat-revenue') {
                setMembersFilter('Active');
                setCurrentView('members');
              }
            }}
          />
        );
      case 'members':
        return (
          <MembersView 
            members={members}
            onNavigate={setCurrentView}
            onSelectMember={handleSelectMember}
            onRenewClick={(m) => { setMemberToRenew(m); setIsRenewOpen(true); }}
            initialFilter={membersFilter}
            onFilterChange={setMembersFilter}
          />
        );
      case 'add-member':
        return (
          <MemberForm 
            plans={plans}
            onSubmit={handleAddMemberSubmit}
            onCancel={() => setCurrentView('members')}
          />
        );
      case 'edit-member':
        const memberToEdit = members.find(m => m.id === selectedMemberId);
        return (
          <MemberForm 
            member={memberToEdit}
            plans={plans}
            onSubmit={handleEditMemberSubmit}
            onCancel={() => setCurrentView('members')}
          />
        );
      case 'reminders':
        return (
          <ReminderCenterView 
            members={members}
            settings={settings}
            onSelectMember={handleSelectMember}
            onRenewClick={(m) => { setMemberToRenew(m); setIsRenewOpen(true); }}
            onCopySuccess={(msg) => addToast(msg, 'success')}
            initialCategory={remindersCategory}
            onCategoryChange={setRemindersCategory}
          />
        );
      case 'cancelled':
        return (
          <CancelledView 
            members={members}
            onSelectMember={handleSelectMember}
            onRenewClick={(m) => { setMemberToRenew(m); setIsRenewOpen(true); }}
          />
        );
      case 'plans':
        return (
          <PlansView 
            plans={plans}
            members={members}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onResetData={handleResetData}
            onReRunOnboarding={() => setIsOnboardingOpen(true)}
          />
        );
      default:
        return <div className="p-8">View not implemented.</div>;
    }
  };

  const getViewHeadline = (view: string) => {
    switch (view) {
      case 'dashboard': return 'Dashboard';
      case 'members': return 'Active Member';
      case 'add-member': return 'Register Member';
      case 'edit-member': return 'Edit Member';
      case 'reminders': return 'Expiring Membership';
      case 'cancelled': return 'Cancelled Members';
      case 'plans': return 'Membership Plans';
      case 'settings': return 'System Settings';
      default: return 'GYM-member';
    }
  };

  const handleNavigate = (view: string) => {
    if (view === 'members') {
      setMembersFilter('All');
    } else if (view === 'reminders') {
      setRemindersCategory('today');
    }
    setCurrentView(view);
    setSelectedMemberId(null);
  };

  const showBackOnMobile = currentView === 'add-member' || currentView === 'edit-member';
  const handleMobileBack = () => {
    handleNavigate('members');
  };

  // --- Auth Wall Check ---
  if (!isLoggedIn) {
    return (
      <div id="app-auth-wrapper">
        <LoginView onLogin={handleLogin} />
        <Notifications toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  return (
    <div id="app-workspace-layout" className="min-h-screen bg-brand-bg flex flex-col md:flex-row">
      {/* Mobile Top Header (Purple Strip exactly as requested) */}
      <div className="md:hidden bg-[#6C63FF] text-white h-16 px-5 sticky top-0 left-0 right-0 z-40 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackOnMobile ? (
            <>
              <button
                id="mobile-header-back-btn"
                onClick={handleMobileBack}
                className="p-1.5 hover:bg-white/10 rounded-xl text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
              </button>
              <span className="font-extrabold text-sm tracking-widest uppercase">
                {getViewHeadline(currentView)}
              </span>
            </>
          ) : (
            <div 
              onClick={() => handleNavigate('dashboard')}
              className="flex items-center gap-3 cursor-pointer active:opacity-80"
              title="Go to Dashboard"
            >
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                <Dumbbell className="w-4.5 h-4.5 text-white stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-sm tracking-widest uppercase">
                GYM-member
              </span>
            </div>
          )}
        </div>
        
        <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-xs">
          AD
        </div>
      </div>

      {/* 1. Global Navigation Sidebar */}
      <Sidebar 
        currentView={currentView}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        gymName={settings.gymName}
        ownerName={settings.ownerName}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* 2. Main Content Frame (Adjust margins to fit responsive sidebar layout) */}
      <main 
        id="app-main-viewport"
        className={`flex-1 transition-all duration-300 md:pb-6 ${
          isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        } ml-0 pt-6 px-4 sm:px-6 md:px-8 pb-24 md:pb-6`}
      >
        {/* Animated Page Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. Global Popups & Overlays */}
      
      {/* Ctrl+K Search Palette */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        members={members}
        onSelectMember={handleSelectMember}
        onNavigate={handleNavigate}
      />

      {/* Member Details Popup */}
      <MemberDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => { setIsDetailsOpen(false); setSelectedMemberId(null); }}
        member={members.find(m => m.id === selectedMemberId) || null}
        plans={plans}
        onRenewClick={(m) => { setMemberToRenew(m); setIsRenewOpen(true); }}
        onCancelClick={handleCancelMembership}
        onEditClick={(id) => { setSelectedMemberId(id); setCurrentView('edit-member'); }}
        onDeleteClick={handleDeleteMember}
      />

      {/* Quick Renew Popup */}
      <RenewModal 
        isOpen={isRenewOpen}
        onClose={() => { setIsRenewOpen(false); setMemberToRenew(null); }}
        member={memberToRenew}
        plans={plans}
        onRenew={handleRenewMember}
      />

      {/* User Onboarding Setup Flow */}
      <OnboardingModal
        isOpen={isOnboardingOpen && isLoggedIn}
        initialOwnerName={settings.ownerName}
        initialGymName={settings.gymName}
        onComplete={handleOnboardingComplete}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* Live Toast Toast notifications container */}
      <Notifications toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
