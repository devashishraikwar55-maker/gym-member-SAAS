import { motion } from 'motion/react';
import { Check, CreditCard, Sparkles, Plus, Award, Shield } from 'lucide-react';
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
        <p className="text-xs text-brand-text-secondary mt-0.5">Configure your gym pricing tiers, durations, trainer features, and access guidelines.</p>
      </div>

      {/* Grid List of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, idx) => {
          const activeCount = getActiveCountForPlan(plan.id);
          const isPopular = plan.duration === '3 Months'; // Highlight 3 Months plan as popular

          return (
            <motion.div
              key={plan.id}
              id={`plan-card-${plan.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileHover={{ 
                y: -5, 
                scale: 1.02,
                boxShadow: '0 12px 24px -8px rgba(108, 99, 255, 0.18)'
              }}
              className={`bg-white rounded-2xl border p-5 flex flex-col justify-between relative overflow-hidden transform-gpu cursor-pointer ${
                isPopular 
                  ? 'border-brand-primary shadow-md' 
                  : 'border-brand-border shadow-2xs'
              }`}
            >
              {/* Highlight badge for popular plan */}
              {isPopular && (
                <div className="absolute top-0 right-0 bg-brand-primary text-white text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-2.5 h-2.5 fill-current" />
                  Most Popular
                </div>
              )}

              {/* Plan core info */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-brand-text-primary text-lg">{plan.name}</h3>
                  <p className="text-xs text-brand-text-secondary mt-1 min-h-[40px] leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Pricing / Duration */}
                <div className="flex items-baseline gap-1 py-1.5 border-y border-brand-border/60">
                  <span className="text-3xl font-extrabold text-brand-text-primary tracking-tight">₹{plan.fee}</span>
                  <span className="text-brand-text-secondary text-xs">/ {plan.duration}</span>
                </div>

                {/* Features List */}
                <div className="space-y-2.5">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary">What's included:</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-xs text-brand-text-primary">
                        <Check className="w-3.5 h-3.5 text-brand-success flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Enrollment Stats Indicator */}
              <div className="mt-6 pt-4 border-t border-brand-border flex items-center justify-between text-xs text-brand-text-secondary">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-brand-primary" />
                  <span>{activeCount} active members enrolled</span>
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pricing Policy Box */}
      <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-5 flex flex-col sm:flex-row items-center gap-4">
        <div className="p-3 bg-indigo-50 rounded-xl text-brand-primary">
          <Shield className="w-6 h-6 stroke-[2]" />
        </div>
        <div>
          <h4 className="font-bold text-brand-text-primary text-sm">Need custom pricing formulas?</h4>
          <p className="text-xs text-brand-text-secondary mt-1 leading-relaxed">
            Standard pricing plans, durations, and tax parameters are loaded directly from system settings. To modify defaults, adjust the grace periods, or update WhatsApp follow-up macros, please head over to the <strong className="text-brand-text-primary">Settings view</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
