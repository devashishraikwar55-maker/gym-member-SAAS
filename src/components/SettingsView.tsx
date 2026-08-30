import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Save, Building, User, Sparkles } from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsViewProps {
  settings: SystemSettings;
  onSaveSettings: (updatedSettings: SystemSettings) => void;
  onResetData?: () => void;
  onReRunOnboarding?: () => void;
}

export function SettingsView({ settings, onSaveSettings, onReRunOnboarding }: SettingsViewProps) {
  const [gymName, setGymName] = useState('');
  const [ownerName, setOwnerName] = useState('');

  // Sync state with settings prop
  useEffect(() => {
    setGymName(settings.gymName);
    setOwnerName(settings.ownerName || '');
  }, [settings]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!gymName) return;

    onSaveSettings({
      ...settings,
      gymName,
      ownerName,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto space-y-6 pb-12"
    >
      {/* Header */}
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold text-brand-text-primary tracking-tight">Settings</h1>
        <p className="text-xs text-brand-text-secondary mt-0.5">Manage your profile and gym details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-2xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Owner Name */}
            <div className="space-y-1.5">
              <label htmlFor="settings-owner-name" className="text-xs font-semibold text-brand-text-primary uppercase tracking-wider block">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4.5 h-4.5 text-gray-400" />
                <input
                  id="settings-owner-name"
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-brand-border rounded-xl text-sm text-brand-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-white"
                  placeholder="Your Name"
                />
              </div>
            </div>

            {/* Gym Name */}
            <div className="space-y-1.5">
              <label htmlFor="settings-gym-name" className="text-xs font-semibold text-brand-text-primary uppercase tracking-wider block">
                Gym Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-3.5 w-4.5 h-4.5 text-gray-400" />
                <input
                  id="settings-gym-name"
                  type="text"
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-brand-border rounded-xl text-sm text-brand-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-white"
                  placeholder="Gym Name"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Replay Onboarding Slides Tour */}
        {onReRunOnboarding && (
          <div className="bg-gradient-to-r from-indigo-50/60 to-purple-50/60 p-5 rounded-2xl border border-indigo-100/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-brand-text-primary">Feature Tour & Onboarding Slides</h4>
                <p className="text-[11px] text-brand-text-secondary">View the introduction slides anytime to explore all features.</p>
              </div>
            </div>
            <button
              type="button"
              id="replay-onboarding-slides-btn"
              onClick={onReRunOnboarding}
              className="px-4 py-2 bg-white hover:bg-gray-50 border border-brand-border text-xs font-bold text-brand-primary rounded-xl transition-all shadow-2xs hover:shadow-xs flex-shrink-0 cursor-pointer"
            >
              Replay Tour
            </button>
          </div>
        )}

        {/* Save Settings CTA */}
        <div className="flex justify-end">
          <button
            id="save-settings-btn"
            type="submit"
            className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-hover active:scale-[0.98] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Save className="w-4.5 h-4.5 stroke-[2.5]" />
            Save Settings
          </button>
        </div>
      </form>
    </motion.div>
  );
}

