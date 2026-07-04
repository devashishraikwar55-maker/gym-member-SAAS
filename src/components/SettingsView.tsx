import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Save, RefreshCw, MessageSquare, Building, IndianRupee, CheckCircle, HelpCircle } from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsViewProps {
  settings: SystemSettings;
  onSaveSettings: (updatedSettings: SystemSettings) => void;
  onResetData: () => void;
}

export function SettingsView({ settings, onSaveSettings, onResetData }: SettingsViewProps) {
  const [gymName, setGymName] = useState('');
  const [currency, setCurrency] = useState('');
  const [expiringToday, setExpiringToday] = useState('');
  const [expiring3Days, setExpiring3Days] = useState('');
  const [expiring7Days, setExpiring7Days] = useState('');

  // Sync state with settings prop
  useEffect(() => {
    setGymName(settings.gymName);
    setCurrency(settings.currency);
    setExpiringToday(settings.reminderTemplates.expiringToday);
    setExpiring3Days(settings.reminderTemplates.expiring3Days);
    setExpiring7Days(settings.reminderTemplates.expiring7Days);
  }, [settings]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!gymName || !currency) return;

    onSaveSettings({
      gymName,
      currency,
      reminderTemplates: {
        expiringToday,
        expiring3Days,
        expiring7Days
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto space-y-6 pb-12"
    >
      {/* Header */}
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold text-brand-text-primary tracking-tight">System Settings</h1>
        <p className="text-xs text-brand-text-secondary mt-0.5">Customize your gym brand profile, default currencies, and automated SMS/WhatsApp reminder notifications.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-2xs space-y-5">
          <h3 className="text-xs font-semibold text-brand-primary uppercase tracking-wider mb-2">
            Gym Brand Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Gym Name */}
            <div className="space-y-1.5">
              <label htmlFor="settings-gym-name" className="text-xs font-semibold text-brand-text-primary uppercase tracking-wider block">
                Gym/Club Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-3.5 w-4.5 h-4.5 text-gray-400" />
                <input
                  id="settings-gym-name"
                  type="text"
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-brand-border rounded-xl text-sm text-brand-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-white"
                  placeholder="e.g., Apex Fitness Club"
                  required
                />
              </div>
            </div>

            {/* Default Currency Symbol */}
            <div className="space-y-1.5">
              <label htmlFor="settings-currency" className="text-xs font-semibold text-brand-text-primary uppercase tracking-wider block">
                Default Currency Symbol
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3.5 w-4.5 h-4.5 text-gray-400" />
                <input
                  id="settings-currency"
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-brand-border rounded-xl text-sm text-brand-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-white"
                  placeholder="e.g., ₹"
                  maxLength={3}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Message Templates Card */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-2xs space-y-5">
          <div className="flex items-center gap-1.5 mb-2">
            <MessageSquare className="w-4 h-4 text-brand-primary" />
            <h3 className="text-xs font-semibold text-brand-primary uppercase tracking-wider">
              Follow-Up message templates
            </h3>
          </div>

          <p className="text-xs text-brand-text-secondary leading-relaxed">
            Customize the message text used for instant clipboard sharing. Use the placeholder codes <code className="bg-gray-100 px-1 py-0.5 rounded text-brand-primary font-mono font-bold">{'{name}'}</code> for the member's name and <code className="bg-gray-100 px-1 py-0.5 rounded text-brand-primary font-mono font-bold">{'{date}'}</code> for the expiry date.
          </p>

          <div className="space-y-4 pt-2">
            {/* Template: Today */}
            <div className="space-y-1.5">
              <label htmlFor="template-today" className="text-xs font-semibold text-brand-text-primary uppercase tracking-wider block">
                Expiring Today Template
              </label>
              <textarea
                id="template-today"
                value={expiringToday}
                onChange={(e) => setExpiringToday(e.target.value)}
                className="w-full p-3 border border-brand-border rounded-xl text-sm text-brand-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-white"
                rows={3}
                required
              />
            </div>

            {/* Template: 3 Days */}
            <div className="space-y-1.5">
              <label htmlFor="template-3days" className="text-xs font-semibold text-brand-text-primary uppercase tracking-wider block">
                Expiring in 3 Days Template
              </label>
              <textarea
                id="template-3days"
                value={expiring3Days}
                onChange={(e) => setExpiring3Days(e.target.value)}
                className="w-full p-3 border border-brand-border rounded-xl text-sm text-brand-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-white"
                rows={3}
                required
              />
            </div>

            {/* Template: 7 Days */}
            <div className="space-y-1.5">
              <label htmlFor="template-7days" className="text-xs font-semibold text-brand-text-primary uppercase tracking-wider block">
                Expiring in 7 Days Template
              </label>
              <textarea
                id="template-7days"
                value={expiring7Days}
                onChange={(e) => setExpiring7Days(e.target.value)}
                className="w-full p-3 border border-brand-border rounded-xl text-sm text-brand-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-white"
                rows={3}
                required
              />
            </div>
          </div>
        </div>

        {/* Save Settings CTA */}
        <div className="flex justify-end">
          <button
            id="save-settings-btn"
            type="submit"
            className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-hover active:scale-[0.98] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Save className="w-4.5 h-4.5 stroke-[2.5]" />
            Save Configuration Changes
          </button>
        </div>
      </form>

      {/* Dangerous/Reset Area Card */}
      <div className="bg-red-50/20 p-6 rounded-2xl border border-red-100 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-brand-danger">Factory Data Reset</h3>
          <p className="text-xs text-brand-text-secondary mt-1 leading-relaxed">
            Testing re-registrations, cancellations, or reminder alerts? Use this button to clear current localStorage alterations and reset all member files, renewal timelines, and pricing logs back to original pre-seeded demo records instantly.
          </p>
        </div>

        <div>
          <button
            id="reset-mock-data-btn"
            type="button"
            onClick={() => {
              if (window.confirm('Are you absolutely sure you want to reset all gym member records back to factory seed data? This will overwrite your current additions and modifications.')) {
                onResetData();
              }
            }}
            className="px-4 py-2 bg-red-100/55 hover:bg-brand-danger hover:text-white border border-red-200 text-brand-danger rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
            Reset Gym Records to Seed Data
          </button>
        </div>
      </div>
    </motion.div>
  );
}
