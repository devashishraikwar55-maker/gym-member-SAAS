import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  Bell, 
  UserX, 
  CreditCard, 
  Settings as SettingsIcon, 
  LogOut, 
  Plus, 
  Dumbbell,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  gymName: string;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ 
  currentView, 
  onNavigate, 
  onLogout, 
  gymName,
  isCollapsed,
  setIsCollapsed
}: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', name: 'Active Member', icon: Users },
    { id: 'reminders', name: 'Expiring Membership', icon: Bell },
    { id: 'cancelled', name: 'Cancelled Members', icon: UserX },
    { id: 'plans', name: 'Membership Plans', icon: CreditCard },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* 1. DESKTOP/TABLET SIDEBAR */}
      <aside 
        id="desktop-sidebar"
        className={`hidden md:flex flex-col bg-brand-sidebar text-white h-screen fixed left-0 top-0 transition-all duration-300 z-30 border-r border-slate-800 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 overflow-hidden cursor-pointer group/logo"
            title="Go to Dashboard"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center flex-shrink-0 shadow-md group-hover/logo:scale-105 transition-transform">
              <Dumbbell className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-lg tracking-tight whitespace-nowrap text-white group-hover/logo:text-slate-200 transition-colors"
              >
                GYM-member
              </motion.span>
            )}
          </div>
          
          {/* Collapse toggle button */}
          <button
            id="sidebar-toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav id="sidebar-nav" className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {!isCollapsed && (
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">
              Management
            </p>
          )}
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group cursor-pointer ${
                  isActive ? 'text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {/* Active Indicator Slide Animation */}
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active-indicator"
                    className="absolute inset-0 bg-brand-primary rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}

                {/* Tooltip on Collapsed Sidebar */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-md">
                    {item.name}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Add Button */}
        {!isCollapsed && (
          <div className="px-5 py-4 border-t border-slate-800/60">
            <button
              id="sidebar-add-member-btn"
              onClick={() => onNavigate('add-member')}
              className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary-hover active:scale-[0.98] transition-all rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add Member
            </button>
          </div>
        )}

        {/* User profile & Logout */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
              DR
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-200 truncate">{gymName}</p>
                <p className="text-[10px] text-slate-500 truncate">Devashish (Owner)</p>
              </div>
            )}
          </div>
          
          <button
            id="sidebar-logout-btn"
            onClick={onLogout}
            className="text-slate-500 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </aside>

      {/* 2. MOBILE BOTTOM NAVIGATION BAR (Android/Mobile optimized) */}
      <div 
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-sidebar text-slate-400 border-t border-slate-800 h-16 flex items-center justify-around px-2 z-40 pb-safe shadow-xl"
      >
        {menuItems.slice(0, 4).map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`mobile-nav-link-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all relative ${
                isActive ? 'text-white' : 'text-slate-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-brand-primary stroke-[2.5]' : ''}`} />
              <span className="text-[10px] mt-1 font-medium">{item.name.split(' ')[0]}</span>
            </button>
          );
        })}
        
        {/* Settings button on mobile botbar */}
        <button
          id="mobile-nav-link-settings"
          onClick={() => onNavigate('settings')}
          className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all relative ${
            currentView === 'settings' ? 'text-white' : 'text-slate-400'
          }`}
        >
          <SettingsIcon className={`w-5 h-5 ${currentView === 'settings' ? 'text-brand-primary stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-1 font-medium">Settings</span>
        </button>
      </div>

      {/* 3. MOBILE FLOATING ACTION BUTTON (Android style FAB) */}
      {currentView !== 'add-member' && (
        <button
          id="mobile-fab"
          onClick={() => onNavigate('add-member')}
          className="md:hidden fixed bottom-20 right-5 w-14 h-14 bg-brand-primary text-white rounded-full shadow-2xl flex items-center justify-center z-40 cursor-pointer hover:bg-brand-primary-hover active:scale-95 transition-all"
          title="Add New Member"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      )}
    </>
  );
}
