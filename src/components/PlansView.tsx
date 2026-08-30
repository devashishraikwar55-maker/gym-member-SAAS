import { motion } from 'motion/react';
import { Sparkles, Calendar, CreditCard } from 'lucide-react';
import { MembershipPlan, Member } from '../types';

interface PlansViewProps {
  plans: MembershipPlan[];
  members: Member[];
}

export function PlansView({ plans, members }: PlansViewProps) {
  // Calculate active member counts for each plan
  const getActiveCountForPlan = (planId: string) => {
    return members.filter(m => m.membershipPlanId === planId && m.status === 'Active').length;
  };

  return (
    <div id="plans-view-container" className="space-y-6 pb-12">
      {/* Header */}
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold text-brand-text-primary tracking-tight">Membership Plans</h1>
        <p className="text-xs text-brand-text-secondary mt-0.5">Pricing rates and duration packages for gym memberships.</p>
      </div>

      {/* Grid List of Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map((plan, idx) => {
          const activeCount = getActiveCountForPlan(plan.id);
          const isPopular = plan.duration === '3 Months'; // Highlight 3 Months plan as popular

          return (
            <motion.div
              key={plan.id}
              id={`plan-card-${plan.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              whileHover={{ 
                y: -4, 
                scale: 1.02,
                boxShadow: '0 12px 24px -8px rgba(108, 99, 255, 0.16)'
              }}
              className={`bg-white rounded-2xl border p-6 flex flex-col justify-between relative overflow-hidden transition-all ${
                isPopular 
                  ? 'border-brand-primary shadow-md ring-1 ring-brand-primary/20' 
                  : 'border-brand-border shadow-xs hover:border-brand-primary/40'
              }`}
            >
              {/* Highlight badge for popular plan */}
              {isPopular && (
                <div className="absolute top-0 right-0 bg-brand-primary text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-2.5 h-2.5 fill-current" />
                  Most Popular
                </div>
              )}

              {/* Plan Name & Months */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-brand-primary">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                    {plan.duration}
                  </span>
                </div>

                <h3 className="font-extrabold text-brand-text-primary text-xl tracking-tight">
                  {plan.name}
                </h3>
              </div>

              {/* Pricing */}
              <div className="mt-6 pt-5 border-t border-brand-border/70 flex items-baseline justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-brand-text-primary tracking-tight">
                    ₹{plan.fee.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-brand-text-secondary">
                    / {plan.duration}
                  </span>
                </div>

                {activeCount > 0 && (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    {activeCount} active
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
