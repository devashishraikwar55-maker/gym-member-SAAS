import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, Dumbbell, Loader2 } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
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
  getDaysDiff 
} from './types';
import { 
  auth,
  logoutUser,
  initializeUserGymData,
  subscribeToSettings,
  subscribeToMembers,
  subscribeToPlans,
  subscribeToLogs,
  saveMemberToFirestore,
  deleteMemberFromFirestore,
  saveLogToFirestore,
  saveSettingsToFirestore
} from './lib/firebase';

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
import { OnboardingSlides } from './components/OnboardingSlides';

export default function App() {
  // --- Auth & User State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [isSkippedAuth, setIsSkippedAuth] = useState<boolean>(() => {
    return localStorage.getItem('gym_reminders_guest_mode') === 'true';
  });

  // --- Reload Onboarding State (shown whenever app is reloaded) ---
  const [showReloadOnboarding, setShowReloadOnboarding] = useState<boolean>(true);

  // --- Core Domain States (backed by Firestore when logged in, or sample random members when skipped) ---
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [plans, setPlans] = useState<MembershipPlan[]>(INITIAL_PLANS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);

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
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  // --- Toast notifications state ---
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Toast Notification triggers
  const addToast = useCallback((message: string, type: 'success' | 'warning' | 'danger') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto dismiss after 3.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // --- Firebase Auth & Realtime Firestore Synchronization ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAuthChecking(false);

      if (user) {
        // Initialize user database documents if first-time user
        await initializeUserGymData(
          user.uid, 
          user.displayName || settings.ownerName || 'Gym Owner', 
          settings.gymName || 'GYM-member'
        );
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Sync real-time Firestore data when authenticated
  useEffect(() => {
    if (!currentUser) return;

    const unsubSettings = subscribeToSettings(currentUser.uid, (syncedSettings) => {
      setSettings(syncedSettings);
    });

    const unsubMembers = subscribeToMembers(currentUser.uid, (syncedMembers) => {
      setMembers(syncedMembers);
    });

    const unsubPlans = subscribeToPlans(currentUser.uid, (syncedPlans) => {
      setPlans(syncedPlans);
    });

    const unsubLogs = subscribeToLogs(currentUser.uid, (syncedLogs) => {
      setActivityLogs(syncedLogs);
    });

    return () => {
      unsubSettings();
      unsubMembers();
      unsubPlans();
      unsubLogs();
    };
  }, [currentUser]);

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

  // Helper to calculate exact status for a member based on target date
  const getCalculatedStatus = (expiryDate: string, currentStatus: 'Active' | 'Expiring' | 'Expired' | 'Cancelled'): 'Active' | 'Expiring' | 'Expired' | 'Cancelled' => {
    if (currentStatus === 'Cancelled') return 'Cancelled';
    const diff = getDaysDiff(CURRENT_DATE_STR, expiryDate);
    if (diff < 0) return 'Expired';
    if (diff <= 7) return 'Expiring';
    return 'Active';
  };

  const handleOnboardingComplete = async (ownerName: string, gymName: string) => {
    const updatedSettings = {
      ...settings,
      ownerName,
      gymName,
    };
    setSettings(updatedSettings);
    if (currentUser) {
      try {
        await saveSettingsToFirestore(currentUser.uid, updatedSettings);
      } catch (err) {
        console.error('Error saving onboarding settings:', err);
      }
    }
    setIsOnboardingOpen(false);
    addToast(`Welcome, ${ownerName}! Setup complete for ${gymName}.`, 'success');
  };

  // Auth actions
  const handleSkipAuth = () => {
    setIsSkippedAuth(true);
    localStorage.setItem('gym_reminders_guest_mode', 'true');
    setMembers(INITIAL_MEMBERS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    addToast('Exploring dashboard in Guest Mode. You can sign in anytime.', 'success');
  };

  const handleLogout = async () => {
    localStorage.removeItem('gym_reminders_guest_mode');
    setIsSkippedAuth(false);
    await logoutUser();
    setCurrentUser(null);
    setMembers(INITIAL_MEMBERS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setSettings(DEFAULT_SETTINGS);
    setCurrentView('dashboard');
    addToast('Signed out of GYM-member.', 'warning');
  };

  // Global search triggers
  const handleSelectMember = (id: string) => {
    setSelectedMemberId(id);
    setIsDetailsOpen(true);
  };

  // Add new member
  const handleAddMemberSubmit = async (formData: Omit<Member, 'id' | 'status' | 'history'>) => {
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

    // Optimistic UI update
    setMembers(prev => [newMember, ...prev]);
    setActivityLogs(prev => [newLog, ...prev]);
    setCurrentView('members');
    addToast(`Successfully registered ${formData.name} to cloud database!`, 'success');

    // Firestore cloud save
    if (currentUser) {
      try {
        await saveMemberToFirestore(currentUser.uid, newMember);
        await saveLogToFirestore(currentUser.uid, newLog);
      } catch (err) {
        console.error('Firestore save member error:', err);
      }
    }
  };

  // Edit existing member
  const handleEditMemberSubmit = async (formData: Omit<Member, 'id' | 'status' | 'history'>) => {
    if (!selectedMemberId) return;

    const existingMember = members.find(m => m.id === selectedMemberId);
    if (!existingMember) return;

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
    addToast(`Record details for ${formData.name} synced to database.`, 'success');

    if (currentUser) {
      try {
        await saveMemberToFirestore(currentUser.uid, updatedMember);
        await saveLogToFirestore(currentUser.uid, newLog);
      } catch (err) {
        console.error('Firestore update member error:', err);
      }
    }
  };

  // Renew membership
  const handleRenewMember = async (memberId: string, planId: string, customStartDate: string, paymentStatus: 'Paid' | 'Unpaid' | 'Pending') => {
    const member = members.find(m => m.id === memberId);
    const plan = plans.find(p => p.id === planId);
    if (!member || !plan) return;

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
      status: 'Active',
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

    if (currentUser) {
      try {
        await saveMemberToFirestore(currentUser.uid, updatedMember);
        await saveLogToFirestore(currentUser.uid, newLog);
      } catch (err) {
        console.error('Firestore renew member error:', err);
      }
    }
  };

  // Cancel membership
  const handleCancelMembership = async (memberId: string) => {
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
      paymentStatus: 'Paid',
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

    if (currentUser) {
      try {
        await saveMemberToFirestore(currentUser.uid, updatedMember);
        await saveLogToFirestore(currentUser.uid, newLog);
      } catch (err) {
        console.error('Firestore cancel member error:', err);
      }
    }
  };

  // Delete member completely
  const handleDeleteMember = async (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    setMembers(prev => prev.filter(m => m.id !== memberId));
    addToast(`Member ${member.name} has been deleted from the database.`, 'danger');

    if (currentUser) {
      try {
        await deleteMemberFromFirestore(currentUser.uid, memberId);
      } catch (err) {
        console.error('Firestore delete member error:', err);
      }
    }
  };

  // Save Settings
  const handleSaveSettings = async (updatedSettings: SystemSettings) => {
    setSettings(updatedSettings);
    addToast('Gym settings saved and synced to cloud.', 'success');

    if (currentUser) {
      try {
        await saveSettingsToFirestore(currentUser.uid, updatedSettings);
      } catch (err) {
        console.error('Firestore save settings error:', err);
      }
    }
  };

  // --- Conditional Sub-Views ---
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
            onReRunOnboarding={() => setShowReloadOnboarding(true)}
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
      case 'settings': return 'Settings';
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

  // --- Initial Auth Loading Screen ---
  if (isAuthChecking) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-brand-bg gap-3 text-brand-text-secondary">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wider">Connecting to GYM-member...</span>
      </div>
    );
  }

  // --- Onboarding Slides: Displayed on app launch & browser reload ---
  if (showReloadOnboarding) {
    return (
      <div 
        id="app-onboarding-slides-wrapper"
        className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-brand-bg relative overflow-hidden"
      >
        {/* Subtle decorative background shapes */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-200/25 rounded-full blur-[120px] -z-10 animate-pulse duration-[8s]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-200/25 rounded-full blur-[100px] -z-10 animate-pulse duration-[12s]" />

        <OnboardingSlides 
          currentUser={currentUser}
          settings={settings}
          onSaveProfile={async (ownerName, gymName) => {
            setSettings(prev => ({
              ...prev,
              ownerName,
              gymName,
            }));
          }}
          onLoginSuccess={() => {
            setShowReloadOnboarding(false);
            setIsSkippedAuth(false);
            localStorage.removeItem('gym_reminders_guest_mode');
            addToast('Welcome to GYM-member!', 'success');
          }}
          onComplete={() => setShowReloadOnboarding(false)} 
          onSkip={() => {
            setShowReloadOnboarding(false);
            handleSkipAuth();
          }} 
        />
        <Notifications toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  // --- Auth Wall: Show real login if not signed in or not skipped ---
  if (!currentUser && !isSkippedAuth) {
    return (
      <div id="app-auth-wrapper">
        <LoginView 
          settings={settings}
          onSaveProfile={async (ownerName, gymName) => {
            setSettings(prev => ({
              ...prev,
              ownerName,
              gymName,
            }));
          }}
          onLoginSuccess={() => {
            setIsSkippedAuth(false);
            localStorage.removeItem('gym_reminders_guest_mode');
            addToast('Welcome to GYM-member!', 'success');
          }} 
          onSkip={handleSkipAuth}
        />
        <Notifications toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  const userInitials = (settings.ownerName || currentUser.displayName || 'GM')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div id="app-workspace-layout" className="min-h-screen bg-brand-bg flex flex-col md:flex-row">
      {/* Mobile Top Header */}
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
          {userInitials}
        </div>
      </div>

      {/* 1. Global Navigation Sidebar */}
      <Sidebar 
        currentView={currentView}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        gymName={settings.gymName}
        ownerName={settings.ownerName || currentUser.displayName || 'Owner'}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* 2. Main Content Frame */}
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
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        members={members}
        onSelectMember={handleSelectMember}
        onNavigate={handleNavigate}
      />

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

      <RenewModal 
        isOpen={isRenewOpen}
        onClose={() => { setIsRenewOpen(false); setMemberToRenew(null); }}
        member={memberToRenew}
        plans={plans}
        onRenew={handleRenewMember}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen && !!currentUser}
        initialOwnerName={settings.ownerName || currentUser.displayName || ''}
        initialGymName={settings.gymName}
        onComplete={handleOnboardingComplete}
        onClose={() => setIsOnboardingOpen(false)}
      />

      <Notifications toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
